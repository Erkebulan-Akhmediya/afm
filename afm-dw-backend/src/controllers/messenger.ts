import express from 'express';
import { get_file_id_db, message_file_post_db } from '../db_apis/file';
import {chats_get, chats_hide, chat_create, chat_hidden_show, chat_users_edit, chat_users_get} from '../db_apis/messenger/chats';
import {chat_messages_get, chat_messages_post, chat_messages_read, chat_messages_unread_get, delete_message, get_last_messages} from '../db_apis/messenger/messages'
import { get_messenger_users } from '../db_apis/messenger/users';
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import { post_file_new } from '../utils/file-api';
import { Client } from 'pg';

export async function get_chats (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const chats = await chats_get(bind);

        res.locals.data = {
            statusCode: 200,
            data: chats
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function post_chats (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

                const data = await chat_create(bind);

               res.locals.data = {
            statusCode: 201,
            data: {id: data}
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_messages (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await chat_messages_get(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function post_message (req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        const bind: any = createBind(req);           

                const data = await chat_messages_post(bind);
        client = get_client(); await client.connect();
        if (req.files.file != undefined) {
            req.file = req.files.file[0]
        } else {
            req.file = null
        }

                let dataFile: any
        if(req.file) {
            dataFile = await message_file_post_db(req, client, data.id)
            await post_file_new(req, dataFile.id, res)
        }

               res.locals.data = {
            statusCode: 201,
            data: {id: data}
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function read_message (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

                const data = await chat_messages_read(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_unreaded_message (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

                const data = await chat_messages_unread_get(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_chat_users (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await chat_users_get(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function hide_chat (req: express.Request, res:express.Response, next: express.NextFunction){
    try {
        const bind: any = createBind(req);
        const data = await chats_hide(bind)
        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next()
    } catch (error) {
        next(error)
    } 
}

export async function show_hidden_chat (req: express.Request, res:express.Response, next: express.NextFunction){
    try {
        const bind: any = createBind(req);
        const data = await chat_hidden_show(bind)
        res.locals.data = {
            statusCode: 200,
            data: data
        }
        next()
    } catch (error) {
        next(error)
    } 
}

export async function edit_chat_users (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await chat_users_edit(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_mess_users (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await get_messenger_users(bind);

               res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}
export async function post_message_file (req: any, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        if(req.body.mess_id){
            const bind: any = createBind(req);
            client = get_client(); await client.connect();
            if (req.files.file != undefined) {
                req.file = req.files.file[0]
            } else {
                req.file = null
            }

            let dataFile: any
            if(req.file) {
                dataFile = await message_file_post_db(req, client, req.body.mess_id)
                await post_file_new(req, dataFile.id, res)
            }
            res.locals.data = {
                statusCode: 201,
                data: {id: dataFile.id}
            }
            next();
        } else {
            var data = await get_file_id_db()
            res.locals.data = {
                statusCode: 200,
                data: {id: data}
            }
            next()
        }
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}


export async function message_delete (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

                const data = await delete_message(bind);

               res.locals.data = {
            statusCode: 200,
            data: {id: data}
        }

        next();
    } catch (error) {
        next(error)
    }
}
export async function last_messages(req: express.Request, res: express.Response,  next: express.NextFunction){
    try{
        const bind: any = createBind(req);  
        var data = await get_last_messages(bind)
        res.locals.data = {
            statusCode: 200,
            data: {chats: data}
        }
        next()
    } catch(err){
       next(err)
    } 
}
