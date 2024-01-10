import express from 'express';
import { Client } from 'pg';
import get_client from '../../loaders/database';
import createBind from '../../utils/create-bind';
import log from '../../config/logger';
import { detail_create_db, detail_delete_db, detail_edit_db, report_create, report_form_by_department_db, report_form_get_exist_db, report_full_get_db, report_get_db, report_get_xls_db, report_update } from '../../db_apis/reports/report';
import { report_form_full_get_db } from '../../db_apis/reports/report_form';
import { approve_request_create_db, approve_request_rel_create_db } from '../../db_apis/approve';

const contentDisposition = require('content-disposition')


export async function report_get_xls (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)
        let data = await report_get_xls_db(bind, client)

        res.setHeader('Content-disposition', contentDisposition(`${data.report_form_name} ${data.period_name}.xls`))
        data.stream.pipe(res)

    } catch (error) {
        log.error(`Error in report_get_xls -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function report_form_by_department (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)
        let data = await report_form_by_department_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next()

    } catch (error) {
        log.error(`Error in report_form_by_department -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function report_form_get_exist (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)
        let data = await report_form_get_exist_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next()

    } catch (error) {
        log.error(`Error in report_form_get_exist -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function report_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)    

        let data = await report_get_db(bind)

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next()
    } catch (error) {
        log.error(`Error in report_get -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function report_generate(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try{
        client = get_client(); await client.connect()
        const bind: any = createBind(req)       

        let form = await report_form_full_get_db(bind, client)

                bind.chapters = form[0].chapters

        let id = await report_create(bind, client)

        let approve_request_id:number = await approve_request_create_db(bind, client, -1)

        await approve_request_rel_create_db(bind, client, approve_request_id, 'REPORT_INSTANCE', id)


        res.locals.data = {
            statusCode: 200,
            data: id,
        }

        next()
    } catch (error) {
        log.error(`Error in report_generate -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function report_full_get(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

                const bind: any = createBind(req)

        let data = await report_full_get_db(bind)

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next()
    } catch (error) {
        log.error(`Error in report_full_get -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function report_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect()
        const bind: any = createBind(req)    

        let id = await report_create(bind, client)

        let approve_request_id:number = await approve_request_create_db(bind, client, -1)

        await approve_request_rel_create_db(bind, client, approve_request_id, 'REPORT_INSTANCE', id)

        res.locals.data = {
            statusCode: 200,
            data: id
        }

        next()
    } catch (error) {
        log.error(`Error in report_post -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function report_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req)    

        await report_update(bind)

        res.locals.data = {
            statusCode: 204,
        }

        next()
    } catch (error) {
        log.error(`Error in report_put -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function detail_delete (req: express.Request, res: express.Response, next: express.NextFunction) {
    try{
        const bind: any = createBind(req)

        await detail_delete_db(bind)

        res.locals.data = {
            statusCode: 204
        }

        next()
    } catch (error) {
        log.error(`Error in detail_delete -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function detail_edit (req: express.Request, res: express.Response, next: express.NextFunction) {
    try{
        const bind: any = createBind(req)

        await detail_edit_db(bind)

        res.locals.data = {
            statusCode: 204
        }
        next()
    } catch (error) {
        log.error(`Error in detail_edit -> ${JSON.stringify(error)}`)
        next(error)
    }
}

export async function detail_create (req: express.Request, res: express.Response, next: express.NextFunction) {
    try{
        const bind: any = createBind(req)

        let id = await detail_create_db(bind)

        res.locals.data = {
            statusCode: 201,
            data: id
        }
        next()
    } catch (error) {
        log.error(`Error in detail_create -> ${JSON.stringify(error)}`)
        next(error)
    }
}
