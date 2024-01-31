<template>
  <div>
    <v-data-table
  :headers="headers"
  :items="sessions"
  :items-per-page="10"
  class="elevation-1"
  @click:row="onRowClick"
  :loading="loader2"
>
<template v-slot:[`item.id`]="{ item }">
        {{ item.id }}
      </template>
      <template v-slot:[`item.test_session_id`]="{ item }">
        {{ item.test_session_id }}
      </template>
      <template v-slot:[`item.test_id`]="{ item }">
        {{ item.test_id }}
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <v-chip :color="getStatusColor(item.status)">{{ item.status }}</v-chip>
      </template>

</v-data-table>
    <v-dialog max-width="1500" v-model="checkTest">
      <v-card>
          <v-card-title class="text-h4 pb-5 pt-5 text-h" style="background-color: rgb(199, 199, 199);">
              {{this.test_id == 30 ? `Проверка опроса по определений личностных качеств` : `Проверка Эссе`}}
          </v-card-title>
          {{ checkItem.stans }}
         <v-card-text>
        <v-list>
          <v-list-item-group v-if="this.sessionAnswers.data">
            <v-list-item v-for="(answer, index) in sessionAnswers.data" :key="index">
              <v-list-item-content>
                <v-list-item-text class="text-h6">
                  <strong>Вопрос {{ index + 1 }}:</strong> {{ answer.question_name }}
                </v-list-item-text>
                <v-list-item-text class="text-h6" style="white-space: pre-line; word-wrap: break-word; overflow: hidden;">
                  
                  <span v-if="answer.user_answer_name">
                    <v-chip
                      class="ma-2"
                      color="success"
                    >
                      
                      Ответ:
                    </v-chip>
                    {{ answer.user_answer_name }}
                  </span>
                  <span v-else-if="answer.essay">
                    <strong>Эссе:</strong> 
                    <p>{{ answer.essay }}</p>
                  </span>
                  <span v-else style="color:red;">
                    <v-chip
                      class="ma-2"
                      color="red"
                      outlined
                      
                    >
                      
                      Нет ответа
                    </v-chip>
                  </span>
                  
                </v-list-item-text>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-text v-if="editItem.status == 'Не проверено'">
        <div class="text-h5 mt-5 mb-5">Оценка</div>
        <v-textarea v-model="score" label="Оценка" outlined></v-textarea>
        <v-textarea v-model="report" label="Хоарактеристика" outlined rows="5"></v-textarea>
        <v-btn :loading="loader1" @click="sendReport(false)" :disabled="!score || !report" color="primary">
          Отправить
        </v-btn>
      </v-card-text>
      <v-card-text v-if="editItem.status == 'Проверено'">
        <div class="text-h5 mt-5 mb-5">Оценка</div>
        <v-textarea v-model="editItem.grade" label="Оценка" outlined></v-textarea>
        <v-textarea v-model="editItem.report_text" label="Отчет" outlined rows="5"></v-textarea>
        <v-card-title v-if="checkContent" style="color: red; margin:-10px; 0 10px -10px">
          Вы не изменили данные! 
        </v-card-title>
        <v-btn :loading="loader1" @click="sendReport(true)" color="primary">
          Редактировать
        </v-btn>
      </v-card-text>


      </v-card>
    </v-dialog>
  </div>
</template>

<script>


export default {
  data() {
    return {
      headers: [
      { text: 'ID', value: 'id' },
      { text: 'Session ID', value: 'test_session_id' },
      { text: 'Test ID', value: 'test_id' },
      { text: 'Status', value: 'status', align: 'start' }
    ],
    checkContent: false,

      checkTest: false,
      sessionID: -1,
      sessions: [],
      sessionAnswers: [],
      score: '',
      report: '',
      loader1: false,
      loader2: false,
      editItem: {},
      checkItem: {},
    };
  },
  methods: {
    async sendReport(isEdit){
      let obj = {test_session_id: this.sessionID,
                  grade: this.score,
                  report_text: this.report, 
        }
      if(isEdit){ // Отправить
          obj.grade = this.editItem.grade,
          obj.report_text = this.editItem.report_text
      }
      this.loader1 = true;
      console.log('sendreport', obj)
      await this.axios.put(`/api/1.0/test_competency`, obj)
      this.getSession();
      this.loader1 = false;
      this.checkTest = false;

    },
    async editReport(){
        if(this.editItem.grade == this.checkItem.grade && this.editItem.text_report == this.checkItem.text_report){
          this.checkContent = true
        }
        else{
          console.log("sended")
          this.checkContent = false
        }
    },
    onRowClick(item) {
      this.loader2 = true
      this.sessionID = item.test_session_id;
      this.checkItem = item
      this.editItem = item
      this.getSessionResults()
      
    },
    async getSessionResults(){
      const params = {
          test_session_id: this.sessionID
      }
      this.sessionAnswers = await this.axios.get(`/api/1.0/test-session-answer`, {params})
      this.loader2 = false
      this.checkTest = true;
      console.log('advance session', this.sessionAnswers)
    },


      getStatusColor(grade) {
        return (grade === 'Проверено') ? 'success' : '#E53935';
      },

    async getSession() {
      const params = {
        test_id: this.test_id,
      };
      console.log('get sessions')
      const data = await this.axios.get(`/api/1.0/test_competency`, { params });
      this.sessions = data.data
      console.log('new data', data)
      console.log('session',this.sessions)

    },
  },
  created() {
    this.getSession();
  },
  props: ['test_id'],
};
</script>
