import express from 'express';
import {add_view_event_db, event_files_get_db, event_get_db,event_post_db,event_put_db} from '../db_apis/event';
import createBind from '../utils/create-bind';
import {event_files_disable_db, file_get_db,file_post_db,file_put_db} from '../db_apis/file';
import {get_file, post_file, put_file} from '../utils/file-api';
import get_client from '../loaders/database';
import { email_file_post } from './file';
import { Client } from 'pg';

export async function add_view_event(req: express.Request, res: express.Response, next: express.NextFunction)
{
    let client: Client | null = null
    try {
        const bind: any = createBind(req);           
        client = get_client(); await client.connect();
        await add_view_event_db(bind.event_id, client)

        res.locals.data = {
            statusCode: 204,
        }
        next();

    }catch (err) {
        next(err)
    }finally {
        if (client) {
            await client.end()
        }
    }


}

export async function event_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: any
    const bind: any = createBind(req);

    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req);           

        const employees = await event_get_db(bind, client);

        res.locals.data = {
            statusCode: 200,
            data: employees
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

export async function event_post(req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        await client.query('BEGIN')
        const bind: any = createBind(req);
        let data = await event_post_db(bind, client)

              if (req.files.file != undefined){
            for await (let el of req.files.file) {
                let payload = {
                    file : {
                        originalname: el.originalname,
                        buffer: el.buffer
                    },
                    body: {
                        file_type_id: 2,
                        object_id: data,
                        fileType: 'event'
                    }
                }
                await email_file_post(payload)
            }
        }

                await client.query('COMMIT')
        res.locals.data = {
            statusCode: 200,
            data: {
                id: data
            }
        }

        next();
    } catch (error) {
        console.log(error)
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error);
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function event_put (req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    const bind: any = createBind(req);           
    try {
        client = get_client(); await client.connect();

        req.body.object_id = bind.id
        req.body.bind = bind

        if(req.files.file != undefined) {
            await event_files_disable_db(req, client)

            for await (let el of req.files.file) {
                let payload = {
                    file : {
                        originalname: el.originalname,
                        buffer: el.buffer
                    },
                    body: {
                        file_type_id: 2,
                        object_id: bind.id,
                        fileType: 'event'
                    }
                }
                await email_file_post(payload)
            }
        }


               await event_put_db(bind, client)
        await client.query('COMMIT')
        res.status(204).end()
    } catch(error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error);
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function event_get_files (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: any
    const bind: any = createBind(req);

    try {
        client = get_client(); await client.connect();
        const data = await event_files_get_db(bind, client);

        res.locals.data = {
            statusCode: 200,
            data: data
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