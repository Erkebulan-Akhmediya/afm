import log from '../config/logger';
import get_client from '../loaders/database';
import { Client } from 'pg';


export async function file_get_db(req: any) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        if (req.query.id) {

            let {rows: {[0]: fileData}} = await client.query({
                text: `
                    select 
                        f.id,
                        f.name,
                        ot.bucket_name
                    from 
                        hr.file f
                    join hr.object_file obf on obf.file_id = f.id
                    join ref.object_type ot on ot.id = obf.object_type_id
                    where
                        f.id = $1
                        and f.is_active = true`, 
            values: [req.query.id]}).catch(e => { console.log('error tut'); throw `Ошибка event db => ${e}`})


            return fileData || '';
        }

        let {rows: fileData} = await client.query({
            text: `
                select 
                    f.id,
                    f.name,
                    ot.bucket_name
                from 
                    hr.file f
                join hr.object_file obf on obf.file_id = f.id
                join ref.object_type ot on ot.id = obf.object_type_id
                where
                    obf.object_id = $1
                    and ot.id = $2
                    and f.is_active = true`, 
        values: [req.query.object, req.query.objectType]}).catch(e => { console.log('error tut2'); throw `Ошибка event db => ${e}`})

        return fileData[0] || '';
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function file_post_db(req: any, client: Client) {
    try {
        let queryText, queryArray
        if (req.userinfo) {
            queryText = 'INSERT INTO hr.file(name, file_type_id, create_user) VALUES($1, $2, $3) RETURNING id'
            queryArray = [req.file.originalname, req.body.file_type_id, req.userinfo.user_id]
        } else {
            queryText = 'INSERT INTO hr.file(name, file_type_id) VALUES($1, $2) RETURNING id'
            queryArray = [req.file.originalname, req.body.file_type_id]
        }

        const {rows: {0: fileId}} = await client.query(queryText, queryArray)
        const queryObjectFile = 'INSERT INTO hr.object_file(file_id, object_id, object_type_id) VALUES($1, $2, $3) RETURNING id'
        const {rows: {0: objectFile}} = await client.query(queryObjectFile, [fileId.id, req.body.object_id, req.body.file_type_id])
        const fileData = {
            id: fileId.id,
        }
        return fileData;
    } catch (err) {
        log.error(err)
        throw err;
    }
}



export async function file_post_db_new(bind: any) {
    let client
    try {
        client = get_client(); await client.connect();
        let queryText, queryArray

        queryText = 'INSERT INTO hr.file(name, file_type_id) VALUES($1, $2) RETURNING id'
        queryArray = [bind.file.originalname, bind.file_type_id]
        

        const {rows: {0: fileId}} = await client.query(queryText, queryArray)
        const queryObjectFile = 'INSERT INTO hr.object_file(file_id, object_id, object_type_id) VALUES($1, $2, $3) RETURNING id'
        const {rows: {0: objectFile}} = await client.query(queryObjectFile, [fileId.id, 6, bind.file_type_id])
        const fileData = {
            id: fileId.id,
        }
        return fileData;
    } catch (err) {
        log.error(err)
        throw err;
    }
}







export async function message_file_post_db(req: any, client: Client, mess_id: any) {
    try {
        const queryText = 'INSERT INTO hr.file(name, file_type_id, create_user) VALUES($1, $2, $3) RETURNING id'
        const {rows: {0: fileId}} = await client.query(queryText, [req.file.originalname, req.body.file_type_id, req.body.user_id])

                const queryObjectFile = 'INSERT INTO hr.object_file(file_id, object_id, object_type_id) VALUES($1, $2, $3) RETURNING id'
        const {rows: {0: objectFile}} = await client.query(queryObjectFile, [fileId.id, mess_id, req.body.file_type_id])

                const fileData = {
            id: fileId.id,
        }
        return fileData;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function pass_request_file_post_db(req: any, client: Client, pr_id: any) {
    try {
        const queryText = 'INSERT INTO hr.file(name, file_type_id, create_user) VALUES($1, $2, $3) RETURNING id'
        const {rows: {0: fileId}} = await client.query(queryText, [req.file.originalname, req.body.file_type_id, req.body.user_id])

                const queryObjectFile = 'INSERT INTO hr.object_file(file_id, object_id, object_type_id) VALUES($1, $2, $3) RETURNING id'
        const {rows: {0: objectFile}} = await client.query(queryObjectFile, [fileId.id, pr_id, req.body.file_type_id])
        const fileData = {
            id: fileId.id,
        }
        return fileData;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function disable_file_db (bind: any, client: Client) {
    try {
        let query = `update hr.file set is_active = false, update_user = '${bind.user_name}', update_date = current_timestamp where id = ${bind.id}`
        await client.query(query)
        return 
    } catch(err) {
        log.error(err)
        throw err;
    }
}

export async function file_put_db (req: any, client: Client) {
    try {
        let {rows: id} = await client.query(`Select * from hr.file f join hr.object_file of on of.file_id = f.id where of.object_type_id = $1 and object_id = $2 and f.is_active = true`, [req.body.file_type_id, req.body.object_id])

        if(id.length) {
            await Promise.all(id.map(async (item: any) => {
                await client.query(`update hr.file set is_active = false, update_user = $2, update_date = current_timestamp where id = $1`, [item.file_id, req.body.bind.user_name])
            }))
        }

                const queryText = 'INSERT INTO hr.file(name, file_type_id, create_user, update_user) VALUES($1, $2, $3, $3) RETURNING id'
        const {rows: {0: fileId}} = await client.query(queryText, [req.file.originalname, req.body.file_type_id, req.body.bind.user_name])

                const queryObjectFile = 'INSERT INTO hr.object_file(file_id, object_id, object_type_id) VALUES($1, $2, $3) RETURNING id'
        const {rows: {0: objectFile}} = await client.query(queryObjectFile, [fileId.id, req.body.object_id, req.body.file_type_id])

        return fileId.id
    } catch(err) {
        throw err;
    }
}

export async function file_del_db (req: any, client: Client) {
    try {
        let {rows: id} = await client.query(`Select * from hr.file f join hr.object_file of on of.file_id = f.id where of.object_type_id = $1 and object_id = $2 and f.is_active = true`, [req.body.file_type_id, req.body.object_id])

        if(id.length) {
            await Promise.all(id.map(async (item: any) => {
                await client.query(`update hr.file set is_active = false, update_user = $2, update_date = current_timestamp where id = $1`, [item.file_id, req.body.bind.user_name])
            }))
        }
        return
    } catch(err) {
        throw err;
    }
}


export async function file_name_get_db(bind: any) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

                let query = `select f.name from hr.file f
            join hr.object_file obf on obf.file_id = f.id
                where
                    obf.object_id = ${bind.obj_id}
                    and obf.object_type_id = ${bind.obj_type}
                    and f.is_active = true`
                let {rows: {[0]: file}}: any = await client.query(query)
        return file
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function get_file_list (bind: any) {
    let client: Client | null = null;
    let query: string = ''
    try {
        client = get_client(); await client.connect()

        query = `
        select f.id,
            f.name,
            concat(emp.last_name_rus ,' ', emp.first_name_rus, ' ', emp.middle_name_rus) 
            as create_user,
            f.create_date
        from hr.file f
            join hr.object_file obf on obf.file_id = f.id
            join ref.object_type ot on obf.object_type_id = ot.id
            join hr.user usr on usr.username = f.create_user
            join hr.employee emp on emp.id = usr.id
        where obf.object_id = ${bind.object_id}
        and ot.id = ${bind.object_type_id}
        and f.is_active = true
        `
        const {rows: return_data}: any = await client.query(query)
        return return_data

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function event_files_disable_db (req: any, client: any) {
    try {
        let {rows: id} = await client.query(`Select * from hr.file f join hr.object_file of on of.file_id = f.id where of.object_type_id = $1 and object_id = $2 and f.is_active = true`, [req.body.file_type_id, req.body.object_id])

        if(id.length) {
            await Promise.all(id.map(async (item: any) => {
                await client.query(`update hr.file set is_active = false, update_user = $2, update_date = current_timestamp where id = $1`, [item.file_id, req.body.bind.user_name])
            }))
        }



                       return 
    } catch(err) {
        throw err;
    }
}

export async function get_file_id_db(){
    let query = `SELECT nextval('hr.chat_message_id_seq') as id`
    let client = get_client(); await client.connect()
    let {rows: {0: id}} = await client.query(query)
    return id;
}
