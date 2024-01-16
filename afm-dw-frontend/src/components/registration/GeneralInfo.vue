<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters(['form']),
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

        <v-text-field 
            label="Фамилия" 
            v-model="form.lastname"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-text-field 
            label="Имя" 
            v-model="form.firstname"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-text-field 
            label="Отчество" 
            v-model="form.middlename"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

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
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
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
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-text-field 
            label="Гражданство" 
            v-model="form.citizen"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-text-field 
            label="Нациольность" 
            v-model="form.nationality"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-text-field 
            label="Домашний адрес" 
            v-model="form.adress"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-text-field 
            label="Телефон" 
            v-model="form.phone_number"
            type="number"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-text-field 
            label="Место рождения" 
            v-model="form.birthplace"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-select
            label="Пол"
            :items="['Мужской', 'Женский']"
            v-model="form.gender"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-select>

        <v-text-field 
            label="Цель поступления в службу экономических расследований" 
            v-model="form.apply_target"
        ></v-text-field>

        <v-checkbox
            label="Прошел воинскую службу"
            v-model="form.military_vow"
        ></v-checkbox>

        <v-checkbox 
            label="Женат / Замужем"
            v-model="form.other_adm_penalties"
        ></v-checkbox>

    </v-form>
</template>