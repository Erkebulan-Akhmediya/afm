import log from '../config/logger';
import get_client from '../loaders/database';
import moment from 'moment';

export async function lov_get_db(bind: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        let sqlWhereClause = "";
        let selectColumn = ""
        let sqlOrderBy = ""
        let sqlPagination = ""

        if (bind.page && bind.itemsperpage && bind.itemsperpage != -1) {
            sqlPagination = ` limit ${bind.itemsperpage} offset ${(bind.page-1)*bind.itemsperpage}`
        }

        if (bind.external_id) {
            sqlWhereClause += `${sqlWhereClause.trim() ? ` and ` : ` where `} t.external_id = '${bind.external_id}' `
        }
        if (bind.id) {
            sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}  t.id = ${bind.id}`
        }
        if (bind.identification_number) {
            sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}  t.identification_number = '${bind.identification_number}' `
        }
        if (bind.employee_id) {
            sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}  t.employee_id = ${bind.employee_id} `
        }
        if (bind.education_type) {
            sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}  t.education_type = ${bind.education_type} `
        }
        
        if (bind.name) {
            let arr = bind.name.split(',')
            let str = arr.reduce((acc:any, item: any, index: any) => {
                acc += `'${item}'`
                if(index < arr.length -1) {
                    acc += ', '
                }
                return acc
            }, '')
            sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}  t.name in (${str}) `
        }

        if(bind.birthdays) {
            let sevenDay = moment(new Date()).add(7, 'd').format('DD');
            let sevenDayMonth = moment(new Date()).add(7, 'd').format('MM');

            sqlWhereClause += `
            ${sqlWhereClause.trim() ? ' and ' : 'where'}
            (extract(month from t.birth_date::date) = extract(month from now()::date) and extract(day from t.birth_date::date) >= ${new Date().getDate()})
            ${/**
                Если текущий месяц не равен, дате прибавленной 7 дней, то берем в расчет след месяц, если равны поиск по текущему месяц
                */  
            new Date().getMonth() + 1 != parseInt(sevenDayMonth, 10) ? `
            or
            (extract(month from t.birth_date::date) = extract(month from now()::date)+1 and ` : ` and (`}
             
            extract(day from t.birth_date::date) <= ${parseInt(sevenDay, 10)})

            and is_fired = false
            `
            sqlOrderBy += `extract(month from t.birth_date::date ) asc, extract(day from t.birth_date::date ) asc`
        }

        if ([
            'hr.employee_perco',
            'hr.department', 
            'hr.organization', 
            'hr.event', 
            'hr.position', 
            'hr.employee_document',
            'hr.employee_contact_info',
            'hr.employee',
            'hr.temp_employee_v',
            'hr.employee_education_new',
            'ref.entry_type',
            'ref.entry_status',
            'ref.role',
            'ref.employee_category',
            'hr.employee_rank',
            'ref.period_type',
            'ref.sys_all_const',
            'ref.department_type',
            'ref.test_question_type',
            'ref.pass_request_type',
            'ref.employee_apartment_type',
            'ref.conclusive_data_type',
            'ref.disciplinary_type',
            'hr.employee_apartment',
            'hr.employee_conclusive_data',
            'hr.employee_disciplinary',
            'hr.employee_car',
            'hr.employee_qualification',
            'hr.employee_test_result',
            'hr.employee_achievement',
            'hr.employee_weapon',
            'ref.fncl_obligation_type',
            'hr.employee_fncl_obligation',
            'ref.country',
            'hr.employee_abroad_info',
            'hr.employee_relation',
            'ref.employee_relation_type',
            'ref.email_server_type',
            'hr.employee_work_list',
            'hr.employee_language',
            'ref.knowledge_level',
            'ref.language',
            'ref.request_sub_type',
            'ref.request_type',
            'hr.email_account',
            'ref.email_server',
            'ref.value_type',
            'ref.report_form'
            ].includes(bind.table_name)) {
            selectColumn = '*'

            if (bind.table_name == 'ref.request_type') {
                selectColumn = ` id, name_${bind.lang || 'rus'} as name `
                if (bind.is_application != null)
                {
                    sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `} t.is_application = ${bind.is_application}`
                }
            }

            if (bind.table_name == 'ref.request_sub_type') {
                selectColumn = ` id, name_${bind.lang || 'rus'} as name `
                if (bind.request_type_id != null)
                {
                    sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `} t.request_type_id = ${bind.request_type_id}`
                }
                sqlWhereClause += sqlWhereClause.trim() ? ` and t.is_active` : ` where t.is_active`
            }

            if (bind.table_name == 'ref.department_type') {
                selectColumn = ` id, name_${bind.lang || 'rus'} as name `
            }

            if (bind.table_name == 'hr.employee_perco') {
                selectColumn = ` id,  perco_id, bin, employee_id `
                sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `} t.employee_id = (select id from hr.employee e1 where e1.identification_number = '${bind.iin}')`
            }
            if (bind.table_name == 'hr.department') {
                selectColumn = ` id, name_${bind.lang || 'rus'} as name, manager_id`
            }
            if (bind.table_name == 'hr.organization') {
                selectColumn = ` id, name_${bind.lang || 'rus'} as name `
            }

            if (bind.table_name == 'ref.pass_request_type') {
                selectColumn = ` id, name_${bind.lang || 'rus'} as name `
            }

            if (bind.table_name == 'ref.period_type') {
                selectColumn = ` id, name `
            }

            if (bind.table_name == 'ref.report_form') {
                selectColumn = ` id, name `
                sqlWhereClause += sqlWhereClause.trim() ? ` and t.is_active` : ` where t.is_active`
            }

            if (bind.table_name == 'hr.event') {
                selectColumn = `*, (select last_name_${bind.lang} || ' ' || first_name_${bind.lang} || ' ' || middle_name_${bind.lang} from hr.employee e, hr.user u where e.id = u.id and u.username = t.create_user) as create_user_name, (select last_name_${bind.lang} || ' ' || first_name_${bind.lang} || ' ' || middle_name_${bind.lang} from hr.employee e, hr.user u where e.id = u.id and u.username = t.update_user) as update_user_name`
                sqlOrderBy += ` t.publish_date desc, t.display_order desc `
                sqlWhereClause += sqlWhereClause.trim() ? ` and t.event_type_id = ${bind.event_type_id}` : ` where t.event_type_id = ${bind.event_type_id}`
            }

            if (bind.table_name == 'hr.employee' || bind.table_name == 'hr.temp_employee_v') {
                if (bind.month && bind.day) {
                    sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}   date_part('month', t.birth_date) = ${bind.month} and date_part('day', t.birth_date) = ${bind.day} `
                }
            }

            if (bind.table_name == 'hr.employee_contact_info') {
                sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `} t.is_active is not null `
            }

            if (bind.table_name == 'ref.test_question_type') {
                selectColumn = `
                t.id, 
                t.name_${bind.lang} as name
                `
                sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `} t.is_active = true `
            }

            if (bind.table_name == 'hr.employee_apartment' || bind.table_name == 'hr.employee_car' || bind.table_name == 'hr.employee_weapon' || bind.table_name == 'hr.employee_fncl_obligation' || bind.table_name == 'hr.employee_abroad_info' || bind.table_name == 'hr.employee_work_list' || bind.table_name == 'hr.employee_language' || bind.table_name == 'hr.employee_education' || bind.table_name == 'hr.employee_relation' || bind.table_name == 'hr.employee_qualification' || bind.table_name == 'hr.employee_test_result' || bind.table_name == 'hr.employee_achievement' || bind.table_name == 'hr.employee_conclusive_data' || bind.table_name == 'hr.employee_disciplinary') {
                if (bind.hasOwnProperty('is_deleted')) { 
                    sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}  t.is_deleted = ${bind.is_deleted}`
                }
            }
        } else {
            selectColumn = `
            t.id, 
            t.name_${bind.lang} as name
            `
            sqlWhereClause += sqlWhereClause.trim() ? ` and t.is_active is not null ` : ` where t.is_active is not null `
        }

        let query = 
            `
                select
                    ${selectColumn}
                from ${bind.table_name} t ${sqlWhereClause} ${sqlOrderBy ? 'order by ' + sqlOrderBy : ''}
                ${sqlPagination}
            `


        let {rows: data} = await client.query(query)
        let total

        if(sqlPagination != "") {

            let {rows: {[0]: count}} = await client.query(
                `
                    select
                        count(1)
                    from ${bind.table_name} t ${sqlWhereClause}
                `
            )
            total = count.count

        }

                return {data, total};
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function lov_post_db(bind: any) {
    let client;
    try {
        let oldUserName = 'init'
        if (bind.user_name) {oldUserName = bind.user_name; delete bind.user_name;}

        if (bind.table_name == 'hr.employee_perco') {
            if (!bind.hasOwnProperty('create_user_id')) { bind.create_user_id = -1 }
            if (!bind.hasOwnProperty('update_user_id')) { bind.update_user_id = -1 }
        }

        if (bind.table_name == 'hr.employee_contact_info' || bind.table_name == 'hr.employee') {
            if (bind.create_user_id) { delete bind.create_user_id;}
            if (bind.update_user_id) { delete bind.update_user_id;}
        }

        client = get_client(); await client.connect();
        let insertValues = ``;
        let insertColumn = ``;

        let bindArr = Object.entries(bind).filter(([key, value]) => !['table_name'].includes(key));

        bindArr.map(([key, value], index) => {
            insertColumn += `${value ? `${key},` : ''}`;
            insertValues += `${value ? key == 'identification_number' ? `'${value}',` : Number.isInteger(value) ? `${parseInt(value as any, 10)},` : `'${value}',` : ''}`;
        })

        if (bind.table_name == 'hr.entry' || bind.table_name == 'hr.employee_perco' || bind.table_name == 'hr.participant' || bind.table_name == 'hr.employee_education' || bind.table_name == 'hr.test_table' || bind.table_name == 'hr.employee_apartment' || bind.table_name == 'hr.employee_car' || bind.table_name == 'hr.employee_weapon' || bind.table_name == 'hr.employee_fncl_obligation' || bind.table_name == 'hr.employee_abroad_info' || bind.table_name == 'hr.employee_work_list' || bind.table_name == 'hr.employee_language' || bind.table_name == 'hr.employee_relation' || bind.table_name == 'hr.employee_qualification' || bind.table_name == 'hr.employee_test_result' || bind.table_name == 'hr.employee_achievement' || bind.table_name == 'hr.employee_conclusive_data' || bind.table_name == 'hr.employee_disciplinary' || bind.table_name == 'app.integration_log') {
            insertColumn = insertColumn.slice(0, -1)
            insertValues = insertValues.slice(0, -1)
        } else if (bind.table_name == 'hr.employee_contact_info' || bind.table_name == 'hr.employee') {
            insertColumn += `create_user, update_user`;
            insertValues += `'`+oldUserName+`', '`+oldUserName+`'`;
        } else {
            insertColumn += `create_user, update_user`;
            insertValues += `'init', 'init'`;
        }
        let query = `
        insert into ${bind.table_name}
            (${insertColumn})
        values
            (${insertValues}) 
        returning id
        `

        let {rows: {[0]: data}} = await client.query(query)

                return data;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function lov_put_db(bind: any): Promise<void> {
    let client;

        try {
        client = get_client(); await client.connect();
        let sqlSet: string = "";
        let sqlWhereClause = "";

        if (bind.table_name == 'hr.employee_education'||bind.table_name == 'hr.employee' || bind.table_name == 'hr.employee_contact_info') {
            delete bind.update_user_id;
        }

                let bindArr = Object.entries(bind).filter(([key, value]) => !['id', 'table_name'].includes(key));
        bindArr.map(([key, value], index) => {
            sqlSet += ` ${key} = ${typeof value == 'object' ? value : typeof value == 'boolean' ? value : key == 'identification_number' ? `'${value}'` : Number(value) ? `${parseInt(value as any, 10)}` : `'${value}'`} ,`;
        })

        if (bind.id) {
            sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}  id = ${bind.id}`
        }

        if (bind.table_name != 'hr.employee' && bind.external_id) {
            sqlWhereClause += `${sqlWhereClause.trim() ? ` and ` : ` where `} external_id = '${bind.external_id}' `
        }

        if (bind.employee_id) {
            sqlWhereClause += ` ${sqlWhereClause.trim() ? ` and ` : ` where `}  employee_id = ${bind.employee_id}`
        }
        if (bind.table_name == 'hr.employee_education' || bind.table_name == 'hr.employee' || bind.table_name == 'hr.employee_contact_info' || bind.table_name == 'app.integration_log') {
            let query = `
            update 
                ${bind.table_name}
            set
                ${sqlSet.slice(0, -1)}
            ${sqlWhereClause}
            `

            await client.query(query)

                   } else {
            let query = `
                update 
                    ${bind.table_name}
                set
                    ${sqlSet}
                    update_date = current_timestamp
                ${sqlWhereClause}
            `

            await client.query(query)
        }
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function custom_disable_others(bind: any): Promise<void> {
    let client;
    try {
        client = get_client(); await client.connect();

        await client.query(`update hr.employee_contact_info 
                             set is_active = false, 
                                 update_date = current_timestamp 
                           where employee_id = '${bind.employee_id}' and 
                                 contact_info_type_id = '${bind.contact_info_type_id}' and
                                 id != '${bind.id}'`)

            } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}