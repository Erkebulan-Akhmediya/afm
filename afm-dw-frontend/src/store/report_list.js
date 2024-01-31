
export default {
  state: {
    rp_current_tab: null,
    der_filter: null,
    report_form_filter: null,
  },
  mutations: {
    change_rp_tab (state, value) {
      state.rp_current_tab = value
    },
    der_filter (state, value) {
      state.der_filter = value
    },
    report_form_filter (state, value) {
      state.report_form_filter = value
    },
  },
  actions: {
  },
  getters: {
    rp_current_tab (state) {
      return state.rp_current_tab
    },
    der_filter (state) {
      return state.der_filter
    },
    report_form_filter (state) {
      return state.report_form_filter
    },
  }
}