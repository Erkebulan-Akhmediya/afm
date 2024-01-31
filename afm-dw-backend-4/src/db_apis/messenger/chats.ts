import get_client from '../../loaders/database';
import { conns } from '../../loaders/socket';

export async function chat_create(bind: any): Promise<any> {
    let client
    try{
        client = get_client(); await client.connect()

        let queryChat =  `insert into hr.chat
        (name, chat_type_id, create_user_id, update_user_id) 
            values 
                ('${bind.chat_name}', 
                ${bind.chat_type}, 
                ${bind.user_id},
                ${bind.user_id}
                )
            returning id
            `

        let {rows: {[0]: {id: chat_id}}} = await client.query(queryChat)

        let queryParty =  `insert into hr.chat_party
        (user_id, chat_id, create_user_id, update_user_id) 
            select 
                 unnest(array[${bind.users_id}]),
                 ${chat_id}, 
                ${bind.user_id}, 
                ${bind.user_id}
                
            returning id
            `

                let {rows: party}: any  =  await client.query(queryParty)

        let connections = conns()
        let recipients:any = []

        for (let el of bind.users_id){
            for(let item of connections){
                if( el == item.user_id && !recipients.includes(item)) {
                    recipients.push(item)
                }

                           } 
        }

               recipients.forEach((item:any) => {
            item.socket.emit('updateChats')
        })

        return chat_id

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function chat_hidden_show(bind:any){
    let client
    try{
        client = get_client(); await client.connect()
        let query3 = `
        update hr.chat set
          is_hidden_users = '${bind.is_hidden}'
        where id = ${bind.chat_id}
         `
        await client.query(query3)
    } catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function chats_hide(bind:any){
    let client 
    try{
        client = get_client(); await client.connect()
        let query = `select * from hr.chat where id = ${bind.chat_id}`;
        let {rows: chats}: any = await client.query(query)

        var hidden = chats[0].is_hidden_users + `;${bind.user_id}`
        let query2 = `update hr.chat set is_hidden_users = '${hidden}' where id = ${bind.chat_id} `;
        await client.query(query2)
        return chats
    } catch(err){
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function chats_get(bind: any) {
    let client

        try{
        client = get_client(); await client.connect()
        let query = `select t1.id as chat_id,
                                case when t1.chat_type_id = 1 
                                    then (select z2.last_name_rus||' '||z2.first_name_rus
                                    from hr.chat_party z1, hr.employee z2 
                                    where z1.user_id != ${bind.user_id}
                                    and z1.chat_id = t1.id
                                    and z1.user_id = z2.id
                                    limit 1)
                                else t1.name
                                end as name,   
                            t1.chat_type_id,
                                case when t1.chat_type_id = 1 
                                    then (select user_id 
                                    from hr.chat_party z1 
                                    where z1.user_id != ${bind.user_id}
                                    and z1.chat_id = t1.id
                                    limit 1)
                                else null
                            end employee_id, 
                            t1.is_hidden_users,
                            t1.create_user_id
                                from hr.chat t1
                                    where id in (select chat_id from hr.chat_party where chat_party.user_id = ${bind.user_id})`
        let {rows: chats}: any = await client.query(query)

                return chats

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function chat_users_get(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()
        let query = `select e.last_name_${bind.lang} as last_name, e.first_name_${bind.lang} as first_name, e.id 
            from hr.employee e join hr.chat_party p on p.user_id = e.id 
                where p.chat_id = ${bind.chat_id}`

                        let {rows: chat_users}: any = await client.query(query)

        return chat_users

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function chat_users_edit(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()
        let query1 = `select array(select user_id from hr.chat_party p where p.chat_id = ${bind.chat_id})`

        let {rows: {[0]: {array:chat_users}}} = await client.query(query1)

        let difference = bind.users_id.filter((item:any) => !chat_users.includes(item));

        if (difference.length!=0) {
        let query2 =  `insert into hr.chat_party
        (user_id, chat_id, create_user_id, update_user_id) 
            select 
                 unnest(array[${difference}]),
                 ${bind.chat_id}, 
                ${bind.user_id}, 
                ${bind.user_id}
                
            returning id
            `

                await client.query(query2)
        }

        let query3 = `delete from hr.chat_party
            where chat_id = ${bind.chat_id} and user_id not in
                (select unnest(array[${bind.users_id}]))`

                        let {rows: chat_users_rez}: any = await client.query(query3)



        let connections = conns()
        let recipients:any = []
        let usersForUpdate = difference.concat(chat_users)

        for (let el of usersForUpdate){
            for(let item of connections){
                if( el == item.user_id && !recipients.includes(item)) {
                    recipients.push(item)
                }

                           } 
        }


        recipients.forEach((item:any) => {
            item.socket.emit('updateChats')
        })


        return chat_users_rez

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}

export async function chat_user_check(bind: any) {
    let client
    try{
        client = get_client(); await client.connect()
        let query = `select COUNT(*) from hr.chat_party where chat_id = ${bind.chat_id} and user_id = ${bind.user_id}`

                        let {rows: {[0]: count}}: any = await client.query(query)

        return count

            }catch(err){
        throw err
    }finally{
        if(client) {
            await client.end()
        }
    }
}