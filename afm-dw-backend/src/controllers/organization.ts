import express from 'express';
import {organization_get_db} from '../db_apis/organization';
import createBind from '../utils/create-bind';

export async function organization_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

                let result: any = [];
        const bind: any = createBind(req);

        result = await organization_get_db(bind);

         res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error);
    }
}
