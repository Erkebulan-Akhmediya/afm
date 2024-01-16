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
            this.form.educations.push({});
        },
    },
};
</script>

<template>
    <v-form>
        <h2 class="mb-5">Образование</h2>
        <div
            v-for="(n, index) in educations" 
            :key="index"
        >
            
            <v-row>
                <v-text-field  
                    class="mx-2"
                    label="ВУЗ" 
                    v-model="form.educations[index].institute"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>

                <v-text-field  
                    class="mx-2"
                    label="Страна ВУЗа" 
                    v-model="form.educations[index].institute_country" 
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>
            </v-row>
        
            <v-row>
                <v-select 
                    class="mx-2"
                    label="Степень"
                    :items="['Бакалавр', 'Магистратура', 'Докторантура']"
                    v-model="form.educations[index].education_type"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-select>

                <v-text-field  
                    class="mx-2"
                    label="Форма обучения" 
                    v-model="form.educations[index].education_format" 
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>
            </v-row>
        
            <v-row>
                <v-text-field 
                    class="mx-2"
                    label="Специальность" 
                    v-model="form.educations[index].major"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field>

                <v-text-field 
                    class="mx-2"
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
                            class="mx-2"
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
                            class="mx-2"
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
                    class="mx-2"
                    label="Серия диплома" 
                    v-model="form.educations[index].diploma_series"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required 
                    outlined
                ></v-text-field> 

                <v-text-field 
                    class="mx-2"
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
            
            <v-divider class="mb-7 border-opacity-100"></v-divider>
        </div>

        <v-btn @click="addEducation">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-form>
</template>