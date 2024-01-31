import log from '../config/logger';
import get_client from '../loaders/database';

export async function unviversal_query(sqlQuery: any, sqlItems: any) {
    let client;
    try {
        client = get_client(); await client.connect();
        let return_data = await client.query(sqlQuery, sqlItems)
        return return_data;
    } catch (err) {
        log.error(err)
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}