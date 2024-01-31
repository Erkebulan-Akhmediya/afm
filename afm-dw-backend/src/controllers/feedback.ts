import express from 'express';
import { Client } from 'pg';
import { feedback_contacts_get, feedback_create, feedback_get, feedback_update } from '../db_apis/feedback';
import get_client from '../loaders/database';
import createBind from '../utils/create-bind';



export async function create_feedback (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()
        let bind = createBind(req)

        let data = await feedback_create(bind)

        res.locals.data = {
            statusCode: 201,
            data: {id: data}
        }
        next()
    } catch (error) {
        next(error)
    } finally {
        if (client) 
            await client.end()
    }
}


export async function get_feedback (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()
        let bind = createBind(req)

       let feedbacks = await feedback_get(bind)

        res.locals.data = {
            statusCode: 200,
            data: feedbacks
        }
        next()
    } catch (error) {
        next(error)
    } finally {
        if (client) 
            await client.end()
    }
}


export async function put_feedback (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()
        let bind = createBind(req)

       await feedback_update(bind)

       res.locals.data = {
        statusCode: 204
    }
        next()
    } catch (error) {
        next(error)
    } finally {
        if (client) 
            await client.end()
    }
}


export async function get_feedback_contacts (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()
        let bind = createBind(req)

       let feedbacks = await feedback_contacts_get(bind)

        res.locals.data = {
            statusCode: 200,
            data: feedbacks
        }
        next()
    } catch (error) {
        next(error)
    } finally {
        if (client) 
            await client.end()
    }
}