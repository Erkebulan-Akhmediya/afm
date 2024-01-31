import log from '../config/logger';
import get_client from '../loaders/database';
import {EntryBind, Entry} from '../interface/interface'
import { Client } from 'pg';


export async function entry_get_db(bind: EntryBind): Promise<Entry[]> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let {rows: entry} = await client.query(`
        select 
            e.id as entry_id,
            e.name as entry_name,
            e.description as entry_description,
            e.start_date as entry_start,
            e.place as place,
            e.is_all_day as is_all_day,
            e.end_date as entry_end,
            et.name as entry_type_name,
            es.name as entry_status_name,
            et.id as entry_type_id,
            es.id as entry_status_id,
            et.color_code as color,
            empl.last_name_${bind.lang} as last_name,
            empl.first_name_${bind.lang} as first_name,
            empl.middle_name_${bind.lang} as middle_name
        from
            hr.entry e,
            hr.participant p,
            ref.entry_type et,
            ref.entry_status es,
            hr.employee empl
        where
            p.employee_id = ${bind.user_id}
            and e.is_active is not null
            and empl.id = p.employee_id
            and p.entry_id = e.id 
            and e.entry_type_id = et.id
            and et.is_active is not null
            and e.entry_status_id = es.id
            and es.is_active is not null
            and es.id = 1
            and (date_part('month', e.start_date) = ${parseInt((bind.month as any), 10) - 1} or date_part('month', e.start_date) = ${parseInt((bind.month as any), 10)} or date_part('month', e.start_date) = ${parseInt((bind.month as any), 10) + 1}) 
            and date_part('year', e.start_date) = ${bind.year}
            ${bind.id ? `and e.id = ${bind.id}` : ''}
        `).catch((e: any) => { throw `Ошибка entry db => ${e}`})

                await Promise.all(
            entry.map(async (item: any) => {
                if(client)
                ({rows: item.participants} = await client.query(`
                select  e.id,
                        e.first_name_${bind.lang} as first_name, 
                        e.last_name_${bind.lang} as last_name,  
                        e.middle_name_${bind.lang} as middle_name, 
                        p.is_organizer 
                from    hr.participant p 
                join hr.employee e on e.id=p.employee_id 
                where p.is_active is not null and entry_id=$1`, [item.entry_id]))
            })
        )

        return entry;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function entry_put_db(bind: any): Promise<void> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let updateSqlSet: string = ``;

        if (bind.name) {
            updateSqlSet += `name = '${bind.name}', `;  
        }
        if (bind.description) {
            updateSqlSet += `description = '${bind.description}', `;  
        }
        if (bind.entry_type_id) {
            updateSqlSet += `entry_type_id = ${bind.entry_type_id}, `;  
        }
        if (bind.entry_status_id) {
            updateSqlSet += `entry_status_id = ${bind.entry_status_id}, `;  
        }
        if (bind.place) {
            updateSqlSet += `place = '${bind.place}', `;  
        }
        if(bind.is_all_day == undefined){
            updateSqlSet += `is_all_day = false, `; 
        } else {
            updateSqlSet += `is_all_day = ${bind.is_all_day}, `; 
        } 
        if (bind.start_date) {
            updateSqlSet += `start_date = '${bind.start_date}', `;  
        }
        if (bind.end_date) {
            updateSqlSet += `end_date = '${bind.end_date}', `;  
        }

        updateSqlSet += `is_active = ${bind.is_active}, `;  

        updateSqlSet = `update hr.entry set ${updateSqlSet.slice(0, -2)} where id = ${bind.id} `;  

        await client.query(updateSqlSet).catch((e: any) => { throw `Ошибка entry db => ${e}`})

    } catch (err) {
        log.error(err);
        throw err;
    } finally {
        if (client) {
            await client.end();
        }
    }
}
