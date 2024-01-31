<script>
import { mapGetters } from 'vuex'
import sendFile from '../../utils/send_file.js'

export default {
    computed: {
        ...mapGetters(['form']),
    },
    data() {
        return {
            achievements: 1,
            certifications: 1,
            languages: 1,
            sports: 1,
        };
    },
    methods: {
        addAchievement() {
            this.achievements++;
            this.form.achievements.push({});
        },
        deleteAchievement(index) {
            this.form.achievements.splice(index, 1);
            this.achievements--;
        },

        addCerteficate() {
            this.certifications++;
            this.form.certifications.push({});
        },
        deleteCerteficate(index) {
            this.form.certifications.splice(index, 1);
            this.certifications--;
        },

        addLanguage() {
            this.languages++;
            this.form.languages.push({});
        },
        deleteLanguage(index) {
            this.form.languages.splice(index, 1);
            this.languages--;
        },

        addSport() {
            this.sports++;
            this.form.sports.push({});
        },
        deleteSport(index) {
            this.form.sports.splice(index, 1);
            this.sports--;
        },

        async sendFile(event, index, str) {
            const res = await sendFile(event);
            console.log('WHAT THE FUCK IS A KILOMETER', res);

            console.log(str);
            if (str === 'achievements') {
                console.log(123);
                this.form.achievements[index].file_id = res.data;
            }

            if (str === 'certifications') {
                this.form.certifications[index].file_id = res.data;
            }
        },
        validate() {
            for (let achievement of this.form.achievements) {
                if (!achievement.diploma) return false;
                if (!achievement.file) return false;
            }
            for (let certifications of this.form.certifications) {
                if (!certifications.certifications) return false;
                if (!certifications.file) return false;
            }
            for (let sport of this.form.sports) {
                if (!sport.sportname) return false;
                if (!sport.level_id) return false;
            }
            for (let language of this.form.languages) {
                if (!language.language) return false;
                if (!language.knowledge_id) return false;
            }
            return true;
        },
    },
};
</script>

<template>
    <v-form class="mx-4">

        <h2 class="my-5">
            Достижения (грамоты)
            <span class="tooltip">
                <v-icon>mdi-help</v-icon>        
                <span class="tooltiptext">Призеры олимпиад</span>
            </span>        
        </h2>
        <v-row
            v-for="(n, index) in achievements" 
            :key="index"
        >
            <v-text-field 
                class="mx-1"
                label="Грамота" 
                v-model="form.achievements[index].diploma"
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-text-field>
            <v-file-input 
                class="mx-1"
                @change="sendFile($event, index, 'achievements')"
                label="Файл" 
                v-model="form.achievements[index].file"
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-file-input>
            <v-btn 
                v-if="achievements > 1"
                @click="deleteAchievement(index)"
                class="mb-4 mx-1"
            >
                <v-icon>mdi-minus</v-icon>
            </v-btn>
        </v-row>
        <v-btn @click="addAchievement">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <h2 class="my-5">        
            Повышение квалификации (сертификаты)
            <span class="tooltip1">
                <v-icon>mdi-help</v-icon>        
                <span class="tooltiptext1">
                    IELTS, TOEFL, ACCA, CFA, ISO, IPMA, PMI, AWSб CCSP, CDPSE, CDP, CEH, CISM, CISSP, CCIE, CCNP, CompTIA (A+, Cloud+, Security+), Oracle database and MySQL administration certifications, Project management professional (PMP) и т.п.
                </span>
            </span>        
        </h2>
        <v-row
            v-for="(n, index) in certifications" 
            :key="index"
        >
            <v-text-field 
                class="mx-1"
                label="Сертефикат" 
                v-model="form.certifications[index].certifications"
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-text-field>
            <v-file-input 
                class="mx-1"
                @change="sendFile($event, index, 'certifications')"
                label="Файл" 
                v-model="form.certifications[index].file"
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-file-input>
            <v-btn 
                v-if="certifications > 1"
                @click="deleteCerteficate(index)"
                class="mb-4 mx-1"
            >
                <v-icon>mdi-minus</v-icon>
            </v-btn>
        </v-row>
        <v-btn @click="addCerteficate">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <h2 class="my-5">Владение иностранными языками</h2>
        <v-row
            v-for="(n, index) in languages" 
            :key="index"
        >
            <v-text-field 
                class="mx-1"
                label="Иностранный язык" 
                v-model="form.languages[index].language"
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-text-field>
            <v-select                     
                class="mx-4"    
                label="Уровень"                    
                :items="[
                    {
                        display: '(А1) – начальный', 
                        value: 1,
                        // value: '(А1) – начальный',
                    },   
                    {
                        display: '(А2) – ниже среднего', 
                        value: 2,
                        // value: '(А2) – ниже среднего',
                    },                           
                    {
                        display: '(В1) – средний',
                        value: 3,
                        // value: '(В1) – средний',
                    },
                    {
                        display: '(В2) – выше среднего',    
                        value: 4,
                        // value: '(В2) – выше среднего',
                    },                       
                    {
                        display: '(C1) – продвинутый',
                        value: 5,
                        // value: '(C1) – продвинутый',
                    },
                    {
                        display: '(C2) – профессиональный уровень владения', 
                        value: 6,
                        // value: '(C2) – профессиональный уровень владения',
                    }                         
                ]"
                item-text="display"
                item-value="value"
                v-model="form.languages[index].knowledge_id"                   
                :rules="[v => !!v || 'Обязательное поле']"
                required                    
                outlined
            ></v-select>
            <v-btn 
                v-if="languages > 1"
                @click="deleteLanguage(index)"
                class="mb-4 mx-1"
            >
                <v-icon>mdi-minus</v-icon>
            </v-btn>
        </v-row>
        <v-btn @click="addLanguage">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <h2 class="my-5">Занятие спортом</h2>
        <v-row
            v-for="(n, index) in sports" 
            :key="index"
        >
            <v-text-field 
                class="mx-1"
                label="Спорт" 
                v-model="form.sports[index].sportname"
                :rules="[v => !!v || 'Обязательное поле']"
                required
                outlined
            ></v-text-field>
            <v-select 
                class="mx-1"
                label="Разряд" 
                v-model="form.sports[index].level_id"
                :rules="[v => !!v || 'Обязательное поле']"
                :items="[
                    {
                        display: '3-й разряд',
                        value: 1,
                        // value: '3-й разряд',
                    },
                    {
                        display: '2-й разряд',
                        value: 2,
                        // value: '2-й разряд',
                    },
                    {
                        display: '1-й разряд',
                        value: 3,
                        // value: '1-й разряд',
                    },
                    {
                        display: 'Кандидат в мастера спорта (КМС)',
                        value: 4,
                        // value: 'Кандидат в мастера спорта (КМС)',
                    },
                    {
                        display: 'Мастер спорта (МС)',
                        value: 5,
                        // value: 'Мастер спорта (МС)',
                    },
                    {
                        display: 'Международный мастер спорта',
                        value: 6,
                        // value: 'Международный мастер спорта',
                    },
                ]"
                item-text="display"
                item-value="value"
                required
                outlined
            ></v-select>
            <v-btn 
                v-if="sports > 1"
                @click="deleteSport(index)"
                class="mb-4 mx-1"
            >
                <v-icon>mdi-minus</v-icon>
            </v-btn>
        </v-row>
        <v-btn @click="addSport">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

    </v-form>
</template>

<style scoped>
.tooltip {
    position: relative;  
    display: inline-block;
}

.tooltip .tooltiptext {  
    visibility: hidden;
    width: 200px;  
    background-color: rgba(0, 0, 0, 0.5);  
    color: #fff;
    text-align: center;  
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;  top: -5px;
    left: 105%;
    opacity: 0;
    transition: opacity 0.3s;
}

.tooltip:hover .tooltiptext {
    visibility: visible;  
    opacity: 1;
} 

.tooltip1 {  
    position: relative;
    display: inline-block;
}

.tooltip1 .tooltiptext1 {
    visibility: hidden;  
    width: 250px;
    background-color: rgba(0, 0, 0, 0.5);  
    color: #fff;
    text-align: center;  
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;  
    top: -5px;
    left: 105%;
    opacity: 0;
    transition: opacity 0.3s;
}

.tooltip1:hover .tooltiptext1 {
    visibility: visible;  
    opacity: 1;
}
  
</style>