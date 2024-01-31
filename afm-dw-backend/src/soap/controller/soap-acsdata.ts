import log from '../../config/logger';
import config from '../../config/config';

const soapRequest = require('easy-soap-request');
const { transform } = require('camaro');

async function xmlRequest(url: any, xml: any, headers: any) {
    try {
        const data = await soapRequest({ url, headers, xml }).catch((e: any) => { throw e });
        return data
    } catch (e) {
        log.error(`Error in SOAP Get_ACS_Data -> ${JSON.stringify(e)}`)
        throw e
    }
}

export async function acsdata(bind: any) {
    try {
        const url = `${config.get('soap:service:acsdata')}`;

        const sampleHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            SOAPAction: '',
            Authorization: `Basic ${config.get('soap:headers:auth')}`
        };

        const xml = `
        <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
            <Body>
                <Get_ACS_Data xmlns="http://www.sevenhills.kz/AFM_Integration">
                    <Start_Date>${bind.periodstart}</Start_Date>
                    <End_Date>${bind.periodend}</End_Date>
                    <IIN>${bind.iin}</IIN>
                </Get_ACS_Data>
            </Body>
        </Envelope>  
        `
        const {response: {body: data}} = await xmlRequest(url, xml, sampleHeaders);

        const template = {
            result: ['/soap:Envelope/soap:Body/m:Get_ACS_DataResponse/m:return/m:ACS_Data/m:Row', {
                iin: 'm:IIN',
                date: 'm:Date',
                entry: 'm:Entry'
            }]
        };

                const result = await transform(data, template);

        return result;

            } catch (e) {
        log.info(`Error in Soap acsdata : ${e}`);
    }  
}

