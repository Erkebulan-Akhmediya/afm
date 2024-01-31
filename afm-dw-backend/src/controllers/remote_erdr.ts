import express from 'express';
import { erdr_get } from '../db_apis/remote_erdr';
import createBind from '../utils/create-bind';
import axios from 'axios';
import config from '../config/config'

axios.defaults.timeout = 15000;
const headers: any = {
    Authorization: `${config.get('rest:Auth_key')}`,
    "Content-Type": "application/json"
}

export async function get_erdr (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        bind.employee_id = parseInt((bind as any).id, 10)
        const data = await erdr_get(bind);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next()
    } catch (error) {
        next(error)
    }
}

export async function get_age_limit (req: express.Request, res: express.Response, next: express.NextFunction) {

    try {
        const {data} = await axios.get(`http://93.170.73.60/afm/hs/afm_integration/reports/count_rank/bin=210240035161&dateend=20220501`, {headers})

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next()
    } catch (error) {
        next(error)
    }
}

export async function get_count_rank (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const {data} = await axios.get(`http://93.170.73.60/afm/hs/afm_integration/reports/age_limit_by_rank/bin=210240035161&datestart=20000101&dateend=20220501`, {headers})


        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next()
    } catch (error) {
        next(error)
    }
}