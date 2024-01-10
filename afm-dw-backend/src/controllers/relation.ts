import express from 'express';
import { relation_create_db, relation_del_db, relation_edit_db, relation_get_db, relation_types_get_db } from '../db_apis/relation';
import createBind from '../utils/create-bind';

export async function get_relation_types (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await relation_types_get_db(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_relation (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await relation_get_db(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function post_relation (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await relation_create_db(bind);

               res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function del_relation (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        await relation_del_db(bind);

               res.locals.data = {
            statusCode: 204
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function put_relation (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        await relation_edit_db(bind);

               res.locals.data = {
            statusCode: 204
        }

        next();
    } catch (error) {
        next(error)
    }
}