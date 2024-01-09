import log from '../../config/logger';
import get_client from '../../loaders/database';
import {employee_get_binds, Employee} from '../../interface/interface'
import moment from 'moment';
import config from '../../config/config'
import { Client } from 'pg';

export async function employee_get_db(bind: employee_get_binds): Promise<Employee[]> {
    let client;

    try {
        client = get_client(); await client.connect();

        let sql_where_clause: any = " where e.is_fired is not true and e.id > -1";
        let sql_from_clause: any = "";

        if (bind.id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} e.id = ${bind.id} `
        }
        if (bind.department_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'}  e.department_id = ${bind.department_id} `
        }
        if (bind.organization_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'}  e.department_id in (select id from hr.department where organization_id = ${bind.organization_id})`
        }
        if (bind.without_performers) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'}  e.is_performer = false`
        }

        if (bind.text) {
            bind.text = bind.text.replace(/\'/g, '\'\'') 
            const search = bind.text.split(" ");
            sql_where_clause += ` 
                ${sql_where_clause.trim() ? ' and ' : 'where'}
                ${search.length == 1 ? `
                (
                     e.last_name_rus ilike '%${bind.text}%'
                    or e.last_name_kaz ilike '%${bind.text}%'
                    or e.middle_name_rus ilike '%${bind.text}%'
                    or e.middle_name_kaz ilike '%${bind.text}%'
                    or e.first_name_rus ilike '%${bind.text}%'
                    or e.first_name_kaz ilike '%${bind.text}%' 
                    or e.identification_number::text like '%${bind.text}%select'
                    or exists(select 1 from hr.employee_contact_info eci where e.id = eci.employee_id and (eci.name_rus ilike '%${bind.text}%' or eci.name_kaz ilike '%${bind.text}%'))
                    or u.username ilike '%${bind.text}%'
                    or d.name_rus ilike '%${bind.text}%'
                    or d.name_kaz ilike '%${bind.text}%'
                    or p.name_rus ilike '%${bind.text}%'
                    or p.name_kaz ilike '%${bind.text}%' 
                )
                ` : `
                    (
                        concat_ws(' ', e.last_name_rus::text, e.first_name_rus::text, e.middle_name_rus::text) ilike '%${bind.text}%'
                        or
                        concat_ws(' ', e.last_name_kaz::text, e.middle_name_kaz::text, e.first_name_kaz::text) ilike '%${bind.text}%'
                        or
                        concat_ws(' ', e.first_name_rus::text, e.middle_name_rus::text, e.last_name_rus::text) ilike '%${bind.text}%'
                        or
                        concat_ws(' ', e.first_name_kaz::text, e.last_name_kaz::text, e.middle_name_kaz::text) ilike '%${bind.text}%'
                        or
                        concat_ws(' ',  e.middle_name_rus::text, e.first_name_rus::text, e.last_name_rus::text) ilike '%${bind.text}%'
                        or
                        concat_ws(' ', e.middle_name_kaz::text, e.last_name_kaz::text, e.first_name_kaz::text) ilike '%${bind.text}%'
                    )
                `} 
            `
        }

        let select: string = `
        select 
            e.id as id,
            e.last_name_${bind.lang} as last_name,
            e.first_name_${bind.lang} as first_name,
            e.middle_name_${bind.lang} as middle_name,
            e.identification_number as identification_number,
            e.personnel_number as personnel_number,
            e.employment_date as employment_date,
            e.manager_department_type_id,
            e.move_date as move_date,
            e.negative_dependency,
            e.other_interest,
            e.other_information,
            d.name_${bind.lang} as department_name,
            d.name_rus as department_name_rus,
            d.is_edited_employee as is_edited_employee,
            d.department_type_id,
            d.organization_id,
            d.parent_id as department_parent_id,
            g.name_${bind.lang} as gender_name,
            g.id as gender_id,
            ms.name_${bind.lang} as marital_status_name,
            ms.id as marital_status_id,
            nat.word as nationality_name,
            n.name_${bind.lang} as original_nationality_name,
            n.id as nationality_id,
            rg.name_${bind.lang} as religion_name,
            rg.id as religion_id,
            
            et.name_${bind.lang} as employee_type_name,
            emnt.name_${bind.lang} as employement_type_name, 
            p.name_${bind.lang} as position_name,
            p.name_rus as position_name_rus,
            e2.id as manager_id,
            e2.last_name_${bind.lang} as manager_last_name,
            e2.first_name_${bind.lang} as manager_first_name,
            e2.middle_name_${bind.lang} as manager_middle_name,
            r.name_${bind.lang} as rank_name,
            e.birth_date as employee_birth_date,
            u.username as username,
            u.auth_type_id as auth_type_id,
            u.username_ldap || '`+'@' + config.get('active_directory:usernameDN')+`' as email_address_ldap,
            (select STRING_AGG(DISTINCT TO_CHAR(UROLE.ROLE_ID, 'FM999MI'), ';') from hr.user_role_rel urole where urole.user_id = u.id and urole.is_active = true) as ROLE_ID,
            e.department_id,
            e.view_priority,
            d.external_id as department_external_id,
            e.position_id,
            e.category_id,
            e.is_performer,
            p.external_id as position_external_id,
            cat.name_${bind.lang} as category_name,
            o.name_${bind.lang} as organization_name,
            o.identification_number as organization_identification_number,
            e.is_disabled_pacs,
            coalesce(retChildDepartmentListJSON(e.department_id),'[]') as child_department_list,
            d.code as department_code
        from 
            hr.employee e
            left join ref.gender g on e.gender_id = g.id and g.is_active is not null
            left join ref.marital_status ms on e.marital_status_id = ms.id and ms.is_active is not null
            left join ref.religion rg on e.religion_id = rg.id
            left join ref.nationality n on e.nationality_id = n.id and n.is_active is not null
            left join hr.inflected_word nat on e.nationality_id = nat.external_id and nat.declination_id = 3 and nat.entity_type_id = 3 and nat.gender_id = e.gender_id and nat.language_id = ${bind.lang_id ? bind.lang_id : 
                "(select id from ref.language where code = upper('" + bind.lang + "'))"}
            left join ref.employee_type et on e.employee_type_id = et.id and et.is_active is not null
            left join ref.employment_type emnt on e.employment_type_id = emnt.id and emnt.is_active is not null
            left join ref.employee_category cat on e.category_id = cat.id
            left join hr.position p on e.position_id = p.id
            left join hr.department d on e.department_id = d.id
            left join hr.employee_rank er on e.id = er.employee_id
            left join ref.rank r on er.rank_id = r.id
            left join hr.user u on u.id = e.id
            /*left join hr.employee_education ee on ee.employee_id = e.id*/
            left join hr.employee e2 on d.manager_id = e2.id 
            left join hr.organization o on o.id = d.organization_id 
            ${sql_from_clause}
            ${sql_where_clause}
        order by e.department_id asc, e.view_priority asc, CAT.NAME_${bind.lang} asc, position_name asc ${bind.department_id ? ` ` : ` limit ${bind.limit ? bind.limit : 15} offset ${bind.offset ? bind.offset : 0} `} `;

        const {rows: employee}: any = await client.query(select);

                return employee;
    } catch (err) {
        log.error(`Error in employee_get_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function employee_put_db(client: Client, bind: any): Promise<void> {
    try {
        let updateSqlSet: string = ``;

        if (bind.department_id) {
            updateSqlSet += `department_id = ${bind.department_id}, `;  
        }
        if (bind.view_priority || bind.view_priority === null) {
            updateSqlSet += `view_priority = ${bind.view_priority}, `;  
        }
        if (bind.manager_department_type_id || bind.manager_department_type_id === null) {
            updateSqlSet += `manager_department_type_id = ${bind.manager_department_type_id}, `;  
        }

        updateSqlSet = `update hr.employee set ${updateSqlSet} update_user = '${bind.user_name}', update_date = current_timestamp where id = ${bind.id} `;  

        await client.query(updateSqlSet).catch((e: any) => { throw `Ошибка department put db => ${e}`})

    } catch (err) {
        log.error(`Error in employee_put_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function getEmployeeFromPositionAndDep(position_name_rus: String, department_id: Number) {
    let client
    try {
        client = get_client(); await client.connect();
        let query = `
            select 
                *       
            from hr.employee_v e  where position_id in
            (select id from hr."position" where name_rus LIKe '${position_name_rus}')
            and department_id = ${department_id} and is_fired = false;
        `
        let {rows: {[0]: employee}} = await client.query(query)
        return employee
    } catch (err) {
        log.error(`Error in getEmployeeFromPositionAndDep -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function employee_get_data_db(lang: String, iin: String): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect();
        let query = `select 
                        e.last_name_${lang} as last_name, 
                        e.first_name_${lang} as first_name, 
                        e.middle_name_${lang} as middle_name, 
                        e.gender_id, 
                        ec.name_${lang} as category_name,
                        r.name_${lang} as rank_name,
                        e.position_id, 
                        d.name_${lang} as department_name,
                        d.id as department_id,
                        d.organization_id as organization_id,
                        p.name_${lang} as position_name,
                        p.name_rus as position_name_rus
                    from hr.employee e
                        left join hr.employee_rank er on e.id = er.employee_id
                        left join ref.rank r on er.rank_id = r.id,
                        hr.position p, ref.employee_category ec, hr.department d
                    where e.identification_number = '${iin}'
                    and d.id = e.department_id
                    and e.position_id = p.id
                    and e.category_id = ec.id
                    `
        let topManager = await client.query(query).catch((e: any) => { throw `Ошибка employee_get_data_db => ${e}`})
        return topManager.rows[0]
    } catch (err) {
        log.error(`Error in employee_get_data_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function employee_get_topmanager(lang: String,  ): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect();
        let query = `select 
                        e.last_name_${lang} as last_name, 
                        e.first_name_${lang} as first_name, 
                        e.middle_name_${lang} as middle_name, 
                        e.gender_id, 
                        e.position_id, 
                        p.name_${lang} as position_name 
                    from hr.employee e 
                    join hr.position p on e.position_id = p.id 
                    where p.external_id = '26894622-88b9-11eb-8103-005056a6c6b7'`
        let topManager = await client.query(query).catch((e: any) => { throw `Ошибка employee_get_topmanager => ${e}`})
        return topManager.rows[0]
    } catch (err) {
        log.error(`Error in employee_get_topmanager -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function employee_get_access_scud_department_list(client: Client, bind: any): Promise<any>  {
    try {
        let query = `select t3.id organization_id, t3.name_rus organization_name, t1.department_id, t2.name_rus department_name
        from hr.user_department_access t1, hr.department t2, hr.organization t3 where t1.user_id = $1
        and t1.department_id = t2.id and t2.organization_id = t3.id
        order by t3.name_rus`
        let bindQuery = [bind.user_id]
        let {rows: departments} = await client.query(query, bindQuery).catch((e: any) => { throw `Ошибка employee_get_access_scud_department_list => ${e}`})
        return departments
    } catch (err) {
        log.error(`Error in employee_get_access_scud_department_list -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function employee_subordinates_get_db(client: Client, id: Number, isExistLimit: Boolean, offset: number, limit: number, only_department_id: Number, only_organization_id: Number): Promise<any> {
    try {

        let query = '', subordinates = [];
        let whereSql = ''

        if(only_department_id) {
            whereSql = ` and e.department_id = ${only_department_id} `
        }

        if(only_organization_id) {
            whereSql = ` and e.organization_id = ${only_organization_id} `
        }

        query = `
        select e.id, e.last_name, e.first_name, e.middle_name, e.identification_number,
                e.department_id, e.gender_id, e.view_priority, e.is_disabled_pacs, e.position_name
        from ret_employee_subordinates(${id}) res, hr.employee_v e where res.id = e.id and e.is_fired = false
        and e.id <> ${id}
        ${whereSql}
        order by e.last_name asc
        ${isExistLimit ? ` limit ${limit} offset ${offset} ` : `` }`

        if (query.trim()) {
            ({rows: subordinates} = await client.query(query).catch((e: any) => { throw `Ошибка employee_subordinates_get_db => ${e}`}));
        }
        return subordinates
    } catch (err) {
        log.error(`Error in employee_subordinates_get_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function employee_birthday_get_db(client: Client, bind: any, offset: number, limit: number): Promise<any> {
    try {

        let sevenDay = moment(new Date()).add(7, 'd').format('DD');
        let sevenDayMonth = moment(new Date()).add(7, 'd').format('MM');

        let sqlWhereClause = `
        ((extract(month from t.birth_date::date) = extract(month from now()::date) and extract(day from t.birth_date::date) >= ${new Date().getDate()})
        ${/**
        Если текущий месяц не равен, дате прибавленной 7 дней, то берем в расчет след месяц, если равны поиск по текущему месяц
        */  
        new Date().getMonth() + 1 != parseInt(sevenDayMonth, 10) ? `
        or
        (extract(month from t.birth_date::date) = extract(month from now()::date)+1 and ` : ` and (`}
        extract(day from t.birth_date::date) <= ${parseInt(sevenDay, 10)}))
        `

        let query = `
        SELECT t.id,
                t.last_name_rus,
                t.first_name_rus,
                t.birth_date
        FROM hr.employee t,
            hr.department t2
        WHERE t.department_id = t2.id and
        t.is_fired = false and
        t2.is_edited_employee = false and
        ${sqlWhereClause}
        order by extract(month from t.birth_date::date ) asc, extract(day from t.birth_date::date ) asc, t.id asc
        limit ${limit} offset ${offset} `

        let data
        if (query.trim()) {
            ({rows: data} = await client.query(query).catch((e: any) => { throw `Ошибка employee_birthday_get_db => ${e}`}));
        }

        return data
    } catch (err) {
        log.error(`Error in employee_birthday_get_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function organization_subordinates_get_db(client: Client, id: Number): Promise<any> {
    try {

        let query = '', subordinates = [];

        query = `select distinct e.organization_id, e.organization_name, e.department_id, e.department_name
        from ret_employee_subordinates(${id}) res, hr.employee_v e
        where res.id = e.id
        order by e.organization_name`

        if (query.trim()) {
            ({rows: subordinates} = await client.query(query).catch((e: any) => { throw `Ошибка organization_subordinates_get_db => ${e}`}));
        }
        return subordinates
    } catch (err) {
        log.error(`Error in organization_subordinates_get_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function get_organization_dep_list(client: Client, id: Number): Promise<any> {
    try {

        let query = '', results = [];
        query = `WITH RECURSIVE rec_department AS (
            select check_d.id, check_d.name_rus as name, check_d.parent_id, check_d.view_priority 
                from hr.department check_d where check_d.organization_id = ${id} and check_d.parent_id is null
            UNION
            select check_dd.id, check_dd.name_rus as name, check_dd.parent_id, check_dd.view_priority 
                from hr.department check_dd
                JOIN rec_department check_ddd ON check_dd.parent_id = check_ddd.id
            )
            SELECT id, name, parent_id, view_priority FROM rec_department
            order by view_priority asc nulls last, name
            `

        if (query.trim()) {
            ({rows: results} = await client.query(query).catch((e: any) => { throw `Ошибка get_organization_dep_list => ${e}`}));
        }
        return results
    } catch (err) {
        log.error(`Error in get_organization_dep_list -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function existEmployeeExplanatory(client: Client, employeeId: Number, lateOrAbsDate: String): Promise<any> {
    try {

        let query = '', results = [];
        query = `
        select * from 
            (select 
                t1.id, 
                t5.employee_id, 
                (select case when o1.value ~ '^\\d{4}-\\d{2}-\\d{2}$' 
                        then to_date(o1.value, 'YYYY-MM-DD') else null end
                from hr.request_char_rel o1 
                where o1.characteristic_id = 19 and --Дата с
                        o1.request_id = t1.id limit 1) as date_from, 
                (select case when o1.value ~ '^\\d{4}-\\d{2}-\\d{2}$' 
                        then to_date(o1.value, 'YYYY-MM-DD') else null end
                from hr.request_char_rel o1 
                where o1.characteristic_id = 20 and --Дата по
                        o1.request_id = t1.id limit 1) as date_to 
            from 
                hr.request t1, 
                hr.approve_request_rel t3, 
                hr.approve_request t4,
                hr.request_employee_rel t5
            where 
                t1.request_type_id = 1 --Тип заявки Объяснительная
                and t1.id = t3.object_id
                and t3.object_name = 'REQUEST'
                and t3.approve_request_id = t4.id
                and t4.approve_request_status_id = 2 --Статус Согласован
                and t1.id = t5.request_id
                and t5.employee_id = ${employeeId}) t1
        where t1.date_from is not null and 
            t1.date_to is not null and
            t1.date_from <= to_date('${lateOrAbsDate}', 'YYYY-MM-DD') and
            t1.date_to >= to_date('${lateOrAbsDate}', 'YYYY-MM-DD')
        limit 1
        `


        if (query.trim()) {
            ({rows: results} = await client.query(query).catch((e: any) => { throw `Ошибка existEmployeeExplanatory => ${e}`}));
        }
        return results
    } catch (err) {
        log.error(`Error in existEmployeeExplanatory -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function get_employee_from_position(client: Client, bind: any, position: number, department: any): Promise<void>  {
    try {

        let query = `select e.* from hr.employee e, hr.position p where e.position_id = p.id and UPPER(p.name_rus) like UPPER('%${position}%') and e.department_id = ${department}`

        let {rows: {0: approver}} = await client.query(query).catch((e: any) => { throw `Ошибка get_employee_from_position => ${e}`})
        return approver
    } catch (err) {
        log.error(`Error in get_employee_from_position -> ${JSON.stringify(err)}`)
        throw err;
    }
}

export async function get_employee_from_manager(client: Client, bind: any): Promise<void>  {
    try {
        let query = `select e.* from hr.employee e, hr.department d, hr.organization o
        where e.department_id = d.id and o.id = d.organization_id and d.organization_id = $1 and e.manager_department_type_id = $2`

        let bindQuery = [bind.organization_id, bind.manager_department_type_id]
        let {rows: {0: approver}} = await client.query(query, bindQuery).catch((e: any) => { throw `Ошибка get_employee_from_manager => ${e}`})
        return approver
    } catch (err) {
        log.error(`Error in get_employee_from_manager -> ${JSON.stringify(err)}`)
        throw err;
    }
}


export async function employee_get_positions_db(client: Client, bind: any): Promise<any>  {
    try {

        let query = `select distinct(name_${bind.lang}), name_${bind.lang} as name, id from hr.position order by name_${bind.lang}`

        let {rows: positions} = await client.query(query).catch((e: any) => { throw `Ошибка get_employee_from_position => ${e}`})
        return positions
    } catch (err) {
        log.error(`Error in employee_get_positions_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}





