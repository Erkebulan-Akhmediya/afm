import log from '../../config/logger';
import config from '../../config/config';
import { lov_post_db } from '../../db_apis/lov';

const soapRequest = require('easy-soap-request');
const parseString = require('xml2js').parseString;
const { transform } = require('camaro');

async function xmlRequest(url: any, xml: any, headers: any) {
    try {
        const data = await soapRequest({ url, headers, xml }).catch((e: any) => { throw e });
        return data
    } catch (e) {
        log.error(`Error in SOAP xmlRequest invOcList -> ${e}`)
        throw e
    }
}

export async function invOcList(bind: any) {
    let xml, responceData

    try {
        const url = `${config.get('soap:service:invoc')}`;

        const sampleHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            SOAPAction: '',
            Authorization: `Basic ${config.get('soap:headers:auth')}`
        };


        xml = `
        <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"> 
            <Body> 
                <getList xmlns="http://www.sevenhills.kz/OC"> 
                    <Date>${bind.date}</Date> 
                    <BIN>${bind.bin}</BIN> 
                    <IIN>${bind.iin}</IIN> 
                </getList> 
            </Body> 
        </Envelope> 
        `
        const {response: {body: data}} = await xmlRequest(url, xml, sampleHeaders);
        responceData = data

        const template = {
            result: ['/soap:Envelope/soap:Body/m:getListResponse/m:return/m:ListOC/m:Row', {
                name_oc: 'm:Name',
                inventory_number: 'm:InvNumber',
                cost: 'm:Price',
                serial_number: 'm:SerialNumber'
            }]
        };

        const {result: result} = await transform(data, template);

        await lov_post_db({
            table_name: 'app.integration_log',
            code: 'soap-ListOC',
            request_data: xml,
            responce_data: typeof responceData == 'object' ? JSON.stringify(responceData) : responceData,
            invoke_date: new Date().toISOString(),
        })

        return result

            } catch (error) {

        await lov_post_db({
            table_name: 'app.integration_log',
            code: 'soap-ListOC',
            request_data: xml,
            responce_data: typeof responceData == 'object' ? JSON.stringify(responceData) : responceData,
            invoke_date: new Date().toISOString(),
            error_data: typeof error == 'object' ? JSON.stringify(error) : error,
        })

        log.error(`Error in SOAP invOcList : ${typeof error == 'object' ? JSON.stringify(error) : error}`);

        throw error
    }  
}