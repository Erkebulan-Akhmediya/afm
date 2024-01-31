// @ts-nocheck
import express from 'express';
import log from '../config/logger';
import { request_update_external_id, request_put_external_request_db,request_characteristic_get_db, request_details_get_catalog_db, request_details_get_list_db, request_edit_put_db, request_get_db, request_get_subordinates_db, request_post_db, request_put_by_approve_id_db, request_put_db, request_delete_db} from '../db_apis/request';
import {request_approve_get_db, request_approve_post_db} from '../db_apis/request_approve';
import {get_approve_employee_list} from '../db_apis/request_approve_rules';
import {employee_get_db, get_employee_from_position, get_employee_from_manager} from '../db_apis/employee';
import {getOrganizationByGuid, getRootDepartmentPath, get_parent_department} from '../db_apis/departament';
import createBind from '../utils/create-bind';
import axios from 'axios'
import config from '../config/config'
import get_client from '../loaders/database';
import { approve_request_create_db, approve_request_item_create_db, approve_request_put_db, approve_request_rel_create_db, approve_start, deactivate_approve_request, deactivate_approve_request_by_creator } from '../db_apis/approve';
import { create_notification_in_bc } from './notification';
import { lov_get_db, lov_post_db } from "../db_apis/lov";
import { pass_request_file_post_db } from '../db_apis/file';
import { post_file } from '../utils/file-api';
import { eventIdGetByGuid, event_post_db, event_put_db } from '../db_apis/event';
import { Client as MinioClient } from 'minio';
import { servicerequest_change_status_db } from '../db_apis/servicerequest';
require('../utils/ru.morpher.min')
const minioClient = new MinioClient(config.get('file'));
const moment = require('moment');

export async function employee_affordable_vacation_get(bind:any, logServiceId:any) {
    try{

        const headers: any = {
            Authorization: `${config.get('rest:Auth_key')}`,
            "Content-Type": "application/json"
        }
        const url = `${config.get('rest:employee_affordable_vacation')}${bind.identification_number}`

        var {data: {[0]: result}}: any = await axios.get(url, {headers}).catch(error => {
            let errorText
            if (error.response) {
                errorText = 'Возвращена ошибка при получении дней отпуска с 1С (код ответа '+error.response.status+(error.response.data ? ', '+error.response.data : '')+')'
            } else {
                errorText = 'Возвращена ошибка при получении дней отпуска с 1С ('+typeof error == 'object' ? JSON.stringify(error) : error+')'
            }

            lov_post_db({
                table_name: 'app.integration_log',
                code: 'rest-employee_affordable_vacation',
                request_data: bind.identification_number,
                invoke_date: new Date().toISOString(),
                error_data: errorText,
            })

            throw errorText
        })

        result.days = 0

        result.bonus_days = 0

        result.short_days = 0

        result.ecology_days = 0


        for(let i of result.vacation_reserve) {
            if (i.vacation_type.guid == '0cf5c43c-c75a-11ea-80d4-98f2b3ecb797'){
                result.days += i.days
            } 
            if (i.vacation_type.guid == '1cd7cfe0-fc18-11ec-9402-000c290cc0fc'){
                result.bonus_days += i.days
            } 
            if (i.vacation_type.guid == '966e0de8-ba1a-11ec-9401-000c290cc0fc'){
                result.short_days += i.days
            } 
            if (i.vacation_type.guid == '0cf5c43b-c75a-11ea-80d4-98f2b3ecb797'){
                result.ecology_days += i.days
            } 
        }

        return result


    } catch(err){
        log.error(err)
        throw(err)
    }
}

export async function employee_affordable_vacation(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        let result = await employee_affordable_vacation_get(bind, req.body.logServiceId)

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } 
}


export async function request_characteristic_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req);

        let characteristics = await request_characteristic_get_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: characteristics
        }

        next()
    } catch (err) {
        log.error(`Error in request_characteristic_get -> ${JSON.stringify(err)}`)
        next(err)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        const requests = await request_get_db(bind);

               res.locals.data = {
            statusCode: 200,
            data: requests
        }

        next();
    } catch (error) {
        log.error(error)
        next(error)
    }
}

export async function request_delete (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        await request_delete_db(bind);

        res.locals.data = {
            statusCode: 204
        }

        next();
    } catch (error) {
        log.error(error)
        next(error)
    }
}

export async function request_delete (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        await request_delete_db(bind);

        res.locals.data = {
            statusCode: 204
        }

        next();
    } catch (error) {
        console.error(error)
        next(error)
    }
}

export async function generateApproveRank (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req);
        log.info('1C accepting generateApproveRank: '+JSON.stringify(bind))

        client = get_client(); await client.connect();
        await client.query('BEGIN');

        let get_1c_username = await lov_get_db({table_name: 'ref.sys_all_const', name: '1СUserName'});

        if(!bind.data.table_approve_employee || bind.data.table_approve_employee.length == 0) {
            throw 'Не найден объект, либо нет данных в массиве table_approve_employee'
        }
        let getApproverId, approverList = []
        for (const approver of bind.data.table_approve_employee) {
            getApproverId = (await lov_get_db({table_name: 'hr.employee', external_id: approver.guid}));

            if (getApproverId.data.length != 1) {
                throw 'Не найден hr.employee (согласующий) в колличестве 1 записи по external_id '+approver.guid
            }

            approverList.push(getApproverId.data[0].id)
        }

        const employees = bind.data.employees
        for (const employee of employees) {
            let {data: get_current_rank} = await lov_get_db({table_name: 'ref.rank', external_id: employee.current_rank, lang: 'rus'});
            if (get_current_rank.length != 1) {
                throw 'Не найден ref.rank (current_rank) в колличестве 1 записи по external_id '+employee.current_rank
            }
            let {data: get_next_rank} = await lov_get_db({table_name: 'ref.rank', external_id: employee.rank, lang: 'rus'});
            if (get_next_rank.length != 1) {
                throw 'Не найден ref.rank (rank) в колличестве 1 записи по external_id '+employee.rank
            }
            let {data: get_employee} = await lov_get_db({table_name: 'hr.employee', external_id: employee.guid});
            if (get_employee.length != 1) {
                throw 'Не найден hr.employee (получатель звания) в колличестве 1 записи по external_id '+employee.guid
            }
            if (!employee.current_rank_date) {
                throw 'Не найден параметр current_rank_date в массиве employees'
            }
            if (!employee.planned_date) {
                throw 'Не найден параметр planned_date в массиве employees'
            }
            if (!employee.date) {
                throw 'Не найден параметр date в массиве employees'
            }
            let current_rank_date = employee.current_rank_date.split(" ")[0];
            let planned_date = employee.planned_date.split(" ")[0];
            let date = employee.date.split(" ")[0];

            let data = {
                request_type_id: 3 ,
                request_sub_type_id: 11,
                employees: [
                    {
                        id: get_employee[0].id
                    }
                ],
                user_name: get_1c_username.data[0].description,
                details: [
                    {
                        characteristic_id: 33,
                        value: [ get_current_rank[0].id ]
                    },{
                        characteristic_id: 34,
                        value: [ get_next_rank[0].id ]
                    },{
                        characteristic_id: 35,
                        value: [ date ]
                    },{
                        characteristic_id: 36,
                        value: [ employee.type_rank ]
                    },{
                        characteristic_id: 10,
                        value: [ planned_date ]
                    },{
                        characteristic_id: 30,
                        value: [ current_rank_date ]
                    }
                ]
            }

            bind.request_id = await request_post_db(Object.assign({}, data, req.userinfo), client);
            await request_put_external_request_db(bind.request_id, bind.data.guid, client);

            bind.user_id = get_1c_username.data[0].const_value;
            bind.user_name = get_1c_username.data[0].description;
            bind.is_project = false

            let id = await approve_request_create_db(bind, client, -1)
            await approve_request_rel_create_db(bind, client, id, 'REQUEST', bind.request_id )

                        for (const approverId of approverList) {
                await approve_request_item_create_db(bind,client,id, { ar_item_type_id: 1, orders: 1, approver_id: approverId })
            }

            await approve_start(client, id);
        }

        await client.query('COMMIT');

                res.locals.data = {
            statusCode: 200,
            data: {
                status: 'success',
                requestId: bind.request_id
            }
        }
        next();
    } catch (error) {
        log.error('Get error in generateApproveRank -> ')
        log.error(error)

        res.locals.data = {
            statusCode: 400,
            data: {"message": error}
        }
        next()
        if(client) {
            await client.query('ROLLBACK')
        }
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function generateApproveTimesheet (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req);
        log.info('1C accepting generateApproveTimesheet: '+JSON.stringify(bind))

        client = get_client(); await client.connect();
        await client.query('BEGIN');

        let {data: get_approver_employee} = await lov_get_db({table_name: 'hr.employee', external_id: bind.data.approve_employee.guid});
        if (get_approver_employee.length != 1) {
            throw 'Не найден hr.employee (согласующий) в колличестве 1 записи по external_id '+bind.data.approve_employee.guid
        }
        let {data: get_1c_username} = await lov_get_db({table_name: 'ref.sys_all_const', name: '1СUserName'});

        let data = {
            request_type_id: 9 ,
            request_sub_type_id: 19,
            employees: [
                {
                    id: get_approver_employee[0].id
                }
            ],
            user_name: get_1c_username[0].description,
            details: []
        }

                bind.request_id = await request_post_db(Object.assign({}, data, req.userinfo), client);

        await request_put_external_request_db(bind.request_id, bind.data.guid, client);

        bind.user_id = get_1c_username[0].const_value;
        bind.user_name = get_1c_username[0].description;
        bind.is_project = false

        let id = await approve_request_create_db(bind, client, -1)
        await approve_request_rel_create_db(bind, client, id, 'REQUEST', bind.request_id )
        await approve_request_item_create_db(bind,client,id, { ar_item_type_id: 1, orders: 1, approver_id: get_approver_employee[0].id })
        await approve_start(client, id);

        let dataFile: any = await pass_request_file_post_db({
            body: {
                file_type_id: 11,
                user_id: get_1c_username[0].description
            },
            file: {
                originalname: bind.data.file_name,
            }
        }, client, bind.request_id)

        await post_file({
            body: {
                fileType: 'request',
            },
            file: {
                originalname: bind.data.file_name,
                buffer: Buffer.from(bind.data.file_data, 'base64')
            }
        }, dataFile.id, null, true);

                await client.query('COMMIT');

        res.locals.data = {
            statusCode: 200,
            data: {
                status: 'success',
                requestId: bind.request_id
            }
        }
        next();
    } catch (error) {
        log.error('Get error in generateApproveTimesheet: '+JSON.stringify(error))

        res.locals.data = {
            statusCode: 400,
            data: {"message": error}
        }
        next()
        if(client) {
            await client.query('ROLLBACK')
        }
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_deactivate (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: any
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        await client.query(`BEGIN`)

        await request_put_by_approve_id_db(bind.approve_request_id, 3, client)


        await deactivate_approve_request_by_creator(client, bind.approve_request_id)

        res.locals.data = {
            statusCode: 204
        }
        await client.query('COMMIT')

        next()
    } catch (error) {
        log.error(`Error in request_deactivate -> ${JSON.stringify(error)}`)
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_submit_for_revision (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        await client.query(`BEGIN`)



        await request_put_by_approve_id_db(bind.approve_request_id, 0, client)


        await deactivate_approve_request(client, bind.approve_request_id, bind.ar_item_id, bind.comment)

        let { rows: {[0]: {create_user_id, object_name}}} = await client.query(`select ar.create_user_id, arr.object_name from hr.approve_request ar, hr.approve_request_rel arr where ar.id = ${bind.approve_request_id} and arr.approve_request_id = ar.id`)


        if (bind.object_name == 'SERVICE_REQUEST' ) {
        await servicerequest_change_status_db(
            {
            sr_status_id: 9,
            current_sr_status_id: 7,
            id: bind.object_id,
            performer_user_id: '',
            user_id: bind.user_id,
            sr_category_id: bind.object_info.sr_category_id,
            }
        )
        }

        res.locals.data = {
            statusCode: 204
        }
        await client.query('COMMIT')

        next()
    } catch (error) {
        log.error(`Error in request_submit_for_revision -> ${JSON.stringify(error)}`)
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_get_subordinates (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        const requests = await request_get_subordinates_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: requests
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function request_generate_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect();
        await client.query('BEGIN');
        const bind : any= createBind(req)
        bind.id = bind.employeeid

        bind.requestId = await request_post_db(Object.assign({}, req.body, req.userinfo), client);

        res.locals.data = {
            statusCode: 201,
            data: bind.requestId
        }
        await client.query('COMMIT');
        next()
        return
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function request_details_get_catalog (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect();
        const bind : any= createBind(req)


        let details_list = await request_details_get_catalog_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: details_list
        }
        next()
    } catch (error) {
        log.error(`Error in request_details_get_catalog -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function request_details_get_list (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect();
        const bind : any= createBind(req)

        let details_list = await request_details_get_list_db(bind, client)

        res.locals.data = {
            statusCode: 200,
            data: details_list
        }
        next()
        return
    } catch (error) {
        log.error(`Error in request_details_get_list -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_edit_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect();
        const bind : any= createBind(req)

        await request_edit_put_db(bind, client)

        res.locals.data = {
            statusCode: 204
        }
        next()
        return
    } catch (error) {
        log.error(`Error in request_edit_put -> ${JSON.stringify(error)}`)
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_send_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect();
        await client.query('BEGIN')


        const bind : any= createBind(req)
        await approve_request_put_db(bind.approve_request_id, client, 1)
        await approve_start(client, bind.approve_request_id)

        res.locals.data = {
            statusCode: 204
        }
        await client.query('COMMIT');
        next()
        return
    } catch (error) {
        log.error(`Error in request_send_post -> ${JSON.stringify(error)}`)
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function request_get_status (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

        res.locals.data = {
            statusCode: 200,
            data: 'requests'
        }
        let request = await axios.post(`${config.get('rest:getRequestStatus')}`, {Request_Id: 1})
        next()
    } catch (error) {
        next(error)
    }
}

function removeDetailsFromPosition (full_position_name: string): string {
    let index: nubmer = full_position_name.indexOf('уководител')
    if (index == -1) return full_position_name

    return full_position_name.substring(0, index + 11)
}

export async function externalDocumentProcessing (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req);

        let declension = new Declension()
        client = get_client(); await client.connect();

        let currentDate = new Date().toISOString()
        let publishDate = new moment(bind.data.date, 'DD.MM.YYYY hh:mm:ss').toISOString()
        let eventDate = new moment(bind.data.employee.date, 'DD.MM.YYYY').toISOString()

        const allowed = ['уководител', 'редседател']
        let contains = false
        allowed.map((item) => {
            if (bind.data.employee.Position.NameRus.includes(item)) {
                contains = true;
            }
        })
        if(!contains){
            res.locals.data = {
                statusCode: 200,
                data: {
                    status: 'success',
                }
            }

            next();
            return;
        }
        log.info('1C accepting externalDocumentProcessing: '+JSON.stringify(bind))
        client = get_client(); await client.connect();


        let body_rus = ''
        let body_kaz = ''

        if (bind.data.employee.Department.NameRus == 'Руководство') {

            let org = await getOrganizationByGuid(client, bind.data.organization.guid)

            let org_name_rus = org.name_rus

            let position_name = removeDetailsFromPosition(bind.data.employee.Position.NameRus)

            body_rus = '<p>' + bind.data.employee.employee + ' - ' + position_name + ' ' +  declension.parse(org_name_rus.replace('РГУ', 'Департамент экономических расследований')).getForm(Case.Gen, false)  +'</p>'
            body_kaz = '<p>' + bind.data.employee.employee + ' - ' + position_name + ' ' +  declension.parse(org_name_rus.replace('РГУ', 'Департамент экономических расследований')).getForm(Case.Gen, false)  +'</p>'
        } else {

            let fullDepartmentPath = await getRootDepartmentPath(client, bind.data.employee.Department.Guid)

            let org_name = fullDepartmentPath.path.replace('РГУ', 'Департамент экономических расследований').replace('Государственное управление РК', 'Агенство Республики Казахстан по финансовому мониторингу')
            let organization = org_name.split(', ')
            organization.forEach((item, index, array)=> {
                array[index] = declension.parse(array[index]).getForm(Case.Gen, false)
            })

            org_name = organization.join(', ')

            let position_name = removeDetailsFromPosition(bind.data.employee.Position.NameRus)

            body_rus = '<p>' + bind.data.employee.employee + ' - ' + position_name + ' ' + org_name +'</p>'
            body_kaz = '<p>' + bind.data.employee.employee + ' - ' + position_name + ' ' + org_name +'</p>'
        }

        let docTypeText = bind.data.doc_type == 1 ? 'О приеме на работу: ' : 'О кадровом перемещении: '

        let eventId = await eventIdGetByGuid(client, bind.data.guid, bind.data.employee.guid)

        if (eventId) {
            await event_put_db({
                id: eventId,
                event_type_id: 3,
                event_status_id: 1,
                event_priority_type_id: 2,
                title_rus: docTypeText + bind.data.employee.employee,
                body_rus: body_rus,
                title_kaz: docTypeText + bind.data.employee.employee,
                body_kaz: body_kaz,
                display_order: 1,
                event_date: eventDate,
                publish_date: eventDate,
                user_name: '1CUSER',
                docGuid: bind.data.guid,
                employeeGuid: bind.data.employee.guid,
            }, client)
        } else {
            eventId = await event_post_db({
                event_type_id: 3,
                event_status_id: 1,
                event_priority_type_id: 2,
                title_rus: docTypeText + bind.data.employee.employee,
                body_rus: body_rus,
                title_kaz: docTypeText + bind.data.employee.employee,
                body_kaz: body_kaz,
                display_order: 1,
                event_date: eventDate,
                publish_date: eventDate,
                user_name: '1CUSER',
                docGuid: bind.data.guid,
                employeeGuid: bind.data.employee.guid,
            }, client)
        }


        res.locals.data = {
            statusCode: 200,
            data: {
                status: 'success',
                recordId: eventId
            }
        }

        next();
    } catch (error) {
        log.error(error)
        log.error('Get error in externalDocumentProcessing: '+JSON.stringify(error))

        res.locals.data = {
            statusCode: 400,
            data: {"message": error}
        }
        next()
        if(client) {
            await client.query('ROLLBACK')
        }
    } finally {
        if (client) {
            await client.end()
        }
    }
}