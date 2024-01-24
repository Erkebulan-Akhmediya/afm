<script>
import editor from "@ckeditor/ckeditor5-build-classic";
import CustomPaginationVue from "../components/CustomPagination.vue";
export default {
    name: 'TestInProgressPage',
    data() {
        return {
            editor: editor,
            useTests: {},
            useSessionStorageTestData: {},
            useDialog: false,
            useTotalResultTest: {},
            drawer: true,
            group: null,
            useTimerEndState: false,
            useIntervalTimer: null,
            useEndTimeTest: null,
            useHeightBoxQuestion: 0,
            useActiveCheckMark: [],
            isBlured: [],
            isBluredData: 0,
            timeToBlured: 1000,
            accessTime: 0,
            isEndTest: false,
            essay: '',
            testType: -1,
            itemsPerPage: 1,
            currentPage: 1,
            endDialog: false,
        }
    },
    components:{
        CustomPaginationVue
    },
    async created() {
        try {
            this.useSessionStorageTestData = JSON.parse(sessionStorage.getItem('testData'));
            await this.getData({testId: this.useSessionStorageTestData.testId});
            
            this.useIntervalTimer = setInterval(() => {
                this.accessTime = this.$moment(this.useEndTimeTest).diff(this.$moment())
                if (this.$moment(this.useEndTimeTest).isBefore(this.$moment())) {
                    this.useTimerEndState = true;
                    this.isBlured.map(item => {
                        clearTimeout(item)
                    })
                    alert(`Время тестирования закончилось`)
                    this.endTest()
                }
            }, 1000)

            this.useHeightBoxQuestion = (document.querySelector('body').clientHeight - document.getElementById('boxquestion').offsetTop) - 170;
            console.log('hegith',this.useHeightBoxQuestion)
        } catch (e) {
            console.log(e)
        }
    },
    methods: {
        changePage(newPage) {
            this.currentPage = newPage;
        },
        handlePageChange() {
      window.scrollTo({
        top: 0, // or the top position of a specific element
        behavior: 'smooth'
      });
    },

        getPaginationItemColor(questionIndex) {
            return this.isQuestionAnswered(questionIndex) ? 'green' : 'default';
        },

        isQuestionAnswered(questionIndex) {
            const question = this.useTests.testSessionAnswer[questionIndex];
            return question && question.userAnswerId !== undefined;
        },

        blur(isBlur = false) {
            if(isBlur || this.useTimerEndState || this.isEndTest) {
                this.isBlured.map(item => {
                    clearTimeout(item)
                })
                return
            } else if(this.isBluredData < 2 && this.endDialog == false) {
                const timeout = setTimeout(() => {
                    alert('При повторном покидании страницы теста результат отправится автоматически')
                    this.isBluredData ++
                }, this.timeToBlured);
                this.isBlured.push(timeout)
            } else if(this.isBluredData < 10 && this.endDialog == false) {
                const timeout = setTimeout(() => {
                    alert('Вы повторно покинули страницу, результат был отправлен на сервер.')
                    this.isBluredData = 10
                    this.useTimerEndState = true
                    this.isBlured.map(item => {
                        clearTimeout(item)
                    })
                    this.endTest()
                }, this.timeToBlured);
                this.isBlured.push(timeout)
            }
            
        },
        async getData(bind = {}) {
            try {
                const {data} = await this.axios.get(`/api/1.0/test-lists`, {
                    params: {
                        employeeId: sessionStorage.getItem('userId'),
                        testId: bind.testId,
                        isPaigTestInProgress: true,
                        // testType would be good 
                    }
                });
                this.useTests = data;
                this.testType = this.useTests.testSessionAnswer[0].questionTypeId;
                for(let i = 0; i < this.useTests.testSessionAnswer.length; i++){
                    if(this.useTests.testSessionAnswer[i].questionTypeId == 2){
                    const topic = await this.axios.get(`/api/1.0/test-session-essay`, {
                        params: {
                            test_session_id: this.useSessionStorageTestData.testSessionId
                        }
                    });
                    this.useTests.testSessionAnswer[0].questionId = topic.data[0].question_id
                    this.useTests.testSessionAnswer[0].questionName = topic.data[0].question_name
                    break;
                    }
                    if(this.useTests.testSessionAnswer[i].questionTypeId == 3){
                        if(!this.useTests.testSessionAnswer[i].questionName.includes(' ')){
                            let image_url
                            
                            image_url = await this.axios.get('/api/1.0/file-link/', { params: {
                                id: parseInt(this.useTests.testSessionAnswer[i].questionName, 10),
                            }
                            });
                            this.useTests.testSessionAnswer[i].image_link = image_url.data   
                        }
                                                  
                            
                            
                    }
                }
                
                console.log('second change',this.useTests)
                this.useEndTimeTest = this.$moment(data.startTime).add(data.duration, 'minutes');
            } catch (e) {
                if (e.data && e.data.ERR_MSG) {
                    sessionStorage.removeItem('testData');
                    sessionStorage.setItem('startTestError', JSON.stringify(e.data.ERR_MSG));
                    this.$router.push(`/tests`)
                }
            }
        },
        endTestDialog(){
            this.endDialog = true
        },
        cancelEndTest(){
            this.endDialog = false
        },
        async endTest() {
            // 
            try {
                this.isEndTest = true
                //  user answers
                const testSessionAnswer = this.useTests.testSessionAnswer.reduce((acc, item) => {
                    acc.push({
                        questionId: item.questionId,
                        userAnswerId: item.userAnswerId,
                        isEssay: this.testType == 2 ?  true : false,
                        essay: this.testType == 2 ? this.essay : '',
                        testType: this.testType,
                    })
                    return acc;
                }, [])
                console.log('here is testsessionAnswer', testSessionAnswer)

                const {data} = await this.axios.put(`/api/1.0/test/${this.useSessionStorageTestData.testId}/employee/${sessionStorage.getItem('userId')}/testSession/${this.useSessionStorageTestData.testSessionId}`, {
                    statusId: 2,
                    testSessionAnswer
                });
                this.endDialog = false
                this.useTotalResultTest = data;
                this.useDialog = true;
                
            } catch (e) {
                console.log(e)
            }
        },
        anchorLink(e) {
            const attr = e.target.getAttribute('href');
            document.querySelector(attr).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        },
        checkRadio(e) {
            const getAllInputs = e.target.getAttribute('class');
            const getId = e.target.getAttribute('id');

            for (const i of document.querySelectorAll(`.${getAllInputs}`)) {
                const childId = i.getAttribute('id');
                const index = this.useActiveCheckMark.findIndex(item => item === childId);
                if (index >= 0) {
                    this.$delete(this.useActiveCheckMark,index)
                }
            }

            this.useActiveCheckMark.push(getId)
        },
        getTimeDuration(item) {
            const transitTime = new Date(item.end_time).getTime() - new Date(item.start_time).getTime()
            return this.$moment.utc(new Date(transitTime)).format('HH:mm:ss')
        },
        preventPaste(event) {
      // Предотвращаем вставку текста из буфера обмена
      event.preventDefault();
    },
        
        getPercent(item) {
            const percent = Math.round((this.useTotalResultTest.currentAnswerUserCount * 100) / (item.testSessionAnswer || []).length)
            return isNaN(percent) ? 0 : percent
        }
    },
    beforeDestroy() {
        clearInterval(this.useIntervalTimer)
        this.isBlured.map(item => {
            clearTimeout(item)
        })
    },
    beforeRouteLeave(to, from, next) {
        if(this.useTimerEndState || this.isBluredData == 10 || this.isEndTest) {
                next()
                return
        }
        this.$swal({
            title: `Вы действительно хотите покинуть тест? Результаты будут отправлены.`,
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "Отмена",
            confirmButtonColor: "#4caf50",
            cancelButtonColor: "#d33",
            confirmButtonText: "Да",
        }).then(async (result) => {
            if (result.isConfirmed) {
                this.isBlured.map(item => {
                    clearTimeout(item)
                })
                clearInterval(this.useIntervalTimer)
                await this.endTest()
                next()
        }})
    },
    computed:{
        totalPages() {
            return Math.ceil(this.useTests.testSessionAnswer.length / this.itemsPerPage);
        },
    paginationItemClasses() {
    return this.useTests.testSessionAnswer.map((_, index) => ({
      'answered-question': this.isQuestionAnswered(index),
      'default-color': !this.isQuestionAnswered(index),
    }));
  },


        paginatedQuestions() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.useTests.testSessionAnswer.slice(start, end);
        },
    },
    watch: {
        useDialog(val) {
            if (!val && Object.keys(this.useTotalResultTest).length) {
                sessionStorage.removeItem('testData')
                this.$router.push(`/tests`)
            }
        },
        group () {
            this.drawer = true
        },
        useTimerEndState(val) {
            if (val) {
                this.isBlured.map(item => {
                    clearTimeout(item)
                })

                clearInterval(this.useIntervalTimer)
            }
        },
        preventPaste(event) {
      // Предотвращаем вставку текста из буфера обмена
      event.preventDefault();
    },
    },
}
</script>

<template>
    <section>
        <div @mouseleave="blur()" @mouseenter="blur(true)" id="testsinprogress" ref="testsinprogress">
            <h3 class="text-h4">Внимание!</h3>
            <h4 class="text-h5">При покидании стрелки красной зоны тест автоматически завершится!</h4>
            <v-row>
                <v-col>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2>{{$t('mainPage.mainMenu.tests')}}</h2> 
                        <span>Время окончания теста: {{ useEndTimeTest ? useEndTimeTest.format('DD.MM.YYYY HH:mm:ss') : '00:00' }}</span>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                        <v-expansion-panels >
                            <v-expansion-panel >
                                <v-expansion-panel-header>
                                {{ useTests.name }}(Читать описание)
                                </v-expansion-panel-header>
                                <v-expansion-panel-content style="padding-bottom:20px;">
                                    <div style="padding: 2rem 0 0 2rem">
                                    <v-row>
                                        <span>Описание: {{ useTests.description }}</span>
                                    </v-row>
                                    <v-row>
                                        <span>Количество вопросов: {{ useTests.count_question }}</span>
                                    </v-row>
                                    <v-row>
                                        <span>Время на прохождение: {{ useTests.duration }} мин</span>
                                    </v-row>
                                    </div>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>


                    
                    
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div class="scrollWrapper" :style="{height: `${useHeightBoxQuestion}px`, overflowY: `auto`}" id="boxquestion">
                        
                        <v-sheet  
                            v-for="(question, i) in paginatedQuestions"
                            :key="i + 1 + (currentPage - 1) * itemsPerPage"
                            :id="`questionId${i + 1 + (currentPage - 1) * itemsPerPage}`"
                            class="questionsBox"
                            style="margin: 1rem auto; padding: 1rem 1rem 1rem 1rem;"
                            color="white"
                            width="70%">
                            <div v-if="question.questionTypeId == 3" :class="{ 'd-flex': !question.questionName.includes(' ') }">
                                <div v-if="!question.questionName.includes(' ')">
                                    <v-img width="300" height="300" :src="question.image_link"></v-img>
                                </div>
                                <div v-else>
                                    {{(i + 1) + (currentPage - 1) * itemsPerPage}}. {{question.questionName}}

                                </div>
                                <div style="padding: 2rem 0 0 2rem">
                                <label class="container-radio" v-for="(answer,j) in question.answers" :key="j">
                                    {{answer.name}}
                                    <input type="radio" :class="`questionAnswerClassInput${i + 1 + (currentPage - 1) * itemsPerPage}`" :id="`questionID${i + 1 + (currentPage - 1) * itemsPerPage}AnswerId${j+1}`" :name="`questionAnswerNameInput${i + 1 + (currentPage - 1) * itemsPerPage}`" :value="answer.answerId" v-model="question.userAnswerId" @change="checkRadio">
                                    <span class="checkmark">
                                        <v-icon style="color: #2196f3; top: -10px; font-size: 30px; left: -2px;" v-if="useActiveCheckMark.includes(`questionID${i + 1 + (currentPage - 1) * itemsPerPage}AnswerId${j+1}`)" class="link-icon">mdi-check</v-icon>
                                    </span>
                                </label>
                            </div>
                                 
                            </div>
                            
                            <div v-if="question.questionTypeId == 2" width="100%">
                                <div>
                                    Тема: {{question.questionName}}
                                </div>
                                <v-textarea v-model="essay" height="500" class="mt-10 no-paste" label="Эссе" outlined @paste="preventPaste"></v-textarea>

                            </div>
                            <div v-if="question.questionTypeId == 1">
                                <div>
                                    {{(i + 1) + (currentPage - 1) * itemsPerPage}}. {{question.questionName}}

                            </div>
                            <div style="padding: 2rem 0 0 2rem">
                                <label class="container-radio" v-for="(answer,j) in question.answers" :key="j">
                                    {{answer.name}}
                                    <input type="radio" :class="`questionAnswerClassInput${i + 1 + (currentPage - 1) * itemsPerPage}`" :id="`questionID${i + 1 + (currentPage - 1) * itemsPerPage}AnswerId${j+1}`" :name="`questionAnswerNameInput${i + 1 + (currentPage - 1) * itemsPerPage}`" :value="answer.answerId" v-model="question.userAnswerId" @change="checkRadio">
                                    <span class="checkmark">
                                        <v-icon style="color: #2196f3; top: -10px; font-size: 30px; left: -2px;" v-if="useActiveCheckMark.includes(`questionID${i + 1 + (currentPage - 1) * itemsPerPage}AnswerId${j+1}`)" class="link-icon">mdi-check</v-icon>
                                    </span>
                                </label>
                            </div>
                            </div>
                        </v-sheet>
          
                        <CustomPaginationVue
                        v-if="this.testType != 2"
                        :total-pages="totalPages"
                        :current-page="currentPage"
                        :visible-pages="totalPages" 
                        :is-question-answered="isQuestionAnswered"
                        @update:currentPage="changePage"
                        ></CustomPaginationVue>

                        <div style="display: flex; justify-content: center;">
                        <v-btn
                        class="mt-10"
                        depressed
                        color="primary"
                        @click="endTestDialog"
                        >
                        ЗАВЕРШИТЬ
                        </v-btn>
                    </div>
                    </div>
                </v-col>
                
            </v-row>
            <v-dialog v-model="endDialog" max-width="550">
            <v-card>
                <v-card-title class="text-h6 font-weight-bold">
                    Подтвердите свой выбор: Завершение теста
                </v-card-title>
                <v-card-text>
                    Вы уверены, что хотите завершить тест?
                </v-card-text>
                <v-card-actions class="d-flex justify-center">
                    <v-btn color="primary" @click="endTest">Подтвердить</v-btn>
                    <v-btn color="error" @click="cancelEndTest">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
            
        </div>


        <v-dialog v-model="useDialog" width="900">
            <v-card v-if="this.testType == 3">
                <v-card-title class="text-h5 blue lighten-2">
                    Результат
                </v-card-title>
                <v-card-text>
                    <div style="padding: 3rem;">
                        <v-row>
                            <span>Ваш результат:</span>
                        </v-row>

                        <v-row>
                            <v-col>
                                <span style="display:block; text-align: center; font-size: 4.5rem; margin-top: 3rem; ">{{useTotalResultTest.currentAnswerUserCount}}/{{(useTests.testSessionAnswer || []).length}}</span>
                            </v-col>
                            <v-col>
                                <span style="display:block; text-align: center; font-size: 4.5rem; margin-top: 3rem; ">{{getPercent(useTests)}}%</span>
                            </v-col>
                        </v-row>

                        <div style="padding: 3rem 0 0 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                            <div style="width: 60%;">
                                <span style="font-size: 1rem; display: block;">
                                    Срок прохождения теста: {{getTimeDuration({start_time: useTotalResultTest.startTime, end_time: useTotalResultTest.endTime})}}
                                </span>
                                <span style="font-size: 1rem; margin-top: 1rem; display: block;">
                                    Ваш результат будет отображаться в вашей карте
                                </span>
                            </div>
                            <br>
                        </div>
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
            <v-card v-else-if="this.testType == 2">
                <v-card-title class="text-h5 blue lighten-2">
                    Ваш Эссе был отправлен!
                </v-card-title>

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
            <v-card v-else>
                <v-card-title class="text-h5 blue lighten-2">
                    Ваши ответы отправлены.
                </v-card-title>

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
#testsinprogress {
    background: #fff;
    padding: 20px;
    border: 2px solid rgb(185, 1, 1);
}
 .answered-question {
        background-color: #4caf50; /* or any color you prefer */
        color: white; /* adjust text color if needed */
    }

.container-radio {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 1rem;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.container-radio input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}
.pagination_item{
    color: blue;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  border-radius: 50%;
  border: 3.5px solid #ccc;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}


.container-radio input:checked ~ .checkmark:after {
    display: block;
    border-radius: 50%;
    border: 3.5px solid #2196f3;
    width: 25px;
    left: -3px;
    top: -3.5px;
    height: 25px;
}

.questionsBox:hover {
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    border-radius: 10px;
}
</style>
