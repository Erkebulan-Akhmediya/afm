<template>
  <div>
    <br/>
    <v-row>
      <v-col cols="3">
        <v-select
          :items="availableOrganizationList"
          label="Организация"
          required
          dense
          v-model="inputOrganizationId"
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-select
          label="Фильтр по структурным подразделениям"
          :items="filteredDepartmentList"
          v-model="inputSelectedDepartments"
          multiple
          persistent-hint
          clearable
          dense
          >
        </v-select>
      </v-col>
      
      <v-col cols="3" class="d-flex ma-0 pa-0">
        <v-col cols="6">
          <v-menu
            v-model="startDateMenuInput"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="inputStartDate"
                label="Дата с"
                prepend-icon="mdi-calendar"
                readonly
                dense
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="inputStartDate"
              :max="moment().format('YYYY-MM-DD')"
              @input="startDateMenuInput = false"
              first-day-of-week="1"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="6">
          <v-menu
            v-model="endDateMenuInput"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="inputEndDate"
                label="Дата по"
                prepend-icon="mdi-calendar"
                readonly
                dense
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="inputEndDate"
              :max="moment().format('YYYY-MM-DD')"
              @input="endDateMenuInput = false"
              first-day-of-week="1"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-col>
      
      <v-col cols="2">
        <v-btn color="primary" outlined @click="getLaborDiscipline();" :loading="buttonLoader" >
          <v-icon class="mr-2"> mdi-refresh </v-icon>
          Запросить данные
        </v-btn>
        <v-btn color="primary" class="mt-2" outlined @click="downloadXLS();" :loading="buttonDownloadLoader">
          <v-icon class="mr-2"> mdi-download </v-icon>
          Загрузить данные
        </v-btn>
      </v-col>
    </v-row>
    <br/>
    <v-row>
      <v-col cols="6">
        <v-chart class="chart" @click="showPieDetails" autoresize :option="pieOption"/>
      </v-col>
      <v-col cols="6">
        <v-chart class="chart" @click="showBarDetails" autoresize :option="barOption"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex">
        <v-btn color="primary" outlined @click="resetTableFilter();" style="align-self: center;">
          <v-icon class="mr-2"> mdi-refresh </v-icon>
          Сбросить фильтры
        </v-btn>

        <v-text-field
          v-model="search"
          label="Поиск по сотрудникам"
          @keydown.enter="find()"
          class="mx-4"
          hint="После ввода текста, нажмите Enter. Внимание, поиск по сотруднику очищает фильтр по диаграммам"
          persistent-hint
        ></v-text-field>
      </v-col>
    </v-row>
    <reportLaborDisciplineExpander
      :inputData="laborDisciplineFilteredData"
    />
  </div>
</template>
<script>
import moment from 'moment'
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { TitleComponent } from "echarts/components";

echarts.use([
  TitleComponent,
  PieChart
]);

export default {
    data: function() {
      return {
        buttonDownloadLoader: false,
        moment,
        availableOrganizationList: [],
        filteredDepartmentList: [],
        availableDepartmentList: [],

        inputOrganizationId: '',
        inputSelectedDepartments: null,

        pieOption: {
          title: {
            text: "Показатели по группам",
            subtext: 'При наведении отображается количественный показатель',
            left: "center"
          },
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ({d}%)"
          },
          legend: {
            padding: 55,
            orient: "horizontal",
            left: "center",
            data: []
          },
          series: [
            {
              name: 'По группам',
              type: "pie",
              radius: "65%",
              center: ["50%", "55%"],
              data: [],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)"
                }
              }
            }
          ]
        },

        barOption: {
          title: {
            text: "Среднее время в здании",
            left: "center",
            subtext: 'Сотрудники со статусом в отпуске, в командировке или в больничном не берутся в учет'
          },
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ч."
          },
          xAxis: {
            type: 'category',
            data: []
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: [],
              type: 'bar'
            }
          ]
        },

        search: '',
        buttonLoader: false,

        laborDisciplineOrigData: [],
        laborDisciplineFilteredData: [],
        inputStartDate: moment().format('YYYY-MM-DD'),
        inputEndDate: moment().format('YYYY-MM-DD'),

        startDateMenuInput: false,
        endDateMenuInput: false
      }
    },
    methods: {
      async downloadXLS() {

        if (!this.checkInserts()) {
          return
        }
        this.buttonDownloadLoader = true

        let deparmentListFilter = []
        if (this.inputSelectedDepartments && this.inputSelectedDepartments.length > 0) {
          deparmentListFilter = this.inputSelectedDepartments
        }

        let response
        try{

          response = await this.axios.get(`/api/1.0/employee/1/latecomes/xls`, {responseType: 'blob', params:{
            type_code: 'discipline_report',
            startDate: this.inputStartDate, 
            endDate: this.inputEndDate, 
            organizationId: this.inputOrganizationId,
            timeZ: -new Date().getTimezoneOffset(),
            deparment_list_filter: deparmentListFilter
          }})

          let blob = new Blob([response.data], { type: 'application/xls' })
          let disposition = response.headers['content-disposition']
          //eslint-disable-next-line
          const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i
          let filename = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1])
          this.saveData(blob, filename)

        } catch(err) {

          if (JSON.stringify(err).includes('ECONNABORTED')) {
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 600,
              timer: 5000,
              title: `Превышено время ожидания вызова сервиса СКУД`,
            });
          } else {
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 600,
              timer: 5000,
              title: err.data?.ERR_MSG ? err.data.ERR_MSG : err,
            });
          }
        } finally {
          this.buttonDownloadLoader = false
        }
      },
      saveData (data, fileName) {
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          let url = window.URL.createObjectURL(data);
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
      },

      async deleteEmptyDepartments(data) {
        let obj = data
        for (let i = 0; i < obj.length; i += 1) {
          if (obj[i].children) {
            let child = await this.deleteEmptyDepartments(obj[i].children)

                    let notEmptyChild = child.filter((item) => item != null)
            obj[i].children = notEmptyChild

            let checkEmployeeChild = obj[i].children.filter(item => item.type == 'employee')
            if (checkEmployeeChild.length === 0 && notEmptyChild.length === 0) {
              obj[i] = null
            }
          }
        }
        return obj
      },

      async findGenerateData(data, regex) {
        for (let i = 0; i < data.length; i++){

          if (data[i].children) {
            for (let z = 0; z < data[i].children.length; z++){

              if (data[i].children[z].type == 'employee') {

                if (!(regex.test(data[i].children[z].last_name.trim().toUpperCase()) || regex.test(data[i].children[z].first_name.trim().toUpperCase()) || regex.test(data[i].children[z].middle_name.trim().toUpperCase()))) {
                  data[i].children[z] = null
                }
              }

            }

            data[i].children = data[i].children.filter((item) => item != null)

            data[i].children = await this.findGenerateData(data[i].children, regex)
          }

        }
        return data
      },

      async filterShowChartDetails(data, filterType, filterValue) {
        for (let i = 0; i < data.length; i++){
          if (data[i].children) {

            for (let z = 0; z < data[i].children.length; z++){
              if (data[i].children[z].type == 'employee') {

                if (filterType == "showPieDetails") {
                  data[i].children[z].acsData = data[i].children[z].acsData.filter(i =>  i.acs_status == filterValue )
                } else if (filterType == "showBarDetails") {
                  data[i].children[z].acsData = data[i].children[z].acsData.filter(i =>  i.date == filterValue )
                } else {
                  alert('error')
                }

                if (data[i].children[z].acsData.length == 0) {
                  data[i].children[z] = null
                }
              }
            }
            data[i].children = data[i].children.filter((item) => item != null)

            data[i].children = await this.filterShowChartDetails(data[i].children, filterType, filterValue)
          }
        }
        return data
      },

      async find() {
        if (this.search.trim() == '') {
          this.laborDisciplineFilteredData = this.laborDisciplineOrigData
        } else {
          const regex = new RegExp(this.search.trim().toUpperCase());

          let tempList = await this.findGenerateData(JSON.parse(JSON.stringify(this.laborDisciplineOrigData)), regex)
          tempList = await this.deleteEmptyDepartments(tempList)
          tempList = tempList.filter(item => item != null)

          this.laborDisciplineFilteredData = tempList
        }
      },

      async showPieDetails (props) {
        this.search = ''
        let tempList = await this.filterShowChartDetails(JSON.parse(JSON.stringify(this.laborDisciplineOrigData)), 'showPieDetails', props.name)
        tempList = await this.deleteEmptyDepartments(tempList)
        tempList = tempList.filter(item => item != null)

        this.laborDisciplineFilteredData = tempList
      },

      async showBarDetails (props) {
        this.search = ''
        let tempList = await this.filterShowChartDetails(JSON.parse(JSON.stringify(this.laborDisciplineOrigData)), 'showBarDetails', props.name)
        tempList = await this.deleteEmptyDepartments(tempList)
        tempList = tempList.filter(item => item != null)

        this.laborDisciplineFilteredData = tempList
      },

      async resetTableFilter() {
        this.search = ''

        this.laborDisciplineFilteredData = this.laborDisciplineOrigData
      },

      async generateEmployeeListData(data) {
        let obj = []
        for (let i = 0; i < data.length; i++){

          if (data[i].children) {
            if (data[i].children.length > 0) {

              for (let z = 0; z < data[i].children.length; z++){

                if (data[i].children[z].type == 'employee') {
                  obj.push(data[i].children[z])
                }
              }

              let temp = await this.generateEmployeeListData(data[i].children)
              obj = obj.concat(temp);
            }
          }
        }
        return obj
      },

      checkInserts() {
        if(!this.inputOrganizationId) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: 'Заполните организацию',
          });
          return false
        }

        if (!this.inputStartDate) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: 'Заполните дату с',
          });
          return false
        }

        if (!this.inputEndDate) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: 'Заполните дату по',
          });
          return false
        }

        if (moment(this.inputStartDate).isAfter(moment(this.inputEndDate))) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: '"Дата по" не может быть указана раньше "Даты с"',
          });
          return false
        }

        if (moment(this.inputEndDate).diff(moment(this.inputStartDate), 'days') > 62) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: 'Промежуток времени для запроса не более 62 дней',
          });
          return false
        }
        return true
      },

            async getLaborDiscipline() {

        if (!this.checkInserts()) {
          return
        }

        let deparmentListFilter = []
        if (this.inputSelectedDepartments && this.inputSelectedDepartments.length > 0) {
          deparmentListFilter = this.inputSelectedDepartments
        }

        this.laborDisciplineOrigData = []
        this.laborDisciplineFilteredData = []
        this.pieOption.series[0].data = []
        this.pieOption.legend.data = []
        this.barOption.series[0].data = []
        this.barOption.xAxis.data = []
        this.search = ''

        this.buttonLoader = true
        let data = await this.axios
          .get(`/api/1.0/employee/1/latecomes`, {
            params: { 
              type_code: 'discipline_report',
              startDate: this.inputStartDate, 
              endDate: this.inputEndDate, 
              organizationId: this.inputOrganizationId,
              timeZ: -new Date().getTimezoneOffset(),
              deparment_list_filter: deparmentListFilter
            }
          })
          .catch((err) => {
            this.buttonLoader = false

            if (JSON.stringify(err).includes('ECONNABORTED')) {
              return this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                width: 600,
                timer: 5000,
                title: `Превышено время ожидания вызова сервиса СКУД`,
              });
            } else {
              return this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                width: 600,
                timer: 5000,
                title: err.data?.ERR_MSG ? err.data.ERR_MSG : err,
              });
            }
          });
        this.buttonLoader = false

        this.laborDisciplineOrigData = data.data
        this.laborDisciplineFilteredData = data.data

        let forGeneratePieData = await this.generateEmployeeListData(data.data)
        let pieFindIndex, pieSeriesData = []
        for (let i = 0; i < forGeneratePieData.length; i++){
          for (let z = 0; z < forGeneratePieData[i].acsData.length; z++){

                        pieFindIndex = pieSeriesData.map(object => object.name).indexOf(forGeneratePieData[i].acsData[z].acs_status)

            if (pieFindIndex >= 0) {
              pieSeriesData[pieFindIndex].value = pieSeriesData[pieFindIndex].value + 1
            } else {
              pieSeriesData.push({value: 1, name: forGeneratePieData[i].acsData[z].acs_status})
            }
          }
        }

        for (let i = 0; i < pieSeriesData.length; i++){
          if (pieSeriesData[i].name == 'Отсутствует вход') { 
            pieSeriesData[i].itemStyle = {color: '#ee6666'}
          }
          if (pieSeriesData[i].name == 'Опоздание') { 
            pieSeriesData[i].itemStyle = {color: '#fc8452'}
          }
          if (pieSeriesData[i].name == 'Без опозданий') { 
            pieSeriesData[i].itemStyle = {color: '#91cc75'}
          }
          if (pieSeriesData[i].name == 'Объяснительная согласована') { 
            pieSeriesData[i].itemStyle = {color: '#91cc75'}
          }
          if (pieSeriesData[i].name == 'Не найден сотрудник' || pieSeriesData[i].name == 'Не получены данные') { 
            pieSeriesData[i].itemStyle = {color: '#d3d3d3'}
          }

                    if (pieSeriesData[i].name == 'Больничный') { 
            pieSeriesData[i].itemStyle = {color: '#9a60b4'}
          }
          if (pieSeriesData[i].name == 'Отпуск') { 
            pieSeriesData[i].itemStyle = {color: '#5470c6'}
          }
          if (pieSeriesData[i].name == 'Командировка') { 
            pieSeriesData[i].itemStyle = {color: '#73c0de'}
          }
        }

        this.pieOption.series[0].data = pieSeriesData
        this.pieOption.legend.data = pieSeriesData.map(function(item) {
          return item.name
        });


                let barFindIndex, barSeriesData = []
        for (let i = 0; i < forGeneratePieData.length; i++){
          for (let z = 0; z < forGeneratePieData[i].acsData.length; z++){

            if (forGeneratePieData[i].acsData[z].acs_status == 'Отсутствует вход' || forGeneratePieData[i].acsData[z].acs_status == 'Опоздание' || forGeneratePieData[i].acsData[z].acs_status == 'Без опозданий' || forGeneratePieData[i].acsData[z].acs_status == 'Объяснительная согласована') {
              barFindIndex = barSeriesData.map(object => object.name).indexOf(forGeneratePieData[i].acsData[z].date)

              if (barFindIndex >= 0) {
                barSeriesData[barFindIndex].value = barSeriesData[barFindIndex].value + Number(forGeneratePieData[i].acsData[z].officeTime)
                barSeriesData[barFindIndex].count = barSeriesData[barFindIndex].count + 1
              } else {
                barSeriesData.push({count: 1, value: Number(forGeneratePieData[i].acsData[z].officeTime), name: forGeneratePieData[i].acsData[z].date})
              }
            }
          }
        }

        for (let i = 0; i < barSeriesData.length; i++){
          barSeriesData[i].value = (barSeriesData[i].value / barSeriesData[i].count).toFixed(2)
        }

        this.barOption.series[0].data = barSeriesData
        this.barOption.xAxis.data = barSeriesData.map(function(item) {
          return item.name
        });
      },
    },
    async created() {
      this.inputOrganizationId = ''
      this.availableDepartmentList = []
      this.availableOrganizationList = []

      await this.axios.get(`/api/1.0/employee/1/access_department_list`)
        .then(({data}) => {
            this.availableDepartmentList = data
        })

      for (let i = 0; i < this.availableDepartmentList.length; i++){
        let findIndex = this.availableOrganizationList.findIndex(x => x.value == this.availableDepartmentList[i].organization_id)

        if (findIndex == -1) {
          this.availableOrganizationList.push({
            value: this.availableDepartmentList[i].organization_id,
            text: this.availableDepartmentList[i].organization_name
          })
        }
      }

      this.inputOrganizationId = this.availableOrganizationList[0].value
    },
    props: ['employee'],
    watch: {
      inputOrganizationId() {
        this.filteredDepartmentList = []
        this.inputSelectedDepartments = null

        let tempFilteredDepartmentList = JSON.parse(JSON.stringify(this.availableDepartmentList))
        tempFilteredDepartmentList = tempFilteredDepartmentList.filter(item => item.organization_id == this.inputOrganizationId)

                for (let i = 0; i < tempFilteredDepartmentList.length; i++){
          let findIndex = this.filteredDepartmentList.findIndex(x => x.value == tempFilteredDepartmentList[i].department_id)

          if (findIndex == -1) {
            this.filteredDepartmentList.push({
              value: tempFilteredDepartmentList[i].department_id,
              text: tempFilteredDepartmentList[i].department_name
            })
          }
        }
      },
    },
}
</script><style scoped>
  .chart {
    height: 55vh;
  }
  </style>