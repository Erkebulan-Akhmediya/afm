import axios from 'axios'
export default {
    state: {
        emails: [],
        emailsBackup: [],
        message: [],
        emailboxes: [],
        boxloading: false,
        boxesloading: false,
        searchedEmails: [],
        selectedBox: '',
        emailPaging: {
            limit: 13,
            offset: 0,
            currentPage: 1,
            pages: 1
        },
        isMailDetail: false,
        mailError: null
    },
    mutations: {
        SET_EMAILS:(state, emails) => {
            state.emails = emails;
            state.emailsBackup = emails
        },
        SET_MESSAGE:(state, email) => {
            if((typeof email) == 'string') {
                state.message = state.emails.find(item => item.uid == email)
            } else {
                state.message = email
            }
        },
        SET_EMAIL_BOXES:(state, eboxes) => {
            state.emailboxes = eboxes
        },
        SET_BOX_LOADING:(state, load) => {
            state.boxloading = load
        },
        SET_BOXES_LOADING:(state, load) => {
            state.boxesloading = load
        },
        SET_BOX_SELECTED:(state, box)=>{
            state.selectedBox = box
        },
        SET_SEARCHED_EMAILS:(state, searchString) => {
            searchString = searchString.toLowerCase()
            let searched =  state.emails.filter((item) => item.subject.toLowerCase().includes(searchString)  || item.from_email_name.toLowerCase().includes(searchString))
            if (searched.length===0 || searchString == ''){
                state.emails = state.emailsBackup
            } else {
                state.emails =  searched
            }       
        }, 
        SET_EMAIL_PAGING:(state, data) => {
            state.emailPaging.currentPage = data.currentPage
        },
        SET_MAIL_DETAIL:(state, bool) => {
            state.isMailDetail = bool
        },
        SET_READED_MAIL:(state, mailId) => {
            let arr = state.emails
            let index =  arr.findIndex(el=>{
                if(el.id === mailId){
                    return true
                }
            })
            state.emails[index].flags = state.emails[index].flags.filter(el=>el!='unread')
        },
        SET_ERROR:(state, data) => {
            state.mailError = data
        },
    },
    actions: {

                async GET_MESSAGE({commit}, payload) {
            commit('SET_MESSAGE', payload)
            await axios.post("/api/1.0/email/read", {email_id: [payload.id]});
            commit('SET_READED_MAIL', payload.id)
        },
        async READ_MESSAGE({commit}, payload){
            console.log(payload)
            await axios.post("/api/1.0/email/read", {email_id: payload.ids, unseen : payload.unseen});
            console.log(commit)
        },
        SET_ERROR_ACTION({commit}, err) {
            commit('SET_ERROR', err)
        },
        async GET_EMAILBOXES_FROM_API({commit}) {
            try {
                commit('SET_BOXES_LOADING', true)
                let boxes = await axios.get("/api/1.0/emailbox");

                var sortedOutput = [];
                var insertedCheckFlag;
                for (var i = 0, ii = boxes.data.length ; i < ii ; i++){
                    insertedCheckFlag = false;
                    for (var j = 0, jj = sortedOutput.length ; j < jj ; j++){
                        if ((boxes.data[i].view_priority ? boxes.data[i].view_priority : 10000) < (sortedOutput[j].view_priority ? sortedOutput[j].view_priority : 10000)){
                            insertedCheckFlag = true;
                            sortedOutput.splice(j, 0, boxes.data[i]);
                            break;
                        }
                    }
                    if (!insertedCheckFlag) {
                        sortedOutput.push(boxes.data[i])
                    }
                }

                commit('SET_EMAIL_BOXES', sortedOutput)
                commit('SET_BOXES_LOADING', false)
            }
            catch (error) {
                commit('SET_ERROR', error)
                commit('SET_BOXES_LOADING', false)
            }
        },
        async GET_EMAILS_IN_BOX_API({commit,state}, payload) {
            commit('SET_BOX_LOADING', true)

                        let emails = await axios.get("/api/1.0/emailinbox_base/", {params:payload});
            if(emails.data.length == 0) {
                payload.currentPage = 1
                payload.offset = 0
                emails = await axios.get("/api/1.0/emailinbox_base/", {params:payload});
            }

            commit('SET_EMAILS', emails.data)
            commit('SET_BOX_LOADING', false)
            commit('SET_BOX_SELECTED', payload)
            commit('SET_EMAIL_PAGING', payload)
            if(state.message?.uid) {
                commit('SET_MESSAGE', state.message.uid)
            }
        },
        async GET_IMPORTANT_EMAIL_API({commit,state}, payload) {
            commit('SET_BOX_LOADING', true)
            let emails = await axios.get("/api/1.0//email/important", {params:payload});
            if(emails.data.length == 0) {
                payload.currentPage = 1
                payload.offset = 0
                emails = await axios.get("/api/1.0//email/important", {params:payload});
            } 
            commit('SET_EMAILS', emails.data)
            commit('SET_BOX_LOADING', false)
            commit('SET_BOX_SELECTED', payload)
            commit('SET_EMAIL_PAGING', payload)
            if(state.message?.uid) {
                commit('SET_MESSAGE', state.message.uid)
            }
        },
        SEARCH_EMAIL({commit},payload) {
            commit('SET_SEARCHED_EMAILS', payload)   
        },
        async EMAIL_ADD_FLAGS({state, dispatch, commit}, payload) {    
            commit('SET_BOX_LOADING', true)        
            await axios.post("/api/1.0/email/addflag", {box:state.selectedBox.system_name, uids: payload});
            commit('SET_BOX_LOADING', false)
            dispatch('GET_EMAILS_IN_BOX_API', state.selectedBox)
        },
        async EMAIL_DEL_FLAGS({state, dispatch, commit}, payload) {
            commit('SET_BOX_LOADING', true)
            await axios.post("/api/1.0/email/delflag", {box:state.selectedBox.system_name, uids: payload});
            commit('SET_BOX_LOADING', false)
            dispatch('GET_EMAILS_IN_BOX_API', state.selectedBox)
        },
        async EMAIL_TO_TRASH({state, dispatch, commit}, payload) {
            commit('SET_BOX_LOADING', true)
            await axios.post("/api/1.0/email/totrash", {box:state.selectedBox.system_name, uids: payload});
            commit('SET_BOX_LOADING', false)
            dispatch('GET_EMAILS_IN_BOX_API', state.selectedBox)
        },
        async MOVE_EMAIL_TO({state, dispatch, commit}, payload) {
            commit('SET_BOX_LOADING', true)
            await axios.post("/api/1.0/email/moveto", {box:state.selectedBox.system_name, uids: payload.uids, boxTo: payload.boxTo.system_name});
            commit('SET_BOX_LOADING', false)
            dispatch('GET_EMAILS_IN_BOX_API', state.selectedBox)
        },
        async PREV_NEXT_EMAIL({commit, state}, payload) {
            const uid = state.message.uid
            let current = state.emails.findIndex(el=>el.uid == uid)

            if(payload == 'next') {
                if (current+1 < state.emails.length && current+1 < 13){
                    commit('SET_MESSAGE', state.emails[current+1].uid)
                    console.log(state.emails[current + 1])
                    await axios.post("/api/1.0/email/read", {email_id: state.emails[current+1].id});
                    commit('SET_READED_MAIL', state.emails[current+1].id)
                } else {
                    commit('SET_MESSAGE', state.emails[0].uid)
                    await axios.post("/api/1.0/email/read", {email_id: state.emails[0].id});
                    commit('SET_READED_MAIL', state.emails[0].id)
                }
            }
            if (payload == 'prev') {
                if(current-1>=0){
                    commit('SET_MESSAGE', state.emails[current-1].uid)
                    await axios.post("/api/1.0/email/read", {email_id: state.emails[current-1].id});
                    commit('SET_READED_MAIL', state.emails[current-1].id)
                }
                else {
                    let last = state.emails.length>9?state.emails.length-1:state.emails.length
                    commit('SET_MESSAGE', state.emails[last-1].uid)
                    await axios.post("/api/1.0/email/read", {email_id: state.emails[last-1].id});
                    commit('SET_READED_MAIL', state.emails[last-1].id)
                }
            }
        }
    },
    getters: {
        EMAILS(state) {
            return state.emails;
        },
        MESSAGE(state) {
            return state.message;
        },
        BOXES(state) {
            return state.emailboxes.filter(el=>el!='Drafts'&&el!='Spam'&&el!='Outbox')
        },
        DEFAULT_BOXES(state) {
            return state.emailboxes.filter(el=>(el.system_name=='Drafts'||el.system_name=='Spam'||el.system_name=='INBOX'||el.system_name=='Sent'||el.system_name=='Trash')&&el.system_name!='Drafts')
        },
        CUSTOM_BOXES(state) {
            return state.emailboxes.filter(el=>el.system_name!='Drafts'&&el.system_name!='Spam'&&el.system_name!='Outbox'&&el.system_name!='INBOX'&&el.system_name!='Sent'&&el.system_name!='Trash')
        },
        BOX_IS_LOAD(state) {
            return state.boxloading
        },
        BOXES_IS_LOAD(state) {
            return state.boxesloading
        },
        SEARCHED_EMAILS(state) {
            return state.searchedEmails 
        },
        SELECTED_BOX(state) {
            return state.selectedBox
        },
        EMAIL_PAGGING(state) {
            return state.emailPaging
        },
        IS_MAIL_DETAIL(state) {
            return state.isMailDetail
        }
    }
}