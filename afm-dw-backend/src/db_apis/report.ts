import get_client from '../loaders/database';

export async function report_get(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()
        const {rows: reports}: any = await client.query(`select * from ref.global_report_data_v 
        where report_code = '${bind.report_code}'`)
        return reports

    }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function ind_report_get(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()
        const {rows: reports}: any = await client.query(`select * from ref.tmp_ind_report_data 
        where report_type_code = '${bind.report_type_code}'`)
        return reports

    }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function ind_report_detail_get(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()
        const {rows: reports}: any = await client.query(`select * from ref.tmp_ind_rd_detail 
        where parent_id = ${bind.parent_id} order by id`)
        return reports

    }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}