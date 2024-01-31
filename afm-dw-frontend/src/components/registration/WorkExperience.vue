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
        deleteExperience(index) {
            this.form.worklist.splice(index, 1);
            this.worklist--;
        },
        validate() {
            for (let work of this.form.worklist) {
                if (!work.nameRU) return false; 
                if (!work.bin) return false; 
                if (!work.positionRU) return false; 
                if (!work.date_from) return false; 
                if (!work.date_to) return false; 

                let dateFrom = new Date(work.date_from);
                let dateTo = new Date(work.date_to); 
                if (dateFrom > dateTo) return false;
            }
            return true;
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
                    class="mx-4" 
                    label="Название организации" 
                    v-model="form.worklist[index].nameRU"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
                <v-text-field 
                    class="mx-4" 
                    label="БИН" 
                    v-model="form.worklist[index].bin"
                    type="number"
                    :rules="[v => !!v || 'Обязательное поле']"
                    :counter="12"
                    :maxlength="12"
                    required
                    outlined
                ></v-text-field>
            </v-row>

            <v-row>
                <v-text-field 
                    class="mx-4"
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
                            class="mx-4"
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
                            class="mx-4"
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

            <v-btn 
                v-if="worklist > 1"
                @click="deleteExperience(index)"
                class="mb-4"
            >
                <v-icon>mdi-minus</v-icon>
            </v-btn>

            <v-divider class="mb-7 border-opacity-100"></v-divider>
        </div>
        <v-btn @click="addExperience">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-form>
</template>