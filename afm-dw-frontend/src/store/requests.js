export default {
    state() {
      return {
        request_type_id: '',
        request_sub_type_id: '',
        request_name: ''
      }
    },
    mutations: {
      SET_REQUEST_TYPES(state, payload) {
        state.request_name = payload.request_name
        state.request_type_id = payload.request_type_id
        state.request_sub_type_id = payload.request_sub_type_id
      }
    },
    actions: {
        FAST_LINK_TO_CREATE_REQUEST({commit}, payload) {
            commit('SET_REQUEST_TYPES', payload)
        },
        CLEAR_VUEX_REQUEST({commit}) {
            let payload = {
                request_name: '',
                request_type_id: '',
                request_sub_type_id: '',
              }
            commit('SET_REQUEST_TYPES', payload)
        }
    },
    getters: {

           }
}