import express from 'express';
import cors from 'cors';
import useragent from 'express-useragent';
import bodyParser from 'body-parser';
import swaggerUI from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import * as crypto from 'crypto-js';

import log from '../config/logger';
import morganMiddleware from '../config/morgan'
import { routes } from './router';
import * as swaggerDocument from '../swagger.json';
import {language_get_db} from '../db_apis/language';

export const app:express.Application = express();

app.use(cookieParser())

app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.use(cors({origin: '*',}));

app.use(morganMiddleware);

app.use(bodyParser.json());
app.use(function(request: express.Request, response: express.Response, next: express.NextFunction) {
    response.header("Access-Control-Allow-Origin", '*');
    response.header("Access-Control-Expose-Headers", "Content-Disposition");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.contentType('application/json');
    next();
});

app.use(useragent.express())

app.use(async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (Object.keys(req.body).length && req.body.value) {
        let originalText = ''
        try {
            let bytes = crypto.AES.decrypt(req.body.value, 'secret-key');
            originalText = bytes.toString(crypto.enc.Utf8);
            if(originalText){
                req.body = JSON.parse(originalText);            
            }
        } catch (error) {
            log.error(error)
            log.error('with text ' + originalText)
        }
    }
    if (Object.keys(req.query).length && req.query.value) {
        let originalText = ''
        try {
            let bytes = crypto.AES.decrypt(String(req.query.value), 'secret-key');
            originalText = bytes.toString(crypto.enc.Utf8);
            if(originalText){
                req.query = JSON.parse(originalText);
            }
        } catch (error) {
            log.error(error)
            log.error('with text ' + originalText)
        }
    }

    if (!req.query.lang) {
        try {
            const lang = await language_get_db({default: 1}).catch(e => { throw e; });
            if (!Array.isArray(lang)) {
                req.lang = lang.code
                req.lang_id = lang.id
            }
        } catch (err) {
            log.error(`Ошибка при получение языка по умолчанию: ${(err as any).message} `);
        }
    } else {
        const lang = await language_get_db({lang_code: (req.query.lang as string).toUpperCase()}).catch(e => { throw e; });
        if (!Array.isArray(lang)) {
            req.lang_id = lang.id
            req.lang = req.query.lang
        }
    }

    next()
});

app.use(multer({ storage : multer.memoryStorage(), limits: { fileSize: 52428800 }}).fields([{name:'file', maxCount:10}])); 

routes(app);

app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (res.locals.data && Object.keys(res.locals.data).length) {
        if (req.route.path.toUpperCase().indexOf('/EXTERNAL/') != -1) {
            res.status(res.locals.data.statusCode).json(res.locals.data.data)
            delete res.locals.data;
        } else {
            res.status(res.locals.data.statusCode).json(crypto.AES.encrypt(JSON.stringify(res.locals.data.data), 'secret-key').toString())
            delete res.locals.data;
        }
    } else {
        next()
    }
});

app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    if (err.code == 500 || !err.code) {
        log.error('error in url - ' + req.route.path)
    }
    res.status(err.code ? err.code : 500).send({
        ERR_CODE: -1,
        ERR_MSG: err.stack ? err.stack : err.message ? err.message : err
    });
});