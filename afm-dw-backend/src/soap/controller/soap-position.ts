import log from '../../config/logger';
import config from '../../config/config';
import get_client from '../../loaders/database';
import { Client } from 'pg';
import * as positionDbApi from '../../db_apis/positions';

const soapRequest = require('easy-soap-request');
const { transform } = require('camaro');


async function xmlRequest(url: any, xml: any, headers: any) {
    try {
        const data = await soapRequest({ url, headers, xml }).catch((e: any) => { throw e });
        return data
    } catch (e) {
        log.error(`Error in SOAP Get_Positions -> ${JSON.stringify(e)}`)
        throw e
    }
}

async function positionCheck(client: Client, {external_id, name_rus, name_kaz, organization_id}: any) {
    try {
        const get_position = await positionDbApi.position_get_db({external_id, lang: 'rus'});

                if (get_position.length) {
            await positionDbApi.position_put_db(client, {name_rus, name_kaz, organization_id, id: get_position[0].id}).catch(e => { throw e });
        } else {
            await positionDbApi.position_post_db(client, {name_rus, name_kaz, organization_id, external_id, create_user: 'init-soap', update_user: 'init-soap'}).catch(e => { throw e });;
        }

    } catch (e) {
        log.error(`Position in Func Soap ==> ${JSON.stringify(e)}`);
    }
}


export async function position(bind?: any) {
    try {
        const url = `${config.get('soap:service:position')}`;

        const sampleHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            SOAPAction: '',
            Authorization: `Basic ${config.get('soap:headers:auth')}`
        };

        const xml = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:afm="http://www.sevenhills.kz/AFM_Integration">
            <soap:Header/>
            <soap:Body>
                <afm:Get_Positions>
                    <afm:BIN>${bind.bin}</afm:BIN>
                </afm:Get_Positions>
            </soap:Body>
        </soap:Envelope>
        `
        const {response: {body: data}} = await xmlRequest(url, xml, sampleHeaders);

        const template = {
            result_status: ['/soap:Envelope/soap:Body/m:Get_PositionsResponse/m:return', 'm:Result'],
            description: ['/soap:Envelope/soap:Body/m:Get_PositionsResponse/m:return', 'm:Description'],
            organizations_positions: ['/soap:Envelope/soap:Body/m:Get_PositionsResponse/m:return', {
                organization: [
                    'm:Organization_Positions', {
                        external_id_packet: 'm:GUID_Paket',
                        external_id: 'm:GUID',
                        identification_number: 'm:BIN',
                        name_rus: 'm:NameRus',
                        name_kaz: 'm:NameKaz',
                        positions: [
                            'm:Positions', {
                                position: ['m:Position', {
                                    external_id: 'm:GUID',
                                    name_rus: 'm:NameRus',
                                    name_kaz: 'm:NameKaz'
                                }]
                            }
                        ]
                    }
                ]
            }],
        };

                const result = await transform(data, template);

                if (Boolean(JSON.parse(result.result_status))) {
            const positions = result.organizations_positions[0].organization[0].positions[0].position;
            for (const item of positions) {
                let client;
                try {
                    client = get_client(); await client.connect();

                    await positionCheck(client, {external_id: item.external_id, name_rus: item.name_rus, name_kaz: item.name_kaz, organization_id: bind.organization_id});

                    await client.query('COMMIT');
                } catch (e) {
                    log.error(`Position Soap ==> ${JSON.stringify(e)}`);
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
        return true;
    } catch (e) {
        log.info(`Error in Soap position : ${JSON.stringify(e)}`);
    }  
}