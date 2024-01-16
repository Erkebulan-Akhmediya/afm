<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters(['form']),
    },
    data() {
        return {
            worklist: 1,
            workStartDateMenu: [false],
            workEndDateMenu: [false],
        };
    },
    methods: {
        addExperience() {
            this.worklist++;
            this.form.worklist.push({});
        },
    },
};
</script>

<template>
    <v-form>
        <h2 class="my-5">Опыт работы</h2>
        <div 
            v-for="(n, index) in worklist" 
            :key="index"
        >
            <v-row>
                <v-text-field 
                    class="mr-1" 
                    label="Название организации" 
                    v-model="form.worklist[index].nameRU"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="ml-1" 
                    label="БИН" 
                    v-model="form.worklist[index].bin"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
            </v-row>

            <v-row>
                <v-text-field 
                    label="Должность" 
                    v-model="form.worklist[index].positionRU"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
            </v-row>
            
            <v-row>
                <v-menu 
                    v-model="workStartDateMenu[index]" 
                    :close-on-content-click="false"
                >
                    <template 
                        v-slot:activator="{ on, attrs }"
                    >
                        <v-text-field
                            class="mr-1"
                            v-model="form.worklist[index].date_from"
                            label="Дата начала"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            :rules="[v => !!v || 'Обязательное поле']"
                            required
                            outlined
                        ></v-text-field>
                    </template>
                    <v-date-picker 
                        v-model="form.worklist[index].date_from" 
                        @input="workStartDateMenu[index] = false"
                    ></v-date-picker>
                </v-menu>

                <v-menu 
                    v-model="workEndDateMenu[index]" 
                    :close-on-content-click="false"
                >
                    <template 
                        v-slot:activator="{ on, attrs }"
                    >
                        <v-text-field
                            class="ml-1"
                            v-model="form.worklist[index].date_to"
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
                        v-model="form.worklist[index].date_to" 
                        @input="workEndDateMenu[index] = false"
                    ></v-date-picker>
                </v-menu>
            </v-row>

            <v-divider class="mb-7 border-opacity-100"></v-divider>
        </div>
        <v-btn @click="addExperience">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-form>
</template>