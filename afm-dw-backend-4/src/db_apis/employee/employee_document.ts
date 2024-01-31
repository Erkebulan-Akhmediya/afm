import log from '../../config/logger';
import get_client from '../../loaders/database';
import {EmployeeDocument,Employee_Document} from '../../interface/interface'

export async function employee_document_get_db(bind: EmployeeDocument): Promise<Employee_Document[]> {
    let client;
    try {
        client = get_client(); await client.connect();
        let {rows: documents} = await client.query(`
        select 
            edt.id as document_type_id,
            edt.name_${bind.lang} as document_type_name,
            ed.number as document_number,
            ed.serial as document_serial,
            ed.issue_date as document_issue_date,
            ed.valid_date as document_valid_date,
            ed.issued_by as document_issued_by
        from
            hr.employee_document ed,
            ref.employee_document_type edt
        where
            ed.employee_document_type_id = edt.id
            and edt.is_active is not null
            and ed.employee_id = ${bind.employee_id}
        `).catch(e => {throw `Ошибка employee_document db => ${e}`})
        return documents;
    } catch (err) {
        log.error(err);
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}