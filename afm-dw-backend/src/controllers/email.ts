import express from "express";
import { sendMailUser } from "../loaders/mail";
import createBind from "../utils/create-bind";
import {email_boxes_get} from "../db_apis/email/email_box"
import {email_messages_save_db, email_messages_get, email_messages_flag_del, email_messages_flag_add, email_messages_deactivate, email_important_messages_get, email_personal_address_list_get, email_message_readed, email_get_new_message_list} from "../db_apis/email/email_message"
import { email_accounts_get, email_account_create, email_account_exist, email_account_update, email_config_get, email_servers_get, email_server_create, email_server_update, email_get_user_sync_date, email_set_user_sync_date} from "../db_apis/email/email";
import {get_app_config} from '../db_apis/user'

const moment = require('moment');
const simpleParser = require("mailparser").simpleParser;

import log from '../config/logger';

const Imap = require("imap");

export async function post_email(
  req: any, 
  res: express.Response,
  next: express.NextFunction

  ) {
  try {

    const bind: any = createBind(req); 
    let config = await email_config_get(bind)

    const appConfigResult = await get_app_config(null);

    let payloadToObject = JSON.parse(req.body.to)

    let payloadToString = ""
    for (let i = 0; i < payloadToObject.length; i++) {
      payloadToString = payloadToString + ", " + payloadToObject[i]
    }
    payloadToString = payloadToString.substr(2);

    let payload:any = {
      to: payloadToString,
      from: config.email_address,
      subject: req.body.subject,
      html: req.body.textAsHtml,
      text: req.body.text
    };

    if (req.files.file != undefined) {
      payload['attachments'] = []

      for (let index = 0; index < req.files.file.length; index++){
        payload['attachments'].push({
          filename: req.files.file[index].originalname,
          content: req.files.file[index].buffer
        })
      }
    } else {
    }

    let sendEmailInfo : any
    try {
      sendEmailInfo = await sendMailUser(payload, config, appConfigResult[0].code);
    } catch (err) {
      log.error(`Error in sendMailUser -> ${JSON.stringify(err)}`)
      throw { code: '500', message: JSON.stringify(err) }
    }

    log.info(`post_email sendEmailInfo -> ${JSON.stringify(sendEmailInfo)}`)

    let mail : any = {
      body: {
        subject: req.body.subject,
        html: req.body.textAsHtml,
        text: req.body.text,
        messageId: sendEmailInfo.messageId, 
        date: new Date().toISOString(),
        from: {
          value: [
            {
              name: 'Me', 
              address: config.email_address
            }
          ]
        },
        to: {
          value: []
        },
        attachments: []
      },
      attrs: {
        uid: -1,
        date: new Date().toISOString(),
      }
    }

    for (let i = 0; i < payloadToObject.length; i++) {
      mail.body.to.value.push({
        name: 'Получатели',
        address: payloadToObject[i]
      })
    }

    if (req.files.file != undefined) {
      for (let index = 0; index < req.files.file.length; index++){
        mail.body.attachments.push({
          filename: req.files.file[index].originalname,
          content: req.files.file[index].buffer
        })
      }
    }

    await email_messages_save_db(mail, 'Sent', config);

    res.locals.data = {
      statusCode: 201,
      data: {'status': 'Sended!'}
    };

    next();
  } catch (error) {
    log.error(`Error in post_email -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function get_email_boxes(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const bind: any = createBind(req);

        let config = await email_config_get(bind)
    let data = await email_boxes_get(config.email_server_id);

    const imap = new Imap({
      user: config.email_address,
      password: config.email_password,
      host: config.in_server,
      port: config.in_port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }, 
    });
    imap.once("ready", async function () {
      imap.getBoxes(async function (err: any, boxes: any) {
        if (err) {
          log.error(`Error in get_email_boxes (imap.getBoxes.error) -> ${JSON.stringify(err)}`)
          throw { code: '500', message: err }
        }

        let arr = Object.keys(boxes);

        let result:any = []
        let arr2= data
        result = arr.map((el:any)=>{
          let bool = arr2.find((el2:any)=>{
            return el== el2.system_name
          })
          if(bool) {
            return bool
          } else {
            let custom = {
              system_name: el,
              display_name: el
            }
            return custom
          }       
        })

        res.locals.data = {
          statusCode: 200,
          data: result,
        };

        imap.end();
        next();
      });
    });

    imap.once("error", async function (err: any) {
      log.error(`Error in get_email_boxes (imap.once.error) -> ${JSON.stringify(err)}`)
      next(err);
    });

    imap.connect();
  } catch (error) {
    log.error(`Error in get_email_boxes (catch) -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function get_email_in_boxes_base(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    let emails: any = [];
    const bind: any = createBind(req);           

    let config = await email_config_get(bind)
    let retEmailSyncDate = await email_get_user_sync_date(bind, bind.system_name) 

    let getMessageFromDate : any
    if (retEmailSyncDate == null) {
      getMessageFromDate = moment(new Date("1970-01-01")).format('YYYY-MM-DD')
    } else {
      getMessageFromDate = moment(new Date(retEmailSyncDate)).subtract(12, "months").format('YYYY-MM-DD')
    }

    const imap = new Imap({
      user: config.email_address,
      password: config.email_password,
      host: config.in_server,
      port: config.in_port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }, 
    });

    imap.once("ready", async function () {

      imap.openBox(bind.system_name, false, async function (err: any, box: any) {

        if (err) {
          log.error(`Error in get_email_in_boxes_base (imap.openBox.error) -> ${JSON.stringify(err)}`)
          throw { code: '500', message: err }
        }

        imap.search(['ALL', ['SINCE', getMessageFromDate]], async function(err:any, results:any) {

          if (box.messages.total == 0 || results.length == 0) {

            imap.end();
          } else {

            let newMessageForInsert = await email_get_new_message_list(results, bind.system_name, config);

            if (newMessageForInsert.length == 0) {

              imap.end();
            } else {

              var f = imap.fetch(newMessageForInsert, { bodies: "", markSeen: true });
              f.on("message", async function (msg: any, seqno: any) {
                emails.push({segno: seqno})

                                msg.on("body", async function (stream: any, info: any) {
                  let parsed = await simpleParser(stream);

                                    let foundIndex = emails.findIndex((item: any) => item.segno == seqno);
                  if (foundIndex != -1) { emails[foundIndex].body = parsed }
                });
                msg.on("attributes", async function (attrs: any) {

                                    let foundIndex = emails.findIndex((item: any) => item.segno == seqno);
                  if (foundIndex != -1) { emails[foundIndex].attrs = attrs }
                });
                msg.on('end', async function() {
                });
              });

                            f.once("end", async function () {
                imap.end();
              });
            }
          }
        });
      });
    });

    imap.once("error", async function (err: any) {
      log.error(`Error in get_email_in_boxes_base (imap.once.error) -> ${JSON.stringify(err)}`)
      throw { code: '500', message: err }
    });

    imap.once("end", async function () {
    });

       imap.once("close", async function () {

      let config = await email_config_get(bind) 

           if (emails.length != 0) {
        for await (let el of emails) {
          try {
            await email_messages_save_db(el, bind.system_name, config);
          } catch (error) {
            null; 
          }
        }
        await email_set_user_sync_date(bind, bind.system_name); 
        let data = await email_messages_get(bind, config);

                res.locals.data = {
          statusCode: 200,
          data: data,
        };
        next();
      } else {
        let data = await email_messages_get(bind, config);

        res.locals.data = {
          statusCode: 200,
          data: data,
        };
        next();
      }
    });

        imap.connect();
  } catch (error) {
    log.error(`Error in get_email_in_boxes_base -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function get_important_email(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           

        let config = await email_config_get(bind)
    let data = await email_important_messages_get(bind, config);

    res.locals.data = {
      statusCode: 200,
      data: data,
    };

    next();
  } catch (error) {
    log.error(`Error in get_important_email -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function get_personal_address_list(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           

        let config = await email_config_get(bind)
    let data = await email_personal_address_list_get(bind, config);

    res.locals.data = {
      statusCode: 200,
      data: data,
    };

    next();
  } catch (error) {
    log.error(`Error in get_personal_address_list -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function read_email(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        await email_message_readed(bind);
    res.locals.data = {
      statusCode: 201,
      data: 'readed',
    };

    next();
  } catch (error) {
    log.error(`Error in read_email -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function get_email_in_boxe_and_add_flag(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        let config = await email_config_get(bind)

    const imap = new Imap({
      user: config.email_address,
      password: config.email_password,
      host: config.in_server,
      port: config.in_port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false } 
    });

    imap.once("ready", async function () {

      imap.openBox(bind.box, false, async function (err: any, box: any) {

        if (err) {
          log.error(`Error in get_email_in_boxe_and_add_flag (imap.openBox) -> ${JSON.stringify(err)}`)
          throw { code: '500', message: err }
        }

        imap.addFlags(bind.uids, ['\\Flagged'], async function (err:any) {

          if (err) {
            log.error(`Error in get_email_in_boxe_and_add_flag (imap.addFlags) -> ${JSON.stringify(err)}`)
            throw { code: '500', message: err }
          }

          await email_messages_flag_add(bind, config)

          res.locals.data = {
            statusCode: 201,
            data: {'uids': bind.uids, 'status': 'Marked!'}
          };

              imap.end();
          next();
        });
      });
    });

    imap.once("error", async function (err: any) {
      log.error(`Error in get_email_in_boxe_and_add_flag -> ${JSON.stringify(err)}`)
      throw { code: '500', message: err }
    });

    imap.once("end", async function () {
    });

    imap.once("close", async function () {
    });

    imap.connect();
  } catch (error) {
    log.error(`Error in get_email_in_boxe_and_add_flag -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function get_email_in_boxe_and_del_flag(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        let config = await email_config_get(bind)

    const imap = new Imap({
      user: config.email_address,
      password: config.email_password,
      host: config.in_server,
      port: config.in_port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false } 
    });

    imap.once("ready", async function () {

      imap.openBox(bind.box, false, async function (err: any, box: any) {

        if (err) {
          log.error(`Error in get_email_in_boxe_and_del_flag (imap.openBox) -> ${JSON.stringify(err)}`)
          throw { code: '500', message: err }
        }

        imap.delFlags(bind.uids, ['\\Flagged'], async function (err:any) {

          if (err) {
            log.error(`Error in get_email_in_boxe_and_del_flag (imap.delFlags) -> ${JSON.stringify(err)}`)
            throw { code: '500', message: err }
          }

          await email_messages_flag_del(bind, config)

          res.locals.data = {
            statusCode: 201,
            data: {'uids': bind.uids, 'status': 'Unmarked!'}
          };

              imap.end();
          next();
        });
      });
    });

    imap.once("error", async function (err: any) {
      log.error(`Error in get_email_in_boxe_and_del_flag -> ${JSON.stringify(err)}`)
      throw { code: '500', message: err }
    });

    imap.once("end", async function () {
    });

    imap.once("close", async function () {
    });

    imap.connect();
  } catch (error) {
    log.error(`Error in get_email_in_boxe_and_del_flag -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function get_email_in_boxe_and_move_to_trash(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        let config = await email_config_get(bind)

    const imap = new Imap({
      user: config.email_address,
      password: config.email_password,
      host: config.in_server,
      port: config.in_port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false } 
    });

    imap.once("ready", async function () {

      imap.openBox(bind.box, false, async function (err: any, box: any) {

        if (err) {
          log.error(`Error in get_email_in_boxe_and_move_to_trash (imap.openBox) -> ${JSON.stringify(err)}`)
          throw { code: '500', message: err }
        }

        await imap.delFlags(bind.uids, ['\\Seen'], async function (err:any) {

          if (err) {
            log.error(`Error in get_email_in_boxe_and_move_to_trash (imap.delFlags) -> ${JSON.stringify(err)}`)
            throw { code: '500', message: err }
          }

          await imap.move(bind.uids, "Trash", async function(err:any) {

            if (err) {
              log.error(`Error in get_email_in_boxe_and_move_to_trash (imap.move) -> ${JSON.stringify(err)}`)
              throw { code: '500', message: err }
            }

                        const data = await email_messages_deactivate(bind, config)

                    res.locals.data = {
              statusCode: 201,
              data: {data, 'status': 'Deleted!'}
            };

                  imap.end();
            next();
          });
        });
      });
    });

    imap.once("error", async function (err: any) {
      log.error(`Error in get_email_in_boxe_and_move_to_trash -> ${JSON.stringify(err)}`)
      throw { code: '500', message: err }
    });

    imap.once("end", async function () {
    });

    imap.once("close", async function () {
    });

        imap.connect();
  } catch (error) {
    log.error(`Error in get_email_in_boxe_and_move_to_trash -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function get_email_in_boxe_and_move_to(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        let config = await email_config_get(bind)

    const imap = new Imap({
      user: config.email_address,
      password: config.email_password,
      host: config.in_server,
      port: config.in_port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false } 
    });

    imap.once("ready", async function () {

      imap.openBox(bind.box, false, async function (err: any, box: any) {

        if (err) {
          log.error(`Error in get_email_in_boxe_and_move_to (imap.openBox) -> ${JSON.stringify(err)}`)
          throw { code: '500', message: err }
        }

        imap.delFlags(bind.uids, ['\\Seen'], async function (err:any) {

          if (err) {
            log.error(`Error in get_email_in_boxe_and_move_to (imap.delFlags) -> ${JSON.stringify(err)}`)
            throw { code: '500', message: err }
          }

                    imap.move(bind.uids, bind.boxto, async function(err:any) {

            if (err) {
              log.error(`Error in get_email_in_boxe_and_move_to (imap.move) -> ${JSON.stringify(err)}`)
              throw { code: '500', message: err }
            }

            const data = await email_messages_deactivate(bind, config)

                    res.locals.data = {
              statusCode: 201,
              data: {data, 'status': `Moved to '${bind.boxto}'`}
            };

                  imap.end();
            next();
          });
        });
      });
    });

    imap.once("error", async function (err: any) {
      log.error(`Error in get_email_in_boxe_and_move_to -> ${JSON.stringify(err)}`)
      throw { code: '500', message: err }
    });

    imap.once("end", async function () {
    });

    imap.once("close", async function () {
    });

    imap.connect();
  } catch (error) {
    log.error(`Error in get_email_in_boxe_and_move_to -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function email_servers(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        const data = await email_servers_get(bind);
    res.locals.data = {
      statusCode: 200,
      data: data,
    };

    next();
  } catch (error) {
    log.error(`Error in email_servers -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function email_server_post(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        const data = await email_server_create(bind);
    res.locals.data = {
      statusCode: 201,
      data: data
    }

    next();
  } catch (error) {
    log.error(`Error in email_server_post -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function email_server_put(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        const data = await email_server_update(bind);
    res.locals.data = {
      statusCode: 201,
      data: data
    }

    next();
  } catch (error) {
    log.error(`Error in email_server_put -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function email_accounts(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        const data = await email_accounts_get(bind);
    res.locals.data = {
      statusCode: 200,
      data: data,
    };

    next();
  } catch (error) {
    log.error(`Error in email_accounts -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function email_account_post(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        const data = await email_account_create(bind);
    res.locals.data = {
      statusCode: 201,
      data: data
    }

    next();
  } catch (error) {
    log.error(`Error in email_account_post -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function email_account_put(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           


        const data = await email_account_update(bind);
    res.locals.data = {
      statusCode: 201,
      data: data
    }

    next();
  } catch (error) {
    log.error(`Error in email_account_put -> ${JSON.stringify(error)}`)
    next(error);
  }
}

export async function email_account_check(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {

    const bind: any = createBind(req);           

    const data = await email_account_exist(bind);
    res.locals.data = {
      statusCode: 201,
      data: data
    }

    next();
  } catch (error) {
    log.error(`Error in email_account_check -> ${JSON.stringify(error)}`)
    next(error);
  }
}