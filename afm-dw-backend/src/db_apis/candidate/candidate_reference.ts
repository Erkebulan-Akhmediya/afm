import log from '../../config/logger';
import get_client from '../../loaders/database';
import moment from 'moment';


export async function candidate_get_reference(bind: any) {
    let client
    try {
        client = get_client(); await client.connect();
        let query = `select 
        e.last_name_${bind.lang} as last_name,
        e.first_name_${bind.lang} as first_name,
        e.middle_name_${bind.lang} as middle_name,
        e.identification_number as identification_number,
        e.birth_date,
        e.negative_dependency,
        e.other_interest,
        coalesce((select description from hr.employee_conclusive_data where employee_id = e.id and conclusive_data_type_id = 1 and is_deleted = false limit 1), 'нет данных') as conclusive_knb,
        coalesce((select description from hr.employee_conclusive_data where employee_id = e.id and conclusive_data_type_id = 2 and is_deleted = false limit 1), 'нет данных') as conclusive_vvk,
        coalesce((select description from hr.employee_conclusive_data where employee_id = e.id and conclusive_data_type_id = 3 and is_deleted = false limit 1), 'нет данных') as conclusive_work_result,
        coalesce((select description from hr.employee_conclusive_data where employee_id = e.id and conclusive_data_type_id = 4 and is_deleted = false limit 1), 'нет данных') as conclusive_conclusion_oldwork,
        e.other_information,
		ms.name_${bind.lang} as marital_status,
		rg.name_${bind.lang} as religion
                from hr.employee e 
                left join ref.marital_status ms on e.marital_status_id = ms.id
                left join ref.religion rg on e.religion_id = rg.id
                    where e.id = ${bind.employee_id}`
                    let {rows: {0: employee}} = await client.query(query)

        let query2 = `select 
        r_i.name_rus as institution,
        r_t.name_${bind.lang} as ed_type,
        r_s.name_${bind.lang} as speciality,
        ed.enrollment_date,
        graduation_date
                from hr.employee e 
                join hr.employee_education ed on e.id = ed.employee_id
                join ref.education_institution r_i on ed.education_institution_id = r_i.id
                join ref.education_type r_t on ed.education_type_id = r_t.id
                join ref.education_speciality r_s on ed.education_speciality_id = r_s.id
                    where e.id = ${bind.employee_id} and ed.is_deleted = false
                    order by ed.enrollment_date desc`
                    let {rows: education} = await client.query(query2)

                    for(let el of education) {
                        el.enrollment_date = moment(new Date(el.enrollment_date)).format(
                            "DD.MM.YYYY")
                        el.graduation_date = moment(new Date(el.graduation_date)).format(
                            "DD.MM.YYYY")
                    }

                                       employee['education'] = education

        let query3 = `select *
                from hr.employee_work_list wl
                    where wl.employee_id = ${bind.employee_id} and wl.is_deleted = false
                    order by wl.date_from desc`
                    let {rows: work_list} = await client.query(query3)
                    for(let el of work_list) {
                        el.date_from = moment(new Date(el.date_from)).format(
                            "DD.MM.YYYY")
                        el.date_to = moment(new Date(el.date_to)).format(
                            "DD.MM.YYYY")
                        if (el.date_to == '01.01.1970') { el.date_to = ''}
                    }
                    employee['work_list'] = work_list

        let query4 = `select l.name as language_name, kl.name_${bind.lang} as language_level 
        from hr.employee_language el 
        join ref.language l on el.language_id =l.id 
        join ref.knowledge_level kl on el.knowledge_level_id = kl.id
        where el.employee_id = ${bind.employee_id} and el.is_deleted = false`

        let {rows: languages} = await client.query(query4)

        employee['languages'] = languages
        if (languages.length > 0 ) {
            employee['languages_or_qualification_exists'] = 1
        }

        let query5 = `select *
        from hr.employee_car ec
        where ec.employee_id = ${bind.employee_id} and ec.is_deleted = false`

        let {rows: car} = await client.query(query5)

        employee['car'] = car
        if (car.length > 0 ) {
            employee['apartments_or_car_exists'] = 1
        }

        let query6 = `select at.name_rus as apartment_type, a.address as apartment_address
        from hr.employee_apartment a 
        join ref.employee_apartment_type at on a.employee_apartment_type_id = at.id
        where a.employee_id = ${bind.employee_id} and a.is_deleted = false`

        let {rows: apartments} = await client.query(query6)

        employee['apartments'] = apartments
        if (apartments.length > 0 ) {
            employee['apartments_or_car_exists'] = 1
        }

        let query7 = `select ec.name_${bind.lang} as contact, ct.name_${bind.lang} as contact_name
        from hr.employee_contact_info ec 
        join ref.contact_info_type ct on ec.contact_info_type_id = ct.id 
        where ec.employee_id=${bind.employee_id} and ec.is_active = true`

        let {rows: contacts} = await client.query(query7)

        employee['contacts'] = contacts


        let query8 = `select er.last_name, er.first_name,
        er.middle_name, rt.name_${bind.lang} as relation_type,
        er.work_place, er.position, er.is_worked_law,
        er.is_active_work_law, er.law_agency, er.law_position
        from hr.employee_relation er 
        join ref.employee_relation_type rt on er.employee_relation_type_id = rt.id 
        where er.employee_id=${bind.employee_id} and er.is_deleted = false`

        let {rows: relations} = await client.query(query8)
        let relations_in_law:any = []
        for(let el of relations) {
            if(el.is_worked_law==true) {
                relations_in_law.push(el)
            }
            el.is_worked_law = el.is_worked_law?'да':'нет'
            el.is_active_work_law = el.is_active_work_law?'действующий сотрудник':'ранее сотрудник'


                               }
        employee['relations'] = relations
        employee['relations_in_law'] = relations_in_law


        let query9 = `select c.name_${bind.lang} as country, e.abroad_year, e.departure_purpose
        from hr.employee_abroad_info e
        join ref.country c on e.country_id = c.id
        where e.employee_id=${bind.employee_id} and e.is_deleted = false
        order by e.abroad_year desc`

        let {rows: abroad} = await client.query(query9)

        employee['abroad'] = abroad
        if (abroad.length > 0 ) {
            employee['abroad_exists'] = 1
        } else {
            employee['abroad_not_exists'] = 1
        }

        let query10 = `select ot.name_${bind.lang} as type, e.payment_amount
        from hr.employee_fncl_obligation e
        join ref.fncl_obligation_type ot on e.fncl_obligation_type_id = ot.id
        where e.employee_id=${bind.employee_id} and e.is_deleted = false`

        let {rows: fncl_obligation} = await client.query(query10)

        employee['fncl_obligation'] = fncl_obligation

        let query11 = `select e.weapon_type, e.brand, e.model, e.weapon_number, e.confirming_document
        from hr.employee_weapon e       
        where e.employee_id=${bind.employee_id} and e.is_deleted = false`

        let {rows: weapon} = await client.query(query11)

        employee['weapon'] = weapon


        let query12 = `select * from hr.employee_test_result e    
        where e.employee_id=${bind.employee_id} and e.is_deleted = false
        order by e.testing_date desc`

        let {rows: test_result} = await client.query(query12)

        employee['test_result'] = test_result


        let query13 = `select * from hr.employee_achievement e    
        where e.employee_id=${bind.employee_id} and e.is_deleted = false
        order by e.achievement_date desc`

        let {rows: achievement} = await client.query(query13)

        employee['achievement'] = achievement


        let query14 = `select *
        from hr.employee_qualification eq
        where eq.employee_id = ${bind.employee_id} and eq.is_deleted = false
        order by eq.issue_date desc`

        let {rows: qualification} = await client.query(query14)

        employee['qualification'] = qualification
        if (qualification.length > 0 ) {
            employee['languages_or_qualification_exists'] = 1
        }


        let query15 = `select dt.name_${bind.lang} as disciplinary_type, d.offense_date, d.description
        from hr.employee_disciplinary d
        join ref.disciplinary_type dt on d.disciplinary_type_id = dt.id
        where d.employee_id=${bind.employee_id} and d.is_deleted = false
        order by d.offense_date desc`

        let {rows: disciplinary} = await client.query(query15)
        for(let el of disciplinary) {
            el.offense_date = moment(new Date(el.offense_date)).format(
                "DD.MM.YYYY")
        }

        employee['disciplinary'] = disciplinary
        if (disciplinary.length > 0 ) {
            employee['disciplinary_exists'] = 1
        } else {
            employee['disciplinary_not_exists'] = 1
        }


        let query16_check = `select ar.approve_request_status_id
        from hr.request r, hr.approve_request_rel arr, hr.approve_request ar, hr.approve_request_item ari
        where r.id = ${bind.requestid} and 
        r.id = arr.object_id and arr.object_name = 'REQUEST'
        and arr.approve_request_id = ar.id
        and ar.id = ari.approve_request_id`

        let {rows: query16_data_check} = await client.query(query16_check)

                if (query16_data_check.length > 0 ) {
            employee['approvedata_exists'] = 1

                        let statusList
            if (query16_data_check[0].approve_request_status_id == 3) { 
                statusList = '3, 4, 6, 10, 11'
            } else {
                statusList = '1, 2, 3, 4, 6, 8, 9, 10, 11'
            }

            let query16 = `select ari.approve_date  + interval '6 hour' as approve_date, 
            e.last_name_${bind.lang} || ' ' || e.first_name_${bind.lang} || ' ' || e.middle_name_${bind.lang} as approve_full_name,
            aris.name_${bind.lang} as approve_item_status, 
            CASE WHEN ari.comment is null OR ari.comment = '' THEN '' ELSE '('||ari.comment||')'
            END approve_comment,
            ars.name_rus as approve_request_status,
            ar.approve_request_status_id
            from hr.request r, hr.approve_request_rel arr, hr.approve_request ar,
            hr.approve_request_item ari, hr.employee e, ref.ar_item_status aris,
            ref.approve_request_status ars
            where r.id = ${bind.requestid} and 
            r.id = arr.object_id and arr.object_name = 'REQUEST'
            and arr.approve_request_id = ar.id
            and ar.id = ari.approve_request_id
            and ari.ar_item_status_id in (`+statusList+`)
            and ari.employee_id = e.id
            and ari.ar_item_status_id = aris.id
            and ar.approve_request_status_id = ars.id
            order by ari.approve_date asc`

            let {rows: approvedata} = await client.query(query16)
            for(let el of approvedata) {
                el.approve_date = moment(new Date(el.approve_date)).format(
                    "DD.MM.YYYY HH:mm")
                if (el.approve_date == '01.01.1970 06:00') { el.approve_date = 'В очереди'}
            }

            employee['approvedata'] = approvedata
        } else {
            employee['approvedata_not_exists'] = 1
        }


        let query17 = `select t3.last_name_rus as last_name,
        t3.first_name_rus as first_name,
        t3.middle_name_rus as middle_name,
        t4.name_rus as position_name,
        hr.retEmpFullDepList(t3.id) as department_full_list
        from hr.request t1, hr.user t2, hr.employee t3, hr.position t4 where t1.id = ${bind.requestid}
        and t1.create_user = t2.username and t2.id = t3.id and t3.position_id = t4.id`

        let {rows: requestcreatordata} = await client.query(query17)

        employee['requestcreator'] = requestcreatordata[0]

                employee['generate_date'] = moment(new Date()).format("DD.MM.YYYY HH:mm")


        return employee
    } catch (err) {
        log.error(err);
        throw err;
    } finally {
        if (client) {
            await client.end()
        }
    }
}