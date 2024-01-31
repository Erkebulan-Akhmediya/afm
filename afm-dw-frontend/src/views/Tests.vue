<script>
export default {
    name: 'TestPage',
    data() {
        return {
            useSearch: null,
            useTests: [],
            useDialog: false,
            useErrMsg: {},
            isLoad: false,
        }
    },
    async created() {
        try {
            if(sessionStorage.getItem('startTestError') && Object.keys(JSON.parse(sessionStorage.getItem('startTestError'))).length) {
                this.useDialog = true
                this.useErrMsg = JSON.parse(sessionStorage.getItem('startTestError'))
                sessionStorage.removeItem('startTestError')
                return
            }
            await this.search();
        } catch(e) {
            console.log(e);
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
                        employeeId: sessionStorage.getItem('userId'),
                        name: this.useSearch,
                        test_filter: true,
                    }
                });
                
                this.useTests = data;
                this.isLoad = true;
                
                
                console.log('useTest', this.useTests)
            } catch (e) {
                console.log(e);
            }
        },
        async start(bind) {
            try {
                const localParams = {
                    user_id: sessionStorage.getItem('userId')
                }
                const {data} = await this.axios.post(`/api/1.0/test/${bind.testId}/employee/:user_id`, {}, {localParams});
                sessionStorage.setItem('testData', JSON.stringify({
                    testId: bind.testId,
                    testSessionId: data.testSessionId.id
                }));
                this.$router.push(`/testInProgress`)
            } catch (error) {
                this.useDialog = true
                this.useErrMsg = error.data.ERR_MSG
            }
        } 
    }
}
</script>

<template>
    <section>
        <div id="tests">
            <p class="text-h4 ml-3 mb-10" v-if="this.useTests.length && isLoad">Доступные тесты</p>
            <v-row >
                
                <v-col>
                    <v-expansion-panels>
                        <v-expansion-panel
                            v-for="(item,i) in useTests"
                            :key="i"
                        >
                            <v-expansion-panel-header>
                                {{item.name}}
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-row>
                                    <div style="padding: 2rem 0 0 2rem">
                                        <v-row>
                                            <span>Описание: {{item.description}}</span>
                                        </v-row>
                                        <v-row>
                                            <span>Количество вопросов: {{item.count_question}}</span>
                                        </v-row>
                                        <v-row>
                                            <span>Время на прохождение: {{item.duration}} мин</span>
                                        </v-row>
                                    </div>
                                </v-row>
                                <v-row>
                                    <div style="display: flex; width: 100%; justify-content: end; margin: 0.5rem 2rem 0.5rem 0;">
                                        <v-btn
                                            text
                                            outlined
                                            color="secondary"
                                            @click="start({testId: item.test_id})"
                                        >
                                            Начать
                                        </v-btn>
                                    </div>
                                </v-row>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-col>
                
            </v-row>
            <v-card class="pa-3" v-if="!this.useTests.length && isLoad">
          <v-card-title class="headline">Вы прошли все тесты!</v-card-title>
          <v-card-text>
            Ожидайте результатов.
          </v-card-text>
        </v-card>
           
        </div>


        <v-dialog v-model="useDialog" width="900">
            <v-card>
                <v-card-text>
                    <div style="padding: 3rem 0 0 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <div style="width: 60%;">
                            <span style="font-size: 1.5rem; text-align: center; display: block;">
                                {{useErrMsg.msg}}
                            </span>
                        </div>
                        <br>
                        <span style="font-size: 1rem; text-align: center; display: block;">Дата прохождения: {{useErrMsg.startDate}}</span>
                    </div>
                </v-card-text>

                <v-card-actions style="display: flex; justify-content: end;">
                    <v-btn
                        depressed
                        color="error"
                        @click="useDialog = false"
                    >
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </section>
</template>


<style lang="scss" scoped>
#tests {
    background: #fff;
    padding: 20px;
}
</style>