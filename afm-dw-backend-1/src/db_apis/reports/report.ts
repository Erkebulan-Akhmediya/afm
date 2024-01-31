import log from '../../config/logger';
import { Client } from 'pg';
import get_client from '../../loaders/database';
import * as XLSX from 'xlsx';
var Readable = require('stream').Readable; 

function bufferToStream(buffer: any) { 
  var stream = new Readable()
  stream.push(buffer)
  stream.push(null)

  return stream
}

export async function report_get_xls_db (bind: any, client: Client): Promise<any> {
    let query: string = ''
    try{

        query = `
        select rc.name,
            coalesce((
                select json_agg(json_build_object('items', 
					coalesce((
                    	select 
                   	    	json_agg(
                            	json_build_object(
                                	'value', case 
                                        when data_type_id = 4 
                                        then (select riv.display_value_${bind.lang} from hr.report_item_value riv where riv.value = rii1.value and riv.report_item_id = ri1.id) 
                                        else rii1.value 
                                        end, 
                                	'sequence', rii1.sequence, 
                                	'name', ri1.name
                            	) order by sequence, ri1.id
                        	) as items
                    	from hr.ri_item rii1, ref.report_item ri1
                    	where 
                        	rii1.report_item_id = ri1.id 
                        	and rii1.report_instance_id = rins.id
                            and ri1.report_chapter_id = rc.id
                    	), '[]'::json), 
                    'create_user_name', e.last_name_${bind.lang} || ' ' || e.first_name_${bind.lang} || ' ' || e.middle_name_${bind.lang},
                    'organization', o.name_${bind.lang}
             	   )
				)
                from hr.report_instance rins, hr.employee e, hr.organization o, hr.department d, hr.approve_request_rel arr, hr.approve_request ar
                where 
                    rins.report_form_id = rf.id
                    and rins.period_id = ${bind.period_id}
                    and e.id = rins.create_user_id
                    and e.department_id = d.id
                    and d.organization_id = o.id
                    and arr.object_name = 'REPORT_INSTANCE'
                    and arr.object_id = rins.id
                    and ar.id = arr.approve_request_id
                    and ar.approve_request_status_id = 2
            )) as reports
        from ref.report_chapter rc, ref.report_form rf
        where rc.report_form_id = rf.id and rf.id = ${bind.report_form_id}
        and exists(select 1 from hr.report_instance ri where ri.report_form_id = rf.id)
        order by rc.id asc
        `

        let {rows: data} = await client.query(query)


        query = `
        select 
            p.name as period_name, 
            rf.name as report_form_name 
        from 
            ref.period p, 
            ref.report_form rf 
        where 
            p.id = ${bind.period_id}
            and rf.id = ${bind.report_form_id}
        `

        let {rows: {[0]: {period_name, report_form_name}}} = await client.query(query)

        let wb: XLSX.WorkBook = XLSX.utils.book_new()

        for(let dataset of data) {
            let ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]])
            let is_writed = false
            for (let i of dataset.reports){

                let aoa = []
                let headers = ['Организация', 'ФИО']
                let old_seq
                for (let j of i.items) {
                    let seq = j.sequence>0?j.sequence-1:0
                    if (old_seq != seq) {
                        aoa.push([i.organization, i.create_user_name])
                    }
                    old_seq = seq
                    aoa[aoa.length-1].push(j.value)
                    if (j.sequence == 0 || j.sequence == 1) {
                        headers.push(j.name)
                    }
                }

                if (!is_writed) {
                    ws = XLSX.utils.aoa_to_sheet([headers])
                    is_writed = true
                }
                XLSX.utils.sheet_add_aoa(ws, aoa, {origin: -1})

            }

            if (!ws["!cols"]) ws["!cols"] = []
            ws["!cols"].push(
                { wch: 25 },
                { wch: 25 },
                { wch: 10 },
            );

            XLSX.utils.book_append_sheet(wb, ws, dataset.name.substr(0,30))
        }

        let payload: string = ""

        payload = XLSX.write(wb, {bookType: "xls", type:"buffer"})

        const stream = bufferToStream(payload)

        return {stream, period_name, report_form_name}

    } catch (err) {
        log.debug(query)
        log.error(err)
        throw err
    }
}

export async function  report_form_by_department_db (bind: any, client: Client): Promise<any> {
    let query: string = ''
    try {

        query = `
            select

                o.name_${bind.lang} organization,
				count(e.id) as ri_count,
				(
                    select count(1) 
                    from 
                        hr.report_instance re, 
                        hr.approve_request_rel arr,
                        hr.approve_request ar 
                    where re.period_id = ${bind.period_id} 
                        and re.report_form_id = r.id 
                        and ar.id = arr.approve_request_id
                        and arr.object_id = re.id and arr.object_name = 'REPORT_INSTANCE'
                        and re.create_user_id = any(array_agg(e.id)) 
                        and re.report_status_id = 2
                        and ar.approve_request_status_id = 2
                    ) as ri_filled

            from
                ref.report_form_access rfa,
                ref.report_form r,
                hr.employee e,
                hr.department d,
                hr.organization o

            where
            r.id = rfa.report_form_id
            and rfa.is_deleted = false
            and d.id = e.department_id
            and e.id = rfa.user_id
            and d.organization_id = o.id
            and r.id = ${bind.report_form_id}

            group by organization, r.id

        `


        let {rows: data} = await client.query(query)
        return data

    } catch (err) {
        log.debug(query)
        log.error(err)
        throw err
    }
}

export async function report_form_get_exist_db (bind: any, client: Client): Promise<any> {
    let query: string = ''
    try {

        query = `
            select
            rf.id as report_form_id,
            rf.name as report_name,
            p.id as period_id,
            p.name as period,
			(select count(1) from ref.report_form_access rfa where rfa.report_form_id = rf.id and rfa.is_deleted = false) as count_rfa,
			(select count(1) from hr.report_instance ri, hr.approve_request_rel arr, hr.approve_request ar where rf.id = ri.report_form_id and ri.period_id = p.id and arr.object_id = ri.id and arr.object_name = 'REPORT_INSTANCE' and ar.id = arr.approve_request_id and ar.approve_request_status_id = 2) as count_instance

            from 
            ref.report_form rf,
            ref.period p
            where exists 
            (select 1 from hr.report_instance ri, hr.approve_request_rel arr, hr.approve_request ar
            where ri.id = arr.object_id and arr.object_name = 'REPORT_INSTANCE'
            and ar.id = arr.approve_request_id and ar.approve_request_status_id = 2
            and ri.period_id = p.id and ri.report_form_id = rf.id)
            and rf.is_active = true
            order by p.date_to desc, p.date_from desc

        `

        let {rows: data} = await client.query(query)
        return data

    } catch (err) {
        log.debug(query)
        log.error(err)
        throw err
    }
}

export async function report_get_db (bind: any): Promise<any> {
    let client
    try {
        client = get_client(); await client.connect()

        let where_clause = ''


        if (!bind.all) {
            where_clause = 
            `
            where re.create_user_id = ${bind.user_id}
            `

        } else {
            where_clause = 
            `
            where ar.approve_request_status_id = 2
            `
        }

        if (bind.der_filter) {
            where_clause += where_clause == ''? ' where ': ' and '

            where_clause += ` o.id = ${bind.der_filter} `
        }

        if (bind.report_form_filter) {
            where_clause += where_clause == ''? ' where ': ' and '

            where_clause += ` r.id = ${bind.report_form_filter} `
        }


                let query = `
            select 
                re.id,
                r.name as report_name,
                p.date_to + interval '1 day' * (r.deadline_day-1) as deadline,
                re.report_status_id,
                p.date_to + interval '1 day' * r.deadline_day as deadline,
                rss.name_${bind.lang} as report_status,
                (select min(ari.send_date) from hr.approve_request_item ari where ari.approve_request_id = ar.id) as send_date,
                re.create_date,
                rs.name as status,
                ar.approve_request_status_id as status_id,
                e.first_name_${bind.lang} || ' ' || e.last_name_${bind.lang} || ' ' || e.middle_name_${bind.lang} as full_name,
                p.name as period,
                o.name_${bind.lang} as organization,
                arr.approve_request_id as approve_request_id,
                ar.approve_request_status_id,
                arr.object_name as request_object_type_name,
                ars.name_${bind.lang} as status

            from hr.report_instance re 
                join ref.report_form r on r.id = re.report_form_id
                join hr.user u on u.id = re.create_user_id
                join ref.period p on p.id = re.period_id
                join ref.ri_status rs on rs.id = re.report_status_id 
                join hr.employee e on u.id = e.id
                join hr.department d on d.id = e.department_id
                join hr.organization o on o.id = d.organization_id
                left join hr.approve_request_rel arr on arr.object_id = re.id and arr.object_name = 'REPORT_INSTANCE'
                left join hr.approve_request ar on ar.id = arr.approve_request_id
                left join ref.approve_request_status ars on ar.approve_request_status_id = ars.id
                join ref.report_status rss on rss.id = re.report_status_id
                join hr.employee cur_emp on cur_emp.id = ${bind.user_id}
                ${where_clause}
            order by id DESC
        `

        let {rows: data} = await client.query(query)
        return data
    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function report_full_get_db (bind: any): Promise<any> {
    let client
    let query
    try {
        client = get_client(); await client.connect()

        query = `
            select 
                re.id,
                rla.approver_id,
                ea.last_name_${bind.lang} || ' ' || ea.first_name_${bind.lang} || ' ' || ea.middle_name_${bind.lang} as name,
                r.name as report_name,
                re.report_status_id,
                ar.approve_request_status_id,
                p.name as period,
                coalesce(
                    (select json_agg( json_build_object(
                        'id', ch.id,
                        'chapter_id', ch.id,
                        'name', ch.name,
                        'type', cht.name,
                        'data_type_id', ch.data_type_id,
                        'detailsHeaders', coalesce(
                            (select 
                                json_agg( json_build_object(
                                    'text', d.name, 
                                    'value', 'attribute' || d.id
                                ) order by d.create_date asc)
                                from ref.report_item d  
                                where d.report_chapter_id = ch.id 
                            ), '[]'::json
                        ),
                        'details', coalesce(
                        array(select 
                            json_agg( json_build_object(
                                'id', ed.id,
                                'sequence', ed.sequence,
                                'report_item_id', d.id,
                                'value', ed.value,
                                'name', 'attribute' || d.id, 
                                'label', d.name, 
                                'data_type_id', d.data_type_id,
                                'is_required', d.is_required,
                                'type', dt.name
                            ) order by ed.sequence asc, ed.create_date asc)
                            from hr.ri_item ed join ref.report_item d on d.id = ed.report_item_id  join ref.value_type dt on dt.id = d.data_type_id 
                            where d.report_chapter_id = ch.id and ed.report_instance_id = re.id
                            group by ed.sequence
                        ))
                    ) order by ch.id ) 
                        from ref.report_chapter ch 
                        join ref.data_type cht on cht.id = ch.data_type_id
                        where ch.report_form_id = r.id
                        and ch.is_active = true
                    ), '[]'::json
                ) chapters,
                arr.approve_request_id as approve_request_id,
                arr.object_name as request_object_type_name
                
            from 
                hr.report_instance re 
                join ref.report_form r on r.id = re.report_form_id
                join ref.period p on p.id = re.period_id
                left join hr.report_last_approver rla on rla.report_form_id = r.id
                left join hr.employee ea on ea.id = rla.approver_id
                left join hr.approve_request_rel arr on arr.object_id = re.id and arr.object_name = 'REPORT_INSTANCE'
                left join hr.approve_request ar on ar.id = arr.approve_request_id
            where re.id = ${bind.id}
        `

        const {rows: reports}: any = await client.query(query)
        return reports

    } catch (err) {
        log.debug(query)
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function detail_delete_db (bind: any): Promise<any> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            delete from hr.ri_item
            where id in (
                select ed.id 
                from hr.ri_item ed join ref.report_item d on d.id = ed.report_item_id 
                where ed.sequence = ${bind.sequence} and d.report_chapter_id = ${bind.chapter_id} and ed.report_instance_id = ${bind.emp_report_id} )
            `

        await client.query(query)
        return 

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function detail_edit_db (bind: any): Promise<any> {
    let client
    let query: string = ''
    try {
        client = get_client(); await client.connect()
        query = `
            update hr.ri_item set 
                value = '${bind.value.replaceAll("'", "''")}', 
                update_user_id = ${bind.user_id} 
            where id = ${bind.id}
        `
        await client.query(query)
        return 
    } catch (err) {
        log.debug(query)
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function detail_create_db (bind: any): Promise<any> {
    let client
    let query: string = ''
    try {
        client = get_client(); await client.connect()
        query = `
            insert into hr.ri_item (report_item_id, report_instance_id, sequence, value, create_user_id, update_user_id) 
            values (${bind.detail_id}, ${bind.emp_report_id}, ${bind.sequence}, '${bind.value.replaceAll("'", "''")}', ${bind.user_id}, ${bind.user_id})
            returning id
        `
        let {rows: {[0]: {id}}} = await client.query(query)
        return id
    } catch (err) {
        log.debug(query)
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function report_create (bind: any, client: Client): Promise<number> {
    let query: string = ''
    try {

        query = `
            insert into hr.report_instance (report_form_id, report_status_id, period_id, create_user_id, update_user_id) 
            values (
                ${bind.id}, 
                1, 
                ${bind.period_id}, 
                ${bind.user_id}, 
                ${bind.user_id}
            )
            returning id
        `

        let {rows: {[0]: {id: report_id}}} = await client.query(query)

        for (let i of bind.chapters) {

            if (i.data_type_id != 2)
            {
                for (let j of i.details) {
                    if (!j.value) j.value = ""
                    if (!j.sequence) j.sequence = 0
                    query = `
                        insert into hr.ri_item (report_item_id, report_instance_id, sequence, value, create_user_id, update_user_id) 
                        values (${j.id}, ${report_id}, ${j.sequence}, '${j.value}', ${bind.user_id}, ${bind.user_id})
                        returning id
                    `
                    await client.query(query)
                }
            }

                    }

        return report_id

            } catch (err) {
        log.debug(query)
        log.error(err)
        throw err
    }
}

export async function report_update (bind: any): Promise<any> {
    let client
    try {
        client = get_client(); await client.connect()

        let query: string = "";

        let bindArr = Object.entries(bind).filter(([key, value]) => ['report_status_id'].includes(key));
        bindArr.map(([key, value], index) => {
            query += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`}, `;
        })

        if (query == "") {
            query = 'report_status_id = 2,'
        }

        query = `update hr.report_instance
            set 
                ${query}
                update_user_id = ${bind.user_id},
                update_date = NOW()
            where id = ${bind.id} 
            `


        await client.query(query)

        if (bind.chapters) {
            for (let i of bind.chapters) {

                if (i.details) {
                    for (let j of i.details) {
                        if (j.id)
                        {
                            query = "";

                            let bindArr = Object.entries(j).filter(([key, value]) => ['value'].includes(key));
                            bindArr.map(([key, value], index) => {
                                query += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`}, `;
                            })


                            query = `update hr.ri_item
                                set 
                                    ${query}
                                    update_user_id = ${bind.user_id},
                                    update_date = NOW()
                                where id = ${j.id} 
                                `

                            await client.query(query)
                        }
                    }
                }
            }
        }

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}
