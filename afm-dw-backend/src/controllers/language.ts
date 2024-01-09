import express from 'express';
import {language_get_db} from '../db_apis/language';
import {user_lang_put} from '../db_apis/user';

export async function language_user_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const language = await language_get_db({lang_code: req.params.lang_code});
        await user_lang_put({language_id: !Array.isArray(language) ? language.id : null, user_id: req.userinfo.user_id});

        res.status(204).end();
    } catch (error) {
        next(error)
    }
}