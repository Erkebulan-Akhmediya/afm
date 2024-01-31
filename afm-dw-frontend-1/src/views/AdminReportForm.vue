<template>
  <v-card>
    <div class="d-flex justify-space-between">
      <span class="text-h4 mb-2">Список форм</span>
      <v-btn
        @click="openAddFormDialog"
      >
        Добавить форму
      </v-btn>
    </div>
    <v-data-table
      :headers="formHeader"
      :items="forms"
      :items-per-page="10"
      class="clickableTable elevation-1 mb-4"
      :no-data-text="'Нет данных о формах'"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
      @click:row="getForm"
    >
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          class="ma-2"
          v-if="item.report_status_id == 1"
          @click.stop="sendForm(item)"
          color="primary"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
        <v-btn
          icon
          class="ma-2"
          @click="openAddChapterDialog()"
          v-if="item.report_status_id == 1"
          color="primary"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn
          icon
          class="ma-2"
          @click.stop="editForm(item)"
          color="primary"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          class="ma-2"
          @click.stop="deleteForm(item)"
          color="red"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <div 
      v-if="form"
      class="d-flex justify-space-between"
      >
      <span class="text-h4 mb-2">Список разделов {{ form.report_name }}</span>
    </div>
    <v-data-table
      v-if="form"
      :headers="chapterHeader"
      :items="form.chapters"
      :items-per-page="10"
      class="clickableTable elevation-1 mb-4"
      :no-data-text="'Нет данных о формах'"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
      @click:row="getChapter"
    >
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          class="ma-2"
          @click="openAddDetailDialog()"
          v-if="form.report_status_id == 1"
          color="primary"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn
          icon
          class="ma-2"
          @click="editChapter(item)"
          color="primary"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          @click.stop="deleteChapter(item)"
          class="ma-2"
          color="red"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <div 
      class="d-flex justify-space-between"
      v-if="chapter"
      >
      <span class="text-h4 mb-2">Список полей {{ chapter.name }}</span>
    </div>
    <v-data-table
      v-if="chapter"
      :headers="detailHeader"
      :items="chapter.details"
      :items-per-page="10"
      class="clickableTable elevation-1 mb-4"
      :no-data-text="'Нет данных о формах'"
      @click:row="getDetailData"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
    >
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          class="ma-2"
          @click.prevent="editDetail(item)"
          color="primary"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          class="ma-2"
          @click.prevent="deleteItem(item)"
          color="red"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <div 
      class="d-flex justify-space-between"
      v-if="showDetailListTable"
      >
      <span class="text-h4 mb-2">Список значений для поля {{ showDetailListTable.name }}</span>
      <v-btn
        @click="openAddListValueDialog"
        >
        <v-icon>
          mdi-plus
        </v-icon>
      </v-btn>
    </div>
    <v-data-table
      v-if="showDetailListTable"
      :headers="detailValueListHeader"
      :items="showDetailListTable.list"
      :items-per-page="10"
      class="clickableTable elevation-1 mb-4"
      :no-data-text="'Нет данных о формах'"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
    >
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          class="ma-2"
          @click.prevent="deleteDetailListValue(item)"
          color="red"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>

    </v-data-table>


    <ReportFormAccessList v-if="form && form.id" :report_form_id="form.id">
    </ReportFormAccessList>

    <div 
      class="d-flex justify-space-between"
      v-if="form"
      >
      <span class="text-h4 mb-2">Финальный согласующий</span>
    </div>
    <v-row v-if="form">
      
      <v-col v-if="!form.last_approver_name" cols="12">
        <v-chip color="red">Пользователь не выбран</v-chip>
      </v-col>
      <v-col v-else cols="12">
        Выбран пользователь: {{ form.last_approver_name }}
      </v-col>
      <v-col cols="12">
        <div 
          :style="`display: flex; position: relative; z-index:1; width: 100%; background: #fff; height: 56px; box-sizing: border-box`" 
          >
          <v-text-field class="searchBar" :placeholder="$t('mainPage.search.globalSearch')" v-model="globalSearchVal" @keydown.enter="globalSearch" @keydown="check" style="padding: 7px; border: 1px solid #ddd; border-radius: 5px">
            <v-icon @click="globalSearch" slot="prepend" color="gray" style="color: #BDBDBD;">mdi-magnify</v-icon>
          </v-text-field>
        </div>
      </v-col>
      <v-col cols="12">
        <EmployeeTableSmallSearch @clickOnRow="selectEmployee" :employeeTable="searchEmployeeTable" :adminUsersForm="false"></EmployeeTableSmallSearch>
      </v-col>
    </v-row>

    <v-dialog
      v-model="addListValueDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          Список значений
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="editingListValue.display_value_rus" label="Название(рус)">
          </v-text-field>
          <v-text-field v-model="editingListValue.display_value_kaz" label="Название(каз)">
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            @click="AddListValue()"
            >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span style="color: black;" class="text-h5">Форма отчета</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
              >
                <v-text-field
                  label="Название формы отчета"
                  required
                  v-model="editingForm.report_name_buf"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
              >
                <v-select
                  item-text="name"
                  item-value="id"
                  :items="period_types"
                  label="Тип периода"
                  required
                  v-model="editingForm.period_type_id_buf"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
              >
                <v-text-field
                  label="Номер дня дедлайна"
                  required
                  v-model="editingForm.deadline_day_buf"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Закрыть
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="disableDoubleClick"
            @click="addForm"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="addChapterDialog"
      max-width="600px"
      >
      <v-card>
        <v-card-title>
          <span style="color: black;" v-if="editingChapter.id" class="text-h5">Редактирование раздела</span>
          <span style="color: black;" v-else class="text-h5">Создание раздела</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
              >
                <v-text-field
                  label="Название раздела"
                  required
                  v-model="editingChapter.name_buf"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
              >
                <v-select
                  label="Тип раздела"
                  v-model="editingChapter.data_type_id_buf"
                  :items="chart_type_items"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="addChapterDialog = false"
          >
            Закрыть
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="disableDoubleClick"
            @click="addChapter"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="addDetailDialog"
      max-width="600px"
      >
      <v-card>
        <v-card-title>
          <span style="color: black;" v-if="editingDetail.id" class="text-h5">Редактирование поля</span>
          <span style="color: black;" v-else class="text-h5">Создание поля</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
              >
                <v-text-field
                  label="Название поля"
                  required
                  v-model="editingDetail.name_buf"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
              >
                <v-select
                  label="Тип данных"
                  v-model="editingDetail.data_type_id_buf"
                  :items="detail_type_items"
                  item-text="name"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
              >
                <v-checkbox
                  v-model="editingDetail.is_required_buf"
                  :label="`Обязательно`"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="addDetailDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="disableDoubleClick"
            @click="addDetail"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
  </v-card>
</template>
<script>
import ReportFormAccessList from '@/components/ReportFormAccessList.vue'

export default {
  components: {
    ReportFormAccessList
  },
  data () {
    return {
      addListValueDialog: false,
      showDetailListTable: null,
      editingListValue: {},
      searchEmployeeTable: [],
      searchEmployee: [],
      globalSearchVal: '',
      selectedEmployee: null,

      period_types: [],
      disableDoubleClick: false,
      chart_type_items: [
        {
          text: "Форма",
          value: 1
        },
        {
          text: "Таблица",
          value: 2
        },
      ],
      detail_type_items: [],

      forms: [],
      form: null,
      chapter: null,
      formHeader: [
        { text: 'Имя', value: 'report_name'},
        { text: '', value: 'action', align: 'end', width: '20%' },
      ],
      chapterHeader: [
        { text: 'Имя', value: 'name'},
        { text: 'Тип', value: 'type'},
        { text: '', value: 'action', align: 'end', width: '15%' },
      ],
      approversHeader: [
        { text: 'name', value: 'name' }
      ],
      detailHeader: [
        { text: 'Имя', value: 'name'},
        { text: 'Тип', value: 'type'},
        { text: '', value: 'action', align: 'end', width: '15%' },
      ],
      detailValueListHeader: [
        { text: 'Название(рус)', value: 'display_value_rus'},
        { text: 'Название(каз)', value: 'display_value_kaz'},
        { text: '', value: 'action', align: 'end', width: '15%' },
      ],
      dialog: false,
      addChapterDialog: false,
      addDetailDialog: false,

      editingForm: {
        report_name: ''
      },

      editingChapter: {
        name: '',
        data_type_id: 1
      },

      editingDetail: {
        name: '',
        data_type_id: 1,
        is_required: true,
      },
    }
  },
  async mounted () {
    this.loadForms()

    this.loadRefs()

  },
  methods: {
    async deleteDetailListValue(item) {
      await this.axios.put(`/api/1.0/report-item-characteristic-delete/${item.id}`, {})

      let {data: list} = await this.axios.get(`/api/1.0/report-item-characteristic/${this.showDetailListTable.id}`)

      let l = this.showDetailListTable
      this.showDetailListTable = null
      l.list = list
      this.showDetailListTable = l
    },
    async openAddListValueDialog () {

            this.editingListValue = {
        report_item_id: this.showDetailListTable.id,
        display_value_rus: '',
        display_value_kaz: '',
      }
      this.addListValueDialog = true
    },
    async AddListValue () {
      try{
        await this.axios.post(`/api/1.0/report-item-characteristic`, this.editingListValue)

        let {data: list} = await this.axios.get(`/api/1.0/report-item-characteristic/${this.showDetailListTable.id}`)
        this.showDetailListTable.list = list

        this.addListValueDialog = false
      } catch(err) {
        console.error(err)
      }
    },
    async getDetailData (item) {
      if(item.data_type_id == 4) {
        let {data: list} = await this.axios.get(`/api/1.0/report-item-characteristic/${item.id}`)
        item.list = list
        this.showDetailListTable = item
      } else {
        this.showDetailListTable = null
      }
    },
    async selectEmployee (data) {
      await this.axios.post(`/api/1.0/report/add-last-approver`, {approver_id: data.id, report_form_id: this.form.id})
      this.form.last_approver_name = data.last_name + ' ' + data.first_name + ' ' + data.middle_name
      this.selectedEmployee = data
      this.searchEmployeeTable = this.searchEmployeeTable.filter(item=>item.id!=data.id)
    },
    globalSearch () {
      let params = {
        without_performers: true,
        text: this.globalSearchVal
      }
      this.axios.get(`/api/1.0/search`, {params})
      .then(data => {
        data.data = data.data.filter(i=>!i.is_edited_employee)
        this.searchEmployee = data.data
        this.searchEmployeeTable = data.data
      })
    },
    check (val) {
      if(val.key.length > 1) {
        return
      }
      if(this.searchTimeoutId) {
        clearTimeout(this.searchTimeoutId)
        this.searchTimeoutId = ''
      }
      if (val && this.globalSearchVal) {
        this.searchTimeoutId = setTimeout(() => {
        let params = {
          without_performers: true,
          text: this.globalSearchVal
        }
        this.axios.get(`/api/1.0/search`, {params})
          .then(({data}) => {
            data = data.filter(i=>!i.is_edited_employee)
            this.searchEmployee = data
            this.searchEmployeeTable = data
            this.searchTimeoutId = ''
          })
        }, 1000);
      }
    },
    async loadRefs() {
      let {data} = await this.axios.get(`/api/1.0/lov/ref.period_type`)
      this.period_types = data
    },
    async sendForm(item) {
      if (!item.last_approver_name) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: 'Заполните финального согласующего.'
        })
        return
      }
      await this.axios.put(`/api/1.0/report-form/report/${item.id}`, {report_status_id:2})
      await this.loadForms()
      this.$swal({
        ...this.$optionAlert.fire,
        icon: 'success',
        title: 'Отправлено.'  
      })
    },
    openAddFormDialog() {
      this.editingForm = {}
      this.dialog = true
    },
    openAddChapterDialog() {
      this.editingChapter = {}
      this.addChapterDialog = true
    },
    async openAddDetailDialog() {

      let {data} = await this.axios.get('/api/1.0/lov/ref.value_type')
      data = data.filter((item) => {
        return item.id == 4 || item.id == 1 || item.id == 2 || item.id == 3
      })
      this.detail_type_items = data

      this.editingDetail = {}
      this.addDetailDialog = true
    },
    async deleteItem(item) {
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
          await this.axios.put(`/api/1.0/report-form-item-delete/${item.id}`)
          this.getChapter(item)
        }
      })
    },
    async deleteChapter(item) {

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
          await this.axios.put(`/api/1.0/report-form-chapter-delete/${item.id}`)
          this.chapter = null
          this.getForm(item)
        }
      })
    },
    async deleteForm(item) {
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
          await this.axios.put(`/api/1.0/report-form-delete/${item.id}`)
          this.form = null
          this.chapter = null
          this.loadForms()
        }
      })
    },
    editForm(item) {
      this.editingForm = item
      this.editingForm.report_name_buf = this.editingForm.report_name
      this.editingForm.period_type_id_buf = this.editingForm.period_type_id
      this.editingForm.deadline_day_buf = this.editingForm.deadline_day
      this.dialog = true
    },
    editChapter(item) {
      this.editingChapter = item

      this.editingChapter.name_buf = this.editingChapter.name
      this.editingChapter.data_type_id_buf = this.editingChapter.data_type_id

      this.addChapterDialog = true
    },
    async editDetail(item) {
      this.editingDetail = item

      let {data} = await this.axios.get('/api/1.0/lov/ref.value_type')

      data = data.filter((item) => {
        return item.id == 4 || item.id == 1 || item.id == 2 || item.id == 3
      })

      this.detail_type_items = data


      this.editingDetail.name_buf = this.editingDetail.name
      this.editingDetail.is_required_buf = this.editingDetail.is_required
      this.editingDetail.data_type_id_buf = this.editingDetail.data_type_id

      this.addDetailDialog = true
    },
    async getForm(item) {

      if(item.id) {

        const {data: chapters} = await this.axios.get(`/api/1.0/report-form/chapter/${item.id}`)

        item.chapters = chapters
        this.chapter = null
        this.showDetailListTable = null
      }

      this.form = item

    },
    async getChapter(item) {

      if(item.id) {

        const {data: details} = await this.axios.get(`/api/1.0/report-form/detail/${item.id}`)

        item.details = details
        this.showDetailListTable = null
      }


            this.chapter = item
    },
    async addChapter() {
      this.editingChapter.name_buf = this.editingChapter.name_buf.trim()
      if(!this.editingChapter.name_buf) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: 'Вы не заполнили название.'  
        })

        return 
      }

      if(!this.editingChapter.data_type_id_buf) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: 'Вы не заполнили тип.'  
        })

        return 
      }

      if (!this.form){
        return
      } 

      this.disableDoubleClick = true

      this.editingChapter.name = this.editingChapter.name_buf
      this.editingChapter.data_type_id = this.editingChapter.data_type_id_buf

      if (this.editingChapter.id) {
        await this.axios.put(`/api/1.0/report-form/chapter/${this.editingChapter.id}`, this.editingChapter)
        this.addChapterDialog = false
        this.disableDoubleClick = false
      }
      else {
        let sendData = this.editingChapter
        sendData.report_form_id = this.form.id

        await this.axios.post(`/api/1.0/report-form/chapter`, sendData)
      }

      this.$swal({
        ...this.$optionAlert.fire,
        icon: 'success',
        title: 'Сохранено.'  
      })

      this.getChapter({id: this.editingChapter.id})
      this.addChapterDialog = false

      this.disableDoubleClick = false
    },
    async addDetail() {
      this.editingDetail.name_buf = this.editingDetail.name_buf.trim()
      if(!this.editingDetail.name_buf) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: 'Вы не заполнили название.'  
        })

        return 
      }

      if(!this.editingDetail.data_type_id_buf) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: 'Вы не заполнили тип.'  
        })

        return 
      }

      this.disableDoubleClick = true

      this.editingDetail.name = this.editingDetail.name_buf
      this.editingDetail.is_required = this.editingDetail.is_required_buf
      this.editingDetail.data_type_id = this.editingDetail.data_type_id_buf
      if (this.chapter)
      {
        if (this.editingDetail.id) {
          await this.axios.put(`/api/1.0/report-form/detail/${this.editingDetail.id}`, this.editingDetail)
          this.addDetailDialog = false
        }
        else {
          let sendData = this.editingDetail
          sendData.report_chapter_id = this.chapter.id
          await this.axios.post(`/api/1.0/report-form/detail`, sendData)
        }

        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'success',
          title: 'Сохранено.'  
        })

        this.getChapter({id: this.chapter.id})

        this.addDetailDialog = false
      }
      this.disableDoubleClick = false
    },
    async loadForms() {
      let {data} = await this.axios.get('/api/1.0/report-form/report', {params: {status: 0, get_all: true}})
      this.forms = data
    },
    async addForm() {
      this.editingForm.report_name_buf = this.editingForm.report_name_buf.trim()
      if(!this.editingForm.report_name_buf) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: 'Вы не заполнили название.'  
        })

        return 
      }

      if(!this.editingForm.deadline_day_buf) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: 'Вы не заполнили дней до дедлайна.'  
        })

        return 
      }

      this.disableDoubleClick = true

      this.editingForm.report_name = this.editingForm.report_name_buf
      this.editingForm.period_type_id = this.editingForm.period_type_id_buf
      this.editingForm.deadline_day = this.editingForm.deadline_day_buf


      if (this.editingForm && this.editingForm.id) {
        await this.axios.put(`/api/1.0/report-form/report/${this.editingForm.id}`, { 
          name: this.editingForm.report_name, 
          period_type_id: this.editingForm.period_type_id,
          deadline_day: this.editingForm.deadline_day, 
          })
        this.getForm({id: this.editingForm.id})
      } else {
        const item = {
          report_name: this.editingForm.report_name,
          period_type_id: this.editingForm.period_type_id,
          deadline_day: this.editingForm.deadline_day, 
          }
        await this.axios.post(`/api/1.0/report-form/report`, item)
      }


      this.$swal({
        ...this.$optionAlert.fire,
        icon: 'success',
        title: 'Сохранено.'  
      })

      await this.loadForms()

      this.dialog = false
      this.disableDoubleClick = false
    },
    async save(item) {
      this.axios.post(`/api/1.0/report-form`, item)
      this.$swal({
        ...this.$optionAlert.fire,
        icon: 'success',
        title: 'Сохранено.'  
      })
      this.loadForms()
      this.form = null
      this.chapter = null
    }
  }
}
</script>