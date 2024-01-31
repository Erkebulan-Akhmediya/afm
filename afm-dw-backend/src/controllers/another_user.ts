import express from 'express';
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import bcrypt from 'bcryptjs';
import {user_create, user_get} from '../db_apis/user';
import {user_role} from '../db_apis/user_role';
import { anotherUserCreate, performerUserGet, anotherUserUpdate } from '../db_apis/another_user';
import { Client } from 'pg';

export async function create_another_user (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);

        const checkUserByUsername: any = await user_get({username: bind.login})
        if (checkUserByUsername) {
            return res.status(400).json({message: 'Пользователь с таким логином существует.'})
        }
        const employee_id = await anotherUserCreate(bind, client);
        const passwordHash = await bcrypt.hash(bind.password, 12);
        await user_create({employeeId: employee_id, login: bind.login, password: passwordHash, username: bind.user_name})
            .catch(e => { throw `Oшибка создания пользователя : ${e.message}` });
        await user_role({user_id: employee_id, role_id: 51, username: bind.user_name}) 
            .catch(e => { throw `Oшибка создания роли пользователя : ${e.message}` });

                    res.locals.data = {
            statusCode: 201
        }
        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }

}

export async function update_another_user (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);

        const employee_id = await anotherUserUpdate(bind, client);

                res.locals.data = {
            statusCode: 201,
            data: {id: employee_id}
        }
        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function get_performer_user (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        const data = await performerUserGet(client);

                    res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }

}