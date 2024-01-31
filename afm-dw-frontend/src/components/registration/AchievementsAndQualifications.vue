<script>
import { mapGetters } from 'vuex'
// import sendFile from '../../utils/send_file.js'

export default {
    computed: {
        ...mapGetters(['form']),
    },
    data() {
        return {
            achievements: 1,
            certeficates: 1,
            languages: 1,
            sports: 1,
        };
    },
    methods: {
        addAchievement() {
            this.achievements++;
            this.form.achievements.push({});
        },
        addCerteficate() {
            this.certeficates++;
            this.form.certeficates.push({});
        },
        addLanguage() {
            this.languages++;
            this.form.languages.push({});
        },
        addSport() {
            this.sports++;
            this.form.sports.push({});
        },
        async sendFile(event, index, str) {
            event; index; str;
            // const res = await sendFile(event);
            // console.log(res);

            // if (str === 'achievements') {
            //     this.form.achievements[index].file_id = res.data.file_id;
            //     return;
            // }

            // if (str === 'certeficates') {
            //     this.form.certeficates[index].file_id = res.data.file_id;
            //     return;
            // }
        }
    },
};
</script>

<template>
    <v-form>

        <h2 class="my-5">Достижения (грамоты)</h2>
        <v-row
            v-for="(n, index) in achievements" 
            :key="index"
        >
            <v-col cols="8">
                <v-text-field 
                    label="Грамота" 
                    v-model="form.achievements[index].diploma"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-file-input 
                    @change="sendFile($event, index, 'achievements')"
                    label="Файл" 
                    v-model="form.achievements[index].file"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-file-input>
            </v-col>
        </v-row>
        <v-btn @click="addAchievement">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <h2 class="my-5">Повышение квалификации (сертификаты)</h2>
        <v-row
            v-for="(n, index) in certeficates" 
            :key="index"
        >
            <v-col cols="8">
                <v-text-field 
                    label="Сертефикат" 
                    v-model="form.certeficates[index].certeficate"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-file-input 
                    @change="sendFile($event, index, 'certeficates')"
                    label="Файл" 
                    v-model="form.certeficates[index].file"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-file-input>
            </v-col>
        </v-row>
        <v-btn @click="addCerteficate">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <h2 class="my-5">Владение иностранными языками</h2>
        <v-row
            v-for="(n, index) in languages" 
            :key="index"
        >
            <v-col cols="8">
                <v-text-field 
                    label="Иностранный язык" 
                    v-model="form.languages[index].language"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field 
                    label="Уровень" 
                    v-model="form.languages[index].knowledge"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
            </v-col>
        </v-row>
        <v-btn @click="addLanguage">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <h2 class="my-5">Занятие спортом</h2>
        <v-row
            v-for="(n, index) in sports" 
            :key="index"
        >
            <v-col cols="8">
                <v-text-field 
                    label="Спорт" 
                    v-model="form.sports[index].sportname"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field 
                    label="Разряд" 
                    v-model="form.sports[index].level"
                    :rules="[v => !!v || 'Обязательное поле']"
                    required
                    outlined
                ></v-text-field>
            </v-col>
        </v-row>
        <v-btn @click="addSport">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

    </v-form>
</template>