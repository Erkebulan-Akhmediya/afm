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
              <v-col v-if="item.date_from" cols="12" class="ma-0 pa-0">{{ item.date_from }}</v-col>
              <v-col v-if="item.organization" cols="12" class="ma-0 pa-0">{{ item.organization }}</v-col>
            </v-row>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <PRVReportExpander :inputData="item.organizations">
            </PRVReportExpander>

            <v-simple-table dense v-if="item.visitors">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left"> ФИО </th>
                    <th class="text-left"> Реквизиты </th>
                    <th class="text-left"> Время входа и выхода </th>
                    <th class="text-left"> Время нахождения в здании </th>
                    <th class="text-left"> Заявитель </th>
                    <th class="text-left"> Сопровождающий </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, k) in item.visitors"
                    :key="k"
                  >
                    <td>
                      {{ item.name }}
                    </td>
                    <td>
                      {{ item.document_type }} {{ item.identification_number }}
                    </td>
                    
                    <td>
                      {{moment(new Date(item.date_from + '+0000')).format('DD.MM.YYYY HH:mm')}}
                      {{item.date_to ? '-' : ''}}
                      {{item.date_to ? moment(new Date(item.date_to + '+0000')).format('DD.MM.YYYY HH:mm') : ''}}
                    </td>
                    <td>
                      {{ Math.floor(moment.duration(moment.utc(moment(item.date_to?item.date_to:moment().add(moment.duration(-6, 'hours'))).diff(moment(item.date_from)))).hours()) }}:{{ moment.utc(moment(item.date_to?item.date_to:moment().add(moment.duration(-6, 'hours'))).diff(moment(item.date_from))).format('mm:ss') }}
                    </td>
                    <td>
                      {{ item.employee }}
                    </td>
                    <td>
                      {{ item.applicant }}
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>

  </v-row>
</template>
<script>
import moment from 'moment'

export default {
    data: function() {
      return {
        moment,
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