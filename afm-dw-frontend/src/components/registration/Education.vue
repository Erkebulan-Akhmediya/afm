<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters([
            'form'
        ]),
    },
    data() {
        return {
            educations: 1,
            educationStartDateMenu: false,
            educationEndDateMenu: false,
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
                    outlined
                ></v-text-field>
            
                <v-select 
                    class="mx-2"
                    label="Степень"
                    :items="['Бакалавр', 'Магистратура', 'Докторантура']"
                    v-model="form.educations[index].education_type"
                    outlined
                ></v-select>
            
                <v-text-field 
                    class="mx-2"
                    label="Специальность" 
                    v-model="form.educations[index].major"
                    outlined
                ></v-text-field>
            
                <v-menu 
                    v-model="educationStartDateMenu" 
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
                            outlined
                        ></v-text-field>
                    </template>
                    <v-date-picker 
                        v-model="form.educations[index].date_from" 
                        @input="birthdateMenu = false"
                    ></v-date-picker>
                </v-menu>
            
                <v-menu 
                    v-model="educationEndDateMenu" 
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
                            outlined
                        ></v-text-field>
                    </template>
                    <v-date-picker 
                        v-model="form.educations[index].date_to" 
                        @input="birthdateMenu = false"
                    ></v-date-picker>
                </v-menu>
            
                <v-text-field 
                    class="mx-2"
                    label="GPI" 
                    v-model="form.educations[index].gpi"
                    type="number"
                    outlined
                ></v-text-field>              
            </v-row>
            <v-divider class="mb-7 border-opacity-100"></v-divider>
        </div>

        <v-btn @click="addEducation">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-form>
</template>