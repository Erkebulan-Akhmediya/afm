<script>
import axios from 'axios';

export default {
    data() {
        return {
            experience: 1,
            education: 1,
            achievements: 1,
            certeficates: 1,
            languages: 1,
            sports: 1,
            additioals: 1,
            form: {
                fullname: null,
                birthdate: null,
                iin: null,
                citizenship: null,
                adress: null,
                phone: null,
                birthPlace: null,
                education: [{}],
                experience: [{}],
                achievements: [{}],
                certeficates: [{}],
                languages: [{}],
                sports: [{}],
                hasAdministrativeFines: false,
                adgs: [{}, {}],
                additioals: [],
            },
        };
    },
    methods: {
        addEducation() {
            this.education++;
            this.form.education.push({});
        },
        addExperience() {
            this.experience++;
            this.form.experience.push({});
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

            <v-text-field 
                label="ФИО" 
                v-model="form.fullname"
            ></v-text-field>

            <v-text-field 
                label="Дата рождения" 
                v-model="form.birthdate"
            ></v-text-field>

            <v-text-field 
                label="ИИН" 
                v-model="form.iin"
            ></v-text-field>

            <v-text-field 
                label="Гражданство" 
                v-model="form.citizenship"
            ></v-text-field>

            <v-text-field 
                label="Домашний адрес" 
                v-model="form.adress"
            ></v-text-field>

            <v-text-field 
                label="Телефон" 
                v-model="form.phone"
            ></v-text-field>

            <v-text-field 
                label="Место рождения" 
                v-model="form.birthPlace"
            ></v-text-field>


            <h2 class="mb-5">Образование</h2>
            <v-row
                v-for="(n, index) in education" 
                :key="index"
            >
                <v-text-field 
                    class="mx-1" 
                    label="ВУЗ" 
                    v-model="form.education[index].university" 
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-1" 
                    label="Специальность" 
                    v-model="form.education[index].major"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-1" 
                    label="Год начала" 
                    v-model="form.education[index].admissionYear"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-1" 
                    label="Год окончания" 
                    v-model="form.education[index].graduationYear"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-2" 
                    label="GPI" 
                    v-model="form.education[index].gpi"
                    outlined
                ></v-text-field>
            </v-row>
            <v-btn @click="addEducation">
                <v-icon>mdi-plus</v-icon>
            </v-btn>


            <h2 class="my-5">Опыт работы</h2>
            <v-row 
                v-for="(n, index) in experience" 
                :key="index"
            >
                <v-text-field 
                    class="mx-2" 
                    label="Место работы" 
                    v-model="form.experience[index].workPlace"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-2" 
                    label="Должность" 
                    v-model="form.experience[index].position"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-2" 
                    label="Дата начала" 
                    v-model="form.experience[index].startDate"
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-2" 
                    label="Дата окончания" 
                    v-model="form.experience[index].endDate"
                    outlined
                ></v-text-field>
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
            <v-btn @click="addAchievement   ">
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
                        v-model="form.languages[index].level"
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
                        v-model="form.sports[index].sport"
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
                    v-model="form.adgs[0].adgsOne"
                    outlined
                ></v-text-field>
                <v-file-input 
                    label="Файл"
                    v-model="form.adgs[0].file" 
                    outlined
                    ></v-file-input>
            </v-row>
            <v-row>
                <v-text-field 
                    label="АДГС 2" 
                    v-model="form.adgs[1].adgsTwo"
                    outlined
                ></v-text-field>
                <v-file-input 
                    label="Файл" 
                    v-model="form.adgs[1].file" 
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