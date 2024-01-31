import log from '../config/logger';
import get_client from '../loaders/database';
import { Client } from 'pg';


export async function position_get_db(bind: any): Promise<any> {
    let client;
    try {
        client = get_client(); await client.connect();

        let sql_where_clause = "";

        let select = `
        select 
            p.id,
            p.name_${bind.lang} as name
        from 
            hr.position p`;

        if(bind.id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? 'and' : 'where'} p.id = ${bind.id}`;
        }

        if (bind.external_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? 'and' : 'where'} p.external_id = '${bind.external_id}'`;
        }

        let {rows: position} = await client.query(`${select} ${sql_where_clause}`).catch(e => { throw e });
        return position;
    } catch (err) {
        log.error(`Error in position_get_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function position_post_db(client: Client, bind: any): Promise<void> {
    try {
        let {rows: {[0]: data}} = await client.query({
            text: `
                insert into hr.position 
                    (name_rus, name_kaz, external_id, organization_id, create_user, update_user)
                values 
                    ($1, $2, $3, $4, $5, $6) returning id`,
            values: [
                bind.name_rus, 
                bind.name_kaz, 
                bind.external_id,
                bind.organization_id,
                bind.create_user,
                bind.update_user
            ]
        }).catch((e: any) => { throw `Ошибка position post db => ${e} ${JSON.stringify(bind)}`})

                return data;
    } catch (err) {
        log.error(`Error in position_post_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}


export async function position_put_db(client: Client, bind: any): Promise<void> {
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

        if (bind.organization_id) {
            count++;
            sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} organization_id = $${count}`;
            sqlValues.push(bind.organization_id);
        }

        sqlSetAndWhereClause += `${sqlSetAndWhereClause.trim() ? ' ,' : ' '} update_date = current_date`;

        if (bind.id) {
            count++;
            sqlSetAndWhereClause += ` where id = $${count}`;
            sqlValues.push(bind.id);
        }

          await client.query({
            text: `
                update hr.position
                set ${sqlSetAndWhereClause}`,
            values: sqlValues
        }).catch((e: any) => { throw `Ошибка department put db => ${e} ${JSON.stringify(bind)}`})

    } catch (err) {
        log.error(`Error in position_put_db -> ${JSON.stringify(err)}`)
        throw err;
    }
}
