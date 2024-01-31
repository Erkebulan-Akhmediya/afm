import log from '../../config/logger';
import config from '../../config/config';
import { lov_post_db } from '../../db_apis/lov';

const soapRequest = require('easy-soap-request');
const { transform } = require('camaro');

async function xmlRequest(url: any, xml: any, headers: any) {
    try {
        const data = await soapRequest({ url, headers, xml }).catch((e: any) => { throw e });
        return data
    } catch (e) {
        log.error(`Error in SOAP xmlRequest opvList -> ${e}`)
        throw e
    }
}

export async function opvList(bind: any) {
    let xml, responceData

    try {
        const url = `${config.get('soap:service:opvlists')}`;

        const sampleHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            SOAPAction: '',
            Authorization: `Basic ${config.get('soap:headers:auth')}`
        };

        xml = `
        <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
            <Body>
                <getOPVLists xmlns="http://www.sevenhills.kz/OPVLists">
                    <PeriodStart>${bind.periodstart}</PeriodStart>
                    <PeriodEnd>${bind.periodend}</PeriodEnd>
                    <IIN>${bind.iin}</IIN>
                </getOPVLists>
            </Body>
        </Envelope>  
        `
        const {response: {body: data}} = await xmlRequest(url, xml, sampleHeaders);
        responceData = data

        const template = {
            result: ['/soap:Envelope/soap:Body/m:getOPVListsResponse/m:return/m:OPVList', {
                document: 'm:Document',
                period: 'm:Period',
                organization: 'm:Organization',
                sum: 'm:Sum',
                subdivision: 'm:Subdivision',
                balance_start: 'm:BalanceStart',
                balance_end: 'm:BalanceEnd',
                subtract: 'm:Subtract',
            }]
        };

                const result = await transform(data, template);

        await lov_post_db({
            table_name: 'app.integration_log',
            code: 'soap-OPVLists',
            request_data: xml,
            responce_data: typeof responceData == 'object' ? JSON.stringify(responceData) : responceData,
            invoke_date: new Date().toISOString(),
        })

        return result;

            } catch (error) {

        await lov_post_db({
            table_name: 'app.integration_log',
            code: 'soap-OPVLists',
            request_data: xml,
            responce_data: typeof responceData == 'object' ? JSON.stringify(responceData) : responceData,
            invoke_date: new Date().toISOString(),
            error_data: typeof error == 'object' ? JSON.stringify(error) : error,
        })

        log.error(`Error in SOAP OPVLists : ${typeof error == 'object' ? JSON.stringify(error) : error}`);
    }  
}