import axios from 'axios'
import Vue from 'vue';

export default {
    state: {
      notifications: []
    },
    mutations: {
      SET_NOTIFICATIONS(state, data) {
        state.notifications = data
      }
    },
    actions: {
      async GET_NOTIFICATIONS({commit}){
        let locals = {
          user_id: Vue.prototype.$userData.id,
          unread: true,
        }

          let {data} = await axios.get('/api/1.0/notification/', {params: locals})
        commit('SET_NOTIFICATIONS', data)
      },
      async READ_NOTIFICATION({dispatch}, payload){
        const locals = {
          status: 'readed'
        }
        await axios.put(`/api/1.0/notification/${payload.recipient_id}`, locals)
        dispatch('GET_NOTIFICATIONS')
      }
    },
    getters: {
        ALL_NOTIFICATIONS(state) {
            return state.notifications
        },
        APPROVE_REQUEST_NOTIFICATIONS(state) {
            let data = state.notifications.filter(el=>el.subject == 'Согласование')
            return data
        },
     }

      }