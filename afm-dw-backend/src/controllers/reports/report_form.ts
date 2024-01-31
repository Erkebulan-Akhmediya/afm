import express from 'express';
import { Client } from 'pg';
import get_client from '../../loaders/database';
import createBind from '../../utils/create-bind';
import { chapter_get_db, chapter_put_db, details_put_db, detail_get_db, report_full_form_create, report_form_full_get_db, report_form_get_db, report_put_db, report_form_create, chapter_create, details_create, period_get_db, rf_detail_delete_db, rf_chapter_delete_db, rf_item_delete_db, report_details_get_list_db, report_details_list_add_db, report_details_list_delete_db } from '../../db_apis/reports/report_form';
import log from '../../config/logger';

export async function report_form_full_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        let data = await report_form_full_get_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        log.error(`Error in report_form_full_get -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function report_details_list_delete(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        let data = await report_details_list_delete_db(bind, client)

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

export async function report_details_list_add(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        let data = await report_details_list_add_db(bind, client)

        res.locals.data = {
            statusCode: 201,
            data: data
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

export async function report_details_get_list(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        let data = await report_details_get_list_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
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

export async function detail_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)

        let data = await detail_get_db(bind)

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        log.error(`Error in detail_get -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function chapter_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)

        let data = await chapter_get_db(bind)

        res.locals.data = {
            statusCode: 200,
            data: data,
        }

        next();
    } catch (error) {
        log.error(`Error in chapter_get -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function report_form_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)

        let data = await report_form_get_db(bind)

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        log.error(`Error in report_form_get -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function report_full_form_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)    

        let id = await report_full_form_create(bind)

        res.locals.data = {
            statusCode: 200,
            data: id
        }

        next()
    } catch (error) {
        log.error(`Error in report_full_form_post -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function period_get (req: express.Request, res: express.Response, next: express.NextFunction)
{
    try {
        const bind: any = createBind(req)    

        let data = await period_get_db(bind)

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next()
    } catch (error) {
        log.error(`Error in period_get -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function report_form_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)    

        let id = await report_form_create(bind)

        res.locals.data = {
            statusCode: 200,
            data: id
        }

        next()
    } catch (error) {
        log.error(`Error in report_form_post -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function chapter_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)    

        let id = await chapter_create(bind)

        res.locals.data = {
            statusCode: 200,
            data: id
        }

        next()
    } catch (error) {
        log.error(`Error in chapter_post -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function details_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)    

        let id = await details_create(bind)

        res.locals.data = {
            statusCode: 200,
            data: id
        }

        next()
    } catch (error) {
        log.error(`Error in details_post -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function report_form_put (req: express.Request, res: express.Response, next: express.NextFunction)
{
    try {
        const bind: any = createBind(req)    

        await report_put_db(bind)

        res.locals.data = {
            statusCode: 204,
        }

        next()
    } catch (error) {
        log.error(`Error in report_form_put -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function chapter_put (req: express.Request, res: express.Response, next: express.NextFunction)
{
    try {
        const bind: any = createBind(req)    

        await chapter_put_db(bind)

        res.locals.data = {
            statusCode: 204,
        }

        next()
    } catch (error) {
        log.error(`Error in chapter_put -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function rf_item_delete (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req)    
        client = get_client(); await client.connect()

        await rf_item_delete_db(bind, client)

        res.locals.data = {
            statusCode: 204,
        }

        next()
    } catch (error) {
        log.error(`Error in rf_item_delete -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function rf_chapter_delete (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req)    
        client = get_client(); await client.connect()

        await rf_chapter_delete_db(bind, client)

        res.locals.data = {
            statusCode: 204,
        }

        next()
    } catch (error) {
        log.error(`Error in rf_chapter_delete -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function rf_detail_delete (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req)    
        client = get_client(); await client.connect()

        await rf_detail_delete_db(bind, client)

        res.locals.data = {
            statusCode: 204,
        }

        next()
    } catch (error) {
        log.error(`Error in rf_detail_delete -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function detail_put (req: express.Request, res: express.Response, next: express.NextFunction)
{
    try {
        const bind: any = createBind(req)    

        await details_put_db(bind)

        res.locals.data = {
            statusCode: 204,
        }

        next()
    } catch (error) {
        log.error(`Error in detail_put -> ${JSON.stringify(error)}`)
        next(error)
    }
}