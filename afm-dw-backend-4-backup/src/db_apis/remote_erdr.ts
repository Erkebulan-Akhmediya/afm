import log from '../config/logger';
import get_client from '../loaders/database';

export async function erdr_get (bind: any): Promise<any[]> {
    let client
    try {
        client = get_client(); await client.connect()
        let query = `
          select 
          t.id,
          t.emp_iin,
          t.emp_name,
          p.name_rus as position,
          d.name_rus as department,
          e.id as employee_id,
          o.name_rus as state_name,
          t.score,
          '1.Возм.ущерба' as p10_04_code,
          p10_04,
          '2.1.1 В суд по ч.1 ст.262-265 УК' as p21_02_code,
          p21_02,
          '2.2.1 В суд по ст.ст.189  ч.2-4, 190 ч.2-4,  197 ч.4, 216 ч.2-4, 231, 234 ч.2-3, 235, 236 ч.3, 237 ч.2, 238 ч.2, 239 ч.2-3, 245 ч.3, 249, 253 ч.4-6, 258, 286 ч.4, 287 ч.4, 307 ч.3 УК' as p22_02_code,
          p22_02,
          '2.2.2 НРО по ст.ст.189  ч.2-4, 190 ч.2-4,  197 ч.4, 216 ч.2-4, 231, 234 ч.2-3, 235, 236 ч.3, 237 ч.2, 238 ч.2, 239 ч.2-3, 245 ч.3, 249, 253 ч.4-6, 258, 286 ч.4, 287 ч.4, 307 ч.3 УК' as p22_04_code,
          p22_04,
          '2.3.1 В суд по ч.1 ст. 217 УК' as p23_02_code,
          p23_02,
          '2.3.2 НРО по ч.1 ст. 217 УК' as p23_04_code,
          p23_04,
          '2.3.3 В суд по ч.2 ст. 217 УК' as p23_06_code,
          p23_06,
          '2.3.4 НРО по ч.2 ст. 217 УК' as p23_08_code,
          p23_08,
          '2.3.5 В суд по ч.3 ст. 217 УК' as p23_10_code,
          p23_10,
          '2.3.6НРО по ч.3 ст. 217 УК' as p23_12_code,
          p23_12,
          '2.4.1 В суд по ст. 218 УК' as p24_02_code,
          p24_02,
          '2.4.2 НРО по ст. 218 УК' as p24_04_code,
          p24_04,
          '2.5.1 В суд остальные статьи' as p25_02_code,
          p25_02,
          '2.5.2 НРО остальные статьи' as p25_04_code,
          p25_04
          from temp_rate2 t 
          left join hr.employee e on e.identification_number = t.emp_iin
          join hr.position p on p.id = e.position_id
          join hr.department d on d.id = e.department_id
          join hr.organization o on o.id = d.organization_id
          order by t.score desc
          `

        const {rows: data}: any = await client.query(query)
        return data

    } catch (err) {
        log.error(err)
        throw err
    } finally {
        if (client) {
            await client.end()
        }
    }
}