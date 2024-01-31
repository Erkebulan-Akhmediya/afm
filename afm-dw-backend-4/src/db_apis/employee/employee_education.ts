import log from '../../config/logger';
import get_client from '../../loaders/database';
import {EmployeeEducationBind,Employee_Education} from '../../interface/interface'


export async function employee_education_get_db(bind: EmployeeEducationBind): Promise<Employee_Education[]> {
    let client;
    try {
        client = get_client(); await client.connect();
        let {rows: educations} = await client.query(`
        select 
        *
        from
            hr.employee_education_new ed
        where ed.employee_id = ${bind.employee_id}
        `).catch(e => { throw `Ошибка employee_education db => ${e}`})
        return educations;
    } catch (err) {
        log.error(err);
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}