<template>
  <v-card
    class="mx-auto"
  >
    <v-card-title class="text-h6 font-weight-regular justify-space-between">
      <v-btn
      class="mb-1"
      color="#5787A4"
      icon
      @click="$router.go(-1)"
      >
          <v-icon>mdi-arrow-left-thin-circle-outline</v-icon>
      </v-btn>
      <span style="color: black;">{{ report.report_name }} за {{ report.period }}</span>
      <v-avatar
        color="primary lighten-2"
        class="subheading white--text"
        size="24"
        v-text="step"
      ></v-avatar>
    </v-card-title>

    <v-card-text>

      <v-window v-model="step">
        <v-window-item
          v-for="chapter, key in report.chapters"
          :key="key"
          :value="key+1"
        >
          <v-row
            v-if="chapter.data_type_id == 1"
          >
            <v-col
              cols="12"
            >
              {{ chapter.name }}
            </v-col>
            <v-col
              cols="12"
              v-for="detail, k in chapter.details[0]"
              :key="k"
            >
              <v-menu
                v-model="detail.menu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
                v-if="detail.data_type_id == 3"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="detail.value"
                    :label="detail.label || detail.name" 
                    prepend-icon="mdi-calendar"
                    :disabled="!checkEditingStatus"
                    :hide-details="true"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker id="dateFrom" 
                                    ref="dateFrom"
                                    @input="detail.menu = false"
                                    :datePickerProps="{'first-day-of-week': 1}" 
                                    clearText="Очистить" 
                                    okText="Ок" 
                                    dateFormat="dd.MM.yyyy" 
                                    required
                                    v-model="detail.value"
                                    :disabled="!checkEditingStatus"
                                    >
                <template slot="dateIcon">
                  <span class="mr-4">Дата</span>
                  <v-icon>mdi-calendar</v-icon>
                </template>
              </v-date-picker>
            </v-menu>
            <v-text-field
              v-else-if= "detail.data_type_id == 2 || detail.data_type_id == 1"
              :label="detail.label || detail.name"
              :type="detail.data_type_id == 1? 'text': 'number'"
              required
              :hide-details="true"
              v-model="detail.value"
              :disabled="!checkEditingStatus"
            ></v-text-field>
            <v-select
              v-else-if="detail.data_type_id == 4"
              :label="detail.label || detail.name"
              v-model="detail.value"
              :items="detail.list_details"
              :hide-details="true"
              :disabled="!checkEditingStatus"
            >
            </v-select>
            <v-textarea
              v-else
              :label="detail.label || detail.name"
              :hide-details="true"
              auto-grow
              rows="1"
              required
              v-model="detail.value"
              :disabled="!checkEditingStatus"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="6">
            {{ chapter.name }}
          </v-col>
          <v-col cols="6" class="d-flex justify-end">
            <v-btn
              v-if="checkEditingStatus"
              @click="addRow"
              color="primary"
            >
              <v-icon>
                mdi-plus
              </v-icon>
            </v-btn>
          </v-col>
          <v-col v-if="items">
            <v-data-table
              :headers="headers"
              :items="items"
              :items-per-page="10"
              class="clickableTable elevation-1"
              :no-data-text="'Нет данных'"
              :footer-props="{
                itemsPerPageText: $t('globalWords.itemsPerPage'),
              }"
            >
                <template v-for="prop in itemProps"
                  v-slot:[`item.${prop}`]="{ item }"
                >
                  <div class="d-flexicon flex-column" :key="prop">
                    <span>{{ item[prop] }}</span>
                  </div>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-btn
                    v-if="checkEditingStatus"
                    @click="openEditing(item)"
                    icon
                    color="primary"
                    >
                    <v-icon>
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                  <v-btn
                    v-if="checkEditingStatus"
                    @click="deleteRow(item)"
                    icon
                    color="red"
                    >
                    <v-icon>
                      mdi-trash-can-outline
                    </v-icon>
                  </v-btn>
                </template>
                <template v-slot:[`item.sequence`]="{ item }">
                  {{ item.sequence }}
                </template>
              </v-data-table>
            </v-col>
          </v-row>


        </v-window-item>
      </v-window>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn
        :disabled="step === 1"
        @click="prevChapter"
        color="primary"
      >
        Предыдущий раздел
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="report.chapters && step === report.chapters.length"
        color="primary"
        @click="nextChapter"
      >
        Следующий раздел
      </v-btn>
      <v-btn
        :disabled="(report.chapters && step < report.chapters.length) || !checkEditingStatus || disableDoubleClick"
        color="success"
        @click="save()"
      >
        Отправить
      </v-btn>
    </v-card-actions>

    <v-dialog
      v-model="dialog"
      persistent
      max-width="900px"
    >
      <v-card>
        <v-card-title style="color: black;">
          {{ isEditing?'Создать':'Редактировать' }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
                v-for="(item, key, index) in editingRow"
                :key="index"
              >
                <v-menu
                  v-model="item.menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                  v-if="item.data_type_id == 3"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="item.value"
                      :label="item.label || item.name" 
                      prepend-icon="mdi-calendar"
                      :hide-details="true"
                      readonly
                      :disabled="!checkEditingStatus"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker id="date" 
                                      ref="date"
                                      @input="item.menu = false"
                                      :datePickerProps="{'first-day-of-week': 1}" 
                                      clearText="Очистить" 
                                      okText="Ок" 
                                      dateFormat="dd.MM.yyyy" 
                                      required
                                      v-model="item.value"
                                      :disabled="!checkEditingStatus"
                                      >
                    <template slot="dateIcon">
                      <span class="mr-4">Дата</span>
                      <v-icon>mdi-calendar</v-icon>
                    </template>
                  </v-date-picker>
                </v-menu>
                <v-text-field
                  v-else-if="item.data_type_id == 2 || item.data_type_id == 1"
                  :label="item.label || item.name"
                  :type="item.data_type_id == 1? 'text': 'number'"
                  :hide-details="true"
                  required
                  v-model="item.value"
                  :disabled="!checkEditingStatus"
                ></v-text-field>
                <v-select
                  v-else-if="item.data_type_id == 4"
                  :label="item.label || item.name"
                  v-model="item.value"
                  :items="item.list_details"
                  :hide-items="true"
                  :disabled="!checkEditingStatus"
                >
                </v-select>
                <v-textarea
                  v-else
                  :label="item.label || item.name"
                  :hide-details="true"
                  auto-grow
                  rows="1"
                  required
                  v-model="item.value"
                  :disabled="!checkEditingStatus"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn 
            color="error"
            @click="closeEditing()"
            >
            Отмена
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            color="success"
            :loading="savingRow"
            @click="saveEditing()"
            >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ApproveList ref="approve_list" :currentRequestStatus="checkEditingStatus?0:1" :currentRequest="report">
    </ApproveList>

    <v-row class="mt-4">
      <v-col>
        Финальный согласующий: {{ report.name }}
      </v-col>
    </v-row>

  </v-card>
</template>
<script>
import moment from "moment";
import ApproveList from '../components/ApproveList.vue'
export default {
  components: {
    ApproveList,
  },
  data() {
    return {
      savingRow: false,
      disableDoubleClick: false,
      items: [],
      report: {},
      step: 1,
      headers: [
        { text: '', value: 'action', align: 'end', width: '150px' },
      ],
      dialog: false,
      currentRow: {},
      editingRow: {},
      isEditing: false,
    }
  },
  async created() { 
    await this.loadData()
  },
  watch: {
    async dialog(value) {
      if (value == false) {
        await this.loadData()
      }
    }

  },
  methods: {
    closeEditing() {
      this.dialog = false
    },
    async saveEditing() {
      this.savingRow = true
      let list = this.checkRequired()
      if (list.length != 0){

        let title = 'Заполните обязательные поля:'

        for (let i of list) {
          title += '\n' + i
        }

        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'warning',
          title: title
        })
        this.savingRow = false
        return false
      }

      try{
        for (let j of this.editingRow) {
          if (!j.id) {
            j.emp_report_id = this.report.id
            await this.axios.post(`/api/1.0/report/detail/`, j)
          } else {
            await this.axios.put(`/api/1.0/report/detail/`, j)
          }
        }

        await this.loadData()
      } catch (err) {
        console.error(err)
      } finally {
        this.savingRow = false
        this.dialog = false
      }
    },
    formatDate (date) {
      if (date)
        return moment(new Date(date)).format('DD.MM.YYYY')
      return ''
    },
    async loadData () {
      const {data} = await this.axios.get(`/api/1.0/report-full/${this.$route.params.id}`)



      for (let chapter of data[0].chapters) {
        for (let j of chapter.details) {
          for (let i of j) {
            if (i.data_type_id == 3) {
              if (!i.date_value) {
                i.date_value = []
              }
              if (i.value[0] != '') {
                i.date_value[0] = moment(i.value[0]).format('YYYY-MM-DD')
              }
              else {
                i.date_value[0] = null
              }
            } else if (i.data_type_id == 4) {
              let {data: details} = await this.axios.get(`/api/1.0/report-item-characteristic/${i.report_item_id}`)
              i.list_details = details
            }           
          }
        }
      }


      this.report = data[0]

      this.setReportChapter(this.report.chapters[this.step-1])
    },
    setReportChapter (report) {
      if (report.data_type_id == 2)
      {
        this.headers = [
          { text: '', value: 'action', align: 'end', width: '150px' },
        ]
        this.headers = [...report.detailsHeaders, ...this.headers]
        this.parseTable(report)
      } 
    },
    openEditing (item, isEditing = false) {
      this.isEditing = isEditing
      this.currentRow = item
      let details = []
      for (let i of this.report.chapters[this.step - 1].details) {
        details = [...details, ...i]
      }
      this.editingRow = details.filter((i)=>i.sequence == item.sequence)
      this.dialog = true
    },
    checkRequired () {
      let requiredVoidDetails = []
      let i = this.report.chapters[this.step-1]
      for (let k of i.details) {
        for (let j of k) {
          if (j.is_required) {
            let warningText = j.label || j.name
            if (!j.value) requiredVoidDetails.push(warningText)
          }
        }
      }
      return requiredVoidDetails
    },
    checkStep () {
      let list = this.checkRequired()
      if (list.length != 0){

        let title = 'Заполните обязательные поля:'

        for (let i of list) {
          title += '\n' + i
        }

        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'warning',
          title: title
        })
        return false
      }
      if (this.report.chapters[this.step-1].data_type_id === 2 && this.items.length === 0){

        let title = 'Таблицы должны содержать хотя бы одну строку'

        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'warning',
          title: title
        })
        return false
      }
      return true

    },
    prevChapter () {
      this.step--
      this.setReportChapter(this.report.chapters[this.step-1])
    },
    async nextChapter () {
      if (!this.checkStep()) {
        return
      }

      if (this.checkEditingStatus && this.report.chapters[this.step-1].data_type_id === 1)
      {
        for (let j of this.report.chapters[this.step-1].details[0]) {
          await this.axios.put(`/api/1.0/report/detail/`, j)
        }
      }

      this.step++
      this.setReportChapter(this.report.chapters[this.step-1])
    },
    parseTable (item) {
      if (item.data_type_id == 1) return

      this.items = []

      let tableItem = {}

      for (let i of item.details) {

        for (let j of i) {
          if (!tableItem.sequence) {
            tableItem.sequence = j.sequence
          }
          if (j.data_type_id == 4 && j.value) {
            tableItem[j.name] = j.list_details.find((item) => {return item.value == j.value}).text
          } else {
            tableItem[j.name] = j.value
          }
        }

        this.items.push(tableItem)
        tableItem = {}
      }
    },
    async save () {
      try{
        this.disableDoubleClick = true

        if (!this.checkStep()) {
          return
        }

        if (await this.$refs.approve_list.sendToApprove() !== true)
        {
          return
        }
        if (this.report.chapters[this.step-1].data_type_id === 1)
        {
          for (let j of this.report.chapters[this.step-1].details[0]) {
            await this.axios.put(`/api/1.0/report/detail/`, j)
          }
        }

        this.report.report_status_id = 2
        await this.axios.put(`/api/1.0/report`, this.report)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'success',
          title: 'Сохранено.'  
        })
        this.$root.$router.push({
          path: `/report_instance`,
          query: { tab: 1 },
        })
      } catch (err) {
        console.error(err)
      } finally {
        this.disableDoubleClick = false
      }
    },
    async deleteRow(item) {
      this.$swal({
          title: `Вы действительно хотите удалить?`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Отмена",
          confirmButtonColor: "#4caf50",
          cancelButtonColor: "#d33",
          confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) 
        {
          let localParams = {
            chapter_id: this.report.chapters[this.step-1].id,
            sequence: item.sequence,
            emp_report_id: this.report.id,
          }
          await this.axios.put(`/api/1.0/report/detail-delete`, localParams)
          this.loadData()
        }
      })
    },
    async addRow() {

            let {data: details} = await this.axios.get(`/api/1.0/report-form/detail/${this.report.chapters[this.step-1].chapter_id}`)

      let seq = 1

      const d = this.items

      if (d.length !== 0)
      {
        seq = d[d.length-1].sequence + 1
      }

      let newRow = []

      for (let i of details)
      {
        let obj = 
        { 
          detail_id: i.id, 
          emp_report_id: this.report.id,
          sequence: seq,
          value: '',
          name: i.name,
          data_type_id: i.data_type_id, 
          is_required: i.is_required,
        }
        if (i.data_type_id == 4) {
          let {data: details} = await this.axios.get(`/api/1.0/report-item-characteristic/${i.id}`)
          obj.list_details = details
        }
        newRow.push(obj)
      }
      this.report.chapters[this.step-1].details.push(newRow)

      this.parseTable(this.report.chapters[this.step-1])

      this.isEditing = true

      this.openEditing(this.items[this.items.length-1], true)
    },
  },
  computed: {
    checkEditingStatus() {
      if ((this.report.report_status_id == 2 || this.report.report_status_id == 4) && this.report.approve_request_status_id != 5) {
        return false
      }
      return true
    },
    itemProps() {
      return this.headers.map(header => header.value);
    },
  },
}
</script>