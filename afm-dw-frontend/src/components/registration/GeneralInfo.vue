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
    methods: {
        validate() {
            if (!this.form.lastname) return false;
            if (!this.form.firstname) return false;
            if (!this.form.username) return false;
            if (!this.form.password) return false;
            if (!this.form.birth_date) return false;
            if (!this.form.identification_number) return false;
            if (!this.form.citizen) return false;
            if (!this.form.nationality) return false;
            if (!this.form.address) return false;
            if (!this.form.phone_number) return false;
            if (!this.form.birthplace) return false;
            if (!this.form.gender_id) return false;
            if (!this.form.apply_target) return false;

            let enteredDate = new Date(this.form.birth_date); 
            let currentDate = new Date();
            let eighteenYearsAgo = new Date();
            eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18);

            if (enteredDate >= eighteenYearsAgo) return false;

            return true;
        },
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
        ></v-text-field>

        <v-text-field 
            label="Имя поользователя" 
            v-model="form.username"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-text-field>

        <v-text-field 
            label="Пароль" 
            v-model="form.password"
            type="password"
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
            :counter="12"
            :maxlength="12"
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
            v-model="form.address"
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
            :items="[
                {
                    display: 'Мужской',
                    value: 1,
                }, 
                {
                    display: 'Женский',
                    value: 2,
                },
            ]"
            item-text="display"
            item-value="value"
            v-model="form.gender_id"
            :rules="[v => !!v || 'Обязательное поле']"
            required
        ></v-select>

        <v-text-field 
            label="Цель поступления в службу экономических расследований" 
            v-model="form.apply_target"
        ></v-text-field>

        <v-checkbox
            label="Прошел воинскую службу"
            v-model="form.military_duty"
        ></v-checkbox>

        <v-checkbox 
            label="Женат / Замужем"
            v-model="form.is_married"
        ></v-checkbox>

        <v-text-field           
            v-model="form.children_count"
            label="Выбирите количество детей"            
            type="number"
        ></v-text-field>

    </v-form>
</template>