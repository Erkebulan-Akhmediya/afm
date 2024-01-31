import { Client, types } from 'pg';
import config from '../config/config';

types.setTypeParser(1114 , function(stringValue) {
    return stringValue;
});
types.setTypeParser(1082 , function(stringValue) {
    return stringValue;
});

export default function get_client(): Client {
    return new Client({
        host: config.get('db:ip'),
        port: 5432,
        database: config.get('db:dbname'),
        user: config.get('db:user'),
        password: config.get('db:password'),
    });
};
