import { Client } from 'pg';
import log from '../config/logger';
import get_client from '../loaders/database';

interface Notification {
    id: number,
    recipient_id: number,
    nr_status_id: number,
    notification_channel_id: number,
    entity_type_id: number,
    entity_id: number,
    subject: string,
    description: string,
    create_date: Date,
    update_date: Date
}

export async function notification_get_db(bind: any): Promise<Notification[]>{
    let client
    try{
        client = get_client(); await client.connect()

        let where: string = ""

        if (bind.id) {
            where = `n.id = ${bind.id}`
        }
        if (bind.user_id) {
            where = `r.user_id = ${bind.user_id}`
        }
        if (bind.unread) {
            where += ' and r.nr_status_id = 1'
        }

        let query = ` select 
            n.id as id,
            r.user_id as user_id,
            r.id as recipient_id,
            r.nr_status_id as nr_status_id,
            n.notification_channel_id as notification_channel_id,
            n.entity_type_id as entity_type_id,
            n.entity_id as entity_id,
            n.subject as subject,
            n.description as description,
            n.create_date as create_date,
            r.update_date as update_date
        from 
            hr.notification_recipient r
            left join hr.notification n on n.id = r.notification_id
        where 
            ${where}
            and n.is_active = true
        order by create_date desc
            `
        const {rows: notifications}: any = await client.query(query)
        return notifications

    }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function notification_deactivate_db(entity_type_id: number, entity_id: number, client: Client):Promise<void> {
    try{
        let query = `update hr.notification 
            set is_active = false
            where entity_type_id = $1
            and entity_id = $2
            `


        await client.query(query, [entity_type_id, entity_id])

            }catch(err){
        log.error('error in notificatino_deactivate_db => ' + JSON.stringify(err))
        throw err
    }
}

export async function notification_create_db(bind: any, entity_type_id: number, entity_id: number, client: Client):Promise<Number> {
    try{
        let query = `insert into hr.notification 
                (subject, description, entity_type_id, entity_id, notification_channel_id, create_user_id, update_user_id) 
            values 
                ('${bind.subject}', 
                '${bind.description}',
                ${entity_type_id},
                ${entity_id},
                ${bind.channel?bind.channel:1},
                -1,
                -1)
            returning id
            `

        let {rows: {[0]: {id: notification_id}}} = await client.query(query)


        for ( let k = 0; k < bind.recipients.length; k++ ) {
            let status
            if (!bind.channel || bind.channel == 1)
            {
                status = 1
            } else 
            {
                status = bind.messages[k].status
            }
            query = `insert into hr.notification_recipient
                    (notification_id, 
                    user_id, 
                    nr_status_id, 
                    user_email, 
                    error_message, 
                    create_user_id, 
                    update_user_id) 
                values 
                    (${notification_id}, 
                    ${bind.recipients[k]},
                    ${status},
                    ${status === 5? bind.messages[k].err : null},
                    ${bind.messages.length != 0?bind.messages[k].email:null},
                    -1,
                    -1)
                `
            await client.query(query)
        }

        return notification_id

            }catch(err){
        log.error('error in notificatino_create_db => ' + JSON.stringify(err))
        throw err
    }
}

export async function notification_put_db (bind: any): Promise<void> {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `update hr.notification_recipient
            set 
                nr_status_id = nr_status_id + 1
            where id = ${bind.id} and nr_status_id in (1, 3) 
            `

        await client.query(query)

    } catch(err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}