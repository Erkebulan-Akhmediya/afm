import { Client } from 'pg';
import get_client from '../loaders/database';
import log from '../config/logger';

export interface Comment {
    id: number,
    event_id: number,
    parent_id?: number,
    discussion: string,
    is_active: boolean,
    create_date: Date,
    create_user: string,
    update_date: Date,
    update_user: string,
    image_id: number,
    answers: any[],
    first_name: string,
    last_name: string
}

export async function comment_get (bind: any): Promise<Comment[]> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()
        let where: string = ""

        if (bind.id) {
            where = `d.id = ${bind.id}`
        }
        if (bind.object_id) {
            where = `d.object_id = ${bind.object_id}  and d.parent_id is null`
        }
        if (bind.parent_id) {
            where = `d.parent_id = ${bind.parent_id}`
        }

        let query = ` select 
            d.id as id,
            d.parent_id as parent_id,
            d.discussion as discussion,
            d.is_deleted,
            d.is_private,
            d.create_date as create_date,
            d.create_user_id as create_user,
            d.update_date as update_date,
            d.update_user_id as update_user,
            d.object_id,
            d.object_name,
            off.object_id as image_id,
            off2.file_id as file_id,
            off2.file_name as file_name,
            empl.first_name_rus as first_name,
            empl.last_name_rus as last_name
        from 
            hr.discussion d
        left join hr.user u on u.id = d.create_user_id
        left join hr.employee empl on empl.id = u.id
        left join (select
                f.id as file_id,
                of.object_id
            from hr.object_file of join hr.file f
                on of.file_id = f.id
            where f.is_active = true
                and of.object_type_id = 1
            ) off
            on off.object_id = u.id
        left join (select
                f.id as file_id,
                f.name as file_name,
                of.object_id
            from hr.object_file of join hr.file f
                on of.file_id = f.id
            where f.is_active = true
                and of.object_type_id = 13
            ) off2
            on off2.object_id = d.id
        where 
            ${where} and d.is_deleted = false and is_private = ${bind.is_private?bind.is_private:false} and d.object_name = '${bind.object_name}'
        order by create_date desc
        limit ${bind.limit? bind.limit:10} offset ${bind.offset?bind.offset:0}
            `
        const {rows: comments}: any = await client.query(query)
        return comments

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function comment_create (bind: any): Promise<number> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()

        let query = `insert into hr.discussion 
                (object_id, object_name, create_user_id, update_user_id, discussion, parent_id, is_private) 
            values 
                (${bind.object_id}, 
                '${bind.object_name}',
                ${bind.user_id}, 
                ${bind.user_id}, 
                '${bind.discussion}',
                ${bind.parent_id?bind.parent_id:null},
                ${bind.is_private})
            returning id
            `
        let {rows: {[0]: {id: discussion_id}}} = await client.query(query)

        return discussion_id

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function comment_put (bind: any): Promise<void> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect()
        let sqlSet: string = "";

        let bindArr = Object.entries(bind).filter(([key, value]) => ['discussion', 'is_deleted'].includes(key));
        bindArr.map(([key, value], index) => {
            sqlSet += ` ${key} = ${typeof value == 'string' ? `'${value}'` : `${value}`} ,`;
        })

                if(bind.is_deleted !== null) {
            let query = `
                update hr.discussion
                set 
                is_deleted = ${bind.is_deleted},
                    update_date = current_timestamp,
                    update_user_id = '${bind.user_id}'
                where parent_id = ${bind.id}
            `
            await client.query(query);
        }

        sqlSet = `update hr.discussion 
            set 
                ${sqlSet}
                update_date = current_timestamp,
                update_user_id = '${bind.user_id}'
            where id = ${bind.id} 
            `
        await client.query(sqlSet);

        return
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}