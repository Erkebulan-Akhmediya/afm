import { email_file_post } from '../../controllers/file';
import get_client from '../../loaders/database';
import log from '../../config/logger';

export async function email_messages_save_db(bind: any, boxSystemName:any, config:any) {

    let client : any

    try{
        client = get_client(); await client.connect()

        await client.query('BEGIN')

        if (bind.body && bind.attrs) {
            let date = JSON.stringify(new Date(bind.body.date))

            let {rows: resultDublicate}  =  await client.query(`select id from hr.email where email_box_name = '${boxSystemName}' and external_id = '${bind.attrs.uid}' and user_id = ${config.user_id} and email_server_id = ${config.email_server_id}`)

            if (resultDublicate.length > 0 && bind.attrs.uid != -1) {
                await client.query(`update hr.email set is_active = true where id = ${resultDublicate[0].id}`)
            }

            else {
                var {rows: message_id} = await client.query(`insert into hr.email 
                (email_box_name, send_date, subject, text_body, html_body, external_id, message_id, is_active, email_server_id, user_id)
                values( 
                '${boxSystemName}', 
                '${date}', 
                $$${bind.body.subject}$$,
                $$${bind.body.text}$$,
                $$${bind.body.html}$$,
                '${bind.attrs.uid}',
                '${bind.body.messageId}',
                true,
                ${config.email_server_id},
                ${config.user_id})
                returning id`)

                message_id = message_id[0].id

                if(bind.body.from) {
                    for await (let el of bind.body.from.value) {
                        let queryFromAddress =  `insert into hr.email_address
                        (email_id, email_address_type_id, name, address) 
                        values 
                            (
                                ${message_id}, 
                            '4', 
                            '${el.name}',
                            '${el.address}'
                            )
                        returning id
                        `
                        await client.query(queryFromAddress)
                    }
                }

                if(bind.body.to) {
                    for await (let el of bind.body.to.value) {
                        let queryToAddress =  `insert into hr.email_address
                        (email_id, email_address_type_id, name, address) 
                        values 
                            (
                            ${message_id}, 
                            '1', 
                            '${el.name}',
                            '${el.address}'
                            )
                        returning id
                        `
                        await client.query(queryToAddress)
                    }
                }

                if(bind.body.cc){
                    for await (let el of bind.body.cc.value) {
                        let queryCcAddress =  `insert into hr.email_address
                        (email_id, email_address_type_id, name, address) 
                        values 
                            (
                            ${message_id}, 
                            '3', 
                            '${el.name}',
                            '${el.address}'
                            )
                        returning id
                        `
                        await client.query(queryCcAddress)
                    }
                }

                if(bind.body.bcc){
                    for await (let el of bind.body.bcc.value) {
                            let queryBccAddress =  `insert into hr.email_address
                            (email_id, email_address_type_id, name, address) 
                            values 
                                (
                                ${message_id}, 
                                '2', 
                                '${el.name}',
                                '${el.address}'
                                )
                            returning id
                            `
                            await client.query(queryBccAddress)
                    }
                }

                if(bind.attrs.flags){
                    let flags = bind.attrs.flags
                    flags.push('unread')
                    for await (let el of flags) {
                        let queryFlags =  `insert into hr.email_attribute
                        (email_id, name) 
                        values 
                            (
                            ${message_id},  
                            $$${el}$$                        
                            )
                        returning id
                        `
                        await client.query(queryFlags)
                    }
                }

                if(bind.body.attachments) {
                    let files = bind.body.attachments
                    for await (let el of files) {
                        let payload = {
                            file : {
                                originalname: el.filename,
                                buffer: el.content
                            },
                            body: {
                                file_type_id: 9,
                                object_id: message_id,
                                fileType: 'email'
                            }
                        }
                        await email_file_post(payload)
                    }
                }
            }
        } else {
            log.error(`Не получены параметры по сообщению email_messages_save_db -> data bind: ${JSON.stringify(bind)}, boxSystemName: ${boxSystemName}, config: ${JSON.stringify(config)}`)
        }

        let commit = await client.query('COMMIT');
        return commit

    } catch(err){
        log.error(`Error in email_messages_save_db -> ${JSON.stringify(err)}. Data bind: ${JSON.stringify(bind)}, boxSystemName: ${boxSystemName}, config: ${JSON.stringify(config)}`)
        if(client) {
            await client.query('ROLLBACK');
        }
        throw err
    } finally{
        if(client) {
            await client.end()
        }
    }
}

export async function email_messages_get(bind:any, config:any) {
    let client
    try {
        client = get_client(); await client.connect()

        let query = `
        select e.id,
        e.send_date as date,
        e.subject, e.text_body as text,
        e.html_body as html,
        e.external_id as uid,
        e.message_id,
		ea.name  as from_email_name,
        ea.address as from_email_address,
        array(select ea.name from  hr.email_address ea        
                    where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 1 AND e.id = ea.email_id) as to_email_name,
        array(select ea.address from  hr.email_address ea     
                    where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 1 AND e.id = ea.email_id) as to_email_address,

        array(select ea.name from hr.email_address ea    
                    where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 2 AND e.id = ea.email_id) as bcc_email_name,
        array(select ea.address from hr.email_address ea    
                    where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 2 AND e.id = ea.email_id) as bcc_email_address,

        array(select ea.name from  hr.email_address ea 
                    where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 3 AND e.id = ea.email_id) as cc_email_name,
        array(select ea.address from  hr.email_address ea     
                    where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 3 AND e.id = ea.email_id) as cc_email_address,
        
        array(select atr.name from hr.email e join hr.email_attribute atr on e.id = atr.email_id
                    where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND e.id = ea.email_id) as flags

        from hr.email e join hr.email_address ea on e.id = ea.email_id    
                    where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 4 AND e.id = ea.email_id AND e.is_active = true
                    order by send_date desc
                    limit ${bind.limit? bind.limit:14} offset ${bind.offset?bind.offset:0}
        `

        if (bind.searchstring) {
            query = `
            select e.id,
            e.send_date as date,
            e.subject, e.text_body as text,
            e.html_body as html,
            e.external_id as uid,
            e.message_id,
            ea.name  as from_email_name,
            ea.address as from_email_address,
            array(select ea.name from  hr.email_address ea        
                where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 1 AND e.id = ea.email_id) as to_email_name,
            array(select ea.address from  hr.email_address ea     
                        where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 1 AND e.id = ea.email_id) as to_email_address,

            array(select ea.name from hr.email_address ea    
                        where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 2 AND e.id = ea.email_id) as bcc_email_name,
            array(select ea.address from hr.email_address ea    
                        where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 2 AND e.id = ea.email_id) as bcc_email_address,

            array(select ea.name from  hr.email_address ea 
                        where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 3 AND e.id = ea.email_id) as cc_email_name,
            array(select ea.address from  hr.email_address ea     
                        where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 3 AND e.id = ea.email_id) as cc_email_address,
            
            array(select atr.name from hr.email e join hr.email_attribute atr on e.id = atr.email_id
                where e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND e.id = ea.email_id) as flags

            from hr.email e join hr.email_address ea on e.id = ea.email_id
                        where (upper(e.subject) like upper('%${bind.searchstring}%') OR upper(e.text_body) like upper('%${bind.searchstring}%')
                               OR exists (select 1 from hr.email_address z1 where z1.email_id = e.id and (upper(ea.name) like upper('%${bind.searchstring}%')
                               OR upper(ea.address) like upper('%${bind.searchstring}%')))) AND
                        e.email_box_name = '${bind.system_name}' AND e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 4 AND e.id = ea.email_id AND e.is_active = true
                        order by send_date desc
                        limit ${bind.limit? bind.limit:14} offset ${bind.offset?bind.offset:0}
            `
        }

        let {rows: messages}: any = await client.query(query)
        let temp:any = []
        for await (let el of messages) {
            let fileQuery = `select f.name, obj.file_id, obj.object_id, f.id from hr.file f join hr.object_file obj on f.id = obj.file_id      
            where obj.object_id = ${el.id} AND obj.object_type_id = 9`


                                    let {rows: files}: any = await client.query(fileQuery)
            el['files']=files
            temp.push(el)
        }

        messages = temp
        return messages

            } catch(err) {
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_important_messages_get(bind:any, config:any) {
    let client
    try{
        client = get_client(); await client.connect()

        let query = `
        select e.id,
        e.send_date as date,
        e.subject, e.text_body as text,
        e.html_body as html,
        e.external_id as uid,
        e.message_id,
		ea.name  as from_email_name,
        ea.address as from_email_address,
        array(select ea.name from hr.email e join hr.email_address ea on e.id = ea.email_id       
                    where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 1 AND e.id = ea.email_id) as to_email_name,
        array(select ea.address from hr.email e join hr.email_address ea on e.id = ea.email_id    
                    where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 1 AND e.id = ea.email_id) as to_email_address,

        array(select ea.name from hr.email e join hr.email_address ea on e.id = ea.email_id   
                    where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 2 AND e.id = ea.email_id) as bcc_email_name,
        array(select ea.address from hr.email e join hr.email_address ea on e.id = ea.email_id    
                    where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 2 AND e.id = ea.email_id) as bcc_email_address,

        array(select ea.name from hr.email e join hr.email_address ea on e.id = ea.email_id
                    where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 3 AND e.id = ea.email_id) as cc_email_name,
        array(select ea.address from hr.email e join hr.email_address ea on e.id = ea.email_id    
                    where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 3 AND e.id = ea.email_id) as cc_email_address,
        
        array(select atr.name from hr.email e join hr.email_attribute atr on e.id = atr.email_id    
            where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND e.id = ea.email_id) as flags

        from hr.email e join hr.email_address ea on e.id = ea.email_id join hr.email_attribute et ON e.id = et.email_id    
                    where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 4 AND e.id = ea.email_id AND e.is_active = true
                    AND et.name = '\\Flagged'
                    order by send_date desc
                    limit ${bind.limit? bind.limit:14} offset ${bind.offset?bind.offset:0}
        `
        if (bind.searchstring) {
            query = `
            select e.id,
            e.send_date as date,
            e.subject, e.text_body as text,
            e.html_body as html,
            e.external_id as uid,
            e.message_id,
            ea.name  as from_email_name,
            ea.address as from_email_address,
            array(select ea.name from hr.email e join hr.email_address ea on e.id = ea.email_id
                        where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 1 AND e.id = ea.email_id) as to_email_name,
            array(select ea.address from hr.email e join hr.email_address ea on e.id = ea.email_id
                        where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 1 AND e.id = ea.email_id) as to_email_address,

            array(select ea.name from hr.email e join hr.email_address ea on e.id = ea.email_id
                        where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 2 AND e.id = ea.email_id) as bcc_email_name,
            array(select ea.address from hr.email e join hr.email_address ea on e.id = ea.email_id
                        where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 2 AND e.id = ea.email_id) as bcc_email_address,

            array(select ea.name from hr.email e join hr.email_address ea on e.id = ea.email_id
                        where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 3 AND e.id = ea.email_id) as cc_email_name,
            array(select ea.address from hr.email e join hr.email_address ea on e.id = ea.email_id
                        where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 3 AND e.id = ea.email_id) as cc_email_address,

            array(select atr.name from hr.email e join hr.email_attribute atr on e.id = atr.email_id
                where e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND e.id = ea.email_id) as flags

            from hr.email e join hr.email_address ea on e.id = ea.email_id join hr.email_attribute et ON e.id = et.email_id
                        where (upper(e.subject) like upper('%${bind.searchstring}%') OR upper(e.text_body) like upper('%${bind.searchstring}%')
                               OR exists (select 1 from hr.email_address z1 where z1.email_id = e.id and (upper(ea.name) like upper('%${bind.searchstring}%')
                               OR upper(ea.address) like upper('%${bind.searchstring}%')))) AND
                        e.user_id = ${config.user_id} and e.email_server_id = ${config.email_server_id} AND ea.email_address_type_id = 4 AND e.id = ea.email_id AND e.is_active = true
                        AND et.name = '\\Flagged'
                        order by send_date desc
                        limit ${bind.limit? bind.limit:14} offset ${bind.offset?bind.offset:0}
            `
        }

        let {rows: messages}: any = await client.query(query)
        return messages

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_messages_flag_del(bind:any, config:any) {
    let client
    try{
        client = get_client(); await client.connect()
        let querySelectIdsByUids:any


                     if(Array.isArray(bind.uids)) {
            querySelectIdsByUids = `select array(select id from hr.email where user_id = ${config.user_id} and email_server_id = ${config.email_server_id} and email_box_name = '${bind.box}' and external_id = ANY(Array [${"'" + bind.uids.join("','") + "'"}])) as ids`
        } else {
            querySelectIdsByUids = `select array(select id from hr.email where user_id = ${config.user_id} and email_server_id = ${config.email_server_id} and email_box_name = '${bind.box}' and external_id = ANY(Array ['${bind.uids}'])) as ids`
        }

        let {rows: {[0]: {ids: emails_id}}}  =  await client.query(querySelectIdsByUids)
        let queryDeleteByIds = `delete  from hr.email_attribute where email_id =  ANY(Array [${emails_id}]) AND name = '\\Flagged'`
        await client.query(queryDeleteByIds)
    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_messages_flag_add(bind:any, config:any) {
    let client
    try{
        client = get_client(); await client.connect()
        let querySelectIdsByUids:any

                        if(Array.isArray(bind.uids)) {
            querySelectIdsByUids = `select array(select id from hr.email where user_id = ${config.user_id} and email_server_id = ${config.email_server_id} and email_box_name = '${bind.box}' and external_id = ANY(Array [${"'" + bind.uids.join("','") + "'"}])) as ids`
        } else {
            querySelectIdsByUids = `select array(select id from hr.email where user_id = ${config.user_id} and email_server_id = ${config.email_server_id} and email_box_name = '${bind.box}' and external_id = ANY(Array ['${bind.uids}'])) as ids`
        }

                let {rows: {[0]: {ids: emails_id}}}  =  await client.query(querySelectIdsByUids)
        let queryAddFlagg = `insert into hr.email_attribute (email_id, name) select unnest(array[${emails_id}]), '\\Flagged'`
        await client.query(queryAddFlagg)

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_messages_deactivate(bind:any, config:any) {
    let client
    try{
        client = get_client(); await client.connect()
        let query:any

        if(Array.isArray(bind.uids)) {
            query = `update hr.email set is_active = false where user_id = ${config.user_id} and email_server_id = ${config.email_server_id} and email_box_name = '${bind.box}' and external_id = ANY(Array [${"'" + bind.uids.join("','") + "'"}]) returning id`
        } else {
            query = `update hr.email set is_active = false where user_id = ${config.user_id} and email_server_id = ${config.email_server_id} and email_box_name = '${bind.box}' and external_id = ANY(Array ['${bind.uids}']) returning id`
        }

                let {rows: id}  = await client.query(query)
        return id
    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_message_readed(bind:any) {
    let client
    try{

                let ids: String = '';
        let insert_values: String = '(';
        bind.email_id.map((item: any) => {
            ids =  ids + item.toString() + ', '
            insert_values = insert_values + "(" + `${item.toString()}, 'unread'),`
        });
        insert_values = insert_values.substring(1, insert_values.length-1)
        client = get_client(); await client.connect()
        let query = `delete from hr.email_attribute where email_id in (${ids} -1) and name = 'unread' returning id`
        let query2 = `insert into hr.email_attribute (email_id, name) values ${insert_values}`;
        if(bind.unseen){
            query = query2
        }
        let {rows: id}  = await client.query(query)
        return id
    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_personal_address_list_get(bind:any, config:any) {
    let client
    try{
        client = get_client(); await client.connect()

        let query = `
        select distinct address from 
        (select trim(address) as address
        from (select 
        distinct t1.address
        from hr.email_Address t1, hr.email t2
        where t1.email_address_type_id = 4
        and t1.email_id = t2.id
        and t2.user_id = ${config.user_id}) t1
        union all
        select trim(f.address) as address
        from (select 
        distinct t1.address
        from hr.email_Address t1, hr.email t2
        where t1.email_address_type_id = 1
        and t1.name = 'Получатели'
        and t1.email_id = t2.id
        and t2.user_id = ${config.user_id}) af
        cross join unnest(string_to_array(af.address, ',')) as f(address)
        union all
        select 
        distinct case
        when t1.name = '' then t1.address
        else t1.name || ' <' || t1.address || '>'
        end as address
        from hr.email_Address t1, hr.email t2
        where t1.email_address_type_id = 1
        and t1.name != 'Получатели'
        and t1.email_id = t2.id
        and t2.user_id = ${config.user_id}) email_Address_list
        `

                let {rows: messages}: any = await client.query(query)
        return messages

            } catch (err) {
        log.error(err)
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}

export async function email_get_new_message_list(allMessageList:any, boxSystemName:any, config:any) {
    let client
    try{
        client = get_client(); await client.connect()

        let returnObject = []
        let {rows: result}  = await client.query(`select unnest(ARRAY[${allMessageList}]) as all_message_list
        EXCEPT
        select external_id::integer from hr.email where email_box_name = '${boxSystemName}' and user_id = ${config.user_id} and email_server_id = ${config.email_server_id}`)

        for (var i = 0; i < result.length; i++){ 
            returnObject.push(result[i].all_message_list)
        }

        return returnObject
    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if(client) {
            await client.end()
        }
    }
}