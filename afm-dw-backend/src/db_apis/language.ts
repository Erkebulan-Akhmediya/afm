import log from '../config/logger';
import get_client from '../loaders/database';
import {LanguageBind, Language} from '../interface/interface'
import { Client } from 'pg';

export async function language_get_db(bind: LanguageBind): Promise<Language[] | Language> {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let language: Language | Language[];

        if (bind.lang_code) {
            ({rows: {[0]: language}} = await client.query(`select * from ref.language where code ilike '${bind.lang_code}'`).catch(e => { throw `Ошибка language db => ${e}`}))
        } else if (bind.default) {
            ({rows: {[0]: language}} = await client.query(`select * from ref.language where is_default is not null`).catch(e => { throw `Ошибка language db => ${e}`}))
        } else {
            ({rows: language} = await client.query(`select * from ref.language`).catch(e => { throw `Ошибка language db => ${e}`}))
        }
        return language;
    } catch (err) {
        log.error(`Error in language_get_db -> ${JSON.stringify(err)}`)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}