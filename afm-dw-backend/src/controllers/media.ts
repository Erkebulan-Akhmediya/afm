import express from 'express';
import {file_get_db} from '../db_apis/file';
import {get_media} from '../utils/file-api';

export async function media_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let fileData = await file_get_db(req)

                if(fileData) {
            await get_media(fileData, req, res);
        } else {
            res.status(404).json({
                err: 0,
                errMsg: 'Не найдена'
            })
        }
    } catch (error) {
        next(error)
    }
}