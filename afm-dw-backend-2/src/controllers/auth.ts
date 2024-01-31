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
import {employee_create, employee_education_create, employee_work_list_create, employee_crime_create, employee_language_create, employee_sport_create, employee_fine_create, employee_adgs_create} from '../db_apis/employee/employee'
import {user_role, change_role, change_password} from '../db_apis/user_role';
import {user_refresh_token_get, user_refresh_token_put, user_refresh_token_post} from '../db_apis/user_refresh_token';
import {user_get, user_create, user_role_get, get_app_config, user_new_get, temp_ldap_password_put} from '../db_apis/user'

import log from '../config/logger'

//export async function userRegister (req: express.Request, res: express.Response, next: express.NextFunction){
export async function userRegister (req: express.Request, res: express.Response, next: express.NextFunction){
    let client: Client | null = null
    try {
        const bind: any = createBind(req);
        // console.log(bind);
        client = get_client(); await client.connect();

        const temp_users: any = await user_new_get({username: bind.username})

        // console.log('123456789');

        if (temp_users.length > 1) {
            return res.status(403).json({message: 'Некорректно определен пользователь, обратитесь к администратору'})
        }

        if (temp_users.length > 0) {
            return res.status(400).json({message: `Пользователь с таким 'username' уже существует`})
        }

        const passwordHash = await bcrypt.hash(bind.password, 12);

        if(bind.middle_name===""){
            bind.middle_name=""
        }
        
        if(bind.gender==="Male" || bind.gender==="male" ){
            bind.gender_id = 1
        }else{
            bind.gender_id = 2
        }

        const employee : any = await employee_create({apply_target: bind.apply_target, military_duty: bind.military_duty, is_married: bind.is_married ,last_name: bind.lastname,gender_id: bind.gender_id ,nationality: bind.nationality,first_name:bind.firstname, middle_name:bind.middlename, identification_number:bind.identification_number, birth_date:bind.birth_date, citizen: bind.citizen, address: bind.address, phone_number: bind.phone_number, birthplace: bind.birthplace, other_information: bind.other_information})

        if(bind.educations){
            for(const education of bind.educations){
                    await employee_education_create({employee_id:employee[0].id, diploma_series:bind.diploma_series,diploma_number: bind.diploma_number,institute: education.institute, major: education.major, date_from: education.date_from, date_to: education.date_to, education_type: education.education_type, gpi: education.gpi})
                        .catch(e => { throw `ошибка внедрения образование : ${e.message}`})
            }
        }

        // console.log('123456789');

        if(bind.worklist){
            for(const work of bind.worklist){
                await employee_work_list_create({employee_id:employee[0].id, nameRU: work.nameRu, nameKZ: work.nameKZ, positionRU: work.positionRU, positionKZ: work.positionKZ, bin: bind.bin,date_from: work.date_from, date_to: work.date_to })
                    .catch(e => { throw `ошибка внедрения опыта работы : ${e.message}` })
            }
        }

        // .log('123456789');


        if(bind.languages){
            for(const lang of bind.languages){
                await employee_language_create({employee_id:employee[0].id, language: lang.language, knowledge_level: lang.knowledge_level})
                    .catch(e => { throw `ошибка внедрения знания языка : ${e.message}` })
            }
        }

        // console.log('123456789');

        if(bind.sports){
            for(const sport of bind.sports){
                await employee_sport_create({employee_id:employee[0].id, sportname: sport.sportname, level: sport.level})
                    .catch(e => { throw `ошибка внедрения спортивных достижений : ${e.message}` })
            }
        }

        // console.log('123456789');


        if(bind.adgs_test){
            for(const test of bind.adgs_test){
                await employee_adgs_create({employee_id:employee[0].id, name: test.name, result: test.result})
                    .catch(e => { throw `ошибка внедрения результатов АДГС тестирование : ${e.message}` })
            }
        }

        // console.log('123456789');

        // if(bind.crimes){    
        //     for(const crime of bind.crimes){
        //         await employee_crime_create({employee_id:employee[0].id, crime_id: crime.crime_id ,crime_status: crime.crime_status, employee_comment: crime.employee_comment})
        //             .catch(e => { throw `ошибка внедрения криминального прошлего : ${e.message}` })
        //     }
        // }

        // console.log('123456789');


        if(bind.certificates){
            for(const certificate of bind.certificates){

            }
        }

        // if(bind.certificates){
        //     for(const file of bind.certificates){
        //                 let data: any
        //         if(file) {
        //             console.log("====================================== TRYING TO UPLOAD FILE =======================================")
        //             data = await file_post_db_new({name:bind.name, file: bind.file, file_type_id: 29})
        //             await post_file(req, data.id, res)
        //         }
        //     }
        // }

        

        const t_user : any = await user_create({employeeId: employee[0].id, username: bind.username, password: passwordHash,})
            .catch(e => { throw `ошибка создания пользователя : ${e.message}` });
        await user_role({user_id: employee[0].id})
            .catch(e => { throw `Ошибка создания роли пользователя : ${e.message}` });

        const user :any = t_user.rows[0]

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

        // console.log('asd');

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
