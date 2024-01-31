import { Client } from 'pg';
import log from '../../config/logger';
import get_client from '../../loaders/database';

export async function detail_get_db (bind: any): Promise<any> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            select 
                d.name,
                d.id,
                d.data_type_id,
                d.is_required,
                vt.name as type
            from ref.report_item d join ref.value_type vt on vt.id = d.data_type_id
            where d.report_chapter_id = ${bind.chapter_id}
            and d.is_active
            order by d.id asc
        `

        const {rows: details}: any = await client.query(query)
        return details

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function chapter_get_db (bind: any): Promise<any> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            select 
                r.name,
                r.id,
                r.data_type_id,
                dt.name as type
            from ref.report_chapter r join ref.data_type dt on dt.id = r.data_type_id
            where r.report_form_id = ${bind.report_id}
            and r.is_active
            order by r.id asc
        `

        const {rows: chapters}: any = await client.query(query)
        return chapters

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function report_form_get_db (bind: any): Promise<any> {
    let client
    let query: string = ''
    try {
        client = get_client(); await client.connect()

        query = `
            select
                ea.last_name_${bind.lang} || ' ' || ea.first_name_${bind.lang} || ' ' || ea.middle_name_${bind.lang} as last_approver_name,
                r.name as report_name,
                r.id,
                r.report_status_id,
                r.deadline_day,
                r.period_type_id

            ${
                !bind.get_all?
                `
                ,
                p.id as period_id,
                p.date_from as period_from,
                p.date_to as period_to,
                p.name as period,
                p.date_to + interval '1 day' * (r.deadline_day-1) as deadline
                `: ''
            }
            from ref.report_form r
            left join hr.report_last_approver rla on rla.report_form_id = r.id
            left join hr.employee ea on ea.id = rla.approver_id
            ${ bind.get_all || bind.status == 0?'':`, ref.report_form_access rfa` }
            ${
                !bind.get_all?
                `
            ,
            ref.period p
                `: ''
            }
            where is_active
            ${
                !bind.get_all?
                    `
            and p.period_type_id = r.period_type_id
            and p.date_to = (
                select min(p2.date_to)
                from ref.period p2
                where 
                    p2.period_type_id = r.period_type_id
                    and p2.date_to > current_date - 30 * interval '1 day' 
                    and p2.date_from < current_date
                    and (
                        select count(1) from hr.report_instance ri
                        where 
                            ri.report_form_id = r.id 
                            and ri.period_id = p2.id
                            and ri.create_user_id = ${bind.user_id}
                        ) = 0

                                        )
                    `: ''
            }
            ${ bind.get_all || bind.status == 0?'':`and rfa.is_deleted = false and rfa.report_form_id = r.id and rfa.user_id = ${bind.user_id}` }
            ${ bind.status != 0?'and report_status_id = '+bind.status:'' }
            group by r.id${ bind.get_all?'':', p.id'}, ea.id
            order by r.id desc


        `

        const {rows: reports}: any = await client.query(query)
        return reports

    } catch (err) {
        console.debug(query)
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function report_form_full_get_db (bind: any, client: Client): Promise<any> {
    try {
        let query = `
            select 
                r.name as report_name,
                r.id,
                coalesce(
                    (select json_agg( json_build_object(
                        'id', ch.id,
                        'name', ch.name,
                        'type', cht.name,
                        'data_type_id', ch.data_type_id,
                        'details', coalesce(
                        (select json_agg(json_build_object(
                                'id', d.id,
                                'name', d.name, 
                                'data_type_id', d.data_type_id,
                                'is_required', d.is_required,
                                'type', dt.name
                            ))
                            from ref.report_item d join ref.value_type dt on dt.id = d.data_type_id 
                            where d.report_chapter_id = ch.id
                            and d.is_active
                        ), '[]'::json)
                    )) 
                        from ref.report_chapter ch join ref.data_type cht on cht.id = ch.data_type_id
                        where ch.report_form_id = r.id
                        and ch.is_active
                    ), '[]'::json
                ) chapters
                
            from ref.report_form r,
            ref.report_form_access rfa
            where is_active
            and rfa.report_form_id = r.id
            and rfa.is_deleted = false
            and rfa.user_id = ${bind.user_id}
        `

        if(bind.id){
            query += `and r.id = ${bind.id}`
        }

        const {rows: reports}: any = await client.query(query)
        return reports

    } catch (err) {
        log.error(err)
        throw err
    }
}

export async function report_form_create (bind: any): Promise<number> {
    let client
    let query: string = ''
    try {
        client = get_client(); await client.connect()

        query = `
            insert into ref.report_form (name, period_type_id, deadline_day, create_user_id, update_user_id) 
            values ('${bind.report_name}', ${bind.period_type_id}, ${bind.deadline_day}, ${bind.user_id}, ${bind.user_id})
            returning id
        `
        let {rows: {[0]: {id: report_id}}} = await client.query(query)

        return report_id

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

export async function chapter_create (bind: any): Promise<number> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            insert into ref.report_chapter (name, report_form_id, data_type_id, create_user_id, update_user_id) 
            values ('${bind.name}', ${bind.report_form_id}, ${bind.data_type_id}, ${bind.user_id}, ${bind.user_id})
            returning id
        `

        let {rows: {[0]: {id: report_id}}} = await client.query(query)

        return report_id

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function details_create (bind: any): Promise<number> {
    let client
    try {
        client = get_client(); await client.connect()

        if (!bind.is_required) {
            bind.is_required = false
        }

        let query = `
            insert into ref.report_item (name, report_chapter_id, data_type_id, is_required, value_length, create_user_id, update_user_id) 
            values ('${bind.name}', ${bind.report_chapter_id}, ${bind.data_type_id}, ${bind.is_required}, 255, ${bind.user_id}, ${bind.user_id})
            returning id
        `
        let {rows: {[0]: {id: report_id}}} = await client.query(query)

        return report_id

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function report_details_list_delete_db(bind: any, client: Client) {
    let query: string = ''
    try {

        query = `
            update hr.report_item_value set is_active = false where id = $1
        `

        await client.query({text: query, values:[
            bind.id, 
        ]})

        return

    } catch (err) {
        log.error(err)
        throw err
    }
}

export async function report_details_list_add_db(bind: any, client: Client) {
    let query: string = ''
    try {

        query = `
            insert into hr.report_item_value
            (report_item_id, value, display_value_rus, display_value_kaz, is_active)
            values 
            ($1, (select (count(1) + 1)::text from hr.report_item_value where report_item_id = $1), $2, $3, $4)
            returning id
        `

        let {rows: data} = await client.query({text: query, values:[
            bind.report_item_id, 
            bind.display_value_rus,
            bind.display_value_kaz,
            true
        ]})

        return data

    } catch (err) {
        log.error(err)
        throw err
    }
}

export async function report_details_get_list_db(bind: any, client: Client) {
    let query: string = ''
    try {

        query = `
            select
                id,
                report_item_id,
                value,
                display_value_${bind.lang} as text,
                display_value_rus,
                display_value_kaz
            from hr.report_item_value
            where report_item_id = $1
                and is_active = true
        `

        let {rows: data} = await client.query({text: query, values:[
            bind.report_item_id
        ]})

        return data

    } catch (err) {
        log.error(err)
        throw err
    }
}


export async function report_full_form_create (bind: any): Promise<number> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            insert into ref.report_form (name, period_type_id, deadline_day, create_user_id, update_user_id) 
            values ('${bind.report_name}', 3, 1, ${bind.user_id}, ${bind.user_id})
            returning id
        `
        let {rows: {[0]: {id: report_id}}} = await client.query(query)

        for (let i of bind.chapters) {
            query = `
                insert into ref.report_chapter (name, report_form_id, data_type_id, create_user_id, update_user_id) 
                values ('${i.name}', ${i.type_id}, ${report_id}, ${bind.user_id}, ${bind.user_id})
                returning id
            `
            let {rows: {[0]: {id: chapter_id}}} = await client.query(query)
            for (let j of i.details) {
                if (!j.is_required) {
                    j.is_required = false
                }
                query = `
                    insert into ref.report_item (name, report_chapter_id, data_type_id, is_required, value_length, create_user_id, update_user_id) 
                    values ('${j.name}', ${j.type_id}, ${chapter_id}, ${j.is_required}, 255, ${bind.user_id}, ${bind.user_id})
                    returning id
                `
                await client.query(query)
            }

                    }

        return report_id

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function period_get_db (bind: any): Promise<any> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            select id as value, name as text from ref.period
        `

        let {rows: data} = await client.query(query)

        return data
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function period_post_db (bind: any): Promise<number> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            insert into ref.period (period_type_id, name, date_from, date_to)
            values (${bind.period_type_id}, 'first', current_date, current_date + integer '7')
            returning id
        `
        let {rows: {[0]: id}} = await client.query(query)

        return id
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function report_put_db (bind: any): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect()
        let sqlSet: string = "";

        let bindArr = Object.entries(bind).filter(([key, value]) => ['name', 'report_status_id', 'period_type_id', 'deadline_day'].includes(key));
        bindArr.map(([key, value], index) => {
            sqlSet += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`},`;
        })

        sqlSet = `update ref.report_form
            set 
                ${sqlSet}
                update_date = current_date
            where id = ${bind.id} 
            `

        await client.query(sqlSet);

        return
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function chapter_put_db (bind: any): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect()
        let sqlSet: string = "";

        let bindArr = Object.entries(bind).filter(([key, value]) => ['name', 'data_type_id'].includes(key));
        bindArr.map(([key, value], index) => {
            sqlSet += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`},`;
        })

        sqlSet = sqlSet.slice(0, -1)

        sqlSet = `update ref.report_chapter
            set 
                ${sqlSet}
            where id = ${bind.id} 
            `

        await client.query(sqlSet);

        return
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function rf_item_delete_db (bind: any, client: Client): Promise<void> {
    let query: string = ''
    try{

        query = `
            update ref.report_item
            set is_active = false
            where id = $1
        `
        let values = [bind.id]

        await client.query({text: query, values: values})

    } 
    catch (err) {
        log.error(err)
        throw err
    }

}

export async function rf_chapter_delete_db (bind: any, client: Client): Promise<void> {
    let query: string = ''
    try{

        query = `
            update ref.report_chapter
            set is_active = false
            where id = $1
        `
        let values = [bind.id]

        await client.query({text: query, values: values})

    } 
    catch (err) {
        log.error(err)
        throw err
    }

}

export async function rf_detail_delete_db (bind: any, client: Client): Promise<void> {
    let query: string = ''
    try{

        query = `
            update ref.report_form
            set is_active = false
            where id = $1
        `
        let values = [bind.id]

        await client.query({text: query, values: values})

    } 
    catch (err) {
        log.error(err)
        throw err
    }

}

export async function details_put_db (bind: any): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect()
        let sqlSet: string = "";

        let bindArr = Object.entries(bind).filter(([key, value]) => ['name', 'data_type_id', 'is_required'].includes(key));
        bindArr.map(([key, value], index) => {
            sqlSet += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`},`;
        })

        sqlSet = sqlSet.slice(0, -1)

        sqlSet = `update ref.report_item
            set 
                ${sqlSet}
            where id = ${bind.id} 
            `

        await client.query(sqlSet);

        return
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if(client) {
            await client.end()
        }
    }
}