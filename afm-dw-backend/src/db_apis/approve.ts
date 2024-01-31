import { Client } from 'pg';
import log from '../config/logger';
import { create_notification_in_bc, deactivate_notification_in_bc } from '../controllers/notification';
import get_client from '../loaders/database';

export async function create_report_last_approver_db(client: Client, approver_id: number, report_form_id: number, bind: any) {
  let query: string = ''
  let values = []
  try {
    query = `delete from hr.report_last_approver where report_form_id = ${report_form_id}`
    await client.query(query)

    query = `
      insert into hr.report_last_approver (report_form_id, approver_id, create_user_id, create_date, update_user_id, update_date) 
      values ($1, $2, $3, current_date, $3, current_date)
      returning id
    `

    values = [report_form_id, approver_id, bind.user_id]

    let {rows: {[0]: id}} = await client.query({text:query, values: values})

    return id

  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err
  }
}

export async function deactivate_approve_request_by_creator(client: any, approve_request_id: number): Promise<void> {
  let query: string = ''
  try {

    query = `
      update hr.approve_request set
        approve_request_status_id = 6
      where id = $1
    `

    await client.query({text: query, values: [approve_request_id]})

    await deactivate_notifications(client, approve_request_id)

    query = `
      select 
        id,
        employee_id
      from 
        hr.approve_request_item  
      where 
        approve_request_id = $1
        and ar_item_status_id in (2, 9, 14)
    `

    let {rows: active_notifications} = await client.query({text: query, values: [approve_request_id]})

    query = `
      update hr.approve_request_item set
        ar_item_status_id = 7
      where approve_request_id = $1
      and ar_item_status_id in (1, 2, 8, 9, 12, 14)
    `

    await client.query({text: query, values: [approve_request_id]})
    return
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err
  }
}

async function deactivate_notifications(client: Client, approve_request_id: Number): Promise<void> {
    let query = `
      select 
        id,
        employee_id
      from 
        hr.approve_request_item  
      where 
        approve_request_id = $1
        and ar_item_status_id in (2, 9, 14)
    `

    let {rows: active_notifications} = await client.query({text: query, values: [approve_request_id]})

    for (let i of active_notifications){
      deactivate_notification_in_bc(
        1,
        [i.employee_id],
        {
          entity_type_id: 5,
          entity_id: i.id
        }
      )
    }

}

export async function deactivate_approve_request(client: Client, approve_request_id: number, ar_item_id: number, approve_comment: string): Promise<void> {
  let query: string = ''
  try {

    query = `
      update hr.approve_request set
        approve_request_status_id = 5
      where id = $1
    `

    await client.query({text: query, values: [approve_request_id]})

    query = `
      update hr.approve_request_item set
        ar_item_status_id = 6,
        comment = $2
      where id = $1
    `

    await client.query({text: query, values: [ar_item_id, approve_comment]})

    await deactivate_notifications(client, approve_request_id)

    query = `
      update hr.approve_request_item set
        ar_item_status_id = 7
      where approve_request_id = $1
      and ar_item_status_id in (1, 2, 8, 9, 12, 14)
    `

    await client.query({text: query, values: [approve_request_id]})

    return
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err
  }
}

export async function get_count_is_assertion(id: number, client: Client, orders:number): Promise<number> {

  let query: string = ''
  try {

    query = `select count(1) as count_approves from hr.approve_request_item where approve_request_id = ${id} and orders = ${orders} and ar_item_status_id = 3`

    let {rows: { [0]: {count_approves: count}}}: any = await client.query(query)
    return count
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err
  }
}



export async function get_approve_request_status_db(id: number, client: Client) : Promise<number> {

  let query: string = ''
  try {

    query = `select approve_request_status_id from hr.approve_request where id = ${id}`

    let {rows: { [0]: {approve_request_status_id: ar_id}}}: any = await client.query(query)
    return ar_id
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err
  }
}

export async function approve_get_db(bind: any, client: Client) {
  let query: string = ''
  try {

    query = `select

      ar.id,

      (
        WITH RECURSIVE temp1 (
          id, parent_id, send_date, emp_name, ar_item_status, ar_item_status_id,
        approve_date, comment, orders, PATH, LEVEL ) AS (

        select table1.id, table1.parent_id, table1.send_date, table1.emp_name, table1.ar_item_status, table1.ar_item_status_id,
        table1.approve_date, table1.comment, table1.orders,
        CAST ((table1.orders || '-' || table1.id) AS VARCHAR (50)) as PATH, 1
        from
        (select t1.id, t1.parent_id, t1.send_date, t2.last_name_rus || ' ' || t2.first_name_rus emp_name, t3.name_rus ar_item_status, t3.id ar_item_status_id,
        t1.approve_date, t1.comment, t1.orders
        from hr.approve_request_item t1, hr.employee t2, ref.ar_item_status t3, hr.approve_request_rel t4
        where
        t4.object_id = ${bind.object_id}
        and t4.object_name = '${bind.object_name}'
        and t1.approve_request_id = t4.approve_request_id
        and t1.ar_item_status_id != 7
        and t1.employee_id = t2.id
        and t1.ar_item_status_id = t3.id) table1
        where table1.parent_id IS NULL

          union

        select table1.id, table1.parent_id, table1.send_date, table1.emp_name, table1.ar_item_status, table1.ar_item_status_id,
        table1.approve_date, table1.comment, table1.orders,
        CAST ( temp1.PATH ||'->'|| (table1.orders || '-' || table1.id) AS VARCHAR(50)) , LEVEL + 1
        from
        (select t1.id, t1.parent_id, t1.send_date, t2.last_name_rus || ' ' || t2.first_name_rus emp_name, t3.name_rus ar_item_status, t3.id ar_item_status_id,
        t1.approve_date, t1.comment, t1.orders
        from hr.approve_request_item t1, hr.employee t2, ref.ar_item_status t3 , hr.approve_request_rel t4
        where
        t4.object_id = ${bind.object_id}
        and t4.object_name = '${bind.object_name}'
        and t1.approve_request_id = t4.approve_request_id
        and t1.ar_item_status_id != 7
        and t1.employee_id = t2.id
        and t1.ar_item_status_id = t3.id) table1
        INNER JOIN temp1 ON( temp1.ID= table1.parent_id)
        )
        select

        json_agg(json_build_object(
            'id', id,
            'parent_id', parent_id,
            'send_date', send_date,
            'emp_name', emp_name,
            'approve_date', approve_date,
            'comment', comment,
            'orders', orders,
            'path', path,
            'level', level,
            'request_status_name', ar_item_status,
            'request_status_id', ar_item_status_id
          ) ORDER BY PATH
        )
        from temp1

      ) as approve_items,
      
      ${bind.object_name == 'REQUEST'?`
        (
            select 
                json_agg(
                    json_build_object(
                        'id', rer.employee_id,
                        'last_name', e.last_name_${bind.lang},
                        'first_name', e.first_name_${bind.lang},
                        'middle_name', e.middle_name_${bind.lang},
                        'department_id', e.department_id,
                        'identification_number', e.identification_number,
                        'employee_type_id', e.employment_type_id,
                        'position_id', e.position_id,
                        'employee_department_full_list', hr.retEmpFullDepList(e.id),
                        'position_name', p.name_${bind.lang}
                    )
                ) 
            from hr.request_employee_rel rer
                join hr.employee e on rer.employee_id = e.id 
                left join hr.position p on e.position_id = p.id
            where 
                rer.request_id = ob.id
        ) employees,
      `: ''}


      ${bind.object_name == 'PASS_REQUEST'?`emp.last_name_${bind.lang} || ' ' || emp.first_name_${bind.lang} || ' ' || emp.middle_name_${bind.lang} as emp_name,`: ''}
      d.name_${bind.lang} as emp_department_name,

      ${bind.object_name == 'PASS_REQUEST'?'hr.retEmpFullDepList(emp.id) as emp_department_full_list,': ''}
      o.name_${bind.lang} as emp_organization_name,

      case when arr.object_name = 'PASS_REQUEST' then
        (
          select
            ob.name_${bind.lang}
          from
            hr.pass_request pr,
            hr.organization_building ob
          where
            pr.id = arr.object_id
            and ob.id = pr.organization_building_id
        )
      else null
      end as building_name,
      case when arr.object_name = 'REQUEST' then
        (select
          json_agg(
            json_build_object(
              'id', rcr.id,
              'name', char.name,
              'catalog_name', char.catalog_name,
              'value', ( select json_agg(rcr.value) from hr.request_char_rel rcr where rcr.request_id = ob.id and rcr.characteristic_id = char.id ),
              'value_type_id', char.value_type_id,
              'characteristic_id', char.id,
              'list_value', (
                      select case when char.value_type_id = 4 then
                      (
                        select
                          json_agg(json_build_object('selectedRow', json_build_object('text', display_value_RUS)))
                        from
                          ref.characteristic_value cv, hr.request_char_rel rcr
                        where
                          rcr.request_id = ob.id
                          and cv.value = rcr.value
                          and rcr.characteristic_id = char.id
                          and cv.characteristic_id = char.id
                        )
                        when char.value_type_id = 5 then
                        (
                          select json_agg(json_build_object('selectedRow', json_build_object('text', cc.name)))
                          from hr.retCharCatalogData(char.id) cc, hr.request_char_rel rcr
                          where
                            rcr.request_id = ob.id
                            and rcr.characteristic_id = char.id
                            and cc.id = rcr.value::integer
                        )
                        else null
                        end
                      )
            ) ORDER BY ref_rstcr.view_priority
          )
          from hr.request_char_rel rcr
            join ref.characteristic char on char.id = rcr.characteristic_id
            join hr.request rqst on rqst.id = rcr.request_id
            left join ref.request_subtype_char_rel ref_rstcr 
                    on ref_rstcr.request_sub_type_id = rqst.request_sub_type_id and ref_rstcr.characteristic_id = char.id
            where rcr.request_id = arr.object_id
        )
      else '{}'::json
      end as details,


      ${bind.object_name == 'PASS_REQUEST'?'ob.employee_id as candidate_id,': ''}

      (select cover_word from hr.approve_request_item where id = ${bind.ar_item_id}) as cover_word


      from hr.approve_request ar,
        hr.${bind.object_name} ob,
        hr.department d,
        hr.organization o,
        ${bind.object_name == 'PASS_REQUEST'?'hr.employee emp,': ''}
        hr.approve_request_rel arr

      where ar.id = ${bind.approve_id}
      ${bind.object_name == 'PASS_REQUEST'?'and d.id = emp.department_id': ''}
      ${bind.object_name == 'PASS_REQUEST'?'and emp.id = ob.employee_id': ''}
      and o.id = d.organization_id

      and arr.approve_request_id = ar.id
      and arr.object_id = ob.id

      and ob.id = ${bind.object_id}
      limit 1
      `
    let {rows: request}: any = await client.query(query)
    return request;
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err;
  }
}

export async function get_processing_ar_items_in_branch (bind: any, client: Client): Promise<any> {
  let query = ''
  try{

    query = `
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

    return items
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw(err)
  }
}


export async function approve_item_not_approved_get_db(bind: any, client: Client): Promise<any> {
  let query: string = ''
  try {
    query = `select
      ari.id,
      ari.employee_id,
      ari.orders,

      ari.ar_item_status_id as request_status_id,
      ari.comment,
      ari.parent_id,
      ari.send_date,
      ari.create_date,
      ari.create_user_id,
      ari.update_date,
      ari.update_user_id

      from hr.approve_request_item ari, hr.approve_request ar, hr.approve_request_rel arr
      where ari.ar_item_status_id != 7
      and orders = (select min(orders) from hr.approve_request_item ari1, hr.approve_request ar1, hr.approve_request_rel arr1
        where ari1.ar_item_status_id != 7
        and ar1.id = ari1.approve_request_id
        and ar1.id = arr1.approve_request_id
        and arr1.object_name = '${bind.object_name}'
        and arr1.object_id = ${bind.object_id}
        and ari1.ar_item_status_id in (1, 2, 8, 9, 12, 14)
        ${bind.parent_id?'and ari1.parent_id = ' + bind.parent_id:''}
      )
      and ar.id = ari.approve_request_id
      and ar.id = arr.approve_request_id
      and arr.object_name = '${bind.object_name}'
      and arr.object_id = ${bind.object_id}
      and ari.ar_item_status_id in (1, 2, 8, 9, 12, 14)
      ${bind.parent_id?'and ari.parent_id = ' + bind.parent_id:''}
      `
    let {rows: request}: any = await client.query(query)
    return request;
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err;
  }
}
export async function approve_item_close_local_tree_db(bind: any, client: Client): Promise<void> {
  let query: string = ''
  try {

    query = `
      with recursive
        Rec (id, parent_id)
      as (
        (select id, parent_id from hr.approve_request_item ari where ari.id = ${bind.parent_id} limit 1)
        union all
        select distinct ari2.id, ari2.parent_id from hr.approve_request_item ari2 join Rec on (Rec.parent_id = ari2.id)
      )
      select id, parent_id from Rec
    `

    let {rows: root_list} = await client.query(query)

    root_list.push({id: null, parent_id: null})

    for (let i of root_list) {

      query = `
        with recursive
          Rec (id, parent_id, orders, ar_item_status_id)
        as (
          select ari.id, ari.parent_id, ari.orders, ari.ar_item_status_id
          from hr.approve_request_item ari, hr.approve_request ar, hr.approve_request_rel arr
          where ar.id = ari.approve_request_id
            and ar.id = arr.approve_request_id
            and arr.object_name = '${bind.object_name}'
            and arr.object_id = ${bind.object_id}
            and ari.parent_id ${i.parent_id? ' = ' + i.parent_id: 'is null'}
            and ari.ar_item_status_id in (5, 13)
          union all
          select ari2.id, ari2.parent_id, ari2.orders, ari2.ar_item_status_id from
          hr.approve_request_item ari2 join Rec on (Rec.id = ari2.parent_id)
        )
        select count(1) from Rec where ar_item_status_id in (1, 8, 12)
      `

      let {rows: {[0]: {count}}} = await client.query(query)

      if (count != 0)
      {
        break
      } else {

        query = `
          select min(orders) as min
          from hr.approve_request_item ari, hr.approve_request ar, hr.approve_request_rel arr
          where ari.ar_item_status_id != 7
          and ar.id = ari.approve_request_id
          and ar.id = arr.approve_request_id
          and arr.object_name = '${bind.object_name}'
          and arr.object_id = ${bind.object_id}
          and ari.ar_item_status_id in (1, 8, 12)
          ${ i.parent_id? `and ari.parent_id = ` + i.parent_id : '' /* опциональный пункт*/}
        `

        let {rows: {[0]: {min}}}: any = await client.query(query)

        if (min)
        {

          query = `select
            ari.id,
            ari.employee_id,
            ari.orders,

            ari.ar_item_status_id as request_status_id,
            ari.comment,
            ari.parent_id,
            ari.send_date,
            ari.create_date,
            ari.create_user_id,
            ari.update_date,
            ari.update_user_id

            from hr.approve_request_item ari, hr.approve_request ar, hr.approve_request_rel arr
            where ari.ar_item_status_id != 7
            and ari.orders = ${min}
            and ar.id = ari.approve_request_id
            and ar.id = arr.approve_request_id
            and arr.object_name = '${bind.object_name}'
            and arr.object_id = ${bind.object_id}
            and ari.ar_item_status_id in (1, 8, 12)
            ${ i.parent_id? `and ari.parent_id = ` + i.parent_id : '' /* опциональный пункт*/}
            `
          let {rows: items}: any = await client.query(query)
          for (let j of items) {
            let ar_item_status_id = j.request_status_id == 1? 2 : j.request_status_id == 8 ? 9 : j.request_status_id == 12? 14: 0

            if(ar_item_status_id == 0) throw new Error("incorrect ar_item_status_id, in close local tree function")

            await approve_request_item_put_db(j, client, ar_item_status_id, null)
          }
          break
        }
      }
    }

    return
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err;
  }
}

export async function approve_item_orders_put_db(client: Client, ar_item_id: number, orders: number, new_item_status: number|null): Promise<any> {
  let query: string = ''
  try {
    query = `
      update hr.approve_request_item set
        orders = $1
        ${new_item_status? ', ar_item_status_id = $3':''}
      where id = $2
    `
    let values = [orders, ar_item_id]

    if (new_item_status) values.push(new_item_status)

    await client.query({text: query, values: values})

    return
  } catch (err) {
    log.debug(`db query: ${query}`)
    log.error(err)
    throw(err)
  }
}

export async function approve_item_get_db(bind: any) {
  let client: Client | null = null;

  let query: string = ''
  try {
    let sql_where_clause: String = ''
    let sql_pagination_clause: String = ''

    if (bind.options && bind.options.itemsPerPage != -1) {
      sql_pagination_clause = `
        limit ${bind.options.itemsPerPage}
        offset ${(bind.options.page-1) * bind.options.itemsPerPage}
      `
    }

    if (bind.search_query) {
      sql_where_clause +=  ` where
        (
          id::text like '%${bind.search_query}%'
          or object_id::text like '%${bind.search_query}%'
          or upper(object_display_type) like upper('%${bind.search_query}%')
          or upper(object_display_subtype) like upper('%${bind.search_query}%')
          or upper(concat(last_name, ' ', first_name, ' ', middle_name)) like upper('%${bind.search_query}%')
        )
      `
    }
    if (bind.type) {
      sql_where_clause == ''? sql_where_clause = 'where ':  sql_where_clause += ' and '
      sql_where_clause += `object_name = '${bind.type}'`
    }
    let flag_user_id = true
    if (bind.object_info) {
      sql_where_clause += `
        where
          object_id = ${bind.object_info.object_id}
          and object_name = '${bind.object_info.object_name}'
      `
      flag_user_id = false
    }

    client = get_client(); await client.connect();

    if (bind.request_approve_status == 6) {
      bind.request_approve_status = [15]
    } else if (bind.request_approve_status == 1) {
      bind.request_approve_status = [1, 8, 12]
    } else if (bind.request_approve_status == 2) {
      bind.request_approve_status = [2, 9, 14]
    } else if (bind.request_approve_status == 3) {
      bind.request_approve_status = [3, 10]
    } else if (bind.request_approve_status == 4) {
      bind.request_approve_status = [4, 11]
    } else if (bind.request_approve_status == 5) {
      bind.request_approve_status = [5, 13]
    } 

    let total_count = 0

    if(flag_user_id)
    {

      query = `
      select count(1) as total from (
        select
          ari.id,
          ari.parent_id,
          ar.id as approve_request_id,
          ari.employee_id,
          ari.orders,

          case
            when ari.ar_item_status_id = 1 then 1
            when ari.ar_item_status_id = 8 then 2
            when ari.ar_item_status_id = 12 then 3
          end as ar_item_type_id,


          ari.ar_item_status_id as request_status_id,
          ais.name_${bind.lang} as request_status_name,
          ari.approve_date,
          ari.send_date,
          ari.create_date,
          ari.create_user_id,
          ari.update_date,
          ari.update_user_id,

          e.last_name_${bind.lang} as last_name,
          e.first_name_${bind.lang} as first_name,
          e.middle_name_${bind.lang} as middle_name,
          e.id as create_user_id,

          emp.last_name_${bind.lang} as emp_last_name,
          emp.first_name_${bind.lang} as emp_first_name,
          emp.middle_name_${bind.lang} as emp_middle_name,
          emp.id as emp_id,

          case when arr.object_name = 'PASS_REQUEST' then '${bind.lang === 'RUS'?'Заявка на пропуск':'Рұқсаттамаға өтінім'}'
          when arr.object_name = 'REQUEST' then '${bind.lang === 'RUS'?'Заявление':'Өтініш'}'
          when arr.object_name = 'REPORT_INSTANCE' then '${bind.lang === 'RUS'?'Отчет':'Отчет'}'
          else '${bind.lang === 'RUS'?'Не определено':'Анықталмаған'}'
          end as object_display_type,
          case when arr.object_name = 'PASS_REQUEST' then (select p1.name_${bind.lang} from ref.pass_request_type p1, hr.pass_request p2
                                  where p1.id = p2.pass_request_type_id and p2.id = arr.object_id)
          when arr.object_name = 'REQUEST' then (select p1.name_${bind.lang} from ref.request_type p1, hr.request p2
                              where p1.id = p2.request_type_id and p2.id = arr.object_id)
          when arr.object_name = 'REPORT_INSTANCE' then (select rf.name from hr.report_instance ri, ref.report_form rf
                              where ri.report_form_id = rf.id and ri.id = arr.object_id)
          else '${bind.lang === 'RUS'?'Не определено':'Анықталмаған'}'
          end as object_display_subtype,

          d.name_${bind.lang} as create_user_department_name,
          o.name_${bind.lang} as create_user_organization_name,

          hr.retEmpFullDepList(e.id) as create_user_department_full_list,

          arr.object_name,
          arr.object_id,
          ari.ar_item_status_id as request_approve_status_id,
          ais.name_${bind.lang} as request_approve_status_name

          from hr.approve_request_item ari, hr.employee e, hr.approve_request ar,
            hr.approve_request_rel arr, ref.ar_item_status ais, hr.employee emp,
            hr.department d, hr.organization o

          where

          ${ flag_user_id?'ari.employee_id = ' + bind.user_id + ' and':'' }

          e.id = ari.create_user_id
          and d.id = e.department_id
          and o.id = d.organization_id
          and ar.id = ari.approve_request_id
          and emp.id = ari.employee_id
          and arr.approve_request_id = ar.id
          ${bind.request_approve_status === 2? 'and ar.approve_request_status_id = 1': ''}
          and ais.id = ari.ar_item_status_id
          ${bind.request_approve_status?'AND ari.ar_item_status_id in ('+ bind.request_approve_status + ')':')'}
          order by ari.create_date desc
        ) t1
        ${sql_where_clause}
        `

        let {rows: {[0]:{total}}}: any = await client.query(query)
        total_count = total


      query = `
      select * from (
        select
          ari.id,
          ari.parent_id,
          ar.id as approve_request_id,
          ari.employee_id,
          ari.orders,

          case
            when ari.ar_item_status_id = 1 then 1
            when ari.ar_item_status_id = 8 then 2
            when ari.ar_item_status_id = 12 then 3
          end as ar_item_type_id,


          ari.ar_item_status_id as request_status_id,
          ais.name_${bind.lang} as request_status_name,
          ari.approve_date,
          ari.send_date,
          ari.create_date,
          ari.create_user_id,
          ari.update_date,
          ari.update_user_id,

          case when arr.object_name = 'PASS_REQUEST' then '${bind.lang === 'RUS'?'Заявка на пропуск':'Рұқсаттамаға өтінім'}'
          when arr.object_name = 'REQUEST' then '${bind.lang === 'RUS'?'Заявление':'Өтініш'}'
          when arr.object_name = 'REPORT_INSTANCE' then '${bind.lang === 'RUS'?'Отчет':'Отчет'}'
          when arr.object_name = 'SERVICE_REQUEST' then '${bind.lang === 'RUS'?'Служба поддержки':'Служба поддержки'}'
          else '${bind.lang === 'RUS'?'Не определено':'Анықталмаған'}'
          end as object_display_type,
          case when arr.object_name = 'PASS_REQUEST' then (select p1.name_${bind.lang} from ref.pass_request_type p1, hr.pass_request p2
                                  where p1.id = p2.pass_request_type_id and p2.id = arr.object_id)
          when arr.object_name = 'REQUEST' then (select p1.name_${bind.lang} from ref.request_type p1, hr.request p2
                              where p1.id = p2.request_type_id and p2.id = arr.object_id)
          when arr.object_name = 'REPORT_INSTANCE' then (select rf.name from hr.report_instance ri, ref.report_form rf
                              where ri.report_form_id = rf.id and ri.id = arr.object_id)
          when arr.object_name = 'SERVICE_REQUEST' then (
              select src.name_${bind.lang} || ', ' || srsc.name_${bind.lang} from hr.service_request sr, ref.sr_category src, ref.sr_subcategory srsc where sr.id = arr.object_id and src.id=sr.sr_category_id and srsc.id = sr.sr_subcategory_id
          )
          else '${bind.lang === 'RUS'?'Не определено':'Анықталмаған'}'
          end as object_display_subtype,

          case when arr.object_name = 'PASS_REQUEST' then (
            select
              json_build_object(
                'visitors', json_agg(
                  json_build_object(
                    'last_name', INITCAP(coalesce(prv.pass_last_name, prv.last_name)),
                    'first_name', INITCAP(coalesce(prv.pass_first_name, prv.first_name)),
                    'middle_name', INITCAP(coalesce(prv.pass_middle_name, prv.middle_name)),
                    'identification_number', coalesce(prv.pass_identification_number, prv.identification_number),
                    'is_resident_rk', coalesce(prv.pass_is_resident_rk, prv.is_resident_rk),
                    'document_type', dt.name_${bind.lang}
                  )
                ),
                'description', pr.description,
                'purpose', pr.purpose,
                'employee_name', concat(premp.last_name_${bind.lang}, ' ', premp.first_name_${bind.lang}, ' ', premp.middle_name_${bind.lang}),
                'date_from', pr.date_from,
                'date_to', pr.date_to,

                'file_id_list', coalesce((select json_agg(json_build_object(
                    'id', f.id,
                    'name', f.name,
                    'create_user', concat(e.last_name_${bind.lang} ,' ', e.first_name_${bind.lang}, ' ', e.middle_name_${bind.lang}),
                    'create_date', f.create_date
                  ))
                  from hr.file f
                    join hr.object_file obf on obf.file_id = f.id
                    join ref.object_type ot on obf.object_type_id = ot.id
                    join hr.user u on u.username = f.create_user
                    join hr.employee emp on emp.id = u.id
                  where obf.object_id = arr.object_id
                  and ot.id = 8
                  and f.is_active = true
                ), '[]'::json)
              )
            from
              hr.pass_request_visitor prv
              join ref.document_type dt on dt.id = prv.document_type_id
              join hr.pass_request pr on pr.id = arr.object_id
              join hr.employee premp on premp.id = pr.employee_id
            where prv.pass_request_id = arr.object_id
            group by pr.id, premp.id
            )
          when arr.object_name = 'REPORT_INSTANCE' then (
            select
              json_build_object(
                'report_instance_id', ri.id,
                'name', rf.name
              )
            from
              hr.report_instance ri, ref.report_form rf
            where ri.report_form_id = rf.id and ri.id = arr.object_id
            )
          when arr.object_name = 'REQUEST' then (
            select
              json_build_object(
                'request_type', (select name_${bind.lang} from ref.request_type u1 where u1.id = pr.request_type_id),
                'request_type_id', pr.request_type_id,
                'request_sub_type', (select name_${bind.lang} from ref.request_sub_type u1 where u1.id = pr.request_sub_type_id),
                'request_sub_type_id', pr.request_sub_type_id,

                'file_id_list', coalesce((select json_agg(json_build_object(
                    'id', f.id,
                    'name', f.name,
                    'create_user', concat(emp.last_name_${bind.lang} ,' ', emp.first_name_${bind.lang}, ' ', emp.middle_name_${bind.lang}),
                    'create_date', f.create_date
                  ))
                  from hr.file f
                    join hr.object_file obf on obf.file_id = f.id
                    join ref.object_type ot on obf.object_type_id = ot.id
                    join hr.user u on u.username = f.create_user
                    join hr.employee emp on emp.id = u.id
                  where obf.object_id = arr.object_id
                  and ot.id = 11
                  and f.is_active = true
                ), '[]'::json)
              )
            from
              hr.request pr where pr.id = arr.object_id
            )

          when arr.object_name = 'SERVICE_REQUEST' then
            (
              select json_build_object(
                'sr_id', sr.id,
                'sr_category_id', sr.sr_category_id,
                'sr_subcategory_id', sr.sr_subcategory_id,
                'category_name', src.name_${bind.lang},
                'subcategory_name', srsc.name_${bind.lang},
                'description', sr.description
              ) from hr.service_request sr, ref.sr_category src, ref.sr_subcategory srsc where sr.id = arr.object_id and src.id = sr.sr_category_id and srsc.id = sr.sr_subcategory_id

            )

          else '{}'::json

          end as object_info,


          e.last_name_${bind.lang} as last_name,
          e.first_name_${bind.lang} as first_name,
          e.middle_name_${bind.lang} as middle_name,
          e.id as create_user_id,

          emp.last_name_${bind.lang} as emp_last_name,
          emp.first_name_${bind.lang} as emp_first_name,
          emp.middle_name_${bind.lang} as emp_middle_name,
          emp.id as emp_id,

          d.name_${bind.lang} as create_user_department_name,
          o.name_${bind.lang} as create_user_organization_name,

          hr.retEmpFullDepList(e.id) as create_user_department_full_list,

          arr.object_name,
          arr.object_id,
          ari.ar_item_status_id as request_approve_status_id,
          ais.name_${bind.lang} as request_approve_status_name

          from hr.approve_request_item ari, hr.employee e, hr.approve_request ar,
            hr.approve_request_rel arr, ref.ar_item_status ais, hr.employee emp,
            hr.department d, hr.organization o

          where

          ${ flag_user_id?'ari.employee_id = ' + bind.user_id + ' and':'' }

          e.id = ari.create_user_id
          and d.id = e.department_id
          and o.id = d.organization_id
          and ar.id = ari.approve_request_id
          and emp.id = ari.employee_id
          and arr.approve_request_id = ar.id
          ${bind.request_approve_status === 2? 'and ar.approve_request_status_id = 1': ''}
          and ais.id = ari.ar_item_status_id
          ${bind.request_approve_status?'AND ari.ar_item_status_id in ('+ bind.request_approve_status + ')':')'}
          order by ari.create_date desc
        ) t1
        ${sql_where_clause}
        ${sql_pagination_clause}
        `
      }
      else {
        query = `
          WITH RECURSIVE temp1 (
            id, parent_id, send_date, emp_name, ar_item_status, ar_item_status_id,
          approve_date, comment, orders, PATH, LEVEL, emp_id ) AS (

          select table1.id, table1.parent_id, table1.send_date, table1.emp_name, table1.ar_item_status, table1.ar_item_status_id,
          table1.approve_date, table1.comment, table1.orders,
          CAST ((table1.orders || '-' || table1.id) AS VARCHAR (50)) as PATH, 1, table1.emp_id
          from
          (select t1.id, t1.parent_id, t1.send_date, t2.last_name_rus || ' ' || t2.first_name_rus emp_name, t3.name_rus ar_item_status, t3.id ar_item_status_id,
          t1.approve_date, t1.comment, t1.orders, t2.id as emp_id
          from hr.approve_request_item t1, hr.employee t2, ref.ar_item_status t3, hr.approve_request_rel t4
          where
          t4.object_id = ${bind.object_info.object_id}
          and t4.object_name = '${bind.object_info.object_name}'
          and t1.approve_request_id = t4.approve_request_id
          and t1.ar_item_status_id != 7
          and t1.employee_id = t2.id
          and t1.ar_item_status_id = t3.id) table1
          where table1.parent_id IS NULL

            union

          select table1.id, table1.parent_id, table1.send_date, table1.emp_name, table1.ar_item_status, table1.ar_item_status_id,
          table1.approve_date, table1.comment, table1.orders,
          CAST ( temp1.PATH ||'->'|| (table1.orders || '-' || table1.id) AS VARCHAR(50)) , LEVEL + 1, table1.emp_id
          from
          (select t1.id, t1.parent_id, t1.send_date, t2.last_name_rus || ' ' || t2.first_name_rus emp_name, t3.name_rus ar_item_status, t3.id ar_item_status_id,
          t1.approve_date, t1.comment, t1.orders, t2.id as emp_id
          from hr.approve_request_item t1, hr.employee t2, ref.ar_item_status t3 , hr.approve_request_rel t4
          where
          t4.object_id = ${bind.object_info.object_id}
          and t4.object_name = '${bind.object_info.object_name}'
          and t1.approve_request_id = t4.approve_request_id
          and t1.ar_item_status_id != 7
          and t1.employee_id = t2.id
          and t1.ar_item_status_id = t3.id) table1
          INNER JOIN temp1 ON( temp1.ID= table1.parent_id)
          )
          select
            *,
            temp1.ar_item_status as request_status_name,
            temp1.ar_item_status_id as request_status_id,
            case
              when ar_item_status_id in (1, 2, 3) then 1
              when ar_item_status_id in (8, 9, 10, 11) then 2
              when ar_item_status_id in (12, 13, 15) then 3
            end as ar_item_type_id
            from temp1
            ORDER BY PATH
        `
      }


    let {rows: request}: any = await client.query(query)
    if (request.length > 0) {
      request[0].total = total_count
    }
    return request;
  } catch (err) {
    log.debug(query)
    log.error(err)
    throw err;
  } finally {
    if (client) {
      await client.end()
    }
  }
}


export async function approve_request_rel_create_db (bind:any, client: Client, approve_request_id:number, object_name: string, object_id: number): Promise<number>
{
  let query: string = ''
  try {
    query = `
      insert into hr.approve_request_rel (
        approve_request_id,
        object_name,
        object_id
      )
      values(
        ${approve_request_id},
        '${object_name}',
        ${object_id}
      )
      returning id
    `
    let {rows: {[0]: {id: approve_request_rel_id}}} = await client.query(query)

    return approve_request_rel_id
  } catch (err) {
    log.debug(`db query: ${query}`)
    log.error(err)
    throw(err)
  }
}

export async function approve_request_create_db (bind:any, client: Client, approve_rule_id:number): Promise<number>
{
  let query: string = ''
  try {
    let status: number = 1;
    if (bind.is_project)
    {
      status = 0
    }

    query = `
      insert into hr.approve_request (
        approve_request_status_id,
        create_user_id,
        update_user_id,
        approve_rule_id
      )
      values(
        ${status},
        ${bind.user_id},
        ${bind.user_id},
        ${approve_rule_id}
      )
      returning id
    `
    let { rows: { [0]: {id: approve_request_id}}} = await client.query(query)

    return approve_request_id
  } catch (err) {
    log.debug(`db query: ${query}`)
    log.error(err)
    throw(err)
  }
}


export async function approve_request_item_create_db(bind:any, client: Client, approve_request_id:number, approve_rule_item:any): Promise<number>
{
  let query: string = ''
  try {
    let ar_item_status_id:number = 0

    if (approve_rule_item.ar_item_type_id === 1)
    {
      ar_item_status_id = 1
    } else if (approve_rule_item.ar_item_type_id === 2)
    {
      ar_item_status_id = 8
    } else if (approve_rule_item.ar_item_type_id === 3)
    {
      ar_item_status_id = 12
    }
    if (!bind.is_project) {
      if (approve_rule_item.ar_item_type_id === 1)
      {
        ar_item_status_id = 2
      } else if (approve_rule_item.ar_item_type_id === 2)
      {
        ar_item_status_id = 9
      } else if (approve_rule_item.ar_item_type_id === 3)
      {
        ar_item_status_id = 14
      }
    }

    if (ar_item_status_id == 0) {
      ar_item_status_id = 1 
    }

    query = `
      insert into hr.approve_request_item (
        approve_request_id,
        approve_rule_item_id,
        orders,
        employee_id,
        create_user_id,
        update_user_id,
        ar_item_status_id,
        ${approve_rule_item.cover_word?'cover_word, ': ''}
        parent_id
        ${ar_item_status_id == 2 || ar_item_status_id == 9 || ar_item_status_id == 14? ', send_date': ''}
      )
      values(
        ${approve_request_id},
        ${approve_rule_item.id?approve_rule_item.id:-1},
        ${approve_rule_item.orders},
        ${approve_rule_item.approver_id},
        ${bind.do_change_create_user?`(select create_user_id from hr.approve_request_item where id = ${bind.parent_id})`:bind.user_id==-1?`(select create_user_id from hr.approve_request where id = ${approve_request_id})`:bind.user_id},
        ${bind.user_id==-1?`(select create_user_id from hr.approve_request where id = ${approve_request_id})`:bind.user_id},
        ${ar_item_status_id},
        ${approve_rule_item.cover_word?'\'' + approve_rule_item.cover_word + '\', ':''}
        ${bind.parent_id?bind.parent_id:null}
        ${ar_item_status_id == 2 || ar_item_status_id == 9 || ar_item_status_id == 14? ', current_timestamp': ''}
      )
      returning id
    `
    let {rows: {[0]: {id: approve_request_item_id}}} = await client.query(query)

    if (!bind.is_project)
    {
      send_approve_notification(client, approve_request_id, approve_rule_item.approver_id, approve_request_item_id)
    }

    return approve_request_item_id
  } catch (err) {
    log.debug(`db query: ${query}`)
    log.error(err)
    throw(err)
  }
}

export async function send_approve_notification(client: Client, approve_request_id: number, approver_id: number, approve_request_item_id: number)
{
  let query:string = ''
  try {
    query = `select ar.create_user_id, arr.object_name from hr.approve_request ar, hr.approve_request_rel arr where ar.id = ${approve_request_id} and arr.approve_request_id = ar.id` 
    let { rows: {[0]: {object_name}}} = await client.query(query)
    if (object_name == 'REPORT_INSTANCE')
    {
        await create_notification_in_bc(
          1, 
          [approver_id], 
          "Согласование", 
          "Вам поступил отчет на согласование",
          { entity_type_id: 5, entity_id: approve_request_item_id }
        )
    } else if (object_name == 'REQUEST')
    {
        await create_notification_in_bc(
          1, 
          [approver_id], 
          "Согласование", 
          "Вам поступила заявка на согласование",
          { entity_type_id: 5, entity_id: approve_request_item_id }
        )
    } else if (object_name == 'SERVICE_REQUEST')
    {
        await create_notification_in_bc(
          1, 
          [approver_id], 
          "Согласование", 
          "Вам поступила сервисная заявка на согласование",
          { entity_type_id: 5, entity_id: approve_request_item_id }
        )
    } else if (object_name == 'PASS_REQUEST')
    {
        await create_notification_in_bc(
          1, 
          [approver_id], 
          "Согласование", 
          "Вам поступила заявка на пропуск на согласование",
          { entity_type_id: 5, entity_id: approve_request_item_id }
        )
    }
  } catch (err) {
    log.error(err)
    log.debug(query)
    throw err
  }
}


export async function approve_request_item_put_db(bind: any, client: Client, ar_item_status_id:number, approve_comment:string|null): Promise<void>
{
  let query:string = ''
  try {

    let sendDate = ar_item_status_id == 2 || ar_item_status_id == 9 || ar_item_status_id == 14 ? `send_date = current_timestamp,` : ''

    let approveDate =
    ar_item_status_id == 3 ||
    ar_item_status_id == 4 ||
    ar_item_status_id == 10 ||
    ar_item_status_id == 11 ||
    ar_item_status_id == 15 ||
    ar_item_status_id == 13 ||
    ar_item_status_id == 5
    ? `approve_date = current_timestamp,` : ''


    query = `
      update hr.approve_request_item set
        ${approve_comment!== null?`comment = '${approve_comment}' ,`:''}
        ${approveDate}
        ${sendDate}
        ar_item_status_id = ${ar_item_status_id}
      where id = ${bind.id}
    `

    await client.query(query)

    if (ar_item_status_id == 2 || ar_item_status_id == 9 || ar_item_status_id == 14)
    {
      query = `select employee_id, approve_request_id from hr.approve_request_item where id = ${bind.id}`
      let {rows: {[0]: {employee_id: emp_id, approve_request_id}}} = await client.query(query)
      send_approve_notification(client, approve_request_id, emp_id, bind.id)
    }

    return
  } catch (err) {
    log.debug(`dg query: ${query}`)
    log.error(err)
    throw err;
  }
}

export async function approve_request_item_delete_db(client: Client, approve_request_item_id:number): Promise<any> {
  let query:string = ''
  try {
    query = `
      delete from hr.approve_request_item
      where id = ${approve_request_item_id} and ar_item_status_id in (1, 8, 12)
    `
    await client.query(query)
    return
  } catch (err) {
    log.debug(`dg query: ${query}`)
    log.error(err)
    throw err;
  }
}

export async function approve_start(client: Client, approve_request_id: number): Promise<any> {

  let query:string = ''
  try {
    query = `
      select object_name from hr.approve_request_rel where approve_request_id = ${approve_request_id}
    `
    let {rows: {[0]: {object_name: object_name}}} = await client.query(query)

    if (object_name === 'REPORT_INSTANCE') {
      query = `
        select rla.approver_id
        from hr.approve_request_rel arr, hr.report_instance ri, hr.report_last_approver rla 
        where arr.approve_request_id = ${approve_request_id} and ri.id = arr.object_id and rla.report_form_id = ri.report_form_id
      `
      let {rows: {[0]: {approver_id}}} = await client.query(query)
      if(approver_id) {
        query = `
          select max(orders) as max_orders from hr.approve_request_item where approve_request_id = ${approve_request_id}
        `
        let {rows: {[0]: {max_orders}}} = await client.query(query)
        await approve_request_item_create_db({user_id: -1, is_project: true}, client, approve_request_id, {approver_id, orders: max_orders+1, ar_item_type_id: 1})
      }
    }

    query = `
      update hr.approve_request_item set

        ar_item_status_id =
          CASE
            WHEN ar_item_status_id = 1
              THEN 2
            WHEN ar_item_status_id = 8
              THEN 9
            ELSE 14
          END
        ,
        send_date = current_timestamp
      where approve_request_id = ${approve_request_id} and orders = 1 and ar_item_status_id in (1, 8, 12)
    `

    await client.query(query)

    query = `
      select employee_id, id from hr.approve_request_item where approve_request_id = ${approve_request_id} and orders = 1 and ar_item_status_id in (2, 9, 13)
    `
    let {rows: employees} = await client.query(query)

    for (let i of employees)
    {
      await send_approve_notification(client, approve_request_id, i.employee_id, i.id)
    }

    return
  } catch (err) {
    log.debug(`dg query: ${query}`)
    log.error(err)
    throw err;
  }
}

export async function approve_request_put_db(approve_request_id:number , client: Client, approve_request_status_id:number): Promise<void>
{
  let query:string = ''
  try {
    query = `
      update hr.approve_request set
        approve_request_status_id = ${approve_request_status_id}
      where id = ${approve_request_id}
    `

    await client.query(query)
    return
  } catch (err) {
    log.debug(`dg query: ${query}`)
    log.error(err)
    throw err;
  }
}