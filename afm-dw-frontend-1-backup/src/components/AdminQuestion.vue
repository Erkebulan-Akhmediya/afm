<template>
    <div class="admin_test">
        <h3 class="text-h4">Вопросы</h3>
        <div class="top_panel mb-4" style="display: flex; justify-content: space-between; align-items: center">
            <div class="find_bar" style="display: flex;">
                <v-text-field
                style="max-width:700px; min-width: 500px;"
                class="mr-4"
                hide-details 
                v-model="findData"
                :label="`Поиск вопроса`"
                required
                outlined
                @keydown.enter="find(findData, 'question')"
                ></v-text-field>
                <v-btn
                    class="mr-4"
                    height="55"            
                    style="width:150px;"
                    text
                    outlined
                    right
                    color="secondary"
                    @click="find(findData, 'question')"
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
                @click="addQuestion()"
                >
                <v-icon>
                    mdi-plus
                </v-icon>
                Добавить вопрос
            </v-btn>
        </div>


        <v-dialog v-model="isTestQuestionDialog" width="850">
            <v-card class="dialogOneNews">
                <v-card-title style="background-color: #1976d2;">
                <span class="text-h5">{{testQuestionDialogIsEdit ? `Редактировать вопрос №${testQuestionDialog.id}` : 'Добавить вопрос'}}</span>
                </v-card-title>
                <v-card-text style="padding: 30px;">
                <v-form>
                    <v-row>
                        <v-col cols="6">
                        <v-text-field
                            v-model="testQuestionDialog.name_rus"
                            :label="`Вопрос на Русском`"
                            required
                            outlined
                            hide-details
                        ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                v-model="testQuestionDialog.test_question_type_id"
                                :items="questionTypes"
                                outlined
                                hide-details
                                label="Тип вопроса"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field
                                v-model="testQuestionDialog.name_kaz"
                                :label="`Вопрос на Казахском`"
                                required
                                hide-details
                                outlined
                            ></v-text-field>
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


        <v-dialog v-model="isTestAnswerDialog" width="850">
            <v-card class="dialogOneNews">
                <v-card-title style="background-color: #1976d2;">
                <span class="text-h5">{{testAnswerDialogIsEdit ? `Редактировать вариант №${testAnswerDialog.id}` : 'Добавить вариант'}}</span>
                </v-card-title>
                <v-card-text style="padding: 30px;">
                <v-form>
                    <v-row>
                        <v-col cols="9">
                        <v-text-field
                            v-model="testAnswerDialog.name_rus"
                            :label="`Вариант на Русском`"
                            required
                            outlined
                            hide-details
                        ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="9">
                            <v-text-field
                                v-model="testAnswerDialog.name_kaz"
                                :label="`Вариант на Казахском`"
                                required
                                hide-details
                                outlined
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-switch
                            v-model="testAnswerDialog.is_correct"
                            label="Правильный ответ"
                            color="success"
                            :value="true"
                            hide-details
                            ></v-switch>
                        </v-col>
                    </v-row>
                </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="isTestAnswerDialog = false">
                        Закрыть
                    </v-btn>
                    <v-btn color="success" text @click="sendTestAnswer">
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>        

        <v-data-table
            :headers="questionHeaders"
            :items="questions"
            :loading="testQuestionLoader"
            :items-per-page="10"
            :value="[currentQuestion]"
            class="clickableTable elevation-1 mb-4"
            :no-data-text="'Нет вопросов'"
            @click:row="getAnswers"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
        <template v-slot:[`item.action`]="{ item }">
            <div style="width: 200px">
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="addTestAnswer(item)"
                >
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="editTestQuestion(item)"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="deleteQuestion(item)"
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
        
        <h3 class="text-h4">Варианты</h3>
        <v-data-table
            :headers="answerHeaders"
            :items="answers"
            :loading="testAnswerLoader"
            :items-per-page="10"
            class="clickableTable elevation-1"
            :no-data-text="'Нет вариантов'"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
        <template v-slot:[`item.action`]="{ item }">
            <div style="width: 120px">
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="editTestAnswer(item)"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="deleteAnswer(item)"
                >
                    <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
            </div>
        </template>
        <template v-slot:[`item.is_correct_temp`]="{ item }">
            <span>{{item.is_correct ? 'Да' : ''}}</span>
        </template>
        
        <template v-slot:[`item.create_date`]="{ item }">
            <span>{{moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        <template v-slot:[`item.update_date`]="{ item }">
            <span>{{moment(new Date(item.update_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        </v-data-table>
        
    </div>
</template>
<script>
import moment from "moment";
export default {
    components: {
    },
    data: function() {
        return {
            moment,
            findData: '',
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


                        answerHeaders: [
                {text: 'ID', value: 'id'},
                {text: 'Вариант', value: 'name'},
                {text: 'Правильный ответ', value: 'is_correct_temp'},
                {text: 'Дата создания', value: 'create_date'},
                {text: 'Дата обновления', value: 'update_date'},
                {text: 'Создан', value: 'create_user'},
                {text: 'Изменен', value: 'update_user'},
                {text: 'Действия', value: 'action'},
            ],
            answers: [],

            isTestQuestionDialog: false,
            testQuestionDialogIsEdit: false,
            testQuestionDialog: {},
            testQuestionLoader: false,
            questionTypes : [],
            currentQuestion: {},

            isTestAnswerDialog: false,
            testAnswerDialogIsEdit: false,
            testAnswerDialog: {},
            testAnswerLoader: false,



                    }
    },
    methods: {
        async addQuestion() {
            this.testQuestionDialog = {}
            this.testQuestionDialogIsEdit = false
            this.isTestQuestionDialog = true
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

        async editTestAnswer(item) {
            try {
                let localParams = {
                    id: item.id
                }
                let params = {
                    is_admin: true
                }
                let {data} = await this.axios.get(`/api/1.0/test_answer/:id`, {localParams, params})
                this.testAnswerDialog = data[0]
                this.testAnswerDialogIsEdit = true
                this.isTestAnswerDialog = true
            } catch (error) {
                console.log(error)
            }
        },

        async deleteQuestion(item) {
            this.$swal({
                title: `Вы действительно хотите удалить вопрос №${item.id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    item.is_active = false
                    try {
                        await this.axios.put(`/api/1.0/testQuestion`, {id: item.id, is_active: false})
                        await this.getAllTestQuestion()
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
                    }
            }})
        },

        async deleteAnswer(item) {
            this.$swal({
                title: `Вы действительно хотите удалить вариант №${item.id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    item.is_active = false
                    try {
                        await this.axios.put(`/api/1.0/test_answer`, {id: item.id, is_active: false, question_id: this.currentQuestion.id})
                        await this.getAnswers(this.currentQuestion)
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
                    }
            }})
        },

        async sendTestQuestion() {
            const err = []

            if(!this.testQuestionDialog.name_rus?.trim()) {
                err.push(`Заполните название на Русском`)
            }

            if(!this.testQuestionDialog.name_kaz?.trim()) {
                err.push(`Заполните название на Казахском`)
            }

            if(!this.testQuestionDialog.test_question_type_id) {
                err.push(`Выберите тип вопрооса`)
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
                let method = this.testQuestionDialogIsEdit ? 'put' : 'post'
                await this.axios[method](`/api/1.0/testQuestion`, this.testQuestionDialog )
                this.isTestQuestionDialog = false
                this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'success',
                        title: 'Вопрос сохранён'  
                    })
                this.getAllTestQuestion()
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

        async sendTestAnswer() {

                        const err = []

            if(!this.testAnswerDialog.name_rus?.trim()) {
                err.push(`Заполните название на Русском`)
            }

            if(!this.testAnswerDialog.name_kaz?.trim()) {
                err.push(`Заполните название на Казахском`)
            }

            this.testAnswerDialog.question_id = this.currentQuestion.id
            this.testAnswerDialog.question_type_id = this.currentQuestion.test_question_type_id

            if(err.length) {
                return this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                timer: 5000,
                width: 600,
                title: err.join('; <br>'),
                });
            }

            if(!this.testAnswerDialog.is_correct) {
                this.testAnswerDialog.is_correct = false
            }
            try {
                let method = this.testAnswerDialogIsEdit ? 'put' : 'post'
                await this.axios[method](`/api/1.0/test_answer`, this.testAnswerDialog )
                this.isTestAnswerDialog = false
                this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'success',
                        title: 'Вариант сохранён'  
                    })
                this.getAnswers(this.currentQuestion)
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

        clearFind() {
            this.findData = ''
            this.getAllTestQuestion()
            this.answers = []
        },

        async getAllTestQuestion(test_id) {
            try {
                this.testQuestionLoader = true
                let params = {
                    test_id
                }
                let {data} = await this.axios.get(`/api/1.0/test_question`, {params})
                this.questions = data
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

        async addTestAnswer(item) {
            this.currentQuestion = item
            this.testAnswerDialogIsEdit = false
            this.testAnswerDialog = {
                test_question_id: item.id
            }
            this.isTestAnswerDialog = true
        }, 

                async getAnswers(item) {
            try {
                this.testAnswerLoader = true
                this.currentQuestion = item
                let {data} = await this.axios.get(`/api/1.0/test_answer`, {params: {testQuestionId: item.id}})
                this.answers = data
            } catch (error) {
                console.log(error)
            } finally {
                this.testAnswerLoader = false
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
                    this.testQuestionLoader = true
                    this.answers = []
                    params = {
                        name: data
                    }

                                        try {
                        tmp = await this.axios.get(`/api/1.0/test_question`, {params})
                    } catch (error) {
                        console.log(error)
                    } finally {
                        this.testQuestionLoader = false
                    }
                    this.questions = tmp.data
                    result = data
                    break;

                            default:
                    break;
            }
            return result
        }
    },
    created() {
        this.getQuestionTypes()
        this.getAllTestQuestion()
    }
}
</script>