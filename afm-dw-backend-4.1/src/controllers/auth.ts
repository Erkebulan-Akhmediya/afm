import requestip from 'request-ip';
import { Client } from 'pg';
import jwt from 'jsonwebtoken';
import express from 'express';
import bcrypt from 'bcryptjs';
import config from '../config/config'
import get_client from '../loaders/database';
import * as crypto from 'crypto-js';
// @ts-ignore
import ActiveDirectory from "activedirectory";
import createBind from '../utils/create-bind';
import {file_post_db_new} from '../db_apis/file'
import {post_file} from '../utils/file-api'
import {employee_create,employee_status, employee_education_create,employee_achievement_create,employee_certificate_create, employee_work_list_create, employee_crime_create, employee_language_create, employee_sport_create, employee_fine_create, employee_adgs_create} from '../db_apis/employee/employee'
import {user_role, change_role, change_password} from '../db_apis/user_role';
import {user_refresh_token_get, user_refresh_token_put, user_refresh_token_post} from '../db_apis/user_refresh_token';
import {user_get, user_create, user_role_get, get_app_config, user_new_get, temp_ldap_password_put} from '../db_apis/user'
import {employee_sur_create} from '../db_apis/sur'
import log from '../config/logger'


export async function userRegister (req: express.Request, res: express.Response, next: express.NextFunction){
    let client: Client | null = null
    try {
        const bind: any = createBind(req);
        client = get_client(); await client.connect();

        const temp_users: any = await user_new_get({username: bind.username})

        if (temp_users.length > 1) {
            return res.status(403).json({message: 'Некорректно определен пользователь, обратитесь к администратору'})
        }

        if (temp_users.length > 0) {
            return res.status(400).json({message: `Пользователь с таким username уже существует`})
        }

        const passwordHash = await bcrypt.hash(bind.password, 12);

        

        //Valifation of Year
        let dateTo 
        let dateFrom
        let currentDate = new Date()
        let birthDate = new Date(bind.birth_date)
            for (const education of bind.educations) {
                if (education && education.date_to && education.date_from) {
                    dateTo = new Date(education.date_to)
                    dateFrom = new Date(education.date_from)
                    if (dateFrom > dateTo) {
                        return res.status(400).json({message: `Дата окончание не может быть равна или раньше чем дата поступление!`})
                    }
                }
            }
            for (const work of bind.worklist) {
                if (work && work.date_to && work.date_from) {
                    dateTo = new Date(work.date_to)
                    dateFrom = new Date(work.date_from)
                    if (dateFrom > dateTo) {
                        return res.status(400).json({message: `Дата окончание рабооты не может быть равна или раньше чем дата поступление!`})
                    }
                }
            }
            let age: number = currentDate.getFullYear() - birthDate.getFullYear();
            if (
                currentDate.getMonth() < birthDate.getMonth() ||
                (currentDate.getMonth() === birthDate.getMonth() &&
                currentDate.getDate() < birthDate.getDate())
            ) {
                age--;
            }
            if(age<18){
                return res.status(400).json({message: `Пользователь не может зарегистрироваться из-за ограничение по возрасту!`})
            }


        const user :any =await employee_create({apply_target: bind.apply_target, military_duty: bind.military_duty, is_married: bind.is_married ,last_name: bind.lastname,gender_id: bind.gender_id ,nationality: bind.nationality,first_name:bind.firstname, middle_name:bind.middlename, identification_number:bind.identification_number, birth_date:bind.birth_date, citizen: bind.citizen, address: bind.address, phone_number: bind.phone_number, birthplace: bind.birthplace, other_information: bind.other_information, educations: bind.educations, worklist: bind.worklist, languages: bind.languages, sports: bind.sports, username: bind.username, password: passwordHash, adgs_test: bind.adgs_test, crimes: bind.crimes, certifications: bind.certificatons, achivements: bind.achivements})
            .catch(e => { throw `Ошибка кандидата статуса пользователя : ${e.message}` });
        switch (user.auth_type_id) {
            case 1:
                const comparePassword = await bcrypt.compare(bind.password, user.password);
                if (!comparePassword) {
                    return res.status(403).json({message: 'Некорректный пароль'})
                }

                break;

                    case 2:
                bind.username = bind.username.trim().toLowerCase()

                const adAuthChecking : any = await adAuth(bind.username + '@' + config.get('active_directory:usernameDN'), bind.password);

                                if (!adAuthChecking.authConfirm) {
                    return res.status(403).json({message: 'Ошибка авторизации LDAP: '+adAuthChecking.errorText})
                }

                break;

            default:
                return res.status(403).json({message: 'Обратитесь к администратору системы, некорректно настроен пользователь'})
        }

        const userRoles: any = await user_role_get({id: user.id})
        if (!userRoles) {
            return res.status(403).json({message: 'У пользователя нет доступа'})
        }

        if (user.auth_type_id == 2) { 
            await temp_ldap_password_put({user_id: user.id, password_ldap: crypto.AES.encrypt(bind.password, 'secret-key').toString()})
        }

        const accessToken = await jwt.sign({user_id: user.id, user_name: user.username, role_id: userRoles.role_id, role: userRoles.role_name}, config.get('jwt:secret-key-jwt'))

        let refreshToken;
        const refresh_token = await user_refresh_token_get({id: user.id})
        const new_expire_date = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString()

                if (refresh_token) {
            if (new Date().getTime() > new Date(refresh_token.expire_date).getTime()) {
                await user_refresh_token_put({refreshToken, new_expire_date, id: user.id})
            }
            refreshToken = refresh_token.token
        } else {
            const clientIp = requestip.getClientIp(req)
            const userAgent = req.useragent;

                    refreshToken = await jwt.sign({user_id: user.id, user_name: user.username}, `${config.get('jwt:secret-key-jwt')}_refresh`, {expiresIn: '7d'})
            await user_refresh_token_post({id: user.id, clientIp, os: userAgent?.os, browser: userAgent?.browser, source: userAgent?.source, refreshToken, new_expire_date})
        }

        res.locals.data = {
            statusCode: 200,
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
                lang: user.language_name,
                lang_code: user.language_code,
                user_id: user.id,
                role_id: userRoles.role_id,
                role_name: userRoles.role_name
            }
        }

        next();

    } catch (error) {
        next(error);
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function userLogin (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req);
        client = get_client(); await client.connect();

        const temp_users: any = await user_new_get({username: bind.username})

        if (temp_users.length > 1) {
            return res.status(403).json({message: 'Некорректно определен пользователь, обратитесь к администратору'})
        }

        if (temp_users.length == 0) {
            return res.status(403).json({message: 'Пользователь не найден'})
        }

        const user :any = temp_users[0]

                if (user.is_fired) {
            return res.status(403).json({message: 'Пользователь уволен'})
        }
        if (!user.is_active) {
            return res.status(403).json({message: 'Пользователь деактивирован'})
        }

        switch (user.auth_type_id) {
            case 1:
                const comparePassword = await bcrypt.compare(bind.password, user.password);
                if (!comparePassword) {
                    return res.status(403).json({message: 'Некорректный пароль'})
                }

                break;

                    case 2:
                bind.username = bind.username.trim().toLowerCase()

                const adAuthChecking : any = await adAuth(bind.username + '@' + config.get('active_directory:usernameDN'), bind.password);

                                if (!adAuthChecking.authConfirm) {
                    return res.status(403).json({message: 'Ошибка авторизации LDAP: '+adAuthChecking.errorText})
                }

                break;

            default:
                return res.status(403).json({message: 'Обратитесь к администратору системы, некорректно настроен пользователь'})
        }

        const userRoles: any = await user_role_get({id: user.id})
        if (!userRoles) {
            return res.status(403).json({message: 'У пользователя нет доступа'})
        }

        if (user.auth_type_id == 2) { 
            await temp_ldap_password_put({user_id: user.id, password_ldap: crypto.AES.encrypt(bind.password, 'secret-key').toString()})
        }

        const accessToken = await jwt.sign({user_id: user.id, user_name: user.username, role_id: userRoles.role_id, role: userRoles.role_name}, config.get('jwt:secret-key-jwt'))

        let refreshToken;
        const refresh_token = await user_refresh_token_get({id: user.id})
        const new_expire_date = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString()

                if (refresh_token) {
            if (new Date().getTime() > new Date(refresh_token.expire_date).getTime()) {
                await user_refresh_token_put({refreshToken, new_expire_date, id: user.id})
            }
            refreshToken = refresh_token.token
        } else {
            const clientIp = requestip.getClientIp(req)
            const userAgent = req.useragent;

                    refreshToken = await jwt.sign({user_id: user.id, user_name: user.username}, `${config.get('jwt:secret-key-jwt')}_refresh`, {expiresIn: '7d'})
            await user_refresh_token_post({id: user.id, clientIp, os: userAgent?.os, browser: userAgent?.browser, source: userAgent?.source, refreshToken, new_expire_date})
        }


        res.locals.data = {
            statusCode: 200,
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
                lang: user.language_name,
                lang_code: user.language_code,
                user_id: user.id,
                role_id: userRoles.role_id,
                role_name: userRoles.role_name
            }
        }

        next();

    } catch (error) {
        next(error);
    } finally {
        if (client) {
            await client.end()
        }
    }
}

async function adAuth (username:string, password:string) {
    return new Promise(async (resolve) => {
        var adConfig = {
            url: config.get('active_directory:url'),
            baseDN: config.get('active_directory:baseDN')};
        var ad = new ActiveDirectory(adConfig);

                ad.authenticate(username, password, function (err: any, auth: any) {
            let authConfirm : any, errorText : any

            if (err) {
                log.error('adAuth error ('+username+','+password+'): ' + JSON.stringify(err));
                authConfirm = false
                errorText = JSON.stringify(err)

                return resolve({
                    authConfirm: authConfirm,
                    errorText: errorText
                })
            }

            if (auth) {
                authConfirm = true
            } else {
                log.error('LDAP authentication failed ('+username+','+password+')');
                authConfirm = false
                errorText = 'LDAP authentication failed!'
            }

            return resolve({
                authConfirm: authConfirm,
                errorText: errorText
            })
        });
    })
}

export async function userTokenRefresh (req: express.Request, res: express.Response, next: express.NextFunction) {
    const bind: any = createBind(req);
    if (!bind.refresh_token) {
        return res.status(403).end();
    }
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        if (req.headers.authorization) {
            const access_token: string = req.headers.authorization.split(' ')[1];
            jwt.verify(access_token, config.get('jwt:secret-key-jwt'), async function(err: any, result: any) {
                if (err) {

                    let refresh_token = await user_refresh_token_get({token: bind.refresh_token});

                    if (refresh_token && new Date().getTime() < new Date(refresh_token.expire_date).getTime()) {
                        jwt.verify(bind.refresh_token, `${config.get('jwt:secret-key-jwt')}_refresh`, async function(err: any, result: any) {
                            if (err) {
                                return res.status(403).end()
                            } else {
                                if (result.user_id == refresh_token.user_id) {
                                    const user: any = await user_get({username: result.user_name})
                                    const accessToken = await jwt.sign({user_id: user.id, user_name: user.username}, config.get('jwt:secret-key-jwt'), {expiresIn: config.get('jwt:expiresIn')})
                                    res.status(200).json({access_token: accessToken});
                                }
                            }
                        })
                    } else {
                        return res.status(403).end();
                    }
                }
            })
        } else {
            return res.status(403).end();
        }

    }  catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }

}

export async function appConfig (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        const result = await get_app_config(bind);

        if (result.length == 0) {
            return res.status(500).json({message: 'Не определена лицензионная конфигурация, обратитесь к разработчкам (код DW001)'})
        }

        if (result.length > 1) {
            return res.status(500).json({message: 'Ошибка настройки лицензионной конфигурации, обратитесь к разработчкам (код DW002)'})
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


