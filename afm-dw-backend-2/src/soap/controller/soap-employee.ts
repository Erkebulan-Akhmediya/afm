import log from '../../config/logger';
import config from '../../config/config';
import { Client } from 'pg';

const soapRequest = require('easy-soap-request');
const parseString = require('xml2js').parseString;

var cron = require("node-cron");

import axios from 'axios';
axios.defaults.timeout = 15000;

import {lov_get_db,lov_post_db,lov_put_db,custom_disable_others} from '../../db_apis/lov';
import {file_get_db,file_post_db,file_put_db} from '../../db_apis/file';
import {post_file, put_file} from '../../utils/file-api';
import get_client from '../../loaders/database';
import {organization} from './soap-organization';
import moment from 'moment';

async function xmlRequest(url: any, xml: any, headers: any, args: any) {
    try {
        log.info(`Send XML : ${xml} , Url: ${url}`);

        const data = await soapRequest({ url, headers, xml }).catch((e: any) => { throw e });
        return data
    } catch (e) {
        log.error(`Error in SOAP Get_Employees -> ${JSON.stringify(e)} ${JSON.stringify(xml)} ${JSON.stringify(args)}`)
        throw e
    }
}

export function employee(args: any, callback: any, headers: any, req: any) {
    return new Promise(async (resolve, reject) => {
        try {
            log.info(`Request in Employee : ${JSON.stringify(args)}`);

            const sampleHeaders = {
                'Content-Type': 'text/xml;charset=UTF-8',
                SOAPAction: '',
                Authorization: `Basic ${config.get('soap:headers:auth')}`
            };

            let xml = `
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:afm="http://www.sevenhills.kz/AFM_Integration">
                <soap:Body>
                    <afm:Get_Employees>
                        <afm:BIN>${args.BIN}</afm:BIN>
                        <afm:IIN>${args.IIN}</afm:IIN>
                    </afm:Get_Employees>
                </soap:Body>
            </soap:Envelope>
            `;

            xmlRequest(`${config.get('soap:service:employee')}`, xml, sampleHeaders, args)
                .then(data => {
                    resolve({
                        MESSAGE: "Данные успешно получены."
                    })
                    parseString(data.response.body, async function (err: any, result: any) {
                        if (!err) {
                            const resXml = result['soap:Envelope']['soap:Body'][0]['m:Get_EmployeesResponse'][0]['m:return'][0]


                                                if (Boolean(JSON.parse(resXml['m:Result'][0]))) {
                                const employeeData = resXml['m:Organization_Employees'][0];
                                const employeesData = employeeData['m:Employees'][0]['m:Employee']

                                let employees = employeesData.reduce((acc: any, item: any) => {
                                    const employee = {
                                        organization: {
                                            bin: employeeData['m:BIN'][0],
                                            external_id: employeeData['m:GUID'][0],
                                            name_rus: employeeData['m:NameRus'][0],
                                            name_kaz: employeeData['m:NameKaz'][0]
                                        },        
                                        is_fired: JSON.parse(item['m:Deleted'][0]),
                                        external_id: item['m:guid'][0]['_'],
                                        iin: item['m:IIN'][0],
                                        employment_type : item['m:Type_Employment'][0],
                                        employee_type : item['m:Type_Employee'][0],
                                        middle_name_rus : item['m:Middlename'][0] && item['m:Middlename'][0].toLowerCase(),
                                        first_name_rus : item['m:Name'][0] && item['m:Name'][0].toLowerCase(),
                                        last_name_rus : item['m:Surname'][0] && item['m:Surname'][0].toLowerCase(),
                                        gender_id : item['m:Gender'][0],
                                        personnel_number : item['m:Tabnumber'][0],
                                        birth_date : item['m:Birthday'][0],
                                        move_date: item['m:Move_Date'][0],
                                        employment_date: item['m:Date'][0],
                                        marital_status : item['m:Family_Status'][0],
                                        photo: item['m:Photo'] && Buffer.from(`${item['m:Photo']}`, 'base64'),
                                        photo_format: item['m:File_Extension'] && item['m:File_Extension'][0].toLowerCase(),
                                        position : {
                                            external_id: item['m:Position'][0]['m:GUID'][0],
                                            name_rus: item['m:Position'][0]['m:NameRus'][0],
                                            name_kaz: item['m:Position'][0]['m:NameKaz'][0]
                                        },
                                        department : {
                                            external_id: item['m:Department'][0]['m:GUID'][0],
                                            name_rus: item['m:Department'][0]['m:NameRus'][0],
                                            name_kaz: item['m:Department'][0]['m:NameKaz'][0]
                                        },
                                        nationality : {
                                            external_id: item['m:Nationality'][0]['m:GUID'][0],
                                            name_rus: item['m:Nationality'][0]['m:NameRus'][0],
                                            name_kaz: item['m:Nationality'][0]['m:NameKaz'][0]
                                        },
                                        category : {
                                            external_id: item['m:Category'][0]['m:GUID'][0],
                                            name_rus: item['m:Category'][0]['m:NameRus'] ? item['m:Category'][0]['m:NameRus'][0] : '',
                                            name_kaz: item['m:Category'][0]['m:NameKaz'] ? item['m:Category'][0]['m:NameKaz'][0] : ''
                                        },
                                        rank : {
                                            external_id: item['m:Rank'][0]['m:GUID'][0],
                                            name_rus: item['m:Rank'][0]['m:NameRus'][0],
                                            name_kaz: item['m:Rank'][0]['m:NameKaz'][0]
                                        },
                                        educations: item['m:Educations'][0]['m:Education_Row'] ? item['m:Educations'][0]['m:Education_Row'].reduce((acc: any, item: any) => {
                                            const education = {
                                                type_education: item['m:Type_Education'][0],
                                                date_of_enrollment: item['m:Date_Of_Enrollment'][0],
                                                graduation_date: item['m:Graduation_Date'][0],
                                                form_of_education: item['m:Form_Of_Education'][0],
                                                education_document: item['m:Education_Document'][0],
                                                number_document: item['m:Number_Document'][0],
                                                date_document: item['m:Date_Document'][0],
                                                institution: {
                                                    external_id: item['m:Educational_Institution'][0]['m:GUID'][0],
                                                    name_rus: item['m:Educational_Institution'][0]['m:NameRus'][0],
                                                    name_kaz: item['m:Educational_Institution'][0]['m:NameKaz'][0]
                                                },
                                                speciality: {
                                                    external_id: item['m:Specialty'][0]['m:GUID'][0],
                                                    name_rus: item['m:Specialty'][0]['m:NameRus'][0],
                                                    name_kaz: item['m:Specialty'][0]['m:NameKaz'][0]
                                                },
                                                qualification: {
                                                    external_id: item['m:Qualification'][0]['m:GUID'][0],
                                                    name_rus: item['m:Qualification'][0]['m:NameRus'][0],
                                                    name_kaz: item['m:Qualification'][0]['m:NameKaz'][0]
                                                },
                                                education_profile: {
                                                    external_id: item['m:Education_Profile'][0]['m:GUID'][0],
                                                    name_rus: item['m:Education_Profile'][0]['m:NameRus'][0],
                                                    name_kaz: item['m:Education_Profile'][0]['m:NameKaz'][0]
                                                }
                                            };
                                            acc.push(education);
                                            return acc;
                                        }, []) : [], 
                                        documents: item['m:Identity_Documents'][0]['m:Identity_Document_Row'] ? item['m:Identity_Documents'][0]['m:Identity_Document_Row'].reduce((acc: any, item: any) => {
                                            const document = {
                                                type_document: item['m:Type_Document'][0],
                                                number: item['m:Number'][0],
                                                serial: item['m:Serial'][0],
                                                date_of_issue: item['m:Date_Of_Issue'][0],
                                                valid_date: item['m:Valid_Date'][0],
                                                issuing_authority: item['m:Issuing_Authority'][0]
                                            }
                                            acc.push(document)
                                            return acc
                                        }, []) : [], 
                                        contact_informations: item['m:Contact_Informations'][0]['m:Contact_Information_Row'] ? item['m:Contact_Informations'][0]['m:Contact_Information_Row'].reduce((acc: any, item: any) => {
                                            const contact = {
                                                name_rus: item['m:NameRus'][0],
                                                name_kaz: item['m:NameKaz'][0],
                                                type_contact_information: item['m:Type_Contact_Information'][0],
                                                contact_information_type: {
                                                    external_id: item['m:Contact_Information_Type'][0]['m:GUID'][0],
                                                    name_rus: item['m:Contact_Information_Type'][0]['m:NameRus'][0],
                                                    name_kaz: item['m:Contact_Information_Type'][0]['m:NameKaz'][0]
                                                }
                                            }
                                            acc.push(contact);
                                            return acc;
                                        }, []) : [] 
                                    }
                                    acc.push(employee)
                                    return acc;
                                }, [])

                                for (const item of employees) {
                                    let client: any;






                                                                                                            try {
                                        log.info(`ИИН Сотрудника : ${item.iin} -> Start`);

                                        let {data: get_position} = await lov_get_db({table_name: 'hr.position', external_id: item.position.external_id}).catch(e => { throw `Ошибка получения position => ${e}`});
                                        if (!get_position.length) {
                                            log.info(`ИИН Сотрудника : ${item.iin} -> Позиция не найдена, добавляем`);
                                            await organization(true).catch(e => { throw `Ошибка получения soap position => ${e}`})
                                            let {data: gp} = await lov_get_db({table_name: 'hr.position', external_id: item.position.external_id}).catch(e => { throw `Ошибка получения position => ${e}`});
                                            get_position = gp
                                        }
                                        item.position_id = get_position[0].id;
                                        let {data: get_deptment} = await lov_get_db({table_name: 'hr.department', external_id: item.department.external_id}).catch(e => { throw `Ошибка получения department => ${e}`});
                                        if (!get_deptment.length) {
                                            log.info(`ИИН Сотрудника : ${item.iin} -> Департамент не найден, добавляем`);
                                            await organization(true).catch(e => { throw `Ошибка получения soap department => ${e}`})
                                            let {data: gd} = await lov_get_db({table_name: 'hr.department', external_id: item.department.external_id}).catch(e => { throw `Ошибка получения department => ${e}`});
                                            get_deptment = gd
                                        }
                                        item.department_id = get_deptment[0].id;
                                        const { data: get_nationality } = await lov_get_db({table_name: 'ref.nationality', external_id: item.nationality.external_id, lang: 'rus'}).catch(e => { throw `Ошибка получения nationality => ${e}` });
                                        if (!get_nationality.length) {
                                            const nationality_id = await lov_post_db({
                                                table_name: 'ref.nationality',
                                                name_rus: item.nationality.name_rus ? item.nationality.name_rus : " ",
                                                name_kaz: item.nationality.name_kaz ? item.nationality.name_kaz : " ",
                                                external_id: item.nationality.external_id
                                            }).catch(e => { throw `Ошибка записи nationality => ${e}` })
                                            item.nationality_id = nationality_id.id
                                        } else {
                                            item.nationality_id = get_nationality[0].id;
                                        }
                                        const {data: get_category } = await lov_get_db({table_name: 'ref.employee_category', external_id: item.category.external_id, lang: 'rus'}).catch(e => { throw `Ошибка получения employee_category => ${e}` });
                                        if (!get_category.length) {
                                            const category_id = await lov_post_db({
                                                table_name: 'ref.employee_category',
                                                name_rus: item.category.name_rus ? item.category.name_rus : " ",
                                                name_kaz: item.category.name_kaz ? item.category.name_kaz : " ",
                                                external_id: item.category.external_id
                                            }).catch(e => { throw `Ошибка записи employee_category => ${e}` })
                                            item.category_id = category_id.id
                                        } else {
                                            item.category_id = get_category[0].id;
                                        }
                                        if (item.is_fired) {
                                            log.info(`ИИН Сотрудника : ${item.iin} -> Получен признак увольнения`);
                                        }

                                        const employee_bind = {
                                            table_name: 'hr.employee',
                                            last_name_rus: item.last_name_rus && item.last_name_rus[0].toUpperCase() + item.last_name_rus.slice(1),
                                            first_name_rus: item.first_name_rus && item.first_name_rus[0].toUpperCase() + item.first_name_rus.slice(1),
                                            middle_name_rus: item.middle_name_rus && item.middle_name_rus[0].toUpperCase() + item.middle_name_rus.slice(1),
                                            last_name_kaz: item.last_name_rus && item.last_name_rus[0].toUpperCase() + item.last_name_rus.slice(1),
                                            first_name_kaz: item.first_name_rus && item.first_name_rus[0].toUpperCase() + item.first_name_rus.slice(1),
                                            middle_name_kaz: item.middle_name_rus && item.middle_name_rus[0].toUpperCase() + item.middle_name_rus.slice(1),
                                            external_id: item.external_id,
                                            department_id: item.department_id,
                                            identification_number: String(item.iin),
                                            employment_type_id: item.employment_type,
                                            employee_type_id: item.employee_type,
                                            position_id: item.position_id,
                                            gender_id: item.gender_id,
                                            marital_status_id: item.marital_status,
                                            nationality_id: item.nationality_id,
                                            category_id:  item.category_id,
                                            personnel_number: item.personnel_number,
                                            birth_date: item.birth_date,
                                            move_date: item.move_date,
                                            employment_date: item.employment_date,
                                            is_fired: item.is_fired
                                        }

                                        let { data: get_employee }: any = await lov_get_db({table_name: 'hr.employee', identification_number: item.iin});
                                        if (!get_employee.length) {
                                            log.info(`ИИН Сотрудника : ${item.iin} -> Сотрудник не найден, добавляем`);
                                            get_employee = await lov_post_db(employee_bind)
                                            item.id = get_employee.id
                                        } else {
                                            item.id = get_employee[0].id
                                            await lov_put_db(Object.assign({}, employee_bind, {id: item.id}))
                                        }

                                        if (item.photo) {
                                            let fileData = await file_get_db({query: {object: item.id, objectType: 1}})
                                            if (fileData) {
                                                try {
                                                    client = get_client(); await client.connect();
                                                    await client.query('BEGIN')
                                                    let dataFileId: any = await file_put_db({
                                                        body: {
                                                            file_type_id: 1,
                                                            object_id: item.id, 
                                                            bind: {
                                                                user_name: 'init-soap'
                                                            }
                                                        },
                                                        file: {
                                                            originalname: `avatar.${item.photo_format}`
                                                        }
                                                    }, client)
                                                    let putFile = await put_file({
                                                        body: {
                                                            fileType: 'employee',
                                                        },
                                                        file: {
                                                            originalname: `avatar.${item.photo_format}`,
                                                            buffer: item.photo
                                                        }
                                                    }, dataFileId)
                                                    if(!putFile) {
                                                        throw 'Ошибка добавления файла'
                                                    }
                                                    await client.query('COMMIT')
                                                } catch (error) {
                                                    if(client) {
                                                        await client.query('ROLLBACK')
                                                    }
                                                    throw error
                                                } finally {
                                                    if (client) {
                                                        await client.release()
                                                    }
                                                }
                                            } else {
                                                try {
                                                    client = get_client(); await client.connect();
                                                    let data: any = await file_post_db({
                                                        file: {
                                                            originalname: `avatar.${item.photo_format}`
                                                        },
                                                        body: {
                                                            file_type_id: 1,
                                                            object_id: item.id
                                                        }
                                                    }, client)
                                                    await post_file({
                                                        body: {
                                                            fileType: 'employee',
                                                        },
                                                        file: {
                                                            originalname: `avatar.${item.photo_format}`,
                                                            buffer: item.photo
                                                        }
                                                    }, data.id, null, true);
                                                } catch (err) {
                                                    log.error(err)
                                                    throw(err)
                                                }
                                                finally {
                                                    if (client) {
                                                        await client.release()
                                                    }
                                                }
                                            }
                                        } else {
                                            try {
                                                log.info(`ИИН Сотрудника : ${item.iin} -> Фото сотрудника не передано`);
                                                client = get_client(); await client.connect();

                                                let {rows: id} = await client.query(`Select * from hr.file f join hr.object_file of on of.file_id = f.id where of.object_type_id = $1 and object_id = $2 and f.is_active = true`, [1, item.id])

                                                if(id.length) {
                                                    log.info(`ИИН Сотрудника : ${item.iin} -> Деактивация активных фотографии у сотрудника`);

                                                    for (let itemfile of id) {
                                                        await client.query(`update hr.file set is_active = false, update_user = $2, update_date = current_timestamp where id = $1`, [itemfile.file_id, 'init-soap'])
                                                    }
                                                }
                                            } catch (err) {
                                                log.error(err)
                                                throw(err)
                                            }
                                            finally {
                                                if (client) {
                                                    await client.release()
                                                }
                                            }
                                        }

                                        let {data: get_rank} = await lov_get_db({table_name: 'ref.rank', external_id: item.rank.external_id, lang: 'rus'})
                                        if (!get_rank.length) {
                                            get_rank = await lov_post_db({
                                                table_name: 'ref.rank',
                                                name_rus: item.rank.name_rus ? item.rank.name_rus : " ",
                                                name_kaz: item.rank.name_kaz ? item.rank.name_kaz : " ",
                                                external_id: item.rank.external_id
                                            })
                                        }
                                        let {data: get_employee_rank} = await lov_get_db({table_name: 'hr.employee_rank', employee_id: item.id, rank_id: get_rank[0].id});
                                        await lov_put_db({
                                            table_name: 'hr.employee_rank',
                                            is_current: false,
                                            employee_id: item.id
                                        })
                                        if (!get_employee_rank.length) {
                                            await lov_post_db({
                                                table_name: 'hr.employee_rank',
                                                employee_id: item.id,
                                                rank_id: get_rank[0].id, 
                                                is_current: true
                                            })
                                        } else {
                                            await lov_put_db({
                                                table_name: 'hr.employee_rank',
                                                is_current: true,
                                                rank_id: get_rank[0].id, 
                                                employee_id: item.id
                                            })
                                        }

                                        for (const item_education of item.educations) {
                                            const {data: get_institution}: any = await lov_get_db({table_name: 'ref.education_institution', external_id: item_education.institution.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get education_institution err => employee_id = ${item.id} => ${e}` });
                                            if (!get_institution.length) {
                                                const education_institution_id = await lov_post_db({
                                                    table_name: 'ref.education_institution',
                                                    name_rus: item_education.institution.name_rus ? item_education.institution.name_rus : " ",
                                                    name_kaz: item_education.institution.name_kaz ? item_education.institution.name_kaz : " ",
                                                    external_id: item_education.institution.external_id
                                                }).catch(e => { throw `Ошибка education_institution err => employee_id = ${item.id} => ${e}` })
                                                item.education_institution_id = education_institution_id.id
                                            } else {
                                                item.education_institution_id = get_institution[0].id;
                                            }
                                            const {data: get_speciality}: any = await lov_get_db({table_name: 'ref.education_speciality', external_id: item_education.speciality.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get education_speciality err => employee_id = ${item.id} => ${e}` });
                                            if (!get_speciality.length) {
                                                const education_speciality_id = await lov_post_db({
                                                    table_name: 'ref.education_speciality',
                                                    name_rus: item_education.speciality.name_rus ? item_education.speciality.name_rus : " ",
                                                    name_kaz: item_education.speciality.name_kaz ? item_education.speciality.name_kaz : " ",
                                                    external_id: item_education.speciality.external_id
                                                }).catch(e => { throw `Ошибка education_speciality err => employee_id = ${item.id} => ${e}` })
                                                item.education_speciality_id = education_speciality_id.id
                                            } else {
                                                item.education_speciality_id = get_speciality[0].id;
                                            }
                                            const {data: get_qualification}: any = await lov_get_db({table_name: 'ref.education_qualification', external_id: item_education.qualification.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get education_qualification err => employee_id = ${item.id} => ${e}` });
                                            if (!get_qualification.length) {
                                                const education_qualification_id = await lov_post_db({
                                                    table_name: 'ref.education_qualification',
                                                    name_rus: item_education.qualification.name_rus ? item_education.qualification.name_rus : " ",
                                                    name_kaz: item_education.qualification.name_kaz ? item_education.qualification.name_kaz : " ",
                                                    external_id: item_education.qualification.external_id
                                                }).catch(e => { throw `Ошибка education_qualification err => employee_id = ${item.id} => ${e}` })
                                                item.education_qualification_id = education_qualification_id.id
                                            } else {
                                                item.education_qualification_id = get_qualification[0].id;
                                            }
                                            const {data: get_education_profile} = await lov_get_db({table_name: 'ref.education_profile', external_id: item_education.education_profile.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get education_profile err => employee_id = ${item.id} => ${e}` });
                                            if (!get_education_profile.length) {
                                                const education_profile_id = await lov_post_db({
                                                    table_name: 'ref.education_profile',
                                                    name_rus: item_education.education_profile.name_rus ? item_education.education_profile.name_rus : " ",
                                                    name_kaz: item_education.education_profile.name_kaz ? item_education.education_profile.name_kaz : " ",
                                                    external_id: item_education.education_profile.external_id
                                                }).catch(e => { throw `Запись в education_profile ${e}` })
                                                item.education_profile_id = education_profile_id.id
                                            } else {
                                                item.education_profile_id = get_education_profile[0].id;
                                            }
                                            let {data: get_education}: any = await lov_get_db({table_name: 'hr.employee_education', employee_id: item.id, education_type_id: item_education.type_education}).catch(e => { throw `Ошибка get education_qualification err => ${e}` });
                                            if (!get_education.length) {
                                                await lov_post_db({
                                                    table_name: 'hr.employee_education', 
                                                    employee_id: item.id,
                                                    education_type_id: item_education.type_education,
                                                    education_form_id: item_education.form_of_education,
                                                    education_institution_id: item.education_institution_id,
                                                    education_speciality_id: item.education_speciality_id,
                                                    education_qualification_id: item.education_qualification_id,
                                                    education_profile_id: item.education_profile_id,
                                                    education_document_id: item_education.education_document,
                                                    enrollment_date: item_education.date_of_enrollment,
                                                    graduation_date: item_education.graduation_date,
                                                    education_document_number: item_education.number_document | -1,
                                                    education_document_date: item_education.date_document
                                                }).catch(e => { throw `Ошибка employee_education err => ${e}` })
                                            }
                                        }

                                        for (const item_document of item.documents) {
                                            let {data: get_document}: any = await lov_get_db({table_name: 'hr.employee_document', employee_id: item.id, employee_document_type_id: item_document.type_document}).catch(e => { throw `Ошибка get employee_document err => ${e}` });
                                            if (!get_document.length) {
                                                await lov_post_db({
                                                    table_name: 'hr.employee_document', 
                                                    employee_id: item.id,
                                                    employee_document_type_id: item_document.type_document, 
                                                    number: item_document.number,
                                                    serial: item_document.serial,
                                                    issue_date: item_document.date_of_issue,
                                                    valid_date: item_document.valid_date,
                                                    issued_by: item_document.issuing_authority
                                                }).catch(e => { throw `Ошибка employee_education err => ${e}` })
                                            }
                                        }
                                        for (const item_contact of item.contact_informations) {
                                            let {data: get_contact_type}: any = await lov_get_db({table_name: 'ref.contact_info_type', external_id: item_contact.contact_information_type.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get contact_info_type err => ${e}` });
                                            if (!get_contact_type.length) {
                                                get_contact_type = await lov_post_db({
                                                    table_name: 'ref.contact_info_type',
                                                    external_id: item_contact.contact_information_type.external_id,
                                                    name_rus: item_contact.contact_information_type.name_rus ? item_contact.contact_information_type.name_rus : " ",
                                                    name_kaz: item_contact.contact_information_type.name_kaz ? item_contact.contact_information_type.name_kaz : " "
                                                }).catch(e => { throw `Ошибка contact_info_type err => ${e}` })
                                            }
                                            let {data: get_contact}: any = await lov_get_db({
                                                table_name: 'hr.employee_contact_info',
                                                employee_id: item.id, 
                                                name_rus: item_contact.name_rus ? item_contact.name_rus : " ", 
                                                contact_info_type_id: Array.isArray(get_contact_type) ? get_contact_type[0].id : get_contact_type.id
                                            }).catch(e => { throw `Ошибка get employee_contact_info err => ${e}` });

                                                                                        let employee_contact_info_id
                                            if (!get_contact.length) {
                                                employee_contact_info_id = await lov_post_db({
                                                    table_name: 'hr.employee_contact_info', 
                                                    employee_id: item.id,
                                                    contact_info_type_id: Array.isArray(get_contact_type) ? get_contact_type[0].id : get_contact_type.id,
                                                    name_rus: item_contact.name_rus ? item_contact.name_rus : " ",
                                                    name_kaz: item_contact.name_kaz ? item_contact.name_kaz : item_contact.name_rus || " " ,
                                                    external_id: -1 
                                                }).catch(e => { throw `Ошибка employee_contact_info err => ${e}` })

                                                employee_contact_info_id = employee_contact_info_id.id
                                            } else {
                                                await lov_put_db({
                                                    table_name: 'hr.employee_contact_info', 
                                                    name_kaz: item_contact.name_kaz ? item_contact.name_kaz : item_contact.name_rus || " " , 
                                                    is_active: true, 
                                                    id: get_contact[0].id
                                                })

                                                employee_contact_info_id = get_contact[0].id
                                            }

                                            await custom_disable_others({
                                                employee_id: item.id, 
                                                id: employee_contact_info_id, 
                                                contact_info_type_id: Array.isArray(get_contact_type) ? get_contact_type[0].id : get_contact_type.id
                                            }).catch(e => { throw `Ошибка отключения других записей employee_contact_info err => ${e}` })

                                        }
                                    } catch(err) {
                                        item.photo = item.photo ? 'Фото получено' : '' 
                                        log.error(`Ошибка обновления / записи сотрудника SOAP : ${err} IIN: ${item.inn, args.IIN} BIN: ${args.BIN} EMPLOYEE: ${JSON.stringify(item)}`)
                                    } finally {
                                        log.info(`ИИН Сотрудника : ${item.iin} -> End`);
                                    }











                                }
                            } else {
                                log.error(`По сотруднику не получена структура Result -> ${JSON.stringify(data.response.body)}`) 
                            }
                        } else {
                            log.error(`Error in parseString -> ${JSON.stringify(err)} ${JSON.stringify(data.response.body)}`)
                        }
                    })
                })
                .catch(err => {
                    reject({
                        Fault: {
                            faultcode: 500,
                            faultstring: "Ошибка",
                            detail: err.message
                        }
                    })
                })

                 } catch (e) {
            log.info(`Error in Employee : ${e}`);
        }  
    })
}

export function employee_v2(args: any, callback: any, headers: any, req: any) {
    return new Promise(async (resolve, reject) => {
        try {
            await lov_post_db({
                table_name: 'app.integration_log',
                code: 'soap-employee-process',
                request_data: args.IIN ? args.IIN : args.iin
            })

            resolve({
                MESSAGE: "Данные успешно получены."
            })

                 } catch (e) {
            log.info(`Error in Employee : ${e}`);

            reject({
                Fault: {
                    faultcode: 500,
                    faultstring: "Ошибка",
                    detail: e
                }
            })
        }  
    })
}

cron.schedule("*/1 * * * *", async () => { 

    if (process.env.APPLICATION_WITH_CRON !== "1") { return; }

        let client = get_client(); await client.connect();

    try {
        let select = `select * from app.integration_log where code = 'soap-employee-process' and invoke_date is null`;
        let { rows: data } = await client.query(select);

        const headers: any = {
            Authorization: `${config.get('rest:Auth_key')}`,
            "Content-Type": "application/json"
        }

                for (let i = 0; i < data.length; i++) {
            try {
                const responceData: any = await axios.get(`${config.get('rest:getEmployee')}${data[i].request_data}`, {headers, timeout: 30000})
                await lov_put_db({
                    table_name: 'app.integration_log',
                    invoke_date: new Date().toISOString(),
                    responce_data: JSON.stringify(responceData.data), 
                    id: data[i].id
                })

                await updateEmployeeData(client, responceData.data)

            } catch (error : any) {

                let errorData
                if (error.response) {
                    errorData = 'responseStatus: ' + error.response.status + '; responseData: ' + error.response.data
                } else if (error.request) {
                    errorData = error.request
                } else {
                    errorData = error.message
                }

                await lov_put_db({
                    table_name: 'app.integration_log',
                    invoke_date: new Date().toISOString(),
                    error_data: errorData, 
                    id: data[i].id
                })

            }
        }

    } catch (err) {
        log.error(`Error in cron soap-employee ->`)
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end();
        }
    }
});

export async function employee_perco_post_db(bind: any) {
    let client;
    try {

        client = get_client(); await client.connect();

        let {rows: {[0]: data}} = await client.query(`
        insert into hr.employee_perco
            (perco_id, employee_id, bin, create_user_id, create_date, update_user_id, update_date)
        values
            (${bind.perco_id}, (select id from hr.employee where identification_number = '${bind.employee_iin}'), ${bind.bin}, -1, current_date, -1, current_date) 
        returning id
        `)

                return data;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

async function updateEmployeeData(client: Client, bind: any) {
    try {

        let employees = bind.reduce((acc: any, item: any) => {
            const employee = {
                organization: {
                    bin: item.Organization.BIN,
                    external_id: item.Organization.GUID,
                    name_rus: item.Organization.NameRus,
                    name_kaz: item.Organization.NameKaz,
                },        
                is_fired: item.Deleted,
                external_id: item.guid,
                iin: item.IIN,
                employment_type : item.Type_Employment,
                employee_type : item.Type_Employee,
                middle_name_rus : item.Middlename && item.Middlename.toLowerCase(),
                first_name_rus : item.Name && item.Name.toLowerCase(),
                last_name_rus : item.Surname && item.Surname.toLowerCase(),
                gender_id : item.Gender,
                personnel_number : item.Tabnumber,
                birth_date : item.Birthday,
                move_date: item.Move_Date,
                employment_date: item.Date,
                marital_status : item.Family_Status,
                photo: item.Photo && Buffer.from(`${item.Photo}`, 'base64'),
                photo_format: item.File_Extension && item.File_Extension.toLowerCase(),
                position : {
                    external_id: item.Position.GUID,
                    name_rus: item.Position.NameRus,
                    name_kaz: item.Position.NameKaz
                },
                department : {
                    external_id: item.Department.GUID,
                    name_rus: item.Department.NameRus,
                    name_kaz: item.Department.NameKaz
                },
                nationality : {
                    external_id: item.Nationality.GUID,
                    name_rus: item.Nationality.NameRus,
                    name_kaz: item.Nationality.NameKaz
                },
                category : {
                    external_id: item.Category.GUID,
                    name_rus: item.Category.NameRus ? item.Category.NameRus : '',
                    name_kaz: item.Category.NameKaz ? item.Category.NameKaz : ''
                },
                rank : {
                    external_id: item.Rank.GUID,
                    name_rus: item.Rank.NameRus,
                    name_kaz: item.Rank.NameKaz
                },

                perco_id: item.PERCO_ID ? item.PERCO_ID.reduce((acc: any, item: any) => {
                    const perco_item = {
                        bin: item.BIN,
                        id: item.ID,
                    };
                    acc.push(perco_item);
                    return acc;
                }, []) : [], 

                educations: item.Educations.Education_Row ? item.Educations.Education_Row.reduce((acc: any, item: any) => {
                    const education = {
                        type_education: item.Type_Education,
                        date_of_enrollment: item.Date_Of_Enrollment,
                        graduation_date: item.Graduation_Date,
                        form_of_education: item.Form_Of_Education,
                        education_document: item.Education_Document,
                        number_document: item.Number_Document,
                        date_document: item.Date_Document,
                        institution: {
                            external_id: item.Educational_Institution.GUID,
                            name_rus: item.Educational_Institution.NameRus,
                            name_kaz: item.Educational_Institution.NameKaz
                        },
                        speciality: {
                            external_id: item.Specialty.GUID,
                            name_rus: item.Specialty.NameRus,
                            name_kaz: item.Specialty.NameKaz
                        },
                        qualification: {
                            external_id: item.Qualification.GUID,
                            name_rus: item.Qualification.NameRus,
                            name_kaz: item.Qualification.NameKaz
                        },
                        education_profile: {
                            external_id: item.Education_Profile.GUID,
                            name_rus: item.Education_Profile.NameRus,
                            name_kaz: item.Education_Profile.NameKaz
                        }
                    };
                    acc.push(education);
                    return acc;
                }, []) : [], 
                documents: item.Identity_Documents.Identity_Document_Row ? item.Identity_Documents.Identity_Document_Row.reduce((acc: any, item: any) => {
                    const document = {
                        type_document: item.Type_Document,
                        number: item.Number,
                        serial: item.Serial,
                        date_of_issue: item.Date_Of_Issue,
                        valid_date: item.Valid_Date,
                        issuing_authority: item.Issuing_Authority
                    }
                    acc.push(document)
                    return acc
                }, []) : [], 
                contact_informations: item.Contact_Informations.Contact_Information_Row ? item.Contact_Informations.Contact_Information_Row.reduce((acc: any, item: any) => {
                    const contact = {
                        name_rus: item.NameRus,
                        name_kaz: item.NameKaz,
                        type_contact_information: item.Type_Contact_Information,
                        contact_information_type: {
                            external_id: item.Contact_Information_Type.GUID,
                            name_rus: item.Contact_Information_Type.NameRus,
                            name_kaz: item.Contact_Information_Type.NameKaz
                        }
                    }
                    acc.push(contact);
                    return acc;
                }, []) : [], 

            }
            acc.push(employee)
            return acc;
        }, [])

        for (const item of employees) {

                        try {
                log.info(`ИИН Сотрудника : ${item.iin} -> Start`);

                let {data: get_position} = await lov_get_db({table_name: 'hr.position', external_id: item.position.external_id}).catch(e => { throw `Ошибка получения position => ${e}`});
                if (!get_position.length) {
                    log.info(`ИИН Сотрудника : ${item.iin} -> Позиция не найдена, добавляем`);
                    await organization(true).catch(e => { throw `Ошибка получения soap position => ${e}`})
                    let {data: gp} = await lov_get_db({table_name: 'hr.position', external_id: item.position.external_id}).catch(e => { throw `Ошибка получения position => ${e}`});
                    get_position = gp
                }
                item.position_id = get_position[0].id;
                let {data: get_deptment} = await lov_get_db({table_name: 'hr.department', external_id: item.department.external_id}).catch(e => { throw `Ошибка получения department => ${e}`});
                if (!get_deptment.length) {
                    log.info(`ИИН Сотрудника : ${item.iin} -> Департамент не найден, добавляем`);
                    await organization(true).catch(e => { throw `Ошибка получения soap department => ${e}`})
                    let {data: gd} = await lov_get_db({table_name: 'hr.department', external_id: item.department.external_id}).catch(e => { throw `Ошибка получения department => ${e}`});
                    get_deptment = gd
                }
                item.department_id = get_deptment[0].id;
                const { data: get_nationality } = await lov_get_db({table_name: 'ref.nationality', external_id: item.nationality.external_id, lang: 'rus'}).catch(e => { throw `Ошибка получения nationality => ${e}` });
                if (!get_nationality.length) {
                    const nationality_id = await lov_post_db({
                        table_name: 'ref.nationality',
                        name_rus: item.nationality.name_rus ? item.nationality.name_rus : " ",
                        name_kaz: item.nationality.name_kaz ? item.nationality.name_kaz : " ",
                        external_id: item.nationality.external_id
                    }).catch(e => { throw `Ошибка записи nationality => ${e}` })
                    item.nationality_id = nationality_id.id
                } else {
                    item.nationality_id = get_nationality[0].id;
                }
                const {data: get_category } = await lov_get_db({table_name: 'ref.employee_category', external_id: item.category.external_id, lang: 'rus'}).catch(e => { throw `Ошибка получения employee_category => ${e}` });
                if (!get_category.length) {
                    const category_id = await lov_post_db({
                        table_name: 'ref.employee_category',
                        name_rus: item.category.name_rus ? item.category.name_rus : " ",
                        name_kaz: item.category.name_kaz ? item.category.name_kaz : " ",
                        external_id: item.category.external_id
                    }).catch(e => { throw `Ошибка записи employee_category => ${e}` })
                    item.category_id = category_id.id
                } else {
                    item.category_id = get_category[0].id;
                }
                if (item.is_fired) {
                    log.info(`ИИН Сотрудника : ${item.iin} -> Получен признак увольнения`);
                }

                const employee_bind = {
                    table_name: 'hr.employee',
                    last_name_rus: item.last_name_rus && item.last_name_rus[0].toUpperCase() + item.last_name_rus.slice(1),
                    first_name_rus: item.first_name_rus && item.first_name_rus[0].toUpperCase() + item.first_name_rus.slice(1),
                    middle_name_rus: item.middle_name_rus && item.middle_name_rus[0].toUpperCase() + item.middle_name_rus.slice(1),
                    last_name_kaz: item.last_name_rus && item.last_name_rus[0].toUpperCase() + item.last_name_rus.slice(1),
                    first_name_kaz: item.first_name_rus && item.first_name_rus[0].toUpperCase() + item.first_name_rus.slice(1),
                    middle_name_kaz: item.middle_name_rus && item.middle_name_rus[0].toUpperCase() + item.middle_name_rus.slice(1),
                    external_id: item.external_id,
                    department_id: item.department_id,
                    identification_number: String(item.iin),
                    employment_type_id: item.employment_type,
                    employee_type_id: item.employee_type,
                    position_id: item.position_id,
                    gender_id: item.gender_id,
                    marital_status_id: item.marital_status,
                    nationality_id: item.nationality_id,
                    category_id:  item.category_id,
                    personnel_number: item.personnel_number,
                    birth_date: moment(item.birth_date, 'DD.mm.YYYY').format('YYYY.mm.DD'),
                    move_date: moment(item.move_date, 'DD.mm.YYYY').format('YYYY.mm.DD'),
                    employment_date: moment(item.employment_date, 'DD.mm.YYYY').format('YYYY.mm.DD'),
                    is_fired: item.is_fired
                }

                let { data: get_employee }: any = await lov_get_db({table_name: 'hr.employee', identification_number: item.iin});
                if (!get_employee.length) {
                    log.info(`ИИН Сотрудника : ${item.iin} -> Сотрудник не найден, добавляем`);
                    get_employee = await lov_post_db(employee_bind)
                    item.id = get_employee.id
                } else {
                    item.id = get_employee[0].id
                    await lov_put_db(Object.assign({}, employee_bind, {id: item.id}))
                }

                if (item.photo) {
                    let fileData = await file_get_db({query: {object: item.id, objectType: 1}})
                    if (fileData) {
                        try {
                            await client.query('BEGIN')
                            let dataFileId: any = await file_put_db({
                                body: {
                                    file_type_id: 1,
                                    object_id: item.id, 
                                    bind: {
                                        user_name: 'init-soap'
                                    }
                                },
                                file: {
                                    originalname: `avatar.${item.photo_format}`
                                }
                            }, client)
                            let putFile = await put_file({
                                body: {
                                    fileType: 'employee',
                                },
                                file: {
                                    originalname: `avatar.${item.photo_format}`,
                                    buffer: item.photo
                                }
                            }, dataFileId)
                            if(!putFile) {
                                throw 'Ошибка добавления файла'
                            }
                            await client.query('COMMIT')
                        } catch (error) {
                            if(client) {
                                await client.query('ROLLBACK')
                            }
                            throw error
                        }
                    } else {
                        try {
                            let data: any = await file_post_db({
                                file: {
                                    originalname: `avatar.${item.photo_format}`
                                },
                                body: {
                                    file_type_id: 1,
                                    object_id: item.id
                                }
                            }, client)
                            await post_file({
                                body: {
                                    fileType: 'employee',
                                },
                                file: {
                                    originalname: `avatar.${item.photo_format}`,
                                    buffer: item.photo
                                }
                            }, data.id, null, true);
                        } catch (err) {
                            log.error(err)
                            throw(err)
                        }
                    }
                } else {
                    try {
                        log.info(`ИИН Сотрудника : ${item.iin} -> Фото сотрудника не передано`);

                                                let {rows: id} = await client.query(`Select * from hr.file f join hr.object_file of on of.file_id = f.id where of.object_type_id = $1 and object_id = $2 and f.is_active = true`, [1, item.id])

                        if(id.length) {
                            log.info(`ИИН Сотрудника : ${item.iin} -> Деактивация активных фотографии у сотрудника`);

                            for (let itemfile of id) {
                                await client.query(`update hr.file set is_active = false, update_user = $2, update_date = current_timestamp where id = $1`, [itemfile.file_id, 'init-soap'])
                            }
                        }
                    } catch (err) {
                        log.error(err)
                        throw(err)
                    }
                }

                let {data: get_rank} = await lov_get_db({table_name: 'ref.rank', external_id: item.rank.external_id, lang: 'rus'})
                if (!get_rank.length) {
                    get_rank = await lov_post_db({
                        table_name: 'ref.rank',
                        name_rus: item.rank.name_rus ? item.rank.name_rus : " ",
                        name_kaz: item.rank.name_kaz ? item.rank.name_kaz : " ",
                        external_id: item.rank.external_id
                    })
                }
                let {data: get_employee_rank} = await lov_get_db({table_name: 'hr.employee_rank', employee_id: item.id, rank_id: get_rank[0].id});
                await lov_put_db({
                    table_name: 'hr.employee_rank',
                    is_current: false,
                    employee_id: item.id
                })
                if (!get_employee_rank.length) {
                    await lov_post_db({
                        table_name: 'hr.employee_rank',
                        employee_id: item.id,
                        rank_id: get_rank[0].id, 
                        is_current: true
                    })
                } else {
                    await lov_put_db({
                        table_name: 'hr.employee_rank',
                        is_current: true,
                        rank_id: get_rank[0].id, 
                        employee_id: item.id
                    })
                }
                for (const item_education of item.educations) {
                    const {data: get_institution}: any = await lov_get_db({table_name: 'ref.education_institution', external_id: item_education.institution.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get education_institution err => employee_id = ${item.id} => ${e}` });
                    if (!get_institution.length) {
                        const education_institution_id = await lov_post_db({
                            table_name: 'ref.education_institution',
                            name_rus: item_education.institution.name_rus ? item_education.institution.name_rus : " ",
                            name_kaz: item_education.institution.name_kaz ? item_education.institution.name_kaz : " ",
                            external_id: item_education.institution.external_id
                        }).catch(e => { throw `Ошибка education_institution err => employee_id = ${item.id} => ${e}` })
                        item.education_institution_id = education_institution_id.id
                    } else {
                        item.education_institution_id = get_institution[0].id;
                    }
                    const {data: get_speciality}: any = await lov_get_db({table_name: 'ref.education_speciality', external_id: item_education.speciality.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get education_speciality err => employee_id = ${item.id} => ${e}` });
                    if (!get_speciality.length) {
                        const education_speciality_id = await lov_post_db({
                            table_name: 'ref.education_speciality',
                            name_rus: item_education.speciality.name_rus ? item_education.speciality.name_rus : " ",
                            name_kaz: item_education.speciality.name_kaz ? item_education.speciality.name_kaz : " ",
                            external_id: item_education.speciality.external_id
                        }).catch(e => { throw `Ошибка education_speciality err => employee_id = ${item.id} => ${e}` })
                        item.education_speciality_id = education_speciality_id.id
                    } else {
                        item.education_speciality_id = get_speciality[0].id;
                    }
                    const {data: get_qualification}: any = await lov_get_db({table_name: 'ref.education_qualification', external_id: item_education.qualification.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get education_qualification err => employee_id = ${item.id} => ${e}` });
                    if (!get_qualification.length) {
                        const education_qualification_id = await lov_post_db({
                            table_name: 'ref.education_qualification',
                            name_rus: item_education.qualification.name_rus ? item_education.qualification.name_rus : " ",
                            name_kaz: item_education.qualification.name_kaz ? item_education.qualification.name_kaz : " ",
                            external_id: item_education.qualification.external_id
                        }).catch(e => { throw `Ошибка education_qualification err => employee_id = ${item.id} => ${e}` })
                        item.education_qualification_id = education_qualification_id.id
                    } else {
                        item.education_qualification_id = get_qualification[0].id;
                    }
                    const {data: get_education_profile} = await lov_get_db({table_name: 'ref.education_profile', external_id: item_education.education_profile.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get education_profile err => employee_id = ${item.id} => ${e}` });
                    if (!get_education_profile.length) {
                        const education_profile_id = await lov_post_db({
                            table_name: 'ref.education_profile',
                            name_rus: item_education.education_profile.name_rus ? item_education.education_profile.name_rus : " ",
                            name_kaz: item_education.education_profile.name_kaz ? item_education.education_profile.name_kaz : " ",
                            external_id: item_education.education_profile.external_id
                        }).catch(e => { throw `Запись в education_profile ${e}` })
                        item.education_profile_id = education_profile_id.id
                    } else {
                        item.education_profile_id = get_education_profile[0].id;
                    }
                    let {data: get_education}: any = await lov_get_db({table_name: 'hr.employee_education', employee_id: item.id, education_type_id: item_education.type_education}).catch(e => { throw `Ошибка get education_qualification err => ${e}` });
                    if (!get_education.length) {
                        await lov_post_db({
                            table_name: 'hr.employee_education', 
                            employee_id: item.id,
                            education_type_id: item_education.type_education,
                            education_form_id: item_education.form_of_education,
                            education_institution_id: item.education_institution_id,
                            education_speciality_id: item.education_speciality_id,
                            education_qualification_id: item.education_qualification_id,
                            education_profile_id: item.education_profile_id,
                            education_document_id: item_education.education_document,
                            enrollment_date: item_education.date_of_enrollment,
                            graduation_date: item_education.graduation_date,
                            education_document_number: item_education.number_document | -1,
                            education_document_date: item_education.date_document
                        }).catch(e => { throw `Ошибка employee_education err => ${e}` })
                    }
                }

                for (const item_document of item.documents) {
                    let {data: get_document}: any = await lov_get_db({table_name: 'hr.employee_document', employee_id: item.id, employee_document_type_id: item_document.type_document}).catch(e => { throw `Ошибка get employee_document err => ${e}` });
                    if (!get_document.length) {
                        await lov_post_db({
                            table_name: 'hr.employee_document', 
                            employee_id: item.id,
                            employee_document_type_id: item_document.type_document, 
                            number: item_document.number,
                            serial: item_document.serial,
                            issue_date: item_document.date_of_issue,
                            valid_date: item_document.valid_date,
                            issued_by: item_document.issuing_authority
                        }).catch(e => { throw `Ошибка employee_education err => ${e}` })
                    }
                }
                for (const item_contact of item.contact_informations) {
                    let {data: get_contact_type}: any = await lov_get_db({table_name: 'ref.contact_info_type', external_id: item_contact.contact_information_type.external_id, lang: 'rus'}).catch(e => { throw `Ошибка get contact_info_type err => ${e}` });
                    if (!get_contact_type.length) {
                        get_contact_type = await lov_post_db({
                            table_name: 'ref.contact_info_type',
                            external_id: item_contact.contact_information_type.external_id,
                            name_rus: item_contact.contact_information_type.name_rus ? item_contact.contact_information_type.name_rus : " ",
                            name_kaz: item_contact.contact_information_type.name_kaz ? item_contact.contact_information_type.name_kaz : " "
                        }).catch(e => { throw `Ошибка contact_info_type err => ${e}` })
                    }
                    let {data: get_contact}: any = await lov_get_db({
                        table_name: 'hr.employee_contact_info',
                        employee_id: item.id, 
                        name_rus: item_contact.name_rus ? item_contact.name_rus : " ", 
                        contact_info_type_id: Array.isArray(get_contact_type) ? get_contact_type[0].id : get_contact_type.id
                    }).catch(e => { throw `Ошибка get employee_contact_info err => ${e}` });

                                        let employee_contact_info_id
                    if (!get_contact.length) {
                        employee_contact_info_id = await lov_post_db({
                            table_name: 'hr.employee_contact_info', 
                            employee_id: item.id,
                            contact_info_type_id: Array.isArray(get_contact_type) ? get_contact_type[0].id : get_contact_type.id,
                            name_rus: item_contact.name_rus ? item_contact.name_rus : " ",
                            name_kaz: item_contact.name_kaz ? item_contact.name_kaz : item_contact.name_rus || " " ,
                            external_id: -1 
                        }).catch(e => { throw `Ошибка employee_contact_info err => ${e}` })

                        employee_contact_info_id = employee_contact_info_id.id
                    } else {
                        await lov_put_db({
                            table_name: 'hr.employee_contact_info', 
                            name_kaz: item_contact.name_kaz ? item_contact.name_kaz : item_contact.name_rus || " " , 
                            is_active: true, 
                            id: get_contact[0].id
                        })

                        employee_contact_info_id = get_contact[0].id
                    }

                    await custom_disable_others({
                        employee_id: item.id, 
                        id: employee_contact_info_id, 
                        contact_info_type_id: Array.isArray(get_contact_type) ? get_contact_type[0].id : get_contact_type.id
                    }).catch(e => { throw `Ошибка отключения других записей employee_contact_info err => ${e}` })

                }
            } catch(err) {

                throw { message: `Ошибка обновления / записи сотрудника : ${err}` }
            } finally {
                log.info(`ИИН Сотрудника : ${item.iin} -> End`);
            }
        }
    } catch (err) {
        throw err;
    }
}