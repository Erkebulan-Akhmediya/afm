import express from 'express';
import { Client } from 'pg';
import {request_approve_get_db, get_request_approve_from_id, request_approve_put_db} from '../db_apis/request_approve';
import {request_put_db} from '../db_apis/request';
import createBind from '../utils/create-bind';
import config from '../config/config'
import axios from 'axios'
import get_client from '../loaders/database';
import { employee_get_db } from '../db_apis/employee/employee';
axios.defaults.timeout = 10000;

export async function request_approve_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind = createBind(req)
        const request_approve = await request_approve_get_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: request_approve
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function request_approve_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

                client = get_client(); await client.connect();
        console.time('createSendto1C')
        await client.query('BEGIN')
        const bind: any = createBind(req)

        const rules = await get_request_approve_from_id(bind, client)

        let thisApprove = rules.find((item: any) => item.id == bind.request_approve_id)
        let nextApprove = rules.filter((item: any) => item.orders == thisApprove.orders + 1)

        thisApprove.request_approve_status_id = bind.isapprove ? 1 : 2
        thisApprove.comment = bind.approvecomment

        let updateBind = {
            request_approve_status_id: thisApprove.request_approve_status_id,
            approvecomment: bind.approvecomment,
            id: bind.request_approve_id
        }
        await request_approve_put_db(updateBind, client)

        if(nextApprove.length && bind.isapprove) {
            let updateBind = {
                request_approve_status_id: 3,
                approvecomment: '',
                id: nextApprove[0].id
            }
            await request_approve_put_db(updateBind, client)
        } else {
            let approvers = await Promise.all(rules.map(async (item: any) => {
                let {0: employee} = await employee_get_db({id: item.approver_id, lang: bind.lang + ''})
                return {
                    Identification_Number: employee.identification_number,
                    Approve_Status_Id: item.request_approve_status_id,
                    Comment: item.comment
                }
            }))

            let isApprove = rules.filter((item: any) => item.request_approve_status_id == 2)

            let requestStatus = isApprove.length || !bind.isapprove ? 3 : 2
            await request_put_db(bind.id, requestStatus, client)

            const sendObj = {
                Request_Id: bind.id,
                Request_Type_Id: bind.request_type_id,
                Request_Sub_Type_Id: bind.request_sub_type_id,
                Identification_Number: bind.identification_number,
                BIN: bind.bin,
                Date_From: new Date(bind.date_from + '.000Z'),
                Date_To: new Date(bind.date_to + '.000Z'),
                Comment: bind.comment,
                Approvers: approvers,
                Attributes:[{
                    Attribute_Id: 1,
                    Key: "reason_for_absenteeism",
                    Value: "73008842-a023-11eb-8109-005056a6c6b7",
                }],
            }

            let headers: any = {
                Authorization: `${config.get('rest:Auth_key')}`,
                "Content-Type": "application/json"
            }

            console.timeEnd('createSendto1C')

            console.time('send1C_Request')
            let result = await axios.post(`${config.get('rest:AFM_Request')}`, sendObj, {headers}).catch((error) => {
                console.log(error)
                throw error.response.data.errMsg
            })
            console.timeEnd('send1C_Request')
        }

                await client.query('COMMIT');
        res.locals.data = {
            statusCode: 200,
            data: `rules`
        }
        next()
        return
    } catch (error: any) {
        console.log(error)
        if(client) {
            await client.query('ROLLBACK')
        }
        next({message: error})
    } finally {
        if (client) {
            await client.end()
        }
    }
}