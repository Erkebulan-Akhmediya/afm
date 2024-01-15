import { Client } from 'pg';
import log from '../config/logger';

export async function test_get_db(bind: any, client: Client) {
    try {
        let sql_where_clause = ''
        let queryBind : any = []

                if(bind.id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} t.id = $${queryBind.push(bind.id)}`
        }
        if(bind.name) {
            if(!bind.search_type || bind.search_type == 1) {
                sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} t.name_${bind.lang} ilike '%${bind.name}%' `
            } 
        }

                sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} t.status_id in (1 ${bind.is_admin_table || bind.is_admin ? ', 2' : ''} ${bind.is_deleted ? ', 3' : ''}) and t.status_id = ts.id`

                let select = `t.*`;

        if(!bind.is_admin) {
            select = `
                t.id,
                t.name_${bind.lang} as name,
                t.description_${bind.lang} as description,
                t.date_from,
                t.date_to,
                t.duration,
                t.create_user, 
                t.update_user,
                t.create_date,
                t.update_date,
                t.status_id,
                ts.name_${bind.lang} as status_name
            `
        }

        let query = `
            select 
                ${select}
            from 
                hr.test t,
                ref.test_status ts
            ${sql_where_clause} 
            order by t.id desc
        `;
        let {rows: request}: any = await client.query(query, queryBind)

                return request;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_question_get_db(bind: any, client: Client) {
    try {
        let sql_where_clause = ''
        let sql_from_clause = ''
        let queryBind = []

                if(bind.id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} q.id = $${queryBind.push(bind.id)}`
        }

                if(bind.test_id) {
            sql_from_clause += ', hr.test_question_rel tq'
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} tq.test_id = $${queryBind.push(bind.test_id)} and tq.test_question_id = q.id and tq.is_active = true`
        }

        if(bind.name) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} q.name_${bind.lang} ilike '%${bind.name}%' `
        }

                sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} q.is_active = true`
        let query = `select q.* from hr.test_question q ${sql_where_clause}`

                if(!bind.is_admin) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} q.test_question_type_id = t.id`
            query = `
                select 
                    q.id,
                    q.name_${bind.lang} as name,
                    q.description_${bind.lang} as description,
                    q.create_user, 
                    q.update_user,
                    q.create_date,
                    q.update_date, 
                    t.name_${bind.lang} as test_question_type_name,
                    t.id as test_question_type_id
                from 
                    hr.test_question q,
                    ref.test_question_type t
                    ${sql_from_clause}
                    ${sql_where_clause}`
        }
        let {rows: questions}: any = await client.query(query, queryBind)
        return questions;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_answer_get_db(bind: any, client: Client) {
    try {
        let sql_where_clause = ''
        let queryBind = []
        if(bind.id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} id = $${queryBind.push(bind.id)}`
        }
        if(bind.testquestionid) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} test_question_id = $${queryBind.push(bind.testquestionid)}`
        }
        if(bind.is_correct) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} is_correct = $${queryBind.push(bind.is_correct)}`
        }
        let query = `
        select 
            *
        from 
            hr.test_answer
        ${sql_where_clause}`

        if(!bind.is_admin) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} is_active = true`
            query = `
                select 
                    id,
                    name_${bind.lang} as name,
                    test_question_id,
                    is_correct,
                    create_user, 
                    update_user,
                    create_date,
                    update_date
                from 
                    hr.test_answer q
                    ${sql_where_clause}`
        }
        let {rows: answers}: any = await client.query(query, queryBind)
        return answers;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_post_db(bind: any, client: Client) {
    try {
        const queryBind = [
            bind.name_rus,
            bind.name_kaz,
            bind.description_rus,
            bind.description_kaz,
            bind.date_from,
            bind.date_to,
            bind.duration,
            bind.user_name,
            bind.user_name,
        ]
        let query = `insert into hr.test (name_rus, name_kaz, description_rus, description_kaz, date_from, date_to, duration, status_id, create_date, update_date, create_user, update_user) 
        values ($1, $2, $3, $4, to_timestamp($5, 'YYYY-MM-DD HH24:min:ss'), to_timestamp($6, 'YYYY-MM-DD HH24:min:ss'), $7, 1, current_timestamp, current_timestamp, $8, $9) returning id`

        let {rows: {0: id}}: any = await client.query(query, queryBind)
        return id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_question_rel_post_db(bind: any, client: Client) {
    try {
        const {rows: checkTestQuestion} = await client.query(`select * from hr.test_question_rel where test_id = ${bind.test_id} and test_question_id = ${bind.test_question_id} and is_active = true`)
        if(checkTestQuestion.length) {
            throw 'Этот вопрос уже есть в тесте'
        }
        const queryBind = [
            bind.test_id,
            bind.test_question_id,
            bind.user_name,
            bind.user_name,
        ]
        let query = `insert into hr.test_question_rel (test_id, test_question_id, is_active, create_date, update_date, create_user, update_user) 
        values ($1, $2, true, current_timestamp, current_timestamp, $3, $4) returning id`

        let {rows: {0: id}}: any = await client.query(query, queryBind)
        return id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_answer_post_db(bind: any, client: Client) {
    try {        
        const activeTest = await checkActiveTest(client, {question_id: bind.test_question_id})
        if(activeTest.length) {
            let tests = activeTest.map((item: any) => {
                return item.id
            })
            throw `Вопрос №${bind.test_question_id} используется в активных тестах: ${tests.join(', ')}`
        }
        const queryBind = [
            bind.name_rus,
            bind.name_kaz,
            bind.test_question_id,
            bind.is_correct,
            bind.user_name,
            bind.user_name,
        ]
        const query = `
       insert into hr.test_answer (name_rus, name_kaz, test_question_id, is_correct, is_active, create_date, update_date, create_user, update_user)
       values($1, $2, $3, $4, true, current_timestamp, current_timestamp, $5, $6) returning id`

       const {rows: id}: any = await client.query(query, queryBind)
        return id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_put_db(bind: any, client: Client) {
    try {        
        let queryBind = [bind.user_name];
        let query = `update hr.test set update_date = current_timestamp, update_user = $1`;

        if (bind.name_rus) {
            query += `, name_rus = $${queryBind.push(bind.name_rus)}`;
        }
        if (bind.name_kaz) {
            query += `, name_kaz = $${queryBind.push(bind.name_kaz)}`;
        }
        if (bind.description_rus) {
            query += `, description_rus = $${queryBind.push(bind.description_rus)}`;
        }
        if (bind.description_kaz) {
            query += `, description_kaz = $${queryBind.push(bind.description_kaz)}`;
        }
        if (bind.date_from) {
            query += `, date_from = $${queryBind.push(bind.date_from)}`;
        }
        if (bind.date_to) {
            query += `, date_to = $${queryBind.push(bind.date_to)}`;
        }
        if (bind.duration) {
            query += `, duration = $${queryBind.push(bind.duration)}`;
        }
        if (bind.status) {
            query += `, status_id = $${queryBind.push(bind.status)}`;
        }



                        if (bind.id) {
            query += ` where id = $${queryBind.push(bind.id)}`;
        }
       const {rows: id}: any = await client.query(query, queryBind)
        return id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_question_rel_get_db(bind: any, client: Client) {
    try {        
        let queryBind: any = [];
        let sql_where_clause = 'where is_active = true'
        let query = `select * from hr.test_question_rel `;

                if(bind.test_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} test_id = $${queryBind.push(bind.test_id)}`
        }
        if(bind.test_question_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} test_question_id = $${queryBind.push(bind.test_question_id)}`
        }

        const {rows: id}: any = await client.query(query + sql_where_clause, queryBind)
        return id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_question_rel_put_db(bind: any, client: Client) {
    try {        
        let queryBind = [bind.user_name];
        let sql_where_clause = ''
        let query = `update hr.test_question_rel set update_date = current_timestamp, update_user = $1`;

        if (bind.is_active || bind.is_active === false) {
            query += `, is_active = $${queryBind.push(bind.is_active)}`;
        }

                if (bind.test_question_id && bind.test_id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : ' where'} test_question_id = $${queryBind.push(bind.test_question_id)}`;
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : ' where'} test_id = $${queryBind.push(bind.test_id)}`;
        }
        const {rows: id}: any = await client.query(query + sql_where_clause, queryBind)
        return id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function test_answer_put_db(bind: any, client: Client) {
    try {                
        const activeTest = await checkActiveTest(client, {question_id: bind.question_id})
        if(activeTest.length) {
            let tests = activeTest.map((item: any) => {
                return item.id
            })
            throw `Вопрос №${bind.question_id} используется в активных тестах: ${tests.join(', ')}`
        }
        let queryBind = [bind.user_name];
        let sql_where_clause = ''
        let query = `update hr.test_answer set update_date = current_timestamp, update_user = $1`;

        if (bind.is_active || bind.is_active === false) {
            query += `, is_active = $${queryBind.push(bind.is_active)}`;
        }

                if (bind.is_correct || bind.is_correct === false) {
            query += `, is_correct = $${queryBind.push(bind.is_correct)}`;
        }

        if (bind.name_rus) {
            query += `, name_rus = $${queryBind.push(bind.name_rus)}`;
        }

        if (bind.name_kaz) {
            query += `, name_kaz = $${queryBind.push(bind.name_kaz)}`;
        }

                if (bind.id) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : ' where'} id = $${queryBind.push(bind.id)}`;
        }
        const {rows: id}: any = await client.query(query + sql_where_clause, queryBind)
        return id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function getTestSessionDB(client: Client, bind: any) {
    console.log(bind)
    try {
        let sql_where_clause = ''
        let queryBind = []
        if(bind.testId) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} test_id = $${queryBind.push(bind.testId)}`
        }
        if(bind.employeeId) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} employee_id = $${queryBind.push(bind.employeeId)}`
        }
        if(bind.employee_name) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} (e.last_name_rus ilike '%${bind.employee_name}%' or 
                                                                                  e.first_name_rus ilike '%${bind.employee_name}%' or 
                                                                                  e.middle_name_rus ilike '%${bind.employee_name}%' or
                                                                                  e.last_name_kaz ilike '%${bind.employee_name}%' or 
                                                                                  e.first_name_kaz ilike '%${bind.employee_name}%' or 
                                                                                  e.middle_name_kaz ilike '%${bind.employee_name}%')`
        }
        sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} e.id = ts.employee_id`
        let query = `
        select 
            ts.*,
            e.last_name_${bind.lang} as last_name,
            e.first_name_${bind.lang} as first_name,
            e.middle_name_${bind.lang} as middle_name
        from 
            hr.test_session ts,
            hr.employee e
        ${sql_where_clause}
        order by ts.id desc`
        console.log(query)
        console.log(queryBind)
        let {rows: data}: any = await client.query(query, queryBind)
        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function test_department_get_db(client: Client | null, bind: any) {
    try {
        if (!client) {
            throw('invalid connection')
        }
        let query = `
        select d.id, d.name_${bind.lang} as name from 
            hr.test_department_access t,
            hr.department d
        where t.is_active = true
        and d.id = t.department_id
        and d.id <> -1
        and t.test_id = $1`

        let data = await client.query(query,
            [
                bind.id
            ]
        ).catch((e: any) => { 
            throw `Ошибка hr.test_department_get_db => ${e} ${JSON.stringify(bind)}`
        });

        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function test_department_delete_db(client: Client, bind: any) {
    try {
        let query = `update hr.test_department_access set update_date = current_timestamp, update_user = $1, is_active = false
        where test_id = $2
        `
        let data = await client.query(query,
            [
                bind.user_name,
                bind.test_id
            ]
        ).catch((e: any) => { 
            throw `Ошибка hr.test_department_delete_db => ${e} ${JSON.stringify(bind)}`
        });

        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function test_department_post_db(client: Client | null, bind: any) {
    try {
        if (!client) {
            throw('invalid connection')
        }
        let query = `
        insert into hr.test_department_access
            (test_id, department_id, is_active, create_date, update_date, create_user, update_user)
        values 
            ($1, $2, true, current_timestamp, current_timestamp, $3, $4) returning id`

        let data = await client.query(query,
            [
                bind.id, 
                bind.department_id, 
                bind.create_user, 
                bind.update_user
            ]
        ).catch((e: any) => { 
            throw `Ошибка hr.test_session post db => ${e} ${JSON.stringify(bind)}`
        });

        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function createTestSessionDB(client: Client, bind: any) {
    try {
        let {rows: {[0]: data}} = await client.query({
            text: `
                insert into hr.test_session 
                    (employee_id, test_id, start_time, end_time, status_id, test_question_qty, test_question_correct_qty, create_date, update_date, create_user, update_user)
                values 
                    ($1, $2, current_timestamp, current_timestamp, 1, $3, 0, current_timestamp, current_timestamp, $4, $5) returning id`,
            values: [
                bind.employeeId, 
                bind.testId, 
                bind.testQuestionQTY,
                bind.create_user, 
                bind.update_user
            ]
        }).catch((e: any) => { 
            throw `Ошибка hr.test_session post db => ${e} ${JSON.stringify(bind)}`
        });

        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function putTestSessionDB(client: Client, bind: any) {
    try {
        let queryBind = [bind.updateUser];
        let query = `update hr.test_session set update_date = current_timestamp, update_user = $1`;

        if (bind.testQuestionCorrectQty) {
            query += `, test_question_correct_qty = $${queryBind.push(bind.testQuestionCorrectQty)}`;
        }

        if (bind.statusId) {
            query += `, status_id = $${queryBind.push(bind.statusId)}`;
        }

        if (bind.endTime) {
            query += `, end_time = current_timestamp`;
        }


        if (bind.id) {
            query += ` where id = $${queryBind.push(bind.id)}`;
        }

        await client.query(query, queryBind) 
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function getTestSessionAnswerDB(client: Client, bind: any) {
    console.log(bind)
    try {
        let sql_where_clause = ''
        let queryBind = []
        if(bind.testSessionId) {
            sql_where_clause += ` ${sql_where_clause.trim() ? ' and ' : 'where'} tsa.test_session_id = $${queryBind.push(bind.testSessionId)}`
        }
        let query = `
        select 
            tsa.*, 
            a.name_${bind.lang} as user_answer_name,
            ac.name_${bind.lang} as correct_answer_name,
            q.name_${bind.lang} as question_name
        from hr.test_session_answer tsa
        join hr.test_question q on tsa.question_id = q.id
        left join hr.test_answer a on tsa.user_answer_id = a.id
        join hr.test_answer ac on tsa.correct_answer_id = ac.id
        ${sql_where_clause}`
        console.log('finish1')
        console.log(query)
        console.log(queryBind)
        let {rows: data}: any = await client.query(query, queryBind)
        
        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function createTestSessionAnswerDB(client: Client, bind: any) {
    try {
        let {rows: {[0]: data}} = await client.query({
            text: `
                insert into hr.test_session_answer 
                    (test_session_id, question_id, correct_answer_id, user_answer_id)
                values 
                    ($1, $2, $3, null) returning id`,
            values: [
                bind.testSessionId, 
                bind.questionId, 
                bind.correctAnswerId,
            ]
        }).catch((e: any) => { 
            throw `Ошибка hr.test_session_answer post db => ${e} ${JSON.stringify(bind)}`
        });

        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function putTestSessionAnswerDB(client: Client, bind: any) {
    console.log('finish3')
    try {
        let queryBind = [];
        let query = `update hr.test_session_answer set`;

        if (bind.userAnswerId) {
            query += `${queryBind.length ? `,` : ``} user_answer_id = $${queryBind.push(bind.userAnswerId)}`;
        }


        if (queryBind.length) {
            if (bind.id) {
                query += ` where id = $${queryBind.push(bind.id)}`;
            }

            await client.query(query, queryBind) 
        }
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function createTestQuestionDB(client: Client, bind: any) {
    try {           
        const {rows: {[0]: data}} = await client.query({
            text: `
                insert into hr.test_question 
                    (test_question_type_id, name_rus, name_kaz, description_rus, description_kaz, is_active, create_date, update_date, create_user, update_user)
                values
                    ($1, $2, $3, $4, $5, true, current_timestamp, current_timestamp, $6, $7) 
                returning id`,
            values: [
                bind.testQuestionTypeId,
                bind.nameRus,
                bind.nameKaz,
                bind.descriptionRus,
                bind.descriptionKaz,
                bind.createUser,
                bind.updateUser,
            ]
        }).catch((e: any) => { 
            throw `Ошибка hr.test_question post db => ${e} ${JSON.stringify(bind)}`
        });

        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function createTestQuestionRelDB(client: Client, bind: any) {
    try {           
        const {rows: {[0]: data}} = await client.query({
            text: `
                insert into hr.test_question_rel
                    (test_id, test_question_id, is_active, create_date, update_date, create_user, update_user)
                values
                    ($1, $2, true, current_timestamp, current_timestamp, $3, $4) 
                returning id`,
            values: [
                bind.testId,
                bind.testQuestionId,
                bind.createUser,
                bind.updateUser,
            ]
        }).catch((e: any) => { 
            throw `Ошибка hr.test_question_rel post db => ${e} ${JSON.stringify(bind)}`
        });

        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function testQuestionPutDB(client: Client, bind: any) {
    try {                    
        const activeTest = await checkActiveTest(client, {question_id: bind.id})
        if(activeTest.length) {
            let tests = activeTest.map((item: any) => {
                return item.id
            })
            throw `Вопрос №${bind.id} используется в активных тестах: ${tests.join(', ')}`
        }
        let queryBind = [bind.updateUser];
        let query = `update hr.test_question set update_date = current_timestamp, update_user = $1`;

        if (bind.testQuestionTypeId) {
            query += `, test_question_type_id = $${queryBind.push(bind.testQuestionTypeId)}`;
        }

        if (bind.nameRus) {
            query += `, name_rus = $${queryBind.push(bind.nameRus)}`;
        }

        if (bind.nameKaz) {
            query += `, name_kaz = $${queryBind.push(bind.nameKaz)}`;
        }

        if (bind.descriptionRus) {
            query += `, description_rus = $${queryBind.push(bind.descriptionRus)}`;
        }

        if (bind.descriptionKaz) {
            query += `, description_kaz = $${queryBind.push(bind.descriptionKaz)}`;
        }

        if (bind.isActive || bind.isActive === false) {
            query += `, is_active = $${queryBind.push(bind.isActive)}`;
        }


        query += ` where id = $${queryBind.push(bind.id)}`;
        await client.query(query, queryBind) 
    } catch (err) {
        log.error(err)
        throw err;
    }
}


async function getTestListDB(client: Client, bind: any) {
    try {
        let query = `
        select 
            row_number () over (order by t.id) as id,
            t.id as test_id,
            t.name_${bind.lang} as name,
            t.description_${bind.lang} as description,
            t.duration,
            ${
                bind.ispageemployeepassingtest ? `
                ts.end_time,
                ts.start_time,
                ts.test_question_qty,
                ts.test_question_correct_qty,` : ``
            }
            (select count(qr.id) from hr.test_question_rel qr, hr.test_question tq where qr.test_id = t.id and tq.id = qr.test_question_id and tq.is_active = true and qr.is_active = true) as count_question
        from 
            hr.test t,
            ${bind.ispageemployeepassingtest ? `hr.test_session ts,` : ``}
            (select * from hr.employee where id = ${bind.employeeId}) e,
			hr.test_department_access tda
        where 
            tda.test_id = t.id 
            and (tda.department_id = e.department_id or tda.department_id = -1)  
            and tda.is_active = true
        ${bind.ispageemployeepassingtest ? `and now() >= ts.end_time and ts.employee_id = e.id and t.id = ts.test_id` : `and t.date_from < now() and now() < t.date_to`}
            and t.status_id in (2 ${bind.is_deleted ? ', 3 ' : ''})
        ${bind.name && bind.name.trim() ? `and t.name_${bind.lang} ilike '%${bind.name.trim()}%'` : ``}
        ${bind.testId ? `and t.id = ${bind.testId}` : ``}
        ${bind.ispageemployeepassingtest ? `order by ts.id desc` : ``}
        `
        let {rows: data}: any = await client.query(query);
        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function checkActiveTest(client : any, bind : any) {
    try {
        let query = `select t.id from hr.test t
        join hr.test_question_rel tqr on t.id = tqr.test_id
        where tqr.test_question_id = ${bind.question_id}
        and t.status_id = 2
        and date_from < now()
        and date_to > now()`

                let {rows: data}: any = await client.query(query);
        return data
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export {
    createTestSessionDB,
    putTestSessionDB,
    createTestSessionAnswerDB,
    putTestSessionAnswerDB,
    getTestSessionDB,
    getTestSessionAnswerDB,
    createTestQuestionDB,
    createTestQuestionRelDB,
    testQuestionPutDB,
    getTestListDB,
    test_department_get_db,
    test_department_post_db,
    test_department_delete_db
}