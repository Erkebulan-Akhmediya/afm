const nodemailer = require('nodemailer')
import config from '../config/config'
import log from '../config/logger';

let createTransport = function(mailData:object) {
  let transporter = nodemailer.createTransport(mailData)
  return transporter
}

export default async function sendMail (sendData: any){
  let mailData = config.get('email')
  let t = createTransport(mailData)
  sendData.from = ''
  await t.sendMail(sendData)
}

export function sendMailUser (sendData: any, config:any, appConfigCode:any){
  return new Promise(function (resolve, reject){
    let mailData
    if (appConfigCode == 'afm') {
      mailData = {
        host: config.out_server,
        port: config.out_port,
        auth: {
          user: config.email_address,
          pass: config.email_password
        },
        secure: true,
        tls : { rejectUnauthorized: false },
      }
    } else {

      mailData = {
        host: config.out_server,
        port: config.out_port, 
        secure: false,
        auth: {
          user: config.email_address,
          pass: config.email_password
        }
      }
    }

    let t = createTransport(mailData)
    t.sendMail(sendData, (err:any, info:any) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}