export default {
    state: {
        form: {
            firstname: null,
            middlename: null,
            lastname: null,
            birth_date: null,
            identification_number: null,
            citizen: null,
            adress: null,
            phone_number: null,
            birthplace: null,
            educations: [{}],
            worklist: [{}],
            achievements: [{}],
            certeficates: [{}],
            languages: [{}],
            sports: [{}],
            hasAdministrativeFines: false,
            adgs_test: [{}, {}],
            additioals: [],
        },
    },
    getters: {
        form: state => state.form,
    },
    mutations: {
        updateForm(state, form) {
            state.form = form;
        },
    },
};