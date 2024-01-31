import log from '../config/logger';
import get_client from '../loaders/database';
import {request_get_binds} from '../interface/interface'
import { Client } from 'pg';

export async function request_characteristic_get_db(bind: any, client: Client): Promise<any> {
    let query: string = ''
    let values: any = []
    try {

        query = `
            select
                rscr.characteristic_id,
                rscr.is_required,
                rscr.is_active,
                rscr.is_multiple,
                char.value_type_id,
                char.name,
                char.catalog_name,
                char.value_length,
                char.is_active,
                vt.name as type
            from
                ref.request_subtype_char_rel rscr
                join ref.characteristic char on rscr.characteristic_id = char.id
                join ref.value_type vt on vt.id = char.value_type_id
            where
                request_sub_type_id = $1
            order by rscr.view_priority
        `

        values = [bind.sub_type_id]

        let {rows:characteristics} = await client.query({text: query, values: values})

        return characteristics

    } catch (err) {
        log.error(err)
        throw(err)
    }
}

export async function request_get_db(bind: request_get_binds) {
    let client;
    let query: string = ''
    try {
        client = get_client(); await client.connect();

        let sql_pagination_clause = ""
        if (bind.page && bind.itemsperpage && bind.itemsperpage != -1) {
            sql_pagination_clause = `
                limit ${bind.itemsperpage}
                offset ${(bind.page-1) * bind.itemsperpage}
            `
        }

        let sql_where_clause = "";
        if (bind.employee_id) {
            sql_where_clause += ` and 
            (
                (
                    select count(1) 
                    from hr.request_employee_rel rer 
                    where rer.request_id = r.id 
                    and rer.employee_id = ${bind.employee_id}
                ) > 0 
                ${!bind.only_assigned_to_you?`or r.create_user = (select username from hr.user where id = ${bind.employee_id})`: ''}
            )`
        }
        if (bind.search_query) {
            sql_where_clause += ` 
                and 
                (
                    upper(r.id::text) like upper('%${bind.search_query}%')
                    or upper(rt.name_${bind.lang}) like upper('%${bind.search_query}%')
                    or upper(rst.name_${bind.lang}) like upper('%${bind.search_query}%')
                )
            `
        }
        if (bind.request_status) {
            sql_where_clause += ` and ar.approve_request_status_id = ${bind.request_status} `
        }
        if (bind.req_id) {
            sql_where_clause += ` and r.id = ${bind.req_id} `
        }
        if (bind.sub_type) {
            sql_where_clause += ` and r.request_sub_type_id = ${bind.sub_type} `
        }
        if (bind.date_from) {
            sql_where_clause += ` and r.date_from >= to_timestamp('${bind.date_from}', 'YYYY-MM-DD')`
        }
        let details_get_sql = ''

        if(bind.id){
            sql_where_clause += ` and r.id = ${bind.id} `
        }

        if(bind.id || bind.get_full_data){

            details_get_sql = `
                (
                    select json_agg(
                        json_build_object(
                            'name', char.name,
                            'catalog_name', char.catalog_name,
                            'value', ( select json_agg(rcr.value) from hr.request_char_rel rcr where rcr.request_id = r.id and rcr.characteristic_id = char.id ),
                            'value_type_id', char.value_type_id,
                            'is_multiple', rscr.is_multiple,
                            'view_priority', rscr.view_priority,
                            'characteristic_id', char.id,
                            'list_value', (
                                select case when char.value_type_id = 4 then
                                (
                                    select
                                        json_agg(json_build_object('selectedRow', json_build_object('text', display_value_${bind.lang})))
                                    from
                                        ref.characteristic_value cv, hr.request_char_rel rcr
                                    where
                                        rcr.request_id = r.id
                                        and cv.value = rcr.value
                                        and rcr.characteristic_id = char.id
                                        and cv.characteristic_id = char.id
                                )
                                when char.value_type_id = 5 then
                                (
                                    select json_agg(json_build_object('selectedRow', json_build_object('text', cc.name)))
                                    from hr.retCharCatalogData(char.id) cc, hr.request_char_rel rcr
                                    where
                                        rcr.request_id = r.id
                                        and rcr.characteristic_id = char.id
                                        and cc.id = rcr.value::integer
                                )
                                else null
                                end
                            )
                        ) order by rscr.view_priority
                    )
                    from 
                        hr.request_char_rel rcr, ref.characteristic char, ref.request_subtype_char_rel rscr
                    where rcr.id = (
                        select id 
                        from hr.request_char_rel rcr 
                        where rcr.request_id = r.id 
                        and char.id = rcr.characteristic_id 
                        limit 1
                    )
                    and char.id = rscr.characteristic_id
                    and rst.id = rscr.request_sub_type_id
                    and rscr.characteristic_id = char.id
                )
                as details,
            `
        }

        query = `
        select
        r.id,
        (
            select 
                json_agg(
                    json_build_object(
                        'id', rer.employee_id,
                        'last_name', e.last_name_${bind.lang},
                        'first_name', e.first_name_${bind.lang},
                        'middle_name', e.middle_name_${bind.lang},
                        'department_id', e.department_id,
                        'identification_number', e.identification_number,
                        'employee_type_id', e.employment_type_id,
                        'position_id', e.position_id
                    )
                ) 
            from hr.request_employee_rel rer, hr.employee e
            where 
                rer.request_id = r.id
                and e.id = rer.employee_id
        ) employees,
        r.request_type_id,
        r.request_sub_type_id,

        case when r.request_status_id = 4 then r.request_status_id
        else coalesce(ar.approve_request_status_id, r.request_status_id)
        end as request_status_id,

        r.create_date,
        r.create_user,
        r.update_date,
        r.update_user,

        (
            select count(1)
            from hr.approve_request_item ari
            where ari.approve_request_id = ar.id and ari.ar_item_status_id in (1,2)
        ) as countnotapproved,

        arr.approve_request_id as approve_request_id,
        ${details_get_sql}

        rt.name_${bind.lang} as request_type_name,
        rst.name_${bind.lang} as request_sub_type_name,
        coalesce(ars.name_${bind.lang}, rs.name_${bind.lang}) as request_status_name,
        ar.approve_request_status_id
        from
            hr.request r
            left join hr.approve_request_rel arr on  arr.object_id = r.id and arr.object_name = 'REQUEST'
            left join hr.approve_request ar on ar.id = arr.approve_request_id
            left join ref.approve_request_status ars on ars.id = ar.approve_request_status_id,
            ref.request_type rt,
            ref.request_sub_type rst,
            ref.request_status rs
        where
            rs.id = r.request_status_id
            and r.is_deleted = false
            and rt.is_application = ${bind.is_application}
            and r.request_type_id = rt.id
            and r.request_sub_type_id = rst.id
            ${sql_where_clause}

        
        order by id desc
        ${sql_pagination_clause}
        `

        let {rows: request}: any = await client.query(query)

        if(!bind.id)
        {
            query = `
            select
                count(1) as total
            from
                hr.request r
                left join hr.approve_request_rel arr on  arr.object_id = r.id and arr.object_name = 'REQUEST'
                left join hr.approve_request ar on ar.id = arr.approve_request_id
                left join ref.approve_request_status ars on ars.id = ar.approve_request_status_id,
                ref.request_type rt,
                ref.request_sub_type rst,
                ref.request_status rs
            where
                rs.id = r.request_status_id
                and r.is_deleted = false
                and rt.is_application = ${bind.is_application}
                and r.request_type_id = rt.id
                and r.request_sub_type_id = rst.id
                ${sql_where_clause}
            `
        }


        if (request.length > 0) {

            let {rows: {[0]:{total}}}: any = await client.query(query)

            if (total != 0 && request.length != 0) {
                request[0].total = total
            }

        }

        return request;
    } catch (err) {
        log.debug(query)
        log.error(`Error in request_get_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_delete_db(bind: any) {
    let client;
    let query: string = ''
    try {
        client = get_client(); await client.connect();

        query = `
            update hr.request set is_deleted = true where id = ${bind.id}
        `
        await client.query(query)

    } catch (err) {
        log.debug(query)
        log.error(`Error in request_get_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function request_get_subordinates_db(bind: any) {
    let client;
    try {
        let sql_where_clause: String = ''
        if(bind.request_approve_status) {
            sql_where_clause +=  ` AND ra.request_approve_status_id = ${bind.request_approve_status}`
        }

        if(bind.id) {
            sql_where_clause +=  ` AND r.id = ${bind.id}`
        }
        if (bind.sub_type) {
            sql_where_clause += ` and r.request_sub_type_id = ${bind.sub_type} `
        }
        if (bind.date_from) {
            sql_where_clause += ` and r.date_from >= to_timestamp('${bind.date_from}', 'YYYY-MM-DD')`
        }
        client = get_client(); await client.connect();
        let query = `select
            r.id,
            (
                select 
                    json_agg(
                        json_build_object(
                            'id', rer.employee_id,
                            'last_name', e.last_name_${bind.lang},
                            'first_name', e.first_name_${bind.lang},
                            'middle_name', e.middle_name_${bind.lang},
                            'department_id', e.department_id,
                            'identification_number', e.identification_number,
                            'employee_type_id', e.employment_type_id,
                            'position_id', e.position_id
                        )
                    ) 
                from hr.request_employee_rel rer, hr.employee e
                where 
                    rer.request_id = r.id
                    and e.id = rer.employee_id
            ) employees,
            r.request_type_id,
            r.request_sub_type_id,
            r.request_status_id,
            r.date_from,
            r.date_to,
            r.comment,
            ra.id as request_approve_id,
            ra.approver_id,
            ra.request_approve_status_id,
            ra.comment as request_approve_comment,
            ra.rule_item_id,
            rai.id as rule_item_id,
            rai.rule_id,
            rai.orders,

            o.identification_number as bin,

            rt.name_${bind.lang} as request_type_name,
            rst.name_${bind.lang} as request_sub_type_name,
            rs.name_${bind.lang} as request_status_name

            from hr.request r, hr.request_approve ra,
        hr.approve_rule_item rai,
        ref.request_type rt,
        hr.department d,
        hr.organization o,
        ref.request_sub_type rst,
        ref.request_status rs

        where r.id = ra.request_id and ra.approver_id = ${bind.user_id}

        and e.department_id = d.id
        and o.id = d.organization_id
        and r.request_type_id = rt.id
        and r.request_sub_type_id = rst.id
        and r.request_status_id = rs.id
		and rai.id = ra.rule_item_id
        ${sql_where_clause}
        order by r.date_from desc, r.id desc`
        let {rows: request}: any = await client.query(query)
        return request;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_details_get_catalog_db(bind: any, client: Client) {
    let query: string = ''
    try {

        query = `
            select
                id as value, name as text
            from ${bind.catalog_name}
            ${bind.search_query? `where upper(trim(name)) like '%' || upper(trim('${bind.search_query}')) || '%'`: ''}
            limit 11
        `

        let {rows: data} = await client.query(query)

        return data

    } catch (err) {
        log.debug(query)
        log.error(`Error in request_details_get_catalog_db -> ${JSON.stringify(err)}`)
        throw(err)
    }
}

export async function request_details_get_list_db(bind: any, client: Client) {
    let query: string = ''
    try {

        query = `
            select
                characteristic_id,
                value,
                display_value_${bind.lang} as text
            from ref.characteristic_value
            where characteristic_id = $1
                and is_active = true
        `

        let {rows: data} = await client.query({text: query, values:[
            bind.characteristic_id
        ]})

        return data

    } catch (err) {
        log.error(err)
        throw err
    }
}

export async function request_edit_put_db(bind: any, client: Client) {
    let query: string = ''
    try {

        query = `
            update hr.request set
                date_from = $1,
                date_to = $2,
                request_type_id = $3,
                request_sub_type_id = $4
            where
                id = $5
        `

        await client.query({text: query, values:[
            bind.date_from, bind.date_to, bind.request_type_id, bind.request_sub_type_id, bind.id
        ]})

        query = `
            delete from hr.request_employee_rel
            where
                request_id = $1
        `

        await client.query({text: query, values: [
            bind.id
        ]})
        for (let i of bind.employees) {

            query = `
                insert into hr.request_employee_rel 
                    (employee_id, request_id, is_deleted)
                values
                    ($1, $2, false)
            `

            await client.query({text: query, values: [
                i.id, bind.id
            ]})

        }

        for (let i of bind.details) {
            query = `
                update hr.request_char_rel set
                    value = $1
                where request_id = $2 and characteristic_id = $3
            `

            await client.query({text: query, values:[
                i.value[0], bind.id, i.characteristic_id
            ]})
        }

    } catch (err) {
        log.error(err)
        throw err
    }
}

export async function request_update_external_id(status: any, id:any, client: Client) {
    try {
        let query = `update hr.employee set external_id = $1 where id = $2`

        await client.query(query, [status, id])
    } catch (err) {
        log.error(err)
        throw err
    }
}

export async function request_post_db(bind: any, client: Client) {
    try {
        let query = `
            insert into hr.request
                (request_type_id, request_sub_type_id, request_status_id, create_user, update_user)
            values
                (${bind.request_type_id}, ${bind.request_sub_type_id}, 0, '${bind.user_name}', '${bind.user_name}')
                returning id
        `

        const {rows: {0: {id: result}}} = await client.query(query)

        for (let employee of bind.employees) {
            let query = `
                insert into hr.request_employee_rel
                    (employee_id, request_id, is_deleted)
                values
                    (${employee.id}, ${result}, false)
            `
            await client.query(query)
        }

        for (let detail of bind.details) {
            for (let value of detail.value){
                let query = `
                    insert into hr.request_char_rel
                        (characteristic_id, request_id, value)
                    values
                        ($1, $2, $3)
                `
                let values = [
                    detail.characteristic_id,
                    result,
                    value
                ]
                await client.query({text: query, values: values})
            }
        }

        return result;
    } catch (err) {
        log.error(`Error in request_post_db ->`)
        log.error(err)
        throw err;
    }
}

export async function request_put_by_approve_id_db(approve_request_id: number, status_id: number, client: any) {
    let query = ''
    try {
        query = `update hr.request set request_status_id = $1, update_date = current_timestamp where id = (select object_id from hr.approve_request_rel where approve_request_id = $2 and object_name = 'REQUEST')`

        await client.query(query, [status_id, approve_request_id])

        return true;
    } catch (err) {
        log.debug(query)
        log.error(`Error in request_put_by_approve_id_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function request_put_external_request_db(id: any, status: any, client: Client) {
    try {
        let query = `update hr.request set external_request_id = $1 where id = $2`

        await client.query(query, [status, id])

        return true;
    } catch (err) {
        log.error(`Error in request_put_external_request_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function request_put_db(id: any, status: any, client: Client) {
    try {
        let query = `update hr.request set request_status_id = $1, update_date = current_timestamp where id = $2`

        await client.query(query, [status, id])

        return true;
    } catch (err) {
        log.error(`Error in request_put_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}
