<template>
  <div>
    <br/>
    <v-row>
      <v-col cols="6">
        <strong>Согласование</strong>
      </v-col>
      <v-col cols="6 d-flex justify-end">
        <v-btn color="primary" outlined
          @click="addApproverDialog = true"
          v-if="currentRequestStatus === 0 || currentRequestStatus === 5 || currentRequestStatus === 6/* Проект или отправлен на доработку */">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить согласующего
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      dense
      style="margin-top: 2rem"
      :headers="headersRequestApprove"
      :items="request_approve"
      class="elevation-1"
      :no-data-text="$t('employeeCard.tabs.noData')"
    >
      <template v-slot:[`item.action`]="{ item }">
        <div
          v-if="(currentRequestStatus === 0 || currentRequestStatus === 5 || currentRequestStatus === 6) && (item.request_status_id === 1 || item.request_status_id === 8 || item.request_status_id === 12)"
          >
          <v-btn
            icon
            class="ma-2"
            small
            color="primary"
            @click="showInfoApproveDialog(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            class="ma-2"
            small
            color="red"
            @click="deleteApprover(item)"
          >
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </div>
      </template>
      <template v-slot:[`item.parent_id`]="{ item }">
        <td>
          {{ item.parent_id }}
        </td>
      </template>
      <template v-slot:[`item.approve`]="{ item }">
        <td>
          {{ item.emp_last_name }} {{ item.emp_first_name }} {{ item.emp_middle_name }}
          
        </td>
      </template>
      <template v-slot:[`item.approve_date`]="{ item }">
        <td>{{ item.approve_date ? moment(item.approve_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}</td>
      </template>
      <template v-slot:[`item.send_date`]="{ item }">
        <td>{{ item.send_date ? moment(item.send_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}</td>
      </template>
      <template v-slot:[`item.create_date`]="{ item }">
        <td>{{ item.create_date ? moment(item.create_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}</td>
    </template>
    <template v-slot:[`item.status`]="{ item }">
      <td>
          <v-chip
            class="ma-2"
            :color="getChipsColor(item.request_status_id-1)"
            text-color="white"
          >
            <span>{{ item.request_status_name }}</span>
          </v-chip>
        </td>
      </template>
    </v-data-table>
    <v-dialog
      v-model="addApproverDialog"
      width="800"
      >
      <v-card>
        <v-card-title style="background-color: #1976d2;">
          Форма добавления
        </v-card-title>
        <br/>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col v-if="approver != null" cols="12">
                <p style="font-size: 16px;">Согласующий: <strong>{{ approver.last_name }} {{ approver.first_name }} {{ approver.middle_name }}</strong></p>
              </v-col>
              <v-col v-if="approver != null" cols="4">
                <v-text-field
                  label="Шаг согласования"
                  type="number"
                  required
                  dense
                  v-model="approver.orders"
                  >
                </v-text-field>
              </v-col>
              <v-col v-if="approver != null" cols="8">
                <v-select
                  :items="ar_item_type_list"
                  v-model="approver.ar_item_type_id"
                  label="Форма согласования"
                  required
                  dense
                ></v-select>
              </v-col>
              <v-col v-if="approver == null" cols="12">
                <v-chip color="red">Согласующий не выбран</v-chip>
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
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            text
            color="error"
            @click="addApproverDialog = false"
            >
            Отмена
          </v-btn>
          <v-spacer>
          </v-spacer>
          <v-btn
            text
            color="success"
            @click="addApprover"
            >
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="infoApproveDialog"
      width="500"
    >
      <v-card>
        <v-card-text style="padding: 30px">
            <slot>
                <div style="color: #000;">
                    
                    <p>Очередь согласования: <input 
                      class="mr-2 ml-4"
                      type="number" 
                      style="width: 50px;"
                      v-model="infoApproveDialogData.orders"
                      >
                    </p>
                    <p>Согласующий: <b>{{infoApproveDialogData.emp_name}}</b></p>
                    <v-select v-if="infoApproveDialogData.request_status_id" class="ml-6" :items="ar_item_type_list" v-model="infoApproveDialogData.ar_item_type_id"></v-select>
                </div>
            </slot>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
          outlined
            color="primary"
            text
            @click="saveEditApprover()"
          >
            Ок
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
  </div>
</template>
<script>
import moment from 'moment'

export default {
  data: function() {
    return {
      btnLoader:false,
      ar_item_type_list: [
        {
          text: 'Утверждающий',
          value: 1,
        },
        {
          text: 'Согласующий',
          value: 2,
        }
      ],
      moment,
      addApproverDialog: false,
      request_approve: [],

      searchEmployeeTable: [],
      searchEmployee: [],
      globalSearchVal: '',
      approver: null,

      headersRequestApprove: [
      { text: 'Id', value: 'id' },
      { text: 'Parent id', value: 'parent_id' },
      { text: 'Шаг согласования', value: 'orders' },
      { text: 'Согласующий', value: 'emp_name' },
      { text: 'Дата отправки', value: 'send_date' },
      { text: 'Дата согласования/поручения', value: 'approve_date' },
      { text: this.$t('employeeCard.tabs.comment'), value: 'comment' },
      { text: this.$t('employeeCard.tabs.status'), value: 'status' },
      { text: '', value: 'action', width: '150px' },
      ],

      disableDoubleClick: false,

      infoApproveDialog: false,
      infoApproveDialogData: {},

      loader: false,
    }

      },
  methods: {
    getChipsColor(data) {
      switch(data){
        case 1:
          return 'primary'
        case 8:
          return 'primary'
        case 13:
          return 'primary'
        case 2:
          return 'green'
        case 9:
          return 'green'
        case 14:
          return 'green'
        case 3:
          return 'red'
        case 10:
          return 'red'
        case 4:
          return 'orange'
        case 12:
          return 'orange'
        default:
          break;
      }
    },
    selectEmployee (data) {
      let searchedEmployee = data
      searchedEmployee.approver_id = data.id
      searchedEmployee.emp_first_name = data.first_name
      searchedEmployee.emp_last_name = data.last_name
      searchedEmployee.emp_middle_name = data.middle_name
      data.orders = 1
      this.approver = searchedEmployee
      this.approver.ar_item_type_id = 1
      this.searchEmployeeTable = this.searchEmployeeTable.filter(item=>item.id!=data.id)
    },
    globalSearch () {
      let params = {
        text: this.globalSearchVal,
        without_performers: true,
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
          text: this.globalSearchVal,
          without_performers: true,
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
    async saveEditApprover() {
      try {
        let params = {
          orders: this.infoApproveDialogData.orders,
          ar_item_type_id: this.infoApproveDialogData.ar_item_type_id
        }
        await this.axios.put(`/api/1.0/approve/item/${this.infoApproveDialogData.id}`, params)
        await this.getRequestApproveInfo(this.currentRequest)
      } catch (err) {
        console.error(err)
      } finally {
        this.infoApproveDialog = false
      }
    },
    async deleteApprover (item) {
      try{
        await this.axios.put(`/api/1.0/approve/item-delete/${item.id}`, {})
        await this.getRequestApproveInfo(this.currentRequest)
      } catch (err) {
        console.error(err)
      }
    },
    async addApprover () {

      let approvers = this.request_approve.filter(item => item.request_status_id == 1 || item.request_status_id == 2 || item.request_status_id == 8 || item.request_status_id == 9 || item.request_status_id == 13 || item.request_status_id == 14)

      if (approvers.length > 0)
      {

        let max = approvers[0].orders
        for (let i of approvers) {
          if (max < i.orders) {
            max = i.orders
          }
        }
        if (this.approver.orders > max) {
          this.approver.orders = Number(max) + 1
        }
      } else {
        this.approver.orders = 1
      }

      try {
        let params = {
          approve_request_id: this.currentRequest.approve_request_id,
          item: {
            ar_item_type_id: this.approver.ar_item_type_id,
            orders: this.approver.orders,
            approver_id: this.approver.id
          }
        }

        await this.axios.post(`/api/1.0/approve/item/project`, params)

        await this.getRequestApproveInfo(this.currentRequest)

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          width: 600,
          title: `Согласующий добавлен`,
        });
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: err.data ? err.data.ERR_MSG : err.msg || err,
        });
      } finally {
        this.searchEmployee = []
        this.globalSearchVal = ''
        this.searchedEmployee = null
        this.approver = null
        this.addApproverDialog = false
      }

    },
    validateApproverList(approver_list) {
      if (this.generate_rules) return true
      if (approver_list.length === 0) return false
      for (let i of approver_list)
      {
        if (i.request_status_id === 1 || i.request_status_id === 12 || i.request_status_id === 8 )
        {
          return true
        }
      }
      return false
    },
    async sendToApproveOrApproveAuto () {
      if (this.request_approve.length === 0){
          await this.axios.put(`/api/1.0/approve/request/${this.currentRequest.approve_request_id}`, {
            ar_item_status_id: 2
          })
      } else {
        await this.sendToApprove()
      }
      return true
    },
    async sendToApprove () {


      if (!this.validateApproverList(this.request_approve))
      {

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 600,
          title: "Список согласующих пуст",
        });

        return 
      }

      let max = 1
      for (let i of this.request_approve)
      {
        if (i.orders > max) 
        {
          max = i.orders
        }
      }

      let localParams = {
        approve_request_id: this.currentRequest.approve_request_id,
      }
      try {
        await this.axios.put(`/api/1.0/request`, localParams)

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: "Отправлено",
        });
        await this.getRequestApproveInfo()
        return true
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: err.data ? err.data.ERR_MSG : err.msg || err,
        });
      } 
    },

    async getRequestApproveInfo() {
      let params = {
        object_info: {
          object_id: this.currentRequest.id,
          object_name: this.currentRequest.request_object_type_name? this.currentRequest.request_object_type_name: 'REQUEST',
        },
      }

      const {data: approves} = await this.axios.get(`/api/1.0/approve/item`, {params})

      this.request_approve = approves
    },

      showInfoApproveDialog(data) {
          this.infoApproveDialogData = data
          this.infoApproveDialog = true
      },
    },
    async mounted() {
      if (this.currentRequest.id) {
        this.getRequestApproveInfo({
          id: this.currentRequest.id
        })
      }
    },
    watch: {
      async currentRequest(val) {
        if (val.id) {
          await this.getRequestApproveInfo({
            id: val.id
          })
        }
      }
    },
    props: ['currentRequestStatus', 'currentRequest']

       }
</script>