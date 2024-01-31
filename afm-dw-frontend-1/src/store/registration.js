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
            address: null,
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
            certifications: [{}],
            languages: [{}],
            sports: [{}],
            crimes: [
                { 
                    crime_id: 1,
                    crime_status: false,
                    employee_comment: null,
                }, 
                { 
                    crime_id: 2,
                    crime_status: false,
                    employee_comment: null, 
                }, 
                { 
                    crime_id: 3,
                    crime_status: false,
                    employee_comment: null, 
                }, 
                { 
                    crime_id: 4,
                    crime_status: false,
                    employee_comment: null, 
                }, 
                { 
                    crime_id: 5,
                    crime_status: false,
                    employee_comment: null, 
                },
                { 
                    crime_id: 6,
                    crime_status: false,
                    employee_comment: null, 
                },
                { 
                    crime_id: 7,
                    crime_status: false,
                    employee_comment: null, 
                },
            ],
            adgs_test: [{}, {}],
            other_information: [],
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