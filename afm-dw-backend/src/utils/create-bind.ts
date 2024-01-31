import {Request} from 'express';

export default function createBind(req: Request) {
    return Object.fromEntries(
        Object.entries(
            Object.assign({}, req.params ,req.query, req.body, req.userinfo, {lang: req.lang, lang_id: req.lang_id}, req.cookies)).map(([key, value]) => [key.toLowerCase(), value]))
}