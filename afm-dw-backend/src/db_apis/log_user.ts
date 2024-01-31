import log from '../config/logger';
import get_client from '../loaders/database';
import moment from 'moment';


export async function log_user_post_db(bind: any): Promise<any> {
    let client;
    try {
        client = get_client(); await client.connect();
        const create_date = moment.utc().add(bind.timez, 'minutes').format('YYYY-MM-DD HH:mm:ss')
        await client.query('BEGIN')
        const query = `insert into hr.log_user_login (user_id, service_type_id, request_ip, create_date) values($1, $2, $3, to_timestamp($4, 'YYYY-MM-DD HH24:min:ss')) returning id`
        const bindLog: any = [
            bind.user_id,
            bind.service_type_id,
            bind.request_ip,
            create_date
        ]
        const {rows: result} = await client.query(query, bindLog).catch(e => { throw e });

        if(!bind.timez) {
            bind.timez = 360
        }
        let today = moment.utc().add(bind.timez, 'minutes').format('YYYYMMDD')

        const bindAggregate: any = [
            bind.user_id,
            bind.service_type_id,
            today
        ]

        let {rows: aggregate} = await client.query(`SELECT * FROM hr.call_agregate where user_id = $1 and service_type_id = $2 and report_period = $3`, bindAggregate)

                bindAggregate.push(create_date)
        bindAggregate.push(create_date)

        if(aggregate.length) {
            await client.query(`UPDATE hr.call_agregate set count = count + 1, update_date = to_timestamp($2, 'YYYY-MM-DD HH24:min:ss') where id = $1`, [aggregate[0].id, create_date])
        } else {
            await client.query(`insert into hr.call_agregate (user_id, service_type_id, count, report_period, create_date, update_date) values($1, $2, 1, $3, $4, $5) `, bindAggregate)
        }

        await client.query('COMMIT')
        return result;
    } catch (err) {
        if(client) {
            await client.query('ROLLBACK')
        }
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}