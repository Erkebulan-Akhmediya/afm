<template>
  <div>
    <div style="margin-top:-15px">
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
          :items-per-page="19"
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
              height="25"
              @click="showDetails = true; detailData = item"
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
            <!--<p v-if="personalCard.id > 20" class="text-center" style="color: red">Топ-20 не хватает <b>{{ empstatistics[19].score - personalCard.score }} баллов</b></p>
            <p v-else class="text-center">Вы в рейтинге <b>Топ-20</b></p>-->
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
                <a @click="showDetails = true; detailData = personalCard">Детализация</a>
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
          <v-row>
            <v-col cols="10">{{ detailData.p10_04_code }}: </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p10_04 || 0).toFixed(2) }}</strong></v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p21_02_code }}: </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p21_02 || 0).toFixed(2) }}</strong></v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p22_02_code }}: </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p22_02 || 0).toFixed(2) }}</strong></v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p22_04_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p22_04 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p23_02_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p23_02 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p23_04_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p23_04 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p23_06_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p23_06 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p23_08_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p23_08 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p23_10_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p23_10 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p23_12_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p23_12 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p24_02_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p24_02 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p24_04_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p24_04 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p25_02_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p25_02 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">{{ detailData.p25_04_code }}:  </v-col>
            <v-col cols="2" class="text-right"><strong>{{ Number(detailData.p25_04 || 0).toFixed(2) }}</strong> </v-col>
          </v-row>
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
      globalEmpstatistics: [],
      empstatistics: [],
      personalCard: {},
      topemps: [],
      headers: [
        { text: '#', value: 'rateNum' },
        { text: '', value: 'src' },
        { text: 'ФИО', value: 'emp_name' },
        { text: 'Должность', value: 'position' },
        { text: 'Подразделение', value: 'department' },
        { text: 'Регион', value: 'state_name' },
        { text: 'Баллы', value: 'score', width: '20%' },
      ],
      showDetails: false,
      detailData: {},
    }
  },
  async mounted() {
    let { data: empstatistics } = await this.axios.get(`/api/1.0/remote-erdr`)
    this.globalEmpstatistics = empstatistics

    let deparmentList = []
    for (let item of empstatistics) {
      if (deparmentList.findIndex(x => x.value == item.state_name) == -1) {
        deparmentList.push({
          text: item.state_name,
          value: item.state_name
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
    find() {
      this.refreshIndReportData()
    },
    async refreshIndReportData() {
      if (this.selectedDepartments && this.selectedDepartments.length > 0) {
        this.empstatistics = this.globalEmpstatistics.filter(item => this.selectedDepartments.includes(item.state_name))
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

      this.empstatistics.map(async (item)=>{
        this.$set(item, 'src', require('@/assets/img/default_employee.png'))
        let src = await this.$getVuexStoreFile(item.employee_id, 1)
        this.$set(item, 'src', src ? src : require('@/assets/img/default_employee.png'))
      })

            let pc = this.empstatistics.filter(item => item.employee_id == this.$userData.fullData.id)
      if(pc.length != 0) {
        this.personalCard = pc[0]
      } else {
        this.personalCard = {}
      }
    },
  }
}
</script>