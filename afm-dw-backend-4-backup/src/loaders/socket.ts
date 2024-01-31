import { log_user_post_db } from '../db_apis/log_user';
import config from '../config/config'
import log from '../config/logger';
import { chat_messages_post } from '../db_apis/messenger/messages'
import { chat_user_check, chat_users_get } from '../db_apis/messenger/chats';

const DISCONNECT_TIME = 10000 
let connections: any = []
let writings: any = []

export default function socket(server: any, app: any) {
    const io = require('socket.io')(server, {
        cors: {
            origin: ['http://176.98.232.135', 'http://localhost:8080', 'http://45.149.128.48', 'http://192.168.122.120',
                'http://93.170.73.48', 'http://10.61.207.49', 'http://10.0.3.23', 'http://87.255.202.30', 'http://10.245.60.49', 'http://192.168.122.107:3000', 'http://portal.afm.gov.kz', 'http://portal.afm.gov.kz:8000'],
            methods: ["GET", "POST"],
            transports: ['websocket', 'polling'],
            credentials: true
        },
        allowEIO3: true
    });
    io.on('connection', (socket: any) => {
        socket.emit('getUserId')
        socket.on('joinRoom', async (data: any) => {
            socket.join(data)
        })

        socket.on("readed", async (data: any) => {
            let users = await chat_users_get(data)
            users.map((user: any) => {
                let connection = connections.find((item: any) => item.user_id === user.id)
                if(connection){
                    io.to(connection.id).emit('readed', data)
                }
            })
        })

        socket.on("writing", async (data: any) => {
            writings.push(data)
            socket.broadcast.emit('writing', { chat_id : data.chat_id, user_name : data.user_name, user_id : data.user_id })
        })
        socket.on("unwriting", async (data: any) => {
            writings.map((item : any) => {
                if(item.user_id == data.user_id){
                    var index = writings.indexOf(item)
                    writings.splice(index, 1)
                }
            })
            socket.broadcast.emit('unwriting', { chat_id : data.chat_id, user_id : data.user_id  })
        })

        socket.on('sendUserId', async function (data: any) {
            try {
                if (!connections.find((item: any) => item.user_id == data.user_id)) {
                    await log_user_post_db({ user_id: data.user_id, service_type_id: 11, request_ip: socket.handshake.address, timez: data.timez })
                }
                connections.push({ socket: socket, id: socket.id, user_id: data.user_id, timez: data.timez })
                connections = connections.filter((item: any) => item.id == socket.id || item.user_id != data.user_id)
            } catch (error) {
                log.error(error)
            }
        });

        socket.on('logout', async function (data: any) {
            try {
                connections = connections.filter((item: any) => item.user_id != data.user_id)
                await log_user_post_db({ user_id: data.user_id, service_type_id: 12, request_ip: socket.handshake.address, timez: data.timez })
            } catch (error) {
                log.error(error)
            }
        });

        socket.on('disconnect', function () {
            const conn_data: any = Object.assign({}, connections.find((item: any) => item.id == socket.id))
            writings.map((item: any) => {
                if(item.user_id == conn_data.user_id){
                    var index = writings.indexOf(item)
                    writings.splice(index, 1)
                    socket.broadcast.emit('unwriting', { chat_id : item.chat_id, user_id : item.user_id  })
                    return;
                }
            })
            setTimeout(async () => {
                try {
                    if (!connections.find((item: any) => item.user_id == conn_data.user_id && item.id != socket.id) && connections.find((item: any) => item.id == socket.id)) {
                        await log_user_post_db({ user_id: conn_data.user_id, service_type_id: 12, request_ip: socket.handshake.address, timez: conn_data.timez })
                        socket.disconnect();
                    }
                    connections = connections.filter((item: any) => item.id != socket.id)
                } catch (error) {
                    log.error(error)
                }
            }, DISCONNECT_TIME)
        });
        socket.on('sendMessage', async function (data: any) {
            let mess = { 
                chat_id: data.data.chat_id,
                message: data.data.message,
                lang: data.data.lang,
                user_id: data.data.user_id,
                is_file: data.data.is_file,
                forwarded_cm_id: data.data.forwarded_cm_id,
                answered: data.data.answered,
                inserted: data.data.inserted,
                file_id: data.file_id,
             }

            try {
                let isChatUser = await chat_user_check(mess)

                if (isChatUser.count != 0) {
                    let message = await chat_messages_post(mess);

                    let users = await chat_users_get(mess)
                    users.map((user: any) => {
                        let connection = connections.find((item: any) => item.user_id === user.id)
                        if(connection){
                            io.to(connection.id).emit('notification', mess)
                        }
                    })

                                        io.in(mess.chat_id).emit('getMessage', message)
                }

                socket.broadcast.emit('unreadedMessages', mess.chat_id)
            } catch (error) {
                log.error(error)
            }
        });

    })

    io.on("connection_error", (err: any) => {
        log.error(err.req);      
        log.error(err.code);     
        log.error(err.message);  
        log.error(err.context);  
    });

    return io;
}

export function conns() {
    return connections
}