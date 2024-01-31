import express from 'express';
import {employee_get_db} from '../db_apis/employee/employee';
import {department_get_db} from '../db_apis/departament';
import createBind from '../utils/create-bind';

export async function search (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        let result: any = []
        if (bind.search_dep && Boolean(JSON.parse(bind.search_dep))) {
            result = await department_get_db(bind);
        } else {
            result = await employee_get_db(bind);
        }

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    }
}