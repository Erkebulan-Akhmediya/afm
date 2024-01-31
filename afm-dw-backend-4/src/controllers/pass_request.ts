import express from 'express';
import log from '../config/logger';
import createBind from '../utils/create-bind';
import { Client } from 'pg';
import {document_type_get, get_buildings_db, pass_request_create, pass_request_get, pass_request_put, pass_request_visitor_by_history_get, pass_request_visitor_create, pass_request_visitor_delete, pass_request_visitor_get, pass_request_visitor_get_by_days_db, pass_request_visitor_history_get, pass_request_visitor_put, pass_request_visitor_unique_get, prv_next_status_post_db} from '../db_apis/pass_request';
import get_client from '../loaders/database';
import { pass_request_file_post_db } from '../db_apis/file';
import { post_file } from '../utils/file-api';
import { approve_request_create_db, approve_request_rel_create_db } from '../db_apis/approve';

export async function edit_pass_request (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        await pass_request_put(bind);

                    res.locals.data = {
            statusCode: 204
        }

        next()
    } catch (error) {
        next(error)
    }
}

export async function edit_pass_request_visitor (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        await pass_request_visitor_put (bind);

                    res.locals.data = {
            statusCode: 204
        }

        next()
    } catch (error) {
        next(error)
    }
}

export async function create_pass_request_visitor (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        let data = await pass_request_visitor_create(bind);

                    res.locals.data = {
            statusCode: 201,
            data: {id: data}
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_buildings(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect();
        const bind : any= createBind(req)

        const buildings = await get_buildings_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: buildings
        }

        next()
    } catch (error) {
        log.error(`Error in get_buildings -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function create_approve_pass_request (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

                client = get_client(); await client.connect();
        await client.query('BEGIN')

        const bind : any= createBind(req)

        let approve_request_id:number = await approve_request_create_db(bind, client, -1)

        await approve_request_rel_create_db(bind, client, approve_request_id, 'PASS_REQUEST', bind.pass_request_id)


        res.locals.data = {
            statusCode: 201,
            data: approve_request_id
        }


        await client.query('COMMIT');
        next()
    } catch (error) {
        log.error(`Error in create_approve_pass_request -> ${JSON.stringify(error)}`)
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function create_pass_request (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

                client = get_client(); await client.connect();

        const bind : any= createBind(req)

        let pass_request_id = await pass_request_create(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: pass_request_id
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

export async function prv_next_status_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        if (bind.prv_status_id === 2) 
        {
            let visitHistory = await pass_request_visitor_history_get({prv_list_id:[bind.pass_request_visitor], lang:bind.lang});

            if(visitHistory && visitHistory[0].prv_action_type_id !== 1) 
            {
                throw('Статус был обновлен ранее')
            }
        }

        let data = await prv_next_status_post_db(bind);

                    res.locals.data = {
            statusCode: 201,
            data: {id: data}
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_document_type (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const document_types = await document_type_get(bind);

        res.locals.data = {
            statusCode: 200,
            data: document_types
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_pass_request (req: express.Request, res: express.Response, next: express.NextFunction) {
    if(req.path.split('/')[2] == undefined || Number.isNaN(parseInt(req.path.split('/')[2]))){
        try {
            const bind: any = createBind(req);
            const pass_requests = await pass_request_get(bind);
            res.locals.data = {
                statusCode: 200,
                data: pass_requests
            }
            next();
        } catch (error) {
            next(error)
        }
    } else {
        return res.status(400).send({});
    }
}
export async function get_pass_request_visitor_history (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const pass_request_history = await pass_request_visitor_history_get(bind)

        res.locals.data = {
            statusCode: 200,
            data: pass_request_history
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_pass_request_visitor (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        let pass_requests

        if (bind.pr_status_id === 3) 
        {
            pass_requests = await pass_request_visitor_by_history_get(bind)
        }
        else if (!bind.pr_status_id && bind.unique)
        {
            pass_requests = await pass_request_visitor_unique_get(bind)
        }
        else 
        {
            pass_requests = await pass_request_visitor_get(bind)
        }

        res.locals.data = {
            statusCode: 200,
            data: pass_requests
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function delete_pass_request_visitor (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        await pass_request_visitor_delete(bind);

        res.locals.data = {
            statusCode: 204,
            data: {}
        }
        next();
    } catch (error) {
        next(error)
    }
}

export async function post_pass_request_file (req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req);           

                client = get_client(); await client.connect();

        if (req.files.file != undefined) {
            req.file = req.files.file[0]
        } else {
            req.file = null
        }

        let dataFile: any
        if(req.file) {
            dataFile = await pass_request_file_post_db(req, client, req.body.pr_id)
            await post_file(req, dataFile.id, res, false, true)
        }

        res.locals.data = {
            statusCode: 201,
            data: {id: dataFile.id}
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

export async function pass_request_visitor_get_by_days (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req);           

                client = get_client(); await client.connect();

                let visitors_by_days:any = await pass_request_visitor_get_by_days_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: visitors_by_days
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