import log from '../../config/logger';
import get_client from '../../loaders/database';

export async function candidate_department_get_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();

        let select: string = `
        select d.id, d.name_rus, d.name_kaz, d.external_id, d.geo_code, d.view_priority, d.organization_id, d2.id as child_id from hr.department d join hr.department  d2  on d.id = d2.parent_id where d.parent_id IS NULL and d2.is_edited_employee = true
        `;

        let {rows: departments} = await client.query(select);
        return departments;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function check_for_create_candidate_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();

        let select: string = `
        select count(*) as employee_history_count from hr.employee t1, hr.department t2 where t1.department_id = t2.id and t2.is_edited_employee = false
        and identification_number = '${bind.identification_number}'
        `;

        let {rows: employee_list_history} = await client.query(select);
        return employee_list_history;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function candidate_create(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        await client.query('BEGIN')        

        let query: string = `
        insert into hr.employee 
                (last_name_rus, last_name_kaz, first_name_rus, first_name_kaz, middle_name_rus, middle_name_kaz, identification_number, department_id) 
            values 
                ('${bind.last_name}', 
                '${bind.last_name}', 
                '${bind.first_name}', 
                '${bind.first_name}',
                '${bind.middle_name?bind.middle_name:null}',
                '${bind.middle_name?bind.middle_name:null}',
                '${bind.iin}',
                ${bind.department_id}
                )
        returning id
        `;
        let {rows: {[0]: {id: candidate_id}}} = await client.query(query)
        let emailQuery = `insert into hr.employee_contact_info
                                    (employee_id, contact_info_type_id, name_rus, name_kaz, external_id, create_user, update_user)
                                    values 
                                        (${candidate_id}, 
                                        5, 
                                        '${bind.email}', 
                                        '${bind.email}',
                                        -1,
                                        '${bind.user_name}',
                                        '${bind.user_name}'
                                        )`
            await client.query(emailQuery)

        let mobilePhoneQuery = `insert into hr.employee_contact_info
                                        (employee_id, contact_info_type_id, name_rus, name_kaz, external_id, create_user, update_user)
                                        values 
                                            (${candidate_id}, 
                                            4, 
                                            '${bind.mobilephone}', 
                                            '${bind.mobilephone}',
                                            -1,
                                            '${bind.user_name}',
                                            '${bind.user_name}'
                                            )`
            await client.query(mobilePhoneQuery)


                    let workPhoneQuery = `insert into hr.employee_contact_info
                                    (employee_id, contact_info_type_id, name_rus, name_kaz, external_id, create_user, update_user)
                                    values 
                                        (${candidate_id}, 
                                        3, 
                                        '${bind.workphone}', 
                                        '${bind.workphone}',
                                        -1,
                                        '${bind.user_name}',
                                       '${bind.user_name}'
                                        )`
            await client.query(workPhoneQuery)

        await client.query('COMMIT')

        return candidate_id;
    } catch (err) {
        if (client) {
            await client.query('ROLLBACK')
          }
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function candidate_edit(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();



                let select: string = `
        select id, name_rus, name_kaz, external_id, geo_code,view_priority, organization_id from hr.department where parent_id IS NULL
        `;

        let {rows: departments} = await client.query(select);
        return departments;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}



export async function candidate_dictionary_get_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();

        let dictionary:any = {gender: [], nationality:[], marital_status:[], religion: []}

        let select: string = `
        select id, name_rus, name_kaz from ref.gender where is_active = true order by id
        `;

        let {rows: gender} = await client.query(select); 
        let select2: string = `
        select id, name_rus, name_kaz from ref.marital_status where is_active = true order by id
        `;
        let {rows: marital_status} = await client.query(select2);

        let select3: string = `
        select id, name_rus, name_kaz from ref.nationality where is_active = true order by id
        `;

        let {rows: nationality} = await client.query(select3);

        let select4: string = `
        select id, name_rus, name_kaz from ref.religion order by id
        `;

        let {rows: religion} = await client.query(select4);


               dictionary.gender = gender
        dictionary.marital_status = marital_status
        dictionary.nationality = nationality
        dictionary.religion = religion

        return dictionary;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function documents_get_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();

        let select: string = `
        select f.name as file_name, f.create_date, f.create_user, f.file_type_id, f.id as file_id, o.id as object_file_id, o.object_id, e.first_name_rus, e.last_name_rus
        from hr.file f join hr.object_file o on f.id = o.file_id left join hr.employee e on e.id = f.create_user::int4 where f.file_type_id = 10 and o.object_id = ${bind.object_id} and f.is_active = true
        `;

        let {rows: documents} = await client.query(select); 
        return documents;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function delete_old_photo(bind: any) {
    let client;
    try {

                client = get_client(); await client.connect();

                await client.query('BEGIN')     

        let select: string = `delete from hr.object_file where object_id = ${bind.id} returning id`;
        let {rows: {0: {id: file_id}}} = await client.query(select);


               let select2: string =`update hr.file set is_active = false, is_object_deleted = true, update_user = '${bind.user_name}', update_date = current_timestamp where id = ${file_id}`;
         await client.query(select2); 
        await client.query('COMMIT')
        return file_id;
    } catch (err) {
        if (client) {
            await client.query('ROLLBACK')
          }
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}