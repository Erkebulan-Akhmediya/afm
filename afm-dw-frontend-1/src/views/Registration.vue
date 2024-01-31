<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
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
            console.log('workin')
            if (this.form.candidate_agrees != true || this.form.candidate_responsible != true) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: 'Дайте согласие на обраюотку данных и ответсвенность за сведения в анкете',
                });
                return;
            }
            try {
                console.log(this.form);
                const res = await axios.post(
                    'http://localhost:8000/api/1.0/auth/register',
                    this.form,    
                    {
                        headers: {
                            'Content-type': 'application/json',
                        },
                    },
                );

                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: 'Пользователь успешно зарегстрирован',
                });
                
                if (res.status < 300) {
                    window.location.reload();
                    this.$router.push('/login');
                }
                
            } catch(err) {
                if (err.data.message === "Пользователь с таким 'username' уже существует") {
                    this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'error',
                        title: 'Пользоватнль с таким \'Именем пользователя\' уже существует'
                    });
                } else {
                    this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'error',
                        title: err.data.message || 'Ошибка регистрации',
                    });
                }
                console.log('registration failed', err);
            }
        },
        next() {
            const currentForm = this.$refs[`step${this.step}`];
            console.log(currentForm.validate());

            if (currentForm.validate() == true) {
                this.step++;
                this.$vuetify.goTo('#top');
            } else {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: 'Убедитесь в полноте и правильности внесенных данных'
                });
            }
            // this.step++;
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
                        <GeneralInfo ref="step1" />
                    </v-stepper-content>

                    <v-stepper-content step="2">
                        <Education ref="step2" />
                    </v-stepper-content>

                    <v-stepper-content step="3">
                        <WorkExperience ref="step3" />
                    </v-stepper-content>

                    <v-stepper-content step="4">
                        <AchievementsAndQualifications ref="step4" />
                    </v-stepper-content>

                    <v-stepper-content step="5">
                        <Additionals ref="step5" />
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


<style scoped>

body {
    margin: 0;
    padding: 0;
}

/* * {
    margin:0;
    padding:0;
} */

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