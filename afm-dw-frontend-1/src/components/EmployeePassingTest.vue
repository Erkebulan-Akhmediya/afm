<script>
export default {
    name: 'EmployeePassingTestTab',
    data() {
        return {
            useTests: [],
            useSearch: null,
            useHeaders: [
                { text: "ID", value: "test_id" },
                { text: "Наименование", value: "name" },
                { text: "Описание", value: "description" },
                { text: "Срок прохождения", value: "transitTime" },
                { text: "Дата прохождения", value: "endTime" },
                { text: "Результат", value: "result" },
                { text: "Процент результативности", value: "percentResult" },
            ],
        }
    },
    async created() {
        try {
            await this.search()
        } catch (e) {
            console.log(e)
        }
    },
    methods: {
        async search(bind = {}) {
            try {
                if (bind.resetData) {
                    this.useSearch = null
                }
                const {data} = await this.axios.get(`/api/1.0/test-lists`, {
                    params: {
                        is_deleted: true,
                        employeeId: sessionStorage.getItem('userId'),
                        isPageEmployeePassingTest: true,
                        name: this.useSearch
                    }
                });

                this.useTests = data;
            } catch (e) {
                console.log(e)
            }
        },
        
        getTimeDuration(item) {
            const transitTime = new Date(item.end_time).getTime() - new Date(item.start_time).getTime()
            return this.$moment.utc(new Date(transitTime)).format('HH:mm:ss')
        }
    },
    filters: {
        getPercent(item) {
            const percent = Math.round((item.test_question_correct_qty * 100) / item.test_question_qty)
            return isNaN(percent) ? 0 : percent
        }
    }
}
</script>

<template>
    <section>
        <v-row>
            <v-col md="8">
                <div style="display: flex;">
                        <v-text-field
                            style="max-width: 500px;"
                            class="mr-4"
                            hide-details 
                            v-model="useSearch"
                            :label="`Поиск теста`"
                            required
                            outlined
                            @keydown.enter="search" />
                        <v-btn
                            class="mr-4"
                            height="55"            
                            style="width:150px;"
                            text
                            outlined
                            right
                            color="secondary"
                            @click="search"
                        >
                            Поиск
                        </v-btn>
                        <v-btn
                            height="55"            
                            style="width:150px;"
                            text
                            outlined
                            right
                            color="secondary"
                            @click="search({resetData: true})"
                        >
                            Сброс
                        </v-btn> 
                    </div>
            </v-col>
            <v-col md="4">
                <div style="display: flex; justify-content: end;">
                    <v-btn color="primary" depressed @click="$router.push(`/tests`)">
                        + пройти тест
                    </v-btn>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-data-table
                    :headers="useHeaders"
                    :items="useTests"
                    :items-per-page="10"
                    class="clickableTable elevation-1"
                    :no-data-text="'Нет данных о пройденных тестов'"
                    :footer-props="{
                        itemsPerPageText: $t('globalWords.itemsPerPage'),
                    }"
                >
                    <template v-slot:[`item.transitTime`]="{ item }">
                        <span>{{ getTimeDuration(item) }}</span>
                    </template>
                    <template v-slot:[`item.endTime`]="{ item }">
                        <span>{{$moment(new Date(item.end_time)).format('DD.MM.YYYY HH:mm:ss')}}</span>
                    </template>
                    <template v-slot:[`item.result`]="{ item }">
                        <span>{{item.test_question_correct_qty}}/{{item.test_question_qty}}</span>
                    </template>
                    <template v-slot:[`item.percentResult`]="{ item }">
                        <span>{{item | getPercent}}%</span>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </section>
</template>


<style lang="scss" scoped>
#testsinprogress {
    background: #fff;
    padding: 20px;
}
</style>