<script>
import axios from 'axios';
import Cookies from 'js-cookie'
import { mapGetters } from 'vuex';
import * as crypto from 'crypto-js';
import FormTitle from '../components/registration/FormTitle.vue';
import GeneralInfo from '../components/registration/GeneralInfo.vue'
import Education from '../components/registration/Education.vue'
import WorkExperience from '../components/registration/WorkExperience.vue'
import AchievementsAndQualifications from '../components/registration/AchievementsAndQualifications.vue'
import Additionals from '../components/registration/Additionals.vue'

export default {
    components: {
        FormTitle,
        GeneralInfo,
        Education,
        WorkExperience,
        AchievementsAndQualifications,
        Additionals,
    },
    computed: {
        ...mapGetters(['form']),
    },
    data() {
        return {
            step: 1,
        };
    },
    methods: {
        async submitForm() {
            console.log(this.form);

            const formData = new FormData();
            for (let key in this.form) {
                formData.append(key, this.form[key]);
            }
            try {
                const res = await axios.post(
                    'http://localhost:8000/api/1.0/auth/register',
                    this.form,    
                );
                if (res.status === 200) {
                    sessionStorage.setItem('token', res.data.access_token);
                    sessionStorage.setItem('refresh', res.data.refresh_token);
                    sessionStorage.setItem('userId', res.data.user_id);
                    sessionStorage.setItem('role', res.data.role_id);
                    sessionStorage.setItem('roleName', res.data.role_name);

                    Cookies.set('userId', res.data.user_id, { expires: 365 });

                    const encrypted_id = crypto.AES
                        .encrypt(res.data.user_id, 'secret-key').toString();
                        
                    this.$router.push(`/employees/${encrypted_id}`);
                }  
            } catch(err) {
                console.log('registration failed');
            }
        },
        next() {
            this.step++;
        },
        prev() {
            this.step--;
        },
    },
};
</script>

<template>
    <div 
        class="d-flex align-center" 
        id="background"
    >
        <v-col id="registration-wrapper">

            <FormTitle class="rounded-t-xl" id="form-title" />

            <v-stepper 
                class="ml-15 rounded-b-xl" 
                id="registration" 
                v-model="step"
            >

                <v-stepper-header id="stepper-header">
                    <v-stepper-step :complete="step > 1" step="1"></v-stepper-step>
                    <v-stepper-step :complete="step > 2" step="2"></v-stepper-step>
                    <v-stepper-step :complete="step > 3" step="3"></v-stepper-step>
                    <v-stepper-step :complete="step > 4" step="4"></v-stepper-step>
                    <v-stepper-step :complete="step > 5" step="5"></v-stepper-step>
                </v-stepper-header>


                <v-stepper-items id="stepper-items">
                    <v-stepper-content step="1">
                        <GeneralInfo />
                    </v-stepper-content>

                    <v-stepper-content step="2">
                        <Education />
                    </v-stepper-content>

                    <v-stepper-content step="3">
                        <WorkExperience />
                    </v-stepper-content>

                    <v-stepper-content step="4">
                        <AchievementsAndQualifications />
                    </v-stepper-content>

                    <v-stepper-content step="5">
                        <Additionals />
                    </v-stepper-content>
                </v-stepper-items>


                <v-row class="d-flex justify-space-between mt-2 pt-5 pb-8 px-9 elevation-5 stepper-footer">
                    <v-btn 
                        v-if="step > 1" 
                        @click="prev"
                    >
                        Назад
                    </v-btn>
                    <v-btn 
                        v-else 
                        @click="$router.push('/login')"
                    >
                        Вход
                    </v-btn>

                    <v-btn 
                        v-if="step < 5" 
                        @click="next" 
                        color="primary"
                    >
                        Вперед
                    </v-btn>
                    <v-btn 
                        v-else 
                        @click="submitForm"
                        color="primary"
                    >
                        Зарегистрироваться
                    </v-btn>
                </v-row>

            </v-stepper>
        </v-col>

    </div>
</template>

<style>

body {
    margin: 0%;
    padding: 0%;
}

#background {
    background-image: url('../assets/img/login/background.jpg');
    background-size: cover;
    background-color: #424B50;
    background-position: center;
    width: 100%;
    height: 100vh;
}

#registration-wrapper {
    border-radius: 50px;
}

#form-title {
    width: 50%;
}

#registration {
    width: 50%;
    border-radius: 0px;
}

#stepper-items {
    height: 60vh;

    overflow: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

#stepper-items::-webkit-scrollbar {
    display: none;
}


.v-stepper__wrapper {
    overflow: visible !important;
}

</style>