<script>
import axios from 'axios';

export default {
    data() {
        return {
            worklist: 1,
            educations: 1,
            achievements: 1,
            certeficates: 1,
            languages: 1,
            sports: 1,
            additioals: 1,

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

            birthdateMenu: false,
            workStartDateMenu: false,
            workEndDateMenu: false,
            educationStartDateMenu: false,
            educationEndDateMenu: false,
        };
    },
    methods: {
        addEducation() {
            this.educations++;
            this.form.educations.push({});
        },
        addExperience() {
            this.worklist++;
            this.form.worklist.push({});
        },
        addAchievement() {
            this.achievements++;
            this.form.achievements.push({});
        },
        addCerteficate() {
            this.certeficates++;
            this.form.certeficates.push({});
        },
        addLanguage() {
            this.languages++;
            this.form.languages.push({});
        },
        addSport() {
            this.sports++;
            this.form.sports.push({});
        },
        async submitForm() {
            console.log(this.form);

            const formData = new FormData();
            for (let key in this.form) {
                formData.append(key, this.form[key]);
            }
            try {
                await axios.post(
                    'http://localhost:8000/api/1.0/auth/register',
                    formData,
                    {
                        headers: {
                            'Content-type': 'multipart/form-data',
                        },
                    }
                );
            } catch(err) {
                console.log('registration failed');
            }
        },
    },
};
</script>

<template>
    <v-container class="align-center">
        <v-form @submit.prevent="submitForm">

            <v-row>
                <v-text-field 
                    class="mx-2"
                    label="Фамилия" 
                    v-model="form.lastname"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-2"
                    label="Имя" 
                    v-model="form.firstname"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-2"
                    label="Отчество" 
                    v-model="form.middlename"
                    outlined
                ></v-text-field>
            </v-row>

            <v-menu 
                v-model="birthdateMenu" 
                :close-on-content-click="false"
            >
                <template 
                    v-slot:activator="{ on, attrs }"
                >
                    <v-text-field
                        v-model="form.birth_date"
                        label="Дата рождения"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-date-picker 
                    v-model="form.birth_date" 
                    @input="birthdateMenu = false"
                ></v-date-picker>
            </v-menu>

            <v-text-field 
                label="ИИН" 
                v-model="form.identification_number"
                type="number"
            ></v-text-field>

            <v-text-field 
                label="Гражданство" 
                v-model="form.citizen"
            ></v-text-field>

            <v-text-field 
                label="Домашний адрес" 
                v-model="form.adress"
            ></v-text-field>

            <v-text-field 
                label="Телефон" 
                v-model="form.phone_number"
                type="number"
            ></v-text-field>

            <v-text-field 
                label="Место рождения" 
                v-model="form.birthplace"
            ></v-text-field>

            <v-select
                label="Пол"
                :items="['Мужской', 'Женский']"
                v-model="form.gender"
            ></v-select>


            <h2 class="mb-5">Образование</h2>
            <v-row
                v-for="(n, index) in educations" 
                :key="index"
            >
                <v-col cols="2">
                    <v-text-field  
                        label="ВУЗ" 
                        v-model="form.educations[index].institute" 
                        outlined
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-select 
                        label="Степень"
                        :items="['Бакалавр', 'Магистратура', 'Докторантура']"
                        v-model="form.educations[index].education_type"
                        outlined
                    ></v-select>
                </v-col>
                <v-col cols="2">
                    <v-text-field 
                        label="Специальность" 
                        v-model="form.educations[index].major"
                        outlined
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-menu 
                        v-model="educationStartDateMenu" 
                        :close-on-content-click="false"
                    >
                        <template 
                            v-slot:activator="{ on, attrs }"
                        >
                            <v-text-field
                                v-model="form.educations[index].date_from"
                                label="Дата поступления"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                                outlined
                            ></v-text-field>
                        </template>
                        <v-date-picker 
                            v-model="form.educations[index].date_from" 
                            @input="birthdateMenu = false"
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="2">
                    <v-menu 
                        v-model="educationEndDateMenu" 
                        :close-on-content-click="false"
                    >
                        <template 
                            v-slot:activator="{ on, attrs }"
                        >
                            <v-text-field
                                v-model="form.educations[index].date_to"
                                label="Дата окончания"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                                outlined
                            ></v-text-field>
                        </template>
                        <v-date-picker 
                            v-model="form.educations[index].date_to" 
                            @input="birthdateMenu = false"
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="2">
                    <v-text-field 
                        label="GPI" 
                        v-model="form.educations[index].gpi"
                        type="number"
                        outlined
                    ></v-text-field>
                </v-col>                
            </v-row>
            <v-btn @click="addEducation">
                <v-icon>mdi-plus</v-icon>
            </v-btn>


            <h2 class="my-5">Опыт работы</h2>
            <v-row 
                v-for="(n, index) in worklist" 
                :key="index"
            >
                <v-text-field 
                    class="mx-2" 
                    label="Место работы" 
                    v-model="form.worklist[index].work_place"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-2" 
                    label="Должность" 
                    v-model="form.worklist[index].position"
                    outlined
                ></v-text-field>
                
                <v-menu 
                    v-model="workStartDateMenu" 
                    :close-on-content-click="false"
                >
                    <template 
                        v-slot:activator="{ on, attrs }"
                    >
                        <v-text-field
                            class="mx-2"
                            v-model="form.worklist[index].date_from"
                            label="Дата начала"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            outlined
                        ></v-text-field>
                    </template>
                    <v-date-picker 
                        v-model="form.worklist[index].date_from" 
                        @input="birthdateMenu = false"
                    ></v-date-picker>
                </v-menu>

                <v-menu 
                    v-model="workEndDateMenu" 
                    :close-on-content-click="false"
                >
                    <template 
                        v-slot:activator="{ on, attrs }"
                    >
                        <v-text-field
                            class="mx-2"
                            v-model="form.worklist[index].date_to"
                            label="Дата окончания"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            outlined
                        ></v-text-field>
                    </template>
                    <v-date-picker 
                        v-model="form.worklist[index].date_to" 
                        @input="birthdateMenu = false"
                    ></v-date-picker>
                </v-menu>
            </v-row>
            <v-btn @click="addExperience">
                <v-icon>mdi-plus</v-icon>
            </v-btn>


            <h2 class="my-5">Достижения (грамоты)</h2>
            <v-row
                v-for="(n, index) in achievements" 
                :key="index"
            >
                <v-col cols="8">
                    <v-text-field 
                        label="Грамота" 
                        v-model="form.achievements[index].diploma"
                        outlined
                    ></v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-file-input 
                        label="Файл" 
                        v-model="form.achievements[index].file"
                        outlined
                    ></v-file-input>
                </v-col>
            </v-row>
            <v-btn @click="addAchievement">
                <v-icon>mdi-plus</v-icon>
            </v-btn>


            <h2 class="my-5">Повышение квалификации (сертификаты)</h2>
            <v-row
                v-for="(n, index) in certeficates" 
                :key="index"
            >
                <v-col cols="8">
                    <v-text-field 
                        label="Сертефикат" 
                        v-model="form.certeficates[index].certeficate"
                        outlined
                    ></v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-file-input 
                        label="Файл" 
                        v-model="form.certeficates[index].file"
                        outlined
                    ></v-file-input>
                </v-col>
            </v-row>
            <v-btn @click="addCerteficate">
                <v-icon>mdi-plus</v-icon>
            </v-btn>

            
            <h2 class="my-5">Владение иностранными языками</h2>
            <v-row
                v-for="(n, index) in languages" 
                :key="index"
            >
                <v-col cols="8">
                    <v-text-field 
                        label="Иностранный язык" 
                        v-model="form.languages[index].language"
                        outlined
                    ></v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-text-field 
                        label="Уровень" 
                        v-model="form.languages[index].knowledge"
                        outlined
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-btn @click="addLanguage">
                <v-icon>mdi-plus</v-icon>
            </v-btn>


            <h2 class="my-5">Занятие спортом</h2>
            <v-row
                v-for="(n, index) in sports" 
                :key="index"
            >
                <v-col cols="8">
                    <v-text-field 
                        label="Спорт" 
                        v-model="form.sports[index].sportname"
                        outlined
                    ></v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-text-field 
                        label="Разряд" 
                        v-model="form.sports[index].level"
                        outlined
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-btn @click="addSport">
                <v-icon>mdi-plus</v-icon>
            </v-btn>

            <v-checkbox 
                label="Наличие административных штрафов"
                v-model="form.hasAdministrativeFines"
            ></v-checkbox>

            <h2 class="my-5">Приложить результаты тестирования в АДГС РК</h2>
            <v-row>
                <v-text-field 
                    label="АДГС 1" 
                    v-model="form.adgs_test[0].results"
                    outlined
                ></v-text-field>
                <v-file-input 
                    label="Файл"
                    v-model="form.adgs_test[0].file" 
                    outlined
                    ></v-file-input>
            </v-row>
            <v-row>
                <v-text-field 
                    label="АДГС 2" 
                    v-model="form.adgs_test[1].results"
                    outlined
                ></v-text-field>
                <v-file-input 
                    label="Файл" 
                    v-model="form.adgs_test[1].file" 
                    outlined
                ></v-file-input>
            </v-row>

            <v-text-field 
                v-for="(n, index) in additioals" 
                :key="index"
                label="Дополнительные сведения"
                v-model="form.additioals[index]"
            ></v-text-field>
            <v-btn @click="additioals++">
                <v-icon>mdi-plus</v-icon>
            </v-btn>

            <v-row class="my-5">
                <v-btn type="submit">Зарегистрироваться</v-btn>
            </v-row>

        </v-form>
    </v-container>
</template>