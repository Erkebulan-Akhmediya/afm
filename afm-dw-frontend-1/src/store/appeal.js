import axios from "axios";
import Vue from 'vue';
import router from '@/router'

export default {
    state: {
      appeal_types: [],
      appeal_subtypes: [],
      appeal_status_list: [],
      appeal_expert_groups: [],
      appeals: [],
      is_sending_appeal: false,
      appeal_votes: [],
      secretary_list: [],
      appeal_current_tab: null,
      appeal_total: 0,
      voted_appeals_total: 0,
      notvoted_appeals_total: 0,
      appeals_voted: [],
      appeals_notvoted: [],
      appeal_table_type: null,

      appeals_options: {},
      appeals_voted_options: {},
      appeals_notvoted_options: {},

    },
    mutations: {
      change_appeal_table_type(state, value) {
        state.appeal_table_type = value
      },
      change_appeals_options(state, value) {
        state.appeals_options = value;
      },
      change_appeals_voted_options(state, value) {
        state.appeals_voted_options = value;
      },
      change_appeals_notvoted_options(state, value) {
        state.appeals_notvoted_options = value;
      },
        SET_APPEAL_TYPES: (state, data) => {
            state.appeal_types = data.types;
            state.appeal_subtypes = data.subtypes;
            state.appeal_status_list = data.status_list;
            state.appeal_expert_groups = data.appeal_experts;
          },

               SET_SENDING_APPEAL: (state, data) => {
          state.is_sending_appeal = data
        },
        SET_APPEAL_VOTES: (state, data) => {
          state.appeal_votes = data
        },
        SET_SECRETARY_LIST:(state, data) => {
          state.secretary_list = data
        },
        change_appeal_tab (state, value) {
          state.appeal_current_tab = value
        },
        SET_APPEALS: (state, data) => {
          state.appeals = data;
        },
        SET_APPEALS_TOTAL: (state, data) => {
          state.appeal_total = parseInt(data)
        },
        SET_VOTED_APPEALS: (state, data) => {
          state.appeals_voted = data;
        },
        SET_VOTED_APPEALS_TOTAL: (state, data) => {
          state.voted_appeals_total = parseInt(data)
        },
        SET_NOTVOTED_APPEALS: (state, data) => {
          state.appeals_notvoted = data;
        },
        SET_NOTVOTED_APPEALS_TOTAL: (state, data) => {
          state.notvoted_appeals_total = parseInt(data)
        }
    },
    actions: {
        async GET_APPEAL_TYPES_FROM_API({ commit }) {
          let url = "/api/1.0/appeal/types";

                    try {
            const {data} = await axios.get(url);
            await commit("SET_APPEAL_TYPES", data);
          } catch (error) {
            console.log(error);
            throw error;
          }
        },
        async POST_APPEAL_TO_API({commit}, payload) {
          commit("SET_SENDING_APPEAL", true);

          try {
            if (payload.id !=null) {              
              await axios.put(`/api/1.0/appeal/` + payload.id, payload);
            } else {
              let {data} = await axios.post(`/api/1.0/appeal`, payload);
              router.push(`/appeals/${data}`)
            }

          } catch (error) {
            console.log(error);
            throw error;
          } finally {
            commit("SET_SENDING_APPEAL", false);
          }
        },
        async GET_APPEALS_FROM_API({ commit }) {
          commit("SET_SENDING_APPEAL", true); 
          let url = "/api/1.0/appeal";
          try {
            const {data} = await axios.get(url);
            await commit("SET_APPEALS", data);

                     } catch (error) {
            console.log(error);

                        throw error;
          } finally {
            commit("SET_SENDING_APPEAL", false);
          }
        },
        async GET_APPEALS_WITH_PARAMS_FROM_API({ commit }, payload) {

                   commit("SET_SENDING_APPEAL", true); 
          let url = "/api/1.0/appeal";
          let params = {};
          if(payload.date) {
            payload.date = payload.date.sort()
            params.date_from = payload.date[0];
            params.date_end = payload.date[1];
          }
          if(payload.search_string) {
            params.search_string = payload.search_string;
          }
          if(payload.table_type) {
            params.table_type = payload.table_type;
          }
            params.page = payload.page?payload.page:1;
            params.itemsPerPage = payload.itemsPerPage?payload.itemsPerPage:10;
          if(payload.voted!=undefined) {
            params.voted = payload.voted
          }
          try {
            const data = await axios.get(url, {params});
            if(payload.table_type == 'with_me' && payload.voted == true) {
              commit("SET_VOTED_APPEALS_TOTAL", data.headers.total);
              commit("SET_VOTED_APPEALS", data.data);
            } else if(payload.table_type == 'with_me' && payload.voted == false) {
              commit("SET_NOTVOTED_APPEALS_TOTAL", data.headers.total);
              commit("SET_NOTVOTED_APPEALS", data.data);
            } else {

                            commit("SET_APPEALS_TOTAL", data.headers.total);
              commit("SET_APPEALS", data.data);
            }


                                } catch (error) {
            console.log(error);

                        throw error;
          } finally {
            commit("SET_SENDING_APPEAL", false);
          }
        },
        async CHANGE_APPEAL_STATUS_API({ dispatch, commit }, payload) {
          commit("SET_SENDING_APPEAL", true);
          let url = "/api/1.0/appeal/status/" + payload.id;
          try {
            if (payload.appeal_status_id == 4) {
              await axios.put(url, {id: payload.id, appeal_status_id: payload.appeal_status_id, expert_group_id: payload.expert_group_id, experts: payload.experts});
            }
            else if (payload.secretary_description) {
              await axios.put(url, {id: payload.id, appeal_status_id: payload.appeal_status_id, expert_group_id: payload.expert_group_id, secretary_description: payload.secretary_description});
            }
            else if(payload.performers) {
              await axios.put(url, {id: payload.id, appeal_status_id: payload.appeal_status_id, performers: payload.performers, expected_date_of_complete: payload.expected_date_of_complete});
            } 
            else {
              await axios.put(url, {id: payload.id, appeal_status_id: payload.appeal_status_id});
            }

                        dispatch('GET_APPEALS_FROM_API')

                     } catch (error) {
            console.log(error);

                        throw error;
          }
        },

        async GET_APPEAL_VOTES_FROM_API({ commit }, payload) {
          commit("SET_SENDING_APPEAL", true); 
          let url = `/api/1.0/appeal/${payload.appeal_id}/votes`;

                    try {
            const {data} = await axios.get(url);
            for(let el of data) {
              let src = await Vue.prototype.$getVuexStoreFile(el.user_id, 1)
              el['src'] = src
            }
            await commit("SET_APPEAL_VOTES", data);

                     } catch (error) {
            console.log(error);

                        throw error;
          }finally {
            commit("SET_SENDING_APPEAL", false);
          }
      },

      async POST_EXPERTGROUP_TO_API({dispatch, commit}, payload) {
        commit("SET_SENDING_APPEAL", true);
        try {
          let url = `/api/1.0/appeal/expert_group`;
          await axios.post(url, payload);

                 } catch (error) {
          console.log(error);
          throw error;
        } finally {
          dispatch("GET_APPEAL_TYPES_FROM_API");
          commit("SET_SENDING_APPEAL", false);
        }
      },
      async DELETE_EXPERTGROUP_FROM_API({dispatch, commit}, payload) {
        commit("SET_SENDING_APPEAL", true);
        try {
          let url = `/api/1.0/appeal/expert_group/delete`;
          await axios.post(url, payload);

                 } catch (error) {
          console.log(error);
          throw error;
        } finally {
          dispatch("GET_APPEAL_TYPES_FROM_API");
          commit("SET_SENDING_APPEAL", false);
        }
      },
      async POST_EXPERT_TO_API({dispatch, commit}, payload) {
        commit("SET_SENDING_APPEAL", true);
        try {
          let url = `/api/1.0/appeal/expert_group/expert`;
          await axios.post(url, payload);

                 } catch (error) {
          console.log(error);
          throw error;
        } finally {
          dispatch("GET_APPEAL_TYPES_FROM_API");
          commit("SET_SENDING_APPEAL", false);
        }
      },
      async DELETE_EXPERT_TO_API({dispatch, commit}, payload) {
        commit("SET_SENDING_APPEAL", true);

                try {
          let url = `/api/1.0/appeal/expert_group/expert/delete`;
          await axios.post(url, payload);

                 } catch (error) {
          console.log(error);
          throw error;
        } finally {
          dispatch("GET_APPEAL_TYPES_FROM_API");
          commit("SET_SENDING_APPEAL", false);
        }
      },
      async GET_SECRETARY_LIST({commit}) {

               let {data: array} = await axios.get('/api/1.0/lov/ref.sys_all_const', {params: {name: 'appealSecretaryList'}})

               const appeal_secretary_list = array[0].const_value.split(',').reduce((acc, item) => {
          acc.push(item)
          return acc
        }, [])
        commit("SET_SECRETARY_LIST", appeal_secretary_list);
      },
    },
    getters: {
      APPEAL_TYPES(state) {
        return state.appeal_types
      },
      APPEAL_SUBTYPES(state) {
        return state.appeal_subtypes
      },
      APPEALS(state) {
        return state.appeals
      },
      EXPERT_GROUPS(state) {
        return state.appeal_expert_groups
      },
      APPEAL_VOTES(state) {
        return state.appeal_votes
      },
      APPEAL_STATUS_LIST(state) {
        return state.appeal_status_list
      },
      IS_SENDING_APPEAL(state) {
        return state.is_sending_appeal
      },
      ACTIVE_EXERT_GROUPS(state) {
        let data = state.appeal_expert_groups.filter(el=>el.is_active===true)
        return data
      },
      SECRETARY_LIST(state) {
        return state.secretary_list
      },
      appeal_current_tab (state) {
        return state.appeal_current_tab
      },
      APPEALS_TOTAL(state) {
        return state.appeal_total
      },
      VOTED_APPEALS_TOTAL(state) {
        return state.voted_appeals_total
      },
      NOTVOTED_APPEALS_TOTAL(state) {
        return state.notvoted_appeals_total
      },
      VOTED_APPEALS(state) {
        return state.appeals_voted
      },
      NOTVOTED_APPEALS(state) {
        return state.appeals_notvoted
      },
      appeal_table_type(state) {
        return state.appeal_table_type
      },
      appeals_options(state) {
        return state.appeals_options
      },
      appeals_voted_options(state) {
        return state.appeals_voted_options
      },
      appeals_notvoted_options(state) {
        return state.appeals_notvoted_options
      },
    }
}