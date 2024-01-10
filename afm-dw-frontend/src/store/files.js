import Vue from 'vue';

export default {
  state: {
    files: [
      {
        objectType: '',
        object: '',
      }
    ],
  },
  mutations: {
    add_file (state, data) {
      state.files.push(data) 
    },
  },
  actions: {
    async LOAD_FILE({commit, state}, payload) {
      let isFinded = state.files.find( el => {
          el.objectType == payload.objectType && el.object == payload.object
      }) 

            if(!isFinded) {
        let data = await Vue.prototype.$getBackendMinioFile(payload.object, payload.objectType)

                if(data!='') {
          commit('add_file', {
              src: data,
              objectType: payload.objectType,
              object: payload.object
          })
        }
      }
    }
  },
  getters: {
    FILES (state) {
      return state.files
    },
  }
}