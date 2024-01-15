<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters(['form']),
    },
    data() {
        return {
            additioals: 1,
        };
    },
};
</script>

<template>
    <v-form>

        <h2 class="my-5">Приложить результаты тестирования в АДГС РК</h2>
        <v-row>
            <v-text-field 
                label="АДГС 1" 
                v-model="form.adgs_test[0].results"
                outlined
            ></v-text-field>
            <v-file-input 
                label="Файл"
                v-model="form.adgs_test[0].file" 
                outlined
                ></v-file-input>
        </v-row>
        <v-row>
            <v-text-field 
                label="АДГС 2" 
                v-model="form.adgs_test[1].results"
                outlined
            ></v-text-field>
            <v-file-input 
                label="Файл" 
                v-model="form.adgs_test[1].file" 
                outlined
            ></v-file-input>
        </v-row>

        <v-checkbox 
            label="Наличие административных штрафов"
            v-model="form.hasAdministrativeFines"
        ></v-checkbox>

        <v-text-field 
            v-for="(n, index) in additioals" 
            :key="index"
            label="Дополнительные сведения"
            v-model="form.additioals[index]"
        ></v-text-field>
        <v-btn @click="additioals++">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

    </v-form>
</template>