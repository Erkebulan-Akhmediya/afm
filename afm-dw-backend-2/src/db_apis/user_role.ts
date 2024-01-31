import { Client } from 'pg';
import get_client from '../loaders/database';
import log from '../config/logger';

export async function user_role(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        await client.query(`
            insert into hr.user_role_rel
                (user_id, role_id)
            values
                (${bind.user_id}, 77)`)
        return true;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function change_role(bind: any) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        await client.query('BEGIN')
        await client.query(`
            update hr.user_role_rel
                set update_user = $1, update_date = current_timestamp, is_active = false where user_id = $2`, [bind.user_name, bind.id])

                      for await (let role_id of bind.role_list) {
            await client.query(`
            insert into hr.user_role_rel
                (user_id, role_id, create_user, update_user)
            values
                (${bind.id}, ${role_id}, '${bind.user_name}', '${bind.user_name}')`)
        }
        await client.query('COMMIT')
        return true;
    } catch (err) {
        await client?.query('ROLLBACK')
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function delete_role(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        return true;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function change_password(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        await client.query(`
            update hr.user
                set password = $1, update_user = $2, update_date = current_timestamp where id = $3`, [bind.password, bind.update_user, bind.id])
        return true;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}