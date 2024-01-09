import jwt from 'jsonwebtoken';
import config from '../config/config'
import express from 'express';
import log from '../config/logger';

export  async function auth (req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
    try {
        if (req.method === 'OPTIONS') {
            console.log('-------------- auth OPTIONS method')
            next()
        }

                if (req.url.indexOf('/auth/login') != -1 
            || req.url.indexOf('/auth/refresh') != -1 
            || req.url.indexOf('/soap/employee') != -1  
            || req.url.indexOf('/media') != -1 
            || req.url.indexOf('/app/config') != -1
            || req.url.toUpperCase().indexOf('/EXTERNAL/') != -1
            || req.url.indexOf('/feedback/quest') != -1
            || req.url.indexOf('/feedback/contacts') != -1
            ) {
            return next() 
        }

                if (req.headers.authorization) {
            const payload: string = req.headers.authorization.split(' ')[1];
            req.userinfo = await verifyToken(payload, config.get('jwt:secret-key-jwt'))
            next()
        } else {
            throw 'Пользователь не авторизован (noDataAuthorization)'
        }
    } catch (error) {
        log.error(`Error in auth -> ${JSON.stringify(error)}`)
        res.status(401).json({message: 'Не пройдена сверка авторизации. ' + (typeof error == 'object' ? JSON.stringify(error) : error)})
    }
}

async function verifyToken(payload : any, secretKey : any){
    return new Promise((resolve,reject) =>
       jwt.verify(payload,secretKey,(err : any, decoded : any) => err ? reject(err) : resolve(decoded))
    );
}