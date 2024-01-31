import express from 'express';
import {rating_test_get_db, rating_test_list_get_db, know_level_get_db, rating_active_get_db} from '../db_apis/rating';
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import log from '../config/logger';
import { Client } from 'pg';
export {getRatingTest, getKnowLevel, getRatingActive}

async function getRatingTest (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);
        const rating: any = await rating_test_get_db(bind, client)
        const tests: any = await rating_test_list_get_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: {rating, tests}
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

async function getKnowLevel (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);
        const rating: any = await know_level_get_db(bind, client)
        const tests: any = await rating_test_list_get_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: {rating, tests}
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

async function getRatingActive (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);
        const rating: any = await rating_active_get_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: rating
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