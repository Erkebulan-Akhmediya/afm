import express from "express";
import createBind from "../utils/create-bind";
import { appeal_create_db, appeal_get_db, appeal_types_get_db, appeal_change_status_db, appeal_edit_db, appeal_history_db, appeal_vote_create_db, appeal_votes_db, expert_group_create_db, add_expert_db, delete_expert_db, one_appeal_get_db, public_appeal_get_db, expert_group_delete_db, add_expert_adviser_db, get_expert_adviser_db, appeal_rating_get_db, add_expert_db_ref, del_expert_db_ref, appeal_get_total_db, appeal_get_db_for_xlsx } from "../db_apis/appeal";
import get_client from '../loaders/database';
import log from '../config/logger';

import * as XLSX from 'xlsx'
import { Client } from "pg";
var contentDisposition = require('content-disposition')
var Readable = require('stream').Readable

function bufferToStream(buffer: any): any { 
  let stream: any = new Readable()
  stream.push(buffer)
  stream.push(null)

  return stream
}

export async function get_appeal_types (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req);           

        const data = await appeal_types_get_db(bind, client);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            client.end()
        }       
    }
}


export async function get_appeal (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req);           

        const data = await appeal_get_db(bind, client);
        const total = await appeal_get_total_db(bind)
        res.set('Access-Control-Expose-Headers', 'total')
        res.set('total', total);
        res.locals.data = {
            statusCode: 200,
            data: data
        }



                            next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            client.end()
        }
    }
}


export async function get_one_appeal (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req);           

        const data = await one_appeal_get_db(bind, client);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            client.end()
        }
    }
}


export async function create_appeal (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           
        const data = await appeal_create_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function change_status_appeal (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await appeal_change_status_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function edit_appeal (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await appeal_edit_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_appeal_history (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);   
        const data = await appeal_history_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function post_appeal_vote (req: express.Request, res: express.Response, next: express.NextFunction) {

        try {
        const bind: any = createBind(req);   



                                const data = await appeal_vote_create_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_appeal_votes (req: express.Request, res: express.Response, next: express.NextFunction) {

        try {
        const bind: any = createBind(req);   



                                const data = await appeal_votes_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function create_expert_group (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await expert_group_create_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function delete_expert_group (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await expert_group_delete_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function add_expert (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await add_expert_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function del_expert (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await delete_expert_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_public_appeal (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await public_appeal_get_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}



export async function add_expert_adviser (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await add_expert_adviser_db(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function get_expert_adviser (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await get_expert_adviser_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}

export async function get_appeal_rating (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await appeal_rating_get_db(bind);

        res.locals.data = {
            statusCode: 200,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function add_expert_ref (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await add_expert_db_ref(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function del_expert_ref (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const bind: any = createBind(req);           

        const data = await del_expert_db_ref(bind);

        res.locals.data = {
            statusCode: 201,
            data: data
        }

        next();
    } catch (error) {
        next(error)
    }
}


export async function appeals_create_xlsx (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: any
    try {
        client = get_client(); await client.connect()
        const bind: any = createBind(req)

        const appeals = await appeal_get_db_for_xlsx(bind);


        const bookType: string = "xls"
        let wb: XLSX.WorkBook = XLSX.utils.book_new()
        let header = [
            '№ Заявки', 
            'Название',
            'Подтип',
            'Описание', 
            'Пути решения', 
            'Ожидаемый результат', 
            'Дата регистрации',
            'Исполнители',
            'Срок исполнения',
            'Примечание',
            'Статус', 
            'Инициатор',
            'Организация',
            'Список участников ЭС',
            'Проголосовавшие',
            'Не проголосовавшие'

                    ]

        let ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(appeals);

                XLSX.utils.sheet_add_aoa(ws, [header], { origin: "A1" });





                               if (appeals.length == 0) {
            XLSX.utils.sheet_add_aoa(ws, [['Нет данных']], {origin: -1})

                   } else {

            let title_max_width = appeals.reduce((w, r) => Math.max(w, r['Название'].length), 10);
            let solutions_max_width = appeals.reduce((w, r) => Math.max(w, r['Пути решения'].length), 10);
            let description_max_width = appeals.reduce((w, r) => Math.max(w, r['Описание'].length), 10);
            let rezult_max_width = appeals.reduce((w, r) => Math.max(w, r['Ожидаемый результат'].length), 10);
            if (!ws["!cols"]) ws["!cols"] = []
            ws["!cols"].push(
                { wch: 10 }, 
                { wch: title_max_width>=15?title_max_width:15 }, 
                { wch: 40 }, 
                { wch: description_max_width>=15?description_max_width:15 }, 
                { wch: solutions_max_width>=15?solutions_max_width:15 }, 
                { wch: rezult_max_width>=17?rezult_max_width:17 }, 
                { wch: 16 }, 
                { wch: 45 }, 
                { wch: 15 }, 
                { wch: 40 }, 
                { wch: 30 }, 
                { wch: 30 }, 
                { wch: 40 }, 
                { wch: 100 }, 
                { wch: 70 }, 
                { wch: 70 }, 

                            );



                        if (!ws["!rows"]) ws["!rows"] = []
            ws['!rows'].push (
                {hpt : 18},
                ) 

                for(let el of appeals) {
                    if(el.experts.length!=0) {
                        let len = el.experts.split('\n').length
                        ws['!rows'].push ({hpt : 15*(len+1)})
                    } else {
                        ws['!rows'].push ({hpt : 15})
                    }

                                    }
        }


               XLSX.utils.book_append_sheet(wb, ws, 'Усыныс аланы')

        let payload: string = ""

        payload = XLSX.write(wb, {bookType: "xlsx", type:"buffer"})

        const stream = bufferToStream(payload)

        res.setHeader('content-disposition', contentDisposition(`Усыныс аланы.xlsx`))
        stream.pipe(res)

    } catch (err) {
        log.error(`Error in appeals_create_xls -> ${JSON.stringify(err)}`)
        console.log(`Error in appeals_create_xls -> ${JSON.stringify(err)}`)
    } finally {
        if (client) {
            await client.end()
        }
    }
}