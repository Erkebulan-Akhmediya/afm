<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters(['form']),
    },
    data() {
        return {
            educations: 1,
            educationStartDateMenu: [false],
            educationEndDateMenu: [false],
        };
    },
    methods: {
        addEducation() {
            this.educations++;
            this.form.educations.push({ diploma_nostrification: false, });
        },
        deleteEducation(index) {
            this.form.educations.splice(index, 1);
            this.educations--;
        },
        validate() {
            for (let education of this.form.educations) {
                if (!education.institute) return false;
                if (!education.institute_country) return false;
                if (!education.education_type) return false;
                if (!education.education_format) return false;
                if (!education.major) return false;
                if (!education.gpi) return false;
                if (!education.date_from) return false;
                if (!education.date_to) return false;
                if (!education.diploma_number) return false;
                if (!education.diploma_series) return false;

                let dateFrom = new Date(education.date_from); 
                let dateTo = new Date(education.date_to); 
                if (dateFrom > dateTo) return false;
            }
            return true;
        },
    },
    created() {
        this.form.educations[0].diploma_nostrification = false;
    }, 
    mounted() {
        setInterval(() => {
            this.render = true;
        }, 1000);
    },
};
</script>

<template>
    <v-form>
        <h2 class="mb-5" id="top">Образование</h2>
        <div
            v-for="(n, index) in educations" 
            :key="index"
        >
            
            <v-row>
                <v-text-field  
                    class="mx-4"
                    label="ВУЗ" 
                    v-model="form.educations[index].institute"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>

                <v-text-field  
                    class="mx-4"
                    label="Страна ВУЗа" 
                    v-model="form.educations[index].institute_country" 
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>
            </v-row>
            
            <v-row>
                <v-select 
                    class="mx-4"
                    label="Степень"
                    :items="['Бакалавр', 'Магистратура', 'Докторантура']"
                    v-model="form.educations[index].education_type"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-select>

                <v-text-field  
                    class="mx-4"
                    label="Форма обучения" 
                    v-model="form.educations[index].education_format" 
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>
            </v-row>
    
        
            <v-row>
                <v-text-field 
                    class="mx-4"
                    label="Специальность" 
                    v-model="form.educations[index].major"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>

                <v-text-field 
                    class="mx-4"
                    label="GPI" 
                    type="number"
                    v-model="form.educations[index].gpi"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>
            </v-row> 
        
            <v-row>
                <v-menu 
                    v-model="educationStartDateMenu[index]" 
                    :close-on-content-click="false"
                >
                    <template 
                        v-slot:activator="{ on, attrs }"
                    >
                        <v-text-field
                            class="mx-4"
                            v-model="form.educations[index].date_from"
                            label="Дата поступления"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            :rules="[v => !!v || 'Обязательное поле']"
                            required 
                            outlined
                        ></v-text-field>
                    </template>
                    <v-date-picker 
                        v-model="form.educations[index].date_from" 
                        @input="educationStartDateMenu[index] = false"
                    ></v-date-picker>
                </v-menu>
            
                <v-menu 
                    v-model="educationEndDateMenu[index]" 
                    :close-on-content-click="false"
                >
                    <template 
                        v-slot:activator="{ on, attrs }"
                    >
                        <v-text-field
                            class="mx-4"
                            v-model="form.educations[index].date_to"
                            label="Дата окончания"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            :rules="[v => !!v || 'Обязательное поле']"
                            required 
                            outlined
                        ></v-text-field>
                    </template>
                    <v-date-picker 
                        v-model="form.educations[index].date_to" 
                        @input="educationEndDateMenu[index] = false"
                    ></v-date-picker>
                </v-menu>
            </v-row>

            <v-row>
                <v-text-field 
                    class="mx-4"
                    label="Серия диплома" 
                    v-model="form.educations[index].diploma_series"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field> 

                <v-text-field 
                    class="mx-4"
                    label="Номер диплома" 
                    type="number"
                    v-model="form.educations[index].diploma_number"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field> 
            </v-row>     
            
            <v-checkbox 
                label="Нострификация диплома"
                v-model="form.educations[index].diploma_nostrification"
            ></v-checkbox>

            <v-btn 
                v-if="educations > 1"
                @click="deleteEducation(index)"
                class="mb-4"
            >
                <v-icon>mdi-minus</v-icon>
            </v-btn>
            
            <v-divider class="mb-7 border-opacity-100"></v-divider>
        </div>

        <v-btn @click="addEducation">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-form>
</template>