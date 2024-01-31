import log from '../config/logger';
import get_client from '../loaders/database';
import { Client } from 'pg';

export async function participant_post_db(bind: any): Promise<any> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        let postSqlSet = `insert into hr.participant (entry_id, employee_id, is_organizer) values (${bind.entry_id}, ${bind.employee_id}, ${bind.is_organizer})`;  

             let {rows: participant} = await client.query(postSqlSet).catch((e: any) => { throw `Ошибка entry db => ${e}`});

        return participant;

    } catch (err) {
        log.error(`Error in participant_post_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end();
        }
    }
}


export async function participant_get_db(bind: any): Promise<any> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        let getSqlSet = `select * from hr.participant where entry_id = ${bind.entry_id} and employee_id = ${bind.employee_id}`;  

             let {rows: participant} = await client.query(getSqlSet).catch((e: any) => { throw `Ошибка entry db => ${e}`});

        return participant;

    } catch (err) {
        log.error(`Error in participant_get_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end();
        }
    }
}


export async function participant_put_db(bind: any): Promise<void> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

                let whereClause = '';

        if (bind.employee_id) {
            whereClause += ` and employee_id = ${bind.employee_id} `
        }

        let updateSqlSet = `update hr.participant set is_active = ${bind.is_active} where entry_id = ${bind.entry_id} ${whereClause}`;  

        await client.query(updateSqlSet).catch((e: any) => { throw `Ошибка entry db => ${e}`})

    } catch (err) {
        log.error(`Error in participant_put_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end();
        }
    }
}
