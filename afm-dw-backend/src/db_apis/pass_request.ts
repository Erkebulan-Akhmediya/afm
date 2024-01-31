import { Client } from 'pg';
import log from '../config/logger';
import get_client from '../loaders/database';

interface pass_request {
    id: number,
    visitors: any,
    date_from: Date,
    date_to: Date,
    description: string,
    first_name: string,
    middle_name: string,
    last_name: string,
    pr_status_id: number,	
    status: string,
    entry_date: Date,
    exit_date: Date,
    create_date: Date,
    create_user_id: number,
    update_date: Date,
    update_user_id: number,
    employee_id: number,
    create_user: string,
    purpose: string,
}

export async function pass_request_visitor_history_get (bind: any): Promise<any> {
    let client
    try {
        client = get_client(); await client.connect()

        if (!bind.prv_list_id)
        {
            return []
        }

        let list = ''

        for (let i of bind.prv_list_id) {
            list += i + ','
        }
        list = list.substring(0, list.length - 1)

        let query = `
        select 
            vh.id,
            vh.action_date, 
            vh.prv_action_type_id,
            pr.id pr_id,
            pr.purpose,
            o.name_${bind.lang} as organization,
            ob.name_${bind.lang} as organization_building,
            prt.name_${bind.lang} as type
        from hr.prv_visit_history vh 
        join hr.pass_request_visitor prv on prv.id = vh.pass_request_visitor_id
        join hr.pass_request pr on pr.id = prv.pass_request_id
        join ref.pass_request_type prt on prt.id = pr.pass_request_type_id
        join hr.organization o on o.id = pr.organization_id
        join hr.organization_building ob on ob.id = pr.organization_building_id
        where vh.pass_request_visitor_id in (${list})
        order by vh.action_date desc
        `

        const {rows: pass_request_visitors}: any = await client.query(query)
        return pass_request_visitors

    } catch (err) {
        log.error(`Error in pass_request_visitor_history_get -> ${JSON.stringify(err)}`)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function pass_request_visitor_unique_get (bind: any): Promise<any> {
    let client
    let query
    try {
        client = get_client(); await client.connect()

        let where = ''
        let where_search = ''
        let pagination_clause = ''

        if (bind.page && bind.itemsperpage && bind.itemsperpage != -1) {
            pagination_clause = `limit ${bind.itemsperpage} offset ${(bind.page-1)*bind.itemsperpage}`
        }

        let sql_pagination_clause = ""
        if (bind.page && bind.itemsperpage && bind.itemsperpage != -1) {
            sql_pagination_clause = `
                limit ${bind.itemsperpage}
                offset ${(bind.page-1) * bind.itemsperpage}
            `
        }

        if (bind.identification_number) 
        {
            if (where_search != '') where_search += 'and'
            where_search += ` (t1.identification_number like '%${bind.identification_number}%' 
                        or UPPER(coalesce(t1.pass_first_name, t1.first_name)) || ' ' || UPPER(coalesce(t1.pass_last_name, t1.last_name)) || ' ' || UPPER(coalesce(t1.pass_middle_name, t1.middle_name)) like TRIM(UPPER('%${bind.identification_number}%'))
                        or UPPER(coalesce(t1.pass_last_name, t1.last_name)) || ' ' || UPPER(coalesce(t1.pass_first_name, t1.first_name)) || ' ' || UPPER(coalesce(t1.pass_middle_name, t1.middle_name)) like TRIM(UPPER('%${bind.identification_number}%'))
                        ) `
        }

        if (bind.current_date)
        {
            if (where_search != '') where_search += 'and'
            where_search += ` 
                        date_trunc('day', t2.date_from) <= (current_date at time zone 'UTC')::date
                        and date_trunc('day', t2.date_to) >= (current_date at time zone 'UTC')::date
                        `
        }

        if (bind.channel === 1) 
        {
            if (where_search != '') where_search += 'and'
            where_search += ` t1.create_user_id = ${bind.user_id}`
        }
        else if (bind.channel === 2) {
            if (where_search != '') where_search += 'and'
            where_search += ` t1.organization_id = ${bind.organization_id} `
        }

        query = `
            select 
            prv_max_id as id, pr_organization_id, last_name, first_name, organization, organization_id, middle_name, concat(last_name, ' ', first_name, ' ', middle_name) as visitor, is_resident_rk, 
            (select create_user_id from hr.PASS_REQUEST_VISITOR where id = t1.prv_max_id
                ) as create_user_id,
            document_type, identification_number, document_type_id, 
            case 
            when (select count(*) from hr.PRV_VISIT_HISTORY k1 where k1.PASS_REQUEST_VISITOR_id = any(t1.prv_list_id)) > 0
            then (select k2.name_${bind.lang} from hr.PRV_VISIT_HISTORY k1, ref.PRV_ACTION_TYPE k2 where k1.PASS_REQUEST_VISITOR_id = any(t1.prv_list_id)
                and k1.PRV_ACTION_TYPE_id = k2.id order by k1.id desc limit 1)::text
            else '${bind.lang === 'RUS'?'Не посещал':'Барған жоқ'/** ВАЖНО: не менять текст, от него зависит фронт */}'
            end as last_visit_status,
            prv_list_id
            from 
            (select last_name, first_name, middle_name, is_resident_rk, 
                document_type, identification_number, document_type_id, organization, organization_id,
                pr_organization_id,
                array_agg (id) as prv_list_id,
                max(id) as prv_max_id
                from 
                (select 
                    t1.id,
                    INITCAP(t1.pass_last_name) as last_name,
                    INITCAP(t1.pass_first_name) as first_name,
                    INITCAP(t1.pass_middle_name) as middle_name,
                    t1.pass_is_resident_rk as is_resident_rk,
                    o.name_${bind.lang} as organization,
                    o.id as organization_id,
                    t2.organization_id as pr_organization_id,
                    z1.name_${bind.lang} as document_type,
                    t1.document_type_id as document_type_id,
                    t1.create_user_id,
                    t1.pass_identification_number as identification_number
                    from hr.PASS_REQUEST_VISITOR t1, hr.PASS_REQUEST t2
                    join hr.employee ce on t2.create_user_id = ce.id
                    join hr.department d on d.id = ce.department_id
                    join hr.organization o on o.id = d.organization_id,
                    ref.document_type z1
                    where t1.PASS_REQUEST_id = t2.id
                    ${where_search?'and ' + where_search:''}
                    and t1.pass_document_type_id = z1.id
                    and exists (
                        select 1 from hr.PRV_VISIT_HISTORY t3
                        where t3.PASS_REQUEST_VISITOR_id = t1.id
                        )
                    union all
                    select 
                    t1.id,
                    INITCAP(t1.last_name) as last_name,
                    INITCAP(t1.first_name) as first_name,
                    INITCAP(t1.middle_name) as middle_name,
                    t1.is_resident_rk,
                    o.name_${bind.lang} as organization,
                    o.id as organization_id,
                    t2.organization_id as pr_organization_id,
                    z1.name_${bind.lang} as document_type,
                    t1.document_type_id,
                    t1.create_user_id,
                    t1.identification_number
                    from hr.PASS_REQUEST_VISITOR t1, hr.PASS_REQUEST t2
                    join hr.employee ce on t2.create_user_id = ce.id
                    join hr.department d on d.id = ce.department_id
                    join hr.organization o on o.id = d.organization_id,
                    ref.document_type z1
                    where t1.PASS_REQUEST_id = t2.id
                    ${where_search?'and ' + where_search:''}
                    and t1.document_type_id = z1.id
                    and not exists (select 1 from hr.PRV_VISIT_HISTORY t3
                    where t3.PASS_REQUEST_VISITOR_id = t1.id)) prv_v
                group by last_name, first_name, middle_name, is_resident_rk, 
                document_type, identification_number, document_type_id, pr_organization_id, organization_id, organization) t1
                ${pagination_clause}
        `
        const {rows: pass_request_visitors}: any = await client.query(query)

        query = `

            select 
                count(1) as count
            from 
            (select last_name 
                from 
                (select 
                    t1.id,
                    INITCAP(t1.pass_last_name) as last_name,
                    INITCAP(t1.pass_first_name) as first_name,
                    INITCAP(t1.pass_middle_name) as middle_name,
                    t1.pass_is_resident_rk as is_resident_rk,
                    o.name_${bind.lang} as organization,
                    o.id as organization_id,
                    t2.organization_id as pr_organization_id,
                    ob.name_${bind.lang} as organization_building,
                    z1.name_${bind.lang} as document_type,
                    t1.document_type_id as document_type_id,
                    t1.create_user_id,
                    t1.pass_identification_number as identification_number
                    from hr.PASS_REQUEST_VISITOR t1, hr.PASS_REQUEST t2
                    join hr.employee ce on t2.create_user_id = ce.id
                    join hr.organization_building ob on ob.id = t2.organization_building_id
                    join hr.department d on d.id = ce.department_id
                    join hr.organization o on o.id = d.organization_id,
                    ref.document_type z1
                    where t1.PASS_REQUEST_id = t2.id
                    and t1.pass_document_type_id = z1.id
                    and exists (
                        select 1 from hr.PRV_VISIT_HISTORY t3
                        where t3.PASS_REQUEST_VISITOR_id = t1.id
                        )
                    union all
                    select 
                    t1.id,
                    INITCAP(t1.last_name) as last_name,
                    INITCAP(t1.first_name) as first_name,
                    INITCAP(t1.middle_name) as middle_name,
                    t1.is_resident_rk,
                    o.name_${bind.lang} as organization,
                    o.id as organization_id,
                    t2.organization_id as pr_organization_id,
                    ob.name_${bind.lang} as organization_building,
                    z1.name_${bind.lang} as document_type,
                    t1.document_type_id,
                    t1.create_user_id,
                    t1.identification_number
                    from hr.PASS_REQUEST_VISITOR t1, hr.PASS_REQUEST t2
                    join hr.employee ce on t2.create_user_id = ce.id
                    join hr.organization_building ob on ob.id = t2.organization_building_id
                    join hr.department d on d.id = ce.department_id
                    join hr.organization o on o.id = d.organization_id,
                    ref.document_type z1
                    where t1.PASS_REQUEST_id = t2.id
                    and t1.document_type_id = z1.id
                    and not exists (select 1 from hr.PRV_VISIT_HISTORY t3
                    where t3.PASS_REQUEST_VISITOR_id = t1.id
                    ${where_search?' and ' + where_search:''}
                    )) prv_v
                group by last_name, first_name, middle_name, is_resident_rk, 
                document_type, identification_number, document_type_id, pr_organization_id, organization_id, organization) t1

        `

        const {rows: {[0]:{count: total}}}: any = await client.query(query)

        return {pass_request_visitors, total_length: total}

    } catch (err) {
        log.error(`Error in pass_request_visitor_unique_get -> ${JSON.stringify(err)}`)
        log.debug(query)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function pass_request_visitor_by_history_get (bind: any): Promise<any> {
    let client
    try {
        client = get_client(); await client.connect()

        let where = ''
        let where_search = ''

        let sql_pagination_clause = ""
        if (bind.page && bind.itemsperpage && bind.itemsperpage != -1) {
            sql_pagination_clause = `
                limit ${bind.itemsperpage}
                offset ${(bind.page-1) * bind.itemsperpage}
            `
        }

        if (bind.identification_number) 
        {
            if (where_search != '') where_search += 'and'
            where_search += ` (prv.identification_number like '%${bind.identification_number}%' 
                        or pr.id::text like '%${bind.identification_number}%'
                        or UPPER(coalesce(prv.pass_first_name, prv.first_name)) || ' ' || UPPER(coalesce(prv.pass_last_name, prv.last_name)) || ' ' || UPPER(coalesce(prv.pass_middle_name, prv.middle_name)) like TRIM(UPPER('%${bind.identification_number}%'))
                        or UPPER(coalesce(prv.pass_last_name, prv.last_name)) || ' ' || UPPER(coalesce(prv.pass_first_name, prv.first_name)) || ' ' || UPPER(coalesce(prv.pass_middle_name, prv.middle_name)) like TRIM(UPPER('%${bind.identification_number}%'))
                        ) `
        }

        if (bind.channel === 1) 
        {
            if (where_search != '') where_search += 'and'
            where_search += ` pr.create_user_id = ${bind.user_id}`
        }

        if (where_search != '') where_search += 'and'
        where_search += ` pr.organization_id = ${bind.organization_id} `

        let query = `
        select 
        (
            select uu.last_name_${bind.lang} || ' ' || uu.first_name_${bind.lang} || ' ' || uu.middle_name_${bind.lang} 
            from hr.employee uu
            where uu.id = z1.uu_user_id
        ) as update_user_full_name,
        z1.id,
        z1.pr_id,
        z1.pass_request_type,
        z1.visitor_id,
        z1.first_name,
        z1.last_name,
        z1.middle_name,
        z1.description,
        z1.purpose,
        concat(z1.last_name, ' ', z1.first_name, ' ', z1.middle_name) as visitor,
        z1.entry_date,
        z1.document_type,
        (select max(h2.action_date) from hr.PRV_VISIT_HISTORY h2 
            where h2.PASS_REQUEST_VISITOR_id = z1.visitor_id
            and h2.PRV_ACTION_TYPE_ID = 2
            and z1.entry_date < h2.action_date
            and h2.action_date < z1.exit_date) as pass_exit_date,
        z1.exit_date,
        z1.create_user,
        z1.full_name,
        z1.organization,
        z1.is_resident_rk,
        z1.organization_building,
        z1.identification_number
        from 
        (select
        t1.create_user_id as uu_user_id,
        t1.id,
        prv.id as visitor_id,
        coalesce(prv.pass_is_resident_rk, prv.is_resident_rk) as is_resident_rk,
        pr.purpose as purpose,
        pr.description as description,
        pr.id as pr_id,
        o.name_${bind.lang} as organization,
        ob.name_${bind.lang} as organization_building,
        concat(ce.last_name_${bind.lang}, ' ', ce.first_name_${bind.lang}, ' ', ce.middle_name_${bind.lang}) as create_user,
        concat(e.last_name_${bind.lang}, ' ', e.first_name_${bind.lang}, ' ', e.middle_name_${bind.lang}) as full_name,
        prt.name_${bind.lang} as pass_request_type,
        dt.name_${bind.lang} as document_type,
        coalesce(prv.pass_identification_number, prv.identification_number) as identification_number,
        coalesce(INITCAP(prv.pass_middle_name), INITCAP(prv.middle_name)) as middle_name,
        coalesce(INITCAP(prv.pass_first_name), INITCAP(prv.first_name)) as first_name,
        coalesce(INITCAP(prv.pass_last_name), INITCAP(prv.last_name)) as last_name,
        (select max(h1.action_date) from hr.PRV_VISIT_HISTORY h1 
            where h1.PASS_REQUEST_VISITOR_id = prv.id
            and h1.PRV_ACTION_TYPE_ID = 1
            and h1.action_date < t1.action_date) as entry_date,
        t1.action_date as exit_date
        from hr.PRV_VISIT_HISTORY t1,
        hr.PASS_REQUEST pr
        join ref.pass_request_type prt on prt.id = pr.pass_request_type_id
        join hr.employee e on pr.employee_id = e.id
        join hr.employee ce on pr.create_user_id = ce.id
        join hr.organization_building ob on ob.id = pr.organization_building_id
        join hr.department d on d.id = ce.department_id
        join hr.organization o on o.id = d.organization_id,
        hr.PASS_REQUEST_VISITOR prv
        join ref.document_type dt on prv.document_type_id = dt.id
        where 
            ${where_search? where_search + ' and ': ''}
            t1.PASS_REQUEST_VISITOR_id = prv.id
            and prv.PASS_REQUEST_id = pr.id
            and t1.PRV_ACTION_TYPE_ID = 3
            and date_trunc('day',t1.action_date) >= ${bind.date_from?"'" + bind.date_from + "'" :'current_date'}
            and date_trunc('day',t1.action_date) <= ${bind.date_to?"'" + bind.date_to + "'":'current_date'}
            and pr.pr_status_id = 2) z1
        ${bind.date_from?'order by z1.entry_date asc':''}
        ${sql_pagination_clause}
        `
        const {rows: pass_request_visitors}: any = await client.query(query)

        query = `
            select count(1) as count
            from 
                hr.PRV_VISIT_HISTORY t1,
                hr.PASS_REQUEST pr
                join ref.pass_request_type prt on prt.id = pr.pass_request_type_id
                join hr.employee e on pr.employee_id = e.id
                join hr.employee ce on pr.create_user_id = ce.id
                join hr.organization_building ob on ob.id = pr.organization_building_id
                join hr.department d on d.id = ce.department_id
                join hr.organization o on o.id = d.organization_id,
                hr.PASS_REQUEST_VISITOR prv
                join ref.document_type dt on prv.document_type_id = dt.id
            where
                ${where_search? where_search + ' and ': ''}
                t1.PASS_REQUEST_VISITOR_id = prv.id
                and prv.PASS_REQUEST_id = pr.id
                and t1.PRV_ACTION_TYPE_ID = 3
                and date_trunc('day',t1.action_date) >= ${bind.date_from?"'" + bind.date_from + "'" :'current_date'}
                and date_trunc('day',t1.action_date) <= ${bind.date_to?"'" + bind.date_to + "'":'current_date'}
                and pr.pr_status_id = 2
        `
        const {rows: {[0]: {count: total}}}: any = await client.query(query)

        return {total_length: total, pass_request_visitors}

    } catch (err) {
        log.error(`Error in pass_request_visitor_by_history_get -> ${JSON.stringify(err)}`)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function pass_request_visitor_get (bind: any): Promise<any> {
    let client
    let query
    try {
        client = get_client(); await client.connect()

        let where = ''
        let where_search = ''

        let sql_pagination_clause = ""
        if (bind.page && bind.itemsperpage && bind.itemsperpage != -1) {
            sql_pagination_clause = `
                limit ${bind.itemsperpage}
                offset ${(bind.page-1) * bind.itemsperpage}
            `
        }

        if (bind.id) {
            where = `pr.id = ${bind.id}`
        } 
        else {
            where = `coalesce((select prv_action_type_id from hr.prv_visit_history vh where vh.pass_request_visitor_id = prv.id order by create_date desc limit 1), 0) = ${bind.pr_status_id}`


            if (bind.pr_status_id == 1) {
                where = `(${where} or coalesce((select prv_action_type_id from hr.prv_visit_history vh where vh.pass_request_visitor_id = prv.id order by create_date desc limit 1), 0) = 2)`
            }

            if (bind.identification_number) 
            {
                if (where_search != '') where_search += 'and'
                where_search += ` (prv.identification_number like '%${bind.identification_number}%' 
                            or pr.id::text like '%${bind.identification_number}%'
                            or UPPER(coalesce(prv.pass_first_name, prv.first_name)) || ' ' || UPPER(coalesce(prv.pass_last_name, prv.last_name)) || ' ' || UPPER(coalesce(prv.pass_middle_name, prv.middle_name)) like TRIM(UPPER('%${bind.identification_number}%'))
                            or UPPER(coalesce(prv.pass_last_name, prv.last_name)) || ' ' || UPPER(coalesce(prv.pass_first_name, prv.first_name)) || ' ' || UPPER(coalesce(prv.pass_middle_name, prv.middle_name)) like TRIM(UPPER('%${bind.identification_number}%'))
                            ) `
            }

            if (bind.current_date)
            {
                if (where_search != '') where_search += 'and'
                where_search += ` 
                            date_trunc('day', pr.date_from) <= (current_date at time zone 'UTC')::date
                            and date_trunc('day', pr.date_to) >= (current_date at time zone 'UTC')::date
                            `
            }

            if (where_search != '') where_search += 'and'
            where_search += ` pr.organization_id = ${bind.organization_id} `
        }

        query = `
            select 
                concat(INITCAP(coalesce(prv.pass_last_name, prv.last_name)), ' ', INITCAP(coalesce(prv.pass_first_name, prv.first_name)), ' ', INITCAP(coalesce(prv.pass_middle_name, prv.middle_name))) as visitor,
                pr.description as description,
                pr.purpose as purpose,
                pr.date_from as date_from,
                pr.date_to as date_to,
                pr.create_user_id as create_user_id,
                o.name_${bind.lang} as organization,
                ob.name_${bind.lang} as organization_building,
                concat(e.last_name_${bind.lang}, ' ', e.first_name_${bind.lang}, ' ', e.middle_name_${bind.lang}) as full_name,
                pr.employee_id as employee_id,
                pr.pass_request_type_id,
                prv.identification_number as identification_number,
                INITCAP(coalesce(prv.pass_last_name, prv.last_name)) as last_name,
                INITCAP(coalesce(prv.pass_middle_name, prv.middle_name)) as middle_name,
                INITCAP(coalesce(prv.pass_first_name, prv.first_name)) as first_name,
                coalesce(prv.pass_identification_number, prv.identification_number) as identification_number,
                coalesce(prv.pass_is_resident_rk, prv.is_resident_rk) as is_resident_rk,
                coalesce(prv.pass_document_type_id, prv.document_type_id) as document_type_id,
                prv.id as id,
                pr.id as request_id,
                coalesce((select json_agg(json_build_object(
                        'action_date', vh.action_date,
                        'prv_status_id', vh.prv_action_type_id
                    ) order by create_date desc)
                    from hr.prv_visit_history vh 
                    where vh.pass_request_visitor_id = prv.id
                ), '[]'::json) as visit_history,
                coalesce((select prv_action_type_id from hr.prv_visit_history vh where vh.pass_request_visitor_id = prv.id order by create_date desc limit 1), 0) as prv_status_id,
                dt.name_${bind.lang} as document_type,
                coalesce(prs.name_${bind.lang}, '${bind.lang === 'RUS'? 'Запланированно': 'Жоспарланған'}') as status,
                prt.name_${bind.lang} as pass_request_type,
                concat(ce.last_name_${bind.lang}, ' ', ce.first_name_${bind.lang}, ' ', ce.middle_name_${bind.lang}) as create_user
            from 
                hr.pass_request_visitor prv
                join hr.pass_request pr on pr.id = prv.pass_request_id
                join hr.employee e on pr.employee_id = e.id
                join hr.employee ce on pr.create_user_id = ce.id
                join ref.document_type dt on coalesce(prv.pass_document_type_id, prv.document_type_id) = dt.id
                left join ref.prv_action_type prs on prs.id = coalesce((select prv_action_type_id from hr.prv_visit_history vh where vh.pass_request_visitor_id = prv.id order by create_date desc limit 1), 0)
                join ref.pass_request_type prt on prt.id = pr.pass_request_type_id
                join hr.department d on ce.department_id = d.id
                join hr.organization o on d.organization_id = o.id
                join hr.organization_building ob on ob.id = pr.organization_building_id
            where 
                (
                    (
                        (
                            ${where_search? where_search + ' and ': ''}
                            ${bind.pr_status_id != null?where + ' and ': ''}

                            pr.pr_status_id = 2
                        ) 
                        ${ bind.pr_status_id === 0?
                        `or 
                        (  
                            ${where_search? where_search + ' and ': ''}
                            coalesce((select prv_action_type_id from hr.prv_visit_history vh where vh.pass_request_visitor_id = prv.id order by create_date desc limit 1), 0) = 3 and
                            pr.pass_request_type_id = 2 and
                            pr.pr_status_id = 2
                        ) 
                        `:``}
                    )
                    and 
                    (
                        not exists (select 1 from hr.approve_request_rel ar_rel
                        where ar_rel.object_name = 'PASS_REQUEST' and ar_rel.object_id = pr.id)
                        or 
                        (select approve_request_status_id 
                            from hr.approve_request ar
                            join hr.approve_request_rel ar_rel on ar_rel.approve_request_id = ar.id
                        where ar_rel.object_name = 'PASS_REQUEST' and ar_rel.object_id = pr.id
                        limit 1
                        ) = 2
                    )
                )
            order by date_to desc
            ${sql_pagination_clause}
        `
        const {rows: pass_request_visitors}: any = await client.query(query)

        query = `
        select 
            count(1) as count
            from 
                hr.pass_request_visitor prv
                join hr.pass_request pr on pr.id = prv.pass_request_id
                join hr.employee e on pr.employee_id = e.id
                join hr.employee ce on pr.create_user_id = ce.id
                join ref.document_type dt on coalesce(prv.pass_document_type_id, prv.document_type_id) = dt.id
                left join ref.prv_action_type prs on prs.id = coalesce((select prv_action_type_id from hr.prv_visit_history vh where vh.pass_request_visitor_id = prv.id order by create_date desc limit 1), 0)
                join ref.pass_request_type prt on prt.id = pr.pass_request_type_id
                join hr.department d on ce.department_id = d.id
                join hr.organization o on d.organization_id = o.id
                join hr.organization_building ob on ob.id = pr.organization_building_id
            where 
                (
                    (
                        (
                            ${where_search? where_search + ' and ': ''}
                            ${bind.pr_status_id != null?where + ' and ': ''}

                            pr.pr_status_id = 2
                        ) 
                        ${ bind.pr_status_id === 0?
                        `or 
                        (  
                            ${where_search? where_search + ' and ': ''}
                            coalesce((select prv_action_type_id from hr.prv_visit_history vh where vh.pass_request_visitor_id = prv.id order by create_date desc limit 1), 0) = 3 and
                            pr.pass_request_type_id = 2 and
                            pr.pr_status_id = 2
                        ) 
                        `:``}
                    )
                    and 
                    (
                        not exists (select 1 from hr.approve_request_rel ar_rel
                        where ar_rel.object_name = 'PASS_REQUEST' and ar_rel.object_id = pr.id)
                        or 
                        (select approve_request_status_id 
                            from hr.approve_request ar
                            join hr.approve_request_rel ar_rel on ar_rel.approve_request_id = ar.id
                        where ar_rel.object_name = 'PASS_REQUEST' and ar_rel.object_id = pr.id
                        limit 1
                        ) = 2
                    )
                )
        `

        const {rows: {[0]: {count: total}}}: any = await client.query(query)

        return {pass_request_visitors, total_length: total}

    } catch (err) {
        log.error(`Error in pass_request_visitor_get -> ${JSON.stringify(err)}`)
        log.debug(query)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function document_type_get (bind: any): Promise<any[]> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            select 
                id as value,
                name_${bind.lang} as text
            from ref.document_type
        `
        const {rows: document_types}: any = await client.query(query)
        return document_types

    } catch (err) {
        log.error(`Error in document_type_get -> ${JSON.stringify(err)}`)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function prv_next_status_post_db (bind:any): Promise<number> {
    let client
    try {
        client = get_client(); await client.connect()
        let query: string = "";

        query = `insert into hr.prv_visit_history (
                prv_action_type_id,
                action_date,
                pass_request_visitor_id,
                create_date,
                create_user_id,
                update_date,
                update_user_id
                )
            values (
                ${bind.prv_status_id},
                current_timestamp,
                ${bind.pass_request_visitor},
                current_timestamp,
                '${bind.user_id}',
                current_timestamp,
                '${bind.user_id}'
            )
            returning id
            `

        let {rows: {[0]: {id}}} = await client.query(query)

        return id
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }

}

export async function pass_request_get (bind: any): Promise<any> {
    let client
    let query: string = ''
    try {
        client = get_client(); await client.connect()

        let where: string = ""

        let sql_pagination_clause = ""
        if (bind.page && bind.itemsperpage && bind.itemsperpage != -1) {
            sql_pagination_clause = `
                limit ${bind.itemsperpage}
                offset ${(bind.page-1) * bind.itemsperpage}
            `
        }

        if (bind.id) {
            where = `pr.id = ${bind.id}`
        } else {
            where = `pr.pr_status_id ${bind.pr_status_id?'=' + bind.pr_status_id:'> 0'}`
            if (bind.identification_number) {
                where += ` and ( 
                            pr.id::text like '%${bind.identification_number}%'
                            ) `
            }
            if (bind.channel === 1) {
                where += ` and pr.create_user_id = ${bind.user_id}`
            }
            else if (bind.channel === 2) {
                where += ` and pr.organization_id = ${bind.organization_id} `
            }
        }

        query = `

        select 
            pr.id as id,
            pr.organization_building_id,
            pr.purpose as purpose,
            coalesce(
                (select json_agg( json_build_object(
                    'last_name', INITCAP(coalesce(prv.pass_last_name, prv.last_name)),
                    'first_name', INITCAP(coalesce(prv.pass_first_name, prv.first_name)),
                    'middle_name', INITCAP(coalesce(prv.pass_middle_name, prv.middle_name)),
                    'identification_number', coalesce(prv.pass_identification_number, prv.identification_number),
                    'is_resident_rk', coalesce(prv.pass_is_resident_rk, prv.is_resident_rk),
                    'document_type_id', coalesce(prv.pass_document_type_id, prv.document_type_id),
                    'document_type', dt.name_${bind.lang},
                    'id', prv.id
                ))
                from hr.pass_request_visitor prv
                join ref.document_type dt on dt.id = prv.document_type_id
                where pr.id = prv.pass_request_id
            ), '[]'::json) as visitors,
            coalesce(
                (select json_agg( json_build_object(
                    'id', ari.id,
                    'first_name', e.first_name_${bind.lang},
                    'last_name', e.last_name_${bind.lang},
                    'middle_name', e.middle_name_${bind.lang},
                    'orders', ari.orders,
                    'request_status_id', ari.ar_item_status_id,
                    'request_status_name', ais.name_${bind.lang},
                    'comment', ari.comment,
                    'approve_date', ari.approve_date,
                    'create_date', ari.create_date
                ))
                from hr.approve_request_item ari, hr.employee e, hr.approve_request ar,
                hr.approve_request_rel arr, ref.ar_item_status ais
                where arr.object_id = pr.id
                and arr.object_name = 'PASS_REQUEST'
                and ar.id = arr.approve_request_id
                and ar.id = ari.approve_request_id
                and e.id = ari.employee_id
                and ais.id = ari.ar_item_status_id

            ), '[]'::json) as accept_list,
            pr.date_from as date_from,
            pr.date_to as date_to,
            o.name_${bind.lang} as organization,
            ob.name_${bind.lang} as organization_building,
            pr.description as description,
            concat(e.last_name_${bind.lang}, ' ', e.first_name_${bind.lang}, ' ', e.middle_name_${bind.lang}) as full_name,
            pr.pr_status_id as pr_status_id,
            pr.create_date as create_date,
            pr.create_user_id as create_user_id,
            prs.name_${bind.lang} as status,
            prt.name_${bind.lang} as pass_request_type,
            pr.employee_id as employee_id,
            pr.pass_request_type_id as pass_request_type_id,
            concat(ce.last_name_${bind.lang}, ' ', ce.first_name_${bind.lang}, ' ', ce.middle_name_${bind.lang}) as create_user,
            coalesce((select json_agg(json_build_object(
                    'id', f.id,
                    'name', f.name,
                    'create_user', concat(emp.last_name_${bind.lang} ,' ', emp.first_name_${bind.lang}, ' ', emp.middle_name_${bind.lang}),
                    'create_date', f.create_date
                ))
                from hr.file f
                    join hr.object_file obf on obf.file_id = f.id
                    join ref.object_type ot on obf.object_type_id = ot.id
                    join hr.user usr on usr.username = f.create_user
                    join hr.employee emp on emp.id = usr.id
                where obf.object_id = pr.id
                and ot.id = 8
                and f.is_active = true
            ), '[]'::json) as file_id_list,
            arr.approve_request_id,
            'PASS_REQUEST' as request_object_type_name
        from 
            hr.pass_request pr
            join hr.approve_request_rel arr on arr.object_id = pr.id and arr.object_name = 'PASS_REQUEST'
            join hr.employee e on pr.employee_id = e.id
            join ref.pass_request_status prs on prs.id = pr.pr_status_id
            join hr.employee ce on pr.create_user_id = ce.id
            join ref.pass_request_type prt on prt.id = pr.pass_request_type_id
            join hr.employee oe on oe.id = pr.create_user_id
            join hr.department d on oe.department_id = d.id
            join hr.organization o on o.id = d.organization_id
            join hr.organization_building ob on ob.id = pr.organization_building_id
        where 
            ${where}
        order by create_date desc
        ${sql_pagination_clause}
        `
        const {rows: pass_requests}: any = await client.query(query)

        query = `
        select count(1) as count
        from hr.pass_request pr 
        where
            ${where}
        `

        const {rows: {[0]: {count: total}}}: any = await client.query(query)

        return {total_length: total, pass_requests}

    } catch (err) {
        log.debug(query)
        log.error(`Error in pass_request_get -> ${JSON.stringify(err)}`)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function pass_request_visitor_create(bind: any): Promise<number> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
            insert into hr.pass_request_visitor
            (
                last_name,
                first_name,
                middle_name,
                identification_number,
                pass_request_id,
                create_user_id,
                update_user_id,
                is_resident_rk,
                document_type_id
            )
            values
            (
                trim(upper('${bind.last_name}')),
                trim(upper('${bind.first_name}')),
                trim(upper('${bind.middle_name}')),
                '${bind.identification_number}',
                ${bind.pass_request_id},
                ${bind.user_id},
                ${bind.user_id},
                ${bind.is_resident_rk},
                ${bind.document_type_id}
            )
            returning id
        `

        let {rows: {[0]: {id}}} = await client.query(query)

        return id

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }

    }

export async function get_buildings_db(bind: any, client: Client): Promise<any> {
    let query: string = ''
    try{

        query = `
            select id as value, name_${bind.lang} as text from hr.organization_building where organization_id = $1
        `

        let {rows: buildings} = await client.query({text: query, values: [bind.organization_id]}) 

        return buildings
    } catch (err) {
        log.debug(`db query: ${query}`)
        log.error(`Error in get_buildings_db -> ${JSON.stringify(err)}`)
        throw(err)
    }
}

export async function pass_request_create(bind: any, client: Client): Promise<number> {
    try {
        let query = `insert into hr.pass_request
                (
                    date_from,
                    date_to,
                    description,
                    employee_id,
                    pr_status_id,
                    create_user_id,
                    update_user_id,
                    purpose,
                    pass_request_type_id,
                    organization_id,
                    organization_building_id,
                    department_id
                ) 
            values 
                (
                    to_timestamp('${bind.date_from}', 'DD-MM-YYYY HH24:min:ss'),
                    to_timestamp('${bind.date_to}', 'DD-MM-YYYY HH24:min:ss'),
                    ${bind.description?`'${bind.description}'`:null},
                    ${bind.employee_id},
                    1,
                    ${bind.user_id},
                    ${bind.user_id},
                    '${bind.purpose}',
                    ${bind.pass_request_type_id?bind.pass_request_type_id:1},
                    ${bind.organization_id},
                    ${bind.organization_building_id},
                    
                    (
                        with recursive r as (
                            select id, parent_id
                            from hr.department
                            where id = (select e.department_id from hr.employee e where e.id = ${bind.user_id})
                            union 
                            select d.id, d.parent_id
                            from hr.department d
                            join r on d.id = r.parent_id
                        )

                        select id from r
                        where parent_id in (select id from hr.department where parent_id is null)
                    )
                    
                )
            returning id
            `


        let {rows: {[0]: {id}}} = await client.query(query)

        return id

            } catch (err) {
        log.error(err)
        throw err
    }
}

export async function pass_request_put (bind: any): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect()
        let sqlSet: string = "";

        let bindArr = Object.entries(bind).filter(([key, value]) => [
            'pr_status_id', 
            'purpose', 
            'description', 
            'date_to', 
            'date_from', 
            'employee_id',
            'pass_request_type_id',
        ].includes(key));
        bindArr.map(([key, value], index) => {
            if (key === 'date_to' || key === "date_from"){
                sqlSet += ` ${key} = to_timestamp('${value}', 'DD-MM-YYYY HH24:min:ss'), `;
            } else {
                sqlSet += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`} ,`;
            }
        })

        sqlSet = `update hr.pass_request
            set 
                ${sqlSet}
                update_date = current_timestamp,
                update_user_id = '${bind.user_id}'
            where id = ${bind.id} 
            `



                await client.query(sqlSet);

        return
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }

}

export async function pass_request_visitor_put (bind: any): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect()
        let sqlSet: string = "";

        let bindArr = Object.entries(bind).filter(([key, value]) => [
            'document_type_id', 
            'is_resident_rk', 
            'last_name', 
            'middle_name', 
            'first_name', 
            'identification_number',
            'pass_document_type_id', 
            'pass_is_resident_rk', 
            'pass_last_name', 
            'pass_middle_name', 
            'pass_first_name', 
            'pass_identification_number'
        ].includes(key));

        bindArr.map(([key, value], index) => {
            if (key === 'first_name' || key === 'last_name' || key === 'middle_name') {
                sqlSet += ` ${key} = trim(upper('${value}')) ,`;
            } else {
                sqlSet += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`} ,`;
            }
        })

        sqlSet = `update hr.pass_request_visitor
            set 
                ${sqlSet}
                update_date = current_timestamp,
                update_user_id = '${bind.user_id}'
            where id = ${bind.id} 
            `

        await client.query(sqlSet);

        return
    } catch (err) {
        log.error(`Error in pass_request_visitor_put -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }

}
export async function pass_request_visitor_delete (bind: any): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect()
        let query = `
            delete from hr.pass_request_visitor
            where id = ${bind.id}
        `

        await client.query(query);

        return
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }

}

export async function pass_request_visitor_get_by_days_db (bind: any, client: Client) {
    let query
    try {

        let sql_pagination_clause = ""
        if (bind.page && bind.itemsperpage && bind.itemsperpage != -1) {
            sql_pagination_clause = `
                limit ${bind.itemsperpage}
                offset ${(bind.page-1) * bind.itemsperpage}
            `
        }

        if (bind.organization_id && bind.organization_id.length == 1) {
            query = `
                select 
                    (
                        select 
                            json_agg(distinct jsonb_build_object(
                                'organization', o.name_${bind.lang},
                                'visitors', (
                                    select 
                                        json_agg(json_build_object(
                                            'name', initcap(prv2.last_name || ' ' || prv2.first_name || ' ' || prv2.middle_name),
                                            'identification_number', prv2.identification_number,
                                            'date_from', vhf.action_date,
                                            'date_to', vht.action_date,
                                            'document_type', dt2.name_${bind.lang},
                                            'applicant', ea2.last_name_${bind.lang} || ' ' || ea2.first_name_${bind.lang} || ' ' || ea2.middle_name_${bind.lang},
                                            'employee', e2.last_name_${bind.lang} || ' ' || e2.first_name_${bind.lang} || ' ' || e2.middle_name_${bind.lang}
                                        )) as visitors
                                    from 
                                        hr.pass_request_visitor prv2 
                                        left join hr.prv_visit_history vht
                                        on vht.pass_request_visitor_id = prv2.id
                                        and vht.prv_action_type_id = 3,
                                        hr.pass_request pr2, 
                                        hr.employee e2,
                                        hr.employee ea2,
                                        ref.document_type dt2,
                                        hr.prv_visit_history vhf
                                    where 
                                        pr2.department_id = o.id
                                        and prv2.pass_request_id = pr2.id
                                        and pr2.employee_id = e2.id
                                        and pr2.create_user_id = ea2.id
                                        and date_trunc('day', pr2.date_from) = t1.d
                                        and dt2.id = prv2.document_type_id
                                        and vhf.pass_request_visitor_id = prv2.id
                                        and vhf.prv_action_type_id = 1
                                )
                            ))
                        from 
                        hr.pass_request pr1, hr.pass_request_visitor prv1, hr.department o
                        where 
                        date_trunc('day', pr1.date_from) = t1.d
                        and pr1.id = prv1.pass_request_id
                        and o.organization_id = ${bind.organization_id}
                        and pr1.department_id = o.id
                    ) organizations,
                    t1.d date_from
                from 
                (
                    select pr1.id, date_trunc('day', pvh1.action_date) d 
                    from hr.pass_request pr1, hr.pass_request_visitor prv1, hr.prv_visit_history pvh1
                    where prv1.pass_request_id = pr1.id
                    and pvh1.action_date >= '${bind.date_start}'
                    and pvh1.action_date < '${bind.date_to}'::date + interval '1 day'
                    and pvh1.pass_request_visitor_id = prv1.id
                    and pvh1.prv_action_type_id = 1
					and pr1.organization_id = ${bind.organization_id}
                ) t1
                group by t1.d
                order by t1.d desc
                ${sql_pagination_clause}
            `

        } else {
            query = `
                select 
                    (
                        select 
                            json_agg(distinct jsonb_build_object(
                                'organization', o.name_${bind.lang},
                                'visitors', (
                                    select 
                                        json_agg(json_build_object(
                                            'name', initcap(prv2.last_name || ' ' || prv2.first_name || ' ' || prv2.middle_name),
                                            'identification_number', prv2.identification_number,
                                            'date_from', vhf.action_date,
                                            'date_to', vht.action_date,
                                            'document_type', dt2.name_${bind.lang},
                                            'applicant', ea2.last_name_${bind.lang} || ' ' || ea2.first_name_${bind.lang} || ' ' || ea2.middle_name_${bind.lang},
                                            'employee', e2.last_name_${bind.lang} || ' ' || e2.first_name_${bind.lang} || ' ' || e2.middle_name_${bind.lang}
                                        )) as visitors
                                    from 
                                        hr.pass_request_visitor prv2 
                                        left join hr.prv_visit_history vht
                                        on vht.pass_request_visitor_id = prv2.id
                                        and vht.prv_action_type_id = 3,
                                        hr.pass_request pr2, 
                                        hr.employee e2,
                                        hr.employee ea2,
                                        ref.document_type dt2,
                                        hr.prv_visit_history vhf
                                    where 
                                        pr2.organization_id = o.id
                                        and prv2.pass_request_id = pr2.id
                                        and pr2.employee_id = e2.id
                                        and pr2.create_user_id = ea2.id
                                        and date_trunc('day', pr2.date_from) = t1.d
                                        and dt2.id = prv2.document_type_id
                                        and vhf.pass_request_visitor_id = prv2.id
                                        and vhf.prv_action_type_id = 1
                                )
                            ))
                        from 
                        hr.pass_request pr1, hr.pass_request_visitor prv1, hr.organization o
                        where 
                        date_trunc('day', pr1.date_from) = t1.d
                        ${bind.organization_id.length > 0?`and o.id in (${bind.organization_id})`:''}
                        and pr1.id = prv1.pass_request_id
                        and pr1.organization_id = o.id
                    ) organizations,
                    t1.d date_from
                from 
                (
                    select pr1.id, date_trunc('day', pvh1.action_date) d 
                    from hr.pass_request pr1, hr.pass_request_visitor prv1, hr.prv_visit_history pvh1
                    where prv1.pass_request_id = pr1.id
                    and pvh1.action_date >= '${bind.date_start}'
                    and pvh1.action_date < '${bind.date_to}'::date + interval '1 day'
                    and pvh1.pass_request_visitor_id = prv1.id
                    and pvh1.prv_action_type_id = 1
                    ${bind.organization_id.length > 0?`and pr1.organization_id in (${bind.organization_id})`:''}
                ) t1
                group by t1.d
                order by t1.d desc
                ${sql_pagination_clause}
            `
        }


        let {rows: visitors_by_days} = await client.query(query);

        if (bind.organization_id && bind.organization_id.length == 1) {
            query = `
                select 
                    o.name_${bind.lang} organization,
                    (
                        select 
                            json_build_object(
                                'count_visitors', count(prv2.id),
                                'avg_time', avg(coalesce(vht.action_date, now()::timestamp) - vhf.action_date)
                            )
                        from 
                            hr.pass_request_visitor prv2
                            left join hr.prv_visit_history vht
                            on vht.pass_request_visitor_id = prv2.id
                            and vht.prv_action_type_id = 3,
                            hr.pass_request pr2,
                            hr.prv_visit_history vhf
                        where 
                            pr2.department_id = o.id
                            and prv2.pass_request_id = pr2.id
                            and vhf.pass_request_visitor_id = prv2.id
                            and vhf.prv_action_type_id = 1
                            and vhf.action_date >= '${bind.date_start}'
                            and vhf.action_date < '${bind.date_to}'::date + interval '1 day'
                    ) bar_series
                from 
                hr.user_department_v o
                where o.organization_id = ${bind.organization_id}
                and o.parent_id in (select id from hr.department d1 where d1.parent_id is null)
                and (exists (SELECT 1 FROM hr.department check_d where 
                    check_d.id in (WITH RECURSIVE rec_department AS (
                            select check_dd.id from hr.department check_dd where check_dd.id = o.id
                            UNION
                            select check_ddd.id from hr.department check_ddd 
                                JOIN rec_department check_dddd ON check_ddd.parent_id = check_dddd.id
                            )
                            SELECT id FROM rec_department)
                    and exists (select 1 from hr.employee check_e where check_e.department_id = check_d.id and check_e.is_fired = false))
                or o.is_edited_employee = true)
            `
        } else {

            query = `
                select 
                    o.name_${bind.lang} organization,
                    (
                        select 
                            json_build_object(
                                'count_visitors', count(prv2.id),
                                'avg_time', avg(coalesce(vht.action_date, now()::timestamp) - vhf.action_date)
                            )
                        from 
                            hr.pass_request_visitor prv2
                            left join hr.prv_visit_history vht
                            on vht.pass_request_visitor_id = prv2.id
                            and vht.prv_action_type_id = 3,
                            hr.pass_request pr2,
                            hr.prv_visit_history vhf
                        where 
                            pr2.organization_id = o.id
                            and prv2.pass_request_id = pr2.id
                            and vhf.pass_request_visitor_id = prv2.id
                            and vhf.prv_action_type_id = 1
                            and vhf.action_date >= '${bind.date_start}'
                            and vhf.action_date < '${bind.date_to}'::date + interval '1 day'
                    ) bar_series
                from 
                hr.organization o
                ${bind.organization_id.length > 0?`where o.id in (${bind.organization_id})`:''}
            `
        }


        let {rows: bar_series} = await client.query(query);

        if (bind.organization_id && bind.organization_id.length == 1) {

            query = `
                select 
                    count(prv2.id) count_visitors,
                    avg(coalesce(vht.action_date, now()::timestamp) - vhf.action_date) avg_time,
                    (
                        select count(1) 
                        from 
                            hr.pass_request_visitor prv2, 
                            hr.pass_request pr2,
                            hr.prv_visit_history vhf
                        where
                            prv2.pass_request_id = pr2.id
                            and vhf.pass_request_visitor_id = prv2.id
                            and pr2.organization_id = ${bind.organization_id}
                            and vhf.prv_action_type_id = 1
                            and (
                                select count(1) 
                                from 
                                    hr.prv_visit_history vht
                                where 
                                    vht.pass_request_visitor_id = prv2.id
                                    and vht.prv_action_type_id = 3
                            ) = 0
                    ) count_in_building
                from 
                    hr.pass_request_visitor prv2
                    left join hr.prv_visit_history vht
                    on vht.pass_request_visitor_id = prv2.id
                    and vht.prv_action_type_id = 3,
                    hr.pass_request pr2,
                    hr.prv_visit_history vhf
                where 
                    prv2.pass_request_id = pr2.id
                    and vhf.pass_request_visitor_id = prv2.id
                    and pr2.organization_id = ${bind.organization_id}
                    and vhf.prv_action_type_id = 1
                    and vhf.action_date >= '${bind.date_start}'
                    and vhf.action_date < '${bind.date_to}'::date + interval '1 day'
            `
            } else {

            query = `
                select 
                    count(prv2.id) count_visitors,
                    avg(coalesce(vht.action_date, now()::timestamp) - vhf.action_date) avg_time,
                    (
                        select count(1) 
                        from 
                            hr.pass_request_visitor prv2, 
                            hr.pass_request pr2,
                            hr.prv_visit_history vhf
                        where
                            prv2.pass_request_id = pr2.id
                            ${bind.organization_id.length > 0?`and pr2.organization_id in (${bind.organization_id})`:''}
                            and vhf.pass_request_visitor_id = prv2.id
                            and vhf.prv_action_type_id = 1
                            and (
                                select count(1) 
                                from 
                                    hr.prv_visit_history vht
                                where 
                                    vht.pass_request_visitor_id = prv2.id
                                    and vht.prv_action_type_id = 3
                            ) = 0
                    ) count_in_building
                from 
                    hr.pass_request_visitor prv2
                    left join hr.prv_visit_history vht
                    on vht.pass_request_visitor_id = prv2.id
                    and vht.prv_action_type_id = 3,
                    hr.pass_request pr2,
                    hr.prv_visit_history vhf
                where 
                    prv2.pass_request_id = pr2.id
                    ${bind.organization_id.length > 0?`and pr2.organization_id in (${bind.organization_id})`:''}
                    and vhf.pass_request_visitor_id = prv2.id
                    and vhf.prv_action_type_id = 1
                    and vhf.action_date >= '${bind.date_start}'
                    and vhf.action_date < '${bind.date_to}'::date + interval '1 day'
            `
        }


        let {rows: result_data} = await client.query(query);

        return {visitors_by_days, bar_series, result_data}
    } catch (err) {
        log.debug(query)
        log.error(err)
        throw err;
    }}