import Vue from 'vue'
import Vuex from 'vuex'
import chat from './store/chat'
import email from './store/email'
import pass_request from './store/pass_request'
import requests from './store/requests'
import employee from './store/employee'
import report_list from './store/report_list'
import files from './store/files'
import appeal from './store/appeal'
import servicerequest from './store/servicerequest'
import notification from './store/notification'

Vue.use(Vuex)


const state = {
    role: '',
    roleName: '',
    openDepartments: [],
    lastEmployee : '',
}

const getters = {
}

const actions = {
}


const mutations = {
    role(state, role) {
        state.role = role;
    },

    roleName(state, role) {
        state.roleName = role;
    },

    openDepartments(state, {level, value}) {
        state.openDepartments.splice(level, state.openDepartments.length)
        if(value || value === 0) {
            state.openDepartments[level] = value
        }
    },

    lastEmployee(state, id) {
        state.lastEmployee = id;
    },
}

export default new Vuex.Store({
    state,
    mutations,
    getters,
    actions,
    plugins: [

            ],
    modules: {
        chat,
        email,
        pass_request,
        requests,
        employee,
        report_list,
        files,
        appeal,
        servicerequest,
        notification
    }
  })
