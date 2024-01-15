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
                v-model="workStartDateMenu[index]" 
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
                    @input="workEndDateMenu[index] = false"
                ></v-date-picker>
            </v-menu>
        </v-row>
        <v-btn @click="addExperience">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-form>
</template>