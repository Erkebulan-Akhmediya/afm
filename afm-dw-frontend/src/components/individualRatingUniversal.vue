<template>
  <div>
    <div style="margin-top:-15px" v-if="placeholder == 5 || placeholder == 6 || placeholder == 7">
      <v-select
        label="Фильтр"
        :items="departments"
        @change="find"
        v-model="selectedDepartments"
        multiple
        chips
        deletable-chips
        persistent-hint
        clearable
        >
    </v-select><br/>
    </div>
    
    <v-row>
      <v-col>
        <v-data-table
          disable-sort
          :headers="headers"
          :items="empstatistics"
          :items-per-page="20"
        >
          <template v-slot:[`item.rateNum`]="{ item }">
            {{ item.rateNum }}
          </template>
          <template v-slot:[`item.src`]="{ item }">
            <v-avatar>
              <img class="pt-1 pb-1 pl-1 pr-1"  :src="item.src">
            </v-avatar>
          </template>
          <template v-slot:[`item.score`]="{ item }">
            <v-progress-linear
              :value="getPercents(item.score - empstatistics[empstatistics.length-1].score, empstatistics[0].score-empstatistics[empstatistics.length-1].score)"
              readonly
              rounded
              stream
              height="25"
              @click="getReportDetail(item.id)"
              :color="item.color_class"
            >
              <strong>{{ Number(item.score).toFixed(2) }}</strong>
            </v-progress-linear>
          </template>
        </v-data-table>
      </v-col>

      <v-col v-if="Object.keys(this.personalCard).length != 0" cols="2" class="mt-8">
        <v-card class="pl-4 pr-4">
          <v-row class="d-flex justify-center">
            <v-col cols="12">
              <v-row>
                <v-col class="d-flex justify-space-between">
                  <span class="mt-1">Ваша позиция </span>
                  <v-chip
                    dark
                    :color="personalCard.color_class"
                  >
                    {{ personalCard.rateNum }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-col>
            <h6 style="font-align: left; font-size:1.1rem;">{{ personalCard.emp_name }}</h6>
            <v-col md="12" cols="12">
              <span style="font-size:.8rem;">Текущий балл</span>
              <v-progress-linear
                :value="getPercents(personalCard.score - empstatistics[empstatistics.length-1].score, empstatistics[0].score-empstatistics[empstatistics.length-1].score)"
                :color="personalCard.color_class"
                readonly
                rounded
                height="25"
              >
                <strong>{{ Number(personalCard.score).toFixed(2) }}</strong>
              </v-progress-linear>
            </v-col>
            <v-col class="text-center" cols="12">
              <span>
                <a @click="getReportDetail(personalCard.id)">Детализация</a>
              </span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog 
      v-model="showDetails"
      width="650px"
      >
      <v-card>
        <v-spacer> </v-spacer>
        <v-card-title style="color: #000 !important;">
          Детализация
        </v-card-title>
        <v-spacer> </v-spacer>
        <v-card-text>
          <hr /><br />
          <div v-if="reportDetails.length > 0">
            <v-row v-for="(reportDetail, index) in reportDetails" :key="index">
              <v-col cols="10">{{ reportDetail.indicator_name }}: </v-col>
              <v-col cols="2" class="text-right"><strong>{{ Number(reportDetail.score || 0).toFixed(2) }}</strong></v-col>
            </v-row>
          </div>
          <div v-else> Без детализации </div>
          <br /><hr />
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>
<script>
export default {
  data() {
    return {
      selectedDepartments: null,
      departments: [],
      tabName: '',
      reportTypeCode: '',
      showDetails: false,
      globalEmpstatistics: [],
      empstatistics: [],
      reportDetails: [],
      personalCard: {},
      topemps: [],
      headers: [
        { text: '#', value: 'rateNum' },
        { text: '', value: 'src' },
        { text: 'ФИО', value: 'emp_full_name' },
        { text: 'Регион', value: 'department_name' },
        { text: 'Баллы', value: 'score', width: '30%' },
      ],
    }
  },
  async mounted() {
    if (this.placeholder == 0) {
      this.tabName = 'Руководители'
      this.reportTypeCode = 'rukDER'
    } else if (this.placeholder == 1) {
      this.tabName = 'Заместители по ОР'
      this.reportTypeCode = 'zamDepOper'
    } else if (this.placeholder == 2) {
      this.tabName = 'Заместители по СР'
      this.reportTypeCode = 'zamDepSledstv'
    } else if (this.placeholder == 3) {
      this.tabName = 'Руководители ОУ'
      this.reportTypeCode = 'rukDepOperUpr'
    } else if (this.placeholder == 4) {
      this.tabName = 'Руководители СУ'
      this.reportTypeCode = 'rukDepSledstvUpr'
    } else if (this.placeholder == 5) {
      this.tabName = 'Оперативные сотрудники'
      this.reportTypeCode = 'operEmployee'
    } else if (this.placeholder == 6) {
      this.tabName = 'Следователи'
      this.reportTypeCode = 'sledstvEmployee'
    } else if (this.placeholder == 7) {
      this.tabName = 'Криминалисты'
      this.reportTypeCode = 'crimeEmployee'
    } else {
      return alert('Ошибка типизации рейтинга!')
    }

    let { data: empstatistics } = await this.axios.get(`/api/1.0/ind_report`, {params: {report_type_code: this.reportTypeCode}})
    this.globalEmpstatistics = empstatistics

    let deparmentList = []
    for (let item of empstatistics) {
      if (deparmentList.findIndex(x => x.value == item.department_name) == -1) {
        deparmentList.push({
          text: item.department_name,
          value: item.department_name
        })
      }
    }
    this.departments = deparmentList

    this.refreshIndReportData()
  },
  methods: {
    getPercents(value, buffer){
      return value/buffer * 100
    },
    async getReportDetail(parent_id) {
      this.showDetails = true;
      let { data: result } = await this.axios.get(`/api/1.0/ind_report/detail`, {params: {parent_id: parent_id}})
      this.reportDetails = result
    },
    find() {
      this.refreshIndReportData()
    },
    changeToSelect(data) {
      return data.map(item => {
        return {
          text: item.name,
          value: item.id
        }
      })
    },
    async refreshIndReportData() {
      if (this.selectedDepartments && this.selectedDepartments.length > 0) {
        this.empstatistics = this.globalEmpstatistics.filter(item => this.selectedDepartments.includes(item.department_name))
      } else {
        this.empstatistics = this.globalEmpstatistics
      }

      this.empstatistics.sort((a, b) => {
        return b.score - a.score;
      });

      for (let i = 0; i < this.empstatistics.length; i++) {
        this.empstatistics[i].rateNum = i+1
      }

            let lastGreenNum, lastAmberNum
      if (this.empstatistics.length > 0){
        lastGreenNum = Math.floor(20*this.empstatistics.length/100) 
        lastAmberNum = Math.floor(80*this.empstatistics.length/100) 
      }

      if (lastGreenNum == 0) lastGreenNum = 1
      if (lastAmberNum == 1) lastAmberNum = 2

      for (let i = 0; i < this.empstatistics.length; i++) {
        this.empstatistics[i].color_class = 'blue'

        if (this.reportTypeCode == 'zamDepOper' || this.reportTypeCode == 'zamDepSledstv' || this.reportTypeCode == 'rukDepOperUpr' || this.reportTypeCode == 'rukDepSledstvUpr' || this.reportTypeCode == 'crimeEmployee' || this.reportTypeCode == 'sledstvEmployee') {
          if (this.empstatistics[i].rateNum <= lastGreenNum) {
            this.empstatistics[i].color_class = 'green'
          } 
          else if (this.empstatistics[i].rateNum >= lastGreenNum+1 && this.empstatistics[i].rateNum <= lastAmberNum) {
            this.empstatistics[i].color_class = 'amber'
          } 
          else {
            this.empstatistics[i].color_class = 'red'
          } 
        }

        if (this.reportTypeCode == 'operEmployee') {
          this.empstatistics[i].color_class = 'green'
        }
      }

      this.empstatistics.map(async (item)=>{
        if (item.employee_id != null) {
          let src = await this.$getVuexStoreFile(item.employee_id, 1);
          this.$set(item, 'src', src ? src : require('@/assets/img/default_employee.png'))
        } else {
          this.$set(item, 'src', require('@/assets/img/default_employee.png'))
        }
      })

            let pc = this.empstatistics.filter(item => item.employee_id == this.$userData.fullData.id)
      if(pc.length != 0) {
        this.personalCard = pc[0]
      } else {
        this.personalCard = {}
      }
    },
  },
  props: ['placeholder']
  ,
}
</script>