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
            birthdateMenu: false,
        };
    },
};
</script>

<template>
    <v-form>

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

    </v-form>
</template>