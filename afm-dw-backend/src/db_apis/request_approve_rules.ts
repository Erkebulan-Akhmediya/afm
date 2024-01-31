import { Client } from 'pg';
import log from '../config/logger';

export async function get_approve_employee_list(client: Client, employee: any, objectName: any, requestTypeId: any, requestSubTypeId: any, passRequestTypeId: any, isResidentRK: any) {
    try {
        if (objectName != 'REQUEST' && objectName != 'PASS_REQUEST') {
            throw `Системная ошибка, не корректно определен get_approve_employee_list.objectName, обратитесь в техническую поддержку`
        }

        if (employee.department_type_id == null) {
            throw `В департаменте инициатора не определен Тип департамента, обратитесь в кадровую службу (сотрудник ${employee.id})`
        }

        let errorDetailtext = '', getErrorTextData

        errorDetailtext = 'сотрудник '+employee.id
        errorDetailtext = errorDetailtext+', '+employee.position_name

                if (objectName == 'REQUEST') {
            errorDetailtext = errorDetailtext+', Заявление'
            getErrorTextData = await client.query('select name_rus as name from ref.department_type where id = '+employee.department_type_id)
            errorDetailtext = errorDetailtext+', '+getErrorTextData.rows[0].name
            getErrorTextData = await client.query('select name_rus as name from ref.request_type where id = '+requestTypeId)
            errorDetailtext = errorDetailtext+', '+getErrorTextData.rows[0].name
            getErrorTextData = await client.query('select name_rus as name from ref.request_sub_type where id = '+requestSubTypeId)
            errorDetailtext = errorDetailtext+', '+getErrorTextData.rows[0].name
        } else {
            errorDetailtext = errorDetailtext+', Заявка на пропуск'
            getErrorTextData = await client.query('select name_rus as name from ref.department_type where id = '+employee.department_type_id)
            errorDetailtext = errorDetailtext+', '+getErrorTextData.rows[0].name
            getErrorTextData = await client.query('select name_rus as name from ref.pass_request_type where id = '+passRequestTypeId)
            errorDetailtext = errorDetailtext+', '+getErrorTextData.rows[0].name
            errorDetailtext = errorDetailtext+', '+ (isResidentRK ? 'Резидент' : 'Нерезидент')
        }
        let query, bindQuery, checkData

        let approveRuleId
        if (objectName == 'REQUEST') {
            query = `select * from hr.approve_rule r
                        where r.object_name = 'REQUEST'
                        and (r.department_type_id = ${employee.department_type_id} or r.department_type_id = -1)
                        and (r.request_type_id = ${requestTypeId} or r.request_type_id = '-1')
                        and (r.request_sub_type_id = ${requestSubTypeId} or r.request_sub_type_id = '-1')
                        and r.initiator_position_name = '${employee.position_name}'
                        and r.is_active = true
                        order by r.department_type_id desc, r.request_type_id desc, r.request_sub_type_id desc, r.is_required_approve desc`
            checkData = await client.query(query)

            if (checkData.rows.length > 0) {
                if (!checkData.rows[0].is_required_approve) {
                    return { 
                        is_required_approve: false,
                        approve_rule_id: null,
                        approve_rule_items: []
                    };
                }
                approveRuleId = checkData.rows[0].id
            }
            else {
                query = `select * from hr.approve_rule r
                            where r.object_name = 'REQUEST'
                            and (r.department_type_id = ${employee.department_type_id} or r.department_type_id = -1)
                            and (r.request_type_id = ${requestTypeId} or r.request_type_id = '-1')
                            and (r.request_sub_type_id = ${requestSubTypeId} or r.request_sub_type_id = '-1')
                            and r.initiator_position_name is null
                            and r.is_active = true
                            order by r.department_type_id desc, r.request_type_id desc, r.request_sub_type_id desc, r.is_required_approve desc`
                checkData = await client.query(query)

                if (checkData.rows.length == 0) {
                    throw `Не найден маршрут согласования, обратитесь в кадровую службу (${errorDetailtext})`
                } else {
                    if (!checkData.rows[0].is_required_approve) {
                        return { 
                            is_required_approve: false,
                            approve_rule_id: null,
                            approve_rule_items: []
                        };
                    }
                    approveRuleId = checkData.rows[0].id
                }
            }
        }

        if (objectName == 'PASS_REQUEST') {
            query = `select * from hr.approve_rule r
                        where r.object_name = 'PASS_REQUEST'
                        and (r.department_type_id = ${employee.department_type_id} or r.department_type_id = -1)
                        and (r.pass_request_type_id = ${passRequestTypeId} or r.pass_request_type_id = '-1')
                        and r.is_resident_rk = ${isResidentRK}
                        and r.initiator_position_name = '${employee.position_name}'
                        and r.is_active = true
                        order by r.department_type_id desc, r.pass_request_type_id desc, r.is_required_approve desc`
            checkData = await client.query(query)

            if (checkData.rows.length > 0) {
                if (!checkData.rows[0].is_required_approve) {
                    return { 
                        is_required_approve: false,
                        approve_rule_id: null,
                        approve_rule_items: []
                    };
                }
                approveRuleId = checkData.rows[0].id
            }
            else {
                query = `select * from hr.approve_rule r
                            where r.object_name = 'PASS_REQUEST'
                            and (r.department_type_id = ${employee.department_type_id} or r.department_type_id = -1)
                            and (r.pass_request_type_id = ${passRequestTypeId} or r.pass_request_type_id = '-1')
                            and r.is_resident_rk = ${isResidentRK}
                            and r.initiator_position_name is null
                            and r.is_active = true
                            order by r.department_type_id desc, r.pass_request_type_id desc, r.is_required_approve desc`
                checkData = await client.query(query)

                if (checkData.rows.length == 0) {
                    throw `Не найден маршрут согласования, обратитесь в кадровую службу (${errorDetailtext})`
                } else {
                    if (!checkData.rows[0].is_required_approve) {
                        return { 
                            is_required_approve: false,
                            approve_rule_id: null,
                            approve_rule_items: []
                        };
                    }
                    approveRuleId = checkData.rows[0].id
                }
            }
        }

        query = `select i.id, i.orders, i.approve_position_name, i.manager_department_type_id
        from hr.approve_rule_item i
        where i.rule_id = ${approveRuleId} and i.is_active = true order by i.orders`

        checkData = await client.query(query)

        if (checkData.rows.length == 0) {
            throw `В настройках маршрута не определены позиции (маршрут согласования `+approveRuleId+`), обратитесь в кадровую службу`
        }

        let approver
        for (let item of checkData.rows) {
            if(item.manager_department_type_id) {
                query = `select e.* from hr.employee e, hr.department d, hr.organization o
                where e.department_id = d.id and o.id = d.organization_id and d.organization_id = $1 and e.manager_department_type_id = $2
                and e.is_fired = false`
                bindQuery = [employee.organization_id, item.manager_department_type_id]
                approver = await client.query(query, bindQuery)

                if (approver.rows.length > 1) {
                    throw `Определено более одного согласующего по правилу позиции - Курирующее руководство по типу департамента (маршрут согласования ${approveRuleId})`
                }

                if (approver.rows.length == 0) {
                    throw `Не определен согласующий по правилу позиции - Курирующее руководство по типу департамента (маршрут согласования ${approveRuleId})`
                }
            } else {
                query = `select e.* from hr.employee e, hr.position p where e.position_id = p.id 
                and UPPER(p.name_rus) = UPPER('${item.approve_position_name}') and e.department_id = $1 and e.is_fired = false`
                bindQuery = [employee.department_id]
                approver = await client.query(query, bindQuery)

                if (approver.rows.length > 1) {
                    throw `Определено более одного согласующего по правилу позиции - Наименование позиции согласующего (маршрут согласования ${approveRuleId})`
                }

                if (approver.rows.length == 0) {
                    query = `select e.* from hr.employee e, hr.position p where e.position_id = p.id 
                    and UPPER(p.name_rus) = UPPER('${item.approve_position_name}') and e.department_id = $1 and e.is_fired = false`
                    bindQuery = [employee.department_parent_id]
                    approver = await client.query(query, bindQuery)

                    if (approver.rows.length > 1) {
                        throw `Определено более одного согласующего по правилу позиции - Наименование позиции согласующего в родительском департаменте (маршрут согласования ${approveRuleId})`
                    }

                    if (approver.rows.length == 0) {
                        throw `Не определен согласующий по правилу позиции - Наименование позиции согласующего в родительском департаменте (маршрут согласования ${approveRuleId})`
                    }
                }
            }

            item.approver_id = approver.rows[0].id
        }

        return { 
            is_required_approve: true,
            approve_rule_id: approveRuleId,
            approve_rule_items: checkData.rows
        };
    } catch (err) {
        log.error(err)
        throw err;
    }
}


export async function get_request_approve_rule(client: Client, bind: any) {
    try {

        let addQuery = ``
        if(bind.object_name) {
            addQuery = `and rar.object_name = '${bind.object_name}'`
        }

                let query = `select 
                        rar.*,

                        case when rar.department_type_id = -1 then 'Все типы'
                            else dt.name_${bind.lang} end as department_type_name,

                        case when rar.request_type_id = -1 then 'Все типы'
                            else rt.name_${bind.lang} end as request_type_name,

                        case when rar.request_sub_type_id = -1 then 'Все подтипы'
                            else rst.name_${bind.lang} end as request_sub_type_name,

                        case when rar.pass_request_type_id = -1 then 'Все типы'
                            else prt.name_${bind.lang} end as pass_request_type_name
                    from 
                        hr.approve_rule rar, 
                        ref.department_type dt, 
                        ref.request_type rt,
                        ref.request_sub_type rst,
                        ref.pass_request_type prt
                    where 
                        dt.id = rar.department_type_id 
                        and rt.id = rar.request_type_id  
                        and rst.id = rar.request_sub_type_id
                        and prt.id = rar.pass_request_type_id  
                        and rar.is_active = true
                        `+addQuery+`
                    order by rar.create_Date desc
                        `
        let {rows: rules}: any = await client.query(query)
        return rules;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function get_request_approve_refs(client: Client, bind: any) {
    try {
        let whereSql = ''
        if((bind.id || bind.id == 0) && bind.column) {
            whereSql += ` where ${bind.column} = ${bind.id}`
        }

                let query = `select 
                id,
                        name_${bind.lang} as name
                    from 
                        ref.${bind.tablename} ${whereSql}`
        let {rows: refs}: any = await client.query(query)
        return refs;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function request_approve_rule_post_db(client: Client, bind: any) {
    try {
        await checkApproveRuleData(client, bind)

        let bindQuery = [bind.department_type, bind.request_type, bind.request_sub_type, bind.user_name, bind.initiator_position_name, bind.object_name, bind.pass_request_type, bind.is_resident_rk, bind.is_required_approve]
        let query = `insert into hr.approve_rule (department_type_id, request_type_id, request_sub_type_id, create_user, update_user, initiator_position_name, object_name, pass_request_type_id, is_resident_rk, is_required_approve) values ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9)
                        `
        let {rows: rules}: any = await client.query(query, bindQuery)
        return rules;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function request_approve_rule_put_db(client: Client, bind: any) {
    try {
        await checkApproveRuleData(client, bind)

                let bindQuery = [bind.department_type, bind.request_type, bind.request_sub_type, bind.user_name, bind.initiator_position_name || null, bind.object_name, bind.pass_request_type, bind.is_resident_rk, bind.is_required_approve, bind.id]
        let query = `update hr.approve_rule set department_type_id = $1, request_type_id = $2, request_sub_type_id = $3, update_user = $4, initiator_position_name = $5, object_name = $6, pass_request_type_id = $7, is_resident_rk = $8 , is_required_approve = $9 where id = $10
                        `
        let {rows: rules}: any = await client.query(query, bindQuery)
        return rules;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function checkApproveRuleData(client: Client, bind: any) {
    try {
        let checkInitiatorPositionName = bind.initiator_position_name ? ` and initiator_position_name = '`+bind.initiator_position_name+`'` : ` and initiator_position_name is null`

                let updateOperation = ``
        if (bind.id) {
            updateOperation = ` and id != ${bind.id}`
        }

        let checkQuery = await client.query(`select * from hr.approve_rule where department_type_id = ${bind.department_type} and request_type_id = ${bind.request_type} and request_sub_type_id = ${bind.request_sub_type} and object_name = '${bind.object_name}' and pass_request_type_id = ${bind.pass_request_type} and is_resident_rk = ${bind.is_resident_rk} and is_required_approve = ${bind.is_required_approve}`+checkInitiatorPositionName+` and is_active = true`+updateOperation)

        if (checkQuery.rows.length > 0) {
            throw `С указанными данными существует маршрут`
        }
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function request_approve_rule_del_db(client: Client, bind: any) {
    try {
        let bindQuery = [bind.user_name, bind.id]
        let query = `update hr.approve_rule set is_active=false, update_user = $1, update_date = current_timestamp where id = $2`
        let {rows: rules}: any = await client.query(query, bindQuery)
        let query_items = `update hr.approve_rule_item set is_active=false, update_user = $1, update_date = current_timestamp where rule_id = $2`
        await client.query(query_items, bindQuery)
        return rules;
    } catch (err) {
        log.error(err)
        throw err;
    }
}



export async function get_request_approve_rule_item_all(client: Client, bind: any) {
    try {

                let query = `select 
                        ri.*, 
                        (select name_rus from ref.department_type where id = ri.MANAGER_DEPARTMENT_TYPE_ID) AS MANAGER_DEPARTMENT_TYPE_NAME
                    from 
                        hr.approve_rule_item ri
                    where 
                        rule_id = $1
                        and ri.is_active = true
                    order by ri.orders`
        let {rows: rules}: any = await client.query(query, [bind.id])
        return rules;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function post_request_approve_rule_item(client: Client, bind: any) {
    try {
        await checkApproveRuleItemData(client, bind)

                let query = `insert into hr.approve_rule_item (rule_id, orders, create_user, update_user, manager_department_type_id, approve_position_name) values ($1, $2, $3, $4, $5, $6)
                        `
        let bindQuery = [bind.rule_id, bind.orders, bind.user_name, bind.user_name, bind.manager_department_type_id, bind.approve_position_name]
        let {rows: rules}: any = await client.query(query, bindQuery)
        return rules;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function put_request_approve_rule_item(client: Client, bind: any) {
    try {
        await checkApproveRuleItemData(client, bind)

        let query = `update hr.approve_rule_item set rule_id = $1, approve_position_name = $2, orders = $3, update_user = $4, manager_department_type_id = $5 where id = ${bind.id}`
        let bindQuery = [bind.rule_id, bind.approve_position_name, bind.orders, bind.user_name, bind.manager_department_type_id]
        let {rows: rules}: any = await client.query(query, bindQuery)
        return rules;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

async function checkApproveRuleItemData(client: Client, bind: any) {
    try {
        if (bind.manager_department_type_id == null && bind.approve_position_name == null) {
            throw `Необходимо заполнить одну из полей: "Позиция согласующего", "Тип курирующего департамента (для высшего руководства)"`
        }

        if (bind.manager_department_type_id != null && bind.approve_position_name != null) {
            throw `Необходимо заполнить одну из полей: "Позиция согласующего", "Тип курирующего департамента (для высшего руководства)"`
        }

        if (bind.orders == undefined || bind.orders == null || bind.orders == "") {
            throw `"Шаг согласования" обязательна для заполнения`
        }

        if (bind.orders < 1) {
            throw `"Шаг согласования" должно быть больше или равно 1`
        }

        let checkApprovePositionName = bind.approve_position_name ? ` and approve_position_name = '`+bind.approve_position_name+`'` : ` and approve_position_name is null`
        let checkManagerDepartmentTypeId = bind.manager_department_type_id ? ` and manager_department_type_id = `+bind.manager_department_type_id : ` and manager_department_type_id is null`

        let updateOperation = ``
        if (bind.id) {
            updateOperation = ` and id != ${bind.id}`
        }

        let checkQuery = await client.query(`select * from hr.approve_rule_item where rule_id = ${bind.rule_id} and orders = ${bind.orders}`+checkApprovePositionName+checkManagerDepartmentTypeId+` and is_active = true`+updateOperation)

        if (checkQuery.rows.length > 0) {
            throw `С указанными данными в маршруте существует позиция`
        }
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function del_request_approve_rule_item(client: Client, bind: any) {
    try {
        let query = `update hr.approve_rule_item set is_active = false, update_user = $1 where id = ${bind.id}`
        let bindQuery = [bind.user_name]
        let {rows: rules}: any = await client.query(query, bindQuery)
        return rules;
    } catch (err) {
        log.error(err)
        throw err;
    }
}