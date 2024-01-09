import log from "../config/logger";
import get_client from "../loaders/database";
import { Client } from "pg";

export async function servicerequest_types_get_db(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();

    let select1: string = `select name_${bind.lang} as name, id, need_to_be_approved from ref.sr_category where is_deleted = false`;
    let select2: string = `select name_${bind.lang} as name, id, sr_category_id from ref.sr_subcategory where is_deleted = false`;
    let select3: string = `select * from hr.sr_performer_group where is_deleted = false`;
    let select4: string = `select t1.id, t1.sr_performer_group_id, t1.user_id, t1.is_head_performer,
    concat( t2.last_name_${bind.lang},' ', t2.first_name_${bind.lang}) as performer_name
    from hr.sr_performer t1 join hr.employee t2 on t1.user_id = t2.id where t1.is_deleted = false`;
    let data: any = {
      categories: [],
      subcategories: [],
      performer_groups: [],
      performers: []
    };

    let { rows: categories } = await client.query(select1);
    data.categories = categories;
    let { rows: subcategories } = await client.query(select2);
    data.subcategories = subcategories;
    let { rows: performer_groups } = await client.query(select3);
    data.performer_groups = performer_groups;
    let { rows: performers } = await client.query(select4);
    data.performers = performers;
    return data;
  } catch (err) {
    log.error(`Error in servicerequest_types_get_db -> ${JSON.stringify(err)}`);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function servicerequestGetCountDb(bind: any, client: Client) {
  let  query: string = ''
  try {
    query = `
      select 
        count(1)
      from hr.service_request t1 
        join ref.sr_status t2 on t1.sr_status_id = t2.id 
        join ref.sr_category t3 on t1.sr_category_id = t3.id 
        join ref.sr_subcategory t4 on t1.sr_subcategory_id = t4.id 
        join hr.employee t5 on t1.create_user_id = t5.id
        
      `
    let servicerequestsCount:number = 0;

        if(bind.filter=='wait') {
      query += ` join hr.sr_performer t9 on t9.user_id = ${bind.user_id} and t9.is_deleted=false`
      query += ` where
      (
        (t9.is_head_performer = true)
        and
        (
        t1.sr_status_id = any(array[-2, 2, 5]) and ((t1.performer_user_id = ${bind.user_id} and t1.sr_performer_group_id = t9.sr_performer_group_id) or t1.sr_performer_group_id = t9.sr_performer_group_id)     
        )
      )
      or
      (
        (t9.is_head_performer = false)
        and
        (t1.sr_status_id = any(array[-2, 5]) and t1.performer_user_id = ${bind.user_id} and t1.sr_performer_group_id = t9.sr_performer_group_id)  or
      (t1.sr_status_id = 2  and t1.sr_performer_group_id = t9.sr_performer_group_id) )`

          let { rows: {[0]: count} } = await client.query(query);
      servicerequestsCount = count


              }
    else if (bind.filter=='progress'){
      query += 
        ` join hr.sr_performer t9 on t9.user_id = ${bind.user_id} and t9.is_deleted=false`
      query += 
        ` where((t9.is_head_performer = true) and (t1.sr_status_id = any(array[3, 4]) and ((t1.performer_user_id = ${bind.user_id} and t1.sr_performer_group_id = t9.sr_performer_group_id) or t1.sr_performer_group_id = t9.sr_performer_group_id)))
          or
          ((t9.is_head_performer = false) and (t1.sr_status_id = any(array[3, 4]) and t1.performer_user_id = ${bind.user_id} and t1.sr_performer_group_id = t9.sr_performer_group_id)) 
        `


                  let { rows: {[0]: count} } = await client.query(query);
      servicerequestsCount = count
    } else {
      let {rows: {[0]: {array:groups}}}: any = await client.query(`select array(select sr_performer_group_id from hr.sr_performer where user_id = ${bind.user_id}and is_deleted=false)`);

      let temp =new Set(groups)

      groups = Array.from(temp)

      switch (bind.filter) {
        case 'my':
          query+= ` where t1.create_user_id = ${bind.user_id} `
          break;
        case 'all':
          break;
        case 'closed':
          query+=  ` where t1.sr_status_id = any(array[-1, 6]) and (t1.performer_user_id = ${bind.user_id} or sr_performer_group_id = any(array[${groups}]))`
          break;
      }
      let { rows: {[0]: count} } = await client.query(query);
      servicerequestsCount = count
    }
    return servicerequestsCount;

      } catch (err) {
    log.debug(query)
    log.error(`Error in servicerequestCountGetDb -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function servicerequest_get_db(bind: any, client: Client) {
  let query = ''
  try {
    query = `
      select 
        t1.id, 
        t1.update_date,
        t1.description, 
        t1.sr_status_id, 
        t1.create_user_id, 
        t1.sr_category_id, 
        t1.sr_subcategory_id, 
        t1.sr_performer_group_id,
        t1.performer_user_id,
        t3.name_${bind.lang} as category_name,
        t4.name_${bind.lang} as subcategory_name,
        t2.name_${bind.lang} as status_name,
        concat( t5.last_name_${bind.lang},' ', t5.first_name_${bind.lang}) as created_user_name,
        (select t6.name_${bind.lang} from hr.department t6 where t6.id = t5.department_id limit 1) as department_name,
        (select t7.name_${bind.lang} from hr.position t7 where t7.id = t5.position_id limit 1) as position_name,
        (select t8.name_${bind.lang} from hr.employee_contact_info t8 where t8.employee_id = t5.id and t8.contact_info_type_id = 3 and t8.is_active = true limit 1) as work_phone
      from hr.service_request t1 
        join ref.sr_status t2 on t1.sr_status_id = t2.id 
        join ref.sr_category t3 on t1.sr_category_id = t3.id 
        join ref.sr_subcategory t4 on t1.sr_subcategory_id = t4.id 
        join hr.employee t5 on t1.create_user_id = t5.id
        
      `
    let servicerequests:any = [];

        if(bind.filter=='wait') {
      query += ` join hr.sr_performer t9 on t9.user_id = ${bind.user_id} and t9.is_deleted=false`
      query += ` where
      (
        (t9.is_head_performer = true)
        and
        (
        t1.sr_status_id = any(array[-2, 2, 5]) and ((t1.performer_user_id = ${bind.user_id} and t1.sr_performer_group_id = t9.sr_performer_group_id) or t1.sr_performer_group_id = t9.sr_performer_group_id)     
        )
      )
      or
      (
        (t9.is_head_performer = false)
        and
        (t1.sr_status_id = any(array[-2, 5]) and t1.performer_user_id = ${bind.user_id} and t1.sr_performer_group_id = t9.sr_performer_group_id)  or
      (t1.sr_status_id = 2  and t1.sr_performer_group_id = t9.sr_performer_group_id) )`

          if(bind.itemsperpage != -1 && bind.page){
        query += ` limit ${bind.itemsperpage} offset ${(bind.page-1)*bind.itemsperpage}`
      }
      let { rows: data } = await client.query(query);
      servicerequests = data

          return servicerequests;

          }
    else if (bind.filter=='progress'){
      query += 
        ` join hr.sr_performer t9 on t9.user_id = ${bind.user_id} and t9.is_deleted=false`
      query += 
        ` where((t9.is_head_performer = true) and (t1.sr_status_id = any(array[3, 4]) and ((t1.performer_user_id = ${bind.user_id} and t1.sr_performer_group_id = t9.sr_performer_group_id) or t1.sr_performer_group_id = t9.sr_performer_group_id)))
          or
          ((t9.is_head_performer = false) and (t1.sr_status_id = any(array[3, 4]) and t1.performer_user_id = ${bind.user_id} and t1.sr_performer_group_id = t9.sr_performer_group_id)) 
        `



                          query+= ` order by t1.update_date desc`
      if(bind.itemsperpage != -1 && bind.page){
        query += ` limit ${bind.itemsperpage} offset ${(bind.page-1)*bind.itemsperpage}`
      }

      let { rows: data } = await client.query(query);


                  servicerequests = data;
      return servicerequests;
    } else {
      let {rows: {[0]: {array:groups}}}: any = await client.query(`select array(select sr_performer_group_id from hr.sr_performer where user_id = ${bind.user_id}and is_deleted=false)`);

      let temp =new Set(groups)

      groups = Array.from(temp)

      switch (bind.filter) {
        case 'my':
          query+= ` where t1.create_user_id = ${bind.user_id} `
          break;
        case 'all':
          break;
        case 'closed':
          query+=  ` where t1.sr_status_id = any(array[-1, 6]) and (t1.performer_user_id = ${bind.user_id} or sr_performer_group_id = any(array[${groups}]))`
          break;
      }
      query+= ` order by t1.update_date desc`
      if(bind.itemsperpage != -1  && bind.page){
        query += ` limit ${bind.itemsperpage} offset ${(bind.page-1)*bind.itemsperpage}`
      }
      let { rows: data } = await client.query(query);
      servicerequests = data
      return servicerequests;
    }

      } catch (err) {
    log.debug(query)
    log.error(`Error in servicerequest_get_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function one_servicerequest_get_db(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();

    let select1: string = `
     select t1.id,
            t1.update_date,
	          t1.description,
            t1.sr_status_id,
            t1.create_user_id,
            t1.sr_category_id, 
            t1.sr_subcategory_id, 
            t1.sr_performer_group_id, 
            t1.performer_user_id,
            t3.name_${bind.lang} as category_name, 
            t3.need_to_be_approved,
            t4.name_${bind.lang} as subcategory_name,
            t2.name_${bind.lang} as status_name, 
            arr.approve_request_id,
            arr.object_name as request_object_type_name,
            concat( t5.last_name_${bind.lang},' ', t5.first_name_${bind.lang}) as created_user_name,
            (select t6.name_${bind.lang} from hr.department t6 where t6.id = t5.department_id limit 1) as department_name,
            (select t7.name_${bind.lang} from hr.position t7 where t7.id = t5.position_id limit 1) as position_name,
            (select t8.name_${bind.lang} from hr.employee_contact_info t8 where t8.employee_id = t5.id and t8.contact_info_type_id = 3 and t8.is_active = true limit 1) as work_phone
       from hr.service_request t1 
            join ref.sr_status t2 on t1.sr_status_id = t2.id 
            join ref.sr_category t3 on t1.sr_category_id = t3.id 
            join ref.sr_subcategory t4 on t1.sr_subcategory_id = t4.id 
            join hr.employee t5 on t1.create_user_id = t5.id 
            left join hr.approve_request_rel arr on arr.object_id = t1.id and arr.object_name = 'SERVICE_REQUEST'
      where t1.id = ${bind.id}
    `;
    let { rows: { [0]: data } } = await client.query(select1);

    let fileQuery = `
       select f.name, 
              obj.file_id, 
              obj.object_id, 
              f.id, 
              f.create_user, 
              f.create_date,
              concat( empl.last_name_rus,' ', empl.first_name_rus) as create_user_name
         from hr.file f 
              join hr.object_file obj on f.id = obj.file_id 
              left join hr.user u on u.username = f.create_user
              left join hr.employee empl on u.id = empl.id    
        where obj.object_id = ${data.id} AND 
              obj.object_type_id = 14 
              and f.is_active = true
    `;
    let { rows: files }: any = await client.query(fileQuery);
    data["files"] = files;

    return data;
  } catch (err) {
    log.error(`Error in one_servicerequest_get_db -> ${JSON.stringify(err)}`);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function servicerequest_create_db(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();

        await client.query("BEGIN");

    let query: string = `insert into hr.service_request (description, sr_status_id, create_user_id, update_user_id, sr_category_id, sr_subcategory_id) 
        values ($$${bind.description ? bind.description : ""}$$, ${
      bind.sr_status_id
    }, ${bind.user_id}, ${bind.user_id}, ${bind.sr_category_id}, ${
      bind.sr_subcategory_id
    }) returning id`;
    let {rows: { [0]: { id: data } }} = await client.query(query);
    if(bind.characteristics) {
      for await(let el of bind.characteristics) {
        let chQuery: string = `insert into ref.sr_characteristic_value (sr_id, sr_characteristic_id, value)
          values (${data}, ${el.id}, $$${el.value}$$)`
          await client.query(chQuery);
      }

          }

    let query2: string = `insert into hr.sr_status_history (sr_status_id, create_user_id, service_request_id)
        values (1, ${bind.user_id}, ${data})`;
    await client.query(query2);

    await client.query("COMMIT");
    return data;
  } catch (err) {
    log.error(`Error in servicerequest_create_db -> ${JSON.stringify(err)}`);
    if (client) {
      await client.query("ROLLBACK");
    }

    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function servicerequest_change_status_db(bind: any) {
  let selectQuery: string = "", updateQuery: string = ""
  let query: string = ""
  let client;
  try {
    client = get_client(); await client.connect();
    await client.query("BEGIN");


     query = `select sr_status_id from hr.service_request where id = ${bind.id} 
     `;
     let {rows: { [0]: { sr_status_id: status } }} = await client.query(query);

     if (status == bind.sr_status_id && bind.sr_status_id != -2) { throw 'Изменен статус запроса другим исполнителем, обновите пожалуйста страницу' }

    if (bind.sr_status_id === 3 || bind.sr_status_id === -2) { 

        query = `select sr_status_id from hr.service_request where id = ${bind.id} 
      `;
      let {rows: { [0]: { sr_status_id: status } }} = await client.query(query);
      if (status != bind.current_sr_status_id) { throw 'Изменен статус запроса другим исполнителем, обновите пожалуйста страницу' }


      updateQuery = `update hr.service_request 
        set 
          sr_status_id = ${bind.sr_status_id},
          performer_user_id = ${bind.performer_user_id},
          update_date = current_timestamp,
          update_user_id = ${bind.user_id}
        where id = ${bind.id} returning *
      `;
      await client.query(updateQuery);

      selectQuery = `select last_name_rus || ' ' || first_name_rus as full_name from hr.employee where id = ${bind.performer_user_id}`;
      await client.query(selectQuery);
      let {rows: { [0]: { full_name: retPerformerName } }} = await client.query(selectQuery);
      let descriptionText = bind.sr_status_id === 3 ? 'Принял в работу '+retPerformerName : 'Назначен исполнитель '+retPerformerName

      updateQuery = `insert into hr.sr_status_history (sr_status_id, create_user_id, service_request_id, description) 
            values (${bind.sr_status_id}, ${bind.user_id}, ${bind.id}, '${descriptionText}')`;
      await client.query(updateQuery);

    } else if (bind.sr_status_id === 4 || bind.sr_status_id === 5 || bind.sr_status_id === 6 || bind.sr_status_id === -1) { 
      updateQuery = `update hr.service_request 
        set 
          sr_status_id = ${bind.sr_status_id},
          update_date = current_timestamp,
          update_user_id = ${bind.user_id}
        where id = ${bind.id} returning *
      `;
      await client.query(updateQuery);

      updateQuery = `insert into hr.sr_status_history (sr_status_id, create_user_id, service_request_id, description) 
            values (${bind.sr_status_id}, ${bind.user_id}, ${bind.id}, '${bind.description}')`;
      await client.query(updateQuery);

    } else if (bind.sr_status_id === 2 || bind.sr_status_id === 7 || bind.sr_status_id == 8 || bind.sr_status_id == 9) { 
      query = `select * from hr.sr_performer_group where sr_category_id = ${bind.sr_category_id} and is_deleted = false`
      let { rows: { [0]: group } } = await client.query (query);
      if (group == undefined) { throw 'По указанной категории не настроена группа исполнителей' }

      updateQuery = `update hr.service_request 
        set 
          sr_status_id = ${bind.sr_status_id},
          update_date = current_timestamp,
          update_user_id = ${bind.user_id},
          sr_performer_group_id = ${group.id}
        where id = ${bind.id} returning *
      `;
      await client.query(updateQuery);

      updateQuery = `insert into hr.sr_status_history (sr_status_id, create_user_id, service_request_id) 
            values (${bind.sr_status_id}, ${bind.user_id}, ${bind.id})`;
      await client.query(updateQuery);
    } else {
      updateQuery = `update hr.service_request 
        set 
          sr_status_id = ${bind.sr_status_id},
          update_date = current_timestamp,
          update_user_id = ${bind.user_id}
        where id = ${bind.id} returning *
      `;
      await client.query(updateQuery);
    }

    await client.query("COMMIT");
    return;
  } catch (err) {
    log.debug(updateQuery)
    log.debug(selectQuery)
    log.debug(query)
    log.error(`Error in servicerequest_change_status_db -> ${JSON.stringify(err)}`);
    if (client) {
      await client.query("ROLLBACK");
    }
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function servicerequest_edit_db(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();

    await client.query("BEGIN");

    let query: string = `update hr.service_request 
        set 
        description = $$${bind.description ? bind.description : ""}$$, 
        sr_category_id = ${bind.sr_category_id}, 
        sr_subcategory_id = ${bind.sr_subcategory_id}
        where id = ${bind.id} returning id
        `;
    let {
      rows: {
        [0]: { id: data },
      },
    } = await client.query(query);

       if(bind.characteristics) {

            for await(let el of bind.characteristics) {
        let chQuery: string = `update ref.sr_characteristic_value set  
          value = $$${el.value}$$
          where id = ${el.ch_value_id}`
          await client.query(chQuery);
      }

          }
    await client.query("COMMIT");

    return data;
  } catch (err) {
    log.error(`Error in servicerequest_edit_db -> ${JSON.stringify(err)}`);
    if (client) {
      await client.query("ROLLBACK");
    }
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function servicerequest_history_db(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();

        let query: string = `
      select  t1.id,
              t1.service_request_id, 
              t1.create_user_id, 
              t1.create_date,
              t1.sr_status_id,
              t2.name_${bind.lang} as sr_status_name,
              t1.description
         from hr.sr_status_history t1 
              join ref.sr_status t2 on t1.sr_status_id = t2.id 
        where service_request_id = ${bind.id} 
        order by t1.create_date
    `;

    let { rows: data } = await client.query(query);

    return data;
  } catch (err) {
    log.error(`Error in servicerequest_history_db -> ${JSON.stringify(err)}`);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}


export async function servicerequest_characteristic_list_get_db(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();

        let query: string = `
      select  t1.id,
              t1.sr_subcategory_id, 
              t1.name,
              t2.value
         from ref.sr_characteristic t1 left join ref.sr_characteristic_value t2 on t1.id = t2.sr_characteristic_id
        where t1.sr_subcategory_id = ${bind.subcategory_id} and t1.is_active=true`;
    if(bind.sr_id||bind.sr_id==0) {
      query = `select  t1.id,
                       t1.sr_subcategory_id, 
                       t1.name,
                       t2.value,
                       t2.id as ch_value_id
            from ref.sr_characteristic t1 left join ref.sr_characteristic_value t2 on t1.id = t2.sr_characteristic_id and t2.sr_id = ${bind.sr_id}
          where t1.sr_subcategory_id = ${bind.subcategory_id} and t1.is_active=true`
    }
    let { rows: data } = await client.query(query);

    return data;
  } catch (err) {
    log.error(`Error in servicerequest_characteristic_list_get_db -> ${JSON.stringify(err)}`);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}


export async function servicerequest_characteristic_list_create_db(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();

        let query: string = `insert into ref.sr_characteristic
    (sr_subcategory_id, name) 
    values (${bind.subcategory_id}, '${bind.name}') returning id
    `;

    let {rows: {[0]: {id: data}}} =await client.query(query);

    return data;
  } catch (err) {
    log.error(`Error in servicerequest_characteristic_list_create_db -> ${JSON.stringify(err)}`);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}


export async function servicerequest_characteristic_list_delete_db(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();

        let query: string = `update ref.sr_characteristic set  
    is_active = false
    where id = ${bind.id} `;

   await client.query(query);

  } catch (err) {
    log.error(`Error in servicerequest_characteristic_list_delete_db -> ${JSON.stringify(err)}`);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}