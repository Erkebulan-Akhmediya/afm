import express from 'express';
import { Client } from 'pg';
import log from '../config/logger';
import get_client from '../loaders/database';
import { approve_get_db, approve_item_not_approved_get_db, approve_item_get_db, approve_item_orders_put_db, approve_request_create_db, approve_request_item_create_db, approve_request_item_delete_db, approve_request_item_put_db, approve_request_put_db, approve_request_rel_create_db, get_approve_request_status_db, get_count_is_assertion, approve_item_close_local_tree_db, create_report_last_approver_db, get_processing_ar_items_in_branch } from '../db_apis/approve';
import createBind from '../utils/create-bind';
import sharp from 'sharp'
import config from '../config/config'
import axios from 'axios'
import {file_get_db} from '../db_apis/file';
import { Client as MinioClient } from 'minio';
import {get_app_config} from '../db_apis/user'
import { send_employee_1c } from '../utils/integration_1c';
import { servicerequest_change_status_db } from '../db_apis/servicerequest';
import { lov_get_db, lov_post_db } from '../db_apis/lov';
import { employee_get_db } from '../db_apis/employee/employee';

const moment = require('moment');

const minioClient = new MinioClient(config.get('file'));

export async function create_report_last_approver (req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    const bind : any= createBind(req)
    client = get_client(); await client.connect()


    let id = await create_report_last_approver_db(client, bind.approver_id, bind.report_form_id, bind)

    res.locals.data = {
      statusCode: 200,
      data: id
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


export async function approve_request_item_put (req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    client = get_client(); await client.connect()
    const bind : any= createBind(req)

    await client.query('BEGIN')

    let ar_status = await get_approve_request_status_db(bind.approve_request_id, client)
    const appConfigResult = await get_app_config(bind);

    if (ar_status === 3) {
      throw 'Статус заяки на согласование был изменен, обновите страницу.'
    }

    let ar_item_status_id =
      bind.request_approve_status_id == 2? (bind.ar_item_status_id == 3?3:4) :
      bind.request_approve_status_id == 9? (bind.ar_item_status_id == 3?10:11) :
      bind.request_approve_status_id == 14? 15: 0

    if(ar_item_status_id == 0) throw new Error("incorrect request_status_id, in approve request item put function")

    await approve_request_item_put_db(bind, client, ar_item_status_id, bind.approve_comment)
    if (ar_item_status_id === 4)
    {
      log.debug('approve close with status 3')
      await approve_request_put_db(bind.approve_request_id, client, 3)

      if (bind.object_name == 'SERVICE_REQUEST' ) {
        await servicerequest_change_status_db(
          {
            sr_status_id: 8,
            current_sr_status_id: 7,
            id: bind.object_id,
            performer_user_id: '',
            sr_category_id: bind.object_info.sr_category_id,
            user_id: bind.user_id,
          }
        )
      }

      if (bind.object_info && (bind.object_info.request_type_id == 1 || bind.object_info.request_type_id == 4 || bind.object_info.request_type_id == 5)) {
        await send_universal_request_1c(bind, client)
      }

      if (bind.object_info && bind.object_info.request_type_id == 3) { 
        await send_approve_rank_1c(bind.id, ar_item_status_id, bind.approve_comment)
      }

      if (bind.object_info && bind.object_info.request_type_id == 9) { 
        await send_approve_timesheet_1c(bind.id, ar_item_status_id, bind.approve_comment, false)
      }
    }
    else {
      let query = `
        with recursive
          Rec (id, parent_id, orders, ar_item_status_id)
        as (
          select ari.id, ari.parent_id, ari.orders, ari.ar_item_status_id
          from hr.approve_request_item ari, hr.approve_request ar, hr.approve_request_rel arr
          where ar.id = ari.approve_request_id
            and ari.orders = ${bind.orders}
            and ar.id = arr.approve_request_id
            and arr.object_name = '${bind.object_name}'
            and arr.object_id = ${bind.object_id}
            and ari.parent_id ${bind.parent_id? ' = ' + bind.parent_id: 'is null'}
          union all
          select ari2.id, ari2.parent_id, ari2.orders, ari2.ar_item_status_id from
          hr.approve_request_item ari2 join Rec on (Rec.id = ari2.parent_id)
        )
        select id from Rec where ar_item_status_id in (1, 2, 8, 9, 12, 14)
      `
      let {rows: items} = await client.query(query)
      if (items.length == 0) {

        let items = await approve_item_not_approved_get_db({parent_id: bind.parent_id, orders: null, object_name: bind.object_name, object_id: bind.object_id}, client)
        if (items.length === 0) {
          items = await approve_item_not_approved_get_db({parent_id: null, orders: null, object_name: bind.object_name, object_id: bind.object_id}, client)

          if(items.length === 0) {

            log.debug('approve final')
            let count_is_assertion = await get_count_is_assertion(bind.approve_request_id, client, bind.orders)
            if (count_is_assertion === 0)
            {
              await approve_request_put_db(bind.approve_request_id, client, 4)
            } else {
              await approve_request_put_db(bind.approve_request_id, client, 2)

              if (bind.object_name == 'SERVICE_REQUEST' ) {
                await servicerequest_change_status_db(
                  {
                    sr_status_id: 2,
                    current_sr_status_id: 7,
                    id: bind.object_id,
                    performer_user_id: '',
                    user_id: bind.user_id,
                    sr_category_id: bind.object_info.sr_category_id,
                  }
                )
              }

              if (bind.object_info && (bind.object_info.request_type_id == 1 || bind.object_info.request_type_id == 4 || bind.object_info.request_type_id == 5)) {
                await send_universal_request_1c(bind, client)
              }

              if (bind.object_info && bind.object_info.request_type_id == 2) { 
                await employee_post_1c(bind)
              }
              if (bind.object_info && bind.object_info.request_type_id == 2) { 
                await send_request_for_candidate_1c(bind)
              }

              if (bind.object_info && bind.object_info.request_type_id == 3) { 
                await send_approve_rank_1c(bind.id, ar_item_status_id, bind.approve_comment)
              }

              if (bind.object_info && bind.object_info.request_type_id == 9) {
                await send_approve_timesheet_1c(bind.id, ar_item_status_id, bind.approve_comment, true)
              }

            }
          } else {
            log.debug('approve close local tree')
            await approve_item_close_local_tree_db(bind, client)
          }


        } else {
          for (let i of items) {
            log.debug('approve next step')
            let request_status_id = i.request_status_id == 1? 2 : i.request_status_id == 8 ? 9 : i.request_status_id == 12? 14: 0

            if(request_status_id == 0) throw new Error("incorrect request_status_id, in approve request item put function")

            await approve_request_item_put_db(i, client, request_status_id, null)
          }
        }
      } else {
        log.debug('approve has unapproved items on the same step')
      }
    }

    await client.query('COMMIT')

    res.locals.data = {
      statusCode: 204
    }

    next()
  } catch (error) {
    log.error(error)
    if (client) {
      await client.query('ROLLBACK')
    }
    next(error)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

export async function approve_request_item_orders_put(req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    const bind : any= createBind(req)
    client = get_client(); await client.connect()

    let new_item_status: number|null = bind.ar_item_type_id == 1? 1: bind.ar_item_type_id == 2? 8: bind.ar_item_type_id == 3? 12: null

    await approve_item_orders_put_db(client, bind.id, bind.orders, new_item_status)

    res.locals.data = {
      statusCode: 204,
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

export async function approve_request_item_delete(req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    const bind : any= createBind(req)
    client = get_client(); await client.connect()

    await approve_request_item_delete_db(client, bind.ar_item_id)

    res.locals.data = {
      statusCode: 204,
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

export async function approve_request_item_create(req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    const bind : any= createBind(req)

    let {data: {[0]: {const_value: black_list_string}}} = await lov_get_db({table_name: 'ref.sys_all_const', name: 'cannotBeApprover'});

    let black_list = black_list_string.split(',')

    let approver = await employee_get_db({id: bind.item.approver_id, lang: bind.lang})

    if (black_list.includes(approver[0].identification_number.toString())) 
    {
      throw('Этот сотрудник не может быть назначен согласующим')
    }

    client = get_client(); await client.connect()

    bind.is_project = true

    let item_id = await approve_request_item_create_db(bind, client, bind.approve_request_id, bind.item)

    res.locals.data = {
      statusCode: 201,
      data: item_id
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

export async function approve_request_create(req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    const bind : any= createBind(req)
    client = get_client(); await client.connect()

    bind.is_project = true

    let id = await approve_request_create_db(bind, client, -1)

    await approve_request_rel_create_db(bind, client, id, 'REQUEST', bind.request_id)

    res.locals.data = {
      statusCode: 201,
      data: id
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

export async function approve_request_final(req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    const bind : any= createBind(req)
    client = get_client(); await client.connect();
    await approve_request_put_db(bind.id, client, bind.ar_item_status_id)

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

export async function approve_redirect(req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    const bind : any= createBind(req)
    client = get_client(); await client.connect()

    await client.query('BEGIN')

    let request_status_id = 0
    if (bind.redirect_type == 1)
    {
      request_status_id = 5
    } else if (bind.redirect_type == 2) {
      request_status_id = 13
    } else {
      throw new Error('invalid redirect type')
    }

    if(request_status_id == 0) throw new Error("incorrect request_status_id, in approve request item put function")


    await approve_request_item_put_db(bind, client, request_status_id, '')

    let created_items = []

    for (let item of bind.approve_rule_items) {
      item.id = null
      item.orders = Number(item.orders)

      if (item.orders == 1) {
        bind.is_project = false
      }else {
        bind.is_project = true
      }

      bind.do_change_create_user = true
      created_items.push(await approve_request_item_create_db(bind, client, bind.approve_request_id, item)) 
    }


    await client.query('COMMIT')

    res.locals.data = {
      statusCode: 201,
      data: created_items
    }

    next()
  } catch (error) {
    log.error(error)
    if (client) {
      await client.query('ROLLBACK')
    }
    next(error)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

export async function approve_get (req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    const bind : any= createBind(req)
    client = get_client(); await client.connect()

    let approve = await approve_get_db(bind, client)

    res.locals.data = {
        statusCode: 200,
        data: approve
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

export async function approve_item_get (req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const bind : any= createBind(req)

    let approve_item = await approve_item_get_db(bind)

    res.locals.data = {
        statusCode: 200,
        data: approve_item
    }

    next()
  } catch (error) {
    next(error)
  }
}

export async function send_request_for_candidate_1c (bind: any) {
  let client: Client | null = null
  try {

    client = get_client(); await client.connect()

    let query = `
    select
        r.id as request_id,
        r.request_type_id,
        r.request_sub_type_id,
        json_agg(
          json_build_object(
            'Attribute_Id', c.id,
            'Value',
                  (

                    select case when c.value_type_id = 4 then
                    (
                        select
                            display_value_rus
                        from
                            ref.characteristic_value cv
                        where  cv.value = rcr.value
                        and cv.characteristic_id = c.id
                    )
                    when c.value_type_id = 5 then
                    (
                        select cc.name from hr.retCharCatalogData(c.id) cc where cc.id = rcr.value::integer
                    )
                    when c.value_type_id = 3 then
                      rcr.value
                    else rcr.value
                    end
                )
            ,
            'Employes', 
            (
              select 
                json_agg(
                  json_build_object(
                    'Full_Name', e.last_name_${bind.lang} || ' ' || e.first_name_${bind.lang} || ' ' || e.middle_name_${bind.lang},
                    'Identification_Number', e.identification_number,
                    'Guid', e.external_id
                  )
                ) 
              from hr.request_employee_rel rer, hr.employee e
              where 
                rer.request_id = r.id
                and e.id = rer.employee_id
            ),
            'Key', c.name,
            'External_Id',
                  (
                    case when c.value_type_id = 5 then
                    (
                        select cc.external_id from hr.retCharCatalogData(c.id) cc where cc.id = rcr.value::integer
                    )
                    else null
                    end
                )
          )
        ) as Attributes
      from hr.request r, hr.request_char_rel rcr, ref.characteristic c
      where r.id = ${bind.object_id}
      and c.id = rcr.characteristic_id
      and rcr.request_id = r.id
      group by r.id
    `

    let {rows: {[0]: request_data}} = await client.query(query)

    const sendObj = {
        Request_Id: request_data.request_id,
        Request_Type_Id: request_data.request_type_id,
        Request_Sub_Type_Id: request_data.request_sub_type_id,
        Employee_External_Id: '',
        Attributes: request_data.attributes,
    }

    let headers: any = {
        Authorization: `${config.get('rest:Auth_key')}`,
        "Content-Type": "application/json"
    }

    console.time('send_request_for_candidate_1c')
    log.info('request_for_candidate send data: ' + JSON.stringify(sendObj))
    let result = await axios.post(`${config.get('rest:AFM_Request')}`, sendObj, {headers}).catch((error) => {
        log.error(error)
        throw error.response.data.errMsg
    })
    log.info('request_for_candidate responce data: ' + result.status + ', '+result.data)
    console.timeEnd('send_request_for_candidate_1c')

    return
  } catch (error: any) {
    log.error(error)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

export async function employee_post_1c (bind: any) {
  let client: Client | null = null
  try {
    client = get_client(); await client.connect()

    console.time('createObjSendto1C')

    let query = `
      select
        r.id as request_id,

        (
          select json_agg(
            json_build_object(
              'Type_Education', ee.education_type_id,
              'Date_Of_Enrollment', to_char(ee.enrollment_date, 'YYYY-mm-dd'),
              'Graduation_Date', to_char(ee.graduation_date, 'YYYY-mm-dd'),
              'Form_Of_Education', ee.education_form_id,
              'Educational_Institution', coalesce(
                json_build_object(
                  'GUID', ei.external_id,
                  'NameRus', ei.name_rus,
                  'NameKaz', ei.name_kaz
                ), '[]'::json
              ),
              'Specialty', coalesce(
                json_build_object(
                  'GUID', es.external_id,
                  'NameRus', es.name_rus,
                  'NameKaz', es.name_kaz
                ), '[]'::json
              ),
              'Qualification', coalesce(
                json_build_object(
                  'GUID', eq.external_id,
                  'NameRus', eq.name_rus,
                  'NameKaz', eq.name_kaz
                ), '[]'::json
              ),
              'Education_Profile', coalesce(
                json_build_object(
                  'GUID', ep.external_id,
                  'NameRus', ep.name_rus,
                  'NameKaz', ep.name_kaz
                ), '[]'::json
              ),
              'Education_Document', ee.education_document_id,
              'Number_Document', ee.education_document_number,
              'Date_Document', to_char(ee.education_document_date, 'YYYY-mm-dd')
            )
          )
          from hr.employee_education ee, ref.education_institution ei, ref.education_speciality es, ref.education_qualification eq, ref.education_profile ep
          where ee.employee_id = r.employee_id
          and ei.id = ee.education_institution_id
          and es.id = ee.education_speciality_id
          and eq.id = ee.education_qualification_id
          and ep.id = ee.education_profile_id
        ) as educations,
        (
          select coalesce(
            json_agg(
              json_build_object(
                'Type_Document', ed.employee_document_type_id,
                'Number', ed.number,
                'Serial', ed.serial,
                'Date_Of_Issue', to_char(ed.issue_date, 'YYYY-mm-dd'),
                'Valid_Date', to_char(ed.valid_date, 'YYYY-mm-dd'),
                'Issuing_Authority', ed.issued_by
              )
            ), '[]'::json
          )
          from hr.employee_document ed
          where ed.employee_id = r.employee_id
        ) as identity_documents,
        (
          select coalesce(
            json_agg(
              json_build_object(
                'NameRus', eci.name_rus,
                'NameKaz', eci.name_kaz,
                'Type_Contact_Information', 3,
                'Contact_Information_Type', json_build_object(
                  'GUID', cit.external_id,
                  'NameRus', cit.name_rus,
                  'NameKaz', cit.name_kaz
                )
              )
            ), '[]'::json
          )
          from hr.employee_contact_info eci, ref.contact_info_type cit
          where eci.employee_id = r.employee_id
          and cit.id = eci.contact_info_type_id
        ) as contact_informations


      from hr.request r
      where r.id = ${bind.object_id}
    `

    let {rows: {[0]: employee_data}} = await client.query(query)

    console.timeEnd('createObjSendto1C')

    let photo: any = null

    let fileData = await file_get_db({query: {object: bind.candidate_id, objectType: 1}})
    if(fileData) {
      minioClient.getObject(fileData.bucket_name, `${fileData.id}_${fileData.name}`, async function(err: any, stream: any) {
        if (err) {
          if(err.code == 'NoSuchKey') {
            throw new Error('File not exist')
          } else {
            throw new Error(err)
          }
        }
        let bufs: any = []
        let buf
        await stream.on('data', function(d: any){ bufs.push(d); });
        await stream.on('end', async function(){
          buf = Buffer.concat(bufs);
          try {
            console.log('----- sharp 1 -----')
            buf = await sharp(buf).resize(120, 170).toBuffer();
          } catch (error) {
            log.error('error resize image: ', error)
          }
          photo = buf.toString('base64');

          const sendObj =
            {
            "GUID": "-1",
              "Employees": {
                "Employee": {
                  "guid": -1,
                  "IIN": employee_data.identification_number,
                  "Employee": employee_data.full_name,
                  "Name": employee_data.first_name + " ",
                  "Surname": employee_data.last_name + " ",
                  "Middlename": employee_data.middle_name,
                  "Gender": employee_data.gender,
                  "Birthday": employee_data.birth_date,
                  "Family_Status": employee_data.family_status,
                  "Nationality": {
                    "GUID": employee_data.nationality_guid,
                    "NameRus": employee_data.nationality_rus,
                    "NameKaz": employee_data.nationality_kaz
                  },
                  "Educations": employee_data.educations,
                  "Identity_Documents": employee_data.identity_documents,
                  "Contact_Informations": employee_data.contact_informations,
                  "Photo": photo,
                  "File_Extension": "data:image/jpeg;base64"
                }
              }
            }


          await send_employee_1c(sendObj);

        })
      })
    }

    return
  } catch (error: any) {
    log.error(error)
  } finally {
    if (client) {
      await client.end()
    }
  }
}


export async function send_approve_rank_1c (approveItemId: any, arItemStatusId: any, approveComment: any) {
  let client: Client | null = null
  try {
    client = get_client(); await client.connect()

    let query = `
      select 
        t4.external_request_id,
        t5.external_id as employee_external_id,
        t1.ar_item_status_id,
        t1.approve_date,
        t1.comment,
        t6.external_id as approver_external_id
      from 
        hr.approve_request_item t1, 
        hr.approve_request t2, 
        hr.approve_request_rel t3, 
        hr.request t4, 
        hr.request_employee_rel t4_1,
        hr.employee t5, 
        hr.employee t6
      where 
        t1.approve_request_id = t2.id
        and t2.id = t3.approve_request_id
        and t3.object_name = 'REQUEST'
        and t3.object_id = t4.id
        and t4.id  = t4_1.request_id
        and t4_1.employee_id = t5.id
        and t1.employee_id = t6.id
        and t1.id = ${approveItemId}
    `

    let {rows: {[0]: request_data}} = await client.query(query)

    let headers: any = {
        Authorization: `${config.get('rest:Auth_key')}`,
        "Content-Type": "application/json"
    }

    try {
      console.time('approved_rank');

      const sendObj:any =
      {
          "request_guid": request_data.external_request_id, 
          "employee_guid": request_data.employee_external_id, 
          "approve_date": moment(new Date()).format("DD.MM.YYYY HH:mm:ss"), 
          "is_approved": arItemStatusId == 3 ? true : false, 
          "approve_note": approveComment, 
          "approve_employee": request_data.approver_external_id 
      };

            log.info('approved_rank send data: ' + JSON.stringify(sendObj))
      let result = await axios.post(`${config.get('rest:approved_rank')}`, sendObj, {headers}).catch((error) => {
          log.error(error)
          throw error.response.data.errMsg
      })
      log.info('approved_rank responce data: ' + result.status + ', '+result.data)

            } catch (err) {
      log.error(err)
    } finally{
      console.timeEnd('approved_rank')
    }

    return
  } catch (error: any) {
    log.error(error)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

export async function send_approve_timesheet_1c (approveItemId: any, arItemStatusId: any, approveComment: any, isAccept: any) {
  let client: Client | null = null
  try {
    client = get_client(); await client.connect()

    let query = `
    select 
      t4.external_request_id,
      t6.external_id as employee_external_id,
      t1.ar_item_status_id,
      t1.approve_date,
      t1.comment,
      t7.external_id as approver_external_id
    from 
      hr.approve_request_item t1, 
      hr.approve_request t2, 
      hr.approve_request_rel t3, 
      hr.request t4, 
      hr.request_employee_rel t5, 
      hr.employee t6, 
      hr.employee t7
    where 
      t1.approve_request_id = t2.id
      and t2.id = t3.approve_request_id
      and t3.object_name = 'REQUEST'
      and t3.object_id = t4.id
      and t4.id = t5.request_id
      and t5.employee_id = t6.id
      and t1.employee_id = t7.id
      and t1.id = ${approveItemId}`

    let {rows: {[0]: request_data}} = await client.query(query)

    query = `
     select f.id, 
            f.name, 
            ot.bucket_name
       from hr.file f
            join hr.object_file obf on obf.file_id = f.id
            join ref.object_type ot on obf.object_type_id = ot.id
      where ot.id = 11
            and obf.object_id = ${request_data.request_id}
            and f.is_active = true
            and f.create_user not in (select description from ref.sys_all_const where name = '1СUserName')
      order by f.create_date desc`

    let {rows: file_data} = await client.query(query)

    if (file_data.length == 0 && isAccept == true) {
      throw 'send_approve_timesheet_1c no data file in request id '+ request_data.request_id
    }

    if (isAccept == false) {
      await invoke_1c_approved_timesheet_service(request_data.request_external_id, arItemStatusId, approveComment, request_data.approver_external_id, '', '');
      return
    }

    minioClient.getObject(file_data[0].bucket_name, `${file_data[0].id}_${file_data[0].name}`, async function(err: any, stream: any) {

      if (err) {
        if(err.code == 'NoSuchKey') {
          throw new Error('File not exist')
        } else {
          throw new Error(err)
        }
      }

      let bufs: any = [], buf
      await stream.on('data', function(d: any) { 
        bufs.push(d); 
      });
      await stream.on('end', async function() {
        buf = Buffer.concat(bufs);

        await invoke_1c_approved_timesheet_service(request_data.request_external_id, arItemStatusId, approveComment, request_data.approver_external_id, buf, file_data[0].name);
      })
      await stream.on('error', function(d: any) { 
      });
      await stream.on('close', function(d: any) { 
      });
    })
  } catch (error: any) {
    log.error(error)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

export async function invoke_1c_approved_timesheet_service (requestExternalId: any, arItemStatusId: any, approveComment: any, approverExternalId: any, buf: any, fileName: any) {

  let headers: any = {
    Authorization: `${config.get('rest:Auth_key')}`,
    "Content-Type": "application/json"
  }

  try {
    console.time('approved_timesheet');

    const sendObj:any =
    {
        "request_guid": requestExternalId, 
        "approve_date": moment(new Date()).format("DD.MM.YYYY HH:mm:ss"), 
        "is_approved": arItemStatusId == 3 ? true : false, 
        "approve_note": approveComment, 
        "approve_employee": approverExternalId, 
        "file_data": buf.toString('base64'),
        "file_name": fileName
    };

        log.info('approved_timesheet send data: ' + JSON.stringify(sendObj))
    let result = await axios.post(`${config.get('rest:approved_timesheet')}`, sendObj, {headers}).catch((error) => {
        log.error(error)
        throw error.response.data.errMsg
    })
    log.info('approved_timesheet responce data: ' + result.status + ', '+result.data)

        } catch (err) {
    log.error(err)
  } finally{
    console.timeEnd('approved_timesheet')
    return
  }
}


export async function send_universal_request_1c (bind: any, client: Client) {
  try {

    console.time('createObjSendto1C')

    let query = `
      select 
        json_build_object(
          'Request_Id', r.id, 

          'Approve_Status_Id', ar.approve_request_status_id,
          'Approve_Status_Name_Rus', ars.name_rus,
          'Approve_Status_Name_Kaz', ars.name_kaz,

          'Request_Type_Id', r.request_type_id,
          'Request_Type_Name_Rus', rt.name_rus,
          'Request_Type_Name_Kaz', rt.name_kaz,

          'Request_Sub_Type', json_build_object(
            'Name', rst.name_rus,
            'Guid', rst.external_id
          ),

          'Author', json_build_object(
            'Full_Name', e.last_name_rus || ' ' || e.first_name_rus || ' ' || e.middle_name_rus,
            'Identification_Number', e.identification_number,
            'Guid', e.external_id
          ),

          'Employees', 
          (
            select 
              json_agg(
                json_build_object(
                  'Full_Name', e.last_name_rus || ' ' || e.first_name_rus || ' ' || e.middle_name_rus,
                  'Identification_Number', e.identification_number,
                  'Guid', e.external_id
                )
              ) 
            from hr.request_employee_rel rer, hr.employee e
            where 
              rer.request_id = r.id
              and e.id = rer.employee_id
          ),
          'Attributes', (select json_agg(json_build_object(
              'Attribute_Id', c.id,
            'Name', c.name,
                  'Value',
                        (

                          select case when c.value_type_id = 4 then
                          (
                              select
                                  display_value_rus
                              from
                                  ref.characteristic_value cv
                              where  cv.value = rcr.value
                              and cv.characteristic_id = c.id
                          )
                          when c.value_type_id = 5 then
                          (
                              select cc.name from hr.retCharCatalogData(c.id) cc where cc.id = rcr.value::integer
                          )
                          when c.value_type_id = 3 then
                            rcr.value
                          else rcr.value
                          end
                      ),
                    'Guid', 
                      (select 
                          case when c.value_type_id = 5 and (
                          SELECT
                            count(1)
                          FROM   pg_attribute
                                      WHERE  attrelid = c.catalog_name::regclass
                                      AND  attname = 'external_id'
                          ) > 0 then 
                            (
                            select cc.external_id from hr.retCharCatalogData(c.id) cc where cc.id = rcr.value::integer
                          )
                            else NULL
                        end
                      )
                      
          ))
            from hr.request_char_rel rcr, ref.characteristic c
            where rcr.request_id = r.id and c.id = rcr.characteristic_id
                ),
          'Approvers', (
            select json_agg(json_build_object(
              'Id', e.id , 
              'Guid', e.external_id, 
              'Identification_Number', e.identification_number,
              'Full_Name', e.last_name_rus || ' ' || e.first_name_rus || ' ' || e.middle_name_rus,
              'Status_Id', ari.ar_item_status_id,
              'Status_Name_Rus', ais.name_rus,
              'Status_Name_Kaz', ais.name_kaz,
              'Comment', ari.comment,
              'Approve_Date', ari.approve_date
            ))
            from hr.approve_request_item ari, hr.employee e, ref.ar_item_status ais
            where ari.approve_request_id = ar.id
            and e.id = ari.employee_id
            and ais.id = ari.ar_item_status_id
          ),
          'Files', '[]'::json
        )  
      from hr.request r, hr.employee e, hr.user u, ref.request_sub_type rst, hr.approve_request_rel arr, hr.approve_request ar, ref.approve_request_status ars, ref.request_type rt
      where 
        e.id = u.id
        and r.request_type_id = rt.id
        and ars.id = ar.approve_request_status_id
        and ar.id = arr.approve_request_id
        and arr.object_id = r.id
        and arr.object_name = 'REQUEST'
        and rst.id = r.request_sub_type_id
        and u.username = r.create_user
        and r.id = ${bind.object_id}
    `

    let {rows: {[0]: {json_build_object: employee_data}}} = await client.query(query)


    console.timeEnd('createObjSendto1C')

    const sendObj = employee_data

    let headers: any = {
        Authorization: `${config.get('rest:Auth_key')}`,
        "Content-Type": "application/json"
    }

    let result = await axios.post(`${config.get('rest:AFM_Request')}`, sendObj, {headers}).catch((error) => {
        let errorText
        if (error.response) {
            errorText = 'Возвращена ошибка при передаче заявки в 1С (код ответа '+error.response.status+(error.response.data ? ', '+error.response.data : '')+')'
        } else {
            errorText = 'Возвращена ошибка при передаче заявки в 1С ('+typeof error == 'object' ? JSON.stringify(error) : error+')'
        }

        lov_post_db({
            table_name: 'app.integration_log',
            code: 'rest-afm_request',
            request_data: JSON.stringify(sendObj),
            invoke_date: new Date().toISOString(),
            error_data: errorText,
        })

        throw errorText
    })

    await lov_post_db({
        table_name: 'app.integration_log',
        code: 'rest-afm_request',
        request_data: JSON.stringify(sendObj),
        responce_data: JSON.stringify(result.data),
        invoke_date: new Date().toISOString(),
    })

    log.info('success response data: ' + result.status + ', '+JSON.stringify(result.data))

    return
  } catch (error: any) {
    log.error(error)
  }
}