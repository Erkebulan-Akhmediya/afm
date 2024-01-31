<template>
    <div class="admin_test">
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

            
            <v-btn
                color="primary"
                @click="addTest()"
                >
                <v-icon>
                    mdi-plus
                </v-icon>
                Добавить тест
            </v-btn>
        </div>
        
        
        <v-data-table
            :headers="testHeaders"
            :items="tests"
            :loading="testLoader"
            :items-per-page="10"
            class="clickableTable elevation-1 mb-4"
            @click:row="selectQuestions"
            :value="selectedTest"
            :no-data-text="'Нет тестов'"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
        <template v-slot:[`item.action`]="{ item }">
            <div style="width: 230px">

                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="publishTest(item)"
                    :disabled="item.status_id == 2"
                >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                            v-bind="attrs"
                            v-on="on"
                            >
                            mdi-bookmark-check-outline
                            </v-icon>
                        </template>
                        <span>Опубликовать</span>
                    </v-tooltip>
                </v-btn>
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
                    :disabled="moment(new Date(item.date_from + '+0000')).isBefore(moment()) && moment(new Date(item.date_to + '+0000')).isAfter(moment()) && item.status_id == 2"
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
            <span>{{moment(new Date(item.date_from + '+0000')).format('DD.MM.YYYY HH:mm:ss')}} - </span>   
            <span>{{moment(new Date(item.date_to + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        <template v-slot:[`item.create_date`]="{ item }">
            <span>{{moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        <template v-slot:[`item.update_date`]="{ item }">
            <span>{{moment(new Date(item.update_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        </v-data-table>
        
        <v-dialog v-model="isTestDialog" width="850">
            <v-card class="dialogOneNews">
                <v-card-title style="background-color: #1976d2;">
                <span class="text-h5">{{testDialogIsEdit ? `Редактировать тест №${testDialog.id}` : 'Добавить тест'}}</span>
                </v-card-title>
                <v-card-text style="padding: 30px;">
                <v-form>
                    <v-row>
                        <v-col cols="6">
                        <v-text-field
                            v-model="testDialog.name_rus"
                            :label="`Заголовок на Русском`"
                            required
                            outlined
                        ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                        <v-text-field
                            v-model="testDialog.name_kaz"
                            :label="`Заголовок на Казахском`"
                            required
                            outlined
                        ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-textarea
                                outlined
                                name="input-7-4"
                                label="Описание теста на Русском"
                                v-model="testDialog.description_rus"
                            ></v-textarea>
                        </v-col>
                        <v-col cols="6">
                            <v-textarea
                                outlined
                                name="input-7-4"
                                label="Описание теста на Казахском"
                                v-model="testDialog.description_kaz"
                            ></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                        Доступен только для департаментов:
                        <v-chip
                            v-if="privateDepartments.length === 0"
                        >
                        Все департаменты
                        </v-chip>
                        <v-chip
                            style="margin-bottom:10px;"
                            close
                            @click:close="deleteSelectDepartment(department)"
                            v-for="department in privateDepartments"
                            :key="department.id"
                        >
                        {{department.id}} - {{department.name}}
                        </v-chip>
                                <v-row>
                                    <v-col>
                                        <div style="margin-top: 1rem;">
                                        <SearchForm ref="searchComponent" placeholder="searchPlaceholder.globalSearchDep" @search="searchDepartment" />
                                        </div>
                                    </v-col>    
                                </v-row>
                                <v-row>
                                    <v-col>
                                    <DepartmentTable @openModal="addDepartment" :departments="searchDepartmentTable" :loader="departmentTableloader"/>
                                    </v-col>
                                </v-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <h6 class="text-h6 mb-2">Дата для прохождения теста</h6>
                            <v-row>
                                <v-col cols="5">
                                    <v-datetime-picker id="dateFrom" 
                                                        ref="dateFrom"
                                                        :datePickerProps="{'first-day-of-week': 1}" 
                                                        :timePickerProps="{format: '24hr', scrollable: true}"
                                                        clearText="Очистить" 
                                                        okText="Ок" 
                                                        dateFormat="dd.MM.yyyy - " 
                                                        label="Дата с" 
                                                        required
                                                        @input="clearFrom"
                                                        v-model="testDialog.date_from">
                                        <template slot="dateIcon">
                                            <span class="mr-4">Дата</span>
                                            <v-icon>mdi-calendar</v-icon>
                                        </template>
                                        <template slot="timeIcon">
                                            <span class="mr-4">Время</span>
                                            <v-icon>mdi-clock</v-icon>
                                        </template>
                                    </v-datetime-picker>
                                </v-col>
                                <v-col cols="1">
                                    
                                </v-col>
                                <v-col cols="5">
                                    <div>

                                        <v-datetime-picker id="dateTo" 
                                                            ref="dateTo"
                                                            :datePickerProps="{'first-day-of-week': 1}" 
                                                            :timePickerProps="{format: '24hr', scrollable: true}"
                                                            clearText="Очистить" 
                                                            okText="Ок" 
                                                            dateFormat="dd.MM.yyyy - " 
                                                            label="Дата по" 
                                                            required
                                                            v-model="testDialog.date_to">
                                            <template slot="dateIcon">
                                                <span class="mr-4">Дата</span>
                                                <v-icon>mdi-calendar</v-icon>
                                            </template>
                                            <template slot="timeIcon">
                                                <span class="mr-4">Время</span>
                                                <v-icon>mdi-clock</v-icon>
                                            </template>
                                        </v-datetime-picker>
                                    </div>
                                </v-col>

                            </v-row>
                        </v-col>
                        <v-col cols="6">
                            <h6 class="text-h6 mb-2">Время на прохождение теста</h6>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field
                                        v-model="testDialog.duration"
                                        :label="`Время`"
                                        required
                                        outlined
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <p class="mt-4" >минут</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="isTestDialog = false">
                        Закрыть
                    </v-btn>
                    <v-btn color="success" text @click="sendTest">
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <h5 class="text-h6 mb-2">Вопросы теста</h5>
        <v-data-table
            :headers="questionHeaders"
            :items="questions"
            :loading="testQuestionLoader"
            :items-per-page="10"
            class="clickableTable elevation-1"
            :no-data-text="'Нет вопросов'"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
        <template v-slot:[`item.action`]="{ item }">
            <div  style="width: 120px">
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="getAnswers(item)"
                >
                    <v-icon>mdi-clipboard-outline</v-icon>
                </v-btn>
                
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="deleteQuestion(item)"
                    :disabled="moment(new Date(currentTest.date_from + '+0000')).isBefore(moment()) && moment(new Date(currentTest.date_to + '+0000')).isAfter(moment()) && currentTest.status_id == 2"
                >
                    <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
            </div>
        </template>
        <template v-slot:[`item.create_date`]="{ item }">
            <span>{{moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        <template v-slot:[`item.update_date`]="{ item }">
            <span>{{moment(new Date(item.update_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        </v-data-table>


        

        <v-dialog v-model="answerDialog" width="850">
            <v-card class="dialogOneNews">
                <v-card-title style="background-color: #1976d2;">
                <span class="text-h5">Варианты вопроса</span>
                </v-card-title>
                <v-card-text style="padding: 30px;">
                    <h4 class="text-h6 mb-4">{{currentQuestion.name}}</h4>

                    <p class="text-h7">Варианты:</p>
                    <div v-for="answer of answerDialogData" :key="answer.id" class="answer-block mb-2" style="display: flex; align-items: center;">
                        <div :class="[`custom_radio`, answer.is_correct ? `checked` : '']"></div>
                        <div class="answer">
                            {{answer.name}}
                        </div>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="answerDialog = false">
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        
        

        <v-dialog v-model="isTestQuestionDialog" width="850">
            <v-card class="dialogOneNews">
                <v-card-title style="background-color: #1976d2;">
                <span class="text-h5">{{testQuestionDialogIsEdit ? `Редактировать вопрос №${testQuestionDialog.id}` : 'Добавить вопрос'}}</span>
                </v-card-title>
                <v-card-text style="padding: 30px;">
                <v-form>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="question_search"
                                :label="`Поиск вопроса`"
                                required
                                outlined
                                hide-details
                                @keydown.enter="find(question_search, 'question')"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-data-table
                                :headers="questionFindHeaders"
                                :items="questionsFind"
                                :loading="testQuestionFindLoader"
                                :items-per-page="10"
                                :value="selectQuestion"
                                @click:row="selectQuestionToTest"
                                class="clickableTable elevation-1"
                                :no-data-text="'Нет вопросов'"
                                :footer-props="{
                                itemsPerPageText: $t('globalWords.itemsPerPage'),
                                }"
                            >
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="isTestQuestionDialog = false">
                        Закрыть
                    </v-btn>
                    <v-btn color="success" text @click="sendTestQuestion">
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>  
        
    </div>
</template>
<script>
import DepartmentTable from '@/components/AdminDepartmentTable';
import SearchForm from '@/components/GlobalSearch';
import moment from "moment";
export default {
    components: {
        DepartmentTable,
        SearchForm
    },
    data: function() {
        return {
            moment,
            findData: '',
            testLoader: false,
            tests: [],
            testHeaders: [
                {text: 'ID', value: 'id'},
                {text: 'Статус', value: 'status_name'},
                {text: 'Название', value: 'name'},
                {text: 'Описание', value: 'description'},
                {text: 'Дата для прохождения теста', value: 'date_from_to'},
                {text: 'Время на прохождение', value: 'duration'},
                {text: 'Дата создания', value: 'create_date'},
                {text: 'Дата обновления', value: 'update_date'},
                {text: 'Создан', value: 'create_user'},
                {text: 'Изменен', value: 'update_user'},
                {text: 'Действия', value: 'action'},
            ],
            questions: [],
            questionHeaders: [
                {text: 'ID', value: 'id'},
                {text: 'Вопрос', value: 'name'},
                {text: 'Тип вопроса', value: 'test_question_type_name'},
                {text: 'Дата создания', value: 'create_date'},
                {text: 'Дата обновления', value: 'update_date'},
                {text: 'Создан', value: 'create_user'},
                {text: 'Изменен', value: 'update_user'},
                {text: 'Действия', value: 'action'},
            ],
            currentTest: {},
            isTestDialog: false,
            testDialogIsEdit: false,
            testDialog: {},
            searchDepartmentTable: [],
            privateDepartments: [],
            departmentTableloader: false,
            selectedTest: [],

            isTestQuestionDialog: false,
            testQuestionDialogIsEdit: false,
            testQuestionDialog: {},
            testQuestionLoader: false,
            questionTypes : [],
            currentQuestion: {},

            answerDialog: false,
            answerDialogData: [],

            questionsFind: [],
            questionFindHeaders: [
                {text: 'ID', value: 'id'},
                {text: 'Вопрос', value: 'name'},
            ],
            isTestQuestionFindDialog: false,
            testQuestionFindDialog: {},
            testQuestionFindLoader: false,
            question_search: '',
            selectQuestion: [],
        }
    },
    methods: {
        selectQuestionToTest(item) {
            this.selectQuestion = [item]

            this.$swal({
                title: `Вы действительно хотите добавить вопрос №${item.id}: "${item.name}" в тест?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await this.sendTestQuestion()
                    this.question_search = ''
                    this.questionsFind = []
            }})
        },

        clearFrom() {
            if(this.moment(this.testDialog.dateTo).isBefore(this.moment(this.testDialog.dateFrom))) {
            this.testDialog.dateTo = ''
            this.$refs.dateTo.clearHandler()
            }
        },

        addDepartment(data) {
            this.searchDepartmentTable = this.searchDepartmentTable.filter(item => item != data)
            if(!this.privateDepartments.find(item => item.id == data.id)) {
                this.privateDepartments = [...[data], ...this.privateDepartments]
            }
        },
        deleteSelectDepartment(department) {
            this.searchDepartmentTable = [...[department], ...this.searchDepartmentTable]
            this.privateDepartments = this.privateDepartments.filter(item => item.id != department.id)
        },
        async searchDepartment(search) {
            try {
                let params = {
                    text: search,
                    search_dep: true,
                    admin_page: true
                }
                const {data: data} = await this.axios.get(`/api/1.0/search`, {params});
                this.searchDepartmentTable = data;
            } catch (e) {
                console.log(e)
            }
        },
        async editTest(test) {
            try {
                this.currentTest = test
                let localParams = {
                    id: test.id
                }
                let params = {
                    is_admin: true
                }
                let {data} = await this.axios.get(`/api/1.0/test/:id`, {localParams, params})
                if(data[0]) {
                    this.privateDepartments = data[0].departments

                                        data[0].date_from = new Date(data[0].date_from + '+0000')
                    data[0].date_to = new Date(data[0].date_to + '+0000')
                    this.testDialog = data[0]
                    this.testDialogIsEdit = true
                    this.searchDepartmentTable = []
                    this.isTestDialog = true
                }
            } catch (error) {
                console.log(error)
            }
        },

        async addTest() {
            this.testDialog = {}
            this.testDialogIsEdit = false
            this.isTestDialog = true
        },

        async deleteTest(item) {
            this.$swal({
                title: `Вы действительно хотите удалить тест №${item.id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    item.is_active = false
                    await this.axios.put(`/api/1.0/test`, {id: item.id, status: 3})
                    await this.getAllTest()
            }})
        },

        async publishTest(item) {
            this.$swal({
                title: `Вы действительно хотите опубликовать тест №${item.id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Опубликовать",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    item.is_active = false
                    try {
                        await this.axios.put(`/api/1.0/test`, {id: item.id, status: 2})
                        await this.getAllTest()
                        this.$swal({
                            ...this.$optionAlert.fire,
                            icon: "success",
                            timer: 5000,
                            width: 300,
                            title: `Тест успешно опубликован`,
                        });
                    }  catch (error) {
                        if(error.data) {
                            this.$swal({
                                ...this.$optionAlert.fire,
                                icon: "error",
                                timer: 5000,
                                width: 300,
                                title: error.data?.ERR_MSG,
                            });
                        }
                        console.log(error)
                    }
            }})
        },

        async sendTest() {
            const err = []

            if(!this.testDialog.name_rus?.trim()) {
                err.push(`Заполните название на Русском`)
            }

            if(!this.testDialog.name_kaz?.trim()) {
                err.push(`Заполните название на Казахском`)
            }

            if(!this.testDialog.description_rus?.trim()) {
                err.push(`Заполните описание на Русском`)
            }

            if(!this.testDialog.description_kaz?.trim()) {
                err.push(`Заполните описание на Казахском`)
            }

            if(!this.testDialog.duration) {
                err.push(`Заполните время на прохождение`)
            } else if(isNaN(this.testDialog.duration)) {
                err.push(`Время на прохождение должно быть числом`)
            }

            if(!this.testDialog.date_from) {
                err.push(`Заполните дату начала теста`)
            }

            if(!this.testDialog.date_to) {
                err.push(`Заполните дату окончания теста`)
            }

            if(this.testDialog.date_from > this.testDialog.date_to) {
                err.push(`Дата начала должна быть меньше даты окончания`)
            }

            if(err.length) {
                return this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                timer: 5000,
                width: 600,
                title: err.join('; <br>'),
                });
            }
            try {
                const bindSend = Object.assign({}, this.testDialog)
                bindSend.date_from = this.moment.utc(bindSend.date_from).format('YYYY-MM-DD HH:mm:ss')
                bindSend.date_to = this.moment.utc(bindSend.date_to).format('YYYY-MM-DD HH:mm:ss')
                bindSend.departments = this.privateDepartments.map(item => item.id)
                let method = this.testDialogIsEdit ? 'put' : 'post'
                await this.axios[method](`/api/1.0/test`, bindSend)
                await this.getAllTest()
                this.isTestDialog = false
                this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'success',
                        title: 'Тест сохранён'  
                    })
            } catch (error) {
                console.log(error)
            }
        },

        async addQuestion(item) {
            this.currentTest = item
            this.testQuestionDialog = {
                test_id: item.id,
                test: item
            }
            this.testQuestionDialogIsEdit = false
            this.isTestQuestionDialog = true

                    },

        async deleteQuestion(item) {
            this.$swal({
                title: `Вы действительно хотите удалить вопрос №${item.id} из теста?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    item.is_active = false
                    await this.axios.put(`/api/1.0/test_question_rel`, {test_question_id: item.id, test_id: this.currentTest.id, is_active: false})
                    await this.selectQuestions(this.currentTest)
            }})
        },

        async editTestQuestion(item) {
            try {
                let localParams = {
                    id: item.id
                }
                let params = {
                    is_admin: true
                }
                let {data} = await this.axios.get(`/api/1.0/test_question/:id`, {localParams, params})
                this.testQuestionDialog = data[0]
                this.testQuestionDialogIsEdit = true
                this.isTestQuestionDialog = true
            } catch (error) {
                console.log(error)
            }
        },

        async sendTestQuestion() {
            try {
                if(!this.selectQuestion.length) {
                    return this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'error',
                        title: 'Выберите вопрос'  
                    })
                }
                await this.axios.post(`/api/1.0/test_question_rel`, {test_id: this.testQuestionDialog.test_id, test_question_id: this.selectQuestion[0].id} )
                this.isTestQuestionDialog = false
                await this.selectQuestions(this.currentTest)
                this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'success',
                        title: 'Вопрос добавлен'  
                    })
            } catch (error) {
                if(error.data) {
                    this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "error",
                        timer: 5000,
                        width: 300,
                        title: error.data?.ERR_MSG,
                    });
                }
                console.log(error)
            }
        },

                async selectQuestions(selectTest) {
            try {
                this.selectedTest = [selectTest]
                this.currentTest = selectTest
                this.questions = await this.getAllTestQuestion(selectTest.id)
            } catch (error) {
                console.log(error)
            }
        },

        clearFind() {
            this.findData = ''
            this.getAllTest()
        },
        async getAllTest() {
            try {
                this.testLoader = true
                const {data} = await this.axios.get(`/api/1.0/test`, {params: {is_admin_table: true}})
                this.tests = data
            } catch (error) {
                console.log('error get test' + error)
            } finally {
                this.testLoader = false
            }
        },

        async getAllTestQuestion(test_id) {
            try {
                this.testQuestionLoader = true
                let params = {
                    test_id
                }
                let {data} = await this.axios.get(`/api/1.0/test_question`, {params})
                return data
            } catch (error) {
                console.log('error get test' + error)
            } finally {
                this.testQuestionLoader = false
            }
        },

        async getQuestionTypes() {
            let {data} = await this.axios.get(`/api/1.0/lov/ref.test_question_type`)
            this.questionTypes = this.changeToSelect(data)
        },

                changeToSelect(data) {
            return data.map(item => {
                return {
                    text: item.name,
                    value: item.id
                }
            })
        },
        async getAnswers(item) {
            try {
                this.currentQuestion = item
                let {data} = await this.axios.get(`/api/1.0/test_answer`, {params: {testQuestionId: item.id}})
                this.answerDialog = true
                this.answerDialogData = data
            } catch (error) {
                console.log(error)
            }
        },

        async find(data, type) {
            let result
            let params
            let tmp
            switch (type) {
                case 'test':
                    params = {
                        name: data,
                        is_admin_table: true
                    }
                    tmp = await this.axios.get(`/api/1.0/test`, {params})
                    this.tests = tmp.data
                    result = data

                                        break;
                case 'question':
                    params = {
                        name: data
                    }
                    tmp = await this.axios.get(`/api/1.0/test_question`, {params})
                    this.questionsFind = tmp.data
                    result = data
                    break;

                            default:
                    break;
            }
            return result
        }
    },
    created() {
        this.getAllTest()
        this.getQuestionTypes()
    }
}
</script><style lang="scss" scoped>
.custom_radio {
    display: block;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    border: 2px solid #979797;
    &.checked {
        border: none;
        background-image: url('../assets/img/ico/check.svg');
    }
}

.answer {
    padding: 10px;
    width: 100%;
    color: #646464;
    border: 1px solid #979797;
    margin-left: 10px;
    border-radius: 5px;
}

</style>