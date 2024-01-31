import express from 'express';
import axios from 'axios';
import config from '../config/config'
import log from '../config/logger'
import createBind from '../utils/create-bind';
import { lov_post_db } from '../db_apis/lov';
import moment from 'moment'

axios.defaults.timeout = 15000;
const headers: any = {
    Authorization: `${config.get('rest:Auth_key')}`,
    "Content-Type": "application/json"
}

export {
    get_order_types,
    get_order
}

async function get_order_types(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let {data: result}: any = await axios.get(config.get('rest:getOrderTypes'), {headers}).catch(error => {
            let errorText
            if (error.response) {
                errorText = 'Возвращена ошибка при получении типов приказов с 1С (код ответа '+error.response.status+')'
            } else {
                errorText = 'Возвращена ошибка при получении типов приказов с 1С ('+typeof error == 'object' ? JSON.stringify(error) : error+')'
            }

            lov_post_db({
                table_name: 'app.integration_log',
                code: 'rest-getordertypes-error',
                invoke_date: new Date().toISOString(),
                error_data: errorText,
            })

            throw errorText
        })

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        log.error(`Error in get_order_types -> ${JSON.stringify(error)}`)
        next(error);
    }
}

async function get_order(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind = createBind(req)

        let {data: result}: any = await axios.get(`${config.get('rest:getOrder')}/123123123123`, {headers}).catch(error => {

                        let errorText
            if (error.response) {
                errorText = 'Возвращена ошибка при получении приказов с 1С (код ответа '+error.response.status+')'
            } else {
                errorText = 'Возвращена ошибка при получении приказов с 1С ('+typeof error == 'object' ? JSON.stringify(error) : error+')'
            }

            lov_post_db({
                table_name: 'app.integration_log',
                code: 'rest-getorder-error',
                invoke_date: new Date().toISOString(),
                request_data: bind.iin,
                error_data: errorText,
            })

            throw errorText
        })

        result.sort(function (a : any, b : any) {
            let day_b : any = moment(b.date, 'DD.MM.YYYY HH:mm:ss').toDate();
            let day_a : any = moment(a.date, 'DD.MM.YYYY HH:mm:ss').toDate();
            return day_b - day_a;
        });

                res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        log.error(`Error in get_order -> ${JSON.stringify(error)}`)
        next(error);
    }
}