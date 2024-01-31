import express from 'express';
import {entity_type_get_db, entity_table_get_db, declination_get_db, language_get_db, gender_get_db, inflected_word_put_db, inflected_word_post_db, inflected_word_table_get_db, entity_table_get_uniq_db} from '../db_apis/inflected_word';
import get_client from '../loaders/database';
import log from '../config/logger';
import { Client } from 'pg';

export async function inflected_word_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let result =  await inflected_word_table_get_db(client, {entity_type_name: req.query.entity_type_name, entity_type_id: req.params.id, lang_code: req.query.lang})
        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();    
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller entity_type_get');
            }
        }
    }
}

export async function entity_type_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let result =  await entity_type_get_db(client)

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller entity_type_get');
            }
        }
    }
}

export async function declination_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let result =  await declination_get_db(client)

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller declination_get');
            }
        }
    }
}

export async function language_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let result =  await language_get_db(client)

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller declination_get');
            }
        }
    }
}

export async function gender_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let result =  await gender_get_db(client, {lang_code: req.query.lang})

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller declination_get');
            }
        }
    }
}

export async function entity_table_word_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let result =  await entity_table_get_db(client, {entity_type_name: req.query.entity_type_name, entity_type_id: req.params.id, lang_code: req.query.lang})
        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller entity_table_word_get');
            }
        }
    }
}

export async function inflected_word_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind = {
            word: req.body.word,
            declination_word: req.body.declination_word,
            declination_id: req.body.declination_id,
            external_id: req.body.external_id,
            entity_type_id: req.body.entity_type_id,
            gender_id: req.body.gender_id,
            language_id: req.body.language_id,
            update_user: req.userinfo.user_name
        }
        let result =  await inflected_word_put_db(client, bind, req.params.id)
        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 204,
            data: result
        }

        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK');
        }
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller entity_table_word_get');
            }
        }
    }
}

export async function inflected_word_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        let bind: any = {
            word: req.body.word,
            declination_word: req.body.declination_word,
            declination_id: req.body.declination_id,
            external_id: req.body.external_id,
            entity_type_id: req.body.entity_type_id,
            gender_id: req.body.gender_id,
            language_id: req.body.language_id,
            update_user: req.userinfo.user_name
        }
        let uniq = await entity_table_get_uniq_db(client, bind)
        let result
        if(uniq.length) {
            result =  await inflected_word_put_db(client, bind, uniq[0].id)
        } else {
            bind.create_user = req.userinfo.user_name
            result =  await inflected_word_post_db(client, bind)
        }


        res.locals.data = {
            statusCode: 201,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            try {
                await client.end()
            } catch (error) {
                log.error('Error closing connection in controller entity_table_word_get');
            }
        }
    }
}