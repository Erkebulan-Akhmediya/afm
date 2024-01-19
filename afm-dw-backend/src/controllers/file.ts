import express from 'express';
import {disable_file_db, file_get_db,file_name_get_db,file_post_db, get_file_list} from '../db_apis/file';
import {email_post_file, get_file, get_file_download, get_file_link, post_file} from '../utils/file-api';
import get_client from '../loaders/database';
import createBind from '../utils/create-bind';
import log from '../config/logger';
import { Client } from 'pg';

export async function file_disable (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()
        let bind = createBind(req)

        await disable_file_db(bind, client)

        res.locals.data = {
            statusCode: 204
        }
        next()
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function file_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let fileData = await file_get_db(req)

                if(fileData) {
            await get_file(fileData, req, res);
        } else {
            res.status(404).json({
                err: 0,
                errMsg: 'Не найдена'
            })
        }
    } catch (error) {
        next(error)
    }
}

export async function file_link_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        console.log(req.query)
        let fileData = await file_get_db(req)
        
        console.log('yes')
        if(fileData) {
            let presignedUrl = await get_file_link(fileData)

            res.locals.data = {
                statusCode: 200,
                data: presignedUrl
            }
        } else {
            res.status(404).json({
                err: 0,
                errMsg: 'Не найдена'
            })
        }
        next()
    } catch (error) {
        next(error)
    }
}

export async function file_get_download (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let fileData = await file_get_db(req)
        if(fileData) {
            await get_file_download(fileData, req, res);
        } else {
            res.status(404).json({
                err: 0,
                errMsg: 'Не найдена'
            })
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export async function file_post(req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        if (req.files.file != undefined) {

            req.file = req.files.file[0]
        } else {
            req.file = null
        }

            let data: any
            if(req.file) {
            data = await file_post_db(req, client)
            await post_file(req, data.id, res)
        }
    } catch (error) {
        next(error);
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_file_post(req: any) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        let data: any = await file_post_db(req, client)
        await email_post_file(req, data.id)

    } catch (error) {
        log.error(`Error in email_file_post -> ${JSON.stringify(error)}`)
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function get_file_name (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);  
        const data = await file_name_get_db(bind);
        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next();
    } catch (error) {
        next(error)
    }
}


export async function file_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
    } catch(error) {
        next(error);
    }
}


export async function get_file_api (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const retData = await get_file_list(bind);
        res.locals.data = {
            statusCode: 200,
            data: retData
        }
        next();
    } catch (error) {
        next(error)
    }
}


import { Client as MinioClient } from 'minio';
import config from '../config/config'
const minioClient = new MinioClient(config.get('file'));

// experimental
export async function getFile(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const bind: any = createBind(req);  
      
      const bucketName = bind.bucketName;
      const fileName = bind.fileName;
      const buckets = await bind.listBuckets();
    
      minioClient.getObject(bucketName, fileName, (err, stream) => {
        if (err) {
          console.error(`Error retrieving file: ${err.message}`);
          return res.status(500).send('Internal server error');
        }
    
        let contentType = 'application/octet-stream';
    
        if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
          contentType = 'image/jpeg';
        } else if (fileName.endsWith('.png')) {
          contentType = 'image/png';
        } else if (fileName.endsWith('.pdf')) {
          contentType = 'application/pdf';
        } else if (fileName.endsWith('.mp4')) {
          contentType = 'video/mp4';
        }
    
        res.setHeader('Content-Type', contentType);
        stream.pipe(res);
      });
    } catch (error) {
        console.log(error)
      res.status(500).json({
        status: false,
        message: 'Internal server error.',
      });
    }
  }
  
  