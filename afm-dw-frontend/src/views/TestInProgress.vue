<script>
export default {
    name: 'TestInProgressPage',
    data() {
        return {
            useTests: {},
            useSessionStorageTestData: {},
            useDialog: false,
            useTotalResultTest: {},
            drawer: false,
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
            isEndTest: false
        }
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
        } catch (e) {
            console.log(e)
        }
    },
    methods: {
        blur(isBlur = false) {
            if(isBlur || this.useTimerEndState || this.isEndTest) {
                this.isBlured.map(item => {
                    clearTimeout(item)
                })
                return
            } else if(this.isBluredData < 2) {
                const timeout = setTimeout(() => {
                    alert('При повторном покидании страницы теста результат отправится автоматически')
                    this.isBluredData ++
                }, this.timeToBlured);
                this.isBlured.push(timeout)
            } else if(this.isBluredData < 10) {
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
                        isPaigTestInProgress: true
                    }
                });
                this.useTests = data;
                console.log(this.useTests)
                this.useEndTimeTest = this.$moment(data.startTime).add(data.duration, 'minutes');
            } catch (e) {
                if (e.data && e.data.ERR_MSG) {
                    sessionStorage.removeItem('testData');
                    sessionStorage.setItem('startTestError', JSON.stringify(e.data.ERR_MSG));
                    this.$router.push(`/tests`)
                }
            }
        },
        async endTest() {
            try {
                this.isEndTest = true
                const testSessionAnswer = this.useTests.testSessionAnswer.reduce((acc, item) => {
                    acc.push({
                        questionId: item.questionId,
                        userAnswerId: item.userAnswerId
                    })
                    return acc;
                }, [])
                console.log(testSessionAnswer)
                const {data} = await this.axios.put(`/api/1.0/test/${this.useSessionStorageTestData.testId}/employee/${sessionStorage.getItem('userId')}/testSession/${this.useSessionStorageTestData.testSessionId}`, {
                    statusId: 2,
                    testSessionAnswer
                });
                console.log("vse")
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
    watch: {
        useDialog(val) {
            if (!val && Object.keys(this.useTotalResultTest).length) {
                sessionStorage.removeItem('testData')
                this.$router.push(`/tests`)
            }
        },
        group () {
            this.drawer = false
        },
        useTimerEndState(val) {
            if (val) {
                this.isBlured.map(item => {
                    clearTimeout(item)
                })

                clearInterval(this.useIntervalTimer)
            }
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
                    <v-sheet style="margin: 0 auto; padding: 1rem 1rem 2rem 1rem;" color="white" elevation="6" width="95%">
                        <div>
                            {{useTests.name}}
                        </div>
                        <div style="padding: 2rem 0 0 2rem">
                            <v-row>
                                <span>Описание: {{useTests.description}}</span>
                            </v-row>
                            <v-row>
                                <span>Количество вопросов: {{useTests.count_question}}</span>
                            </v-row>
                            <v-row>
                                <span>Время на прохождение: {{useTests.duration}} мин</span>
                            </v-row>
                        </div>
                    </v-sheet>
                </v-col>
            </v-row>
            <v-row>
                <div :style="{height: `${useHeightBoxQuestion}px`, overflowY: `auto`, position: 'absolute', overflowX: 'hidden', width: '10rem'}">
                    <v-app-bar-nav-icon @click.stop="drawer = !drawer" style="top: 2rem; left: 1rem;"></v-app-bar-nav-icon>
                    <v-navigation-drawer
                        v-model="drawer"
                        absolute
                        bottom
                        temporary
                    >
                        <v-list
                            nav
                            dense
                        >
                            <v-list-item-group
                            v-model="group"
                            active-class="deep-purple--text text--accent-4"
                            >
                                <v-list-item style="text-align: start;"
                                        v-for="(question,i) in useTests.testSessionAnswer"
                                        :key="i">
                                    <v-list-item-title :href="`#questionId${i+1}`" @click.prevent="anchorLink">Вопрос {{i+1}}</v-list-item-title>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-navigation-drawer>
                </div>
                <v-col>
                   
                    <div class="scrollWrapper" :style="{height: `${useHeightBoxQuestion}px`, overflowY: `auto`}" id="boxquestion">
                        <v-sheet  
                            v-for="(question,i) in useTests.testSessionAnswer"
                            :key="i"
                            :id="`questionId${i+1}`"
                            class="questionsBox"
                            style="margin: 1rem auto; padding: 1rem 1rem 2rem 1rem;" color="white" width="70%">
                            <div>
                                {{i+1}}. {{question.questionName}}
                            </div>
                            <div style="padding: 2rem 0 0 2rem">
                                <label class="container-radio" v-for="(answer,j) in question.answers" :key="j">
                                    {{answer.name}}
                                    <input type="radio" :class="`questionAnswerClassInput${i+1}`" :id="`questionID${i+1}AnswerId${j+1}`" :name="`questionAnswerNameInput${i+1}`" :value="answer.answerId" v-model="question.userAnswerId" @change="checkRadio">
                                    <span class="checkmark">
                                        <v-icon style="color: #2196f3; top: -10px; font-size: 30px; left: -2px;" v-if="useActiveCheckMark.includes(`questionID${i+1}AnswerId${j+1}`)" class="link-icon">mdi-check</v-icon>
                                    </span>
                                </label>
                            </div>
                        </v-sheet>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div style="display: flex; justify-content: center;">
                        <v-btn
                        depressed
                        color="primary"
                        @click="endTest"
                        >
                        ЗАВЕРШИТЬ
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </div>


        <v-dialog v-model="useDialog" width="900">
            <v-card>
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
        </v-dialog>
    </section>
</template>


<style lang="scss" scoped>
#testsinprogress {
    background: #fff;
    padding: 20px;
    border: 2px solid rgb(185, 1, 1);
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