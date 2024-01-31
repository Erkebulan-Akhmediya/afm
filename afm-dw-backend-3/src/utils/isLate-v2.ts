import moment from 'moment'
export default function is_late_comes_v2( acsData: any, tzminutes = 0) {

    if (acsData == undefined) {
        return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: 'Ошибка получения данных СКУД (код 1)' , is_error: true }
    }

    if (!JSON.parse(acsData.result)) {
        return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: acsData.description , is_error: true }
    }

    if (acsData.data.length != 1) {
        return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: 'Ошибка получения данных СКУД (код 2)' , is_error: true }
    }

    if (acsData.data[0].status != 'Отсутствует вход' && acsData.data[0].status != 'Опоздание' && acsData.data[0].status != 'Отпуск' && acsData.data[0].status != 'Командировка' && acsData.data[0].status != 'Больничный' && acsData.data[0].status != '') {
        return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: 'Ошибка получения данных СКУД (код 3)' , is_error: true }
    }

    let enterTime 
    let acs_status = acsData.data[0].status 

    if (!acsData.data[0].hasOwnProperty('rows') || (acsData.data[0].hasOwnProperty('rows') && acsData.data[0].rows.length == 0)) {
        if (acs_status == 'Отсутствует вход') {
            return { is_violator: true, is_psbl_explanatory: true, enterTime: 0, acs_status: acs_status, is_error: false }
        } 
        else if (acs_status == 'Отпуск' || acs_status == 'Командировка' || acs_status == 'Больничный') {
            return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: acs_status, is_error: false }
        } 
        else if (acs_status == 'Опоздание' || acs_status == '') {
            return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: 'Ошибка получения данных СКУД (код 4)' , is_error: true }
        }
        else {
            return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: 'Ошибка, обратитесь к администратору портала (код 1)', is_error: true }
        }
    }

    let skudEmployeeData = [] 

    for (var i = 0; i < acsData.data[0].rows.length; i++){ 
        skudEmployeeData.push({
            "date": acsData.data[0].date + "T" + acsData.data[0].rows[i].time, 
            "entry": acsData.data[0].rows[i].entry
        })
    }
    if (acs_status == 'Отсутствует вход') {
        let checkenterTime = skudEmployeeData.filter(function(item) {
            return JSON.parse(item.entry);
        });

        if (checkenterTime.length > 0) {
            return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: 'Ошибка получения данных СКУД (код 5)' , is_error: true }
        }
    } 

    let currDateTimeWithTMZ = moment(moment().utc().add(tzminutes, 'minutes').format('YYYY-MM-DDTHH:mm:ss'))
    let currDateTime_06_00 = moment(moment().utc().add(tzminutes, 'minutes').format('YYYY-MM-DD') + `T06:00:00`)
    let currDateTime_14_30 = moment(moment().utc().add(tzminutes, 'minutes').format('YYYY-MM-DD') + `T14:30:00`)
    let currDateTime_23_59 = moment(moment().utc().add(tzminutes, 'minutes').format('YYYY-MM-DD') + `T23:59:59`)
    enterTime = skudEmployeeData.reduce((acc: any, item : any) => { 
        if (moment(item.date).isAfter(currDateTime_06_00) && JSON.parse(item.entry) && moment(item.date).isBefore(moment(acc))) {
            acc = item.date
        }
        return acc
    }, currDateTime_23_59)

    if(currDateTime_23_59 == enterTime) {
        enterTime = 0
    }

    let isLateSecondHalfDay = false
    if (enterTime != 0) { 

        if (currDateTimeWithTMZ > currDateTime_14_30) {

            enterTime = skudEmployeeData.reduce((acc: any, item : any) => { 
                if (moment(item.date).isBefore(currDateTime_14_30) && JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
                    acc = item.date
                }
                return acc
            }, 0)

            let exitTimes = skudEmployeeData.reduce((acc: any, item : any) => { 
                if (moment(item.date).isBefore(currDateTime_14_30) && !JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
                    acc = item.date
                }
                return acc
            }, 0)

            isLateSecondHalfDay = moment(enterTime).isSameOrBefore(moment(exitTimes))

            if (isLateSecondHalfDay) {
                enterTime = skudEmployeeData.reduce((acc: any, item : any) => { 
                    if (moment(item.date).isAfter(currDateTime_14_30) && JSON.parse(item.entry) && moment(item.date).isBefore(moment(acc))) {
                        acc = item.date
                    }
                    return acc
                }, currDateTime_23_59)

                                if(currDateTime_23_59 == enterTime) {
                    enterTime = 0 
                }
            }
        }
    }

    if (acs_status == 'Опоздание') {
        return { is_violator: true, is_psbl_explanatory: true, enterTime: enterTime, acs_status: acs_status, is_error: false }
    } 
    else if (acs_status == 'Отпуск' || acs_status == 'Командировка' || acs_status == 'Больничный') {
        return { is_violator: false, is_psbl_explanatory: false, enterTime: enterTime, acs_status: acs_status, is_error: false }
    }
    else if (acs_status == '') {
        return { is_violator: isLateSecondHalfDay, is_psbl_explanatory: false, enterTime: enterTime, acs_status: '', is_error: false }
    }
    else if (acs_status == 'Отсутствует вход') {
        return { is_violator: true, is_psbl_explanatory: true, enterTime: 0, acs_status: acs_status, is_error: false }
    }
    else {
        return { is_violator: false, is_psbl_explanatory: false, enterTime: 0, acs_status: 'Ошибка, обратитесь к администратору портала (код 2)', is_error: true }
    }
}