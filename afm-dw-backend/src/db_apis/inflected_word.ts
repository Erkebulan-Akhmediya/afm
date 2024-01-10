import log from '../config/logger';
import get_client from '../loaders/database';
import { Client } from 'pg';

export async function inflected_word_get_db(bind: any): Promise<any>{
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let {rows: inflected_word} = await client.query({
            text: `
            select
                iw.declination_word
            from
                hr.inflected_word iw,
                ref.entity_type et,
                ref.declination d
            where
                iw.declination_id = d.id
                and iw.entity_type_id = et.id
                and iw.external_id = $1
                and et.id = $2
                and d.id = $3
            `,
            values: [bind.external_id, bind.entity_type_id, bind.declination_id]
        }).catch(e => {throw `Ошибка employee_contact db => ${e}`})
        return inflected_word.length ? inflected_word : false;
    } catch (err) {
        log.error(err);
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}



export async function entity_type_get_db(client: Client): Promise<any>{
    try {
        let {rows: result} = await client.query(`select id, table_name as name from ref.entity_type where is_active = true`)
        return result
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function declination_get_db(client: Client): Promise<any>{
    try {
        let {rows: result} = await client.query(`select id, prepositional as name from ref.declination where is_active = true`)
        return result
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function gender_get_db(client: Client, bind: any): Promise<any>{
    try {
        let {rows: result} = await client.query(`select id, name_${bind.lang_code} as name from ref.gender where is_active = true`)
        return result
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function language_get_db(client: Client): Promise<any>{
    try {
        let {rows: result} = await client.query(`select id, name as name from ref.language where is_active = true`)
        return result
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function inflected_word_table_get_db(client: Client, bind: any): Promise<any>{
    try {
        let {rows: {0: {table_name}}} = await client.query(`select table_name from ref.entity_type where id = $1`, 
        [bind.entity_type_id])

                let {rows: result} = await client.query(`
            select 
                t.id as original_word_id,
                i.id as inflected_word_id,
                t.name_${bind.lang_code} as name, 
                i.word, i.declination_word,
                d.prepositional as declination,
                d.id as declination_id,
                g.id as gender_id,
                g.name_${bind.lang_code} as gender_name,
                l.id as language_id,
                l.name as language_name

            from hr.inflected_word i 
            join ${table_name} t on i.external_id = t.id and i.entity_type_id = $1
            left join ref.declination d on d.id = i.declination_id and d.is_active = true
            left join ref.gender g on g.id = i.gender_id
            left join ref.language l on l.id = i.language_id 
            order by t.id asc`, [bind.entity_type_id])
        return result
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function entity_table_get_db(client: Client, bind: any): Promise<any>{
    try {
        let {rows: {0: {table_name}}} = await client.query(`select table_name from ref.entity_type where id = $1`, 
        [bind.entity_type_id])

                let {rows: result} = await client.query(`
            select 
                t.id as original_word_id,
                t.name_${bind.lang_code} as name
            from ${table_name} t 
            order by t.id asc`)
        return result
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function entity_table_get_uniq_db(client: Client, bind: any): Promise<any>{
    try {
        let query = `select * from hr.inflected_word 
                                where declination_id = $1 
                                and external_id = $2 
                                and entity_type_id = $3`

                let arrQuery = [
            bind.declination_id,
            bind.external_id,
            bind.entity_type_id
        ]

                if(bind.gender_id) {
            query += ` and gender_id = $4`
            arrQuery.push(bind.gender_id)
        } else {
            query += ` and gender_id is null`
        }

        if(bind.language_id) {
            query += ` and language_id = $4`
            arrQuery.push(bind.language_id)
        } else {
            query += ` and language_id is null`
        }
        let {rows: result} = await client.query(query, arrQuery)
        return result
    } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function inflected_word_put_db(client: Client, bind: any, id: string): Promise<any>{
    try {
        let updateSqlSet: any = Object.keys(bind).map(item => {
            if(['declination_id', 'external_id', 'entity_type_id', 'gender_id', 'language_id'].indexOf(item) != -1) {
                return `${item} = ${bind[item] || null}`
            }
            return `${item} = ${bind[item]  ? "'" + bind[item] + "'" : bind[item]}`
        })
        updateSqlSet = `update hr.inflected_word set ${updateSqlSet.join(', ')}, update_date = current_timestamp where id = ${id} `;  
        return await client.query(updateSqlSet).catch((e: any) => { throw `Ошибка inflected_word put db => ${e}`})

            } catch (err) {
        log.error(err);
        throw err;
    }
}

export async function inflected_word_post_db(client: Client, bind: any): Promise<any>{
    try {
        let updateSqlSet: any = Object.keys(bind)
        let bindArr = updateSqlSet.map((item: string) => {
            return bind[item] || null
        })

        let valuesStr = ''
        for(let i = 1; i<= bindArr.length; i++) {
            if(i != 1) {
                valuesStr += `, `
            }
            valuesStr += `$${i}`
        }

        updateSqlSet = `insert into hr.inflected_word (${updateSqlSet.join(', ')}, update_date) values(${valuesStr}, current_timestamp)`;
        return await client.query(updateSqlSet, bindArr).catch((e: any) => { throw `Ошибка inflected_word put db => ${e}`})

            } catch (err) {
        log.error(err);
        throw err;
    }
}
