import moment from 'moment'

export default function is_late_comes( acsData: any, tzminutes = 0) {
    let time: String = `T09:00:00`

       let enterTimes = acsData.reduce((acc: any, item : any) => { 
        if(moment(item.date).isBefore(moment().add(tzminutes, 'minutes').format('YYYY-MM-DD') + time) && JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
            acc = item.date
        }
        return acc
    }, 0)

    let exitTimes = acsData.reduce((acc: any, item : any) => { 
        if(moment(item.date).isBefore(moment().add(tzminutes, 'minutes').format('YYYY-MM-DD') + time) && !JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
            acc = item.date
        }
        return acc
    }, 0)

    let is_late
    let is_first_late = false
    is_late = moment(enterTimes).isSameOrBefore(moment(exitTimes))
    if(!enterTimes || is_late) {
        let now = moment().add(tzminutes, 'minutes')
        enterTimes = acsData.reduce((acc: any, item : any) => { 
            if(moment(item.date).isAfter(moment().add(tzminutes, 'minutes').format('YYYY-MM-DD') + time) && JSON.parse(item.entry) && moment(item.date).isBefore(moment(acc))) {
                acc = item.date
            }
            return acc
        }, now)
        if(now == enterTimes) {
            enterTimes = 0
        }

        is_late = true
        is_first_late = true
    }

    if(moment().isAfter(moment(moment().add(tzminutes, 'minutes').format('YYYY-MM-DD') + `T14:30:00`))) {
        time = `T14:30:00`
        if(!is_late) {
            enterTimes = acsData.reduce((acc: any, item : any) => { 
                if(moment(item.date).isBefore(moment().add(tzminutes, 'minutes').format('YYYY-MM-DD') + time) && JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
                    acc = item.date
                }
                return acc
            }, 0)

                exitTimes = acsData.reduce((acc: any, item : any) => { 
                if(moment(item.date).isBefore(moment().add(tzminutes, 'minutes').format('YYYY-MM-DD') + time) && !JSON.parse(item.entry) && moment(item.date).isAfter(moment(acc))) {
                    acc = item.date
                }
                return acc
            }, 0)
            is_late = moment(enterTimes).isSameOrBefore(moment(exitTimes))
            if(!enterTimes || is_late) {
                let now = moment().add(tzminutes, 'minutes')
                enterTimes = acsData.reduce((acc: any, item : any) => { 
                    if(moment(item.date).isAfter(moment().add(tzminutes, 'minutes').format('YYYY-MM-DD') + time) && JSON.parse(item.entry) && moment(item.date).isBefore(moment(acc))) {
                        acc = item.date
                    }
                    return acc
                }, now)
                if(now == enterTimes) {
                    enterTimes = 0
                }

                        is_late = true
            }
        }
    }
    return {is_late,
        enterTimes, exitTimes, is_first_late
    }
}