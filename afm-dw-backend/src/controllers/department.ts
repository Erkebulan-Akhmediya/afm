import express from 'express';
import {department_get_db,department_put_db} from '../db_apis/departament';
import {employee_get_db,employee_put_db, employee_subordinates_get_db} from '../db_apis/employee/employee';
import {employee_contact_get_db} from '../db_apis/employee/employee_contact'
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import { Client } from 'pg';


export async function department_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

                let result: any = [];
        const bind: any = createBind(req);
        const {0: userData}: any = await employee_get_db({id: bind.user_id, lang: bind.lang})

        if (bind.id) {
            let departments = await Promise.all([
                department_get_db({id: parseInt(req.params.id, 10), lang: bind.lang}),
                department_get_db({parent_id: parseInt(req.params.id, 10), lang: bind.lang})
            ])

                        const parentDepartment: any = departments[0] 
            parentDepartment[0].department = departments[1] 

            parentDepartment[0].employees = await employee_get_db({department_id: parentDepartment[0].id, lang: bind.lang});
            for (let i of parentDepartment[0].employees) {
                const contacts = await employee_contact_get_db({employee_id: i.id, lang: bind.lang});
                i.contacts = contacts.filter(item => {
                    if (['Руководство'].includes(i.department_name_rus)) {
                        if (![4].includes(item.contact_info_type_id)) {
                            return item;
                        }
                    } else if(!['Руководство'].includes(userData.department_name_rus) && ['Руководитель департамента', 'Руководитель управления', 'Руководитель отдела', 'Руководитель', 'Заместитель руководителя', 'Заместитель руководителя департамента'].includes(i.position_name_rus)){
                        if (![4].includes(item.contact_info_type_id)) {
                            return item;
                        }
                    } else {
                        return item;
                    }
                });
            }
            if(parentDepartment[0]?.employees.length) {
                let client: Client | null = null
                try {
                    client = get_client(); await client.connect();
                    let subordinates: any = await employee_subordinates_get_db(client, userData.id, false, 0, 0, parentDepartment[0].id, 0);
                    subordinates.map((item: any) => {
                        let obj = parentDepartment[0].employees.find((itemChild: any) => itemChild.id == item.id)
                        if(obj) {
                            obj.is_subordinate = true
                        }
                    })
                } catch (error) {
                    console.log(error)
                } finally {
                    if (client) {
                        await client.end();
                    }
                }
            }
            result = parentDepartment[0]
            res.locals.data = {
                statusCode: 200,
                data: result
            }

            return next()
        }

        if (bind.organization_id) {
            result = await department_get_db({organization_id: bind.organization_id, lang: bind.lang})
            res.locals.data = {
                statusCode: 200,
                data: result
            }

            return next()
        }

        if (bind.parent_id || bind.parent_id === null) {
            result = await department_get_db({parent_id: bind.parent_id, lang: bind.lang});
            res.locals.data = {
                statusCode: 200,
                data: result
            }

            return next()
        } else {
            result = await department_get_db(bind)
            res.locals.data = {
                statusCode: 200,
                data: result
            }

            return next()
        }

    } catch (error) {
        next(error)
    }
}

export async function department_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {

        client = get_client(); await client.connect();
        const bind: any = createBind(req);

        if (bind.manager_id) {
            const {[0]: employee}: any = await employee_get_db({id: bind.manager_id, lang: bind.lang});

                        if (employee.department_id != bind.id) {
                await employee_put_db(client, {id: employee.id, department_id: bind.id, user_name: bind.user_name, department_type: bind.department_type})
            }
        }
        await department_put_db(client, bind);

        await client.query('COMMIT');

        res.status(204).end();
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        next(error)
    } finally {
        if (client) {
            await client.end();
        }
    }
}