import moment from 'moment'
export default function is_late_comes_v4( acsData: any, tzminutes = 0) {

    let returnData = {
        iin: '',
        acs_status: '',

                is_violator: false, 
        is_psbl_explanatory: false, 
        enterTime: 0,
        is_error: false
    }

    returnData.iin = acsData.iin 

    if (acsData.Periods.length != 1) {
        returnData.acs_status = 'Ошибка СКУД: Не получены данные (periods)' 
        returnData.is_error = true
        return returnData
    }

    let enterTime 
    returnData.acs_status = acsData.Periods[0].Period.Status 

    if (returnData.acs_status == 'Отсутствует вход') {
        returnData.is_violator = true
        returnData.is_psbl_explanatory = true
        return returnData
    } 

    if (!acsData.Periods[0].Period.hasOwnProperty('Row') || (acsData.Periods[0].Period.hasOwnProperty('Row') && acsData.Periods[0].Period.Row.length == 0)) {

        if (returnData.acs_status == 'Опоздание' || returnData.acs_status == '') {
            returnData.acs_status = 'Ошибка СКУД: Не получены данные по входу'
            returnData.is_error = true
            return returnData
        }
        else {
            return returnData
        }
    }

    let skudTime, skudEmployeeData = [] 
    for (var i = 0; i < acsData.Periods[0].Period.Row.length; i++){ 
        if (acsData.Periods[0].Period.Row[i].Time.split(':')[0].length == 1) {
            skudTime = '0' + acsData.Periods[0].Period.Row[i].Time.split(':')[0] + ':' + acsData.Periods[0].Period.Row[i].Time.split(':')[1] + ':' + acsData.Periods[0].Period.Row[i].Time.split(':')[2]
        } else {
            skudTime = acsData.Periods[0].Period.Row[i].Time.split(':')[0] + ':' + acsData.Periods[0].Period.Row[i].Time.split(':')[1] + ':' + acsData.Periods[0].Period.Row[i].Time.split(':')[2]
        }

        skudEmployeeData.push({
            "date": acsData.Periods[0].Period.Date + "T" + skudTime, 
            "entry": acsData.Periods[0].Period.Row[i].Entry
        })
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

    if (returnData.acs_status == 'Опоздание') {
        returnData.is_violator = true
        returnData.is_psbl_explanatory = true
        returnData.enterTime = enterTime
        return returnData
    } 
    else if (returnData.acs_status == '') {
        returnData.is_violator = isLateSecondHalfDay
        returnData.enterTime = enterTime
        return returnData
    }
    else {
        returnData.enterTime = enterTime
        return returnData
    }
}