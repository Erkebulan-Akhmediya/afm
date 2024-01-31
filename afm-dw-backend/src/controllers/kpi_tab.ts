import { Client } from 'pg';
import express from 'express';
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import {kpi_tab_get_db, kpi_tab_put_db, kpi_tab_post_db, kpi_slide_get_db, kpi_slide_put_db, kpi_slide_post_db} from '../db_apis/kpi_tab';
import {post_file, put_file} from '../utils/file-api';
import {file_post_db,file_put_db} from '../db_apis/file';

export async function kpi_tab_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          

        let result = await kpi_tab_get_db(bind, client);
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

export async function kpi_tab_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);    
        let result
        if(bind.tab_id) {
            result = await kpi_tab_put_db(bind, client)
        } else {
            result = await kpi_tab_post_db(bind, client)
        }
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

export async function kpi_slide_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          

        let result = await kpi_slide_get_db(bind, client);
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

export async function kpi_slide_post (req: any, res: express.Response, next: express.NextFunction) {
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
            result = await kpi_slide_put_db(bind, client)
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
            result = await kpi_slide_post_db(bind, client)
            req.body.object_id = result

            let dataFile: any = await file_post_db(req, client)

                await post_file(req, dataFile.id, res, false, true)
        }
        await client.query('COMMIT')
        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        await client?.query('ROLLBACK')
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}