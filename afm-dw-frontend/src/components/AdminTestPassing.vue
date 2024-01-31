<template>
    
    <div class="admin_test_passing">
        
        <h3 class="text-h4 mb-2">Тесты</h3>
        <div class="top_panel mb-4" style="display: flex; justify-content: space-between; align-items: center">
            <div class="find_bar" style="display: flex;">
                <v-text-field
                    style="max-width:700px; min-width: 500px;"
                    class="mr-4"
                    hide-details 
                    v-model="findData"
                    :label="`Поиск теста`"
                    required
                    outlined
                    @keydown.enter="find(findData, 'test')"
                ></v-text-field>
                <v-btn
                    class="mr-4"
                    height="55"            
                    style="width:150px;"
                    text
                    outlined
                    right
                    color="secondary"
                    @click="find(findData, 'test')"
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
                    @click="clearFind"
                >
                    Сброс
                </v-btn>
            </div>
        </div>
        <div class="testWrapper" :style="`display: flex; flex-direction: column;`">
            <div class="testTable">

                <v-data-table
                    :headers="testHeaders"
                    :items="tests"
                    :loading="testLoader"
                    :items-per-page="10"
                    class="clickableTable elevation-1 mb-4"
                    @click:row="selectTest"
                    :value="selectedTest"
                    :no-data-text="'Нет тестов'"
                    :footer-props="{
                    itemsPerPageText: $t('globalWords.itemsPerPage'),
                    }"
                >
                <template v-slot:[`item.action`]="{ item }">
                    <div style="width: 200px">

                        <v-btn
                            icon
                            class="ma-2"
                            @click.stop="editTest(item)"
                        >
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            class="ma-2"
                            @click.stop="addQuestion(item)"
                        >
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            class="ma-2"
                            @click.stop="deleteTest(item)"
                        >
                            <v-icon>mdi-trash-can-outline</v-icon>
                        </v-btn>
                    </div>
                </template>
                <template v-slot:[`item.date_from_to`]="{ item }">
                    <span>{{$moment(item.date_from).format('DD.MM.YYYY HH:mm:ss')}} - </span>   
                    <span>{{$moment(item.date_to).format('DD.MM.YYYY HH:mm:ss')}}</span>   
                </template>
                <template v-slot:[`item.create_date`]="{ item }">
                    <span>{{$moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
                </template>
                <template v-slot:[`item.update_date`]="{ item }">
                    <span>{{$moment(new Date(item.update_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
                </template>
                </v-data-table>
            </div>
            <div class="sessionTable">
                
            <h3 class="text-h4 mb-2">Прохождения</h3>
            <div class="find_bar mb-4" style="display: flex;">
                <v-text-field
                    style="max-width:700px; min-width: 500px;"
                    class="mr-4"
                    hide-details 
                    v-model="findEmployeeData"
                    :label="`Поиск сотрудника`"
                    required
                    outlined
                    @keydown.enter="find(findData, 'test_employee')"
                ></v-text-field>
                <v-btn
                    class="mr-4"
                    height="55"            
                    style="width:150px;"
                    text
                    outlined
                    right
                    color="secondary"
                    @click="find(findData, 'test_employee')"
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
                    @click="clearFindEmployee"
                >
                    Сброс
                </v-btn>
            </div>
                <v-data-table
                    :headers="testSessionHeaders"
                    :items="testSession"
                    :loading="testSessionLoader"
                    :items-per-page="10"
                    class="clickableTable elevation-1 mb-4"
                    @click:row="selectSession"
                    :no-data-text="'Нет тестов'"
                    :footer-props="{
                    itemsPerPageText: $t('globalWords.itemsPerPage'),
                    }"
                >
                <template v-slot:[`item.employee`]="{ item }">
                    <span>{{item.last_name}} {{item.first_name}} {{item.middle_name}}</span>      
                </template>
                <template v-slot:[`item.create_date`]="{ item }">
                    <span>{{$moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
                </template>
                <template v-slot:[`item.duration`]="{ item }">
                    <span>{{getTimeDuration(item)}}</span>   
                </template>
                <template v-slot:[`item.result`]="{ item }">
                    <span>{{item.test_question_correct_qty}}/{{item.test_question_qty}}</span>   
                </template>
                
                <template v-slot:[`item.action`]="{  }">
                    <div style="width: 200px">
                        <v-btn
                            icon
                            class="ma-2"
                        >
                            <v-icon>mdi-clipboard-outline</v-icon>
                        </v-btn>
                    </div>
                </template>
                </v-data-table>
            </div>
        </div>
        
        <v-dialog v-model="isAnswerDialog" width="850">
            <v-card class="dialogOneNews">
                <v-card-title style="background-color: #1976d2;">
                <span class="text-h5">Ответы сотрудника</span>
                </v-card-title>
                <v-card-text style="padding: 30px;">
                
                
                    <v-data-table
                        :headers="testSessionAnswerHeaders"
                        :items="testSessionAnswer"
                        :items-per-page="10"
                        :item-class="getRowColor"
                        class="clickableTable elevation-1 mb-4"
                        @click:row="selectSession"
                        :no-data-text="'Нет тестов'"
                        :footer-props="{
                        itemsPerPageText: $t('globalWords.itemsPerPage'),
                        }"
                    >
                    <template v-slot:[`item.employee`]="{ item }">
                        <span>{{item.last_name}} {{item.first_name}} {{item.middle_name}}</span>      
                    </template>
                    <template v-slot:[`item.create_date`]="{ item }">
                        <span>{{$moment(item.create_date).format('DD.MM.YYYY HH:mm:ss')}}</span>   
                    </template>
                    <template v-slot:[`item.duration`]="{ item }">
                        <span>{{getTimeDuration(item)}}</span>   
                    </template>
                    <template v-slot:[`item.result`]="{ item }">
                        <span>{{item.test_question_correct_qty}}/{{item.test_question_qty}}</span>   
                    </template>
                    </v-data-table>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="isAnswerDialog = false">
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>  

    </div>
</template>
<script>
export default {
    data: function() {
        return {
            findData: '',
            findEmployeeData: '',
            testLoader: false,
            tests: [],
            testHeaders: [
                {text: 'ID', value: 'id'},
                {text: 'Статус', value: 'status_name'},
                {text: 'Название', value: 'name'},
                {text: 'Описание', value: 'description'},
                {text: 'Дата для прохождения теста', value: 'date_from_to'},
                {text: 'Время на прохождение', value: 'duration'}
            ],
            selectedTest: [],

            testSession: [],
            testSessionHeaders: [
                {text: 'ID', value: 'id'},
                {text: 'Сотрудник', value: 'employee'},
                {text: 'Дата прохождения', value: 'create_date'},
                {text: 'Срок прохождения', value: 'duration'},
                {text: 'Результат', value: 'result'},
                {text: 'Действия', value: 'action'}
            ],
            testSessionLoader: false,

            testSessionAnswer: [],
            testSessionAnswerHeaders: [
                {text: 'ID', value: 'id'},
                {text: 'Вопрос', value: 'question_name'},
                {text: 'Ответ сотрудника', value: 'user_answer_name'},
                {text: 'Правильный ответ', value: 'correct_answer_name'},
            ],
            isAnswerDialog: false,
            searchTypes: [{text: 'Тест', value: 1}, {text: 'Сотрудник', value: 2}],
            searchType: 1,
        }
    },
    methods: {

                async getAllTest() {
            try {
                this.testLoader = true
                const {data} = await this.axios.get(`/api/1.0/test`, {params: {is_admin_table: true, is_deleted: true}})
                this.tests = data
            } catch (error) {
                console.log('error get test' + error)
            } finally {
                this.testLoader = false
            }
        },

        async selectTest(data) {
            this.selectedTest = [data]
            this.currentTest = data
            const params = {
                testid: data.id
            }
            this.testSessionLoader = true
            const sessions = await this.axios.get(`/api/1.0/test-session`, {params})

            this.testSession = sessions.data
            this.testSessionLoader = false
        },

        async selectSession(session) {
            const params = {
                test_session_id: session.id
            }
            const answers = await this.axios.get(`/api/1.0/test-session-answer`, {params})

            this.testSessionAnswer = answers.data
            this.isAnswerDialog = true
        },

        async find(data, type) {
            let result
            let params
            let tmp
            switch (type) {
                case 'test':
                    params = {
                        name: data,
                        is_admin_table: true,
                        is_deleted: true,
                        search_type: this.searchType
                    }
                    tmp = await this.axios.get(`/api/1.0/test`, {params})
                    this.tests = tmp.data
                    result = data
                    this.testSession = []
                    break;
                case 'test_employee':
                    this.testSessionLoader = true
                    params = {
                        testid: this.currentTest.id,
                        employee_name: this.findEmployeeData
                    }
                    tmp = await this.axios.get(`/api/1.0/test-session`, {params})
                    this.testSession = tmp.data
                    this.testSessionLoader = false
                    break;

                            default:
                    break;
            }
            return result
        },

                clearFind() {
            this.findData = ''
            this.testSession = []
            this.getAllTest()
        },

                clearFindEmployee() {
            this.findEmployeeData = ''
            this.testSessionAnswer = []
            this.selectTest(this.currentTest)
        },

        getTimeDuration(item) {
            const transitTime = new Date(item.end_time).getTime() - new Date(item.start_time).getTime()
            return this.$moment.utc(new Date(transitTime)).format('HH:mm:ss')
        },

        getRowColor(item) {
            return item.correct_answer_id == item.user_answer_id ? 'green-bg margin-row' : 'red-bg margin-row'
        }
    },

    created() {
        this.getAllTest()
    }
}
</script><style lang="scss">
    .green-bg {
        background-color: rgba(30, 135, 0, 0.28);
    }
    .green-bg:hover {
        background-color: rgba(30, 135, 0, 0.38) !important;
    }
    .red-bg {
        background-color: rgba(201, 1, 1, 0.26) ;
    }
    .red-bg:hover {
        background-color: rgba(201, 1, 1, 0.36) !important;
    }
    .margin-row {
        margin-bottom: 10px;
    }
</style>