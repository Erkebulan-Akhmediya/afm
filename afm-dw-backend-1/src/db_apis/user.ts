import log from '../config/logger';
import get_client from '../loaders/database';

interface User {
    id: number,
    username: string,
    password: string,
    auth_type_id: number,
    is_active: number,
    create_date: Date,
    create_user: string,
    update_date: Date,
    update_user: string,
    language_id: number,
    language_name: string,
    language_code: string,
    role_id: number,
    role_name: string
}

export async function user_get(bind: any): Promise<User[]> {
    let client;
    try {
        client = get_client(); await client.connect();
        let sqlWhereClause = "";
        if (bind.username) {
            sqlWhereClause += ` and upper(t1.username) = '${bind.username.trim().toUpperCase()}'`
        } else if (bind.id) {
            sqlWhereClause += ` and t1.id = ${bind.id}`
        } else {
            throw { code: '500', message: 'Не определен переход' }
        }

        let query = 
            `select t1.*, t2.is_fired,
                    t3.name as language_name,
                    t3.code as language_code
               from hr.user t1, hr.employee t2, ref.language t3
              where t1.id = t2.id
                    and t1.language_id = t3.id
            ${sqlWhereClause}`

        const {rows: {[0]: user}}: any = await client.query(query)
        return user;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function user_new_get(bind: any): Promise<User[]> {
    let client;
    try {
        client = get_client(); await client.connect();
        let sqlWhereClause = "";
        if (bind.username) {
            sqlWhereClause += ` and (upper(t1.username) = '${bind.username.trim().toUpperCase()}' OR upper(t1.username_ldap) = '${bind.username.trim().toUpperCase()}')`
        } else if (bind.id) {
            sqlWhereClause += ` and t1.id = ${bind.id}`
        } else {
            throw { code: '500', message: 'Не определен переход' }
        }

        let query = 
            `select t1.*, t2.is_fired,
                    t3.name as language_name,
                    t3.code as language_code
               from hr.user t1, hr.employee t2, ref.language t3
              where t1.id = t2.id
                    and t1.language_id = t3.id
            ${sqlWhereClause}`

        const {rows: result}: any = await client.query(query)

        return result;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function user_role_get(bind: any): Promise<User[]> {
    let client;
    try {
        client = get_client(); await client.connect();
        let sqlWhereClause = "";
        if (bind.id) {
            sqlWhereClause += ` and t1.id = ${bind.id}`
        } else {
            throw { code: '500', message: 'Не определен переход' }
        }

        let query = 
            `select t1.id user_id,
                    STRING_AGG (distinct to_char(t3.id, 'FM999MI'), ';') role_id,
                    STRING_AGG (t3.name, ';') role_name
               from hr.user t1, hr.user_role_rel t2, ref.role t3
              where t1.id = t2.user_id
                    and t2.role_id = t3.id
                    and t2.is_active = true
                    ${sqlWhereClause}
                    group by t1.id`

        const {rows: {[0]: user}}: any = await client.query(query)
        return user;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function user_lang_put(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        await client.query(`update hr.user set language_id = ${bind.language_id} where id = ${bind.user_id}`)
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

export async function temp_ldap_password_put(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        await client.query(`update hr.user set password_ldap = '${bind.password_ldap}' where id = ${bind.user_id}`)
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

export async function user_create (bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        const user : any = await client.query(`
        insert into hr.user
            (id, username, password, auth_type_id, language_id)
        values 
            (${bind.employeeId}, '${bind.username.trim().toUpperCase()}', '${bind.password}', 1, 1)
        returning *`)
        return user;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function get_employee_email_db (bind: any) {
    let client;
    try {
        client = get_client(); await client.connect()

        let query = `
            select 
                eci.name_rus as email
            from 
                hr.employee_contact_info eci
            join
                hr.employee e on e.id = eci.employee_id
            where 
                eci.contact_info_type_id = 5 
                and e.id = ${bind.id}
        `

        const {rows: {[0]: user}}: any = await client.query(query)
        return user.email;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function get_app_config (bind: any) {
    let client;
    try {
        client = get_client(); await client.connect()
        let query = `select * from app.config where is_active = true`
        const result: any = await client.query(query)
        return result.rows;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}