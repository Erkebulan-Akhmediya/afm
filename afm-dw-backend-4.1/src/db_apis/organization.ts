import log from '../config/logger';
import get_client from '../loaders/database';
import { Client } from 'pg';

export async function organization_get_db(bind: any): Promise<any> {
    let client;
    try {
        client = get_client(); await client.connect();

        let sql_where_clause = "";

        let select = `
        select 
            o.id,
            o.name_${bind.lang} as name,
            o.identification_number
        from 
            hr.organization o`;

        if (bind.employee_identification_number) {
            select += `, hr.employee e, hr.department d`;
            sql_where_clause += ` where e.identification_number = '${bind.employee_identification_number}' and o.id = d.organization_id and d.id = e.department_id`
        }

        if(bind.id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? 'and' : 'where'} o.id = ${bind.id}`;
        }

        if (bind.external_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? 'and' : 'where'} o.external_id = '${bind.external_id}'`;
        }

        if (bind.identification_number) {
            sql_where_clause += ` ${sql_where_clause.trim() ? 'and' : 'where'} o.identification_number = ${bind.identification_number}`;
        }

        let {rows: organization} = await client.query(`${select} ${sql_where_clause}`).catch(e => { throw e });
        return organization;
    } catch (err) {
        log.error(`Error in organization_get_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function organization_post_db(client: Client, bind: any): Promise<void> {
    try {
        let {rows: {[0]: data}} = await client.query({
            text: `
                insert into hr.organization 
                    (name_rus, name_kaz, identification_number, external_id, create_user, update_user)
                values 
                    ($1, $2, $3, $4, $5, $6) returning id`,
            values: [
                bind.name_rus, 
                bind.name_kaz, 
                bind.identification_number,
                bind.external_id,
                bind.create_user,
                bind.update_user
            ]
        }).catch((e: any) => { throw `Ошибка organization post db => ${e} ${JSON.stringify(bind)}`})

                return data;
    } catch (err) {
        log.error(`Error in organization_post_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}


export async function organization_put_db(client: Client, bind: any): Promise<void> {
    try {

        let sqlSetAndWhereClause = "";
        let sqlValues: any = [];

        let count = 0;

        if (bind.identification_number) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} identification_number = $${count}`;
            sqlValues.push(bind.identification_number);
        }

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

        sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} update_date = current_date`;

        if (bind.id) {
            count++;
            sqlSetAndWhereClause += ` where id = $${count}`;
            sqlValues.push(bind.id);
        }

          await client.query({
            text: `
                update hr.organization
                set ${sqlSetAndWhereClause}`,
            values: sqlValues
        }).catch((e: any) => { throw `Ошибка department put db => ${e} ${JSON.stringify(bind)}`})

    } catch (err) {
        log.error(`Error in organization_put_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}
