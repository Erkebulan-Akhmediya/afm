import express from 'express';
import get_client from '../loaders/database';
import createBind from '../utils/create-bind';
import {comment_create, comment_get, comment_put} from '../db_apis/comment';
import { file_post_db } from '../db_apis/file';
import { post_file_new } from '../utils/file-api';
import { Client } from 'pg';
import log from '../config/logger';

export async function add_file_to_comment (req: any, res: express.Response, next: express.NextFunction): Promise<any> {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect();

        if (req.files.file != undefined) {
            req.file = req.files.file[0]
        } else {
            req.file = null
        }

        let data: any = await file_post_db(req, client)

                await post_file_new(req, data.id, res)
        res.locals.data = {
            statusCode: 201,
            data: data
        }
        next();
    } catch (error) {
        log.error(error)
        next(error);
    } finally {
        if(client) {
            await client.end()
        }
    }
}


export async function edit_comment (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        await comment_put(bind);

                    res.locals.data = {
            statusCode: 204
        }

        next()
    } catch (error) {
        next(error)
    }
}

export async function create_comment (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        let data = await comment_create(bind);

                    res.locals.data = {
            statusCode: 201,
            data: {id: data}
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_comment (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const comments = await comment_get(bind);

        res.locals.data = {
            statusCode: 200,
            data: comments
        }

        next();
    } catch (error) {
        next(error)
    }
}