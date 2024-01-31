import log from '../../config/logger';
import config from '../../config/config';
import { lov_post_db } from '../../db_apis/lov';

const soapRequest = require('easy-soap-request');
const parseString = require('xml2js').parseString;

async function xmlRequest(url: any, xml: any, headers: any) {
    try {
        const data = await soapRequest({ url, headers, xml }).catch((e: any) => { throw e });
        return data
    } catch (e) {
        log.error(`Error in SOAP xmlRequest salarylist -> ${e}`)
        throw e
    }
}

export async function salarylist(bind: any) {
    let xml : any, responceData : any

    try {
        const url = `${config.get('soap:service:salarylist')}`;

        const sampleHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            SOAPAction: '',
            Authorization: `Basic ${config.get('soap:headers:auth')}`
        };

        let start_month = parseInt(bind.start_month, 10);
        let end_month = parseInt(bind.end_month, 10);

        xml = `
        <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"> 
            <Body> 
                <getAllSalaryLists xmlns="http://www.sevenhills.kz/SalaryList"> 
                    <PeriodStart>${parseInt(bind.start_year, 10)}-${start_month < 10 ? `0${start_month}` : start_month}</PeriodStart> 
                    <PeriodEnd>${parseInt(bind.end_year, 10)}-${end_month < 10 ? `0${end_month}` : end_month}</PeriodEnd> 
                    <BIN></BIN> 
                    <IIN>${bind.iin}</IIN> 
                </getAllSalaryLists> 
            </Body> 
        </Envelope> 
        `
        const {response: {body: data}} = await xmlRequest(url, xml, sampleHeaders);
        responceData = data

        return new Promise( (resolve, reject) => {
            parseString(data, async function (err: any, result: any) {
                if (!err) {
                    const resXml = result['soap:Envelope']['soap:Body'][0]['m:getAllSalaryListsResponse'][0]['m:return'][0]['m:SalaryList']
                    let salaryList = []
                    if (resXml && resXml.length) {
                        salaryList = resXml.reduce((acc: any, item: any) => { 
                            const obj: any = {
                                period: item['m:Period'][0],
                                organization: item['m:Organization'][0],
                                department: item['m:Department'][0],
                                position: item['m:Position'][0],
                                category: item['m:Category'][0],
                                rank: item['m:Rank'][0],
                                rank_sum: item['m:RankSum'][0],
                                employee: item['m:Employee'][0],
                                iin: item['m:IIN'][0],
                                based_salary: item['m:BasedSalary'][0],
                                correction_point_expected: item['m:CorrectionPointExp'][0],
                                salary: item['m:Salary'][0],
                                accrual_list: [],
                                retention_list: [],
                                pre_payment_list:[],
                                compensation_list: [], 
                                compensation: item['m:Compensation'][0],
                                payment_list: [],
                                all_accrual: item['m:AllAccrual'][0],
                                all_retention: item['m:AllRetention'][0],
                                all_payment: item['m:AllPayment'][0],
                                company_debt_start: item['m:CompanyDebtStart'][0],
                                employee_debt_start: item['m:EmployeeDebtStart'][0],
                                company_debt_end: item['m:CompanyDebtEnd'][0],
                                employee_debt_end: item['m:EmployeeDebtEnd'][0]
                            };

                            if (item['m:AccrualList'][0]) {
                                obj.accrual_list = item['m:AccrualList'][0]['m:Data'].reduce((acc: any, item: any) => { 
                                    acc.push({
                                        number: item['m:Number'][0],
                                        name: item['m:Name'][0],
                                        sum: item['m:Sum'][0],
                                        period: {
                                            start_date: item['m:Period'][0]['m:StartDate'][0],
                                            end_date: item['m:Period'][0]['m:EndDate'][0],
                                        },
                                        days: item['m:Days'][0],
                                        prepayment: item['m:Prepayment'][0],
                                        rate: item['m:Rate'][0]
                                    })
                                    return acc;
                                }, [])
                            }

                            if (item['m:RetentionList'][0]) {
                                obj.retention_list = item['m:RetentionList'][0]['m:Data'].reduce((acc: any, item: any) => { 
                                    acc.push({
                                        number: item['m:Number'][0],
                                        name: item['m:Name'][0],
                                        sum: item['m:Sum'][0],
                                        period: {
                                            start_date: item['m:Period'][0]['m:StartDate'][0],
                                            end_date: item['m:Period'][0]['m:EndDate'][0],
                                        },
                                        prepayment: item['m:Prepayment'][0]
                                    })
                                    return acc;
                                }, [])
                            }

                            if (item['m:PrePaymentList'][0]) {
                                obj.pre_payment_list = item['m:PrePaymentList'][0]['m:Data'].reduce((acc: any, item: any) => { 
                                    acc.push({
                                        number: item['m:Number'][0],
                                        name: item['m:Name'][0],
                                        sum: item['m:Sum'][0],
                                        prepayment: item['m:Prepayment'][0]
                                    })
                                    return acc;
                                }, [])
                            }

                            if (item['m:CompensationList'][0]) {
                                obj.compensation_list = item['m:CompensationList'][0]['m:Data'].reduce((acc: any, item: any) => { 
                                    acc.push({
                                        number: item['m:Number'][0],
                                        name: item['m:Name'][0]
                                    })
                                    return acc;
                                }, [])
                            }

                                                        if (item['m:PaymentList'][0]) {
                                obj.payment_list = item['m:PaymentList'][0]['m:Data'].reduce((acc: any, item: any) => { 
                                    acc.push({
                                        number: item['m:Number'][0],
                                        name: item['m:Name'][0],
                                        sum: item['m:Sum'][0],
                                        prepayment: item['m:Prepayment'][0]
                                    })
                                    return acc;
                                }, [])
                            }

                            acc.push(obj);
                            return acc;
                        }, [])

                                            }

                    await lov_post_db({
                        table_name: 'app.integration_log',
                        code: 'soap-SalaryList',
                        request_data: xml,
                        responce_data: typeof responceData == 'object' ? JSON.stringify(responceData) : responceData,
                        invoke_date: new Date().toISOString(),
                    })

                    resolve(salaryList);
                } else {
                    throw err
                }
            })
        })

            } catch (error) {
        await lov_post_db({
            table_name: 'app.integration_log',
            code: 'soap-SalaryList',
            request_data: xml,
            responce_data: typeof responceData == 'object' ? JSON.stringify(responceData) : responceData,
            invoke_date: new Date().toISOString(),
            error_data: typeof error == 'object' ? JSON.stringify(error) : error,
        })

        log.error(`Error in Soap SalaryList : ${typeof error == 'object' ? JSON.stringify(error) : error}`);
    }  
}