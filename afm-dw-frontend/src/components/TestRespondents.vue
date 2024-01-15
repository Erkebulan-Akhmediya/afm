<template>
    <div>
      <v-data-table
        :headers="headers"
        :items="sessions.data"
        :items-per-page="10"
        class="elevation-1"
        @click:row="onRowClick"
      >
        <template v-slot:items="props">
          <td>{{ props.item.employee_id }}</td>
          <td>{{ props.item.start_time }}</td>
          <td>{{ props.item.end_time }}</td>
          <td>{{ props.item.id }}</td>
        </template>
      </v-data-table>
      <v-dialog max-width="1100" v-model="checkTest">
        <v-card>
            <v-card-title>
                Проверка
            </v-card-title>
           <v-card-text>
          <v-list>
            <v-list-item-group>
              <v-list-item v-for="(answer, index) in sessionAnswers.data" :key="index">
                <v-list-item-content>
                  <v-list-item-title class="text-h6">
                    <strong>Вопрос {{ index + 1 }}:</strong> {{ answer.question_name }}
                  </v-list-item-title>
                  <v-list-item-title class="text-h6">
                    <strong>Ответ:</strong> {{ answer.user_answer_name ? answer.user_answer_name : 'Нет ответа'}} 
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>

<v-card-text>
    <div class="text-h5 mt-5 mb-5">Оценка</div>
      <v-text-field v-model="score" label="Оценка" outlined></v-text-field>
      <v-textarea v-model="report" label="Отчет" outlined rows="5"></v-textarea>
      <v-btn v-if="score && report" color="primary">
    Отправить
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
        { text: 'User ID', value: 'employee_id' },
        { text: 'Start Date', value: 'start_time' },
        { text: 'End Date', value: 'end_time' },
        { text: 'Session ID', value: 'id' },
      ],

        data: [
          { employee_id: 1, start_time: '2024-01-15', end_time: '2024-01-20', status_id: 'Active' },
          { employee_id: 2, start_time: '2024-01-16', end_time: '2024-01-25', status_id: 'Inactive' },
        ],
        checkTest: false,
        sessionID: -1,
        sessions: [],
        sessionAnswers: [],
        score: '',
        report: '',
      };
    },
    methods: {
      onRowClick(item) {
        this.sessionID = item.id;
        this.getSessionResults()
        this.checkTest = true;
      },
      async getSessionResults(){
        const params = {
            test_session_id: this.sessionID
        }
        this.sessionAnswers = await this.axios.get(`/api/1.0/test-session-answer`, {params})
      },
      async getSession() {
        const params = {
          testid: this.test_id,
        };
        this.sessions = await this.axios.get(`/api/1.0/test-session`, { params });
        console.log(this.sessions)
      },
    },
    created() {
      this.getSession();
    },
    props: ['test_id'],
  };
  </script>
  