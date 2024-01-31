import get_client from '../../loaders/database';
import log from '../../config/logger';
import { conns } from '../../loaders/socket';

export async function chat_messages_get(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

                let query = `select ms.id, ms.is_deleted, ms.is_readed, ms.is_file, ms.forwarded_from_user_id,  ms.forwarded_cm_id, ms.answered_cm_id, ms.content as message, ms.chat_id, ms.create_date, ms.update_date, ms.create_user_id as user_id, e.first_name_${bind.lang} as first_name, e.last_name_${bind.lang} as last_name, ms.deleted_date
            from hr.chat_message ms join hr.employee e on ms.create_user_id = e.id
                where ms.chat_id = ${bind.chat_id} order by ms.create_date desc `  

        if (bind.hasOwnProperty('limit') && bind.hasOwnProperty('offset')) {
            query += `
                limit ${bind.limit} offset ${bind.offset} 
            `
        } else {
            log.error('-------- ПРОБЛЕМА, НЕ ПЕРЕДАН limit или offset--------------')
            log.error('bind.chat_id: '+bind.chat_id)
            log.error('bind.limit: '+bind.limit)
            log.error('bind.offset: '+bind.offset)
            log.error('----------------------')
        }

        let {rows: messages}: any = await client.query(query) 
        messages = messages.reverse();

        let inserted: String = '';
        let answered: String = '';
        let messages_to_change: any = [];
        messages.map((item: any, index: any) => {
            if(item.forwarded_from_user_id){
                inserted =  inserted + item.forwarded_from_user_id.toString() + ', '
                messages_to_change.push({ 'index' : index, 'inserted' : item.forwarded_from_user_id })
            }
            if(item.answered_cm_id){
                answered = answered + item.answered_cm_id.toString() + ', '
                messages_to_change.push({ 'index' : index, 'answered' : item.answered_cm_id })
            }
        })
        let query2 = `select * from hr.employee where id in (${inserted} 991999)`
        let query3 = `select ms.id, ms.is_deleted, ms.is_file, ms.forwarded_from_user_id, ms.answered_cm_id,  ms.forwarded_cm_id, ms.content as message, ms.chat_id, ms.create_date, ms.update_date, ms.create_user_id as user_id, e.first_name_${bind.lang} as first_name, e.last_name_${bind.lang} as last_name, ms.deleted_date
        from hr.chat_message ms join hr.employee e on ms.create_user_id = e.id
            where ms.id in (${answered} 999100)` 
        if(inserted.length > 0 || answered.length > 0){
            let {rows: users}: any = await client.query(query2)
            let {rows: answers} : any = await client.query(query3)
            messages_to_change.map((item: any) => {
                if(item.inserted){
                    users.map((user: any) => {
                        if(item.inserted == JSON.parse(JSON.stringify(user)).id){
                            messages[item.index]['inserted'] = user.first_name_rus + ' ' + user.last_name_rus
                        }
                    })
                }
                if(item.answered){
                    answers.map((answer: any) => {
                        if(item.answered == JSON.parse(JSON.stringify(answer)).id){
                            messages[item.index]['answered'] = answer
                        }
                    })
                }
            })
        }   
        var start = 0
        var sorted_messages: any = []
        messages.map((item : any, index : any) => {
        if(messages[index + 1] != undefined){
            if(item.create_date.split(' ')[0] != messages[index + 1].create_date.split(' ')[0]){
                    var day = messages.slice(start, index + 1)
                    sorted_messages.push(day)
                    start = index + 1;
               }
        } else {
            var d = messages.slice(start)
            sorted_messages.push(d)
            return
        }
        })
        return sorted_messages

            }catch(err){
        log.error(err)
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function chat_messages_post(bind: any) {

    let client
    try{
        client = get_client(); await client.connect()

                let query =  `insert into hr.chat_message
        (chat_id,${bind.file_id ? ` id,` : ``} content, create_user_id, update_user_id, is_file, forwarded_from_user_id, answered_cm_id, forwarded_cm_id) 
            values 
                (
                 ${bind.chat_id}, 
                 ${bind.file_id ? `${bind.file_id},` : ``}
                 $$${bind.message}$$, 
                 ${bind.user_id},
                 ${bind.user_id},
                 ${bind.is_file},  ${bind.inserted}, ${bind.answered}, ${bind.forwarded_cm_id})
            returning id
            `

              let {rows: {[0]: {id: message_id}}}  =  await client.query(query)
        let query3 = `
        update hr.chat set
          is_hidden_users = null
        where id = ${bind.chat_id}
      `
        await client.query(query3)

        let query2 = `select ms.id as id, ms.is_file, ms.forwarded_from_user_id, ms.answered_cm_id, ms.forwarded_cm_id, ms.content as message, ms.chat_id, ms.create_date, ms.update_date, ms.create_user_id as user_id, e.first_name_${bind.lang} as first_name, e.last_name_${bind.lang} as last_name
            from hr.chat_message ms join hr.employee e on ms.create_user_id = e.id
                where ms.id = ${message_id}`
                let {rows: {[0]: message}}: any = await client.query(query2)

        if(message.forwarded_from_user_id){
            let query = `select * from hr.employee where id in (${message.forwarded_from_user_id})`
            let {rows: users}: any = await client.query(query)
            let user = JSON.parse(JSON.stringify(users[0]))
            message['inserted'] = user.first_name_rus + ' ' + user.last_name_rus
        }
        if(message.answered_cm_id){
            let query = `select ms.id, ms.is_deleted, ms.is_file, ms.forwarded_from_user_id, ms.content as message, ms.chat_id, ms.create_date, ms.update_date, ms.create_user_id as user_id, e.first_name_${bind.lang} as first_name, e.last_name_${bind.lang} as last_name, ms.deleted_date
            from hr.chat_message ms join hr.employee e on ms.create_user_id = e.id
                where ms.id in (${message.answered_cm_id}, 999100)` 
            let {rows: messages}: any = await client.query(query)
            let messa = JSON.parse(JSON.stringify(messages[0]))
            message['answered'] = messa
        }
        return message

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function chat_messages_read(bind: any) {

        let client
    try{
        client = get_client(); await client.connect()

                let query1 = `select array(select id from hr.chat_message where chat_id = ${bind.chat_id} and create_user_id != ${bind.user_id} and id not in (select chat_message_id from hr.chat_message_status))`
         let {rows: {[0]: {array:messages}}}: any = await client.query(query1)

         let query2
         if (messages.length != 0) {
            query2 = `insert into hr.chat_message_status (chat_message_id, create_user_id, update_user_id, is_readed) select unnest(array[${messages}]), ${bind.user_id}, ${bind.user_id}, true`
            await client.query(query2)
         }

             let query3 = `update hr.chat_message set is_readed = true, update_date = current_timestamp where chat_id = ${bind.chat_id} and is_readed != true`
        let {rows: checked}: any = await client.query(query3)
        return checked    

            } catch(err){
        return
    } finally{
        if(client) {
            await client.end()
        }
    }
}


export async function chat_messages_unread_get(bind: any) {
    let client
    let ids = '';

        bind.chat_ids.map((item: any) => {
        ids = ids + item + ', '
    })

    try{
        client = get_client(); await client.connect()
        let query1 = `select * from hr.chat_message where chat_id in (${ids} -1) and create_user_id != ${bind.user_id} and id not in (select chat_message_id from hr.chat_message_status) order by chat_id`
        let {rows: count}: any = await client.query(query1)
        var sorted_chats:any = []
        var start=0
        count.map((item: any, index: number) => {
            if(count[index + 1] != undefined){
                if(item.chat_id != count[index + 1].chat_id){
                    var chat =  count.slice(start, index + 1)
                    start = index + 1;
                    sorted_chats.push(chat)
                }
            } else {
                var d = count.slice(start)
                sorted_chats.push(d)
                return
            }
        })

        return sorted_chats;

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}


export async function delete_message(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()

               let query1 = `update hr.chat_message set is_deleted = true, deleted_date = current_timestamp where id = ${bind.message_id} returning deleted_date`
        let {rows: {[0]: message}}: any = await client.query(query1)

        let connections = conns()
        let recipients:any = []

        let query2 = `select user_id from hr.chat_party where chat_id =  ${bind.chat_id}`
        let {rows: chatUsers}: any = await client.query(query2)

        for (let el of chatUsers){
            for(let item of connections){
                if( el.user_id == item.user_id) {
                    recipients.push(item)
                }  
            } 
        }
        recipients.forEach((item:any) => {
            item.socket.emit('deleteMessage', {message_id: bind.message_id, deleted_date: message.deleted_date})
        })

                return message

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}
export async function get_last_messages(bind: any){
    let last_messages: any = []
    let client = get_client(); await client.connect()
    try{  
        let chat_string = '';
        bind.chats.map((chat: any) => {
            chat_string  = chat_string + chat.toString() + ', '
        })
        let query = `select ms.content as message, ms.is_deleted, ms.is_readed, ms.chat_id, ms.create_date, ms.update_date, ms.create_user_id as user_id, e.first_name_${bind.lang} as first_name
            from hr.chat_message ms join hr.employee e on ms.create_user_id = e.id
                where ms.chat_id in ( ${chat_string}-1) order by ms.create_date `
        let {rows: messages}: any = await client.query(query)
        messages.sort((a : any, b: any) => {
            return a.chat_id > b.chat_id ? 1
                         : a.chat_id === b.chat_id ? 0
                         : -1;
          });
        messages.map((item : any, index : any) => {
            if(messages[index + 1] != undefined){
                if(item.chat_id != messages[index + 1].chat_id){
                       last_messages.push(item)
                   }
            } else {
                last_messages.push(item)
            }
        })

        return last_messages;
    } catch(err){
       console.log("last_messasages error: " + err)
    } finally{
        if(client) {
            await client.end()
        }
    }
}