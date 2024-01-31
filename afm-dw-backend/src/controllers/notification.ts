import express from 'express';
import get_client from '../loaders/database';
import { notification_create_db, notification_deactivate_db, notification_get_db, notification_put_db } from '../db_apis/notification';
import { get_employee_email_db } from '../db_apis/user';
import sendMail from '../loaders/mail';
import { conns } from '../loaders/socket';
import createBind from '../utils/create-bind';
import log from '../config/logger';
import { Client } from 'pg';
import { Entity } from '../interface/interface';

export async function deactivate_notification_in_bc(channel: number, recipients: Array<number>, entity: Entity) {
    let client: Client | undefined
    try {
        client = get_client(); await client.connect()
        let messages: Array<any> = new Array()
        if(!channel || channel === 1)
        {
            let sended = []
            let connections = conns()
            let recipients_sockets:Array<any> = connections.filter((item:any)=>{
                let includes = recipients.includes(item.user_id)
                return includes
            })
            recipients_sockets.map((item:any) => {
                item.socket.emit('getNotifications')
            })
        }

        await notification_deactivate_db(entity.entity_type_id, entity.entity_id, client);

    } catch (error) {
        log.error('error in deactivate_notification_in_bc => ' + JSON.stringify(error))
        throw error
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function create_notification_in_bc(channel: number, recipients: Array<number>, subject: String, description: String, entity: Entity) {
    let client: Client | undefined
    try {
        client = get_client(); await client.connect()
        let messages: Array<any> = new Array()
        if(!channel || channel === 1)
        {
            let sended = []
            let connections = conns()
            let recipients_sockets:Array<any> = connections.filter((item:any)=>{
                let includes = recipients.includes(item.user_id)
                return includes
            })
            recipients_sockets.map((item:any) => {
                item.socket.emit('getNotifications')
            })
        }else{
            for (let item of recipients) {
                let email = await get_employee_email_db({id: item})
                email = 'test_email@email.kz' 

                                try {
                    await sendMail({
                        to: email,
                        subject: subject,
                        text: description,
                    })
                    messages.push({status: 4, id: item, email: email})
                } catch (err) {
                    messages.push({status: 5, id: item, err: err, email: email})
                    log.error(err)
                }
            }
        }

        let bind = {
            recipients, channel, subject, description, messages
        }

        let data = await notification_create_db(bind, entity.entity_type_id, entity.entity_id, client);


    } catch (error) {
        log.error('error in create_notification_in_bc => ' + JSON.stringify(error))
        throw error
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function create_notification (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | undefined
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        if(!bind.channel || bind.channel === 1)
        {
            bind.sended = []
            let connections = conns()
            let recipients:Array<any> = connections.filter((item:any)=>{
                let includes = bind.recipients.includes(item.user_id)
                return includes
            })
            recipients.map((item:any) => {
                item.socket.emit('getNotifications')
            })
        }else{
            bind.messages = []
            for (let item of bind.recipients) {
                let email = await get_employee_email_db({id: item})
                try {
                    await sendMail({
                        to: email,
                        subject: bind.subject,
                        text: bind.description,
                    })
                    bind.messages.push({status: 4, id: item, email: email})
                } catch (err) {
                    bind.messages.push({status: 5, id: item, err: err, email: email})
                    log.error(err)
                }
            }
        }

        let data = await notification_create_db(bind, bind.entity_type_id, bind.entity_id, client);


        res.locals.data = {
            statusCode: 201,
            data: {id: data}
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function get_notification (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)

        let data = await notification_get_db(bind)

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next()
    } catch (error) {
        next(error)
    }
}

export async function put_notification (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)

        await notification_put_db(bind)

        res.locals.data = {
            statusCode: 204
        }

        next()
    } catch (error) {
        next(error)
    }
}