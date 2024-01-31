<template>
    <div class="requestSearch">
        <div class="findBar">
            <!--
            <v-select
                v-model="type"
                :items="approveTypes"
                style="max-width: 200px"
                height="55"            
                solo
                class="mr-4"
                hide-details 
                label="Тип"
                @change="find()"
                >
            </v-select>
            -->
            <v-text-field
            style="max-width:300px;"
            class="mr-4"
            hide-details 
            v-model="findField"
            :label="$t('globalWords.searchRequest')"
            required
            outlined
            @keydown.enter="find()"
            ></v-text-field>
            <v-btn
                class="mr-4"
                height="55"            
                style="width:150px;"
                text
                outlined
                right
                color="secondary"
                @click="find"
            >
                {{ this.$t('globalWords.search') }}
            </v-btn>
            <v-btn
                height="55"            
                style="width:150px;"
                text
                outlined
                right
                color="secondary"
                @click="clearFind"
            >
                {{ this.$t('globalWords.reset') }}
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts">
import moment from 'moment'
export default {
    data: function() {
        return {
            approveTypes: [
                { text: 'Заявки на пропуск', value: 'PASS_REQUEST' },
                { text: 'Заявления', value: 'REQUEST' },
                { text: 'Отчет', value: 'REPORT_INSTANCE' },
            ],
            type: null,
            moment,
            findField: '',
        }
    },
    methods: {
        clearFind() {
            this.findField = ''
            this.type = null

            this.$emit(`clearFindRequest`)
        },

        find() {
            let findData = {
                search_query: this.findField,
                type: this.type,
            }
            this.$emit(`findRequest`, findData)
        },

        save (date) {
            this.$refs.menu2.save(date)
        },
    },
    watch: {

    },
}
</script>

<style lang="scss" scoped>
    .findBar {
        display: flex;
        align-items: center;
    }
</style>