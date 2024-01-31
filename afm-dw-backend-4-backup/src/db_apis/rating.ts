import { Client } from 'pg';
import log from '../config/logger';

export async function rating_test_list_get_db(bind: any, client: Client): Promise<any> {
    try {
        let sql_where_clause = " where not (o.name_rus = 'default') ";

        if(bind.period) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : ' where '} 
            to_char(ts.start_time, 'YYYY-MM') = '${bind.period}'`;
        }

        let select = `select 
        tw.id, tw.name_rus as name
        from hr.test_session ts
        join hr.test tw on ts.test_id = tw.id
        join hr.employee e on ts.employee_id = e.id
        join hr.department d on e.department_id = d.id
        join hr.organization o on d.organization_id = o.id
        ${sql_where_clause}
        group by o.id, tw.id
        order by (o.name_rus) desc`;

        let {rows: rating} = await client.query(select).catch((e: any) => { throw e });
        return rating;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function rating_test_get_db(bind: any, client: Client): Promise<any> {
    try {
        let sql_where_clause = " where o.name_rus != 'default' and d.name_rus not like 'Внештат%' ";

        if(bind.period) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : ' where '} 
            to_char(ts.start_time, 'YYYY-MM') = '${bind.period}'`;
        }
        if(bind.test_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : ' where '} 
            tw.id in (${bind.test_id})`;
        }

        let select = `select 
                    o.geo_code as name,
                    o.name_rus as organization, 
                    round((cast(sum(case when ts.id is not null then 1 else 0 end) as double precision)/(select count(e.id)
                    from hr.employee e
                    join hr.department d on e.department_id = d.id
                    join hr.organization o2 on d.organization_id = o2.id
                    where o.id = o2.id and e.is_fired = false and not d.name_rus like 'Внештат%')* 100) :: numeric, 2)
                    from hr.test_session ts
                    join hr.test tw on ts.test_id = tw.id
                    join hr.employee e on ts.employee_id = e.id
                    join hr.department d on e.department_id = d.id
                    join hr.organization o on d.organization_id = o.id
                    ${sql_where_clause}
                    group by o.id
                    order by (o.name_rus) desc`

        let {rows: rating} = await client.query(select).catch((e: any) => { throw e });
        return rating;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function know_level_get_db(bind: any, client: Client): Promise<any> {
    try {
        let sql_where_clause = " where not (o.name_rus = 'default') and ts.test_question_qty != 0";

        if(bind.period) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : ' where '} 
            to_char(ts.start_time, 'YYYY-MM') = '${bind.period}'`;
        }
        if(bind.test_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : ' where '} 
            tw.id in (${bind.test_id})`;
        }

        let select = `  select o.name_rus as organization,
                        round(((sum(cast(ts.test_question_correct_qty as double precision)/ts.test_question_qty)/count(e.id)) * 100) ::numeric, 2) as knowledge_level
                        from hr.test_session ts
                        join hr.test tw on ts.test_id = tw.id
                        join hr.employee e on ts.employee_id = e.id
                        join hr.department d on e.department_id = d.id
                        join hr.organization o on d.organization_id = o.id
                        ${sql_where_clause}
                        group by o.id`;
        let {rows: rating} = await client.query(select).catch((e: any) => { throw e });
        return rating;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function rating_active_get_db(bind: any, client: Client): Promise<any> {
    try {
        let sql_where_clause = "where o.name_rus != 'default'";

        if(bind.period) {
            sql_where_clause += ` ${sql_where_clause.trim() ? 'and' : 'where'} 
            to_char(ts.start_time, 'YYYY-MM') = ${bind.period}`;
        }

        if (bind.date_from) {
            sql_where_clause += ` and ca.update_date >= to_timestamp('${bind.date_from}', 'YYYY-MM-DD')`
        }

        if (bind.date_to) {
            sql_where_clause += ` and ca.update_date <= to_timestamp('${bind.date_to}', 'YYYY-MM-DD')`
        }

        let select = `select o.name_rus as organization, 
        sum(ca.count) as countSum
        from hr.call_agregate ca
        join ref.service_type st on ca.service_type_id = st.id
        join hr.employee e on ca.user_id = e.id
        join hr.department d on e.department_id = d.id
        join hr.organization o on d.organization_id = o.id
        ${sql_where_clause}
        group by o.id
        order by o.id`;

        let {rows: rating} = await client.query(select).catch((e: any) => { throw e });
        return rating;
    } catch (err) {
        log.error(err)
        throw err;
    }
}