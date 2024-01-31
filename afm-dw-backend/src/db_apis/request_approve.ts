import { Client } from 'pg';
import get_client from '../loaders/database';
import {request_approve_get_binds} from '../interface/interface'
import log from '../config/logger';

export async function request_approve_get_db(bind: request_approve_get_binds) {
    let client;
    try {
        client = get_client(); await client.connect();
        let query = `
        select 
            ra.id,
            ra.approver_id,
            ra.request_approve_status_id,
            ra.comment,
            ra.approve_date,
            ra.create_date,
            ra.rule_item_id,
            e.id as employee_id,
            e.last_name_${bind.lang} as last_name,
            e.first_name_${bind.lang} as first_name,
            e.middle_name_${bind.lang} as middle_name,
            ras.name_${bind.lang} as request_approve_status_name,
            rai.orders
        from 
            hr.request_approve ra,
            hr.employee e,
            ref.request_approve_status ras,
            hr.approve_rule_item rai
        where
            ra.rule_item_id = rai.id
            and ra.approver_id = e.id
            and ra.request_approve_status_id = ras.id
            and ra.request_id = ${bind.request_id}`
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

export async function get_request_approve_from_id(bind: any, client: Client) {
    try {
        let {rows: request}: any = await client.query(`select ra.*, rai.orders from hr.request_approve ra, hr.approve_rule_item rai
        where request_id = $1 and ra.rule_item_id = rai.id`, [bind.id])
        return request;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function request_approve_post_db(bind: any, client: Client, item: any) {
    try {
        let queryBinds = [bind.requestId, item.approver_id, item.orders == 1 ? 3 : 4, '', bind.user_name, item.id]
        let {rows: request}: any = await client.query(`
        insert into hr.request_approve
                (request_id, approver_id, request_approve_status_id, comment, create_date, create_user, update_date, update_user, rule_item_id )
            values 
                ($1, $2, $3, $4, current_timestamp, $5, current_timestamp, $5, $6)
            returning id`, queryBinds)
        return request;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function request_approve_put_db(bind: any, client: Client) {
    try {
        let queryBinds = [
            bind.request_approve_status_id,
            bind.approvecomment,
            bind.id
        ]
        let approveDate = bind.request_approve_status_id == 1 || bind.request_approve_status_id == 2 ? `, approve_date = current_timestamp` : ''
        let {rows: request}: any = await client.query(`
        update hr.request_approve set request_approve_status_id = $1, comment = $2${approveDate} where id = $3`, queryBinds)
        return request;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

