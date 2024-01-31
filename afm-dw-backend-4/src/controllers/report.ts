import express from 'express';
import createBind from '../utils/create-bind';
import {report_get, ind_report_get, ind_report_detail_get} from '../db_apis/report';

export async function get_report (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const reports = await report_get(bind);

        res.locals.data = {
            statusCode: 200,
            data: reports
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_ind_report (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const reports = await ind_report_get(bind);

        res.locals.data = {
            statusCode: 200,
            data: reports
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_ind_report_detail (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const reports = await ind_report_detail_get(bind);

        res.locals.data = {
            statusCode: 200,
            data: reports
        }

        next();
    } catch (error) {
        next(error)
    }
}