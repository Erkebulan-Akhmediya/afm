import log from '../../config/logger';
import get_client from '../../loaders/database';
import {Employee_Contact} from '../../interface/interface'
import { Client } from 'pg';


export async function employee_contact_get_db(bind: any): Promise<Employee_Contact[]>{
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        let {rows: contacts} = await client.query(`
        select
            eci.id, 
            cit.id as contact_info_type_id,
            cit.name_${bind.lang} as contact_info_type_name,
            eci.name_${bind.lang} as contact
        from
            hr.employee_contact_info eci,
            ref.contact_info_type cit
        where
            eci.contact_info_type_id = cit.id 
            and eci.is_active is not false
            and eci.employee_id = ${bind.employee_id}
        `).catch(e => {throw `Ошибка employee_contact db => ${e}`})
        return contacts;
    } catch (err) {
        log.error(err);
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function employee_contact_put_db(client: Client, bind: any): Promise<any> {
    try {
        let values = [bind.id, bind.is_active, bind.username]
        let query = ''
        if(bind.contact) {
            query = `name_rus = $4, name_kaz = $5, `
            values.push(bind.contact)
            values.push(bind.contact)
        }
        await client.query({
            text: `
            update hr.employee_contact_info set is_active = $2, update_user = $3,${query} update_date = current_timestamp where id = $1`,
            values: values
        }).catch((e: any) => {throw `Ошибка employee_contact put db => ${e}`});
    } catch (err) {
        log.error(err);
        throw err;
    }
}


export async function employee_contact_post_db(client: Client, bind: any): Promise<any> {
    try {
        await client.query({
            text: `
                insert into hr.employee_contact_info 
                    (employee_id, contact_info_type_id, name_rus, name_kaz, external_id, create_user, update_user) 
                values 
                    ($1, $2, $3, $4, $5, $6, $7)`,
            values: [
                bind.employee_id, 
                bind.contact_info_type_id,
                bind.contact,
                bind.contact,
                (Date.now()).toString(36),
                bind.create_user, 
                bind.update_user
            ]
        }).catch((e: any) => {throw `Ошибка employee_contact post db => ${e}`});
    } catch (err) {
        log.error(err);
        throw err;
    }
}