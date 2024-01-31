import log from '../config/logger';
import { Client } from 'pg';

export async function report_access_user_list_get_db(bind: any, client: Client): Promise<Array<any>> {
  let query: string = ''
  let values: Array<any> = []
  try{

    query = `
      select 
        rf.id,
        rf.report_form_id,
        rf.user_id,
        e.first_name_${bind.lang} as first_name,
        e.last_name_${bind.lang} as last_name,
        e.middle_name_${bind.lang} as middle_name,

        o.name_${bind.lang} as organization_name,
        d.name_${bind.lang} as department_name
        
      from ref.report_form_access rf,
      hr.department d,
      hr.organization o,
      hr.employee e
      where rf.report_form_id = $1
      and e.id = rf.user_id
      and e.department_id = d.id
      and d.organization_id = o.id
      and rf.is_deleted = false
    `

    values = [bind.report_form_id]

    let {rows: list} = await client.query({text: query, values: values})

    return list

  }catch(err){
    log.debug(query)
    log.error(`Error in report_access_user_list_get_db -> ${JSON.stringify(err)}`)
    throw err
  }
}

export async function report_access_user_list_add_db(bind: any, client: Client): Promise<number> {
  let query: string = ''
  let values: Array<any> = []
  try{

    query = `
      insert into ref.report_form_access
      (report_form_id, user_id, create_date, create_user_id, update_date, update_user_id)
      values 
      ($1, $2, current_timestamp, $3, current_timestamp, $3)
      returning id
    `

    values = [bind.report_form_id, bind.access_user_id, bind.user_id]

    let {rows: {[0]: id}} = await client.query({text: query, values: values})

    return id

  }catch(err){
    log.debug(query)
    log.error(`Error in report_access_user_list_add_db -> ${JSON.stringify(err)}`)
    throw err
  }
}

export async function report_access_user_list_delete_db(bind: any, client: Client): Promise<number> {
  let query: string = ''
  let values: Array<any> = []
  try{

    query = `
    update ref.report_form_access 
    set is_deleted = true,
    update_date = current_timestamp,
    update_user_id = $2
    where id = $1
    `

    values = [bind.id, bind.user_id]

    let {rows: {[0]: id}} = await client.query({text: query, values: values})

    return id

  }catch(err){
    log.debug(query)
    log.error(`Error in report_access_user_list_delete_db -> ${JSON.stringify(err)}`)
    throw err
  }
}
