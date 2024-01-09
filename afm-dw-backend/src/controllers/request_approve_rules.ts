import express from 'express';
import { Client } from 'pg';
import {get_request_approve_rule, get_request_approve_refs, request_approve_rule_post_db, request_approve_rule_put_db, request_approve_rule_del_db, get_request_approve_rule_item_all, post_request_approve_rule_item, put_request_approve_rule_item, del_request_approve_rule_item} from '../db_apis/request_approve_rules';
import createBind from '../utils/create-bind';
import axios from 'axios'
import get_client from '../loaders/database';
axios.defaults.timeout = 10000;

export async function request_approve_rule_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        await client.query('BEGIN')

        const request_approve = await get_request_approve_rule(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
        }
        await client.query('COMMIT');

        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK');
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_approve_refs (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        const request_approve = await get_request_approve_refs(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
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

export async function request_approve_rule_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        const request_approve = await request_approve_rule_post_db(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
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

export async function request_approve_rule_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        const request_approve = await request_approve_rule_put_db(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
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

export async function request_approve_rule_del (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        const request_approve = await request_approve_rule_del_db(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
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




export async function request_approve_rule_item_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        const request_approve = await get_request_approve_rule_item_all(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
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

export async function request_approve_rule_item_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        await client.query('BEGIN')

        const request_approve = await post_request_approve_rule_item(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
        }
        await client.query('COMMIT');

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

export async function request_approve_rule_item_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        await client.query('BEGIN')

        const request_approve = await put_request_approve_rule_item(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
        }
        await client.query('COMMIT');

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
export async function request_approve_rule_item_del (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind = createBind(req)
        client = get_client(); await client.connect();
        await client.query('BEGIN')

        const request_approve = await del_request_approve_rule_item(client, bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
        }
        await client.query('COMMIT');

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