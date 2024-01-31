import log from '../../config/logger';
import config from '../../config/config';
import get_client from '../../loaders/database';
import { Client } from 'pg';

const soapRequest = require('easy-soap-request');
const { transform } = require('camaro');

import {department_get_db,department_put_db,department_post_db} from '../../db_apis/departament';

async function xmlRequest(url: any, xml: any, headers: any) {
    try {
        const data = await soapRequest({ url, headers, xml }).catch((e: any) => { throw e });
        return data
    } catch (e) {
        log.error(`Error in SOAP Get_Departments -> ${JSON.stringify(e)}`)
        throw e
    }
}

async function departmentCheck(client: Client, {external_id, name_rus, name_kaz, organization_id, parent_id}: any) {
    try {

        let get_dep = await department_get_db({external_id, lang: 'rus'});
        let dep_id = null;

        if (get_dep.length) {
            await department_put_db(client, {name_rus, name_kaz, organization_id, parent_id, external_id, id: get_dep[0].id})
            dep_id = get_dep[0].id;
        } else {
            let get_id = await department_post_db(client, {name_rus, name_kaz, organization_id, parent_id, external_id, create_user: 'init-soap', update_user: 'init-soap'});
            dep_id = get_id.id
        }

        return dep_id;
    } catch (e) {
        console.log(e)
        throw e
    }
}


export async function department(bind?: any) {
    try {
        const url = `${config.get('soap:service:department')}`;

        const sampleHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': '',
            'Authorization': `Basic ${config.get('soap:headers:auth')}`
        };

        const xml = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:afm="http://www.sevenhills.kz/AFM_Integration">
            <soap:Header/>
            <soap:Body>
                <afm:Get_Departments>
                    <afm:BIN>${bind.bin}</afm:BIN>
                </afm:Get_Departments>
            </soap:Body>
        </soap:Envelope>
        `
        const { response: { body: data } } = await xmlRequest(url, xml, sampleHeaders);

                const template = {
            result_status: ['/soap:Envelope/soap:Body/m:Get_DepartmentsResponse/m:return', 'm:Result'],
            description: ['/soap:Envelope/soap:Body/m:Get_DepartmentsResponse/m:return', 'm:Description'],
            organizations_departments: ['/soap:Envelope/soap:Body/m:Get_DepartmentsResponse/m:return', {
                organization: [
                    'm:Organization_Departments', {
                        external_id_packet: 'm:GUID_Paket',
                        external_id: 'm:GUID',
                        identification_number: 'm:BIN',
                        name_rus: 'm:NameRus',
                        name_kaz: 'm:NameKaz',
                        departments: [
                            'm:Departments', {
                                department: ['m:Department', {
                                    external_id: 'm:GUID',
                                    name_rus: 'm:NameRus',
                                    name_kaz: 'm:NameKaz',
                                    departments: [
                                        'm:Departments', {
                                            department: ['m:Department', {
                                                external_id: 'm:GUID',
                                                name_rus: 'm:NameRus',
                                                name_kaz: 'm:NameKaz',
                                                departments: [
                                                    'm:Departments', {
                                                        department: ['m:Department', {
                                                            external_id: 'm:GUID',
                                                            name_rus: 'm:NameRus',
                                                            name_kaz: 'm:NameKaz',
                                                            departments: [
                                                                'm:Departments', {
                                                                    department: ['m:Department', {
                                                                        external_id: 'm:GUID',
                                                                        name_rus: 'm:NameRus',
                                                                        name_kaz: 'm:NameKaz'
                                                                    }]
                                                                }
                                                            ]
                                                        }]
                                                    }
                                                ]
                                            }]
                                        }
                                    ]
                                }]
                            }
                        ]
                    }
                ]
            }],
        };

                const result = await transform(data, template);

        if (Boolean(JSON.parse(result.result_status[0]))) {
            const departments = result.organizations_departments[0].organization[0].departments[0].department;

            for (const item of departments) {
                let client: Client | null = null;
                try {
                    client = get_client(); await client.connect();

                    let parent_dep_id = await departmentCheck(client, {external_id: item.external_id, name_rus: item.name_rus, name_kaz: item.name_kaz, organization_id: bind.organization_id, parent_id: null});;

                    const secondLevel = item.departments[0].department
                    for (const item2 of secondLevel) {
                        try {
                            let second_parent_id = await departmentCheck(client, {external_id: item2.external_id, name_rus: item2.name_rus, name_kaz: item2.name_kaz, organization_id: bind.organization_id, parent_id: parent_dep_id});

                                                            if (item2.departments.length) {
                                const thirdLevel = item2.departments[0].department;

                                for (const item3 of thirdLevel) {
                                    try {
                                        let third_parent_id = await departmentCheck(client, {external_id: item3.external_id, name_rus: item3.name_rus, name_kaz: item3.name_kaz, organization_id: bind.organization_id, parent_id: second_parent_id});

                                                                                const fourthLevel = item3.departments.length ? item3.departments[0].department : [];

                                                                                for (const item4 of fourthLevel) {
                                            try {
                                                await departmentCheck(client, {external_id: item4.external_id, name_rus: item4.name_rus, name_kaz: item4.name_kaz, organization_id: bind.organization_id, parent_id: third_parent_id});
                                            } catch (e) {
                                                log.error(`Department Soap 3 ==> ${JSON.stringify(e)}`);
                                            }
                                        }
                                    } catch (e) {
                                        log.error(`Department Soap 2 ==>${JSON.stringify(e)}`);
                                    }
                                }
                            }
                        } catch (e) {
                            log.error(`Department Soap 1 ==> ${JSON.stringify(e)}`);
                        }
                    }

                    await client.query('COMMIT');
                } catch (e) {
                    log.error(`Department Soap ==> ${JSON.stringify(e)}`);
                    if (client) {
                        await client.query('ROLLBACK');
                    }
                } finally {
                    if (client) {
                        await client.end();
                    }
                }
            }
        }
    } catch (e) {
        log.error(`Error in Soap department : ${JSON.stringify(e)}`);
    }  
}