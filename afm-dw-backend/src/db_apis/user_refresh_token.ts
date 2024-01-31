import log from '../config/logger';
import get_client from '../loaders/database';

export async function user_refresh_token_get(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        let refresh_token;
        if (bind.id) {
            ({rows: {[0]: refresh_token}} = await client.query(`select * from hr.user_refresh_token where user_id = ${bind.id}`))
        }
        if (bind.token) {
            ({rows: {[0]: refresh_token}} = await client.query(`select * from hr.user_refresh_token where token = '${bind.token}'`))
        }
        return refresh_token;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function user_refresh_token_post(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        await client.query(`
            insert into hr.user_refresh_token 
                (user_id, ip, os, browser, user_agent, token, expire_date, create_user, update_user)
            values
                (${bind.id}, '${bind.clientIp}', '${bind.os}', '${bind.browser}', '${bind.source}', '${bind.refreshToken}', '${bind.new_expire_date}', 'init', 'init')`)
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

export async function user_refresh_token_put(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        await client.query(`update hr.user_refresh_token set token = '${bind.refreshToken}', expire_date = '${bind.new_expire_date}', update_date = current_timestamp where user_id = ${bind.id}`)
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