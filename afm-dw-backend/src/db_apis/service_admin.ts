import log from "../config/logger";
import { Client } from 'pg';

export async function get_performer_group_db (bind: any, client: Client) {
  try {

    let query = `
      select 
        srpg.id,
        srpg.name_${bind.lang} as name,
        srpg.name_kaz,
        srpg.name_rus,
        srpg.sr_category_id,
        src.name_${bind.lang} as category_name
      from hr.sr_performer_group srpg, ref.sr_category src
      where src.id = srpg.sr_category_id
      and srpg.is_deleted = false
    `

    let { rows: performer_group } = await client.query(query)

    return performer_group
  } catch (err) {
    log.error(`Error in get_performer_group_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function add_performer_group_db (bind: any, client: Client) {
  try {

    let query = `
      insert into hr.sr_performer_group (name_rus, name_kaz, sr_category_id) values ('${bind.name_rus}', '${bind.name_kaz}', ${bind.sr_category_id})
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in add_performer_group_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function edit_performer_group_db (bind: any, client: Client) {
  try {

    let query = `
      update hr.sr_performer_group set name_rus = '${bind.name_rus}', name_kaz = '${bind.name_kaz}', sr_category_id = ${bind.sr_category_id} where id = ${bind.id}
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in edit_performer_group_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function delete_performer_group_db (bind: any, client: Client) {
  try {
    let queryRequests = `
      select 
        id
      from hr.service_request 
      where sr_performer_group_id = ${bind.id}
      and sr_status_id != -1 and sr_status_id != 6
    `

    let { rows: requests } = await client.query(queryRequests)

    if (requests.length!=0) { throw 'У указанной группы исполнителей есть незавершенные заявки' }
    let query = `
      update hr.sr_performer_group set is_deleted = true where id = ${bind.id}
    `

    await client.query(query)
    return
  } catch (err) {
    log.error(`Error in delete_performer_group_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function get_performer_db (bind: any, client: Client) {
  try {

    let query = `
      select 
        srp.id,
        srp.sr_performer_group_id,
        srp.user_id as performer_id,
        srp.is_head_performer,
        json_build_object(
          'first_name', e.first_name_${bind.lang},
          'last_name', e.last_name_${bind.lang},
          'middle_name', e.middle_name_${bind.lang}
        ) as user
      from hr.sr_performer srp, hr.employee e
      where srp.sr_performer_group_id = ${bind.performer_group_id}
      and e.id = srp.user_id
      and srp.is_deleted = false
    `

    let { rows: performer } = await client.query(query)

    return performer
  } catch (err) {
    log.error(`Error in get_performer_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function add_performer_db (bind: any, client: Client) {
  try {

    let query = `
      insert into hr.sr_performer (sr_performer_group_id, user_id, is_head_performer) values (${bind.sr_performer_group_id}, ${bind.performer_id}, ${bind.is_head_performer})
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in add_performer_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function edit_performer_db (bind: any, client: Client) {
  try {

    let query = `
      update hr.sr_performer set sr_performer_group_id = ${bind.sr_performer_group_id}, user_id = ${bind.performer_id}, is_head_performer = ${bind.is_head_performer} where id = ${bind.id}
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in edit_performer_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function delete_performer_db (bind: any, client: Client) {
  try {

    let query = `
      update hr.sr_performer set is_deleted = true where id = ${bind.id}
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in add_performer_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function get_service_category_db (bind: any, client: Client) {
  try {

    let sql_where_clause = ''

    if (bind.category_id) {
      sql_where_clause = `and id = ${bind.category_id}`
    }

    let query = `
      select 
        id,
        name_${bind.lang} as name,
        name_kaz,
        name_rus,
        need_to_be_approved
      from ref.sr_category
      where is_deleted = false
      ${sql_where_clause}
    `

    let { rows: category } = await client.query(query)

    return category
  } catch (err) {
    log.error(`Error in get_service_category_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function add_category_db (bind: any, client: Client) {
  try {

    let query = `
      insert into ref.sr_category (name_rus, name_kaz, need_to_be_approved) values ('${bind.name_rus}', '${bind.name_kaz}', ${bind.need_to_be_approved})
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in add_category_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function edit_category_db (bind: any, client: Client) {
  try {

    let query = `
      update ref.sr_category set name_rus = '${bind.name_rus}', name_kaz = '${bind.name_kaz}', need_to_be_approved = ${bind.need_to_be_approved} where id = ${bind.id}
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in edit_category_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function delete_category_db (bind: any, client: Client) {
  try {

    let query = `
      update ref.sr_category set is_deleted = true where id = ${bind.id}
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in delete_category_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function get_service_subcategory_db (bind: any, client: Client) {
  try {

    let query = `
      select 
        id,
        name_${bind.lang} as name,
        name_kaz,
        name_rus,
        sr_category_id
      from ref.sr_subcategory
      where is_deleted = false
      and sr_category_id = ${bind.category_id}
    `

    let { rows: subcateqory } = await client.query(query)

    return subcateqory
  } catch (err) {
    log.error(`Error in get_service_subcategory_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function add_subcategory_db (bind: any, client: Client) {
  try {

    let query = `
      insert into ref.sr_subcategory (name_rus, name_kaz, sr_category_id) values ('${bind.name_rus}', '${bind.name_kaz}', ${bind.sr_category_id})
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in add_subcategory_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function edit_subcategory_db (bind: any, client: Client) {
  try {

    let query = `
      update ref.sr_subcategory set name_rus = '${bind.name_rus}', name_kaz = '${bind.name_kaz}', sr_category_id = ${bind.sr_category_id} where id = ${bind.id}
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in edit_subcategory_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}

export async function delete_subcategory_db (bind: any, client: Client) {
  try {

    let query = `
      update ref.sr_subcategory set is_deleted = true where id = ${bind.id}
    `

    await client.query(query)

  } catch (err) {
    log.error(`Error in delete_subcategory_db -> ${JSON.stringify(err)}`);
    throw err;
  }
}