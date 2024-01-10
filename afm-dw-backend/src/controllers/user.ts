import express from 'express';
import createBind from '../utils/create-bind';
import bcrypt from 'bcryptjs';
import {user_get, user_create} from '../db_apis/user';
import {user_role, change_role, change_password} from '../db_apis/user_role';

export async function create_user (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        const checkUserById: any = await user_get({id: bind.employee_id})
        if (checkUserById) {
            return res.status(400).json({message: 'Пользователь на сотруднике существует.'})
        }

        const checkUserByUsername: any = await user_get({username: bind.login})
        if (checkUserByUsername) {
            return res.status(400).json({message: 'Пользователь с таким логином существует.'})
        }

        const passwordHash = await bcrypt.hash(bind.password, 12);

        await user_create({employeeId: bind.employee_id, login: bind.login, password: passwordHash, username: bind.user_name})
            .catch(e => { throw `ошибка создания пользователя : ${e.message}` });
        await user_role({user_id: bind.employee_id, role_id: req.body.role_id, username: bind.user_name})
            .catch(e => { throw `Ошибка создания роли пользователя : ${e.message}` });

                    res.locals.data = {
            statusCode: 201,
            data: {id: bind.employee_id}
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function change_user(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        if(req.body.role_list) {          
            await change_role(bind)
        }

        if (req.body.password) {
            const passwordBind = {
                password: await bcrypt.hash(req.body.password, 12),
                update_user: req.body.user_name,
                id: req.params.id
            }
            await change_password(passwordBind) 
        }


        res.locals.data = {
            statusCode: 201,
            data: {id: req.params.id}
        }

        next();
    } catch (error) {
        next(error)
    }
}