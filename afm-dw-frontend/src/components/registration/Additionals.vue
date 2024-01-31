<script>
import { mapGetters } from 'vuex';
import sendFile from '../../utils/send_file.js'

export default {
    computed: {
        ...mapGetters(['form']),
    },
    data() {
        return {
            additioals: 1,
        };
    },
    methods: {
        async sendFile(event, str) {
            const res = await sendFile(event);

            if (str === 'adgs0') {
                this.form.adgs_test[0].file_id = res.data;
                this.form.adgs_test[0].name = 'АДГС 1';
                return;
            }

            if (str === 'adgs1') {
                this.form.adgs_test[1].file_id = res.data;
                this.form.adgs_test[1].name = 'АДГС 2';
                return;
            }
        }
    },
};
</script>

<template>
    <v-form class="mx-4">

        <h2 class="my-5">
            Приложить результаты тестирования в АДГС РК
        </h2>
        
        <h4 class="my-4">АДГС 1</h4>
        <v-row>
            <v-text-field 
                label="Результат" 
                v-model="form.adgs_test[0].result"
                type="number"
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-text-field>
            <v-file-input 
                @change="sendFile($event, 'adgs0')"
                label="Файл"
                v-model="form.adgs_test[0].file" 
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-file-input>
        </v-row>

        <h4 class="my-4">АДГС 2</h4>
        <v-row>
            <v-text-field 
                label="Результат" 
                v-model="form.adgs_test[1].result"
                type="number"
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-text-field>
            <v-file-input 
                @change="sendFile($event, 'adgs1')"
                label="Файл" 
                v-model="form.adgs_test[1].file" 
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-file-input>
        </v-row>

        <v-checkbox 
            label="Cудимость, досудебное прекращение уголовного преследования"
            v-model="form.crimes[0].crime_status"
        ></v-checkbox>
        <v-text-field 
            v-if="form.crimes[0].crime_status"
            label="Комментарий"
            v-model="form.crimes[0].employee_comment"
        ></v-text-field>

        <v-checkbox 
            label="Увольнение по отрицательным мотивам"
            v-model="form.crimes[1].crime_status"
        ></v-checkbox>
        <v-text-field 
            v-if="form.crimes[1].crime_status"
            label="Комментарий"
            v-model="form.crimes[1].employee_comment"
        ></v-text-field>

        <v-checkbox 
            label="Административные взыскания в судебном порядке"
            v-model="form.crimes[2].crime_status"
        ></v-checkbox>
        <v-text-field 
            v-if="form.crimes[2].crime_status"
            label="Комментарий"
            v-model="form.crimes[2].employee_comment"
        ></v-text-field>

        <v-checkbox 
            label="Иные администравнивные взыскания"
            v-model="form.crimes[3].crime_status"
        ></v-checkbox>
        <v-text-field 
            v-if="form.crimes[3].crime_status"
            label="Комментарий"
            v-model="form.crimes[3].employee_comment"
        ></v-text-field>

        <v-checkbox 
            label="Увлекались ли Вы азартными играми"
            v-model="form.crimes[4].crime_status"
        ></v-checkbox>
        <v-text-field 
            v-if="form.crimes[4].crime_status"
            label="Комментарий"
            v-model="form.crimes[4].employee_comment"
        ></v-text-field>

        <v-checkbox 
            label="Опыт работы не связанные с СЭР (лесное и животное хозяйство, учителя школ, медицинские работники)"
            v-model="form.crimes[5].crime_status"
        ></v-checkbox>
        <v-text-field 
            v-if="form.crimes[5].crime_status"
            label="Комментарий"
            v-model="form.crimes[5].employee_comment"
        ></v-text-field>

        <v-checkbox
            label="Опыт работы в правоохранительных и специальных государственных органах"
            v-model="form.crimes[6].crime_status"
        ></v-checkbox>
        <v-text-field 
            v-if="form.crimes[6].crime_status"
            label="Комментарий"
            v-model="form.crimes[6].employee_comment"
        ></v-text-field>

        <v-text-field 
            v-for="(n, index) in additioals" 
            :key="index"
            label="Дополнительные сведения"
            v-model="form.other_information[index]"
        ></v-text-field>
        <v-btn @click="additioals++">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <v-checkbox 
            label="Кандидат согласен на обработку персональных данных"
            v-model="form.candidate_agrees"
        ></v-checkbox>

        <v-checkbox 
            label="Кандидат несет ответственность за сведения в анкете"
            v-model="form.candidate_responsible"
        ></v-checkbox>

    </v-form>
</template>