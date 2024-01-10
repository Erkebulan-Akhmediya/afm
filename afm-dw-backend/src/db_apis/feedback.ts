import { Client } from 'pg';
import get_client from '../loaders/database';
import log from '../config/logger';

export async function feedback_create (bind: any): Promise<number> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()

        let query = `insert into hr.feedback (address, text, create_user_id, update_user_id) 
        values ('${bind.contact}',$$${bind.text}$$, ${bind.user_id?bind.user_id:-1}, ${bind.user_id?bind.user_id:-1})
        returning id
            `
            let {rows: {[0]: {id: feedback_id}}} = await client.query(query)

        return feedback_id

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function feedback_get (bind: any) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()


                let query = `select * from hr.feedback order by update_date`
        const {rows: feedbacks}: any = await client.query(query)

        return feedbacks

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function feedback_update (bind: any) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()


                let query = `update hr.feedback
        set 
            is_processed = true,
            update_date = current_timestamp,
            update_user_id = '${bind.user_id}',
            description = '${bind.description}'
            
        where id = ${bind.id} 
        `

        const {rows: feedbacks}: any = await client.query(query)

        return feedbacks

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function feedback_contacts_get (bind: any) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()


                let query = `select * from ref.sys_all_const where id =  5`
        let {rows: {0: contacts}} = await client.query(query)

        return contacts

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}