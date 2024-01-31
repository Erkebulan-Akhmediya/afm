import { Client as MinioClient } from 'minio';
import config from '../config/config'
import log from '../config/logger'
import sharp from 'sharp'


const minioClient = new MinioClient(config.get('file'));

const metaData = {
    'Content-Type': 'text/html',
    'Content-Language': 123,
    'X-Amz-Meta-Testing': 1234,
    'example': 5678
}

export async function get_file_link(fileData: any) {
    try {
        var presignedUrl = await minioClient.presignedGetObject(fileData.bucket_name, `${fileData.id}_${fileData.name}`, 180)
        return presignedUrl
    } catch (err) {

        log.error(err)
        throw err

    }

}

export async function get_file(fileData: any, req: any, res: any) {
    if(!fileData.name || !fileData.bucket_name) {
        res.status(500).json({
            err: 1,
            errMsg: 'Недостаточно параметров'
        })
        return
    }

    minioClient.getObject(fileData.bucket_name, `${fileData.id}_${fileData.name}`, async function(err: any, stream: any) {
        if (err) {
            if(err.code == 'NoSuchKey') {
                res.status(404).json({
                    err: 1,
                    errMsg: 'Файл не найден'
                })
            } else {
                res.status(500).json({
                    err: 1,
                    errMsg: err
                })
            }
            return 
        }
        let bufs: any = []
        let buf
        stream.on('data', function(d: any){ 
            bufs.push(d); 
        });
        stream.on('end', async function(){
            buf = Buffer.concat(bufs);
            if(req.query.imageSize) {
                try {
                    console.log('----- sharp 3 -----')
                    buf = await sharp(buf).resize(Number(req.query.imageSize)).toBuffer();
                } catch (error) {
                    log.error('error resize image: ', error)
                }
            }
            res.send(buf);
        })
    })
} 

export async function get_media(fileData: any, req: any, res: any) {
    if(!fileData.name || !fileData.bucket_name) {
        res.status(500).json({
            err: 1,
            errMsg: 'Недостаточно параметров'
        })
        return
    }

    minioClient.getObject(fileData.bucket_name, `${fileData.id}_${fileData.name}`, async function(err: any, stream: any) {
        if (err) {
            if(err.code == 'NoSuchKey') {
                res.status(404).json({
                    err: 1,
                    errMsg: 'Файл не найден'
                })
            } else {
                res.status(500).json({
                    err: 1,
                    errMsg: err
                })
            }
            return 
        }
        stream.pipe(res)
    })
} 

export async function get_file_download(fileData: any, req: any, res: any) {
    if(!fileData.name || !fileData.bucket_name) {
        res.status(500).json({
            err: 1,
            errMsg: 'Недостаточно параметров'
        })
        return
    }
    minioClient.getObject(fileData.bucket_name, `${fileData.id}_${fileData.name}`, async function(err: any, stream: any) {
        if (err) {
            log.error(err)
            if(err.code == 'NoSuchKey') {
                res.status(404).json({
                    err: 1,
                    errMsg: 'Файл не найден'
                })
            } else {
                res.status(500).json({
                    err: 1,
                    errMsg: err
                })
            }
            return 
        }
        let bufs: any = []
        let buf
        stream.on('data', function(d: any){ bufs.push(d); });
        stream.on('end', async function(){
            buf = Buffer.concat(bufs);
                res.send(buf);
        })
    })
} 

export async function post_file(req: any, indexFile: any, res: any, is_soap_employee: boolean = false, is_event: boolean = false) {
    if(!req.body.fileType) {
        res.status(500).json({
            err: 1,
            errMsg: 'Недостаточно параметров'
        })
        return
    }
    await minioClient.putObject(req.body.fileType, `${indexFile}_${req.file.originalname}`, req.file.buffer, function(error : any, etag: any) {
        if (is_soap_employee) {
            return true
        } else {
            if(error) { 
                return res.status(500).json({
                    err: 1,
                    errMsg: error
                })
            }
            if (is_event) {
                return true
            } 
            else {
                
                // console.log("Index : ", indexFile)
                // res.status(201).json({
                //     file_id: `${indexFile}`,
                //     err: 0,
                //     errMsg: ''
                // }) 
                // return;
            }
       }
    });
    // res.status(201).json({
    //     file_id: `${indexFile}`,
    //     err: 0,
    //     errMsg: ''
    // });
    // const resp = await minioClient.putObject(req.body.fileType, `${indexFile}_${req.file.originalname}`, req.file.buffer);
} 

export async function post_file_new(req: any, indexFile: any, res: any) {
    if(!req.body.fileType) {
        res.status(500).json({
            err: 1,
            errMsg: 'Недостаточно параметров'
        })
        return
    }
    await minioClient.putObject(req.body.fileType, `${indexFile}_${req.file.originalname}`, req.file.buffer, function(error : any, etag: any) {

                   if(error) { 
                return res.status(500).json({
                    err: 1,
                    errMsg: error
                })
            }
             else {
                return true
            }

           });
} 

export async function email_post_file(req: any, indexFile: any) {

        await minioClient.putObject(req.body.fileType, `${indexFile}_${req.file.originalname}`, req.file.buffer, function(error : any, etag: any) {

                    if(error) { 
               console.log('Ошибка загрузки файла')
               log.error(`Ошибка обновления файла : ${JSON.stringify(error)}`)
            }

           });
} 

export async function put_file(req: any, indexFile: any) {
    return new Promise(async resolve => {
        if(!req.body.fileType) {
            resolve(false)
        }
        await minioClient.putObject(req.body.fileType, `${indexFile}_${req.file.originalname}`, req.file.buffer, function(error : any, etag: any) {
            if(error) {
                log.error(`Ошибка обновления файла : ${JSON.stringify(error)}`)
                resolve(false)
            }
            resolve(true)
        });

    })
} 