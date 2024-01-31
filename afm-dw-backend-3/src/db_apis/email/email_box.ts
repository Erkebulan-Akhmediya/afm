
import get_client from '../../loaders/database';

export async function email_boxes_get(emailServerId: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `select t1.id, t1.name as display_name, t2.name as system_name, t2.view_priority, t1.icon from ref.email_box t1 
        join ref.email_server_box t2 on t1.id = t2.email_box_id and email_server_id = ${emailServerId}
        order by t2.view_priority asc`

        let {rows: boxes}: any = await client.query(query)

        return boxes

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}
