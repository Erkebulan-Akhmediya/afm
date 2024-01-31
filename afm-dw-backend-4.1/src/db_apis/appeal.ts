import { Pool, Client } from "pg";
import log from "../config/logger";
import get_client from "../loaders/database";
var moment = require("moment");
require("moment-weekday-calc");

var cron = require("node-cron");

cron.schedule("0 0 */3 * * *", async () => { 

  if (process.env.APPLICATION_WITH_CRON !== "1") { return; }

  let client: Client | null = null;
  client = get_client(); await client.connect();
  console.log("running every ");

  try {
    let select = `select t1.create_date, t1.appeal_id, t2.expert_group_id 
        from hr.appeal_status_history t1 join hr.appeal t2 on t1.appeal_id = t2.id 
        where t1.appeal_status_id = 4 and t2.appeal_status_id = 4`;
    let { rows: data } = await client.query(select);
    for await (let el of data) {
      let { rows: votes }: any =
        await client.query(`select t1.id, t1.vote, t1.appeal_id, t1.user_id
            from hr.appeal_votes t1 
            where t1.appeal_id = ${el.appeal_id} and t1.is_active = true`);

      for await (let el of votes) {
        let {
          rows: { [0]: data },
        }: any = await client.query(
          `select appeal_expert_type_id from hr.appeal_expert where appeal_id = ${el.appeal_id} and user_id = ${el.user_id} `
        );
        el["appeal_expert_type_id"] = data.appeal_expert_type_id;
      }

      let { rows: experts }: any =
        await client.query(`select * from hr.appeal_expert 
            where appeal_expert_type_id != 2 and appeal_id = ${el.appeal_id} and is_deleted = false`);
      let {
        rows: { [0]: lastUpdateVotes },
      }: any = await client.query(
        `select max(create_date) from hr.appeal_votes t1 where t1.appeal_id = ${el.appeal_id} and t1.is_active = true`
      );
    let bosIsVoted = votes.find((el: any) => el.appeal_expert_type_id == 3);
    let votesCounter = votes.length
    if(bosIsVoted) {
      votesCounter+=1.5
    }

      if (
        (votesCounter * 100) / (experts.length + 1.5) >= 75 && bosIsVoted &&
        moment().isSameOrAfter(moment(lastUpdateVotes.max).add(1, "d"), 'day')
      ) {
        let vote_za = 0;
        let vote_protiv = 0;
        for (let el of votes) {
          if (el.vote == true) {
            if (el.appeal_expert_type_id == 3) {
              vote_za = vote_za + 2.5;
            } else {
              vote_za = vote_za + 1;
            }
          } else {
            if (el.appeal_expert_type_id == 3) {
              vote_protiv = vote_protiv + 2.5;
            } else {
              vote_protiv = vote_protiv + 1;
            }
          }
        }
        let result: any;
        if (vote_za > vote_protiv) {
          result = true;
        } else if (vote_za < vote_protiv) {
          result = false;
        } else if (vote_za == vote_protiv) {
          let bos = votes.find((el: any) => el.appeal_expert_type_id == 3);
          result = bos ? bos.vote : -4;
        }
        let bind: any = {
          user_id: -1,
          appeal_status_id: result == -4 ? -4 : result == true ? 5 : -2,
          id: el.appeal_id,
        };
        await appeal_change_status_db(bind);
      } else {

                if (moment().isAfter(moment(el.create_date).add(10, "d"))) {
          if (((votesCounter * 100) / (experts.length + 1.5) >= 75) && bosIsVoted) {
            let vote_za = 0;
            let vote_protiv = 0;
            for (let el of votes) {
              if (el.vote == true) {
                if (el.appeal_expert_type_id == 3) {
                  vote_za = vote_za + 2.5;
                } else {
                  vote_za = vote_za + 1;
                }
              } else {
                if (el.appeal_expert_type_id == 3) {
                  vote_protiv = vote_protiv + 2.5;
                } else {
                  vote_protiv = vote_protiv + 1;
                }
              }
            }
            let result: any;
            if (vote_za > vote_protiv) {
              result = true;
            } else if (vote_za < vote_protiv) {
              result = false;
            } else if (vote_za == vote_protiv) {
              let bos = votes.find((el: any) => el.appeal_expert_type_id == 3);
              result = bos ? bos.vote : -4;
            }
            let bind: any = {
              user_id: -1,
              appeal_status_id: result == -4 ? -4 : result == true ? 5 : -2,
              id: el.appeal_id,
            };
            await appeal_change_status_db(bind);
          } else {
            let bind: any = {
              user_id: -1,
              appeal_status_id: -4,
              id: el.appeal_id,
            };
            await appeal_change_status_db(bind);
          }
        } else {
        }
      }
    }

    let select2 = `select id as appeal_id, expert_group_id from hr.appeal where appeal_status_id = 44`;
    let { rows: data2 } = await client.query(select2);

    for await (let el of data2) {
      let {
        rows: { [0]: date },
      }: any = await client.query(
        `select max(create_date) as create_date from hr.appeal_status_history where appeal_status_id = 44 and appeal_id = ${el.appeal_id} `
      );
      el["create_date"] = date.create_date;
    }

    for await (let el of data2) {
      let { rows: votes }: any =
        await client.query(`select t1.id, t1.vote, t1.appeal_id, t1.user_id
            from hr.appeal_votes t1 
            where t1.appeal_id = ${el.appeal_id} and t1.is_active = true`);
      for await (let el of votes) {
        let {
          rows: { [0]: data },
        }: any = await client.query(
          `select appeal_expert_type_id from hr.appeal_expert where appeal_id = ${el.appeal_id} and user_id = ${el.user_id} `
        );
        el["appeal_expert_type_id"] = data.appeal_expert_type_id;
      }

      let { rows: experts }: any =
        await client.query(`select * from hr.appeal_expert 
            where appeal_expert_type_id != 2 and appeal_id = ${el.appeal_id} and is_deleted = false`);
      let {
        rows: { [0]: lastUpdateVotes },
      }: any = await client.query(
        `select max(create_date) from hr.appeal_votes t1 where t1.appeal_id = ${el.appeal_id} and t1.is_active = true`
      );

      let bosIsVoted = votes.find((el: any) => el.appeal_expert_type_id == 3);
      let votesCounter = votes.length
      if(bosIsVoted) {
        votesCounter+=1.5
      }
      if (
        (votesCounter * 100) / (experts.length + 1.5) >= 75 && bosIsVoted &&  moment().isSameOrAfter(moment(lastUpdateVotes.max).add(1, "d"), 'day')
      ) {
        let vote_za = 0;
        let vote_protiv = 0;
        for (let el of votes) {
          if (el.vote == true) {
            if (el.appeal_expert_type_id == 3) {
              vote_za = vote_za + 2.5;
            } else {
              vote_za = vote_za + 1;
            }
          } else {
            if (el.appeal_expert_type_id == 3) {
              vote_protiv = vote_protiv + 2.5;
            } else {
              vote_protiv = vote_protiv + 1;
            }
          }
        }
        let result: any;
        if (vote_za > vote_protiv) {
          result = true;
        } else if (vote_za < vote_protiv) {
          result = false;
        } else if (vote_za == vote_protiv) {
          let bos = votes.find((el: any) => el.appeal_expert_type_id == 3);
          result = bos ? bos.vote : -4;
        }
        let bind: any = {
          user_id: -1,
          appeal_status_id: result == -4 ? -4 : result == true ? 5 : -2,
          id: el.appeal_id,
        };
        await appeal_change_status_db(bind);
      } else {
        if (moment().isAfter(moment(el.create_date).add(3, "d"))) {
          if (((votesCounter * 100) / (experts.length + 1.5) >= 75) && bosIsVoted) {
            let vote_za = 0;
            let vote_protiv = 0;
            for (let el of votes) {
              if (el.vote == true) {
                if (el.appeal_expert_type_id == 3) {
                  vote_za = vote_za + 2.5;
                } else {
                  vote_za = vote_za + 1;
                }
              } else {
                if (el.appeal_expert_type_id == 3) {
                  vote_protiv = vote_protiv + 2.5;
                } else {
                  vote_protiv = vote_protiv + 1;
                }
              }
            }
            let result: any;
            if (vote_za > vote_protiv) {
              result = true;
            } else if (vote_za < vote_protiv) {
              result = false;
            } else if (vote_za == vote_protiv) {
              let bos = votes.find((el: any) => el.appeal_expert_type_id == 3);
              result = bos ? bos.vote : -4;
            }
            let bind: any = {
              user_id: -1,
              appeal_status_id: result == -4 ? -4 : result == true ? 5 : -2,
              id: el.appeal_id,
            };
            await appeal_change_status_db(bind);
          } else {
            let bind: any = {
              user_id: -1,
              appeal_status_id: -4,
              id: el.appeal_id,
            };
            await appeal_change_status_db(bind);
          }
        } else {
        }
      }
    }
  } catch (err) {
    log.error(`Error in cron appeal ->`)
    log.error(err)
    throw err;
  } finally {
    console.log("ПОДСЧЕТ ГОЛОСОВ ЗАВЕРШЕН");
    if (client) {
      await client.end();
    }
  }
});

export async function appeal_types_get_db(bind: any, client: Client) {
  try {

    let select1: string = `select name_${bind.lang} as name, id from ref.appeal_type`;

    let select2: string = `select name_${bind.lang} as name, id, appeal_type_id from ref.appeal_subtype`;

    let select3: string = `select name_${bind.lang} as name, id from ref.appeal_status`;

    let data: any = {
      types: [],
      subtypes: [],
      status_list: [],
      appeal_experts: [],
    };

    let { rows: types } = await client.query(select1);
    data.types = types;
    let { rows: subtypes } = await client.query(select2);
    data.subtypes = subtypes;
    let { rows: status_list } = await client.query(select3);
    data.status_list = status_list;

    let selectExpert1 = `select * from ref.appeal_expert_group where is_active = true`;
    let { rows: groups } = await client.query(selectExpert1);

    let selectExpert2 = `select t1.id, t1.user_id,  t1.expert_group_id, t1.expert_type, t3.name_${bind.lang} as expert_type_name, 
        concat( t2.last_name_${bind.lang},' ', t2.first_name_${bind.lang}) as user_name,
        (select t6.name_rus as department_name from hr.department t6 where t6.id = t2.department_id limit 1)  
        from ref.appeal_expert t1 
        join hr.employee t2 on t1.user_id = t2.id 
        join ref.appeal_expert_type t3 on t1.expert_type = t3.id 
        join ref.appeal_expert_group t4 on t1.expert_group_id = t4.id
        where t1.is_deleted = false and t4.is_active = true`;
    let { rows: experts } = await client.query(selectExpert2);

    for (let el1 of groups) {
      el1["experts"] = experts.filter((el2) => el2.expert_group_id == el1.id);
    }
    data.appeal_experts = groups;
    return data;
  } catch (err) {
    log.error(err);
    throw err;
  }
}

export async function appeal_get_db(bind: any, client: Client) {
  try {

    let select1: string = `
      select 
        t1.id, 
        t1.title, 
        t1.description, 
        t1.solutions, 
        t1.expert_group_id, 
        t1.performers,
        t1.expected_result, 
        t1.expected_date_of_complete, 
        t1.appeal_status_id, 
        t1.create_user_id, 
        t1.appeal_type_id, 
        t1.secretary_description,
        t1.appeal_subtype_id, 
        t3.name_${bind.lang} as appeal_type_name, 
        t4.name_${bind.lang} as appeal_subtype_name,
        t2.name_${bind.lang} as appeal_status_name, 
        concat( t5.last_name,' ', t5.first_name) as created_user_name,
        (select t8.name_${bind.lang} as work_phone from hr.employee_contact_info t8 where t8.employee_id = t5.id and t8.contact_info_type_id = 3 and t8.is_active = true limit 1),
        (select t9.name_${bind.lang} as mobile_phone from hr.employee_contact_info t9 where t9.employee_id = t5.id and t9.contact_info_type_id = 4 and t9.is_active = true limit 1),
        (select array(select t6.user_id from hr.appeal_expert t6 where t6.appeal_id = t1.id and t6.is_deleted = false and t6.appeal_expert_type_id != 2)) as experts,
        (select array(select t7.user_id from hr.appeal_votes t7 where t7.appeal_id = t1.id and t7.is_active = true)) as votes,
        t5.organization_name,
        t5.department_name,
        t5.position_name,
        (select min(create_date) from hr.appeal_status_history where appeal_status_id = 2 and appeal_id = t1.id) as appeal_send_date,
        (select max(create_date) from hr.appeal_status_history where appeal_id = t1.id and (appeal_status_id = 4 or appeal_status_id = 44)) as last_status_date
      from hr.appeal t1 
        join ref.appeal_status t2 on t1.appeal_status_id = t2.id 
        join ref.appeal_type t3 on t1.appeal_type_id = t3.id 
        join ref.appeal_subtype t4 on t1.appeal_subtype_id = t4.id 
        join hr.employee_v t5 on t1.create_user_id = t5.id 
      `;

       let sql_where_clause =``


           if (bind.date_from) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }
      sql_where_clause += `  ((select min(create_date) from hr.appeal_status_history where appeal_status_id = 2 and appeal_id = t1.id) between '${bind.date_from}' and '${bind.date_end}')`
    }

    if (bind.table_type) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }
      if(bind.table_type == 'my') {
        sql_where_clause += `  t1.create_user_id = ${bind.user_id} `
      } else if (bind.table_type == 'with_me_secretary') {
        sql_where_clause += `  t1.appeal_status_id != 1 and t1.appeal_status_id != -1 and t1.appeal_status_id != 2 `
      } else if (bind.table_type == 'with_me' && bind.voted == false) {
        sql_where_clause += `  (t1.appeal_status_id = 4 or t1.appeal_status_id = 44) and
        ${bind.user_id} = ANY( array(select t6.user_id from hr.appeal_expert t6 where t6.appeal_id = t1.id and t6.is_deleted = false and t6.appeal_expert_type_id != 2)) and
        NOT(${bind.user_id} =  ANY ( array(select t7.user_id from hr.appeal_votes t7 where t7.appeal_id = t1.id and t7.is_active = true)))`
      } else if (bind.table_type == 'with_me' && bind.voted == true) {
        sql_where_clause += `  (t1.appeal_status_id != 1 and t1.appeal_status_id != -1 and t1.appeal_status_id != 2) and
        ${bind.user_id} = ANY( array(select t6.user_id from hr.appeal_expert t6 where t6.appeal_id = t1.id and t6.is_deleted = false and t6.appeal_expert_type_id != 2)) and
        ${bind.user_id} =  ANY ( array(select t7.user_id from hr.appeal_votes t7 where t7.appeal_id = t1.id and t7.is_active = true))`
      }
        else if (bind.table_type == 'new') {
        sql_where_clause += `  t1.appeal_status_id = 2 `
      } else if (bind.table_type == 'work') {
        sql_where_clause += `  (t1.appeal_status_id = 4 or t1.appeal_status_id = -4 or t1.appeal_status_id = 44 or t1.appeal_status_id = 3) `
      } else if (bind.table_type == 'approved') {
        sql_where_clause += `  t1.appeal_status_id = 5 `
      }  else if (bind.table_type == 'perform') {
        sql_where_clause += `  (t1.appeal_status_id = 6 or t1.appeal_status_id = 66) `
      }  else if (bind.table_type == 'rework') {
        sql_where_clause += `  t1.appeal_status_id = -1 `
      }  else if (bind.table_type == 'complete') {
        sql_where_clause += `  (t1.appeal_status_id = -2 or t1.appeal_status_id = -3 or t1.appeal_status_id = 7) `
      }

          }

    if (bind.search_string) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }

            if(parseInt(bind.search_string)) {
        sql_where_clause += ` (
          upper(t1.title) like upper('%${bind.search_string}%') 
            or upper(t3.name_${bind.lang}) like upper('%${bind.search_string}%') 
            or upper(t4.name_${bind.lang}) like upper('%${bind.search_string}%') 
            or upper(t2.name_${bind.lang}) like upper('%${bind.search_string}%')
            or upper(t5.department_name) like upper('%${bind.search_string}%')
            or upper(t5.organization_name) like upper('%${bind.search_string}%')
            or t1.id = ${parseInt(bind.search_string)}
        ) `
      } else {
        sql_where_clause += ` (
          upper(t1.title) like upper('%${bind.search_string}%') 
            or upper(t3.name_${bind.lang}) like upper('%${bind.search_string}%') 
            or upper(t4.name_${bind.lang}) like upper('%${bind.search_string}%') 
            or upper(t2.name_${bind.lang}) like upper('%${bind.search_string}%')
            or upper(t5.department_name) like upper('%${bind.search_string}%')
            or upper(t5.organization_name) like upper('%${bind.search_string}%')
        ) `
      }

          }

    select1 += sql_where_clause


        select1 += ` order by t1.update_date desc `

    if(bind.page && bind.itemsperpage && bind.itemsperpage!=-1) {
      select1 += ` limit ${bind.itemsperpage} offset ${(bind.page-1)*bind.itemsperpage}`
    }



    let { rows: appeals } = await client.query(select1);

    let temp: any = [];
    for await (let el of appeals) {
      let fileQuery = `select f.name, obj.file_id, obj.object_id, f.id, f.create_user from hr.file f join hr.object_file obj on f.id = obj.file_id      
        where obj.object_id = ${el.id} AND obj.object_type_id = 12 and f.is_active = true`;
      let { rows: files }: any = await client.query(fileQuery);
      el["files"] = files;
      temp.push(el);
    }
    appeals = temp;


      return appeals;
  } catch (err) {
    log.error(err);
    throw err;
  }
}

export async function appeal_get_total_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

       let sql_where_clause =``

       if (bind.date_from) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }
      sql_where_clause += `  ((select min(create_date) from hr.appeal_status_history where appeal_status_id = 2 and appeal_id = t1.id) between '${bind.date_from}' and '${bind.date_end}')`
    }

    if (bind.table_type) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }
      if(bind.table_type == 'my') {
        sql_where_clause += `  t1.create_user_id = ${bind.user_id} `
      } else if (bind.table_type == 'with_me_secretary') {
        sql_where_clause += `  t1.appeal_status_id != 1 and t1.appeal_status_id != -1 and t1.appeal_status_id != 2 `
      } else if (bind.table_type == 'with_me' && bind.voted == false) {
        sql_where_clause += `  (t1.appeal_status_id = 4 or t1.appeal_status_id = 44) and
        ${bind.user_id} = ANY( array(select t6.user_id from hr.appeal_expert t6 where t6.appeal_id = t1.id and t6.is_deleted = false and t6.appeal_expert_type_id != 2)) and
        NOT(${bind.user_id} =  ANY ( array(select t7.user_id from hr.appeal_votes t7 where t7.appeal_id = t1.id and t7.is_active = true)))`
      } else if (bind.table_type == 'with_me' && bind.voted == true) {
        sql_where_clause += `  (t1.appeal_status_id != 1 and t1.appeal_status_id != -1 and t1.appeal_status_id != 2) and
        ${bind.user_id} = ANY( array(select t6.user_id from hr.appeal_expert t6 where t6.appeal_id = t1.id and t6.is_deleted = false and t6.appeal_expert_type_id != 2)) and
        ${bind.user_id} =  ANY ( array(select t7.user_id from hr.appeal_votes t7 where t7.appeal_id = t1.id and t7.is_active = true))`
      } else if (bind.table_type == 'new') {
        sql_where_clause += `  t1.appeal_status_id = 2 `
      } else if (bind.table_type == 'work') {
        sql_where_clause += `  (t1.appeal_status_id = 4 or t1.appeal_status_id = -4 or t1.appeal_status_id = 44 or t1.appeal_status_id = 3) `
      } else if (bind.table_type == 'approved') {
        sql_where_clause += `  t1.appeal_status_id = 5 `
      }  else if (bind.table_type == 'perform') {
        sql_where_clause += `  (t1.appeal_status_id = 6 or t1.appeal_status_id = 66) `
      }  else if (bind.table_type == 'rework') {
        sql_where_clause += `  t1.appeal_status_id = -1 `
      }  else if (bind.table_type == 'complete') {
        sql_where_clause += `  (t1.appeal_status_id = -2 or t1.appeal_status_id = -3 or t1.appeal_status_id = 7) `
      }
    }





            if (bind.search_string) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }

      if(parseInt(bind.search_string)) {
        sql_where_clause += ` (
          upper(t1.title) like upper('%${bind.search_string}%') 
            or upper(t3.name_${bind.lang}) like upper('%${bind.search_string}%') 
            or upper(t4.name_${bind.lang}) like upper('%${bind.search_string}%') 
            or upper(t2.name_${bind.lang}) like upper('%${bind.search_string}%')
            or upper(t5.department_name) like upper('%${bind.search_string}%')
            or upper(t5.organization_name) like upper('%${bind.search_string}%')
            or t1.id = ${parseInt(bind.search_string)}
        ) `
      } else {
        sql_where_clause += ` (
          upper(t1.title) like upper('%${bind.search_string}%') 
            or upper(t3.name_${bind.lang}) like upper('%${bind.search_string}%') 
            or upper(t4.name_${bind.lang}) like upper('%${bind.search_string}%') 
            or upper(t2.name_${bind.lang}) like upper('%${bind.search_string}%')
            or upper(t5.department_name) like upper('%${bind.search_string}%')
            or upper(t5.organization_name) like upper('%${bind.search_string}%')
        ) `
      }
    }




                let selectTotal = ` select
    count(1) as total
          
         from hr.appeal t1
           join ref.appeal_status t2 on t1.appeal_status_id = t2.id
           join ref.appeal_type t3 on t1.appeal_type_id = t3.id
           join ref.appeal_subtype t4 on t1.appeal_subtype_id = t4.id
           join hr.employee_v t5 on t1.create_user_id = t5.id `
      selectTotal += sql_where_clause

      let {rows: {[0]:{total}}}: any = await client.query(selectTotal)

      return total;



                 } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}


export async function one_appeal_get_db(bind: any, client: Client ) {
  try {

    let select1: string = `
      select 
        t1.id, 
        t1.title, 
        t1.description, 
        t1.solutions, 
        t1.expert_group_id, 
        t1.performers,
        t1.expected_result, 
        t1.expected_date_of_complete, 
        t1.appeal_status_id, 
        t1.create_user_id, 
        t1.appeal_type_id, 
        t1.secretary_description,
        t1.appeal_subtype_id, 
        t3.name_${bind.lang} as appeal_type_name, 
        t4.name_${bind.lang} as appeal_subtype_name,
        t2.name_${bind.lang} as appeal_status_name, 
        concat( t5.last_name,' ', t5.first_name) as created_user_name,
        (select t8.name_${bind.lang} as work_phone from hr.employee_contact_info t8 where t8.employee_id = t5.id and t8.contact_info_type_id = 3 and t8.is_active = true limit 1),
        (select t9.name_${bind.lang} as mobile_phone from hr.employee_contact_info t9 where t9.employee_id = t5.id and t9.contact_info_type_id = 4 and t9.is_active = true limit 1),
        t5.organization_name,
        t5.department_name,
        t5.position_name,
        (select min(create_date) from hr.appeal_status_history where appeal_status_id = 2 and appeal_id = t1.id) as appeal_send_date
      from hr.appeal t1 
        join ref.appeal_status t2 on t1.appeal_status_id = t2.id 
        join ref.appeal_type t3 on t1.appeal_type_id = t3.id 
        join ref.appeal_subtype t4 on t1.appeal_subtype_id = t4.id 
        join hr.employee_v t5 on t1.create_user_id = t5.id where t1.id =  ${bind.id}
      `;
    let {
      rows: { [0]: data },
    } = await client.query(select1);

    let fileQuery = `select f.name, obj.file_id, obj.object_id, f.id, f.create_user, f.create_date,
            concat( empl.last_name_rus,' ', empl.first_name_rus) as create_user_name
             from hr.file f join hr.object_file obj on f.id = obj.file_id  left join hr.user u on u.username = f.create_user
             left join hr.employee empl on u.id = empl.id    
        where obj.object_id = ${data.id} AND obj.object_type_id = 12 and f.is_active = true`;
    let { rows: files }: any = await client.query(fileQuery);

    data["files"] = files;

    let expertsQuery = `select t1.id, t1.appeal_id, t1.expert_group_id, t1.user_id, t1.parent_appeal_expert_id,
        t1.appeal_expert_type_id, t4.name_rus as expert_type_name,
        t1.create_date, t1.update_date, t1.create_user_id, t1.update_user_id,
        concat( t2.last_name_rus,' ', t2.first_name_rus) as user_name, t1.user_id,
        (select concat( last_name_rus,' ', first_name_rus)  from hr.employee where id =t1.update_user_id) as update_user_name,
        (select t3.name_rus as department_name from hr.department t3 where t3.id = t2.department_id limit 1)  
        from hr.appeal_expert t1 join hr.employee t2 on t1.user_id = t2.id  join ref.appeal_expert_type t4 on t1.appeal_expert_type_id = t4.id
        where t1.appeal_id = ${bind.id} and t1.is_deleted = false
        order by t1.appeal_expert_type_id desc, concat( t2.last_name_rus,' ', t2.first_name_rus) asc`;
    let { rows: experts }: any = await client.query(expertsQuery);

    data["experts"] = experts;

    if (data.performers) {
      let temp: any = [];
      for await (let el of data.performers) {
        let {
          rows: { [0]: data },
        }: any =
          await client.query(`select e.id as user_id, e.first_name_rus, e.last_name_rus, 
                (select d.name_rus as department_name from hr.department d where d.id = e.department_id limit 1),
                (select  p.name_${bind.lang} as position_name from hr.position p where p.id = e.position_id limit 1)
                 from hr.employee e where e.id = ${el}`);
        temp.push(data);
      }
      data.performers = temp;
    }

    if (data.experts) {
      let temp: any = data.experts;
      for await (let el of temp) {
        if (el.parent_appeal_expert_id) {
          let {
            rows: {
              [0]: { user_name: user_name },
            },
          } = await client.query(
            `select concat( last_name_rus,' ', first_name_rus) as user_name from hr.employee where id = ${el.parent_appeal_expert_id}`
          );
          el["parent_expert_name"] = user_name;
        }
      }
      data.experts = temp;
    }

    return data;
  } catch (err) {
    log.error(err);
    throw err;
  }
}

export async function appeal_create_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    await client.query("BEGIN");

    let query: string = `insert into hr.appeal (title, description, solutions, expected_result, appeal_status_id, create_user_id, update_user_id, appeal_type_id, appeal_subtype_id) 
        values ('${bind.title}', $$${
      bind.description ? bind.description : ""
    }$$, $$${bind.solutions ? bind.solutions : ""}$$, $$${
      bind.expected_result ? bind.expected_result : ""
    }$$, ${bind.appeal_status_id}, ${bind.user_id}, ${bind.user_id}, ${
      bind.appeal_type_id
    }, ${bind.appeal_subtype_id}) returning id`;

    let {
      rows: {
        [0]: { id: data },
      },
    } = await client.query(query);
    let query2: string = `insert into hr.appeal_status_history (appeal_status_id, create_user_id, appeal_id) 
        values (${bind.appeal_status_id}, ${bind.user_id}, ${data})`;
    await client.query(query2);
    await client.query("COMMIT");
    return data;
  } catch (err) {
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

export async function appeal_change_status_db(bind: any) {
  let client: Client | null = null;
  try {

    client = get_client(); await client.connect();
    await client.query("BEGIN");
    let select1: string = "";
    if (bind.appeal_status_id === 66) {
      select1 = `update hr.appeal 
            set 
                appeal_status_id = ${bind.appeal_status_id},
                expected_date_of_complete = '${bind.expected_date_of_complete}',
                update_date = current_timestamp,
                performers = ARRAY[${bind.performers}]
            where id = ${bind.id} returning *
            `;
    }

    else if (bind.appeal_status_id == 4) {
      select1 = `update hr.appeal 
            set 
                appeal_status_id = ${bind.appeal_status_id},
                update_date = current_timestamp
            where id = ${bind.id} returning *
            `;
      for await (let el of bind.experts) {
        let query: string = `insert into hr.appeal_expert (appeal_id, expert_group_id, user_id, appeal_expert_type_id, create_user_id, update_user_id) 
                values (${bind.id}, ${el.expert_group_id}, ${el.user_id}, ${el.expert_type}, ${bind.user_id}, ${bind.user_id})`;
        await client.query(query);
      }
    } else if (bind.secretary_description) {
      select1 = `update hr.appeal 
            set 
                appeal_status_id = ${bind.appeal_status_id},
                secretary_description = $$${bind.secretary_description}$$,
                update_date = current_timestamp
            where id = ${bind.id} returning *
            `;
    } else {
      select1 = `update hr.appeal 
        set 
            appeal_status_id = ${bind.appeal_status_id},
            update_date = current_timestamp
        where id = ${bind.id} returning *
        `;
    }
    let {
      rows: { [0]: data },
    } = await client.query(select1);

    let {
      rows: { [0]: last_status },
    } = await client.query(
      `select * from hr.appeal_status_history where appeal_id = ${bind.id} order by id desc limit 1`
    );
    if (last_status.appeal_status_id != bind.appeal_status_id) {
      let query2: string = `insert into hr.appeal_status_history (appeal_status_id, create_user_id, appeal_id) 
            values (${bind.appeal_status_id}, ${bind.user_id}, ${bind.id})`;
      await client.query(query2);
    }

    await client.query("COMMIT");

    moment.locale("ru");

    return data;
  } catch (err) {
    log.error(err);
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

export async function appeal_edit_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `update hr.appeal 
        set 
        title = '${bind.title}', 
        description = $$${bind.description ? bind.description : ""}$$, 
        solutions = $$${bind.solutions ? bind.solutions : ""}$$, 
        expected_result = $$${
          bind.expected_result ? bind.expected_result : ""
        }$$,  
        appeal_type_id = ${bind.appeal_type_id}, 
        appeal_subtype_id = ${bind.appeal_subtype_id}
        where id = ${bind.id} returning id
        `;
    let {
      rows: {
        [0]: { id: data },
      },
    } = await client.query(query);

    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function appeal_history_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();


    let query: string = `select t1.appeal_id, t1.create_user_id, t1.create_date as date,t1.appeal_status_id, t2.name_${bind.lang} as appeal_status_name 
            from hr.appeal_status_history t1 
            join ref.appeal_status t2 on t1.appeal_status_id = t2.id where appeal_id = ${bind.id} order by t1.id asc`;

    let { rows: data } = await client.query(query);

    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function appeal_vote_create_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let queryDeactivate: string = `update hr.appeal_votes set is_active = false where appeal_id = ${bind.id} and user_id =${bind.user_id}`;
    await client.query(queryDeactivate);

    let query: string = `insert into hr.appeal_votes (appeal_id, user_id, vote, description) values (${bind.id}, ${bind.user_id}, ${bind.vote}, $$${bind.description}$$) returning id`;

    let {
      rows: {
        [0]: { id: data },
      },
    } = await client.query(query);

    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function appeal_votes_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `
    select * from 
      (select t1.id, t1.vote, t1.user_id, t1.appeal_id, t1.description, t1.create_date,
      concat( t2.last_name_${bind.lang},' ', t2.first_name_${bind.lang}) as user_name, 
      (select t6.name_rus as department_name from hr.department t6 where t6.id = t2.department_id limit 1) as department_name,
      (select t6.code from hr.department t6 where t6.id = t2.department_id limit 1) as department_code
    from hr.appeal_votes t1 join hr.employee t2 on t1.user_id = t2.id
    where appeal_id = ${bind.id} and is_active=true) z1
    order by case when z1.department_code = 'top_managment' then 1 else 2 end asc, z1.user_name asc`;

    let { rows: data } = await client.query(query);

    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function expert_group_create_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `insert into ref.appeal_expert_group (name) 
        values ('${bind.expert_group_name}') returning id`;

    let {
      rows: {
        [0]: { id: group_id },
      },
    } = await client.query(query);

    await client.query(`insert into ref.appeal_expert (user_id, expert_group_id, expert_type, create_user_id, update_user_id) 
        values (${bind.user_id} , ${group_id}, 2, ${bind.user_id}, ${bind.user_id})`);

    let {
      rows: {
        [0]: { id: user_id },
      },
    } = await client.query(`select id from hr.employee where position_id=68 `);

    let quety3 = `insert into ref.appeal_expert (user_id, expert_group_id, expert_type, create_user_id, update_user_id) 
        values (${user_id}, ${group_id}, 3, ${bind.user_id}, ${bind.user_id})`;
    await client.query(quety3);

    return group_id;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function expert_group_delete_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();
    await client.query("BEGIN");
    let queryDeactivate: string = `update ref.appeal_expert_group set is_active = false where id = ${bind.expert_group_id}`;
    await client.query(queryDeactivate);
    await client.query("COMMIT");
  } catch (err) {
    log.error(err);
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

export async function add_expert_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `insert into hr.appeal_expert 
        (
            appeal_id, 
            expert_group_id,  
            user_id, 
            parent_appeal_expert_id,
            appeal_expert_type_id,
            create_user_id,
            update_user_id) 
        values 
        (
            ${bind.appeal_id},
            ${bind.expert_group_id ? bind.expert_group_id : null},
            ${bind.expert_user_id}, 
            ${
              bind.parent_appeal_expert_id ? bind.parent_appeal_expert_id : null
            },
            ${bind.expert_type},
            ${bind.user_id},
            ${bind.user_id})`;
    let { rows: data } = await client.query(query);
    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function delete_expert_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `update hr.appeal_expert 
        set 
            is_deleted = true,
            update_user_id = ${bind.user_id}
        where user_id = ${bind.expert_user_id} and appeal_id = ${bind.appeal_id}`;
    let { rows: data } = await client.query(query);
    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function public_appeal_get_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let select1: string = `
        select 
            t1.id, 
            t1.title, 
            t1.description, 
            t1.solutions, 
            t1.expert_group_id,
            t1.expected_result, 
            t1.expected_date_of_complete, 
            t1.appeal_status_id, 
            t1.create_user_id, 
            t1.appeal_type_id, 
            t1.secretary_description,
            t1.appeal_subtype_id, 
            t3.name_rus as appeal_type_name, 
            t4.name_rus as appeal_subtype_name,
            t2.name_rus as appeal_status_name, 
            concat( t5.last_name,' ', t5.first_name) as created_user_name,
            (select t8.name_rus as work_phone from hr.employee_contact_info t8 where t8.employee_id = t5.id and t8.contact_info_type_id = 3 and t8.is_active = true limit 1),
            (select t9.name_rus as mobile_phone from hr.employee_contact_info t9 where t9.employee_id = t5.id and t9.contact_info_type_id = 4 and t9.is_active = true limit 1),
            t5.organization_id,
            t5.organization_name,
            t5.department_name,
            t5.position_name,
            (select min(create_date) from hr.appeal_status_history where appeal_status_id = 2 and appeal_id = t1.id) as appeal_send_date
        from 
            hr.appeal t1 
            join ref.appeal_status t2 on t1.appeal_status_id = t2.id 
            join ref.appeal_type t3 on t1.appeal_type_id = t3.id 
            join ref.appeal_subtype t4 on t1.appeal_subtype_id = t4.id 
            join hr.employee_v t5 on t1.create_user_id = t5.id 
        where 
            t5.organization_id ${bind.tabtype==0?'>0':bind.tabtype==1?'=1':'!=1'} and
            t1.appeal_status_id between 4 and 7 or 
            t1.appeal_status_id = -3 or 
            t1.appeal_status_id = 66 or 
            t1.appeal_status_id = -4 or 
            t1.appeal_status_id = 44
        order by t1.update_date desc
        `;
    if(bind.page && bind.itemsperpage && bind.itemsperpage!=-1) {
      select1 += ` limit ${bind.itemsperpage} offset ${(bind.page-1)*bind.itemsperpage}`
    }

    let { rows: appeals } = await client.query(select1);
    let temp: any = [];
    for await (let el of appeals) {
      let fileQuery = `select f.name, obj.file_id, obj.object_id, f.id, f.create_user from hr.file f join hr.object_file obj on f.id = obj.file_id      
        where obj.object_id = ${el.id} AND obj.object_type_id = 12 and f.is_active = true`;
      let { rows: files }: any = await client.query(fileQuery);
      el["files"] = files;
      temp.push(el);
    }
    appeals = temp;

    let selectTotal: string = `
        select 
           count(1) as total
        from 
            hr.appeal t1 
           
            join hr.employee_v t5 on t1.create_user_id = t5.id 
        where 
            t5.organization_id ${bind.tabtype==0?'>0':bind.tabtype==1?'=1':'!=1'} and
            t1.appeal_status_id between 4 and 7 or 
            t1.appeal_status_id = -3 or 
            t1.appeal_status_id = 66 or 
            t1.appeal_status_id = -4 or 
            t1.appeal_status_id = 44
        `;
    let {rows: {[0]:{total}}}: any = await client.query(selectTotal);

    let result = {
      appeals: appeals,
      total: parseInt(total)
    }

    return result;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function add_expert_adviser_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `insert into hr.appeal_expert_adviser (user_id, appeal_id, expert_id) 
        values (${bind.adviser_user_id}, ${bind.appeal_id}, ${bind.user_id})`;
    let { rows: data } = await client.query(query);
    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function get_expert_adviser_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `select * from hr.appeal_expert_adviser where appeal_id = ${bind.appeal_id} and expert_id =${bind.user_id}`;
    let { rows: data } = await client.query(query);
    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function appeal_rating_get_db(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let select1: string = `select t1.appeal_status_id, t1.appeal_subtype_id, t2.name_rus as appeal_subtype, 
        t3.organization_id, t3.organization_name, t3.department_id, t3.department_name
        from hr.appeal t1 
        join ref.appeal_subtype t2 on t1.appeal_subtype_id = t2.id
        join hr.employee_v t3 on t1.create_user_id = t3.id where t1.appeal_status_id != 1`;

    let select2: string = `select id, name_rus from hr.organization where id not in (22, 8)`;

    let select3: string = `select id, name_rus from ref.appeal_subtype`;

    let select4: string = `select id, name_rus from hr.user_department_v d
        where d.parent_id = 1 and (exists (SELECT 1 FROM hr.department check_d where 
                    check_d.id in (WITH RECURSIVE rec_department AS (
                                    select check_dd.id from hr.department check_dd where check_dd.id = d.id
                                    UNION
                                    select check_ddd.id from hr.department check_ddd 
                                        JOIN rec_department check_dddd ON check_ddd.parent_id = check_dddd.id
                                    )
                                    SELECT id FROM rec_department)
                    and exists (select 1 from hr.employee check_e where check_e.department_id = check_d.id and check_e.is_fired = false))
        or d.is_edited_employee = true)`;

    let select5: string = `select department_id, department_name, parent_department_id, parent_department_name from cron_appeal_department_rel`;
    let data: any = {
      approved_appeals: [],
      organizations: [],
      appeal_subtype_list: [],
      center_department_list: [],
    };

    let { rows: approved_appeals } = await client.query(select1);
    data.approved_appeals = approved_appeals;
    let { rows: organizations } = await client.query(select2);
    data.organizations = organizations;
    let { rows: appeal_subtype_list } = await client.query(select3);
    data.appeal_subtype_list = appeal_subtype_list;
    let { rows: center_department_list } = await client.query(select4);
    data.center_department_list = center_department_list;
    let { rows: exist_department_rel } = await client.query(select5);
    data.exist_department_rel = exist_department_rel;

    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}


export async function add_expert_db_ref(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `insert into ref.appeal_expert 
        (
            expert_group_id,  
            user_id, 
            expert_type,
            create_user_id,
            update_user_id,
            create_date,
            update_date) 
        values 
        (
            ${bind.expert_group_id},
            ${bind.expert_user_id}, 
            ${bind.expert_type_id},
            ${bind.user_id},
            ${bind.user_id},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP)`;
    let { rows: data } = await client.query(query);
    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function del_expert_db_ref(bind: any) {
  let client: Client | null = null;
  try {
    client = get_client(); await client.connect();

    let query: string = `update ref.appeal_expert 
    set 
        is_deleted = true,
        update_user_id = ${bind.user_id},
        update_date = CURRENT_TIMESTAMP 
    where id = ${bind.id} `;
    let { rows: data } = await client.query(query);
    return data;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}





export async function appeal_get_db_for_xlsx(bind: any) {
  let client;
  try {
    client = get_client(); await client.connect();
    let select1: string = `
      select 
        t1.id , 
        t1.title as Название, 
        t4.name_${bind.lang} as Подтип,
        regexp_replace(regexp_replace(t1.description, E'<.*?>', '', 'g' ), E'&nbsp;', '', 'g') as Описание,
        regexp_replace(regexp_replace(t1.solutions, E'<.*?>', '', 'g' ), E'&nbsp;', '', 'g') as "Пути решения",
		    regexp_replace(regexp_replace(t1.expected_result, E'<.*?>', '', 'g' ), E'&nbsp;', '', 'g') as "Ожидаемый результат",
        to_char((select min(create_date) from hr.appeal_status_history where appeal_status_id = 2 and appeal_id = t1.id),'DD-MM-YYYY') as appeal_send_date,
        t1.performers,
        to_char(t1.expected_date_of_complete,'DD-MM-YYYY') as "Ожидаемая дата исполнения",
        t1.secretary_description as Примечание,
        t2.name_${bind.lang} as Статус, 
        concat( t5.last_name,' ', t5.first_name) as Инициатор,
        t5.organization_name as Организация,
        (select array(select t6.user_id from hr.appeal_expert t6 where t6.appeal_id = t1.id and t6.is_deleted = false order by t6.appeal_expert_type_id desc )) as experts    
         from hr.appeal t1 
        join ref.appeal_status t2 on t1.appeal_status_id = t2.id 
        join ref.appeal_type t3 on t1.appeal_type_id = t3.id 
        join ref.appeal_subtype t4 on t1.appeal_subtype_id = t4.id 
        join hr.employee_v t5 on t1.create_user_id = t5.id 
      `;

    let sql_where_clause =``


    if (bind.date_from) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }
      sql_where_clause += `  ((select min(create_date) from hr.appeal_status_history where appeal_status_id = 2 and appeal_id = t1.id) between '${bind.date_from}' and '${bind.date_end}')`
    }

    if (bind.table_type) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }
      if(bind.table_type == 'my') {
        sql_where_clause += `  t1.create_user_id = ${bind.user_id} `
      } else if (bind.table_type == 'with_me_secretary') {
        sql_where_clause += `  t1.appeal_status_id != 1 and t1.appeal_status_id != -1 and t1.appeal_status_id != 2 `
      } else if (bind.table_type == 'with_me' && bind.voted == false) {
        sql_where_clause += `  (t1.appeal_status_id != 1 and t1.appeal_status_id != -1 and t1.appeal_status_id != 2) and
        ${bind.user_id} = ANY( array(select t6.user_id from hr.appeal_expert t6 where t6.appeal_id = t1.id and t6.is_deleted = false and t6.appeal_expert_type_id != 2)) and
        NOT(${bind.user_id} =  ANY ( array(select t7.user_id from hr.appeal_votes t7 where t7.appeal_id = t1.id and t7.is_active = true)))`
      } else if (bind.table_type == 'with_me' && bind.voted == true) {
        sql_where_clause += `  (t1.appeal_status_id != 1 and t1.appeal_status_id != -1 and t1.appeal_status_id != 2) and
        ${bind.user_id} = ANY( array(select t6.user_id from hr.appeal_expert t6 where t6.appeal_id = t1.id and t6.is_deleted = false and t6.appeal_expert_type_id != 2)) and
        ${bind.user_id} =  ANY ( array(select t7.user_id from hr.appeal_votes t7 where t7.appeal_id = t1.id and t7.is_active = true))`
      }
        else if (bind.table_type == 'new') {
        sql_where_clause += `  t1.appeal_status_id = 2 `
      } else if (bind.table_type == 'work') {
        sql_where_clause += `  (t1.appeal_status_id = 4 or t1.appeal_status_id = -4 or t1.appeal_status_id = 44 or t1.appeal_status_id = 3) `
      } else if (bind.table_type == 'approved') {
        sql_where_clause += `  t1.appeal_status_id = 5 `
      }  else if (bind.table_type == 'perform') {
        sql_where_clause += `  (t1.appeal_status_id = 6 or t1.appeal_status_id = 66) `
      }  else if (bind.table_type == 'rework') {
        sql_where_clause += `  t1.appeal_status_id = -1 `
      }  else if (bind.table_type == 'complete') {
        sql_where_clause += `  (t1.appeal_status_id = -2 or t1.appeal_status_id = -3 or t1.appeal_status_id = 7) `
      }

    }

    if (bind.search_string) {
      if(sql_where_clause == ``) {
        sql_where_clause += ` where `
      }else {
        sql_where_clause += ` and `
      }
      sql_where_clause += ` (upper(t1.title) like upper('%${bind.search_string}%') 
      or upper(t3.name_${bind.lang}) like upper('%${bind.search_string}%') 
      or upper(t4.name_${bind.lang}) like upper('%${bind.search_string}%') 
      or upper(t2.name_${bind.lang}) like upper('%${bind.search_string}%')
      or upper(t5.department_name) like upper('%${bind.search_string}%')
      or upper(t5.organization_name) like upper('%${bind.search_string}%')
      ) `
      if(parseInt(bind.search_string)) {
        sql_where_clause += ` or t1.id = ${parseInt(bind.search_string)} `
      }

    }

    select1 += sql_where_clause


    select1 += ` order by (select min(create_date) from hr.appeal_status_history where appeal_status_id = 2 and appeal_id = t1.id) asc `

    if(bind.page && bind.itemsperpage && bind.itemsperpage!=-1) {
      select1 += ` limit ${bind.itemsperpage} offset ${(bind.page-1)*bind.itemsperpage}`
    }



    let { rows: appeals } = await client.query(select1);


    for await (let el of appeals) {
      if(el.experts.length!=0) {
        let temp:any = []
        let voted:any = []
        let unvoted:any = []
        for await(let el2 of el.experts) {
          let expertQuery = `select t2.appeal_expert_type_id, t3.name_rus as expert_type_name, concat( t1.last_name,' ', t1.first_name) as name, t1.department_name  
          from hr.employee_v t1 join hr.appeal_expert t2 on t1.id = t2.user_id join ref.appeal_expert_type t3 on t3.id = t2.appeal_expert_type_id
          where t1.id = ${el2} and t2.appeal_id = ${el.id}`
          let {rows: { [0]: expert }} = await client.query(expertQuery);
          temp.push(`${expert.expert_type_name} ${expert.name} (${expert.department_name})`)

          if(expert.appeal_expert_type_id!=2) { 
            let isVotedQuery = `select exists ( select * from hr.appeal_votes where is_active= true and user_id = ${el2} and appeal_id = ${el.id})`

                     let {rows: { [0]: {exists: is_voted} }} = await client.query(isVotedQuery);

                      if(is_voted) {
              voted.push(`${expert.name} (${expert.department_name})`)
            } else if (!is_voted) {
              unvoted.push(`${expert.name} (${expert.department_name})`)
            }
          }

        }

        el.experts = temp.join('; \n')
        el['voted'] = voted.join('; \n')
        el['unvoted'] = unvoted.join('; \n')
      }



      if( el.performers && el.performers.length!=0) {
        let temp:any = []
        for await(let el2 of el.performers) {
          let performerQuery = `select concat( t1.last_name,' ', t1.first_name) as name, t1.department_name  
          from hr.employee_v t1 
          where t1.id = ${el2} `

                   let {rows: { [0]: performer }} = await client.query(performerQuery);

                   temp.push(`${performer.name} (${performer.department_name})`)
        }
        el.performers = temp.join('; \n')
      }
    }

    return appeals;
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (client) {
      await client.end();
    }
  }
}