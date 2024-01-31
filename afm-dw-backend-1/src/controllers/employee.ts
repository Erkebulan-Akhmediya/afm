import express from 'express';
import {employee_put_db_new,employee_get_db,employee_get_all_db,employee_education_db,employee_sports_db ,employee_fines_db,employee_adgs_db,employee_put_db,employee_languages_db ,employee_subordinates_get_db,employee_worklist_db, organization_subordinates_get_db, employee_get_positions_db, employee_get_access_scud_department_list, get_organization_dep_list, employee_birthday_get_db, existEmployeeExplanatory} from '../db_apis/employee/employee';
import {employee_contact_get_db,employee_contact_post_db,employee_contact_put_db} from '../db_apis/employee/employee_contact'
import {employee_document_get_db} from '../db_apis/employee/employee_document'
import {employee_education_get_db} from '../db_apis/employee/employee_education'
import createBind from '../utils/create-bind';
import is_late_comes_v2 from '../utils/isLate-v2';
import {salarylist} from '../soap/controller/soap-salarylist';
import {invOcList} from '../soap/controller/soap-invoc';
import {opvList} from '../soap/controller/soap-opvlists';
import {acsdata} from '../soap/controller/soap-acsdata';
import {acsdatav2} from '../soap/controller/soap-acsdata-v2';
import {department_get_db} from '../db_apis/departament';
import log from '../config/logger';
import get_client from '../loaders/database';
import {organization_get_db} from '../db_apis/organization';
import moment from 'moment'

import https from 'https';
import { send_employee_1c } from '../utils/integration_1c';
import { Client } from 'pg';

import {get_app_config} from '../db_apis/user'

import * as XLSX from 'xlsx'
var contentDisposition = require('content-disposition')
var Readable = require('stream').Readable

function bufferToStream(buffer: any) { 
  var stream = new Readable()
  stream.push(buffer)
  stream.push(null)

  return stream
}

import is_late_comes_v3 from '../utils/isLate-v3';
import is_late_comes_v4 from '../utils/isLate-v4';
import config from '../config/config'
import axios from 'axios';
axios.defaults.timeout = 120000;
const headers: any = {
    Authorization: `${config.get('rest:Auth_key')}`,
    "Content-Type": "application/json"
}


export async function employee_get_all (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        const employees = await employee_get_all_db();
        for (let i of employees) {
            const education = await employee_education_db({employee_id: i.id})
            const worklist = await employee_worklist_db({employee_id: i.id})
            const languages = await employee_languages_db({employee_id: i.id})
            const sports = await employee_sports_db({employee_id: i.id})
            const crimes = await employee_fines_db({employee_id: i.id})
            const adgs = await employee_adgs_db({employee_id: i.id})
            const employee : any = i;
            employee.language = languages
            employee.educations = education
            employee.sports = sports
            employee.worklist = worklist
            employee.crimes = crimes
            employee.adgs = adgs
            

            let bindEmployee = {employee_id: i.id, lang: bind.lang};

            const contacts = await employee_contact_get_db(bindEmployee);
            i.contacts = contacts.filter(item => {
                if (['Руководство'
            ].includes((i as any).department_name_rus)) {
                    if (![4].includes(item.contact_info_type_id)) {
                        return item;
                    }
                } 
                else {
                    return item;
                }
            });
            const documents = await employee_document_get_db(bindEmployee);
            i.documents = documents;

            const educations = await employee_education_get_db(bindEmployee);
            i.educations = educations;

            if (parseInt(bind.user_id, 10) != parseInt(bind.id, 10)) {

                                const dep = await department_get_db({manager_id: parseInt(bind.user_id, 10), lang: bind.lang});

                if (dep.length) {
                    const getDepartments = async (parent_id: number) => {
                        const ids = await department_get_db({parent_id, lang: bind.lang});

                        if (ids.length) {
                            const access_id_employee = ids.find(item => item.id === i.department_id);

                            if (access_id_employee) {
                                (i as any).access_watch_employee = true;
                                return true;
                            } else {
                                (i as any).access_watch_employee = false;

                                await Promise.all(ids.map( async (item: any) => { 
                                    await getDepartments(item.id)
                                }))
                            }

                        }

                        return true;

                    }

                    await Promise.all(dep.map( async (item: any) => { 
                        await getDepartments(item.id)
                    }))
                }
            }
        }

                res.locals.data = {
            statusCode: 200,
            data: employees
        }

        next();
    } catch (error) {
        next(error)
    }
}




export async function employee_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        const employees = await employee_get_db(bind);
        for (let i of employees) {

            const education = await employee_education_db({employee_id: bind.id})
            const worklist = await employee_worklist_db({employee_id: bind.id})
            const languages = await employee_languages_db({employee_id: bind.id})
            const sports = await employee_sports_db({employee_id: bind.id})
            const crimes = await employee_fines_db({employee_id: bind.id})
            const adgs = await employee_adgs_db({employee_id: bind.id})
            const employee : any = i;
            employee.language = languages
            employee.educations = education
            employee.sports = sports
            employee.worklist = worklist
            employee.crimes = crimes
            employee.adgs = adgs
            console.log("Employee edited (version 0.1) : ", employee)
            

            let bindEmployee = {employee_id: i.id, lang: bind.lang};

            const contacts = await employee_contact_get_db(bindEmployee);
            i.contacts = contacts.filter(item => {
                if (['Руководство'
            ].includes((i as any).department_name_rus)) {
                    if (![4].includes(item.contact_info_type_id)) {
                        return item;
                    }
                } 
                else {
                    return item;
                }
            });
            const documents = await employee_document_get_db(bindEmployee);
            i.documents = documents;

            const educations = await employee_education_get_db(bindEmployee);
            i.educations = educations;

            if (parseInt(bind.user_id, 10) != parseInt(bind.id, 10)) {

                                const dep = await department_get_db({manager_id: parseInt(bind.user_id, 10), lang: bind.lang});

                if (dep.length) {
                    const getDepartments = async (parent_id: number) => {
                        const ids = await department_get_db({parent_id, lang: bind.lang});

                        if (ids.length) {
                            const access_id_employee = ids.find(item => item.id === i.department_id);

                            if (access_id_employee) {
                                (i as any).access_watch_employee = true;
                                return true;
                            } else {
                                (i as any).access_watch_employee = false;

                                await Promise.all(ids.map( async (item: any) => { 
                                    await getDepartments(item.id)
                                }))
                            }

                        }

                        return true;

                    }

                    await Promise.all(dep.map( async (item: any) => { 
                        await getDepartments(item.id)
                    }))
                }
            }
        }

                res.locals.data = {
            statusCode: 200,
            data: employees
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function employee_scud(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        let date = moment().format('YYYY-MM-DD')
        let returnData = await acsdatav2({iin: bind.iin, periodstart: date, periodend: date}).catch(e => { console.log(e) });
        let isLate = is_late_comes_v2(returnData, bind.timez)
        res.locals.data = {
            statusCode: 200,
            data: isLate
        }

        next();
    } catch (error) {
        next(error)
    }
}

async function listToTree(list: any) {
    var map : any = {}, node, roots = [], i;

            for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i; 
    }

        for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.parent_id !== null) {
            list[map[node.parent_id]].children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}

function deleteEmptyDepartments(data : any) {
    let obj = data

        for (let i = 0; i < obj.length; i += 1) {
        if (obj[i].children) {
            let child = deleteEmptyDepartments(obj[i].children)

                let notEmptyChild = child.filter((item : any) => item != null)
            obj[i].children = notEmptyChild

                    let checkEmployeeChild = obj[i].children.filter((item : any) => item.type == 'employee')
            if (checkEmployeeChild.length === 0 && notEmptyChild.length === 0) {
                obj[i] = null
            }
        }
    }

    return obj
}

export async function employee_get_lates_model (client: Client, bind: any) {
    try {

        let startDate, endDate
        if (bind.startdate && bind.enddate) {
            startDate = bind.startdate
            endDate = bind.enddate
        } else {
            startDate = moment().format('YYYY-MM-DD') 
            endDate = moment().format('YYYY-MM-DD') 
        }

        var dateList = []
        var currentDate = new Date(startDate);
        while (currentDate <= new Date(endDate)) {
            dateList.push(currentDate);
            currentDate = new Date(currentDate.getTime() + (1000 * 60 * 60 * 24));
        }

        const {[0]: userEmployeeData} = await employee_get_db({id: bind.user_id, lang: bind.lang});

        let organizationId : any
        if (bind.organizationid) {
            organizationId = bind.organizationid 
        } else {
            organizationId = userEmployeeData.organization_id
        }

                let subordinates : any = []
        if (bind.type_code == 'main_lates') { 
            subordinates = await employee_subordinates_get_db(client, bind.user_id, true, bind.offset, bind.limit, 0, organizationId);

                        if (bind.offset == 0) {
                subordinates.unshift({
                    id: userEmployeeData.id,
                    last_name: userEmployeeData.last_name,
                    first_name: userEmployeeData.first_name,
                    middle_name: userEmployeeData.middle_name,
                    identification_number: userEmployeeData.identification_number,
                    department_id: userEmployeeData.department_id,
                    gender_id: userEmployeeData.gender_id,
                    view_priority: userEmployeeData.view_priority,
                    is_disabled_pacs: userEmployeeData.is_disabled_pacs
                })
            }
        } else if (bind.type_code == 'employee_list') { 
            const {[0]: subordinateEmployeeData} = await employee_get_db({id: bind.employee_id, lang: bind.lang});

            subordinates.push({
                id: subordinateEmployeeData.id,
                last_name: subordinateEmployeeData.last_name,
                first_name: subordinateEmployeeData.first_name,
                middle_name: subordinateEmployeeData.middle_name,
                identification_number: subordinateEmployeeData.identification_number,
                department_id: subordinateEmployeeData.department_id,
                gender_id: subordinateEmployeeData.gender_id,
                view_priority: subordinateEmployeeData.view_priority,
                is_disabled_pacs: subordinateEmployeeData.is_disabled_pacs
            })
        } else if (bind.type_code == 'discipline_report') { 
            let checkDepartamentList : any = await employee_get_access_scud_department_list(client, bind);

            if (checkDepartamentList.length > 0) {
                checkDepartamentList = checkDepartamentList.filter((item : any) => item.organization_id == organizationId);

                if (bind.deparment_list_filter.length > 0) {
                    checkDepartamentList = checkDepartamentList.filter((item : any) => bind.deparment_list_filter.includes(item.department_id));
                }

                let employee, employeeList = []
                for (var i = 0; i < checkDepartamentList.length; i++){
                    employee = await employee_get_db({department_id: checkDepartamentList[i].department_id, lang: 'rus'});
                    employeeList.push(...employee);
                }

                                for (var i = 0; i < employeeList.length; i++){
                    subordinates.push({
                        id: employeeList[i].id,
                        last_name: employeeList[i].last_name,
                        first_name: employeeList[i].first_name,
                        middle_name: employeeList[i].middle_name,
                        identification_number: employeeList[i].identification_number,
                        department_id: employeeList[i].department_id,
                        gender_id: employeeList[i].gender_id,
                        view_priority: employeeList[i].view_priority,
                        is_disabled_pacs: employeeList[i].is_disabled_pacs,
                        position_name: employeeList[i].position_name
                    })
                }
            } else {
                subordinates = await employee_subordinates_get_db(client, bind.user_id, false, 0, 0, 0, organizationId);

                if (bind.deparment_list_filter.length > 0) {
                    subordinates = subordinates.filter((item : any) => bind.deparment_list_filter.includes(item.department_id));
                }

                if (bind.deparment_list_filter.length > 0) {

                    if (bind.deparment_list_filter.includes(userEmployeeData.department_id)) {
                        subordinates.unshift({
                            id: userEmployeeData.id,
                            last_name: userEmployeeData.last_name,
                            first_name: userEmployeeData.first_name,
                            middle_name: userEmployeeData.middle_name,
                            identification_number: userEmployeeData.identification_number,
                            department_id: userEmployeeData.department_id,
                            gender_id: userEmployeeData.gender_id,
                            view_priority: userEmployeeData.view_priority,
                            is_disabled_pacs: userEmployeeData.is_disabled_pacs,
                            position_name: userEmployeeData.position_name
                        })
                    }
                } else {
                    if (organizationId == userEmployeeData.organization_id) {
                        subordinates.unshift({
                            id: userEmployeeData.id,
                            last_name: userEmployeeData.last_name,
                            first_name: userEmployeeData.first_name,
                            middle_name: userEmployeeData.middle_name,
                            identification_number: userEmployeeData.identification_number,
                            department_id: userEmployeeData.department_id,
                            gender_id: userEmployeeData.gender_id,
                            view_priority: userEmployeeData.view_priority,
                            is_disabled_pacs: userEmployeeData.is_disabled_pacs,
                            position_name: userEmployeeData.position_name
                        })
                    }
                }
            }
        } else {
            throw 'Не определен переход'
        }

        const appConfigResult = await get_app_config(bind);

        let customArray :any = []

        if (subordinates.length > 0) {

            let sendObj : any = {}
            customArray = []

            sendObj = {
                Start_Date: startDate,
                End_Date: endDate,
                Employees: [ ]
            }
            for (var i = 0; i < subordinates.length; i++){
                sendObj.Employees.push({iin: subordinates[i].identification_number});
            }

            let result: any = await axios.post(config.get('rest:getACSData'), sendObj, {headers})
                .catch(error => {
                    log.error('Error in REST getACSData 2. Request: ' + JSON.stringify(sendObj));
                    log.error(typeof error == 'object' ? JSON.stringify(error) : error)

                    if (error.response) {
                        throw 'Возвращена ошибка системы СКУД. Статус: '+error.response.status+(error.response.data ? (', данные: '+error.response.data) : '')
                    } else {
                        throw typeof error == 'object' ? JSON.stringify(error) : error
                    }
                })

            for (var i = 0; i < result.data.data.length; i++){

                if (result.data.data[i].Periods.length == 0) {
                    for (var d = 0; d < dateList.length; d++){
                        result.data.data[i].Periods.push({
                            "Period":{
                                "Date":moment(dateList[d]).format('YYYY-MM-DD'),
                                "Status":"Не найден сотрудник"
                            }
                        });
                    }
                }
            }

            customArray = result.data.data

            let isLate : any, currEmployeeAcsData : any
            for (var i = 0; i < subordinates.length; i++){
                subordinates[i].acsData = []

                                currEmployeeAcsData = customArray.find((item: any) => item.iin == subordinates[i].identification_number);

                for (var z = 0; z < currEmployeeAcsData.Periods.length; z++){
                    isLate = is_late_comes_v3(currEmployeeAcsData.Periods[z], bind.timez)

                                        if (isLate.acs_status == 'Отсутствует вход' || isLate.acs_status == 'Опоздание') {
                        let checkExistEmpExplanatory : any = await existEmployeeExplanatory(client, subordinates[i].id, isLate.date);

                        if (checkExistEmpExplanatory.length > 0) {
                            isLate.acs_status = 'Объяснительная согласована'
                            isLate.is_violator = false
                            isLate.is_psbl_explanatory = false 
                            isLate.is_error = false
                        }
                    }

                                        subordinates[i].acsData.push(isLate);
                }
            }
        }

        if (bind.type_code == 'discipline_report' && subordinates.length > 0) {
            let tempDepartmentList : any = await get_organization_dep_list(client, organizationId);
            for (var i = 0; i < tempDepartmentList.length; i++){
                tempDepartmentList[i].type = 'department'
                tempDepartmentList[i].children = []
            }

            subordinates.sort((a : any, b : any) => parseFloat(a.view_priority == null ? 100000 : a.view_priority) - parseFloat(b.view_priority == null ? 100000 : b.view_priority));

            for (var i = 0; i < subordinates.length; i++){
                if (subordinates[i].is_disabled_pacs == false) {
                    let findIndex = tempDepartmentList.findIndex((x : any) => x.id == subordinates[i].department_id)
                    if (findIndex != -1) {
                        tempDepartmentList[findIndex].children.push({
                            id: subordinates[i].id,
                            name: subordinates[i].last_name + ' ' + subordinates[i].first_name + ' ' + subordinates[i].middle_name,
                            type: 'employee',

                            last_name: subordinates[i].last_name,
                            first_name: subordinates[i].first_name,
                            middle_name: subordinates[i].middle_name,
                            identification_number: subordinates[i].identification_number,
                            department_id: subordinates[i].department_id,
                            gender_id: subordinates[i].gender_id,
                            view_priority: subordinates[i].view_priority,
                            is_disabled_pacs: subordinates[i].is_disabled_pacs,
                            position_name: subordinates[i].position_name,
                            acsData: subordinates[i].acsData
                        })
                    }
                }
            }

                        let tempEmplInStructure = await listToTree(tempDepartmentList)
            tempEmplInStructure = tempEmplInStructure[0].children
            let tempList = deleteEmptyDepartments(tempEmplInStructure)
            tempList = tempList.filter((item : any) => item != null)
            subordinates = tempList
        }

        return subordinates

    } catch (error) {
        throw error
    }
}

async function parseSubordinates(children: any, tables_list: any, final_table: any, bind:any, client: Client){

    for (let j of children)
    {
        if (j.type == 'employee') {
            let department_name = ''
            if (j.department_id){
                let {rows: {[0]: {department_name: dn}}} = await client.query(`select name_${bind.lang} as department_name from hr.department where id = ${j.department_id}`)
                department_name = dn
            }
            let user_final_table = ['', j.name, j.position_name, department_name, 0, 0, 0]

            for (let l in j.acsData)
            {
                if (tables_list[l] == null) {
                    tables_list[l] = {table: [], date: j.acsData[l].date, result: [0, 0, 0, 0, 0, 0]}
                }
                if (j.acsData[l].acs_status == 'Отсутствует вход') {
                    user_final_table[6] = user_final_table[6] + 1
                    user_final_table[5] = user_final_table[5] + 1
                }
                if (j.acsData[l].acs_status == 'Опоздание') {
                    user_final_table[6] = user_final_table[6] + 1
                    user_final_table[4] = user_final_table[4] + 1
                }
                j.acsData[l].acs_status == 'Опоздание'?tables_list[l].result[0]++: ''
                j.acsData[l].acs_status == 'Отсутствует вход'?tables_list[l].result[1]++: ''
                j.acsData[l].acs_status == 'Отпуск'?tables_list[l].result[2]++: ''
                j.acsData[l].acs_status == 'Командировка'?tables_list[l].result[3]++: ''
                j.acsData[l].acs_status == 'Больничный'?tables_list[l].result[4]++: ''
                j.acsData[l].acs_status == 'Объяснительная согласована'?tables_list[l].result[5]++: ''

                if (!tables_list[l].table || !Array.isArray(tables_list[l].table)) {
                    log.debug(JSON.stringify(j) + " is empty")
                    break;
                }

                tables_list[l].table = [...tables_list[l].table, [
                    tables_list[l].table.length + 1, 
                    j.name, 
                    j.position_name, 
                    department_name, 
                    j.acsData[l].first_entry_date.split(' ')[1], 
                    j.acsData[l].last_exit_date.split(' ')[1],
                    j.acsData[l].acs_status == 'Опоздание'?'Да':'Нет', 
                    j.acsData[l].acs_status == 'Отсутствует вход'?'Да':'Нет', 
                    j.acsData[l].acs_status == 'Отпуск'?'Да':'Нет', 
                    j.acsData[l].acs_status == 'Командировка'?'Да':'Нет', 
                    j.acsData[l].acs_status == 'Больничный'?'Да':'Нет', 
                    j.acsData[l].acs_status == 'Объяснительная согласована'?'Да':'Нет', 
                    j.acsData[l].officeTimeDisplay
                ]]
            }

            final_table.push(user_final_table)


        } else {
            await parseSubordinates(j.children, tables_list, final_table, bind, client)
        }
    }


}

export async function employee_get_lates_create_xls (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        let subordinates = await employee_get_lates_model(client, bind)


        let final_table:any = []

        const bookType: string = "xls"
        let wb: XLSX.WorkBook = XLSX.utils.book_new()

        let aoa_header = [[
            '№', 
            'ФИО', 
            'Должность', 
            'Подразделение', 
            'Первый вход', 
            'Последний выход', 
            'Опоздание', 
            'Отсутствует вход', 
            'Отпуск', 
            'Командировка', 
            'Больничный', 
            'Согласованная объяснительная', 
            'Учет времени в здании'
        ]]

        let ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]])
        let tables_list:any = []

        for(let i of subordinates) 
        {
            await parseSubordinates(i.children, tables_list, final_table, bind, client)

        }

        if (subordinates.length == 0) {
            XLSX.utils.sheet_add_aoa(ws, [['Нет данных']], {origin: -1})
        } else {
            if (!ws["!cols"]) ws["!cols"] = []
            ws["!cols"].push(
                { wch: 8 },
                { wch: 25 },
                { wch: 20 },
                { wch: 60 },
                { wch: 20 },
                { wch: 20 },
            );

            for (let j of tables_list) {
                XLSX.utils.sheet_add_aoa(ws, [[j.date]], {origin: -1})
                XLSX.utils.sheet_add_aoa(ws, aoa_header, {origin: -1})
                XLSX.utils.sheet_add_aoa(ws, j.table, {origin: -1})
                XLSX.utils.sheet_add_aoa(ws, [['Итого','','','','','', ...j.result]], {origin: -1})
                XLSX.utils.sheet_add_aoa(ws, [[]], {origin: -1})
            }

            let result_final_table = ['Итого', '', '', '', 0, 0, 0]

            for (let i of final_table) {
                result_final_table[4] += i[4]
                result_final_table[5] += i[5]
                result_final_table[6] += i[6]
            }


            XLSX.utils.sheet_add_aoa(ws, [['', 'Итоговый за '+ tables_list[0].date + ' - ' + tables_list[tables_list.length-1].date]], {origin: -1})
            XLSX.utils.sheet_add_aoa(ws, [['', 'ФИО', 'Должность', 'Подразделение', 'Опоздание', 'Отсутствует вход', 'Количество нарушений']], {origin: -1})
            XLSX.utils.sheet_add_aoa(ws, final_table, {origin: -1})
            XLSX.utils.sheet_add_aoa(ws, [result_final_table], {origin: -1})
        }


        XLSX.utils.book_append_sheet(wb, ws, 'Трудовая дисциплина')

        let payload: string = ""

        payload = XLSX.write(wb, {bookType: "xls", type:"buffer"})

        const stream = bufferToStream(payload)

        res.setHeader('content-disposition', contentDisposition(`Трудовая дисциплина.xls`))
        stream.pipe(res)

    } catch (err) {
        log.error(`Error in employee_get_lates_create_xls`)
        log.error(err)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function employee_get_lates (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);

        let subordinates = await employee_get_lates_model(client, bind)

        res.locals.data = {
            statusCode: 200,
            data: subordinates
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function employee_get_birthday(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client;
    try {
        const bind: any = createBind(req);
        client = get_client(); await client.connect();

        let data: any = await employee_birthday_get_db(client, bind, bind.offset, bind.limit);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller employee_get_birthday');
            }
        }
    }
}

export async function employee_salarylist(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);
        const {[0]: employee} = await employee_get_db({id: req.userinfo.user_id, lang: 'rus'});
        if (employee.identification_number != 820419350799 && employee.identification_number != 800101308051) {
            if (employee.identification_number != bind.iin) {
                throw {
                    code: '403',
                    message: 'У вас нет прав доступа к этому ресурсу'
                }
            }
        }
        const salary_data = await salarylist(bind)

        res.locals.data = {
            statusCode: 200,
            data: salary_data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function employee_invoclist(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        let {0: {identification_number: bin}} = await organization_get_db({lang: bind.lang, employee_identification_number: bind.iin})
        bind.bin = bin

        const salary_data = await invOcList(bind)
        res.locals.data = {
            statusCode: 200,
            data: salary_data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function employee_opvlist(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        const opvlist_data = await opvList(bind)
        res.locals.data = {
            statusCode: 200,
            data: opvlist_data
        }

        next();
    } catch (error) {
        next(error)
    } 
}

export async function employee_acsdata(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        const opvlist_data = await acsdata(bind)
        res.locals.data = {
            statusCode: 200,
            data: opvlist_data
        }

        next();
    } catch (error) {
        next(error)
    } 
}

export async function employee_get_access_department_list(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req);        
        client = get_client(); await client.connect();

        let checkDepartamentList : any = await employee_get_access_scud_department_list(client, bind);
        let retDepartmentListData : any = []

        if (checkDepartamentList.length > 0) {

            retDepartmentListData = checkDepartamentList
        } else {
            retDepartmentListData = await organization_subordinates_get_db(client, bind.user_id);
        }

        res.locals.data = {
            statusCode: 200,
            data: retDepartmentListData
        }

        next();
    } catch (error) {
        next(error)
    }  finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller employee put');
            }
        }
    }
}

export async function employee_activate (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect();
        // if(req.body.view_priority || req.body.view_priority === null) {
        //     await employee_put_db_new(client, {id: req.params.id, view_priority: req.body.view_priority, user_name: req.userinfo.user_name, manager_department_type_id: req.body.manager_department_type_id})
        // }

        await employee_put_db_new(client, {id: req.params.id, view_priority: req.body.view_priority, user_name: req.userinfo.user_name, manager_department_type_id: req.body.manager_department_type_id})

        const bind: any = createBind(req); 

        await client.query('COMMIT');
        res.status(204).end();
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller employee put');
            }
        }
    }
}










export async function employee_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect();
        if(req.body.view_priority || req.body.view_priority === null) {
            await employee_put_db(client, {id: req.params.id, view_priority: req.body.view_priority, user_name: req.userinfo.user_name, manager_department_type_id: req.body.manager_department_type_id})
        }

        let contact_informations: any = []

                const bind: any = createBind(req); 
        for (const item of bind.contacts) {

            try{

                let query: string = `select name_rus, name_kaz, external_id from ref.contact_info_type where id = ${item.contact_info_type_id}`
                let {rows:{[0]: contact_type}} = await client.query(query)

                contact_informations = [{
                    "NameRus": item.contact,
                    "NameKaz": item.contact,
                    "Type_Contact_Information": 3,
                    "Contact_Information_Type": {
                        "GUID": contact_type.external_id,
                        "NameRus": contact_type.name_rus,
                        "NameKaz": contact_type.name_kaz
                    }
                }]

                query = `select external_id, identification_number from hr.employee where id = ${bind.id}`
                let {rows:{[0]: employee_data}} = await client.query(query)

                const sendObj =
                    {
                    "GUID": "-1",
                    "Employees": {
                        "Employee": 
                            {
                            "guid": employee_data.external_id,
                            "IIN": employee_data.identification_number,
                            "Contact_Informations": contact_informations
                            }
                        }
                    }

                await send_employee_1c(sendObj)

                if(item.id) {
                    let is_active = false
                    await employee_contact_put_db(client, {user_id: bind.user_id, id: item.id, is_active, username: bind.user_name});
                    if(!item.is_delete) {
                        await employee_contact_post_db(client, {
                            employee_id: bind.id, 
                            contact_info_type_id: item.contact_info_type_id,
                            contact: item.contact,
                            create_user: bind.user_name,
                            update_user: bind.user_name,
                            lang: req.lang
                        });
                    }
                } else if (item.contact && item.contact.trim()) {
                    await employee_contact_post_db(client, {
                        employee_id: bind.id, 
                        contact_info_type_id: item.contact_info_type_id,
                        contact: item.contact,
                        create_user: bind.user_name,
                        update_user: bind.user_name,
                        lang: req.lang
                    });

                }

            } catch (err) {
                log.error(`Error in employee_put -> ${JSON.stringify(err)}`)
            }


        }

        await client.query('COMMIT');

        res.status(204).end();
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller employee put');
            }
        }
    }
}

export async function employee_get_positions(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        const bind: any = createBind(req);        
        client = get_client(); await client.connect();

        const position = await employee_get_positions_db(client, bind);
        res.locals.data = {
            statusCode: 200,
            data: position
        }

        next();
    } catch (error) {
        next(error)
    }  finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller employee put');
            }
        }
    }
}



export async function employee_work_list(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);

        const headers: any = {
            Authorization: `${config.get('rest:Auth_key')}`,
            "Content-Type": "application/json"
        }
        const url = `${config.get('rest:getReferenceWorklist')}/iin=${bind.iin}&bin=${bind.bin}`

               var {data: result}: any = await axios.get(url, {headers})

        res.locals.data = {
            statusCode: 200,
            data: result.data
        }

        next();
    } catch (error) {
        next(error)
    } 
}