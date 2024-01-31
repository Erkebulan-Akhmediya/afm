import express from 'express';
import { Client } from 'pg';
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import {application_get_db, application_put_db, application_post_db} from '../db_apis/application';
import {post_file, put_file} from '../utils/file-api';
import {file_post_db, file_put_db} from '../db_apis/file';

export async function application_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          

        let result = await application_get_db(bind, client);
        res.locals.data = {
            statusCode: 200,
            data: result
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

export async function application_post (req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);    
        let result
        await client.query('BEGIN')

        if (req.files.file != undefined) {
            req.file = req.files.file[0]
        } else {
            req.file = null
        }

        if(bind.id) {
            result = await application_put_db(bind, client)
            if(req.file) {
                req.body.object_id = result
                req.body.bind = bind
                let dataFileId: any = await file_put_db(req, client)
                let putFile = await put_file(req, dataFileId)
                if(!putFile) {
                    throw 'Ошибка добавления файла'
                }
            }
        } else {
            result = await application_post_db(bind, client)
            req.body.object_id = result
            if(req.file) {
                let dataFile: any = await file_post_db(req, client)
                await post_file(req, dataFile.id, res, false, true)
            }
        }
        await client.query('COMMIT')
        res.locals.data = {
            statusCode: 200,
            data: result
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