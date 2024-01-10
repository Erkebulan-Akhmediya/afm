export default {
    state() {
      return {
        identification_number: '',
        selectedChannel: 1,
        date_from: null,
        date_to: null,
        pagination_options: {},
      }
    },
    mutations: {
      setSelectedChannel: (state, selectedChannel) => {
        state.selectedChannel = selectedChannel
      },
      setIdentificationNumber: (state, identification_number) => {
        state.identification_number = identification_number
      },
      setDateFrom: (state, date_from) => {
        state.date_from = date_from
      },
      setDateTo: (state, date_to) => {
        state.date_to = date_to
      },
      setPaginationOptions: (state, options) => {
        state.pagination_options = options
      }
    },
    actions: {
    },
    getters: {
        identification_number(state) {
            return state.identification_number;
        },
        selectedChannel(state) {
            return state.selectedChannel;
        },
        date_from(state) {
            return state.date_from;
        },
        date_to(state) {
            return state.date_to;
        },
        pagination_options(state){
            return state.pagination_options
        }
    }
}