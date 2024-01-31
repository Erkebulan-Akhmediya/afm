export default {
    state() {
      return {
        is_active_candidate_request: true,
      }
    },
    mutations: {
      setIsActiveCandidateRequest(state, value) {
        state.is_active_candidate_request = value
      }
    },
    actions: {
    },
    getters: {
      is_active_candidate_request(state) {
        return state.is_active_candidate_request;
      },
    }
}