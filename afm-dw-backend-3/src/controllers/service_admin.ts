import express from 'express';
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import log from '../config/logger';
import { add_category_db, add_performer_db, add_performer_group_db, add_subcategory_db, delete_category_db, delete_performer_db, delete_performer_group_db, delete_subcategory_db, edit_category_db, edit_performer_db, edit_performer_group_db, edit_subcategory_db, get_performer_db, get_performer_group_db, get_service_category_db, get_service_subcategory_db } from '../db_apis/service_admin';
import { Client } from 'pg';

export async function get_performer_group (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        let data = await get_performer_group_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function add_performer_group (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await add_performer_group_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function edit_performer_group (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await edit_performer_group_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function delete_performer_group (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await delete_performer_group_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
        next(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function get_performer (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        let data = await get_performer_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function add_performer (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await add_performer_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function edit_performer (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await edit_performer_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function delete_performer (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await delete_performer_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function get_service_category (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        let data = await get_service_category_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function add_service_category (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await add_category_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function edit_service_category (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await edit_category_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function delete_service_category (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await delete_category_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function get_service_subcategory (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        let data = await get_service_subcategory_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function add_service_subcategory (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await add_subcategory_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function edit_service_subcategory (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await edit_subcategory_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function delete_service_subcategory (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = createBind(req)

        await delete_subcategory_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: 'OK'
        }
        next()
    } catch (error) {
        log.info(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}