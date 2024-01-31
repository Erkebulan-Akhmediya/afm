import { Client } from 'pg';
import log from '../config/logger';

export async function application_get_db(bind: any, client: Client): Promise<any> {
    try {
        let columns = ''
        let condition = ''

        if(bind.is_admin) {
            columns = ` * `
            condition = ''
        } else {
            columns = ` * `
            condition = 'where is_active = true'
        }
        let query = ` select 
                        ${columns}
                    from ref.application
                        ${condition}
                    order by id asc`;

            const {rows: data} = await client.query(query);
        return data;
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function application_post_db(bind: any, client: Client): Promise<undefined> {
    try {
        let query = `insert into ref.application (name_rus, name_kaz, description_rus, description_kaz, url_address, is_active, create_user, update_user) values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`;
        const queryBind = [
            bind.name_rus,
            bind.name_kaz,
            bind.description_rus,
            bind.description_kaz,
            bind.url_address,
            bind.is_active ? (bind.is_active == 'true' || bind.is_active == true ? true : false) : false,
            bind.user_name,
            bind.user_name
        ]

            const {rows: {0: data}} = await client.query(query, queryBind);
        return data.id;
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function application_put_db(bind: any, client: Client): Promise<undefined> {
    try {
        const queryBind = [bind.id, bind.user_name]

        let query = 'update_user = $2, update_date = current_timestamp'
        if(bind.name_rus) {
            query += `${query.trim() ? ' ,' : ' '} name_rus = $${queryBind.push(bind.name_rus)}`;
        }
        if(bind.name_kaz) {
            query += `${query.trim() ? ' ,' : ' '} name_kaz = $${queryBind.push(bind.name_kaz)}`;
        }
        if(bind.description_rus) {
            query += `${query.trim() ? ' ,' : ' '} description_rus = $${queryBind.push(bind.description_rus)}`;
        }
        if(bind.description_kaz) {
            query += `${query.trim() ? ' ,' : ' '} description_kaz = $${queryBind.push(bind.description_kaz)}`;
        }
        if(bind.url_address) {
            query += `${query.trim() ? ' ,' : ' '} url_address = $${queryBind.push(bind.url_address)}`;
        }
        if(bind.is_active) {
            query += `${query.trim() ? ' ,' : ' '} is_active = ${bind.is_active ? (bind.is_active == 'true' || bind.is_active == true ? true : false) : false}`;
        } else {
            query += `${query.trim() ? ' ,' : ' '} is_active = false`;
        }

                query = `update ref.application set ${query} where id = $1`;

                await client.query(query, queryBind);
        return bind.id;
    } catch (err) {
        log.error(err);
        throw err;
    }
}