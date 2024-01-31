import get_client from '../loaders/database';
import requestip from 'request-ip';
import createBind from '../utils/create-bind';

export async function call_history (req : any, res : any, next : any) {
    let client
    const clientIp = requestip.getClientIp(req)
    const bind: any = createBind(req); 

        try {
        client = get_client(); await client.connect();

        if (bind.role) {
            delete bind.role;
        }

        let isExistsRoutePath = false
        if (req.route) {
            if (req.route.path) {
                isExistsRoutePath = true

                if (req.route.path == '/file-link/:id?') {
                    return next();
                }
            }
        }

        let bindData = [
            bind.user_id ? bind.user_id : null,
            bind.username ? bind.username : null,
            isExistsRoutePath ? req.route.path : req.originalUrl,
            req.method,
            JSON.stringify(bind),
            clientIp
        ]

        await client.query(`insert into hr.call_history (user_id, username, req_path, req_method, req_data, ip_address) values($1, $2, $3, $4, $5, $6)`, bindData)

                next()

    } catch (error) {
        throw error
    } finally {
        if (client) {
            await client.end()
        } 
    }
}