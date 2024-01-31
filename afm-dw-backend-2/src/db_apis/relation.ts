import log from '../config/logger';
import get_client from '../loaders/database';

export async function relation_types_get_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();



                let select: string = `
        select * from ref.employee_relation_type
        `;

        let {rows: relation} = await client.query(select);
        return relation;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function relation_get_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();




                let select: string = `
        select * from hr.employee_relation where employee_id = ${bind.employee_id} and is_deleted = false
        `;
        let {rows: relation_types} = await client.query(select);
        return relation_types;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function relation_create_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();



                let select: string = `
        insert into hr.employee_relation (employee_relation_type_id, last_name, first_name, middle_name, work_place, position, is_worked_law, is_active_work_law, law_agency, law_position, create_user_id, update_user_id, employee_id)
            values (
                ${bind.relation_type_id},
                '${bind.last_name}',
                '${bind.first_name}',
                '${bind.middle_name}',
                '${bind.work_place}',
                '${bind.position}',
                ${bind.is_worked_law},
                ${bind.is_active_work_law},
                '${bind.law_agency}',
                '${bind.law_position}',
                ${bind.user_id},
                ${bind.user_id},
                ${bind.employee_id}
            ) returning id
        `;
                let {rows: {[0]: {id: relation}}} = await client.query(select);
        return relation;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function relation_del_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();




        let select: string = `
        update hr.employee_relation set is_deleted = true where id = ${bind.relation_id}
        `;

        let {rows: {[0]: {id: relation}}} = await client.query(select);
        return relation;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function relation_edit_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();




                let select: string = `
        update hr.employee_relation set employee_relation_type_id = ${bind.relation_type_id}, last_name = '${bind.last_name}', first_name ='${bind.first_name}', middle_name ='${bind.middle_name}', work_place ='${bind.work_place}', position ='${bind.position}', is_worked_law =${bind.is_worked_law}, is_active_work_law =${bind.is_active_work_law}, law_agency ='${bind.law_agency}', law_position ='${bind.law_position}',  update_user_id =${bind.user_id} where id = ${bind.relation_id} returning id
        `;
        let {rows: {[0]: {id: relation}}} = await client.query(select);
        return relation;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}