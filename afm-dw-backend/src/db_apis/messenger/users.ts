import log from '../../config/logger';
import get_client from '../../loaders/database';


export async function employee_get_name(bind: any) {
    let client
    try {
        client = get_client(); await client.connect();
        let query = `select 
                        last_name_${bind.lang} as last_name,
                        first_name_${bind.lang} as first_name,
                        id
                    from hr.employee
                     
                    where hr.employee.id = ${bind.id}`
        let employee = await client.query(query).catch((e: any) => { throw `Ошибка employee_get_one => ${e}`})
        return employee.rows[0]
    } catch (err) {
        log.error(err);
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function get_messenger_users(bind:any) {
    let client
    try {
        client = get_client(); await client.connect();
        let query = `select 
                        e.last_name_${bind.lang} as last_name,
                        e.first_name_${bind.lang} as first_name,

                        e.id
                    from hr.employee e join hr.user u on e.id = u.id where e.is_fired = false and e.is_performer = false`
                    const {rows: employee}: any = await client.query(query).catch(e => { throw `Ошибка employee db => ${e}`});
        return employee
    } catch (err) {
        log.error(err);
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}