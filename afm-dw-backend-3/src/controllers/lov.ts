import express from 'express';
import {lov_get_db, lov_post_db, lov_put_db} from '../db_apis/lov';
import createBind from '../utils/create-bind';

export async function lov_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const {data, total} = await lov_get_db(bind);

        res.set('Access-Control-Expose-Headers', 'total')
        res.set('total', total);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function lov_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    try { 
        const bind: any = createBind(req);      

        let updatedBind = JSON.parse(JSON.stringify(bind));
        if (updatedBind.role_id) {delete updatedBind.role_id;}
        if (updatedBind.role) {delete updatedBind.role;}
        if (updatedBind.iat) {delete updatedBind.iat;}
        if (updatedBind.lang_id) {delete updatedBind.lang_id;}
        if (updatedBind.lang) {delete updatedBind.lang;}

        if (!updatedBind.user_id) {
            throw 'Не определен user_id'
        } else {
            if(bind.table_name!='hr.employee_education') {
                updatedBind.create_user_id = updatedBind.user_id;
            updatedBind.update_user_id = updatedBind.user_id;
            }

                        delete updatedBind.user_id;
        }

        const entry_id = await lov_post_db(updatedBind);

        res.locals.data = {
            statusCode: 200,
            data: {
                id: entry_id.id
            }
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function lov_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);     

                let updatedBind = JSON.parse(JSON.stringify(bind));
        if (updatedBind.role_id) {delete updatedBind.role_id;}
        if (updatedBind.user_name) {delete updatedBind.user_name;}
        if (updatedBind.role) {delete updatedBind.role;}
        if (updatedBind.iat) {delete updatedBind.iat;}
        if (updatedBind.lang_id) {delete updatedBind.lang_id;}
        if (updatedBind.lang) {delete updatedBind.lang;}

        if (!updatedBind.id) {
            throw 'Не определен id'
        }

        if (!updatedBind.user_id) {
            throw 'Не определен user_id'
        } else {
            updatedBind.update_user_id = updatedBind.user_id;
            delete updatedBind.user_id;
        }

                await lov_put_db(updatedBind)

        res.locals.data = {
            statusCode: 200,
            data: {
                id: updatedBind.id
            }
        }

        next();
    } catch (error) {
        next(error)
    }
}