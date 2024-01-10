import { Client } from "pg";
import log from "../config/logger";

export async function anotherUserCreate(
  bind: any,
  client: Client
): Promise<number> {
  let query = "";
  let parameters = [];
  try {
    bind.middle_name = bind.middle_name === null ? "" : bind.middle_name;

    query = `
            insert into hr.employee 
                (
                    last_name_rus, 
                    last_name_kaz, 
                    first_name_rus, 
                    first_name_kaz, 
                    middle_name_rus, 
                    middle_name_kaz, 
                    department_id, 
                    is_performer
                ) 
            values 
                (
                    $1, 
                    $2, 
                    $3, 
                    $4,
                    $5, 
                    $6,
                    -1,
                    true
                )
        returning id
        `;

    parameters = [
      bind.last_name,
      bind.last_name,
      bind.first_name,
      bind.first_name,
      bind.middle_name,
      bind.middle_name,
    ];

    const {
      rows: {
        0: { id: candidateId },
      },
    } = await client.query(query, parameters);

    return candidateId;
  } catch (error) {
    log.error(error);
    throw error;
  }
}

export async function anotherUserUpdate(
  bind: any,
  client: Client
): Promise<number> {
  let query: string;
  let parameters = [];
  try {
    bind.middle_name = bind.middle_name === null ? "" : bind.middle_name;

    if (bind.is_fired === true) {
      query = `
                update 
                    hr.employee 
                set 
                    is_fired = true
                where 
                    id = $1
                returning id
            `;

      parameters = [bind.id];
    } else {
      query = `
                update 
                    hr.employee 
                set 
                    last_name_rus = $1,
                    last_name_kaz = $2,
                    first_name_rus = $3,
                    first_name_kaz = $4,
                    middle_name_rus = $5,
                    middle_name_kaz = $6
                where 
                    id = $7
                returning id
            `;
      parameters = [
        bind.last_name,
        bind.last_name,
        bind.first_name,
        bind.first_name,
        bind.middle_name,
        bind.middle_name,
        bind.id,
      ];
    }

    const {
      rows: {
        0: { id: candidateId },
      },
    } = await client.query(query, parameters);

    return candidateId;
  } catch (error) {
    log.error(error);
    throw error;
  }
}

export async function performerUserGet(client: Client): Promise<any[]> {
  let query = "";
  try {
    query = `
            select 
                t1.last_name_rus, 
                t1.first_name_rus, 
                t1.middle_name_rus, 
                t2.username as login, 
                t1.id 
            from 
                hr.employee t1 
                join hr.user t2 on t1.id = t2.id 
            where 
                t1.is_performer = true 
                and t1.is_fired = false
            `;

    const { rows: data } = await client.query(query);

    return data;
  } catch (error) {
    log.error(error);
    throw error;
  }
}
