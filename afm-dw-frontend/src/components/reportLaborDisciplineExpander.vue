<template>
  <v-row>
    <v-col cols="12">
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(item, index) in inputData"
          :key="index"
        >
          <v-expansion-panel-header>
            <v-row class="ma-0 pa-0">
              <v-col cols="8" class="ma-0 pa-0">{{ item.name }}</v-col>
              <v-col cols="4" class="ma-0 pa-0" v-if = "item.position_name"><span style="font-family: 'auto'; font-style: italic;">{{item.position_name}}</span></v-col>
            </v-row>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <reportLaborDisciplineExpander
              :inputData="item.children"
            />

            <v-simple-table dense v-if="item.acsData">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left"> Дата </th>
                    <th class="text-left"> Статус </th>
                    <th class="text-left"> Первый вход </th>
                    <th class="text-left"> Последний выход </th>
                    <th class="text-left"> Учет времени <br/> в здании </th>
                    <th class="text-left"> Детализация </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in item.acsData"
                    :key="item.date"
                  >
                    <td>{{ item.date }}</td>
                    <td>
                      <v-chip
                        :color="getChipsColor(item.acs_status)"
                        small
                      >
                      {{ item.acs_status }}
                      </v-chip>
                    </td>
                    
                    <td>{{ item.first_entry_date }}</td>
                    <td>{{ item.last_exit_date }}</td>
                    <td>{{ item.officeTimeDisplay }}</td>
                    <td>
                      <v-btn
                        icon
                        class="ma-2"
                        @click.stop="getLaborDisciplineDetail(item)"
                        small
                        color="primary"
                      >
                        <v-icon>mdi-eye</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>

    <v-dialog v-model="laborDisciplineDetailDialog" max-width="600px">
      <v-card>
        <v-card-title style="background-color: #1976d2;">
          История входа
        </v-card-title>
        <br/>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-simple-table dense>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">  </th>
                        <th class="text-left"> Время </th>
                        <th class="text-left"> Событие </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in laborDisciplineDetailData"
                        :key="item.id"
                      >
                        <td>{{ item.id }}</td>
                        <td>{{ item.date }}</td>
                        <td>{{ item.entry ? 'Вход' : 'Выход' }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>

export default {
    data: function() {
      return {
        laborDisciplineDetailDialog: false,
        laborDisciplineDetailData: []
      }
    },
    methods: {
      getChipsColor(data) {
        switch(data){
          case 'Отсутствует вход':
            return '#ee6666'
          case 'Опоздание':
            return '#fc8452'
          case 'Без опозданий':
            return '#91cc75'
          case 'Объяснительная согласована':
            return '#91cc75'
          case 'Не найден сотрудник':
            return '#d3d3d3'
          case 'Не получены данные':
            return '#d3d3d3'
          case 'Больничный':
            return '#9a60b4'
          case 'Отпуск':
            return '#5470c6'
          case 'Командировка':
            return '#73c0de'
          default:
            break;
        }
      },

      getLaborDisciplineDetail(item) {
        if (item.entryData.length == 0 || item.entryData.length == undefined) {
          this.laborDisciplineDetailData = []
          this.laborDisciplineDetailDialog = true
          return
        }

        for (var i = 0; i < item.entryData.length; i++){

          item.entryData[i].id = i+1

          if (item.entryData[i].date) { 
            item.entryData[i].date = item.entryData[i].date.split('T').length > 1 ? item.entryData[i].date.split('T')[1] : item.entryData[i].date
          }
        }

        this.laborDisciplineDetailData = item.entryData
        this.laborDisciplineDetailDialog = true
      },
    },
    props: ['inputData']
}
</script><style scoped>
  .chart {
    height: 55vh;
  }
  </style>