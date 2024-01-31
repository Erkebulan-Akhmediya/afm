import express from "express";
import get_client from "../loaders/database";
import { one_servicerequest_get_db, servicerequestGetCountDb, servicerequest_change_status_db, servicerequest_characteristic_list_create_db, servicerequest_characteristic_list_delete_db, servicerequest_characteristic_list_get_db, servicerequest_create_db, servicerequest_edit_db, servicerequest_get_db, servicerequest_history_db, servicerequest_types_get_db } from "../db_apis/servicerequest";
import { get_service_category_db } from "../db_apis/service_admin";
import createBind from "../utils/create-bind";
import { approve_request_create_db, approve_request_rel_create_db } from "../db_apis/approve";
import { Client } from "pg";


export async function get_servicerequest_types (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await servicerequest_types_get_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
               next(error)
    }
}

export async function getServicerequestsCount (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req);           

        const data = await servicerequestGetCountDb(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            client.end()
        }
    }
}


export async function get_servicerequests (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req);           

        const data = await servicerequest_get_db(bind, client);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            client.end()
        }
    }
}


export async function get_one_servicerequest (req: express.Request, res: express.Response, next: express.NextFunction) {
    if(req.path.split('/')[3] == undefined || Number.isNaN(parseInt(req.path.split('/')[3]))){
        try {
            const bind: any = createBind(req);
            const data = await one_servicerequest_get_db(bind);

            res.locals.data = {
                statusCode: 200,
                data: data
            }
            next();
        } catch (error) {
            next(error)
        }
    } else {
        return res.status(404).send({});
    }
}



export async function create_servicerequest (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        const bind: any = createBind(req);           

        const data = await servicerequest_create_db(bind);

        client = get_client(); await client.connect()

        bind.category_id = bind.sr_category_id

        const category_data = await get_service_category_db(bind, client)

        if (category_data[0].need_to_be_approved) {

            let approve_request_id:number = await approve_request_create_db(bind, client, -1)

            await approve_request_rel_create_db(bind, client, approve_request_id, 'SERVICE_REQUEST', data)

        }

        res.locals.data = {
            statusCode: 201,
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

export async function change_status_servicerequest (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await servicerequest_change_status_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function edit_servicerequest (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await servicerequest_edit_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_servicerequest_history (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        const data = await servicerequest_history_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_servicerequest_characteristic_list (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        const data = await servicerequest_characteristic_list_get_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function post_servicerequest_characteristic_list (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        const data = await servicerequest_characteristic_list_create_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function delete_servicerequest_characteristic_list (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        const data = await servicerequest_characteristic_list_delete_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}