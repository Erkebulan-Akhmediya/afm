<template>
  <div>
    <v-tabs v-model="currentTab">
      <v-tab v-for="(item, index) in tabs" :key="index" >
        {{ item.title }}
      </v-tab>

      <v-tab-item>
        <br/>
        <v-data-table
          :headers="formHeader"
          :items="forms"
          :loading="loader"
          :items-per-page="10"
          class="clickableTable elevation-1 mb-4"
          :no-data-text="'Нет данных о формах'"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
        >
          <template v-slot:[`item.deadline`]="{ item }">
            <span v-if="moment(item.deadline).isAfter(moment().add(2, 'days'))">{{ moment(item.deadline).format('DD.MM.YYYY') }}</span>
            <span v-else style="color: red;">{{ moment(item.deadline).format('DD.MM.YYYY') }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              @click="openDialog(item)"
              text
              >
              Заполнить

              <!--
              <v-icon>
                mdi-pencil-plus
              </v-icon>
              -->
            </v-btn>
          </template>
        </v-data-table>
      </v-tab-item>

      <v-tab-item>
        <br/>
        <v-data-table
          :headers="reportHeader1"
          :items="reports"
          :loading="loader"
          :items-per-page="10"
          class="clickableTable elevation-1 mb-4"
          :no-data-text="'Нет данных об отчетах'"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          @click:row="goToReport"
        >
          <template v-slot:[`item.create_date`]="{ item }">
            <span v-if="moment(item.create_date).isBefore(moment(item.deadline).add(1, 'days'))">{{formatDate(item.create_date)}}</span>   
            <span v-else style="color:red;">{{formatDate(item.create_date)}}</span>   
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              class="ma-2"
              :color="getChipsColor(item.report_status_id == 1?-1:item.status_id)"
              text-color="white"
            >
              <span>{{ item.report_status_id == 1?item.report_status:item.status }}</span>   
            </v-chip>
          </template>
        </v-data-table>
      </v-tab-item>

      <v-tab-item>
        <br/>
        <ReportFormFilter>
        </ReportFormFilter>
        <v-data-table
          :headers="reportHeader2"
          :items="reports"
          :loading="loader"
          :items-per-page="10"
          class="clickableTable elevation-1 mb-4"
          :no-data-text="'Нет данных об отчетах'"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          @click:row="goToReport"
        >
          <!--Юра, добавил фикс по отображению 101022-->
          <!--Нурым Думанович, учел ваш фикс по отображению-->
          <template v-slot:[`item.send_date`]="{ item }">
            <span v-if="moment(item.send_date).isBefore(moment(item.deadline).add(1, 'days'))">{{moment(new Date(item.send_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
            <span v-else style="color:red;">{{formatDate(item.send_date)}}</span>   
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              class="ma-2"
              :color="getChipsColor(item.report_status_id == 1?-1:item.status_id)"
              text-color="white"
            >
              <span>{{ item.report_status_id == 1?item.report_status:item.status }}</span>   
            </v-chip>
          </template>
        </v-data-table>
      </v-tab-item>

    </v-tabs>
    <v-dialog
      v-model="dialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span style="color: black;" class="text-h5">Вы уверены что хотите сгененировать отчет?</span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :disabled="disableDoubleClick" @click="generateReport">
            Перейти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import moment from "moment"
import ReportFormFilter from '@/components/ReportFormFilter';
import checkRoles from '@/utils/check_role'
export default {
  components: {
    ReportFormFilter
  },
  data() {
    return {
      loader: false,
      moment,
      tabs: [
        {
          title: 'Доступные'
        },
        {
          title: 'Мои отчеты'
        },
      ],
      formHeader: [
        { text: '№', value: 'id'},
        { text: 'Название', value: 'report_name'},
        { text: 'Период', value: 'period'},
        { text: 'Дедлайн', value: 'deadline'},
        { text: '', value: 'actions' }
      ],
      reportHeader1: [
        { text: '№', value: 'id'},
        { text: 'Название', value: 'report_name'},
        { text: 'Дата создания', value: 'create_date' },
        { text: 'Статус', value: 'status' },
        { text: 'ФИО', value: 'full_name' },
        { text: 'Период', value: 'period' },
      ],
      reportHeader2: [
        { text: '№', value: 'id'},
        { text: 'Название', value: 'report_name'},
        { text: 'Организация', value: 'organization'},
        { text: 'Дата отправки', value: 'send_date' },
        { text: 'Статус', value: 'status' },
        { text: 'ФИО', value: 'full_name' },
        { text: 'Период', value: 'period' },
      ],
      forms: [],
      reports: [],
      dialog: false,
      periods: [],
      disableDoubleClick: false,
      period_id: null,
    }
  },
  computed: {
    currentTab: {
      set(value) {
        this.$store.commit('change_rp_tab', value)
      },
      get() {
        return this.$store.getters.rp_current_tab
      }
    },
    der_filter: {
      set(value) {
        this.$store.commit('der_filter', value)
      },
      get() {
        return this.$store.getters.der_filter
      }
    },
    report_form_filter: {
      set(value) {
        this.$store.commit('report_form_filter', value)
      },
      get() {
        return this.$store.getters.report_form_filter
      }
    },
  },
  created () {
    if(checkRoles('43', this.$userData))
    {
      this.tabs.push({
        title: 'Все отчеты'
      })
    }
  },
  async mounted() {
    if (this.$route.query.tab) {
      this.currentTab = parseInt(this.$route.query.tab)
    }

    await this.loadData()

  },
  watch: {
    currentTab() {
      this.loadData()
    },
    der_filter() {
      this.loadData()
    },
    report_form_filter() {
      this.loadData()
    },
  },
  methods: {
    async loadData() {

      this.loader = true
      try{

        if (this.currentTab == 0)
        {
          let {data: forms} = await this.axios.get('/api/1.0/report-form/report', {params:{status: 2}})
          this.forms = forms
        } else if (this.currentTab == 1)
        {
          let {data: reports} = await this.axios.get(`/api/1.0/report-fill`)
          this.reports = reports
        } else if (this.currentTab == 2)
        {
          let params = {
            all: true,
            der_filter: this.der_filter,
            report_form_filter: this.report_form_filter,
          }
          let {data: reports} = await this.axios.get(`/api/1.0/report-fill`, {params})
          this.reports = reports
        }
      } catch (err) {
        console.error(err)
      } finally{
        this.loader = false
      }

    },
    getChipsColor(data) {
      switch(data){
        case 1:
          return 'primary'
        case 2:
          return 'green'
        case 3:
          return 'red'
        case 5:
          return 'orange'
        default:
          break;
      }
    },
    formatDate (date) {
      return moment(new Date(date + '+0000')).format('DD.MM.YYYY HH:mm:ss')
    },
    async openDialog (item) {
      let {data} = await this.axios.get(`/api/1.0/report/period`)
      this.periods = data
      this.selectedItem = item

      this.dialog = true
    },
    goToReport (item) {
      this.$router.push(`/report_instance/${item.id}`)
    },
    async generateReport () {
      this.disableDoubleClick = true
      try{
        const {data} = await this.axios.post(`/api/1.0/report-generate/${this.selectedItem.id}`, {period_id: this.selectedItem.period_id})
        this.$router.push(`/report_instance/${data}`)
      } catch (err) {
        console.error(err)
      } finally{
        this.dialog = false
        this.disableDoubleClick = false
      }
    }
  }
}
</script>