import log from '../../config/logger';
import config from '../../config/config';
import get_client from '../../loaders/database';
import {organization_get_db,organization_post_db,organization_put_db} from '../../db_apis/organization';
import {department} from './soap-department';
import {employee} from './soap-employee';
import {position} from './soap-position';
import { Client } from 'pg';

const soapRequest = require('easy-soap-request');
const { transform } = require('camaro');


async function xmlRequest(url: any, xml: any, headers: any) {
    try {
        const data = await soapRequest({ url, headers, xml }).catch((e: any) => { throw e });
        return data;
    } catch (e) {
        log.error(`Error in SOAP Get_Organizations -> ${JSON.stringify(e)}`)
        throw e;
    }
}

async function organizationCheck(client: Client, isCallInEmployeeSoap: boolean, {name_rus, name_kaz, external_id, identification_number, lang}: any) {
    try {
        let result = await organization_get_db({external_id, identification_number, lang});
        let org_id = null;
        log.info(` ======>  ORGANIZATION`)
        log.info(` ======>  BIN: ${identification_number}`);
        log.info(` ======>  ORGANIZATION`)
        if (result.length) {
            await organization_put_db(client, {name_rus, name_kaz, external_id, identification_number, id: result[0].id});
            org_id = result[0].id;
        } else {
            let get_id: any = await organization_post_db(client, {name_rus, name_kaz, external_id, identification_number, create_user: 'init-soap', update_user: 'init-soap'});
            org_id = get_id.id;
        }

        await department({bin: identification_number, organization_id: org_id});
        await position({bin: identification_number, organization_id: org_id});

        if (!isCallInEmployeeSoap) {
            await employee({BIN: identification_number, IIN: ''}, null, null, null);
        }

    } catch (e) {
        throw e;
    }
}


export async function organization(isCallInEmployeeSoap: boolean = false) {
    try {
        const url = `${config.get('soap:service:organization')}`;

        const sampleHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            SOAPAction: '',
            Authorization: `Basic ${config.get('soap:headers:auth')}`
        };

        const xml = `
        <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
            <Body>
                <Get_Organizations xmlns="http://www.sevenhills.kz/AFM_Integration"/>
            </Body>
        </Envelope>
        `
        const {response: {body: data}} = await xmlRequest(url, xml, sampleHeaders);

        const template = {
            result_status: ['/soap:Envelope/soap:Body/m:Get_OrganizationsResponse/m:return', 'm:Result'],
            description: ['/soap:Envelope/soap:Body/m:Get_OrganizationsResponse/m:return', 'm:Description'],
            organizations_structure: ['/soap:Envelope/soap:Body/m:Get_OrganizationsResponse/m:return/m:Organizations_Structure', {
                organizations: ['m:Organizations', {
                    organization: ['m:Organization', {
                        external_id: 'm:GUID',
                        identification_number: 'm:BIN',
                        name_rus: 'm:NameRus',
                        name_kaz: 'm:NameKaz',
                        organizations: ['m:Organizations', {
                            organization: ['m:Organization', {
                                external_id: 'm:GUID',
                                identification_number: 'm:BIN',
                                name_rus: 'm:NameRus',
                                name_kaz: 'm:NameKaz'
                            }]
                        }]
                    }]
                }]
            }],
        };

                const result = await transform(data, template);

        if (Boolean(JSON.parse(result.result_status[0]))) {
            const organizations = result.organizations_structure[0].organizations[0].organization;

                        for (const item of organizations) {
                let client: Client | null = null;
                try {
                    client = get_client(); await client.connect();

                    await organizationCheck(client, isCallInEmployeeSoap, {name_rus: item.name_rus, name_kaz: item.name_kaz, external_id: item.external_id, identification_number: parseInt(item.identification_number, 10), lang: 'rus'})

                    if (item.organizations.length) {
                        const second_level_org = item.organizations[0].organization;
                        for (const item2 of second_level_org) {
                            await organizationCheck(client, isCallInEmployeeSoap, {name_rus: item2.name_rus, name_kaz: item2.name_kaz,external_id: item2.external_id, identification_number: parseInt(item2.identification_number, 10), lang: 'rus'});

                        }
                    }
                    await client.query('COMMIT');
                } catch (e) {
                    log.error(`Organitzation Soap ==> ${JSON.stringify(e)}`);
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
        log.error(`Error in Soap organization : ${JSON.stringify(e)}`);
    }  
}