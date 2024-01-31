import config from '../config/config'
import axios from 'axios'
import log from '../config/logger';

export async function send_employee_1c (sendObj: any) {
  let headers: any = {
    Authorization: `${config.get('rest:Auth_key')}`,
    "Content-Type": "application/json"
  }

  try {

    console.time('send1C_Сandidates')

    await axios.post(`${config.get('rest:candidates')}`, sendObj, {headers}).catch((error) => {
        log.error(error)
        throw error.response.data.errMsg
    })

  } catch (err) {
    log.error(err)
  } finally{
    console.timeEnd('send1C_Сandidates')
  }
}