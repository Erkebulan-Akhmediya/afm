// @ts-nocheck
import get_client from '../loaders/database';
import express from 'express';
import * as docx from "docx";
import createBind from '../utils/create-bind';
import moment from 'moment'
import { getParentDep, getManagmentDepId, getHighPosition, getEmployeeNameFromPositionAndDep, department_get_db} from '../db_apis/departament';
import {employee_get_topmanager, employee_get_db, employee_get_data_db, getEmployeeFromPositionAndDep} from '../db_apis/employee/employee'
import {incline} from 'lvovich';
import {inflected_word_get_db} from '../db_apis/inflected_word';
import config from "../config/config";
import axios from "axios";
import { employee_affordable_vacation_get } from './request';
require('../utils/ru.morpher.min')
import log from '../config/logger';
import { approve_item_get_db } from '../db_apis/approve';
import { unviversal_query } from '../db_apis/universal_db';

import { lov_post_db } from '../db_apis/lov';
import { Client as MinioClient } from 'minio';
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
      </style>
    </head>
    <body>
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


function Header(this:any, headerText:string, alignmentTypeCenter:boolean, spacing:any, indent:boolean) {
    this.text = headerText;
    this.font = 'Times New Roman';
    this.heading = docx.HeadingLevel.TITLE;
    this.alignment = docx.AlignmentType.CENTER;
    this.style = "headTitle"
    if ( alignmentTypeCenter ){
        this.alignment = docx.AlignmentType.CENTER
    }
    if( spacing != null){
        this.spacing = {
            after : spacing
        }
    }
    if ( indent ){
        this.indent = {
            start: 4500
        }
    }
    return JSON.parse(JSON.stringify(this))
}

function bigText(this: any, text:string, spacing: number) {
    this.style = 'bigText';
    this.font = 'Times New Roman';
    this.alignment = docx.AlignmentType.JUSTIFIED;
    this.spacing = {
        after: spacing
    }
    this.text = text

    return JSON.parse(JSON.stringify(this))
}

function h2Text(this:any, text:string, spacing:any, AlignmentTypeCenter:boolean) {
    this.style = "headTitle";
    this.text = text;
    this.font = 'Times New Roman';
    if( spacing != null){
        this.spacing = {
            after : spacing
        }
    }
    if( AlignmentTypeCenter ){
        this.alignment = docx.AlignmentType.CENTER
    }
    return JSON.parse(JSON.stringify(this));
}

function h2TextType(this:any, text:string, spacing:any, AlignmentType:string) {
    this.style = "headTitle";
    this.text = text;
    this.font = 'Times New Roman';
    this.heading = docx.HeadingLevel.HEADING_2
    if( spacing != null){
        this.spacing = {
            after : spacing
        }
    }
    switch (AlignmentType) {
        case 'right':
            this.alignment = docx.AlignmentType.RIGHT
            break
        case 'left':
            this.alignment = docx.AlignmentType.LEFT
            break
        case 'justify':
            this.alignment = docx.AlignmentType.JUSTIFIED
            break
    }
}

function textOntheRightAndLeftInOneLine(this:any, paragraph1:any, paragraph2){
    this.rows = [new docx.TableRow( {
        children: [
            new docx.TableCell({
                borders: {
                    top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                    bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                    left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                    right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                },
                width: {
                    size: 50,
                    type: docx.WidthType.PERCENTAGE
                },
                children: [new docx.Paragraph(paragraph1)] }),
            new docx.TableCell({
                borders: {
                    top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                    bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                    left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                    right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                },
                width: {
                    size: 50,
                    type: docx.WidthType.PERCENTAGE
                },
                children: [new docx.Paragraph(paragraph2)] })
        ]
    })]

        return JSON.parse(JSON.stringify(this));
}

function bigTextJust(this:any, text:string, spacing:number, children:boolean) {
    this.style = "bigText";
    this.font = 'Times New Roman';
    this.alignment = docx.AlignmentType.JUSTIFIED;

    if( spacing != undefined ){
        this.spacing = {
            after: spacing
        }
    }
    if(children){
        this.children = [
            new docx.TextRun({
                text: text,
            })
        ]
    }else {
        this.text = text
    }
    return JSON.parse(JSON.stringify(this));
}

function pStyle(this:any, style:string, textStyle:any) {
    this.font = 'Times New Roman';
    this.id = style;
    this.name = style
    if( textStyle != null){
        switch (textStyle) {
            case "italics":
                this.run = {
                    color: "000000",
                    size: 28,
                    italic: true
                };
                break
            case "bold":
                this.run = {
                    color: "000000",
                    size: 28,
                    bold: true
                };
                break
        }
    }else{
        this.run = {
            color: "000000",
            size: 28,
        }
    }
    return JSON.parse(JSON.stringify(this));
}

let docIndex = new h2Text('№ ______________/');
let dateText = new h2Text('             дата', 900, false);
let remark = new h2Text('СПРАВКА',200, true);

let headPStyle = new pStyle("headTitle", "bold");
let bigStyle = new pStyle("bigText");

const lineLenght = 80
let space = ' '

let certWhereIsAskedFor800 = new bigTextJust('    Справка дана для предъявления по месту требования.', 800, false)
let certWhereIsAskedFor300 = new bigTextJust('    Справка дана для предъявления по месту требования.', 300, false)

let italicStyle = new pStyle("italicText", "italics")

let head = new h2Text("    Руководитель", 200)

const dividerLine = {
    text: "",
    border: {
        bottom: {
            color: "auto",
            space: 1,
            value: "single",
            size: 15,
        },
    },
    spacing: {
        after: 300,
    },
}


export async function pdf_summary (req: express.Request, res: express.Response, next: express.NextFunction) { 
    try {
        const bind: any = createBind(req);
        switch (bind.lang) {
            case 'RUS':
                moment.locale('ru');
                break
            case 'KAZ':
                moment.locale('kk');
                break
        }

        // move_date
        // employment_date
        // name_rus as position_name_rus
        // name_rus cur_dep_name, 
        // name_rus par_dep_name, 
        // name_rus gr_par_dep_name, 
        //  as generate_report_sequence,
        // identification_number organization_bin

        let query_return_data = await unviversal_query(
            `select 
                   e.id,
                   e.identification_number as employee_iin,
                   e.last_name_rus,
                   e.first_name_rus,
                   e.birth_date,
                   e.citizen,
                   e.address,
                   e.birthplace,
                   e.phone_number,
                   e.nationality,
                   e.is_married,
                   e.military_duty,
                   e.apply_target,
                   e.middle_name_rus,
                   e.gender_id,
                   jsonb_agg(distinct jsonb_build_object(
                    'institute', ee.institute,
                    'major', ee.major,
                    'date_from', ee.date_from,
                    'date_to', ee.date_to,
                    'graduated', ee.graduated,
                    'diploma_series', ee.diploma_series,
                    'diploma_number', ee.diploma_number,
                    'diploma_nostrification', ee.diploma_nostrification,
                    'education_type', ee.education_type,
                    'gpi', ee.gpi
                   )) as educations,
                   jsonb_agg(distinct jsonb_build_object(
                    'name', ew.name_rus,
                    'bin', ew.bin,
                    'position', ew.position_rus,
                    'is_fired', ew.is_fired,
                    'date_from', ew.date_from,
                    'date_to', ew.date_to
                   )) as worklist,
                   jsonb_agg(distinct jsonb_build_object(
                    'name', ea.name,
                    'result', ea.result
                   )) as adgs_tests
              from hr.employee e
              left join hr.employee_education_new ee on e.id = ee.employee_id
              left join hr.employee_work_list_new ew on e.id = ew.employee_id
              left join hr.employee_adgs_test ea on e.id = ea.employee_id
             where e.id = $1
             GROUP BY
                e.id;
             `, [bind.user_id])

                let declension = new Declension()

            
        var result:any = {data: {}}
        result.data['document_generate_date'] = moment().format('DD.MM.YYYY')


        if (bind.is_law_enforcement_employee == 'is_law_enforcement') { 

            const headers: any = {
                Authorization: `${config.get('rest:Auth_key')}`,
                "Content-Type": "application/json"
            }


            var {data: getReferenceWorklistResult}: any = await axios.get(getReferenceWorklistURL, {headers}).catch(error => {
                let errorText
                if (error.response) {
                    errorText = 'Возвращена ошибка при данных по опыту работы с 1С (код ответа '+error.response.status+(error.response.data ? ', '+error.response.data : '')+')'
                } else {
                    errorText = 'Возвращена ошибка при данных по опыту работы с 1С ('+typeof error == 'object' ? JSON.stringify(error) : error+')'
                }

                lov_post_db({
                    table_name: 'app.integration_log',
                    code: 'rest-get_reference_worklist',
                    request_data: query_return_data.rows[0].employee_iin,
                    invoke_date: new Date().toISOString(),
                    error_data: errorText,
                })

                    throw errorText
            })

            for (let item of getReferenceWorklistResult.data.Labor_Activity) {
                const isObjectPresent = item.Experience_Types.find((o) => o.Name === 'Правоохранительной службы');
                if (isObjectPresent) {

                    result.data['first_law_enf_work_start_date'] = moment(item.Date_Start, "DD.MM.YYYY").format('D MMMM YYYY');
                    break;
                }
            }
        } 

        let templateName

        switch (bind.work_place_type_report_code) {
            case 'pdf_workplace_base': 

                templateName = bind.is_law_enforcement_employee == 'is_law_enforcement' ? './src/templates/candidate_report_template.html' : './src/templates/candidate_report_template.html'

                if (bind.is_law_enforcement_employee == 'is_law_enforcement') { 
                    if (rank_return_data.rows.length != 1) throw 'Некорректные данные по званию, обратитесь в кадровую службу.'

                    result.data['emp_rank_name'] = declension.parse(rank_return_data.rows[0].rank_name_rus).getForm(Case.Dat, false)
                }

                result.data['employee_full_name'] = query_return_data.rows[0].last_name_rus + ' ' + query_return_data.rows[0].first_name_rus + (query_return_data.rows[0].middle_name_rus ? (' ' + query_return_data.rows[0].middle_name_rus) : '')
                result.data['gender_text'] = query_return_data.rows[0].gender_id == 1 ? 'он' : 'она'
                result.data['birth_date'] = query_return_data.rows[0].birth_date
                result.data['birthplace'] = query_return_data.rows[0].birthplace
                result.data['citizen'] = query_return_data.rows[0].citizen
                result.data['address'] = query_return_data.rows[0].address

                
                

                for(let i=0;i<query_return_data.rows[0].educations.length;i++){
                    query_return_data.rows[0].educations[i].date_from = query_return_data.rows[0].educations[i].date_from.slice(0,4)
                    if(query_return_data.rows[0].educations[i].date_to){
                        query_return_data.rows[0].educations[i].date_to = query_return_data.rows[0].educations[i].date_to.slice(0,4)
                    }else{
                        query_return_data.rows[0].educations[i].date_to = "Сейчас"
                    }
                }
                result.data['educations'] = query_return_data.rows[0].educations;
                

                for(let i=0;i<query_return_data.rows[0].worklist.length;i++){
                    query_return_data.rows[0].worklist[i].date_from = query_return_data.rows[0].worklist[i].date_from.slice(0,4)
                    if(query_return_data.rows[0].worklist[i].date_to){
                        query_return_data.rows[0].worklist[i].date_to = query_return_data.rows[0].worklist[i].date_to.slice(0,4)
                    }else{
                        query_return_data.rows[0].worklist[i].date_to = "Сейчас"
                    }
                    if(query_return_data.rows[0].worklist[i].is_fired){
                        query_return_data.rows[0].worklist[i].is_fired = "Да"
                    }else{
                        query_return_data.rows[0].worklist[i].is_fired = "Нет"
                    }
                }
                result.data['worklist'] = query_return_data.rows[0].worklist;
                result.data['adgs1'] = query_return_data.rows[0].adgs_tests[0].result
                result.data['adgs2'] = query_return_data.rows[0].adgs_tests[1].result
        

                break
            case 'pdf_workplace_pen': 
                if (bind.is_law_enforcement_employee != 'is_law_enforcement') { 
                    throw 'Не определен переход по справке. Обратитесь к администратору.'
                }

                templateName = './src/templates/inflected_word_law_enf_pen.html'

                result.data['employee_full_name'] = declension.parse(query_return_data.rows[0].last_name_rus + ' ' + query_return_data.rows[0].first_name_rus + (query_return_data.rows[0].middle_name_rus ? (' ' + query_return_data.rows[0].middle_name_rus) : '')).getForm(Case.Dat, false)
                result.data['gender_text'] = query_return_data.rows[0].gender_id == 1 ? 'он' : 'она'
                result.data['emp_full_department_name'] = emp_full_department_name_Gen

                break
            case 'pdf_workplace_exp': 
                templateName = bind.is_law_enforcement_employee == 'is_law_enforcement' ? './src/templates/inflected_word_law_enf_exp.html' : './src/templates/inflected_word_public_pen.html'

                result.data['employee_full_name'] = declension.parse(query_return_data.rows[0].last_name_rus + ' ' + query_return_data.rows[0].first_name_rus + (query_return_data.rows[0].middle_name_rus ? (' ' + query_return_data.rows[0].middle_name_rus) : '')).getForm(Case.Dat, false)
                result.data['gender_text'] = query_return_data.rows[0].gender_id == 1 ? 'он' : 'она'
                result.data['emp_full_department_name'] = emp_full_department_name_Gen


                                if (bind.is_law_enforcement_employee == 'public_state') { 
                    const headers: any = {
                        Authorization: `${config.get('rest:Auth_key')}`,
                        "Content-Type": "application/json"
                    }


                    var {data: getReferenceWorklistResult}: any = await axios.get(getReferenceWorklistURL, {headers}).catch(error => {
                        let errorText
                        if (error.response) {
                            errorText = 'Возвращена ошибка при данных по опыту работы с 1С (код ответа '+error.response.status+(error.response.data ? ', '+error.response.data : '')+')'
                        } else {
                            errorText = 'Возвращена ошибка при данных по опыту работы с 1С ('+typeof error == 'object' ? JSON.stringify(error) : error+')'
                        }

                        lov_post_db({
                            table_name: 'app.integration_log',
                            code: 'rest-get_reference_worklist',
                            request_data: query_return_data.rows[0].employee_iin,
                            invoke_date: new Date().toISOString(),
                            error_data: errorText,
                        })

                                    throw errorText
                    })

                                        result.data['work_experience_total'] = getReferenceWorklistResult.data.Work_Experience.trim()
                    result.data['work_experience_state'] = getReferenceWorklistResult.data.Work_Experience_State.trim()
                }

                                break
        }

                minioClient.getObject('system', `afm_gov_qr.jpg`, async function(err: any, stream: any) {
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
                let photo = buf.toString('base64');

                                let bindFile = Object.assign({}, result.data)
                bindFile.src = "data:image/jpeg;base64," + photo

                            try {
                    var returnData : any = await retGeneratedPDFInBase64(templateName, bindFile);
                    res.locals.data= {
                        data: returnData,
                        statusCode: 200,
                    }
                    next();
                } catch (error) {
                    next(error);
                }
            })
        })
    } catch (error) {
        log.error(error)
        next(error)
    }
}



export async function pdf_workplace (req: express.Request, res: express.Response, next: express.NextFunction) { 
    try {
        const bind: any = createBind(req);
        switch (bind.lang) {
            case 'RUS':
                moment.locale('ru');
                break
            case 'KAZ':
                moment.locale('kk');
                break
        }

        let query_return_data = await unviversal_query(
            `select 
                   t1.identification_number employee_iin,
                   t1.last_name_rus,
                   t1.first_name_rus,
                   t1.middle_name_rus,
                   t1.employment_date,
                   t1.move_date,
                   t1.gender_id,
                   t5.name_rus position_name_rus,
                   t2.name_rus cur_dep_name, 
                   t3.name_rus par_dep_name, 
                   t4.name_rus gr_par_dep_name, 
                   nextval('hr.generate_report_sequence') as generate_report_sequence,
                   t6.identification_number organization_bin
              from hr.employee t1
                   left join hr.department t2 on t1.department_id = t2.id
                   left join hr.department t3 on t2.parent_id = t3.id
                   left join hr.department t4 on t3.parent_id = t4.id
                   left join hr.position t5 on t1.position_id = t5.id
                   left join hr.organization t6 on t2.organization_id = t6.id
             where t1.id = $1`, [bind.employee_id])

                     let rank_return_data = await unviversal_query(
            `select z2.name_rus rank_name_rus 
               from hr.employee_rank z1, 
                    ref.rank z2
              where z1.rank_id = z2.id and 
                    z1.is_current = true and
                    z1.employee_id = $1`, [bind.employee_id])

        if (!query_return_data.rows[0].move_date) throw 'Нет данных по перемещению, обратитесь в кадровую службу.'
        if (!query_return_data.rows[0].employment_date) throw 'Нет данных по дате начало работы, обратитесь в кадровую службу.'

                let declension = new Declension()
        let emp_full_department_name_Gen = declension.parse(query_return_data.rows[0].cur_dep_name).getForm(Case.Gen, false) 
            + (query_return_data.rows[0].par_dep_name ? (' ' + declension.parse(query_return_data.rows[0].par_dep_name).getForm(Case.Gen, false)) : '')
            + (query_return_data.rows[0].gr_par_dep_name ? (' ' + declension.parse(query_return_data.rows[0].gr_par_dep_name).getForm(Case.Gen, false)) : '')

        var result:any = {data: {}}
        result.data['document_sequence'] = query_return_data.rows[0].generate_report_sequence
        result.data['document_generate_date'] = moment().format('DD.MM.YYYY')

        result.data['job_start_date'] = `${query_return_data.rows[0].employment_date ? moment(query_return_data.rows[0].employment_date).format('D MMMM YYYY') : '___'}`
        result.data['job_last_move_date'] = `${query_return_data.rows[0].move_date ? moment(query_return_data.rows[0].move_date).format('D MMMM YYYY') : '___'}`

        if (bind.is_law_enforcement_employee == 'is_law_enforcement') { 

            const headers: any = {
                Authorization: `${config.get('rest:Auth_key')}`,
                "Content-Type": "application/json"
            }

            const getReferenceWorklistURL = `${config.get('rest:getReferenceWorklist')}/iin=${query_return_data.rows[0].employee_iin}&bin=${query_return_data.rows[0].organization_bin}`

            var {data: getReferenceWorklistResult}: any = await axios.get(getReferenceWorklistURL, {headers}).catch(error => {
                let errorText
                if (error.response) {
                    errorText = 'Возвращена ошибка при данных по опыту работы с 1С (код ответа '+error.response.status+(error.response.data ? ', '+error.response.data : '')+')'
                } else {
                    errorText = 'Возвращена ошибка при данных по опыту работы с 1С ('+typeof error == 'object' ? JSON.stringify(error) : error+')'
                }

                lov_post_db({
                    table_name: 'app.integration_log',
                    code: 'rest-get_reference_worklist',
                    request_data: query_return_data.rows[0].employee_iin,
                    invoke_date: new Date().toISOString(),
                    error_data: errorText,
                })

                    throw errorText
            })

            for (let item of getReferenceWorklistResult.data.Labor_Activity) {
                const isObjectPresent = item.Experience_Types.find((o) => o.Name === 'Правоохранительной службы');
                if (isObjectPresent) {

                    result.data['first_law_enf_work_start_date'] = moment(item.Date_Start, "DD.MM.YYYY").format('D MMMM YYYY');
                    break;
                }
            }
        } 

        let templateName

        switch (bind.work_place_type_report_code) {
            case 'pdf_workplace_base': 

                templateName = bind.is_law_enforcement_employee == 'is_law_enforcement' ? './src/templates/inflected_word_law_enf_base.html' : './src/templates/inflected_word_public_base.html'

                if (bind.is_law_enforcement_employee == 'is_law_enforcement') { 
                    if (rank_return_data.rows.length != 1) throw 'Некорректные данные по званию, обратитесь в кадровую службу.'

                    result.data['emp_rank_name'] = declension.parse(rank_return_data.rows[0].rank_name_rus).getForm(Case.Dat, false)
                }

                                result.data['employee_full_name'] = declension.parse(query_return_data.rows[0].last_name_rus + ' ' + query_return_data.rows[0].first_name_rus + (query_return_data.rows[0].middle_name_rus ? (' ' + query_return_data.rows[0].middle_name_rus) : '')).getForm(Case.Dat, false)
                result.data['gender_text'] = query_return_data.rows[0].gender_id == 1 ? 'он' : 'она'
                result.data['emp_organization_name'] = query_return_data.rows[0].gr_par_dep_name ? (declension.parse(query_return_data.rows[0].gr_par_dep_name).getForm(Case.Pre, false)) : declension.parse(query_return_data.rows[0].par_dep_name).getForm(Case.Pre, false)
                result.data['emp_position_name'] = declension.parse(query_return_data.rows[0].position_name_rus).getForm(Case.Gen, false)
                result.data['emp_struct_name'] = declension.parse(query_return_data.rows[0].cur_dep_name).getForm(Case.Gen, false) + (query_return_data.rows[0].gr_par_dep_name ? (' ' + declension.parse(query_return_data.rows[0].par_dep_name).getForm(Case.Gen, false)) : '')


                break
            case 'pdf_workplace_pen': 
                if (bind.is_law_enforcement_employee != 'is_law_enforcement') { 
                    throw 'Не определен переход по справке. Обратитесь к администратору.'
                }

                templateName = './src/templates/inflected_word_law_enf_pen.html'

                result.data['employee_full_name'] = declension.parse(query_return_data.rows[0].last_name_rus + ' ' + query_return_data.rows[0].first_name_rus + (query_return_data.rows[0].middle_name_rus ? (' ' + query_return_data.rows[0].middle_name_rus) : '')).getForm(Case.Dat, false)
                result.data['gender_text'] = query_return_data.rows[0].gender_id == 1 ? 'он' : 'она'
                result.data['emp_position_name'] = declension.parse(query_return_data.rows[0].position_name_rus).getForm(Case.Gen, false)
                result.data['emp_full_department_name'] = emp_full_department_name_Gen

                break
            case 'pdf_workplace_exp': 
                templateName = bind.is_law_enforcement_employee == 'is_law_enforcement' ? './src/templates/inflected_word_law_enf_exp.html' : './src/templates/inflected_word_public_pen.html'

                result.data['employee_full_name'] = declension.parse(query_return_data.rows[0].last_name_rus + ' ' + query_return_data.rows[0].first_name_rus + (query_return_data.rows[0].middle_name_rus ? (' ' + query_return_data.rows[0].middle_name_rus) : '')).getForm(Case.Dat, false)
                result.data['gender_text'] = query_return_data.rows[0].gender_id == 1 ? 'он' : 'она'
                result.data['emp_position_name'] = declension.parse(query_return_data.rows[0].position_name_rus).getForm(Case.Gen, false)
                result.data['emp_full_department_name'] = emp_full_department_name_Gen

                                result.data['emp_organization_name'] = query_return_data.rows[0].gr_par_dep_name ? (declension.parse(query_return_data.rows[0].gr_par_dep_name).getForm(Case.Pre, false)) : declension.parse(query_return_data.rows[0].par_dep_name).getForm(Case.Pre, false)

                                if (bind.is_law_enforcement_employee == 'public_state') { 
                    const headers: any = {
                        Authorization: `${config.get('rest:Auth_key')}`,
                        "Content-Type": "application/json"
                    }

                    const getReferenceWorklistURL = `${config.get('rest:getReferenceWorklist')}/iin=${query_return_data.rows[0].employee_iin}&bin=${query_return_data.rows[0].organization_bin}`

                    var {data: getReferenceWorklistResult}: any = await axios.get(getReferenceWorklistURL, {headers}).catch(error => {
                        let errorText
                        if (error.response) {
                            errorText = 'Возвращена ошибка при данных по опыту работы с 1С (код ответа '+error.response.status+(error.response.data ? ', '+error.response.data : '')+')'
                        } else {
                            errorText = 'Возвращена ошибка при данных по опыту работы с 1С ('+typeof error == 'object' ? JSON.stringify(error) : error+')'
                        }

                        lov_post_db({
                            table_name: 'app.integration_log',
                            code: 'rest-get_reference_worklist',
                            request_data: query_return_data.rows[0].employee_iin,
                            invoke_date: new Date().toISOString(),
                            error_data: errorText,
                        })

                                    throw errorText
                    })

                                        result.data['work_experience_total'] = getReferenceWorklistResult.data.Work_Experience.trim()
                    result.data['work_experience_state'] = getReferenceWorklistResult.data.Work_Experience_State.trim()
                }

                                break
        }

                minioClient.getObject('system', `afm_gov_qr.jpg`, async function(err: any, stream: any) {
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
    } catch (error) {
        log.error(error)
        next(error)
    }
}

export async function doc_get (req: express.Request, res: express.Response, next: express.NextFunction) { 
    try {

        const bind: any = createBind(req);
        switch (bind.lang) {
            case 'RUS':
                moment.locale('ru');
                break
            case 'KAZ':
                moment.locale('kk');
                break
        }

        // console.log(1)                                                                           
        // let {[0]: {declination_word: dep_inflected_word}} = await inflected_word_get_db({external_id: parseInt(bind.department_id, 10), entity_type_id: 1, declination_id: 1}) ||  [{declination_word: bind.department_name}];
        // console.log(2)
        // let {[0]: {declination_word: pos_inflected_word}} = await inflected_word_get_db({external_id: parseInt(bind.position_id, 10), entity_type_id: 2, declination_id: 2}) || [{declination_word: bind.position_name}];
        // console.log(3)
        // let department = await getParentDepartment(parseInt(bind.department_id, 10), bind.lang);

        let name = incline({first: bind.employee_first_name, last: bind.employee_last_name, middle: bind.employee_middle_name}, 'dative');
        let employee_name = `${name.last} ${name.first} ${name.middle || ''}`;

        let adminManagementWithUnderline = new h2Text("    Административного управления                _____________________")

        let doc = new docx.Document({sections: []});

        let headerTitle: Array<any> = [];

        let workPlace = new h2Text("c места работы", 800, true);

        let depEconomicInvestigation = new Header("ДЕПАРТАМЕНТ ЭКОНОМИЧЕСКИХ РАССЛЕДОВАНИЙ", true, null, false)

        switch (department.organization_bin) {
            case '210240035161':
                let agentHeader = new Header("АГЕНТСТВО РЕСПУБЛИКИ КАЗАХСТАН", true, null, false);
                let finHeader = new Header("ПО ФИНАНСОВОМУ МОНИТОРИНГУ",true, null, false);
                let depHeader = new Header("ДЕПАРТАМЕНТ КАДРОВОЙ РАБОТЫ", true, 10, false);

                headerTitle = [
                    new docx.Paragraph(agentHeader),
                    new docx.Paragraph(finHeader),
                    new docx.Paragraph(depHeader),
                    new docx.Paragraph(dividerLine),
                    new docx.Paragraph(docIndex),
                    new docx.Paragraph(dateText),
                    new docx.Paragraph(remark),
                    new docx.Paragraph(workPlace)
                ]

                let depStaffText = new h2Text("    Департамента кадровой работы                        _____________________");
                let humanRes = new h2Text("    человеческих ресурсов");
                let headDep = new h2Text("    Руководитель Управления", 200)


                let thusFar = new bigText(`С ${bind.move_date ? moment(bind.move_date).format('D MMMM YYYY') : '___'} года по настоящее время занимает должность ${pos_inflected_word}.`, 100)
                let workExperience = new bigText( `    Общий стаж работы составляет ${bind.employment_date ? checkDiff(bind.employment_date) : '___' }.`, 100)
                let cert800 = new bigText('    Справка дана для предъявления по месту требования.', 800)
                let cert100 = new bigText('    Справка дана для предъявления по месту требования.', 100)

                let givenInfo = new bigText(`    Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно с ${bind.employment_date ? moment(bind.employment_date).format('D MMMM YYYY') : '___'} года работает в ${dep_inflected_word}. `, 100)
                let givenAbout = new bigText(`    Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно с ${bind.employment_date ? moment(bind.employment_date).format('D MMMM YYYY') : '_____'} года по настоящее время работает в Агентстве Республики Казахстан по финансовому мониторингу в должности ${pos_inflected_word}.`)
                let givenAbout2 = new bigText(`    Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно работает в Агентстве Республики Казахстан по финансовому мониторингу в настоящий момент должности ${pos_inflected_word} с ${bind.employment_date ? moment(bind.employment_date).format('D MMMM YYYY') : '___'} года, трудовой стаж составляет  ${bind.employment_date ? checkDiff(bind.employment_date) : '___' }.`)

                doc = new docx.Document({
                    creator: "АФМ Портал",
                    styles: {
                        paragraphStyles: [headPStyle, bigStyle, italicStyle]
                    },
                    sections: [{
                        properties: {
                            type: docx.SectionType.CONTINUOUS
                        },
                        children: [
                            ...headerTitle,
                            new docx.Paragraph(givenInfo),
                            new docx.Paragraph(thusFar),
                            new docx.Paragraph(workExperience),
                            new docx.Paragraph(cert800),
                            new docx.Paragraph(head),
                            new docx.Paragraph(depStaffText),
                        ]
                    }, {
                        properties : {
                            type: docx.SectionType.NEXT_PAGE
                        },
                        children: [
                            ...headerTitle,
                            new docx.Paragraph(givenAbout),
                            new docx.Paragraph(cert100),
                            new docx.Paragraph({}),
                            new docx.Paragraph({}),
                            new docx.Paragraph( head),
                            new docx.Paragraph( depStaffText),
                        ]
                    } ,
                        {
                            properties : {
                                type: docx.SectionType.NEXT_PAGE
                            },
                            children: [
                                ...headerTitle,
                                new docx.Paragraph(givenAbout2),
                                new docx.Paragraph(cert100),
                                new docx.Paragraph({}),
                                new docx.Paragraph({}),
                                new docx.Paragraph(headDep),
                                new docx.Paragraph(humanRes),
                            ]
                        }],
                });
                break
            case '210240041027':
                let cert300 = new bigText('    Справка дана для предъявления по месту требования.', 300)
                let headWithUnderline = new h2Text("    Руководитель                        _____________________", )
                let movie = new Header("КИНОЛОГИЧЕСКИЙ ЦЕНТР АГЕНТСТВА РЕСПУБЛИКИ КАЗАХСТАН ПО ФИНАНСОВОМУ МОНИТОРИНГУ", true, null, false)

                givenAbout = new bigText(`    Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно с ${bind.employment_date ? moment(bind.employment_date).format('D MMMM YYYY') : '_____'} года по настоящее время работает в Кинологическом центре Агентства Республики Казахстан по финансовому мониторингу в должности ${pos_inflected_word}.`)
                headerTitle = [
                    new docx.Paragraph(movie),
                    new docx.Paragraph(dividerLine),
                    new docx.Paragraph(docIndex),
                    new docx.Paragraph(dateText),
                    new docx.Paragraph(remark),
                    new docx.Paragraph(workPlace)
                ]

                doc = new docx.Document({
                    creator: "АФМ Портал",
                    styles: {
                        paragraphStyles: [ headPStyle, bigStyle, italicStyle]
                    },
                    sections: [{
                        properties : {
                            type: docx.SectionType.NEXT_PAGE
                        },
                        children: [
                            ...headerTitle,
                            new docx.Paragraph(givenAbout),
                            new docx.Paragraph(cert300),
                            new docx.Paragraph({}),
                            new docx.Paragraph({}),
                            new docx.Paragraph(headWithUnderline),
                        ]
                    }],
                });
                break
            default:
                if (department.name == 'Комитет по финансовому мониторингу МФ РК') {

                    let onWithUnderline = new Header("ПО __________________________", true, null, false)

                    headerTitle = [
                        new docx.Paragraph(depEconomicInvestigation),
                        new docx.Paragraph(onWithUnderline),
                        new docx.Paragraph(dividerLine),
                        new docx.Paragraph(docIndex),
                        new docx.Paragraph(dateText),
                        new docx.Paragraph(remark),
                        new docx.Paragraph(workPlace)
                    ]

                    let givenInfo = new bigText(`С ${bind.move_date ? moment(bind.move_date).format('D MMMM YYYY') : '___'} года по настоящее время занимает должность ${pos_inflected_word}.`, 100)
                    let workExp = new bigText(`    Общий стаж работы составляет ${bind.employment_date ? checkDiff(bind.employment_date) : '___' }.`, 100)

                    let givenAbout = new bigText(`    Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно с ${bind.employment_date ? moment(bind.employment_date).format('D MMMM YYYY') : '___'} года работает в ${dep_inflected_word}. `)
                    let givenAbout2 = new bigText(`    Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно с ${bind.employment_date ? moment(bind.employment_date).format('D MMMM YYYY') : '_____'} года по настоящее время работает в Департаменте экономических расследований в должности ${pos_inflected_word}.`)
                    doc = new docx.Document({
                        creator: "АФМ Портал",
                        styles: {
                            paragraphStyles: [ headPStyle, bigStyle, italicStyle]
                        },
                        sections: [{
                            properties: {
                                type: docx.SectionType.CONTINUOUS
                            },
                            children: [
                                ...headerTitle,
                                new docx.Paragraph(givenAbout),
                                new docx.Paragraph(givenInfo),
                                new docx.Paragraph(workExp),
                                new docx.Paragraph(certWhereIsAskedFor800),
                                new docx.Paragraph(head),
                                new docx.Paragraph(adminManagementWithUnderline),
                            ]
                        }, {
                            properties : {
                                type: docx.SectionType.NEXT_PAGE
                            },
                            children: [
                                ...headerTitle,
                                new docx.Paragraph(givenAbout2),
                                new docx.Paragraph(certWhereIsAskedFor300),
                                new docx.Paragraph({}),
                                new docx.Paragraph({}),
                                new docx.Paragraph(head),
                                new docx.Paragraph(adminManagementWithUnderline),
                            ]
                        }],
                    });
                }
                else {

                    let depName = new Header(department.name.replace(/ДЭР|РГУ|Департамент экономических расследований/gi, '').toUpperCase(), true, null, false)

                    let givenAbout = new bigText(`    Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно с ${bind.employment_date ? moment(bind.employment_date).format('D MMMM YYYY') : '___'} года работает в ${dep_inflected_word}. `, 100);
                    let fromTimeWork = new bigText(`С ${bind.move_date ? moment(bind.move_date).format('D MMMM YYYY') : '___'} года по настоящее время занимает должность ${pos_inflected_word}.`, 100);
                    let workExpirence = new bigText(`    Общий стаж работы составляет ${bind.employment_date ? checkDiff(bind.employment_date) : '___' }.`, 100);
                    let givenAbout2 = new bigText(`    Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно с ${bind.employment_date ? moment(bind.employment_date).format('D MMMM YYYY') : '_____'} года по настоящее время работает в Департаменте экономических расследований в должности ${pos_inflected_word}.`)

                    headerTitle = [
                        new docx.Paragraph(depEconomicInvestigation),
                        new docx.Paragraph(depName),
                        new docx.Paragraph(dividerLine),
                        new docx.Paragraph(docIndex),
                        new docx.Paragraph(dateText),
                        new docx.Paragraph(remark),
                        new docx.Paragraph(workPlace)
                    ]

                    doc = new docx.Document({
                        creator: "АФМ Портал",
                        styles: {
                            paragraphStyles: [ headPStyle, bigStyle, italicStyle]
                        },
                        sections: [{
                            properties: {
                                type: docx.SectionType.CONTINUOUS
                            },
                            children: [
                                ...headerTitle,
                                new docx.Paragraph(givenAbout),
                                new docx.Paragraph(fromTimeWork),
                                new docx.Paragraph(workExpirence),
                                new docx.Paragraph(certWhereIsAskedFor800),
                                new docx.Paragraph(head),
                                new docx.Paragraph(adminManagementWithUnderline),
                            ]
                        }, {
                            properties : {
                                type: docx.SectionType.NEXT_PAGE
                            },
                            children: [
                                ...headerTitle,
                                new docx.Paragraph(givenAbout2),
                                new docx.Paragraph(certWhereIsAskedFor300),
                                new docx.Paragraph({}),
                                new docx.Paragraph({}),
                                new docx.Paragraph(head),
                                new docx.Paragraph(adminManagementWithUnderline),
                            ]
                        }],
                    });
                }
                break
        }


        docx.Packer.toBase64String(doc).then(async (file) => {
            res.send(file);
        });
    } catch (error) {
        next(error)
    }
}

export async function doc_getPen (req: express.Request, res: express.Response, next: express.NextFunction){
    try {
        const bind: any = createBind(req);

        let {[0]: {declination_word: dep_inflected_word}} = await inflected_word_get_db({external_id: parseInt(bind.department_id, 10), entity_type_id: 1, declination_id: 1}) ||  [{declination_word: bind.department_name}];

        let {[0]: {declination_word: pos_inflected_word}} = await inflected_word_get_db({external_id: parseInt(bind.position_id, 10), entity_type_id: 2, declination_id: 2}) || [{declination_word: bind.position_name}];

        let name = incline({first: bind.employee_first_name, last: bind.employee_last_name, middle: bind.employee_middle_name}, 'dative');
        let employee_name = `${name.last} ${name.first} ${name.middle || ''}`;

        switch (bind.lang) {
            case 'RUS':
                moment.locale('ru');
                break
            case 'KAZ':
                moment.locale('kk');
                break
        }
        let time = moment();
        let depName;
        let cityName;
        let managmentMan;
        let signMan;
        let department = await getParentDepartment(parseInt(bind.department_id, 10), bind.lang);
        let jobs = await getHighPosition();
        let agencyKaz = new Header('Агентства Республики Казахстан по'.toUpperCase(), true)
        let finMonitoring = new Header('Финансовому мониторингу'.toUpperCase(), true)
        let headOfDep;
        switch ( department.organization_name ) {
            case 'Государственное управление РК' || 'Агентство Республики Казахстан по финансовому мониторингу':
                depName = new Header("Департамент кадровой работы".toUpperCase(), true, null, false);
                cityName = 'г.Астана';
                if (jobs.includes(bind.position_name)) {
                    headOfDep = new h2Text("Руководитель департамента");
                    signMan = await getEmployeeNameFromPositionAndDep('Руководитель управления А', 8)
                    managmentMan = new h2Text('     кадровой работы')
                } else {
                    headOfDep = new h2Text("Руководитель управления");
                    signMan = await getEmployeeNameFromPositionAndDep('Руководитель департамента', 6)
                    managmentMan = new h2Text('     человеческих ресурсов')
                }
                break
            case 'Внешний отдел' || 'Кинологический центр' || 'Департамент экономических расследований по г.Алматы':
                cityName = 'г.Алматы';
                depName = new Header('Кинологический центр'.toUpperCase(), true, null, false)
                let managmentId = await getManagmentDepId('Отдел кадровой работы', department.organization_id)
                signMan = await getEmployeeNameFromPositionAndDep('%Рук% отдела', managmentId)
                managmentMan = new h2Text('    Кадровой работы')
                headOfDep = new h2Text("Руководитель отдела");
                break
            default:
                headOfDep = new h2Text("Руководитель Административного");
                finMonitoring = new Header('Агентства Республики Казахстан по финансовому мониторингу'.toUpperCase())
                if (department.name.includes('области')) {
                    let managmentId = await getManagmentDepId('Административное управление', department.organization_id)
                    signMan = await getEmployeeNameFromPositionAndDep('%Рук%упр%', managmentId)
                    managmentMan = new h2Text('     Управления')
                    let splintedCity = department.name.split(' ')
                    removeItem(splintedCity, 'РГУ')
                    removeItem(splintedCity, 'по')
                    removeItem(splintedCity, 'ДЭР')
                    removeItem(splintedCity, 'городу')
                    removeItem(splintedCity, 'Департамент')
                    removeItem(splintedCity, 'экономических')
                    removeItem(splintedCity, 'расследований')
                    let cityHead = splintedCity.join(' ');
                    removeItem(splintedCity, 'области')
                    let city = splintedCity.join('')
                    switch (city) {
                        case 'Павлодарской':
                            cityName = 'г.Павлодар'
                            break
                        case 'Мангистауской':
                            cityName = 'г.Актау'
                            break
                        case 'Кызылординской':
                            cityName = 'г.Кызылорда'
                            break
                        case 'Туркестанской':
                            cityName = 'г.Туркестан'
                            break
                        case 'Северо-Казахстанской':
                            cityName = 'г.Петропавловск'
                            break
                        case 'Костанайской':
                            cityName = 'г.Костанай'
                            break
                        case 'Карагандинской':
                            cityName = 'г.Караганда'
                            break
                        case 'Западно-Казахстанскойя':
                            cityName = 'г.Уральск'
                            break
                        case 'Акмолинской':
                            cityName = 'г.Кокшетау'
                            break
                        case 'Атырауской':
                            cityName = 'г.Атырау'
                            break
                        case 'Восточно-Казахстанской':
                            cityName = 'г.Усть-Каменогорск'
                            break
                        case 'Жамбылской':
                            cityName = 'г.Тараз'
                            break
                        case 'Актюбинской':
                            cityName = 'г.Актобе'
                            break
                        case 'Алматинской':
                            cityName = 'г.Конаев'
                            break
                        case 'Улытауская':
                            cityName = 'г.Жезказган'
                            break
                        case 'Абай':
                            cityName = 'г.Семей'
                            break
                        case 'Жетісу':
                            cityName = 'г.Талдыкорган'
                            break
                        case 'Ұлытау':
                            cityName = 'г.Жезказган'
                            break
                    }
                    city = ('Департамент экономических расследований по ' + cityHead).toUpperCase()
                    depName = new Header(city, true);
                } else {
                    let managmentId = await getManagmentDepId('Административное управление', department.organization_id)
                    signMan = await getEmployeeNameFromPositionAndDep('%Рук%упр%', managmentId)
                    managmentMan = new h2Text('     Управления')
                    let city = department.name.split(' ')[3]
                    cityName = 'г.' + city
                    city = 'Департамент экономических расследований по г.' + city
                    depName = new Header(city, true);
                }
                break
        }

        let cityNameHead = new h2TextType(cityName, 900, 'right');
        let doc = new docx.Document({sections: []});
        let signManH2 = new h2TextType(signMan, null, 'right')
        dateText = new h2Text(`${time.format('LL')}`, 400, false);
        let onTheRightDateTextOnTheLeftCity = new textOntheRightAndLeftInOneLine(dateText, cityNameHead);
        let headerTitle = [
            new docx.Paragraph(depName),
            new docx.Paragraph(finMonitoring),
            new docx.Paragraph(dividerLine),
            new docx.Paragraph(docIndex),
            new docx.Table({
                rows: [new docx.TableRow({
                    children: [
                        new docx.TableCell({
                            borders: {
                                top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                            },
                            width: {
                                size: 50,
                                type: docx.WidthType.PERCENTAGE
                            },
                            children: [new docx.Paragraph(dateText)]
                        }),
                        new docx.TableCell({
                            borders: {
                                top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                            },
                            width: {
                                size: 50,
                                type: docx.WidthType.PERCENTAGE
                            },
                            children: [new docx.Paragraph(cityNameHead)]
                        })
                    ]
                })]
            }),

            new docx.Paragraph(remark),
        ]

        let given = new bigText(`       Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно проходит службу в службе экономических расследований Агентства Республики Казахстан по финансовому мониторингу в должности ${pos_inflected_word}.`)
        let infoLaw = new bigText(`       В соответствии с Законом Республики Казахстан «О пенсионном обеспечении в Республике Казахстан» от 21 июня 2013 года №105-V, с 1 января 2016 года от уплаты обязательных пенсионных взносов в единый накопительный пенсионный фонд освобождаются военнослужащие (кроме военнослужащих срочной службы), сотрудники специальных государственных и правоохранительных органов, государственной фельдъегерской службы, а также лица, права которых иметь специальные звания, классные чины и носить форменную одежду упразднены с 1 января 2012 года.`)
        let accordingToLaw = new bigText(`       Согласно Закона Республики Казахстан «О правоохранительной службе», к правоохранительным органам относятся органы прокуратуры, внутренних дел, антикоррупционная служба и служба экономических расследований, осуществляющие свою деятельность в соответствии с законодательными актами Республики Казахстан.`, 400)

        doc = new docx.Document({
            creator: "АФМ Портал",
            styles: {
                paragraphStyles: [headPStyle, bigStyle, italicStyle]
            },
            sections: [{
                properties: {
                    type: docx.SectionType.CONTINUOUS
                },
                children: [
                    ...headerTitle,
                    new docx.Paragraph(given),
                    new docx.Paragraph(infoLaw),
                    new docx.Paragraph(accordingToLaw),
                    new docx.Paragraph(headOfDep),
                    new docx.Table({
                        rows: [new docx.TableRow({
                            children: [
                                new docx.TableCell({
                                    borders: {
                                        top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    },
                                    width: {
                                        size: 50,
                                        type: docx.WidthType.PERCENTAGE
                                    },
                                    children: [new docx.Paragraph(managmentMan)]
                                }),
                                new docx.TableCell({
                                    borders: {
                                        top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    },
                                    width: {
                                        size: 50,
                                        type: docx.WidthType.PERCENTAGE
                                    },
                                    children: [new docx.Paragraph(signManH2)]
                                })
                            ]
                        })]
                    }),
                ]
            }],
        });

        docx.Packer.toBase64String(doc).then(async (file) => {
            res.send(file);
        });
    }catch (e) {
        next(e)
    }

}

export async function doc_getExp(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

        const bind: any = createBind(req);
        const {[0]: employee}: any = await employee_get_db({id: bind.employee_id, lang: bind.lang});
        let department = await getParentDepartment(parseInt(bind.department_id, 10), bind.lang);
        let firstParentDep = await getParentDep(bind.department_id)
        let secondParentDep = await getParentDep(firstParentDep.parent_id)

        let {[0]: {declination_word: dep_inflected_word}} = await inflected_word_get_db({external_id: parseInt(bind.department_id, 10), entity_type_id: 1, declination_id: 1}) ||  [{declination_word: bind.department_name}];

        let {[0]: {declination_word: pos_inflected_word}} = await inflected_word_get_db({external_id: parseInt(bind.position_id, 10), entity_type_id: 2, declination_id: 2}) || [{declination_word: bind.position_name}];


        const headers: any = {
            Authorization: `${config.get('rest:Auth_key')}`,
            "Content-Type": "application/json"
        }

        const url = `${config.get('rest:getReferenceWorklist')}/iin=${employee.identification_number}&bin=${department.organization_bin}`

        var {data: result}: any = await axios.get(url, {headers})

        let lastWork = result.data.Labor_Activity[ result.data.Labor_Activity.length - 1 ]
        let lastWorkTime = lastWork.Date_Start

        let name = incline({first: bind.employee_first_name, last: bind.employee_last_name, middle: bind.employee_middle_name}, 'dative');
        let employee_name = `${name.last} ${name.first} ${name.middle || ''}`;

        switch (bind.lang) {
            case 'RUS':
                moment.locale('ru');
                break
            case 'KAZ':
                moment.locale('kk');
                break
        }
        let time = moment();
        let depName;
        let cityName;
        let managmentMan;
        let signMan;
        let jobs = await getHighPosition();
        let agencyKaz = new Header('Агентства Республики Казахстан по'.toUpperCase(), true)
        let finMonitoring = new Header('Финансовому мониторингу'.toUpperCase(), true)
        let headOfDep;
        switch ( department.organization_name) {
            case 'Государственное управление РК':
                depName = new Header("Департамент кадровой работы".toUpperCase(), true, null, false);
                cityName = 'г.Астана';
                if (jobs.includes(bind.position_name)){
                    headOfDep = new h2Text("Руководитель департамента");
                    signMan = await  getEmployeeNameFromPositionAndDep('Руководитель департамента',6)
                    managmentMan = new h2Text('     кадровой работы')
                }else{
                    headOfDep = new h2Text("Руководитель управления");
                    signMan = await getEmployeeNameFromPositionAndDep('Руководитель управления А', 8)
                    managmentMan = new h2Text('     человеческих ресурсов')
                }
                break
            case 'Внешний отдел' || 'Кинологический центр':
                cityName = 'г.Алматы';
                depName = new Header('Кинологический центр'.toUpperCase(), true, null, false)
                let managmentId = await getManagmentDepId('Отдел кадровой работы',department.organization_id)
                signMan = await getEmployeeNameFromPositionAndDep('%Рук% отдела', managmentId)
                managmentMan = new h2Text('    Кадровой работы')
                headOfDep = new h2Text("Руководитель отдела");
                break
            default:
                headOfDep = new h2Text("Руководитель Административного");
                finMonitoring = new Header('Агентства Республики Казахстан по финансовому мониторингу'.toUpperCase())
                if( department.name.includes('области') ){
                    let managmentId = await getManagmentDepId('Административное управление',department.organization_id)
                    signMan = await getEmployeeNameFromPositionAndDep('%Рук%упр%', managmentId)
                    managmentMan = new h2Text('     Управления')
                    let splintedCity = department.name.split(' ')
                    removeItem(splintedCity,'РГУ')
                    removeItem(splintedCity,'по')
                    removeItem(splintedCity,'ДЭР')
                    removeItem(splintedCity,'городу')
                    removeItem(splintedCity,'Департамент')
                    removeItem(splintedCity,'экономических')
                    removeItem(splintedCity,'расследований')
                    let cityHead = splintedCity.join(' ');
                    removeItem(splintedCity,'области')
                    let city = splintedCity.join('')
                    switch (city) {
                        case 'Павлодарской':
                            cityName = 'г.Павлодар'
                            break
                        case 'Мангистауской':
                            cityName = 'г.Актау'
                            break
                        case 'Кызылординской':
                            cityName = 'г.Кызылорда'
                            break
                        case 'Туркестанской':
                            cityName = 'г.Туркестан'
                            break
                        case 'Северо-Казахстанской':
                            cityName = 'г.Петропавловск'
                            break
                        case 'Костанайской':
                            cityName = 'г.Костанай'
                            break
                        case 'Карагандинской':
                            cityName = 'г.Караганда'
                            break
                        case 'Западно-Казахстанскойя':
                            cityName = 'г.Уральск'
                            break
                        case 'Акмолинской':
                            cityName = 'г.Кокшетау'
                            break
                        case 'Атырауской':
                            cityName = 'г.Атырау'
                            break
                        case 'Восточно-Казахстанской':
                            cityName = 'г.Усть-Каменогорск'
                            break
                        case 'Жамбылской':
                            cityName = 'г.Тараз'
                            break
                        case 'Актюбинской':
                            cityName = 'г.Актобе'
                            break
                        case 'Алматинской':
                            cityName = 'г.Конаев'
                            break
                        case 'Улытауская':
                            cityName = 'г.Жезказган'
                            break
                        case 'Абай':
                            cityName = 'г.Семей'
                            break
                        case 'Жетісу':
                            cityName = 'г.Талдыкорган'
                            break
                        case 'Ұлытау':
                            cityName = 'г.Жезказган'
                            break
                    }
                    city = ('Департамент экономических расследований по ' + cityHead).toUpperCase()
                    depName = new Header(city, true);
                }else {
                    let managmentId = await getManagmentDepId('Административное управление',department.organization_id)
                    signMan = await getEmployeeNameFromPositionAndDep('%Рук%упр%', managmentId)
                    managmentMan = new h2Text('     Управления')
                    let city = department.name.split(' ')[3]
                    cityName = 'г.'+city
                    city = 'Департамент экономических расследований по г.'+city
                    depName = new Header(city, true);
                }
                break
        }
        let cityNameHead = new h2TextType(cityName, 900, 'right');
        let doc = new docx.Document({sections: []});
        let signManH2 = new h2TextType(signMan, null, 'right')
        dateText = new h2Text(`${time.format('LL')}`, 400, false);
        let headerTitle = [
            new docx.Paragraph(depName),
            new docx.Paragraph(finMonitoring),
            new docx.Paragraph(dividerLine),
            new docx.Paragraph(docIndex),
            new docx.Table({
                rows: [new docx.TableRow( {
                    children: [
                        new docx.TableCell({
                            borders: {
                                top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                            },
                            width: {
                                size: 50,
                                type: docx.WidthType.PERCENTAGE
                            },
                            children: [new docx.Paragraph(dateText)] }),
                        new docx.TableCell({
                            borders: {
                                top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                            },
                            width: {
                                size: 50,
                                type: docx.WidthType.PERCENTAGE
                            },
                            children: [new docx.Paragraph(cityNameHead)] })
                    ]
                })]
            }),

            new docx.Paragraph(remark),
        ]

        let given;
        if(secondParentDep.parent_id){
            let {[0]: {declination_word: dep2_inflected_word}} = await inflected_word_get_db({external_id: parseInt(secondParentDep.id, 10), entity_type_id: 1, declination_id: 1}) ||  [{declination_word: secondParentDep.name_rus}];
            given = new bigText(`       Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно  работает в Агентстве Республики Казахстан по финансовому мониторингу в настоящий момент в должности ${pos_inflected_word} в ${dep2_inflected_word} ${dep_inflected_word} с ${lastWorkTime}, трудовой стаж составляет ${result.data.Work_Experience.substring(result.data.Work_Experience.indexOf('в')+1,'')}.`)
        }else{
            given = new bigText(`       Дана ${employee_name} в том, что ${bind.gender_id == 1 ? 'он' : 'она'} действительно  работает в Агентстве Республики Казахстан по финансовому мониторингу в настоящий момент в должности ${pos_inflected_word} в ${dep_inflected_word} с ${lastWorkTime}, трудовой стаж составляет ${result.data.Work_Experience.substring(result.data.Work_Experience.indexOf('в')+1,'')}.`)
        }

        doc = new docx.Document({
            creator: "АФМ Портал",
            styles: {
                paragraphStyles: [ headPStyle, bigStyle, italicStyle]
            },
            sections: [{
                properties: {
                    type: docx.SectionType.CONTINUOUS
                },
                children: [
                    ...headerTitle,
                    new docx.Paragraph(given),
                    new docx.Paragraph(certWhereIsAskedFor800),
                    new docx.Paragraph(headOfDep),
                    new docx.Table({
                        rows: [new docx.TableRow( {
                            children: [
                                new docx.TableCell({
                                    borders: {
                                        top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    },
                                    width: {
                                        size: 50,
                                        type: docx.WidthType.PERCENTAGE
                                    },
                                    children: [new docx.Paragraph(managmentMan)] }),
                                new docx.TableCell({
                                    borders: {
                                        top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                        right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    },
                                    width: {
                                        size: 50,
                                        type: docx.WidthType.PERCENTAGE
                                    },
                                    children: [new docx.Paragraph(signManH2)] })
                            ]
                        })]
                    }),
                ]
            }],
        });
        docx.Packer.toBase64String(doc).then(async (file) => {
            res.send(file);
        });
    }catch (e) {
        next(e)
        console.log(e)
    }
}

export async function doc_getJbk (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

        const bind: any = createBind(req);
        switch (bind.lang) {
            case 'RUS':
                moment.locale('ru');
                break
            case 'KAZ':
                moment.locale('kk');
                break
        }

        let name = incline({first: bind.employee_first_name, last: bind.employee_last_name, middle: bind.employee_middle_name}, 'genitive');
        let employee_name = `${name.last} ${name.first} ${name.middle || ''}`;

        let topManager: any = await employee_get_topmanager(bind.lang)
        let manager_name = incline({first: topManager.first_name, last: topManager.last_name, middle: topManager.middle_name}, 'dative');
        let manager_full_name = `${manager_name.last} ${manager_name.first} ${manager_name.middle || ''}`;

        let doc = new docx.Document({sections: []});

        let headerTitle: Array<any> = [];

        let chairmanHead = new Header("Председателю", false, null, true);
        let housingCommissionAgency = new Header("Жилищной комиссии Агентства", false, null, true);
        let RepublicOfKazakhstanOn = new Header("Республики Казахстан по", false, 10, true )
        let financialMon = new Header("Финансовому мониторингу", false, 10, true);
        let managerName = new Header(manager_full_name, false, 10, true);
        let fromWho = new Header(`От ${employee_name}`, false, 900, true)
        let statement = new Header("Заявление", true, 400, false)

            headerTitle = [
                new docx.Paragraph(chairmanHead),
                new docx.Paragraph(housingCommissionAgency),
                new docx.Paragraph(RepublicOfKazakhstanOn),
                new docx.Paragraph(financialMon),
                new docx.Paragraph(managerName),
                new docx.Paragraph(fromWho),
                new docx.Paragraph(statement)
            ]

        let askingFor = new bigText(`       Прошу Вас включить меня в список работников Агентства по финансовому мониторингу Республики Казахстан нуждающихся в жилье в связи с отсутствием жилья/в улучшении жилищных условий.`, 300, true)
        let familyStructure = new bigText(`Состав семьи ______`, 50 );
        let workExperience = new bigText(`Общий стаж работы ___лет, стаж на государственной службе___лет, стаж работы в АФМ ____ лет`, 50, false);
        let withStatement = new bigText(`Прилагается к заявлению:`, 50)
        let copies = new bigText('Копии', 50)
        let certAboutHome = new bigText(`Справка об отсутствии (наличии) недвижимого имущества в РК * - _______`, 50)
        let certAboutHomeInFamily = new bigText(`Справка об отсутствии (наличии) недвижимого имущества в РК (супруга/-и, детей) *`, 50)
        let credential = new bigText(`Удостоверения личности - _______`, 50)
        let certAboutMarriage = new bigText(`Свидетельство о заключении брака - _______`, 50)
        let certAboutBirth = new bigText(`Свидетельство о рождении сына / дочери - _______`, 50);
        let specialConditions = new bigText(`Особые условия (с приложением документов) _______.`, 300)

        doc = new docx.Document({
                creator: "АФМ Портал",
                styles: {
                    paragraphStyles: [ headPStyle, bigStyle ]
                },
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 800,
                                right: 800,
                                bottom: 800,
                                left: 1500,
                            }
                        },
                        type: docx.SectionType.CONTINUOUS
                    },
                    children: [
                        ...headerTitle,
                        new docx.Paragraph(askingFor),
                        new docx.Paragraph(familyStructure),
                        new docx.Paragraph(workExperience),
                        new docx.Paragraph(withStatement),
                        new docx.Paragraph(copies),
                        new docx.Paragraph(certAboutHome),
                        new docx.Paragraph(certAboutHomeInFamily),
                        new docx.Paragraph(credential),
                        new docx.Paragraph(certAboutMarriage),
                        new docx.Paragraph(certAboutBirth),
                        new docx.Paragraph(specialConditions),

                        new docx.Paragraph({
                            style: "bigText",
                            spacing: {
                                after: 300,
                            },
                            children: [
                                new docx.TextRun({
                                    text: `${moment().format('DD MMMM YYYY')}г.                                          `,
                                }),
                                new docx.TextRun({

                                    text: `${bind.employee_last_name} ${name.first?.slice(0, 1)}. ${name.middle?.slice(0, 1)}${name.middle ? '.' : ''}/ ____________`
                                }),
                            ]
                        }),
                        new docx.Paragraph({
                            style: "italicText",
                            text: "(подпись)",
                            alignment: docx.AlignmentType.RIGHT,
                            spacing: {
                                after: 100,
                            },
                        }),
                        new docx.Paragraph({
                            style: "italicText",
                            text: "*Дата справок должна соответствовать дате подаче заявления, с последующим обновлением на заседание Комиссии.",
                            spacing: {
                                after: 100,
                            },
                        }),
                    ]
                }],
            });


        docx.Packer.toBase64String(doc).then(async (file) => {
            res.send(file);
        });
    } catch (error) {
        next(error)
    }
}

export async function get_holidays_date () {
    let client
    let query = ''
    try {
        client = get_client(); await client.connect()

        query = `
            select id, day from ref.holidays
        `

        let {rows: data} = await client.query(query)

        return data

    } catch(err) {
        log.error(err)
        console.debug(query)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function get_holidays (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

        let data = await get_holidays_date()

        res.locals.data = {
            statusCode: 200,
            data: data,
        }

        next()

    } catch ( err ) {
        log.error(err)
        next(err)
    } finally {

    }
}

async function get_full_days(date_from, date_to, holidays) {
    let full_days = date_to?.diff(date_from, 'days')

    for (let i of holidays) {
        let day = moment(i.day, "YYYY-MM-DD")
        if (day.day() < date_to.day() && day.day() > date_from.day() && day.month() < date_to.month() && day.month() > date_from.month()) {
            full_days--
        }
    }

    return full_days
}

export async function doc_getHoliday (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

        const bind: any = createBind(req);
        switch (bind.lang) {
            case 'RUS':
                moment.locale('ru');
                break
            case 'KAZ':
                moment.locale('kk');
                break
        }

        let declension = new Declension()


        let date_from = null
        let date_to = null

        let date_from_for_years = null
        let date_to_for_years = null

        let date_from_for_ecology = null
        let date_to_for_ecology = null

        let date_from_short = null
        let date_to_short = null

        let money_for_health = false

        let affordable_vacation = await employee_affordable_vacation_get({identification_number: bind.request_data.employees[0].identification_number}, req.body.logServiceId)

        affordable_vacation.periods = ''
        affordable_vacation.periods_for_years = ''
        affordable_vacation.periods_for_ecology = ''
        affordable_vacation.periods_short = ''

        let country = ''
        let cityInKaz = ''

        for (let j of bind.request_data.details) {
            if (j.characteristic_id == 19) {
                date_from = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 20) {
                date_to = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 50) {
                date_from = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 51) {
                date_to = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 54){
                if (affordable_vacation.vacation_reserve.filter((item)=> { return item.vacation_type.guid == '1cd7cfe0-fc18-11ec-9402-000c290cc0fc' }).length == 0) 
                {
                    let period_from = affordable_vacation.vacation_reserve[affordable_vacation.vacation_reserve.length-1].date_start 
                    let period_to = affordable_vacation.vacation_reserve[affordable_vacation.vacation_reserve.length-1].date_end
                    affordable_vacation.vacation_reserve.push({
                        date_start: period_from,
                        date_end: period_to,
                        vacation_type: {
                            guid: '1cd7cfe0-fc18-11ec-9402-000c290cc0fc'
                        },
                        days: 10
                    })
                }
                date_from_for_years = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 55){
                date_to_for_years = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 52) {
                if (affordable_vacation.vacation_reserve.filter((item)=> { return item.vacation_type.guid == '0cf5c43b-c75a-11ea-80d4-98f2b3ecb797' }).length == 0) 
                {
                    let period_from = affordable_vacation.vacation_reserve[affordable_vacation.vacation_reserve.length-1].date_start 
                    let period_to = affordable_vacation.vacation_reserve[affordable_vacation.vacation_reserve.length-1].date_end
                    affordable_vacation.vacation_reserve.push({
                        date_start: period_from,
                        date_end: period_to,
                        vacation_type: {
                            guid: '0cf5c43b-c75a-11ea-80d4-98f2b3ecb797'
                        },
                        days: 10
                    })
                }
                date_from_for_ecology = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 53) {
                date_to_for_ecology = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 48) {
                if (affordable_vacation.vacation_reserve.filter((item)=> { return item.vacation_type.guid == '966e0de8-ba1a-11ec-9401-000c290cc0fc' }).length == 0) 
                {
                    let period_from = affordable_vacation.vacation_reserve[affordable_vacation.vacation_reserve.length-1].date_start 
                    let period_to = affordable_vacation.vacation_reserve[affordable_vacation.vacation_reserve.length-1].date_end
                    affordable_vacation.vacation_reserve.push({
                        date_start: period_from,
                        date_end: period_to,
                        vacation_type: {
                            guid: '966e0de8-ba1a-11ec-9401-000c290cc0fc'
                        },
                        days: 10
                    })
                }
                date_from_short = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 49) {
                date_to_short = moment(j.value[0], "YYYY-MM-DD")
            }
            else if (j.characteristic_id == 45) {
                money_for_health = j.value[0] == 'false'? false: true
            }
            else if (j.characteristic_id == 43) {
                country = j.list_value[0].selectedRow.text
            }
            else if (j.characteristic_id == 41) {
                if (j.list_value) {
                    cityInKaz = j.list_value[0].selectedRow.text
                }
            }
            else if (j.characteristic_id == 44) {
                if (j.list_value) {
                    cityAbroad = j.list_value[0].selectedRow.text
                }
            }
        }

        let user: any = await employee_get_data_db(bind.lang, bind.request_data.employees[0].identification_number)

        let doc = new docx.Document({sections: []});

        let headerTitle: Array<any> = [];

        let approve_list = []

        let approvers = await approve_item_get_db({object_info:{
            object_id: bind.request_data.id,
            object_name: 'REQUEST',
            lang: bind.lang
        }})

        for(let i of approvers)
        {

            let {[0]: emp} = await employee_get_db({
                id: i.emp_id,
                lang: bind.lang
            })


            if (i.ar_item_type_id == 1 || i.ar_item_type_id == 2) {
                let status_text = 'null'
                if (i.request_status_id == 3 || i.request_status_id == 10)
                {
                    status_text = 'Согласовано'
                }
                else if (i.request_status_id == 4 || i.request_status_id == 11) {
                    status_text = 'Отказано'
                } else {
                    continue
                }
                approve_list.push(new docx.Paragraph({
                                    style: "bigText",
                                    text: status_text,
                                    spacing: {
                                        before: 300,
                                    },
                                })
                            )
                approve_list.push(new docx.Paragraph({
                                    style: "bigText",
                                    text: emp.position_name,
                                })
                            )
                approve_list.push(new docx.Paragraph({
                                    style: "bigText",
                                    text: `${emp.last_name} ${emp.first_name?.slice(0, 1)}. ${emp.middle_name?.slice(0, 1)}${emp.middle_name ? '.' : ''}`,
                                }),
                            )
            }
        }

        let signMan
        if (user.organization_id == 1) {
            if (user.position_name_rus.includes("Руководитель департамента") || user.position_name_rus.includes("Заместитель руководителя департамента") || user.department_id == 39)
            {

                let managmentId = await getManagmentDepId('Руководство', 1)
                signMan = await getEmployeeFromPositionAndDep('%Председатель%', managmentId)

            }
            else {
                let managmentId = await getManagmentDepId('Руководство', user.organization_id)
                signMan = await getEmployeeFromPositionAndDep('%Руководитель%', managmentId)

            }
        }else{
            if (user.position_name_rus.includes("Руководитель департамента") || user.position_name_rus.includes("Заместитель руководителя департамента"))
            {
                let managmentId = await getManagmentDepId('Руководство', 1)
                signMan = await getEmployeeFromPositionAndDep('%Председатель%', managmentId)

            }
            else {
                let managmentId = await getManagmentDepId('Руководство', user.organization_id)
                signMan = await getEmployeeFromPositionAndDep('%Руководитель%', managmentId)
            }
        }

        let {[0]: emp} = await employee_get_db({
            id: signMan.id,
            lang: bind.lang
        })


        signMan = emp

        let chairmanHead = new Header(declension.parse(`${signMan.position_name}`).getForm(Case.Dat, false), false, null, true);
        let housingCommissionAgency1 = new Header("Агентства Республики Казахстан", false, null, true);
        let housingCommissionAgency2 = new Header("по финансовому мониторингу ", false, null, true);
        let housingCommissionAgency3 = ''
        if (signMan.rank_name != ' ' && signMan.rank_name && user.rank_name != ' ' && user.rank_name)
        {
            housingCommissionAgency3 = new Header(`${declension.parse(signMan.rank_name).getForm(Case.Dat, false)} Службы `, false, null, true);
        }
        let housingCommissionAgency4 = new Header("экономичских расследований ", false, null, true);
        let housingCommissionAgency5 = new Header(declension.parse(`${signMan.last_name} ${signMan.first_name?.slice(0, 1)}. ${signMan.middle_name?.slice(0, 1)}${signMan.middle_name ? '.' : ''}`).getForm(Case.Dat, false), false, user.rank_name != ' ' && user.rank_name?900:'', true);
        let fromPerson0
        if (user.rank_name != ' ' &&  user.rank_name) {
        } else {
            fromPerson0 = new Header(`От ${declension.parse(`${user.last_name} ${user.first_name?.slice(0, 1)}. ${user.middle_name?.slice(0, 1)}${user.middle_name ? '.' : ''}`).getForm(Case.Gen, false)} `, false, 900, true);
        }

                let statement = new Header("Рапорт", true, 400, false)

        headerTitle = [
            new docx.Paragraph(chairmanHead),
            new docx.Paragraph(housingCommissionAgency1),
            new docx.Paragraph(housingCommissionAgency2),
        ]

        if (signMan.rank_name != ' ' && signMan.rank_name && user.rank_name != ' ' && user.rank_name) {

            headerTitle.push(new docx.Paragraph(housingCommissionAgency3))
            headerTitle.push(new docx.Paragraph(housingCommissionAgency4))
        }

        headerTitle.push(new docx.Paragraph(housingCommissionAgency5))

        if (user.rank_name != ' ' && user.rank_name) {
        } else {
            headerTitle.push(new docx.Paragraph(fromPerson0))
        }

        headerTitle.push(new docx.Paragraph(statement))

        let holidays = await get_holidays_date()

        let full_days = get_full_days(date_from, date_to, holidays)
        let full_days_for_years = get_full_days(date_from_for_years, date_to_for_years, holidays)
        let full_days_for_ecology = get_full_days(date_from_for_ecology, date_to_for_ecology, holidays)
        let full_days_short = get_full_days(date_from_short, date_to_short, holidays)

        for(let i of affordable_vacation.vacation_reserve) {

            let date_start = new moment(i.date_start)
            let show_prev_year_word = date_start.isAfter(new moment())

            if (i.vacation_type.guid == '0cf5c43c-c75a-11ea-80d4-98f2b3ecb797'){
                if (i.days > 0 && full_days > 0) {
                    full_days -= i.days
                    let show_days = i.days
                    if (full_days < 0 ) {
                        show_days += full_days
                    }

                    if (user.rank_name != ' ')
                    {
                        affordable_vacation.periods += `, ${show_prev_year_word?'неиспользованные ':''}дни трудового отпуска за период ${i.date_start} - ${i.date_end} в количестве ${show_days} календарных дней`
                    } else {
                        affordable_vacation.periods += `, за период ${i.date_start} - ${i.date_end}, продолжительностью ${show_days} календарных дней`
                    }
                }
            } else if (i.vacation_type.guid == '1cd7cfe0-fc18-11ec-9402-000c290cc0fc' && full_days_for_years){
                if (i.days > 0 && full_days_for_years > 0) {
                    full_days_for_years -= i.days
                    let show_days = i.days
                    if (full_days_for_years < 0 ) {
                        show_days += full_days_for_years
                    }

                    affordable_vacation.periods_for_years += `, ${show_days} календарных дней дополнительного отпуска за выслугу лет за период ${i.date_start} - ${i.date_end}`
                }
            } else if (i.vacation_type.guid == '0cf5c43b-c75a-11ea-80d4-98f2b3ecb797' && full_days_for_ecology){
                if (i.days > 0 && full_days_for_years > 0) {
                    full_days_for_ecology -= i.days
                    let show_days = i.days
                    if (full_days_for_ecology < 0 ) {
                        show_days += full_days_for_ecology
                    }

                    affordable_vacation.periods_for_years += `, ${show_days} календарных дней дополнительного отпуска за экологию за период ${i.date_start} - ${i.date_end}`

                }
            } else if (i.vacation_type.guid == '966e0de8-ba1a-11ec-9401-000c290cc0fc' && full_days_short){
                if (i.days > 0 && full_days_short > 0) {
                    full_days_short -= i.days
                    let show_days = i.days
                    if (full_days_short < 0 ) {
                        show_days += full_days_short
                    }

                    affordable_vacation.periods_for_years += `, ${show_days} календарных дней дополнительного краткострочного отпуска за период ${i.date_start} - ${i.date_end}`

                }
            } 
        }

        let askingForRus = ``
        if (user.rank_name != ' ' && user.rank_name)
        {
            askingForRus = new bigText(`      Прошу Вас предоставить мне ежегодный трудовой отпуск с ${date_from?.format('DD MMMM YYYY')} года в количестве ${date_to?.diff(date_from, 'days')} календарных дней${money_for_health? ' с выплатой пособия на оздоровление':''}${affordable_vacation?.periods}${affordable_vacation?.periods_for_years}${affordable_vacation?.periods_for_ecology}${affordable_vacation?.periods_short}, с выездом ${country == 'Республика Казахстан'?'в '+cityInKaz:'за пределы РК'}.`, 300, true)
        }
        else{
            askingForRus = new bigText(`      Прошу Вас предоставить мне часть ежегодного оплачиваемого трудового отпуска${affordable_vacation.periods}, ${money_for_health? 'с выплатой пособия для оздоровления в размере 2-х должностных окладов, ':''}с ${date_from?.format('DD MMMM YYYY')} года по ${date_to?.format('DD MMMM YYYY')} года.`, 300, true)
        }

        let footer = []

        if (user.rank_name != ' ' && user.rank_name != null)
        {

            footer = [
                new docx.Table({
                    width: { size: 100, type: docx.WidthType.PERCENTAGE, }, 
                    layout: docx.TableLayoutType.FIXED,
                    rows: [new docx.TableRow({
                        children: [
                            new docx.TableCell({
                                borders: {
                                    top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                },
                                width: {
                                    size: 50,
                                    type: docx.WidthType.PERCENTAGE
                                },
                                children: [
                                    new docx.Paragraph(new bigText(user.position_name, 300)),
                                ]
                            }),
                            new docx.TableCell({
                                borders: {
                                    top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                },
                                width: {
                                    size: 50,
                                    type: docx.WidthType.PERCENTAGE
                                },
                                children: [
                                    new docx.Paragraph({
                                        text: `${user.last_name} ${user.first_name?.slice(0, 1)}. ${user.middle_name?.slice(0, 1)}${user.middle_name ? '.' : ''}`,
                                        alignment: docx.AlignmentType.END,
                                        style: 'bigText',
                                        font: 'Times New Roman',
                                        spacing: {
                                            after: 300
                                        },
                                    }),
                                ]
                            })
                        ]
                    })]
                }),

                new docx.Table({
                    width: { size: 100, type: docx.WidthType.PERCENTAGE, }, 
                    layout: docx.TableLayoutType.FIXED,
                    rows: [new docx.TableRow({
                        children: [
                            new docx.TableCell({
                                borders: {
                                    top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                },
                                width: {
                                    size: 50,
                                    type: docx.WidthType.PERCENTAGE
                                },
                                children: [
                                    new docx.Paragraph(new bigText(`${user.rank_name != ' '?`${user.rank_name}`:''}`, 300)),
                                ]
                            }),
                            new docx.TableCell({
                                borders: {
                                    top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                },
                                width: {
                                    size: 50,
                                    type: docx.WidthType.PERCENTAGE
                                },
                                children: [
                                    new docx.Paragraph({
                                        text: `${moment().format('DD MMMM YYYY')}г.`,
                                        alignment: docx.AlignmentType.END,
                                        style: 'bigText',
                                        font: 'Times New Roman',
                                        spacing: {
                                            after: 300
                                        },
                                    }),
                                ]
                            })
                        ]
                    })]
                }),
            ]

        } else {
            footer = [

                new docx.Table({
                    width: { size: 100, type: docx.WidthType.PERCENTAGE, }, 
                    layout: docx.TableLayoutType.FIXED,
                    rows: [new docx.TableRow({
                        children: [
                            new docx.TableCell({
                                borders: {
                                    top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                },
                                width: {
                                    size: 50,
                                    type: docx.WidthType.PERCENTAGE
                                },
                                children: [
                                ]
                            }),
                            new docx.TableCell({
                                borders: {
                                    top: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    bottom: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    left: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                    right: {style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF"},
                                },
                                width: {
                                    size: 50,
                                    type: docx.WidthType.PERCENTAGE
                                },
                                children: [
                                    new docx.Paragraph({
                                        text: `${user.last_name} ${user.first_name?.slice(0, 1)}. ${user.middle_name?.slice(0, 1)}${user.middle_name ? '.' : ''}/___________`,
                                        alignment: docx.AlignmentType.END,
                                        style: 'bigText',
                                        font: 'Times New Roman',
                                        spacing: {
                                            after: 300
                                        },
                                    }),
                                    new docx.Paragraph({
                                        text: `${moment().format('DD MMMM YYYY')}г.`,
                                        alignment: docx.AlignmentType.END,
                                        style: 'bigText',
                                        font: 'Times New Roman',
                                        spacing: {
                                            after: 300
                                        },
                                    }),
                                ]
                            })
                        ]
                    })]
                }),
            ]
        }


        doc = new docx.Document({
                creator: "АФМ Портал",
                styles: {
                    paragraphStyles: [ headPStyle, bigStyle ]
                },
                sections: [{
                    properties: {
                        type: docx.SectionType.CONTINUOUS
                    },
                    children: [
                        ...headerTitle,
                        new docx.Paragraph(askingForRus),
                        ...footer,


                        ...approve_list
                    ]
                }],
            });

        docx.Packer.toBase64String(doc).then(async (file) => {
            res.send(file);
        });
    } catch (error) {
        log.error(error)
        next(error)
    }
}

function checkDiff(date : Date) {
    let years = moment().diff(moment(date), 'years')
    let months = moment().diff(moment(date), 'months') - years * 12
    let yearsStr = years == 1 ? 'год' : years >= 2 && years <= 4 ? 'года' : 'лет'
    let monthStr = months == 1 ? 'месяц' : months >= 2 && months <= 4 ? 'месяца' : 'месяцев'
    let formStr = ''
    if(years) {
        formStr += `${years} ${yearsStr}, `
    }
    formStr += `${months} ${monthStr}`
    return formStr
}

function checkDiffWithoutMoment(diffDays) {
    let years = parseInt(diffDays / ( 12 * 31 ) )
    let months = parseInt((diffDays - ( years * 12 * 31)) / 31)
    let yearsStr = years == 1 ? 'год' : years >= 2 && years <= 4 ? 'года' : 'лет'
    let monthStr = months == 1 ? 'месяц' : months >= 2 && months <= 4 ? 'месяца' : 'месяцев'
    let formStr = ''
    if(years) {
        formStr += `${years} ${yearsStr}, `
    }
    formStr += `${months} ${monthStr}`
    return formStr
}

function removeItem<T>(arr: Array<T>, value: T): Array<T> {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

async function getParentDepartment(id: number, lang: string): Promise<any> {
    try {
        let department;
        ({[0]: department} = await department_get_db({id, lang}));
        if (department.parent_id && department.parent_id != department.organization_id) {
            department = await getParentDepartment(department.parent_id, lang);
        }
        return department;
    } catch (e) {
        console.log(e);
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