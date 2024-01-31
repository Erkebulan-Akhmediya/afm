import { Client } from 'pg';
import log from '../config/logger';

export async function kpi_tab_get_db(bind: any, client: Client): Promise<any> {
    try {
        let columns = ''

        if(bind.is_admin) {
            columns = ` * `
        } else {
            columns = ` id, 
                        name_${bind.lang} as name,
                        view_priority,
                        create_date,
                        update_date,
                        create_user,
                        update_user `
        }
        let query = ` select 
                        ${columns}
                    from hr.kpi_tab 
                    where is_active = true
                    order by view_priority desc, id asc`;

            const {rows: data} = await client.query(query);
        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function kpi_tab_post_db(bind: any, client: Client): Promise<undefined> {
    try {
        let query = `insert into hr.kpi_tab (name_rus, name_kaz, view_priority, create_user, update_user) values ($1, $2, $3, $4, $5) returning id`;
        const queryBind = [
            bind.name_rus,
            bind.name_kaz,
            bind.view_priority || null,
            bind.user_name,
            bind.user_name
        ]

            const {rows: {0: data}} = await client.query(query, queryBind);
        return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function kpi_tab_put_db(bind: any, client: Client): Promise<undefined> {
    try {
        const queryBind = [bind.tab_id, bind.user_name]

        let query = 'update_user = $2, update_date = current_timestamp'
        if(bind.name_rus) {
            query += `${query.trim() ? ' ,' : ' '} name_rus = $${queryBind.push(bind.name_rus)}`;
        }
        if(bind.name_kaz) {
            query += `${query.trim() ? ' ,' : ' '} name_kaz = $${queryBind.push(bind.name_kaz)}`;
        }
        if(bind.view_priority || bind.view_priority === null) {
            query += `${query.trim() ? ' ,' : ' '} view_priority = $${queryBind.push(bind.view_priority)}`;
        }
        if(bind.is_active === false || bind.is_active === true) {
            query += `${query.trim() ? ' ,' : ' '} is_active = $${queryBind.push(bind.is_active)}`;
        }

                query = `update hr.kpi_tab set ${query} where id = $1`;

                await client.query(query, queryBind);
        return bind.tab_id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

  export async function kpi_slide_get_db(bind: any, client: Client): Promise<any> {
    try {
    let columns = ' * '

    if(!bind.is_admin) {
        columns = ` id, 
                    name_${bind.lang} as name,
                    view_priority,
                    create_date,
                    update_date,
                    create_user,
                    update_user `
    }
      let query = ` select 
                        ${columns}
                    from hr.kpi_slide 
                    where is_active = true and tab_id = $1
                    order by view_priority desc NULLS last, id asc`;

          const {rows: data} = await client.query(query, [bind.tab_id]);
      return data;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function kpi_slide_post_db(bind: any, client: Client): Promise<undefined> {
    try {
        let query = `insert into hr.kpi_slide (tab_id, name_rus, name_kaz, view_priority, create_user, update_user) values ($1, $2, $3, $4, $5, $6) returning id`;
        const queryBind = [
            JSON.parse(bind.tab_id),
            bind.name_rus,
            bind.name_kaz,
            JSON.parse(bind.view_priority) || null,
            bind.user_name,
            bind.user_name
        ]

            const {rows: {0: data}} = await client.query(query, queryBind);
        return data.id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}

export async function kpi_slide_put_db(bind: any, client: Client): Promise<undefined> {
    try {
        const queryBind = [bind.id, bind.user_name]

                let query = 'update_user = $2, update_date = current_timestamp'
        if(bind.name_rus) {
            query += `${query.trim() ? ' ,' : ' '} name_rus = $${queryBind.push(bind.name_rus)}`;
        }
        if(bind.name_kaz) {
            query += `${query.trim() ? ' ,' : ' '} name_kaz = $${queryBind.push(bind.name_kaz)}`;
        }
        if(bind.view_priority || bind.view_priority === null) {
            query += `${query.trim() ? ' ,' : ' '} view_priority = $${queryBind.push(JSON.parse(bind.view_priority))}`;
        }
        if(bind.is_active === false || bind.is_active === true) {
            query += `${query.trim() ? ' ,' : ' '} is_active = $${queryBind.push(bind.is_active)}`;
        }

                query = `update hr.kpi_slide set ${query} where id = $1`;

                await client.query(query, queryBind);
        return bind.id;
    } catch (err) {
        log.error(err)
        throw err;
    }
}