export default {
    state: {
        form: {
            firstname: null,
            middlename: null,
            lastname: null,
            birth_date: null,
            identification_number: null,
            citizen: null,
            nationality: null,
            adress: null,
            phone_number: null,
            birthplace: null,
            apply_target: null,
            military_duty: false,
            username: null,
            password: null,
            is_married: false,
            educations: [{}],
            worklist: [{}],
            achievements: [{}],
            certeficates: [{}],
            languages: [{}],
            sports: [{}],
            crimes: [],
            adgs_test: [{}, {}],
            additioals: [],
            candidate_agrees: false,
            candidate_responsible: false,
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