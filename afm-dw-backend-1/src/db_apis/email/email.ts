import get_client from '../../loaders/database';
import config from '../../config/config'
import crypto from 'crypto-js';

export async function email_config_get(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `
        select 	t1.user_id, 
                t2.id as email_server_id,
                t1.email_address, 
                t1.email_password, 
                t2.name as server_name, 
                t2.in_server, 
                t2.in_port, 
                t2.out_server, 
                t2.out_port,
                t2.email_server_type_id
        from hr.email_account t1 
        join ref.email_server t2 on t1.email_server_id =t2.id 
        where t1.user_id = ${bind.user_id} 
        and t1.is_deleted = false
        and t2.is_deleted = false 
        and t2.email_server_type_id = 1
        
        union all
        select	t2.id as user_id, 
                t1.id as email_server_id, 
                t2.username_ldap as email_address, 
                t2.password_ldap as email_password, 
                t1.name as server_name, 
                t1.in_server, 
                t1.in_port, 
                t1.out_server, 
                t1.out_port,
                t1.email_server_type_id
        from ref.email_server t1 
        join hr.user t2 on 1 = 1
        where t1.is_deleted = false
        and t1.email_server_type_id = 2
        and t2.id = ${bind.user_id}
        and t2.auth_type_id = 2
        `

        let {rows : rez}: any = await client.query(query)

        if (rez.length > 1) {
            throw { code: '500', message: 'Некорректно настроен почтовый аккаунт - определено несколько активных записей' }
        }

        if (rez.length == 0) {
            throw { code: '500', message: 'У пользователя не настроен почтовый аккаунт' }
        }

        if (rez[0].email_server_type_id == 2) { 
            let decryptBytes = crypto.AES.decrypt(rez[0].email_password, 'secret-key');
            rez[0].email_address = rez[0].email_address + '@' + config.get('active_directory:usernameDN')
            rez[0].email_password = decryptBytes.toString(crypto.enc.Utf8)
        }

        return rez[0]
    }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_get_user_sync_date(bind: any, inboxName: any) {
    let client
    try {
        client = get_client(); await client.connect()
        let query = `select email_sync_date from hr.user where id = ${bind.user_id}`
        let {rows: {[0]: sync_data}} = await client.query(query)
        let emailSyncData = sync_data.email_sync_date

        let getEmailBoxSyncDate = null
        if (emailSyncData != null) {
            for (let key in emailSyncData) {
                if (key == inboxName) {
                    getEmailBoxSyncDate = emailSyncData[key]
                    break
                }
            }
        }

        return getEmailBoxSyncDate
    }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_set_user_sync_date(bind: any, inboxName: any) {
    let client
    try {
        client = get_client(); await client.connect()

        let get_query = `select email_sync_date from hr.user where id = ${bind.user_id}`
        let {rows: {[0]: get_query_data}} = await client.query(get_query)
        let emailSyncData = get_query_data.email_sync_date

        if (emailSyncData == null) {
            emailSyncData = {}
        }

                emailSyncData[inboxName] = new Date()

        let query = `update hr.user set email_sync_date = '${JSON.stringify(emailSyncData)}' where id = ${bind.user_id}`
        await client.query(query)

                return null
    }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_servers_get(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `select * from ref.email_server where is_deleted = false`
        let {rows : rez}: any = await client.query(query)

        return rez

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_server_create(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

        let query = `insert into ref.email_server
        (name, in_server, in_port, out_server, out_port, email_server_type_id) 
            values 
                ('${bind.name}', 
                '${bind.in_server}', 
                ${bind.in_port},
                '${bind.out_server}',
                ${bind.out_port},
                ${bind.email_server_type_id}
                )
            returning id
            `
        let {rows: {[0]: {id: id}}} = await client.query(query)
        return id

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_server_update(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `update ref.email_server set 
        name = '${bind.name}', 
        in_server = '${bind.in_server}', 
        in_port = ${bind.in_port}, 
        out_server = '${bind.out_server}', 
        out_port = ${bind.out_port} 
        where id = ${bind.id}
        returning id`

                if(bind.is_deleted) {
            query = `update ref.email_server set 
            is_deleted = ${bind.is_deleted} 
            where id = ${bind.id}
            returning id`

            let queryAcc = `update hr.email_account set
            is_deleted = ${bind.is_deleted}
            where email_server_id = ${bind.id}
            `
            await client.query(queryAcc)
        }

        let {rows: {[0]: {id: id}}} = await client.query(query)
        return id

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_accounts_get(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `select t3.first_name_${bind.lang} as first_name, t3.last_name_${bind.lang} as last_name, t2.username, t1.id, email_server_id, t1.user_id as email_user_id, t1.email_address, t1.email_password 
        from hr.email_account t1 
        join hr.user t2 on t1.user_id = t2.id
        join hr.employee t3 on t3.id =t2.id  
        where t1.email_server_id = ${bind.email_server_id} and t1.is_deleted = false`
        let {rows : rez}: any = await client.query(query)
        return rez

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_account_create(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `insert into hr.email_account
        (user_id, email_server_id, email_address, email_password) 
            values 
                (${bind.email_user_id},  
                ${bind.email_server_id},
                '${bind.email_address}',
                '${bind.email_password}'
                )
            returning id
            `
        let {rows: {[0]: {id: id}}} = await client.query(query)
        return id

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_account_update(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `update hr.email_account set 
        user_id = '${bind.email_user_id}', 
        email_server_id = '${bind.email_server_id}', 
        email_address = '${bind.email_address}', 
        email_password = '${bind.email_password}'
        where id = ${bind.id}
        returning id`

        if(bind.is_deleted) {
            query = `update hr.email_account set
            is_deleted = ${bind.is_deleted}
            where id = ${bind.id}
            returning id`
        }

        let {rows: {[0]: {id: id}}} = await client.query(query)
        return id

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_account_exist(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `select exists(select * from hr.email_account where user_id = ${bind.email_user_id} and is_deleted = false)`
        let {rows: {[0]: {exists: exists}}} = await client.query(query)
        return exists
    }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}