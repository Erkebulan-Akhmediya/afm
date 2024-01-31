import moment from 'moment'
export default function is_late_comes_v3( acsData: any, tzminutes = 0) {

    let returnData: { acs_status: any, date: any, first_entry_date: any, last_exit_date: any, entryData: any, officeTime: any, officeTimeDisplay: any, is_violator: any, is_psbl_explanatory: any, enterTime: any, is_error: any } = {
        acs_status: '', 
        date: acsData.Period.Date, 
        first_entry_date: '', 
        last_exit_date: '', 
        entryData : [],
        officeTime: 0,  
        officeTimeDisplay: '00:00', 
        is_violator: false, 
        is_psbl_explanatory: false, 
        enterTime: '', 
        is_error: false
    };

    if (acsData.Period.Status == 'Отсутствует вход' || acsData.Period.Status == 'Опоздание') {
        acsData.Period.Status = ''
    }
    returnData.acs_status = acsData.Period.Status

    if (!acsData.Period.hasOwnProperty('Row') || (acsData.Period.hasOwnProperty('Row') && acsData.Period.Row.length == 0)) {
        returnData.acs_status = acsData.Period.Status == '' ? 'Отсутствует вход' : acsData.Period.Status
        returnData.is_violator = acsData.Period.Status == '' ? true : false 
        returnData.is_psbl_explanatory = true 
        return returnData
    }

    let skudTime, skudEmployeeData = [] 
    for (var i = 0; i < acsData.Period.Row.length; i++){ 
        if (acsData.Period.Row[i].Time.split(':')[0].length == 1) {
            skudTime = '0' + acsData.Period.Row[i].Time.split(':')[0] + ':' + acsData.Period.Row[i].Time.split(':')[1] + ':' + acsData.Period.Row[i].Time.split(':')[2]
        } else {
            skudTime = acsData.Period.Row[i].Time.split(':')[0] + ':' + acsData.Period.Row[i].Time.split(':')[1] + ':' + acsData.Period.Row[i].Time.split(':')[2]
        }

        skudEmployeeData.push({
            "date": acsData.Period.Date + "T" + skudTime, 
            "entry": acsData.Period.Row[i].Entry
        })
    }

    let currDateTime_00_00 = moment(acsData.Period.Date + `T00:00:00`)
    let currDateTime_23_59 = moment(acsData.Period.Date + `T23:59:59`)

    let let1 : any, let2 : any
    returnData.entryData = skudEmployeeData.sort(function (a, b) {
        let1 = moment(a.date)
        let2 = moment(b.date)
        return let1 - let2;
    });

    let entryDate : any = 0
    for (const item1 of returnData.entryData) {
        if (moment(item1.date).isAfter(currDateTime_00_00)) {

                        if (item1.entry) { 
                entryDate = moment(item1.date)
                break;
            }
        }
    }

    if (entryDate == 0) {
        returnData.acs_status = acsData.Period.Status == '' ? 'Отсутствует вход' : acsData.Period.Status
        returnData.is_violator = acsData.Period.Status == '' ? true : false 
        returnData.is_psbl_explanatory = true 
        return returnData
    }

    entryDate = 0
    let exitDate : any = currDateTime_00_00
    let sumOfficeMinutes : number = 0

    for (const item1 of returnData.entryData) {
        if (moment(item1.date).isAfter(exitDate)) {

                        if (item1.entry) { 
                entryDate = moment(item1.date)
                exitDate = 0
                for (const item2 of returnData.entryData) {
                    if (moment(item2.date).isAfter(entryDate)) {

                                                if (!item2.entry) {  
                            exitDate = moment(item2.date)
                            break;
                        }
                    }
                }

                if (exitDate != 0) {
                    sumOfficeMinutes = sumOfficeMinutes + exitDate.diff(entryDate, 'minutes')
                } else {
                    if (acsData.Period.Date == moment().utc().add(tzminutes, 'minutes').format('YYYY-MM-DD')) {
                        exitDate = moment(moment().utc().add(tzminutes, 'minutes'))
                    } else {
                        exitDate = moment(currDateTime_23_59)

                    }
                    sumOfficeMinutes = sumOfficeMinutes + exitDate.diff(entryDate, 'minutes')
                }

            }
        }
    }

    returnData.officeTime = (sumOfficeMinutes / 60).toFixed(2)
    let hours : any = Math.floor(sumOfficeMinutes / 60);
    hours = hours < 10 ? `0${hours}` : hours;
    let min :any = sumOfficeMinutes % 60;
    min = min < 10 ? `0${min}` : min;

    returnData.officeTimeDisplay = `${hours}:${min}`

    entryDate = 0
    for (const item1 of returnData.entryData) {
        if (moment(item1.date).isAfter(currDateTime_00_00)) {

                        if (item1.entry) { 
                entryDate = moment(item1.date)
                break;
            }
        }
    }

    returnData.first_entry_date = entryDate.format('YYYY-MM-DD HH:mm:ss')

    entryDate = 0
    for (const item1 of returnData.entryData) {
        if (moment(item1.date).isAfter(currDateTime_00_00)) {

                        if (item1.entry) { 
                entryDate = moment(item1.date)
            }
        }
    }

    exitDate = 0
    for (const item1 of returnData.entryData) {
        if (moment(item1.date).isAfter(currDateTime_00_00)) {

                        if (!item1.entry) { 
                exitDate = moment(item1.date)
            }
        }
    }

    let isEmployeeInBuilding
    if (exitDate == 0) {
        isEmployeeInBuilding = true
        returnData.last_exit_date = ''
    } else {
        if (exitDate.isAfter(entryDate)) {
            isEmployeeInBuilding = false
            returnData.last_exit_date = exitDate.format('YYYY-MM-DD HH:mm:ss')
        } else {
            isEmployeeInBuilding = true
            returnData.last_exit_date = ''
        }
    }

    let currDateTime_06_00 = moment(acsData.Period.Date + `T06:00:00`)

    entryDate = 0
    for (const item1 of returnData.entryData) {
        if (moment(item1.date).isAfter(currDateTime_06_00)) {

                        if (item1.entry) { 
                entryDate = moment(item1.date)
                break;
            }
        }
    }

    if (entryDate == 0) {
        if (isEmployeeInBuilding) {

                        entryDate = 0
            entryDate = returnData.entryData.reduce((acc: any, item : any) => { 
                if (moment(item.date).isBefore(currDateTime_06_00) && JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
                    acc = item.date
                }
                return acc
            }, 0)

            if (entryDate == 0) {
                returnData.is_error = true
                return returnData
            }

            entryDate = moment(entryDate)
        } else {
            returnData.acs_status = acsData.Period.Status == '' ? 'Отсутствует вход' : acsData.Period.Status
            returnData.is_violator = acsData.Period.Status == '' ? true : false 
            returnData.is_psbl_explanatory = true 
            return returnData
        }
    }

    returnData.enterTime = entryDate.format('YYYY-MM-DD HH:mm:ss')

    let currDateTime_09_00 = moment(acsData.Period.Date + `T09:00:00`)
    let currDateTimeWithTMZ = moment(moment().utc().add(tzminutes, 'minutes').format('YYYY-MM-DDTHH:mm:ss'))
    let currDateTime_14_30 = moment(acsData.Period.Date + `T14:30:00`)

    if (entryDate.isAfter(currDateTime_09_00)) {
        returnData.is_violator = acsData.Period.Status == '' ? true : false 
        returnData.acs_status = acsData.Period.Status == '' ? 'Опоздание' : acsData.Period.Status

            returnData.is_psbl_explanatory = true  
    }

    if (currDateTimeWithTMZ.isAfter(currDateTime_14_30)) {

                entryDate = 0
        entryDate = returnData.entryData.reduce((acc: any, item : any) => { 
            if (moment(item.date).isBefore(currDateTime_14_30) && JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
                acc = item.date
            }
            return acc
        }, 0)

        exitDate = 0
        exitDate = returnData.entryData.reduce((acc: any, item : any) => { 
            if (moment(item.date).isBefore(currDateTime_14_30) && !JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
                acc = item.date
            }
            return acc
        }, 0)

        let isLateSecondHalfDay = moment(entryDate).isSameOrBefore(moment(exitDate))

        if (isLateSecondHalfDay) {
            returnData.is_violator = acsData.Period.Status == '' ? true : false 

            entryDate = 0
            entryDate = skudEmployeeData.reduce((acc: any, item : any) => { 
                if (moment(item.date).isAfter(currDateTime_14_30) && JSON.parse(item.entry) && moment(item.date).isBefore(moment(acc))) {
                    acc = item.date
                }
                return acc
            }, currDateTime_23_59)

                        if(currDateTime_23_59 == entryDate) {
                entryDate = 0 
            }
        }

        returnData.enterTime = entryDate == 0 ? returnData.enterTime : moment(entryDate).format('YYYY-MM-DD HH:mm:ss')
    }

    returnData.acs_status = returnData.acs_status == '' ? 'Без опозданий' : returnData.acs_status
    return returnData
}