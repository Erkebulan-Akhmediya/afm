import express from 'express';
import {entry_get_db,entry_put_db} from '../db_apis/entry';
import {lov_post_db} from '../db_apis/lov';
import createBind from '../utils/create-bind';
import {participant_put_db, participant_get_db, participant_post_db} from '../db_apis/participant';

export async function entry_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const entrys = await entry_get_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: entrys
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function entry_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);      
        const entry_id = await lov_post_db({
            table_name: 'hr.entry',
            name: bind.name,
            description: bind.description,
            place: bind.place,
            is_all_day: bind.is_all_day,
            entry_type_id: bind.entry_type_id,
            entry_status_id: bind.entry_status_id,
            start_date: bind.start_date,
            end_date: bind.end_date
        });

        for (const i of bind.participants) {
            await lov_post_db({
                table_name: 'hr.participant',
                employee_id: i.employee_id,
                entry_id: entry_id.id,
                is_organizer: i.is_organizer
            })
        }

        res.locals.data = {
            statusCode: 200,
            data: {
                id: entry_id.id
            }
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function entry_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);      
        await entry_put_db(Object.assign({}, bind, {is_active: true}));

        await participant_put_db({entry_id: bind.entry_id, is_active: null})
        await Promise.all(bind.participantslist.map(async (item: any) => { 
            try {
                let perticipant = await participant_get_db({entry_id: bind.entry_id, employee_id: item.id});
                if (perticipant.length) {
                    await participant_put_db({entry_id: bind.entry_id, employee_id: item.id, is_active: true})
                } else {
                    await participant_post_db({entry_id: bind.entry_id, employee_id: item.id, is_organizer: item.is_organizer ? item.is_organizer : null})
                }
            } catch (e) {
                console.log(e)
            }
        }))

        res.status(204).end();
    } catch (error) {
        next(error);
    }
}

export async function entry_delete (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);      
        await entry_put_db({is_active: null, id: bind.id});

        res.status(204).end();
    } catch (error) {
        next(error);
    }
}