import express from 'express';
import createBind from '../utils/create-bind';
import axios from 'axios';
import config from '../config/config'
import { Client as MinioClient } from 'minio';
import sharp from 'sharp'
import log from '../config/logger'
import {file_get_db} from '../db_apis/file';
import { candidate_get_reference } from '../db_apis/candidate/candidate_reference';
import moment from 'moment';
import fs from "fs";
import puppeteer from 'puppeteer';
import handlebars from "handlebars";

const minioClient = new MinioClient(config.get('file'));
let options: puppeteer.PDFOptions = {
    displayHeaderFooter: true,
    headerTemplate: `
    <html>
    <head>
      <style type="text/css">
        #header {
          padding: 0;
        }
        .content {
          width: 100%;
          background-color: lightgray;
          color: black;
          padding: 10px;
          -webkit-print-color-adjust: exact;
          vertical-align: middle;
          font-size: 10px;
          margin-top: 0;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="content">
      </div>
    </body>
  </html>
    `,
    footerTemplate: `
        <html>
            <head>
                <style type="text/css">
                </style>
            </head>
            <body>
                <div style="color: black; border-top: solid lightgray 1px; font-size: 10px; padding-top: 3px; text-align: center; width: 100%;">
                    Страница <span class="pageNumber"></span> из <span class="totalPages"></span>
                </div>
            </body>
        </html>
    `,
    format: 'A4',
    margin: {
        bottom: 50, 
        left: 50,
        right: 50,
        top: 70,
    },
    printBackground: true,
};

axios.defaults.timeout = 15000;

export async function get_reference_pdf (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

                let url: any, templateName: any
        if(bind.type == `objective`) {
            url = `${config.get('rest:getReferenceObjective')}/iin=${bind.iin}&bin=${bind.bin}`
            templateName = './src/templates/reference_objective_template.html'
        } else if(bind.type == `worklist`) {
            url = `${config.get('rest:getReferenceWorklist')}/iin=${bind.iin}&bin=${bind.bin}`
            templateName = './src/templates/reference_worklist_template.html'

                    } else if(bind.type == `candidate`) {
            templateName = './src/templates/candidate_template.html'
        }
        let headers: any = {
            Authorization: `${config.get('rest:Auth_key')}`,
            "Content-Type": "application/json"
        }

        if(bind.type == `objective` || bind.type == `worklist`) {
            var {data: result}: any = await axios.get(url, {headers})
        } else {
            var result:any = {data: {}}
            result.data = await candidate_get_reference(bind);
            result.data['creator'] = bind.creator.fullData
            let char_val = bind.requestdata.find((el:any) => el.characteristic_id == 4)
            result.data['request_position'] = char_val && char_val.list_value?char_val.list_value[0].selectedRow.text:''
            char_val = bind.requestdata.find((el:any) => el.characteristic_id == 6)
            result.data['request_full_department'] = char_val && char_val.list_value?char_val.list_value[0].selectedRow.text:''
            char_val = bind.requestdata.find((el:any) => el.characteristic_id == 7)
            result.data['request_from'] = char_val && char_val.list_value?char_val.list_value[0].selectedRow.text:''
            result.data['request_id'] = bind.requestid
        }

        let fileData = await file_get_db({query: {object: bind.employee_id, objectType: 1}})
        if(fileData) {
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
                stream.on('data', function(d: any){ bufs.push(d); });
                stream.on('end', async function(){
                    buf = Buffer.concat(bufs);
                    try {
                        console.log('----- sharp 2 -----')
                        buf = await sharp(buf).resize(120, 170).toBuffer();
                    } catch (error) {
                        log.error('error resize image: ', error)
                    }
                    let photo = buf.toString('base64');

                                        let bindFile = Object.assign({}, result.data)
                    bindFile.src = "data:image/jpeg;base64," + photo

                                    try {
                        var returnData : any = await retGeneratedPDFInBase64(templateName, bindFile);
                        res.send(returnData);
                    } catch (error) {
                        next(error);
                    }
                })
            })
        } else {
            let bindFile = Object.assign({}, result.data)
            bindFile.src = ""
            try {
                var returnData : any = await retGeneratedPDFInBase64(templateName, bindFile);
                res.send(returnData);
            } catch (error) {
                log.error(error)
                next(error);
            }
        }
    } catch (error) {
        log.error(error)
        next(error);
    }
}

export async function get_reference (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

                let headers: any = {
            Authorization: `${config.get('rest:Auth_key')}`,
            "Content-Type": "application/json"
        }
        let url = bind.type == 'objective' ? `${config.get('rest:getReferenceObjective')}/iin=${bind.iin}&bin=${bind.bin}` 
                                           : `${config.get('rest:getReferenceWorklist')}/iin=${bind.iin}&bin=${bind.bin}`

        let {data: result}: any = await axios.get(url, {headers})

         res.locals.data = {
            statusCode: 200,
            data: result.data
        }

        next();
    } catch (error) {
        console.log(error)
        next(error);
    }
}

async function retGeneratedPDFInBase64(templateName: any, bindFile: any) {
    var templateHtml = fs.readFileSync(templateName, 'utf8');
    var template = handlebars.compile(templateHtml);
    var html = template(bindFile);

    const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-dev-shm-usage'
        ]
    })

    var page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    var pdf = await page.pdf(options);

        await browser.close();
    return pdf.toString('base64')
}