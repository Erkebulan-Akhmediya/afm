import express from 'express';
import {know_base_get_db, know_base_post_db, know_base_put_db, know_base_delete_db, know_base_post_know_department, know_base_del_know_department} from '../db_apis/know_base';
import createBind from '../utils/create-bind';
import {file_post_db,file_put_db, file_del_db} from '../db_apis/file';
import {post_file} from '../utils/file-api';
import get_client from "../loaders/database";
import {employee_get_db} from '../db_apis/employee/employee';
import { Client } from 'pg';

export async function know_base_get(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);   
        let {0: empData} = await employee_get_db({id: req.userinfo.user_id, lang: bind.lang})
        let empDataAll: any = empData

        bind.empRole = empDataAll.role_id
        bind.department_id = empDataAll.department_id

        const sections = await know_base_get_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: sections
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function know_base_post(req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try { 
        client = get_client(); await client.connect();
        const bind:any =  createBind(req);
        for (let prop in bind) {
            if(bind[prop] === 'undefined') {
                bind[prop] = null
            }
        }

        if(bind.privatedepartments && JSON.parse(bind.privatedepartments) && JSON.parse(bind.privatedepartments).length) {
            bind.privatedepartments = JSON.parse(bind.privatedepartments)
        } else {
            bind.privatedepartments = [{id: -1}]
        }
        const sections = await know_base_post_db(bind, client);
        bind.new_know_id = sections
        req.body.object_id = sections

        if (req.files && req.files.file != undefined) {
            req.file = req.files.file[0]
        } else {
            req.file = null
        }

        if(req.file) {
            let dataFile: any = await file_post_db(req, client)
            await post_file(req, dataFile.id, res, false, true)
        }
        if(bind.privatedepartments) {
            bind.privatedepartments.map(async(department: any) => {
                if (client)
                await know_base_post_know_department(bind, department.id, client)
            })
        }
        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: sections
        }

        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK');
        }
        console.log(error)
        next(error)
    } finally {
        if (client) {
          await client.end();
        }
      }
}


export async function know_base_put(req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        const bind: any = createBind(req); 

                if(bind.privatedepartments) {
            bind.privatedepartments = JSON.parse(bind.privatedepartments)
        } else {
            bind.privatedepartments = [{id: -1}]
        }
        for (let prop in bind) {
            if(bind[prop] === 'undefined' || bind[prop] === 'null') {
                bind[prop] = null
            }
        }  
        client = get_client(); await client.connect();
        if(req.body.deleteFile && req.body.deleteFile !== 'undefined' && !bind.file_name){
            req.body.bind = bind
            req.body.object_id = bind.id
            await file_del_db(req, client)
        }

        if (req.files.file != undefined) {
            req.file = req.files.file[0]
        } else {
            req.file = null
        }

        if(req.file) {
            req.body.bind = bind
            req.body.object_id = bind.id

                        let dataFile: any = await file_put_db(req, client)
            await post_file(req, dataFile, res, false, true)
        }
        if(bind.privatedepartments) {
            await know_base_del_know_department(bind, client)
            bind.privatedepartments.map(async(department: any) => {
                if (client)
                await know_base_post_know_department(bind, department.id, client)
            })
        }
        const sections = await know_base_put_db(bind, client);
        req.body.object_id = sections
        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: sections
        }

        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK');
        }
        console.log(error)
        next(error)
    } finally {
        if (client) {
          await client.end();
        }
      }
}

export async function know_base_delete(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);   
        const sections = await know_base_delete_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: sections
        }

        next();
    } catch (error) {
        next(error)
    }
}