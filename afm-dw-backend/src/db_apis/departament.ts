import log from '../config/logger';
import { Client } from 'pg';
import get_client from '../loaders/database';
import {Department} from '../interface/interface';

export async function department_get_db(bind: any): Promise<Department[]> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

                let sql_where_clause: any = "";
        let sql_join_clause: any = "";
        let sql_active_departments_clause: any = "";


                if (bind.admin_page) {
            sql_join_clause += ` left join hr.employee e on d.manager_id = e.id `;
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} d.parent_id is not null `;
        }

        if (bind.text) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'}  (d.name_rus ilike '%${bind.text}%' or  d.name_kaz ilike '%${bind.text}%') `;
        }

        if (bind.id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} d.id = ${bind.id} `;
        }

        if (bind.manager_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} d.manager_id = ${bind.manager_id}`;
        }

        if (bind.parent_id && !isNaN(bind.parent_id)) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} d.parent_id = ${bind.parent_id}`;
        } else if (bind.parent_id && isNaN(bind.parent_id)) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} d.parent_id is null and d.external_id <> '8a61e61b-6421-11ea-8b14-7085c2a41da6'`;
        }

        if (bind.external_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? 'and' : 'where'} d.external_id = '${bind.external_id}'`;
        }

        if (bind.organization_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? 'and' : 'where'} d.organization_id = ${bind.organization_id} and d.parent_id is null`;
        }

        sql_where_clause +=  ` ${sql_where_clause.trim() ? 'and' : 'where'} d.id <> -1`

        sql_active_departments_clause = ` and (exists (SELECT 1 FROM hr.department check_d where 
                                                    check_d.id in (WITH RECURSIVE rec_department AS (
                                                                    select check_dd.id from hr.department check_dd where check_dd.id = d.id
                                                                    UNION
                                                                    select check_ddd.id from hr.department check_ddd 
                                                                        JOIN rec_department check_dddd ON check_ddd.parent_id = check_dddd.id
                                                                    )
                                                                    SELECT id FROM rec_department)
                                                    and exists (select 1 from hr.employee check_e where check_e.department_id = check_d.id and check_e.is_fired = false))
                                        or d.is_edited_employee = true)`

        
                let select: string = `
        select 
            d.id as id,
            d.parent_id as parent_id,
            d.organization_id as organization_id,
            o.name_${bind.lang} as organization_name,
            d.name_${bind.lang} as name,
            d.view_priority as view_priority,
            d.external_id,
            d.department_type_id,
            dt.name_${bind.lang} as department_type_name,
            o.identification_number as organization_bin
            ${
                bind.admin_page ? `, coalesce(e.last_name_${bind.lang} || ' ' || e.first_name_${bind.lang} || ' ' || e.middle_name_${bind.lang}, 'Нет руководителя') as manager_name` : `` 
            }
            , d.is_edited_employee
        from 
            hr.department d
        left join hr.organization o on d.organization_id = o.id
        left join ref.department_type dt on d.department_type_id = dt.id
        ${sql_join_clause}
        ${sql_where_clause}
        ${sql_active_departments_clause}
        and d.is_active = true
        order by view_priority asc nulls last, d.name_rus
        `;
        let {rows: department} = await client.query(select);
        return department;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function getManagmentDepId(managmentDepName:string, organizationId:number){
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
            const {rows: {[0]: res}}:any = await client.query(`
            select id from hr.department d where name_rus = $1 and organization_id = $2`
                ,[managmentDepName, organizationId])
            return res.id
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function getParentDep(depId:number) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const {rows: {[0]: res}}:any = await client.query(`
            select * from hr.department d where id=$1`
            ,[depId])
        return res
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function getOrganizationByGuid(client: Client, external_id: string) {
    let query = ''
    let queryBind:any = []
    try {
        query = `
            select name_rus, name_kaz from hr.organization where external_id = $1
        `
        queryBind = [external_id]

        const {rows: data} = await client.query(query, queryBind)

        return data[0]

            } catch (err) {
        log.debug(query)
        log.debug(queryBind)
        log.error(err)
        throw(err)
    }
}

export async function getRootDepartmentPath(client: Client, external_id: string) {
    let query = ''
    let queryBind:any = []
    try {
        query = `
            with recursive rec(id, name_rus, external_id, parent_id, path, level) as (
                select d_top.id, d_top.name_rus, d_top.external_id, d_top.parent_id, cast(d_top.name_rus as VARCHAR(255)) as path, 1  from hr.department d_top where external_id = $1
                union all
                select d.id, d.name_rus, d.external_id, d.parent_id, cast(rec.path || ', ' || d.name_rus as VARCHAR(255)) as path, rec.level + 1 as level from hr.department d join Rec on (rec.parent_id = d.id)
            ) select * from rec where parent_id is null
        `
        queryBind = [external_id]

        const {rows: data} = await client.query(query, queryBind)

        return data[0]

            } catch (err) {
        log.debug(query)
        log.debug(queryBind)
        log.error(err)
        throw(err)
    }
}

export async function getEmployeeNameFromPositionAndDep( positionName:string, departmentId:number ) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const {rows: {[0]: res}}:any = await client.query(`
            select * from hr.get_employeename_position_and_dep($1, $2) as employee_name
        `,[positionName, departmentId])
        return res.employee_name
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function getHighPosition() {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const res = await client.query(`
            select distinct name_rus from hr.position where name_rus like '%Председател%' or name_rus like '%председател%' or name_rus like'Руководител%' or name_rus like '%руководител%'
        `)
        let jobs = Array.from( res.rows, x => x.name_rus);
        return jobs;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function department_post_db(client: Client, bind: any) {
    try {
        let {rows: {[0]: data}} = await client.query({
            text: `
                insert into hr.department 
                    (name_rus, name_kaz, external_id, parent_id, organization_id, create_user, update_user)
                values 
                    ($1, $2, $3, $4, $5, $6, $7) returning id`,
            values: [
                bind.name_rus, 
                bind.name_kaz, 
                bind.external_id,
                bind.parent_id,
                bind.organization_id,
                bind.create_user, 
                bind.update_user
            ]
        }).catch((e: any) => { 
            throw `Ошибка department post db => ${e} ${JSON.stringify(bind)}`
        });

        return data;

    } catch (err) {
        log.error(err);
        throw err
    }
}


export async function department_put_db(client: Client, bind: any): Promise<void> {
    try {

        let sqlSetAndWhereClause = "";
        let sqlValues: any = [];

        let count = 0;

        if (bind.external_id) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} external_id = $${count}`;
            sqlValues.push(bind.external_id);
        }

        if (bind.name_rus) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} name_rus = $${count}`;
            sqlValues.push(bind.name_rus);
        }

        if (bind.name_kaz) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} name_kaz = $${count}`;
            sqlValues.push(bind.name_kaz);
        }

                if (bind.manager_id || bind.manager_id === null) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} manager_id = $${count}`;
            sqlValues.push(bind.manager_id);
        }

        if (bind.organization_id) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} organization_id = $${count}`;
            sqlValues.push(bind.organization_id);
        }

        if (bind.view_priority || bind.view_priority === null) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} view_priority = $${count}`;
            sqlValues.push(bind.view_priority);
        }

        if (bind.parent_id || bind.parent_id === null) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} parent_id = $${count}`;
            sqlValues.push(bind.parent_id);
        }

        if (bind.department_type || bind.department_type === null) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} department_type_id = $${count}`;
            sqlValues.push(bind.department_type);
        }

        sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} update_date = current_date`;

        if (bind.id) {
            count++;
            sqlSetAndWhereClause += ` where id = $${count}`;
            sqlValues.push(bind.id);
        }

        await client.query({
            text: `
                update hr.department set ${sqlSetAndWhereClause}`,
            values: sqlValues
        }).catch((e: any) => { throw `Ошибка department put db => ${e} ${JSON.stringify(bind)}`})

    } catch (err) {
        log.error(err);
        throw err;
    }
}


export async function get_parent_department(client: Client, department_id: any): Promise<Department[]> {
    try {

        let select: string = `
        select * from hr.department where id = (select parent_id from hr.department where id = ${department_id})
        `;

        let {rows: department} = await client.query(select);
        return department;
    } catch (err) {
        log.error(err)
        throw err;
    } 
}

function Departament() {
    throw new Error('Function not implemented.');
}
