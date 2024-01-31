import axios from "axios";
import Vue from "vue";

export default {
  state: {
    servicerequest_categories: [],
    servicerequest_subcategories: [],
    servicerequest_current_tab: 0,
    servicerequests: [],
    current_filter: 'my',
    servicerequests_count: 0,
    is_sending_servicerequest: false,
    performer_groups: [],
    performers: [],
    servicerequest: {},
  },
  mutations: {
    change_servicerequest_tab(state, value) {
      state.servicerequest_current_tab = value;
    },
    SET_CURRENT_FILTER(state, value) {
      state.current_filter = value
    },
    SET_SERVICEREQUEST_TYPES: (state, data) => {
      state.servicerequest_categories = data.categories;
      state.servicerequest_subcategories = data.subcategories;
      state.performer_groups = data.performer_groups;
      state.performers = data.performers;
    },
    SET_SERVICEREQUESTS_COUNT: (state, data) => {
      state.servicerequests_count = data;
    },
    SET_SERVICEREQUESTS: (state, data) => {
      state.servicerequests = data;
    },
    SET_SERVICEREQUEST: (state, data) => {
      state.servicerequest = data;
    },
    SET_SENDING_SERVICEREQUEST: (state, data) => {
        state.is_sending_servicerequest = data;
    },
  },
  actions: {
    async GET_SERVICEREQUEST_TYPES_FROM_API({ commit }) {
      commit; 
      // let url = "/api/1.0/servicerequests/types";
      // try {
      //   const { data } = await axios.get(url);
      //   await commit("SET_SERVICEREQUEST_TYPES", data);
      // } catch (error) {
      //   console.log(error);
      //   throw error;
      }
    },
    async GET_SERVICEEQUESTS_COUNT_FROM_API({ commit }, payload) {
      let url = "/api/1.0/servicerequests/count";
      commit("SET_SENDING_SERVICEREQUEST", true);
      let params = { filter: payload.payload };
      try {
        const { data } = await axios.get(url, { params });
        commit("SET_SERVICEREQUESTS_COUNT", data);
      } catch (error) {
        console.log(error);
        throw error;
      } finally {
        commit("SET_SENDING_SERVICEREQUEST", false);
      }
    },
    async SERVICEEQUESTS_CHANGE_PAGE_FROM_API({ commit, getters }, payload) {
      let url = "/api/1.0/servicerequests";
      let filter = getters.CURRENT_FILTER
      commit("SET_SENDING_SERVICEREQUEST", true);

      let params = { filter: filter, page: payload.page, itemsperpage: payload.itemsPerPage };
      try {
        const { data } = await axios.get(url, { params });
        commit("SET_SERVICEREQUESTS", data);
      } catch (error) {
        console.log(error);
        throw error;
      } finally {
        commit("SET_SENDING_SERVICEREQUEST", false);
      }
    },
    async GET_SERVICEEQUESTS_FROM_API({ commit, getters }, payload) {
      let url = "/api/1.0/servicerequests";
      let url_count = "/api/1.0/servicerequests/count";
      commit("SET_SENDING_SERVICEREQUEST", true);


      let params = { filter: payload.payload, page: payload.page, itemsperpage: payload.itemsPerPage };
      commit("SET_CURRENT_FILTER", payload.payload);


      try {
        const { data: {count} } = await axios.get(url_count, { params });
        const { data } = await axios.get(url, { params });

        let filter = getters.CURRENT_FILTER

        if (filter == params.filter) {
          commit("SET_SERVICEREQUESTS_COUNT", Number.parseInt(count));
          commit("SET_SERVICEREQUESTS", data);
        }
      } catch (error) {
        console.log(error);
        throw error;
      } finally {
        commit("SET_SENDING_SERVICEREQUEST", false);
      }
    },
    async GET_SERVICEEQUEST_FROM_API({ commit }, payload) {
      commit("SET_SENDING_SERVICEREQUEST", true);
      try {
        let { data } = await axios.get(
          "/api/1.0/servicerequests/one/" + payload.id
        );
        commit("SET_SERVICEREQUEST", data);
      } catch (err) {
        console.log(err);
      } finally {
        commit("SET_SENDING_SERVICEREQUEST", false);
      }
    },
    async POST_SERVICEEQUEST_TO_API({ commit, dispatch }, payload) {
      commit("SET_SENDING_SERVICEREQUEST", true);

      try {
        if (payload.id != null) {
          await axios.put(`/api/1.0/servicerequests/` + payload.id, payload);
        } else {
          let { data } = await axios.post(`/api/1.0/servicerequests`, payload);
         return data
        }

        dispatch("GET_SERVICEEQUESTS_FROM_API");
      } catch (error) {
        console.log(error);
        throw error;
      } finally {
        commit("SET_SENDING_SERVICEREQUEST", false);
      }
    },

    async CHANGE_SERVICEREQUEST_STATUS_API({ dispatch, commit }, payload) {
      commit("SET_SENDING_SERVICEREQUEST", true);
      try {
        await axios.put("/api/1.0/servicerequests/status/" + payload.id, {
          id: payload.id,
          sr_status_id: payload.sr_status_id,
          sr_category_id: payload.sr_category_id ? payload.sr_category_id : "",
          performer_user_id: payload.performer_user_id
            ? payload.performer_user_id
            : "",
          description: payload.description ? payload.description : "",
          current_sr_status_id: payload.current_sr_status_id ? payload.current_sr_status_id : null,
        });

        dispatch("GET_SERVICEEQUEST_FROM_API", { id: payload.id });
      } catch (error) {
        console.log(error);

        throw error;
      } finally {
        commit("SET_SENDING_SERVICEREQUEST", false);
      }
    },

    async GET_APPEAL_VOTES_FROM_API({ commit }, payload) {
      commit("SET_SENDING_SERVICEREQUEST", true);
      let url = `/api/1.0/appeal/${payload.appeal_id}/votes`;

      try {
        const { data } = await axios.get(url);
        for (let el of data) {
          let src = await Vue.prototype.$getVuexStoreFile(el.user_id, 1);
          el["src"] = src;
        }
        await commit("SET_APPEAL_VOTES", data);
      } catch (error) {
        console.log(error);

        throw error;
      } finally {
        commit("SET_SENDING_SERVICEREQUEST", false);
      }
    },
  }

