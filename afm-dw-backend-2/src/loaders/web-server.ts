const http = require('http');
const fs = require('fs');
const soap = require('soap');

let xmlemployee = fs.readFileSync(process.env.SOAP_WSDL_EMPLOYEE_FILE, 'utf8');

import {employeeService} from '../soap/service/employee'
import {app} from './express'
import express from 'express';

import log from '../config/logger';
import { webSevPort } from '../config/web-server';
import socket from './socket'

let httpServer: any;

export function init(): Promise<express.Application> {
    // console.log = () => {}
    return new Promise( (resolve, reject) => {
        httpServer = http.createServer(app);

        httpServer
            .listen(webSevPort.port)
            .on('listening', () => {
                socket(httpServer, app);

                const xmlxmlemployee_path = "/api/1.0/soap/employee"; 
                soap.listen(app, {
                    xml: xmlemployee,
                    path: xmlxmlemployee_path,
                    services: employeeService
                });

                log.info(`Web server listening on localhost:${webSevPort.port}`);
                resolve(app);
            })
            .on('error', (error: any) => {
                reject(error)
            });
    });
}

export function close(): Promise<undefined | any> {
    return new Promise<undefined | any>((resolve: Function, reject: Function) => {
        httpServer
            .close(function(error: any) {
                if(error) {
                    reject(error);
                    return;
                }
                resolve();
            })
    })
}