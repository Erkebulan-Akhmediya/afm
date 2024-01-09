import express from 'express';
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import { report_access_user_list_add_db, report_access_user_list_delete_db, report_access_user_list_get_db } from '../db_apis/report_form_access';
import { Client } from 'pg';

export async function get_report_form_access_list (req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    client = get_client(); await client.connect()
    const bind: any = createBind(req);           
    const list = await report_access_user_list_get_db(bind, client);

    res.locals.data = {
      statusCode: 200,
      data: list
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

export async function add_report_form_access_list (req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    client = get_client(); await client.connect()
    const bind: any = createBind(req);           
    const id = await report_access_user_list_add_db(bind, client);

    res.locals.data = {
      statusCode: 200,
      data: id
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

export async function delete_report_form_access_list (req: express.Request, res: express.Response, next: express.NextFunction) {
  let client: Client | null = null
  try {
    client = get_client(); await client.connect()
    const bind: any = createBind(req);           
    await report_access_user_list_delete_db(bind, client);

    res.locals.data = {
      statusCode: 204
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