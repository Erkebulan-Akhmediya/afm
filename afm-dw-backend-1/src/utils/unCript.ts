import * as crypto from 'crypto-js';

export function unCript(req: any, res: any, next: any) {
    for (let param in req.params) {
        if(req.params[param] && req.params[param] != parseInt(req.params[param], 10)) {
            let bytes = crypto.AES.decrypt(req.params[param].replace(/SiZd8muVgR/g, '/'), 'secret-key');
            let originalText = bytes.toString(crypto.enc.Utf8);
            req.params[param] = JSON.parse(originalText);
        }
    }
    next()
}