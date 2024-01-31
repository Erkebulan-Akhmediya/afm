import request from "supertest";
import {app} from '../loaders/express';
import crypto from 'crypto-js'

function uncryptText(text: string) {
    text = text.slice(1, -1)
    let bytes = crypto.AES.decrypt(text, 'secret-key');
    let originalText = bytes.toString(crypto.enc.Utf8);

    let responseData
    try { responseData = JSON.parse(originalText); } catch (e) { responseData = originalText; }
    return responseData
}

describe('Test Department Controller', () => {
    let token: string = "";

        test('getToken', async () => {
        const result: any = await request(app)
            .post('/api/1.0/auth/login')
            .send({
                username: 'user_36', 
                password: '1'
            })

                result.data = uncryptText(result.text);

        token = result.data.access_token
        expect(result.status).toBe(200);
    })


        test('Request /department should return status 200', async () => {

        const result = await request(app)
            .get('/api/1.0/department')
            .set('Authorization', `Barear ${token}`)

        expect(result.status).toBe(200);
        expect(result.headers['content-type']).toMatch('application/json')      
    })

})

describe('Test Approve', () => {
    let token: string = "";

        test('getToken', async () => {
        const result: any = await request(app)
            .post('/api/1.0/auth/login')
            .send({
                username: 'user_36', 
                password: '1'
            })

                result.data = uncryptText(result.text);

        token = result.data.access_token
        expect(result.status).toBe(200);
    })

        test('Approve request item get', async () => {

        const result = await request(app)
            .get('/api/1.0/approve/item/')
            .set('Authorization', `Barear ${token}`)
            .send({
                request_approve_status: 1,
                options: {
                    page: 1,
                    itemsPerPage: 10
                }
            })

        expect(result.status).toBe(200);
        expect(result.headers['content-type']).toMatch('application/json')      
    })

    let approve_id: number
    let request_id: number

    test('Request create', async () => {
        const result = await request(app) 
            .post('/api/1.0/request')
            .set('Authorization', `Barear ${token}`)
            .send(
                {"request_type_id":1,"request_sub_type_id":1,"employees":[{"id":36,"first_name":"Тимофей","last_name":"Хохряков","middle_name":"Олегович"}],"details":[{"characteristic_id":19,"is_required":true,"is_active":true,"is_multiple":false,"value_type_id":3,"name":"Дата с","catalog_name":null,"value_length":null,"type":"Дата","value":["2023-04-11"],"date_value":["2023-04-11"],"menu2":false},{"characteristic_id":20,"is_required":true,"is_active":true,"is_multiple":false,"value_type_id":3,"name":"Дата по","catalog_name":null,"value_length":null,"type":"Дата","value":["2023-04-11"],"date_value":["2023-04-11"],"menu2":false},{"characteristic_id":21,"is_required":true,"is_active":true,"is_multiple":false,"value_type_id":1,"name":"Описание причины","catalog_name":null,"value_length":null,"type":"Текст","value":["yes"],"date_value":[]}]}
            )

        let responseData = uncryptText(result.text);

        request_id = responseData

        expect(result.status).toBe(201);

    })

    test('Approve request create', async () => {
        const result = await request(app) 
            .post('/api/1.0/approve/request/project')
            .set('Authorization', `Barear ${token}`)
            .send({
                request_id: request_id
            })

        let responseData = uncryptText(result.text);

        approve_id = responseData

        expect(result.status).toBe(201);

    })


    let ari1_id: number
    let ari2_id: number
    let ari3_id: number

    test('Approve request item create', async () => {
        const result = await request(app) 
            .post('/api/1.0/approve/item/project')
            .set('Authorization', `Barear ${token}`)
            .send({
                approve_request_id: approve_id,
                item: {
                    ar_item_type_id: 1,
                    cover_word: 'cover_word',
                    orders: 1,
                    approver_id: 36,
                    parent_id: null,
                }
            })

        let responseData = uncryptText(result.text);

        ari1_id = responseData

        console.log(responseData)

        expect(result.status).toBe(201);

    })

    test('Approve request item create', async () => {
        const result = await request(app) 
            .post('/api/1.0/approve/item/project')
            .set('Authorization', `Barear ${token}`)
            .send({
                approve_request_id: approve_id,
                item: {
                    ar_item_type_id: 1,
                    cover_word: 'cover_word',
                    orders: 1,
                    approver_id: 36,
                    parent_id: null,
                }
            })

        let responseData = uncryptText(result.text);

        ari2_id = responseData

        console.log(responseData)

        expect(result.status).toBe(201);

    })

    test('Approve request item create', async () => {
        const result = await request(app) 
            .post('/api/1.0/approve/item/project')
            .set('Authorization', `Barear ${token}`)
            .send({
                approve_request_id: approve_id,
                item: {
                    ar_item_type_id: 1,
                    cover_word: 'cover_word',
                    orders: 1,
                    approver_id: 36,
                    parent_id: null,
                }
            })

        let responseData = uncryptText(result.text);

        ari3_id = responseData

        console.log(responseData)

        expect(result.status).toBe(201);

    })

    test('Request send to approve', async () => {
        const result = await request(app) 
            .put('/api/1.0/request')
            .set('Authorization', `Barear ${token}`)
            .send({
                approve_request_id: approve_id,
            })

        let responseData = uncryptText(result.text);

        console.log(responseData)

        expect(result.status).toBe(204);

    })

    let ari_redirect:Array<Number> = []

    test('Approve request item redirect', async () => {
        const result = await request(app) 
            .post(`/api/1.0/approve/item/redirect`)
            .set('Authorization', `Barear ${token}`)
            .send({
                id: ari3_id,
                approve_request_id: approve_id,
                object_id: approve_id,
                object_name: 'REQUEST',
                request_status_id: 2,
                redirect_type: 2,

                parent_id: ari3_id,
                approve_rule_items: [
                    {
                        orders: 1,
                        ar_item_type_id: 3,
                        approver_id: 36
                    },
                    {
                        orders: 2,
                        ar_item_type_id: 2,
                        approver_id: 36
                    },
                ],

                user_id: 36,
            })

        let responseData = uncryptText(result.text);

        console.log(responseData)
        ari_redirect = responseData

        expect(result.status).toBe(201);

    })


    test('Approve request item confirm', async () => {
        const result = await request(app) 
            .post(`/api/1.0/approve/item`)
            .set('Authorization', `Barear ${token}`)
            .send(
                {
                "id":ari2_id,
                "employees":[
                    {
                        "id":36,
                        "last_name":"Хохряков",
                        "first_name":"Тимофей",
                        "middle_name":"Олегович",
                        "department_id":267,
                        "identification_number":"760527350356",
                        "employee_type_id":1,
                        "position_id":148,
                        "employee_department_full_list":"Государственное управление РК, Департамент кадровой работы, Управление по развитию персоналом на правах Учебно-методического центра",
                        "position_name":"Руководитель управления"
                    }
                ],
                "emp_department_name":"Департамент стратегии и оперативного управления",
                "emp_organization_name":"Государственное управление РК",
                "building_name":null,
                "cover_word":"cover_word",
                "parent_id":null,
                "approve_request_id":2732,
                "employee_id":36,
                "orders":1,
                "ar_item_type_id":null,
                "request_status_id":2,
                "request_status_name":"На утверждении",
                "approve_date":null,
                "send_date":"2023-04-18 06:23:27.240336",
                "create_date":"2023-04-18 06:23:27.144928",
                "create_user_id":36,
                "update_date":"2023-04-18 06:23:27.144928",
                "update_user_id":36,
                "object_display_type":"Заявление",
                "object_display_subtype":"Объяснительная",
                "object_info":{
                    "request_type":"Объяснительная",
                    "request_type_id":1,
                    "request_sub_type":"Опоздание",
                    "request_sub_type_id":1,
                    "file_id_list":[

                                            ]
                },
                "last_name":"Хохряков",
                "first_name":"Тимофей",
                "middle_name":"Олегович",
                "emp_last_name":"Хохряков",
                "emp_first_name":"Тимофей",
                "emp_middle_name":"Олегович",
                "emp_id":36,
                "create_user_department_name":"Управление по развитию персоналом на правах Учебно-методического центра",
                "create_user_organization_name":"Государственное управление РК",
                "create_user_department_full_list":"Государственное управление РК, Департамент кадровой работы, Управление по развитию персоналом на правах Учебно-методического центра",
                "object_name":"REQUEST",
                "object_id": request_id,
                "request_approve_status_id":2,
                "request_approve_status_name":"На утверждении",
                "isApprove":true,
                "approve_comment":"",
                "ar_item_status_id":3
                }
            )

        let responseData = uncryptText(result.text);

        console.log(responseData)

        expect(result.status).toBe(204);

    })


    test('Approve request item performed', async () => {
        const result = await request(app) 
            .post(`/api/1.0/approve/item`)
            .set('Authorization', `Barear ${token}`)
            .send(
                {
                "id":ari_redirect[0],
                "employees":[
                    {
                        "id":36,
                        "last_name":"Хохряков",
                        "first_name":"Тимофей",
                        "middle_name":"Олегович",
                        "department_id":267,
                        "identification_number":"760527350356",
                        "employee_type_id":1,
                        "position_id":148,
                        "employee_department_full_list":"Государственное управление РК, Департамент кадровой работы, Управление по развитию персоналом на правах Учебно-методического центра",
                        "position_name":"Руководитель управления"
                    }
                ],
                "emp_department_name":"Департамент стратегии и оперативного управления",
                "emp_organization_name":"Государственное управление РК",
                "building_name":null,
                "cover_word":null,
                "parent_id":ari3_id,
                "approve_request_id":approve_id,
                "employee_id":36,
                "orders":1,
                "ar_item_type_id":null,
                "request_status_id":14,
                "request_status_name":"На исполнении",
                "approve_date":null,
                "send_date":"2023-04-18 06:37:24.253678",
                "create_date":"2023-04-18 06:37:24.253678",
                "create_user_id":36,
                "update_date":"2023-04-18 06:37:24.253678",
                "update_user_id":36,
                "object_display_type":"Заявление",
                "object_display_subtype":"Объяснительная",
                "object_info":{
                    "request_type":"Объяснительная",
                    "request_type_id":1,
                    "request_sub_type":"Опоздание",
                    "request_sub_type_id":1,
                    "file_id_list":[

                                            ]
                },
                "last_name":"Хохряков",
                "first_name":"Тимофей",
                "middle_name":"Олегович",
                "emp_last_name":"Хохряков",
                "emp_first_name":"Тимофей",
                "emp_middle_name":"Олегович",
                "emp_id":36,
                "create_user_department_name":"Управление по развитию персоналом на правах Учебно-методического центра",
                "create_user_organization_name":"Государственное управление РК",
                "create_user_department_full_list":"Государственное управление РК, Департамент кадровой работы, Управление по развитию персоналом на правах Учебно-методического центра",
                "object_name":"REQUEST",
                "object_id":request_id,
                "request_approve_status_id":14,
                "request_approve_status_name":"На исполнении",
                "total":"264",
                "isApprove":true,
                "approve_comment":"",
                "ar_item_status_id":3
                }
            )

        let responseData = uncryptText(result.text);

        console.log(responseData)

        expect(result.status).toBe(204);

    })

    test('Approve request item confirm', async () => {
        const result = await request(app) 
            .post(`/api/1.0/approve/item`)
            .set('Authorization', `Barear ${token}`)
            .send(
                {
                "id":ari_redirect[1],
                "employees":[
                    {
                        "id":36,
                        "last_name":"Хохряков",
                        "first_name":"Тимофей",
                        "middle_name":"Олегович",
                        "department_id":267,
                        "identification_number":"760527350356",
                        "employee_type_id":1,
                        "position_id":148,
                        "employee_department_full_list":"Государственное управление РК, Департамент кадровой работы, Управление по развитию персоналом на правах Учебно-методического центра",
                        "position_name":"Руководитель управления"
                    }
                ],
                "emp_department_name":"Департамент стратегии и оперативного управления",
                "emp_organization_name":"Государственное управление РК",
                "building_name":null,
                "cover_word":null,
                "parent_id":ari3_id,
                "approve_request_id":approve_id,
                "employee_id":36,
                "orders":2,
                "ar_item_type_id":null,
                "request_status_id":9,
                "request_status_name":"На согласовании",
                "approve_date":null,
                "send_date":"2023-04-18 08:33:39.109997",
                "create_date":"2023-04-18 08:33:38.812243",
                "create_user_id":36,
                "update_date":"2023-04-18 08:33:38.812243",
                "update_user_id":36,
                "object_display_type":"Заявление",
                "object_display_subtype":"Объяснительная",
                "object_info":{
                    "request_type":"Объяснительная",
                    "request_type_id":1,
                    "request_sub_type":"Опоздание",
                    "request_sub_type_id":1,
                    "file_id_list":[

                                            ]
                },
                "last_name":"Хохряков",
                "first_name":"Тимофей",
                "middle_name":"Олегович",
                "emp_last_name":"Хохряков",
                "emp_first_name":"Тимофей",
                "emp_middle_name":"Олегович",
                "emp_id":36,
                "create_user_department_name":"Управление по развитию персоналом на правах Учебно-методического центра",
                "create_user_organization_name":"Государственное управление РК",
                "create_user_department_full_list":"Государственное управление РК, Департамент кадровой работы, Управление по развитию персоналом на правах Учебно-методического центра",
                "object_name":"REQUEST",
                "object_id":request_id,
                "request_approve_status_id":9,
                "request_approve_status_name":"На согласовании",
                "total":"266",
                "isApprove":true,
                "approve_comment":"",
                "ar_item_status_id":3
                }
            )

        let responseData = uncryptText(result.text);

        console.log(responseData)

        expect(result.status).toBe(204);

    })

})
