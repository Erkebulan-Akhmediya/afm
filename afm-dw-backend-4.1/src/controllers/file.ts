import express from 'express';
import {disable_file_db, file_get_db,file_name_get_db,file_post_db, get_file_list} from '../db_apis/file';
import {email_post_file, get_file, get_file_download, get_file_link, post_file} from '../utils/file-api';
import get_client from '../loaders/database';
import createBind from '../utils/create-bind';
import log from '../config/logger';
import { Client } from 'pg';

export async function file_disable (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()
        let bind = createBind(req)

        await disable_file_db(bind, client)

        res.locals.data = {
            statusCode: 204
        }
        next()
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function file_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let fileData = await file_get_db(req)

                if(fileData) {
            await get_file(fileData, req, res);
        } else {
            res.status(404).json({
                err: 0,
                errMsg: 'Не найдена'
            })
        }
    } catch (error) {
        next(error)
    }
}

export async function file_link_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let fileData = await file_get_db(req)

        if(fileData) {
            let presignedUrl = await get_file_link(fileData)

            res.locals.data = {
                statusCode: 200,
                data: presignedUrl
            }
        } else {
            res.status(404).json({
                err: 0,
                errMsg: 'Не найдена'
            })
        }
        next()
    } catch (error) {
        next(error)
    }
}

export async function file_get_download (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let fileData = await file_get_db(req)
        if(fileData) {
            await get_file_download(fileData, req, res);
        } else {
            res.status(404).json({
                err: 0,
                errMsg: 'Не найдена'
            })
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export async function file_post(req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        if (req.files.file != undefined) {
            req.file = req.files.file[0]
        } else {
            req.file = null
        }
                let data: any
        if(req.file) {
            data = await file_post_db(req, client)
            await post_file(req, data.id, res)

            res.locals.data = {
                data: data.id,
                statusCode: 200,
            }
            next();
        }
    } catch (error) {
        next(error);
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_file_post(req: any) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        let data: any = await file_post_db(req, client)
        await email_post_file(req, data.id)

    } catch (error) {
        log.error(`Error in email_file_post -> ${JSON.stringify(error)}`)
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function get_file_name (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);  
        const data = await file_name_get_db(bind);
        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next();
    } catch (error) {
        next(error)
    }
}


export async function file_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
    } catch(error) {
        next(error);
    }
}


export async function get_file_api (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const retData = await get_file_list(bind);
        res.locals.data = {
            statusCode: 200,
            data: retData
        }
        next();
    } catch (error) {
        next(error)
    }
}