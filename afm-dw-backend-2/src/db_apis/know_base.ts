import log from "../config/logger";
import get_client from "../loaders/database";
import { EntryBind, Entry } from "../interface/interface";
import { Client } from 'pg';

export async function know_base_get_db(bind: any): Promise<Entry[]> {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();
    let query = `
        select 
            DISTINCT kb.id,
            kb.name_${bind.lang} as name,
            kb.name_rus as name_rus,
            kb.name_kaz as name_kaz,
            kb.body_${bind.lang} as body,
            kb.body_rus as body_rus,
            kb.body_kaz as body_kaz,
            off.file_id as file_id,
            kb.parent_id,
            kb.create_date,
            kb.update_date,
            kb.url,
            kb.url_name_${bind.lang} as url_name,
            kb.url_name_rus as url_name_rus,
            kb.url_name_kaz as url_name_kaz,
            off.file_name as file_name
        from 
            hr.know_base kb
            join hr.know_department kdep on kdep.know_base_id = kb.id ${!bind.role_id.includes(5) ? `and kdep.department_id in (-1, ${bind.department_id})` : ''}
        left join (
              select 
                f.id as file_id, 
                f.name as file_name, 
                of.object_type_id, 
                of.object_id 
              from hr.object_file of join hr.file f 
                on of.file_id = f.id          
              where f.is_active = true 
                and of.object_type_id = 4
            ) off 
          on off.object_id = kb.id
        `;
    query += bind.id
      ? `
        where
           kb.parent_id = ${bind.id}`
      : `
           where
           kb.parent_id is null`;
    query += ` and kb.is_active = true and kb.know_base_type_id = ${bind.know_base_type_id}`;

    query += ` order by kb.id desc`;
    let { rows: sections } = await client.query(query).catch((e: any) => {
      throw `Ошибка entry db => ${e}`;
    });
    sections = await Promise.all(sections.map(async (item: any) => {
      if (client) {
        let result = await client.query(`select kd.department_id as id, d.name_${bind.lang} as name from hr.know_department kd join hr.department d on d.id = kd.department_id where kd.know_base_id = $1 and d.id <> -1`, [item.id])
        item.accessDepartment = result.rows
        return item
      }
    }))

    return sections;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function know_base_post_db(bind: any, client: Client): Promise<number> {
  try {
    let query = `
        insert into hr.know_base
            (name_rus, name_kaz, body_rus, body_kaz, parent_id, url, url_name_rus, url_name_kaz, create_date, update_date, create_user, update_user, know_base_type_id)
        values 
            ($1, $2, $3, $4, $5, $6, $7, $8, current_timestamp, current_timestamp, $9, $10, $11)
        returning id
        `;

    let {
      rows: {
        [0]: { id: know_id },
      },
    } = await client.query(query, [bind.name_rus || null, bind.name_kaz || null, bind.body_rus || null, bind.body_kaz || null, bind.parent_id || null, bind.url || null, bind.url_name_rus || null, bind.url_name_kaz || null, bind.user_name, bind.user_name, bind.know_base_type_id]);
    return know_id;
  } catch (err) {
    log.error(err)
    throw err;
  }
}

export async function know_base_post_know_department(bind: any, department_id: number, client: Client): Promise<undefined> {
  try {
    let query = `
        insert into hr.know_department
            (know_base_id, department_id, create_date, update_date, create_user, update_user)
        values 
            ($1, $2, current_timestamp, current_timestamp, $3, $4)
        returning id
        `;

        await client.query(query, [bind.new_know_id || bind.id, department_id, bind.user_name, bind.user_name]);
    return;
  } catch (err) {
    log.error(err)
    throw err;
  }
}

export async function know_base_del_know_department(bind: any, client: Client): Promise<undefined> {
  try {
    let query = `delete from hr.know_department where know_base_id = $1`;

        await client.query(query, [bind.id]);
    return;
  } catch (err) {
    log.error(err)
    throw err;
  }
}

export async function know_base_put_db(bind: any, client: Client): Promise<number> {
  try {
    let query = `
        update hr.know_base set name_rus = $2, name_kaz = $3, body_rus = $4, body_kaz = $5, url = $6, url_name_rus = $7, url_name_kaz = $8, update_date = current_timestamp, update_user = $9 where id = $1
        returning id
        `;

    let {
      rows: {
        [0]: { id: know_id },
      },
    } = await client.query(query, [bind.id, bind.name_rus, bind.name_kaz, bind.body_rus, bind.body_kaz, bind.url, bind.url_name_rus, bind.url_name_kaz, bind.user_name]);
    return know_id;
  } catch (err) {
    log.error(err)
    throw err;
  }
}

export async function know_base_delete_db(bind: EntryBind): Promise<Entry[]> {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();
    let query = `update hr.know_base kb set is_active = false where id = $1`;
    let { rows: sections } = await client
      .query(query, [bind.id])
      .catch((e: any) => {
        throw `Ошибка entry db => ${e}`;
      });

    return sections;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}
