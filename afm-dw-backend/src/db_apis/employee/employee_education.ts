import log from '../../config/logger';
import get_client from '../../loaders/database';
import {EmployeeEducationBind,Employee_Education} from '../../interface/interface'


export async function employee_education_get_db(bind: EmployeeEducationBind): Promise<Employee_Education[]> {
    let client;
    try {
        client = get_client(); await client.connect();
        let {rows: educations} = await client.query(`
        select 
        ed.id,
            et.name_${bind.lang} as education_type_name,
            ef.name_${bind.lang} as education_form_name,
            ep.name_${bind.lang} as education_profile_name,
            edc.name_${bind.lang} as education_document_name,
            eq.name_${bind.lang} as education_qualification_name,
            es.name_${bind.lang} as education_speciality_name,
            ei.name_${bind.lang} as education_institution_name,
            ed.enrollment_date as employee_education_enrollment_date,
            ed.graduation_date as employee_education_graduation_date,
            ed.education_document_number as employee_education_number,
            ed.education_document_date as employee_education_document_date
        from
            hr.employee_education ed
        left join ref.education_type et on ed.education_type_id = et.id 
        left join ref.education_form ef on ed.education_form_id = ef.id
        left join ref.education_profile ep on ed.education_profile_id = ep.id
        left join ref.education_document edc on ed.education_document_id = edc.id
        left join ref.education_qualification eq on ed.education_qualification_id = eq.id
        left join ref.education_speciality es on ed.education_speciality_id = es.id
        left join ref.education_institution ei on ed.education_institution_id = ei.id
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