import express from 'express';
import { candidate_create, candidate_department_get_db, candidate_dictionary_get_db, candidate_edit, delete_old_photo, documents_get_db, check_for_create_candidate_db } from '../db_apis/candidate/candidate';
import { file_post_db } from '../db_apis/file';
import createBind from '../utils/create-bind';
import { post_file_new } from '../utils/file-api';
import get_client from '../loaders/database';
import { Client } from 'pg';

export async function get_candidate_department (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await candidate_department_get_db(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function check_for_create_candidate (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);   

                const data = await check_for_create_candidate_db(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function post_candidate (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await candidate_create(bind);

               res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function put_candidate (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await candidate_edit(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_candidate_dictionary (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await candidate_dictionary_get_db(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function employee_file_post(req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
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
            await post_file_new(req, data.id, res)
        }

                res.locals.data = {
            statusCode: 201,
            data: data
        }
        next();
    } catch (error) {
        next(error);
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function employee_file_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await documents_get_db(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function employee_file_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);  

                        const data = await delete_old_photo(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}