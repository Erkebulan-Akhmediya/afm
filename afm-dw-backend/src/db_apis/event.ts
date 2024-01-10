import log from '../config/logger';
import get_client from '../loaders/database';
import {EventBind, Event} from '../interface/interface'
import { BindingElement } from 'soap/lib/wsdl/elements';
import { Client } from 'pg';

export async function add_view_event_db(id: number, client: Client) {
    let query: string = ''
    try {

        query = `
        update hr.event 
        set views_count = views_count + 1
        where id = ${id}
        `

        await client.query(query)

            } catch (err) {
        log.debug(query)
        log.error(err)
        throw err
    }
} 

export async function eventIdGetByGuid(client: Client, docGuid: string, employeeGuid: string): Promise<number | undefined> {
    let query: string = ''
    let params: string[] = []
    try {
        query = `
            select id from hr.event where external_id like $1
        `

        params = [ docGuid + '/' + employeeGuid ]

        let {rows} = await client.query(query, params)

        return rows[0]?.id
    } catch (err) {
        log.debug ('query: ' + query)
        log.debug('query data: ' +  params[0])
        log.error(err)
    }
}

export async function event_get_db(bind: any, client: Client): Promise<Event[]> {

    try {
        let customQuery;
        if (bind.is_start_page) {
            customQuery = ` and et.id = ${bind.event_type} `
        } else {
            if (bind.event_type == 4){
                customQuery = ` and e.is_global_news = true `
            } else {
                customQuery = ` and et.id = ${bind.event_type} and (e.is_global_news = false OR e.is_global_news is null) `
            }
        }

        let {rows: event} = await client.query(`
            select 
                e.id as event_id,
                e.event_type_id as event_type_id,
                e.title_${bind.lang} as event_title,
                e.body_${bind.lang} as event_body,
                e.display_order as event_display_order,
                e.event_date as event_date,
                e.views_count,
                (select count(1) from hr.discussion ed where ed.object_id = e.id and ed.object_name = 'EVENT' and ed.is_deleted = false) as discussion_count,
                e.publish_date as publish_date,
                e.image_link as image_link,
                et.name_${bind.lang} as event_type_name,
                es.name_${bind.lang} as event_status_name,
                ept.name_${bind.lang} as event_priority_type_name,
                empl.id as author_id,
                empl.last_name_${bind.lang} as last_name,
                empl.first_name_${bind.lang} as first_name,
                empl.middle_name_${bind.lang} as middle_name,
                (select f.name as file_name
                from hr.object_file of join hr.file f 
                    on of.file_id = f.id          
                where f.is_active = true 
                    and of.object_type_id = 2 and of.object_id = e.id order by f.id limit 1) as file_name,
                is_global_news
            from 
                hr.event e
            join ref.event_status es on e.event_status_id = es.id
            join ref.event_type et on e.event_type_id = et.id `+customQuery+`
            join ref.event_priority_type ept on e.event_priority_type_id = ept.id 
            left join hr.user u on u.username = e.create_user
            left join hr.employee empl on u.id = empl.id
            
            where
                e.event_type_id = et.id
                and e.event_status_id = 1
                and e.publish_date::TIMESTAMP < CURRENT_TIMESTAMP::TIMESTAMP
                ${parseInt((bind as any).id, 10) ? ` and e.id = ${bind.id}` : ''}
            order by e.publish_date desc, e.display_order desc limit ${bind.limit ? bind.limit : 4} offset ${bind.offset}`)

        let temp:any = []
        for await (let el of event) {
            let fileQuery = `select f.name, obj.file_id, obj.object_id, f.id from hr.file f join hr.object_file obj on f.id = obj.file_id      
            where obj.object_id = ${el.event_id} AND obj.object_type_id = 2 and f.is_active = true`

                        let {rows: files}: any = await client.query(fileQuery)

                        el['files']=files
            temp.push(el)
        }

        return event;
    } catch(err) {
        log.error(err)
        throw err;
    }
}


export async function event_post_db(bind: any, client: Client): Promise<number> {
    try {

        let {rows: {[0]: {id:event_id}}} = await client.query(`
        insert into hr.event
            (event_type_id, event_status_id, event_priority_type_id, title_rus, body_rus, title_kaz, body_kaz, display_order, event_date, publish_date, image_link, create_user, update_user, external_id, is_global_news)
        values 
            (${bind.event_type_id}, 
            ${bind.event_status_id},
            
            ${bind.event_priority_type_id}, 
            '${bind.title_rus}', 
            '${bind.body_rus}', 
            '${bind.title_kaz}', 
            '${bind.body_kaz}', 
            ${bind.display_order}, 
            '${bind.event_date}', 
            '${bind.publish_date}', 
            '${bind.image_link}', 
            '${bind.user_name}', 
            '${bind.user_name}',
            '${bind.docGuid + '/' + bind.employeeGuid}',
            '${bind.is_global_news}')
        returning id
        `)
        await client.query(`
        insert into hr.event_hist 
            (event_id, event_type_id, event_status_id, event_priority_type_id, title_rus, body_rus, title_kaz, body_kaz, event_date, publish_date, image_link, create_user, update_user, is_global_news)
        values
            (${event_id}, 
            ${bind.event_type_id}, 
            ${bind.event_status_id}, 
            ${bind.event_priority_type_id}, 
            '${bind.title_rus}', 
            '${bind.body_rus}', 
            '${bind.title_kaz}', 
            '${bind.body_kaz}', 
            '${bind.event_date}', 
            '${bind.publish_date}', 
            '${bind.image_link}', 
            '${bind.user_name}', 
            '${bind.user_name}',
            '${bind.is_global_news}')
        `)
        return event_id;
    } catch (err) {
        log.error(err)
        throw err;
    } 
}

export async function event_put_db (bind: any, client: Client): Promise<void> {
    try {
        let sqlSet: string = "";
        let insertColumn: string = "";
        let insertValues: string = "";

        let bindArr = Object.entries(bind).filter(([key, value]) => !['user_id', 'user_name', 'iat', 'id', 'lang', 'lang_id', 'role_id', 'file', 'file_type_id', 'file_name', 'filetype', 'role', 'docGuid', 'employeeGuid'].includes(key));
        bindArr.map(([key, value], index) => {
            sqlSet += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`} ,`;
            insertColumn += key != "display_order" ? `${key},` : '';
            insertValues += key != "display_order" ? `${typeof value == 'string' ? `'${value}'` : `${value}`} ,` : '';
        })

        sqlSet = `update hr.event set ${sqlSet} update_user = '${bind.user_name}', update_date = current_timestamp where id = ${bind.id} `;
        await client.query(sqlSet);

        await client.query(`insert into hr.event_hist (event_id, ${insertColumn} create_user, update_user) values (${bind.id}, ${insertValues} '${bind.user_name}', '${bind.user_name}')`);

        return;
    } catch(err) {
        log.error(err)
        throw err;
    }
}

export async function event_files_get_db (bind: any, client: any): Promise<void> {
    try {
        let fileQuery = `select f.name, obj.file_id, obj.object_id, f.id from hr.file f join hr.object_file obj on f.id = obj.file_id      
        where obj.object_id = ${bind.id} AND obj.object_type_id = 2 and f.is_active = true`

                let {rows: files}: any = await client.query(fileQuery)

        return files
    } catch(err) {
        console.log(err)
        throw err;
    }
}