<script>
import axios from 'axios';

export default {
    data() {
        return {
            candidate: {},
            isLoading: true,
            isCandidate: false,
            role_id: sessionStorage.getItem('role'),
        };
    },
    methods: {
        async accept() {

            if (!this.candidate.status_reason) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: 'Пожалуйста укажите причину'
                });
                return;
            }

            this.$swal({
                ...this.$optionAlert.fire,
                icon: 'success',
                title: 'Кандидат успешно принят'
            });

            try {
                await axios.put(
                    `http://localhost:8000/api/1.0/employee/activate/${this.$route.params.id}`,
                    {
                        id: this.$route.params.id,
                        status_id: 2,
                        reason: this.candidate.status_reason,
                    },
                );
                this.$router.push('/employees');
            } catch(err) {
                console.log('error accepting candidate', err);
            }
        },

        async reject() {

            if (!this.candidate.status_reason) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: 'Пожалуйста укажите причину'
                });
                return;
            }

            this.$swal({
                ...this.$optionAlert.fire,
                icon: 'info',
                title: 'Кандидату было отказано'
            });

            try {
                await axios.put(
                    `http://localhost:8000/api/1.0/employee/activate/${this.$route.params.id}`,
                    {
                        id: this.$route.params.id,
                        status_id: 3,
                        reason: this.candidate.status_reason,
                    },
                );
                this.$router.push('/employees');
            } catch(err) {
                console.log('error rejecting user', err);
            }
        },

        async changeRole() {
            try {
                await axios.put(
                    `http://localhost:8000/api/1.0/change_role/employee/${this.$route.params.id}`,
                    {
                        role_id: this.candidate.role_id,
                    },
                );
            } catch(err) {
                console.log('error changing role', err);
            }
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            const day = String(date.getDay()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).padStart(2, '0');
            if (day === 'NaN') return 'undefined';
            return `${day}-${month}-${year}`;
        },
    },
    async created() {
        console.log(this.role_id);
        try {
            const { id } = this.$route.params;
            
            if (this.$route.path.includes('candidate')) {
                const res = await axios.get(
                    `http://localhost:8000/api/1.0/candidate/${id}`,
                );
                this.candidate = res.data;
                this.isLoading = false;
                this.isCandidate = true;
                if (res.data.adgs) {
                    this.candidate.adgs_tests = res.data.adgs;
                }
                console.log('candidate', res.data);
            } else if (this.$route.path.includes('employee')) {
                const res = await axios.get(
                    `http://localhost:8000/api/1.0/employee/${id}`,
                );
                this.candidate = res.data[0];
                this.isLoading = false;
                if (res.data[0].adgs) {
                    this.candidate.adgs_tests = res.data[0].adgs;
                }
                console.log('employee', res.data[0]);
            }
            console.log('created!');
        } catch(err) {
            console.log('error in CandidateCard', err);
        }
    },
};
</script>

<template>
    <v-container class="candidate-card" >
        <v-overlay v-if="isLoading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <!--Секретный код / Имя-->
        <h1 
            v-if="isCandidate" 
            class="text-h3"
        >
            {{ candidate.secret_name }}
        </h1>
        <h1 
            v-else 
            class="text-h3"
        >
            {{ candidate.last_name }} {{ candidate.first_name }} {{ candidate.middle_name || '' }}
        </h1>
        <v-divider></v-divider>

        <div v-if="!isCandidate">

            <!--День рождения-->
            <p v-if="formatDate(candidate.birth_date) !== 'undefined'">
                День рождения: {{ formatDate(candidate.birth_date) }}
            </p>

            <!--ИИН-->
            <p v-if="
                candidate.identification_number !== 'undefined'
                && candidate.identification_number != null
            ">
                ИИН: {{ candidate.identification_number }}
            </p>

            <!--Адрес-->
            <p v-if="
                candidate.address !== 'undefined'
                && candidate.address != null
            ">
                Адрес: {{ candidate.address }}
            </p>

            <!--Пол-->
            <p v-if="
                candidate.gender !== 'undefined'
                && candidate.gender != null
            ">
                Пол: {{ candidate.gender }}
            </p>

            <!--Телефон-->
            <p v-if="
                candidate.phone_number !== 'undefined'
                && candidate.phone_number != null
            ">
                Телефон: {{ candidate.phone_number }}
            </p>

        </div>    
        
        <!--АДГС-->
        <div v-if="candidate.adgs_tests !== 'undefined' && candidate.adgs_tests != null">
            <div v-if="candidate.adgs_tests[0] !== 'undefined' && candidate.adgs_tests.length >= 1">
                <p v-if="candidate.adgs_tests[0].result !== 'undefined'">
                    АДГС 1: {{ candidate.adgs_tests[0].result }}
                </p>
            </div>

            <div v-if="candidate.adgs_tests[1] !== 'undefined' && candidate.adgs_tests.length == 2">
                <p v-if="candidate.adgs_tests[1].result !== 'undefined' && candidate.adgs_tests.length == 2">
                    АДГС 2: {{ candidate.adgs_tests[1].result }}
                </p>
            </div>
        </div>

        <!--Цель поступления в службу экономических расследований-->
        <p v-if="candidate.apply_target !== 'undefined'">
            Цель поступления в службу экономических расследований: {{ candidate.apply_target }}
        </p>

        <!--Место рождения-->
        <p v-if="candidate.birthplace !== 'undefined'">
            Место рождения: {{ candidate.birthplace }}
        </p>

        <!--Гражданство-->
        <p v-if="candidate.citizen !== 'undefined'">
            Гражданство: {{ candidate.citizen }}
        </p>

        <!--Национальность-->
        <p v-if="candidate.nationality !== 'undefined'">
            Национальность: {{ candidate.nationality }}
        </p>

        <!--Преступления-->
        <div v-if="candidate.crimes[0].status !== 'undefined' && candidate.crimes[0].status != null">
            <div v-if="candidate.crimes[0] !== 'undefined' || candidate.crimes.length >= 1">
                <p v-if="(candidate.crimes[0].status !== 'undefined' && candidate.crimes[0].status != null) || candidate.crimes.length >= 1">
                    Судимость, досудебное прекращение уголовного преследования: {{ 
                        candidate.crimes[0].status ? candidate.crimes[0].employee_comment : 'Нет' 
                    }}
                </p>
            </div>

            <div v-if="candidate.crimes[1] !== 'undefined' || candidate.crimes.length >= 2">
                <p v-if="(candidate.crimes[1].status !== 'undefined' && candidate.crimes[1].status != null) || candidate.crimes.length >= 2">
                    Увольнение по отрицательным мотивам: {{ 
                        candidate.crimes[1].status ? candidate.crimes[1].employee_comment : 'Нет' 
                    }}
                </p>
            </div>
        
            <div v-if="candidate.crimes[2] !== 'undefined' || candidate.crimes.length >= 3">
                <p v-if="(candidate.crimes[2].status !== 'undefined' && candidate.crimes[2].status != null) || candidate.crimes.length >= 3">
                    Административные высказывания в судебном порядке: {{
                        candidate.crimes[2].status ? candidate.crimes[2].employee_comment : 'Нет'
                    }}
                </p>
            </div>
        
            <div v-if="candidate.crimes[3] !== 'undefined' || candidate.crimes.length >= 4">
                <p v-if="(candidate.crimes[3].status !== 'undefined' && candidate.crimes[3].status != null) || candidate.crimes.length >= 4">
                    Иные административные высказывания: {{
                        candidate.crimes[3].status ? candidate.crimes[3].employee_comment : 'Нет'
                    }}
                </p>
            </div>

            <div  v-if="candidate.crimes[4] !== 'undefined' || candidate.crimes.length >= 5">
                <p v-if="(candidate.crimes[4].status !== 'undefined' && candidate.crimes[4].status != null) || candidate.crimes.length >= 5">
                    Увлекались ли вы азартными играми за последние 5 лет: {{
                        candidate.crimes[4].status ? candidate.crimes[4].employee_comment : 'Нет'
                    }}
                </p>
            </div>
        </div>

        <!--Образование-->
        <h3 v-if="candidate.educations">Образование</h3>
        <v-list v-if="candidate.educations">
            <v-list-item 
                v-for="(education, index) in candidate.educations"
                :key="index"
            >
                <v-list-item-content>

                    <p v-if="education.institue !== 'undefined'">
                        Университет: {{ education.institute === 'undefined' ? 'Не известно' : education.institute }}
                    </p>
                    <!-- <p v-else>
                        Университет: Не известно 
                    </p> -->
                    
                    <p v-if="education.major !== 'undefined'">
                        Специальность: {{ education.major === 'undefined' ? 'Не известно' : education.major }}
                    </p>
                    <!-- <p v-else>
                        Специальность: Не известно 
                    </p> -->

                    <p v-if="education.education_type !== 'undefined'">
                        Степень: {{ education.education_type === 'undefined' ? 'Не известно' : education.education_type }}
                    </p>
                    <!-- <p v-else>
                        Степень: Не известно 
                    </p> -->

                    <p v-if="education.gpi !== 'undefined'">
                        GPI: {{ education.gpi === 'undefined' ? 'Не известно' : education.gpi }}
                    </p>
                    <!-- <p v-else>
                        GPI: Не известно 
                    </p> -->

                    <p v-if="education.date_from !== 'undefined'">
                        Дата начала обучения: {{ education.date_from === 'undefined' ? 'Не известно' : formatDate(education.date_from) }}
                    </p>
                    <!-- <p v-else>
                        Дата начала обучения: Не известно 
                    </p> -->

                    <p v-if="education.date_to !== 'undefined'">
                        Дата окончания обучения: {{ education.date_to === 'undefined' ? 'Не известно' : formatDate(education.date_to) }}
                    </p>
                    <!-- <p v-else>
                        Дата окончания обучения: Не известно 
                    </p> -->

                    <p v-if="education.diploma_number !== 'undefined'">
                        Номер диплома: {{ education.diploma_number === 'undefined' ? 'Не известно' : education.diploma_number }}
                    </p>
                    <!-- <p v-else>
                        Номер диплома: Не известно 
                    </p> -->

                    <p v-if="education.diploma_series !== 'undefined'">
                        Серия диплома: {{ education.diploma_series === 'undefined' ? 'Не известно' : education.diploma_series }}
                    </p>
                    <!-- <p v-else>
                        Серия диплома: Не известно 
                    </p> -->

                </v-list-item-content>
            </v-list-item>
        </v-list>

        <!--Семейный статус-->
        <p v-if="candidate.educations === 'undefined'">
            Женат / Замужем: {{ candidate.educations ? 'Да' : 'Нет' }}
        </p>

        <!--Иностранные языки-->
        <h3 v-if="candidate.languages">Иностранные языки</h3>
        <v-list v-if="candidate.languages">
            <v-list-item 
                v-for="(language, index) in candidate.languages"
                :key="index"
            >
                <v-list-item-content v-if="language.level === 'undefined'">
                    <p>Язык: {{ language.language }}</p>
                    <p>Уровень: {{ language.level === 'undefined' ? 'Не известно' : language.level }}</p>
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <!--Военный долг-->
        <p v-if="candidate.military_duty === 'undefined'">
            Служил: {{ candidate.military_duty ? 'Да' : 'Нет' }}
        </p>

        <!--Спорт-->
        <h3 v-if="candidate.sports">Спорт</h3>
        <v-list v-if="candidate.sports">
            <v-list-item 
                v-for="(sport, index) in candidate.sports"
                :key="index"
            >
                <v-list-item-content
                    v-if="sport.name !== 'undefined' && sport.level !== 'undefined'"
                >
                    <p>Спорт: {{ sport.name }}</p>
                    <p>Разряд: {{ sport.level === 'undefined' ? 'Не известно' : sport.level }}</p>
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <!--Опыт работы-->
        <h3 v-if="candidate.worklist[0].name === 'undefined'">Опыт работы</h3>
        <v-list v-if="candidate.worklist[0].name === 'undefined'">
            <v-list-item 
                v-for="(work, index) in candidate.worklist"
                :key="index"
            >
                <v-list-item-content>

                    <p v-if="work.name === 'undefined'">
                        Место работы: {{ work.name === 'undefined' ? 'Не известно' : work.name }}
                    </p>
                    <!-- <p v-else>
                        Место работы: Не известно 
                    </p> -->
                    
                    <p v-if="work.bin === 'undefined'">
                        БИН: {{ work.bin === 'undefined' ? 'Не известно' : work.bin }}
                    </p>
                    <!-- <p v-else>
                        БИН: Не известно 
                    </p> -->

                    <p v-if="work.position === 'undefined'">
                        Должнсть: {{ work.position }}
                    </p>
                    <!-- <p v-else>
                        Должнсть: Не известно 
                    </p> -->

                    <p v-if="work.date_from === 'undefined'">
                        Дата начала работы: {{ formatDate(work.date_from) }}
                    </p>
                    <!-- <p v-else>
                        Дата начала работы: Не известно 
                    </p> -->

                    <p v-if="work.date_to === 'undefined'">
                        Дата окончания работы: {{ formatDate(work.date_to) }}
                    </p>
                    <!-- <p v-else>
                        Дата окончания работы: Не известно 
                    </p> -->

                </v-list-item-content>
            </v-list-item>
        </v-list>

        <div v-if="candidate.surs">
        <h3 v-if="candidate.surs[0].name != null">СУРы</h3>
        <v-list v-if="candidate.surs[0].name != null">
            <v-list-item 
                v-for="(sur, index) in candidate.surs"
                :key="index"
            >
                <v-list-item-content v-if="sur.name != null && sur.status !== 'undefined' && sur.status != null">

                    <p v-if="sur.name">
                        {{ `${sur.name}: ${sur.status ? 'Да' : 'Нет'}` }}
                    </p>
                    <!-- <p v-else>
                        {{ `${sur.name}: Не известно` }} 
                    </p> -->

                </v-list-item-content>
            </v-list-item>
        </v-list>
        </div>

        <!--Одобрение кандидата-->
        <v-text-field
            v-if="isCandidate && role_id != 79"
            :rules="[v => !!v || 'Обязательное поле']"
            label="Причина отказа или принятия"
            v-model="candidate.status_reason"
            class="mb-5"
        >
        </v-text-field>
        <v-row 
            v-if="isCandidate && role_id != 79"
            class="mb-5 ml-1"
        >
            <v-btn 
                @click="accept"
                class="mr-3"
                color="primary"
            >
                Принять
            </v-btn>
            <v-btn @click="reject">Отказать</v-btn>
        </v-row>

        <!--Изменить роль-->
        <v-select
            v-if="(!isCandidate || candidate.status === 'Одобрено') && role_id == 83"
            v-model="candidate.role_id"
            label="Роль"
            :items="[
                {
                    display: 'ДСЮ',
                    value: 78,
                },
                {
                    display: 'Кадры',
                    value: 79,
                },
                {
                    display: 'Психолог',
                    value: 80,
                },
                {
                    display: 'Преподаватель',
                    value: 81,
                },
                {
                    display: 'Администратор',
                    value: 83,
                },
            ]"
            item-text="display"
            item-value="value"
        ></v-select>
        <v-btn 
            v-if="(!isCandidate || candidate.status === 'Одобрено') && role_id == 83"
            color="primary"
            @click="changeRole"
        >
            Изменить роль
        </v-btn>


    </v-container>
</template>

<style scoped>
.candidate-card {
    background-color: white;
    padding: 10px;
    margin: 30px;
}

</style>