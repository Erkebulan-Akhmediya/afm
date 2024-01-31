<template>
  <div>
    <v-row>
      <v-dialog
        @click:outside.stop="closeDialog()"
        v-model="showDialog"
        max-width="600px"
        @input="(v) => v || clearDialog()"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ request_type.req_name }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    ref="type"
                    :items="requestModalType"
                    label="Тип"
                    item-text="state"
                    item-value="abbr"
                    required
                    @change="checkType"
                    v-model="requestData.request_type_id"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    ref="subtype"
                    :items="requestModalSubType"
                    label="Подтип"
                    @change="loadFormForSubtype"
                    required
                    item-text="state"
                    item-value="abbr"
                    v-model="requestData.request_sub_type_id"
                  ></v-select>
                  <!-- <p>{{requestData.request_sub_type_id}}</p> -->
                </v-col>

                <!--<v-col cols="12" v-if="isApplication && formInputs.length != 0"> неизвестно для чего нужно было вставлять isApplication-->
                <v-col cols="12" v-if="formInputs.length != 0">
                  <v-col cols="12" v-if="details_loader">
                    <v-skeleton-loader
                      type="article"
                    >
                    </v-skeleton-loader>
                  </v-col>
                  <v-col cols="12" v-else>
                    <!-- Дополнительные поля -->
                    <div
                      v-for="detail, k in formInputs"
                      :key="k"
                    >
                      <div v-if="!detail.is_multiple">
                        <div
                          v-if="detail.value_type_id == 5 && detail.is_long"
                        >
                          <span>{{ formInputs[k].name }}: </span>
                          <b>{{ 
                            formInputs[k].value[0] && formInputs[k].value[0].selectedRow?formInputs[k].value[0].selectedRow.text:formInputs[k].list_value?formInputs[k].list_value[0].selectedRow.text:'Не выбрано' 
                          }}</b>
                          <v-text-field
                            v-model="detail.search_query"
                            label="Поиск"
                            @keydown.enter="search_detail_value(detail)"
                            @input="search_detail_value(detail)"
                          >
                          </v-text-field>
                          <v-data-table
                            :headers="[{text: '', value: 'text'}]"
                            :items="detail.list_details"
                            hide-default-footer
                            hide-default-header
                            :no-data-text="'Нет данных'"
                            @click:row="(row) => {selectCatalogValue(row, k)}"
                            >
                          </v-data-table>
                        </div>
                        <v-select
                          v-if="detail.value_type_id == 5 && !detail.is_long"
                          :label="detail.name" 
                          v-model="detail.value[0]"
                          :items="detail.list_details"
                        >
                        </v-select>
                        <v-select
                          v-if="detail.value_type_id == 4"
                          :label="detail.name" 
                          v-model="detail.value[0]"
                          :items="detail.list_details"
                        >
                        </v-select>
                        <v-checkbox
                          v-if="detail.value_type_id == 7"
                          :label="detail.name" 
                          v-model="detail.value[0]"
                        >
                        </v-checkbox>

                        <v-menu
                          v-model="detail.menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                          v-if="detail.value_type_id == 6"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="detail.date_value[0]"
                              :label="detail.name" 
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-datetime-picker id="date" 
                                              ref="date"
                                              @input="detail.menu2 = false"
                                              :datePickerProps="{'first-day-of-week': 1}" 
                                              :timePickerProps="{format: '24hr', scrollable: true}"
                                              clearText="Очистить" 
                                              okText="Ок" 
                                              dateFormat="dd.MM.yyyy" 
                                              required
                                              v-model="detail.date_value[0]"
                                              >
                            <template slot="dateIcon">
                              <span class="mr-4">Дата</span>
                              <v-icon>mdi-calendar</v-icon>
                            </template>
                          </v-datetime-picker>
                        </v-menu>

                        <v-menu
                          v-model="detail.menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                          v-if="detail.value_type_id == 3"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="detail.date_value[0]"
                              :label="detail.name" 
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker id="date" 
                                              ref="date"
                                              @input="detail.menu2 = false"
                                              :datePickerProps="{'first-day-of-week': 1}" 
                                              clearText="Очистить" 
                                              okText="Ок" 
                                              dateFormat="dd.MM.yyyy" 
                                              required
                                              v-model="detail.date_value[0]"
                                              >
                            <template slot="dateIcon">
                              <span class="mr-4">Дата</span>
                              <v-icon>mdi-calendar</v-icon>
                            </template>
                          </v-date-picker>
                        </v-menu>
                        <v-text-field
                          :label="detail.name"
                          v-if="detail.value_type_id == 1 || detail.value_type_id == 2"
                          :type="detail.value_type_id == 1? 'text': 'number'"
                          required
                          v-model="detail.value[0]"
                        ></v-text-field>
                      </div>
                      <div 
                        v-else
                      >
                        <div
                          >
                          <!--
                          <span
                            class="mb-1 mt-1"
                            >
                            {{ detail.name }}: 
                          </span>
                          {{ detail.value }}

                          <v-chip 
                            class="ml-1 mb-1 mt-1"
                            v-for="value, i of detail.value"
                            :key="i"
                            >

                            <span
                              v-if="detail.value_type_id == 5 || detail.value_type_id == 4"
                            >
                              <b>{{ formInputs[k].value[i] && formInputs[k].value[i].selectedRow?formInputs[k].value[i].selectedRow.text:formInputs[k].list_value[i]?formInputs[k].list_value[i].selectedRow.text:'Не выбрано' }}</b>
                            </span>


                            <span
                              v-if="detail.value_type_id != 5 && detail.value_type_id != 4"
                            >
                              {{ detail.value[i] }}
                            </span>
                            <v-btn
                              icon
                              @click="delete_value(detail, i)"
                              >
                              <v-icon>
                                mdi-close
                              </v-icon>
                            </v-btn>

                          </v-chip>
                          -->

                        </div>

                        <div
                          v-if="detail.value_type_id == 5 && detail.is_long"
                        >
                          <v-text-field
                            v-model="detail.search_query"
                            label="Поиск"
                            @keydown.enter="search_detail_value(detail)"
                            @input="search_detail_value(detail)"
                          >
                          </v-text-field>
                          <v-data-table
                            :headers="[{text: '', value: 'text'}]"
                            :items="detail.list_details"
                            hide-default-footer
                            hide-default-header
                            @click:row="(row) => {selectCatalogValue(row, detail.value.length, k)}"
                            >
                          </v-data-table>
                        </div>


                        <v-menu
                          v-model="detail.menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                          v-if="detail.value_type_id == 6"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="detail.temp_date_value"
                              :label="detail.name" 
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-datetime-picker id="date" 
                                              ref="date"
                                              @input="detail.menu2 = false"
                                              :datePickerProps="{'first-day-of-week': 1}" 
                                              :timePickerProps="{format: '24hr', scrollable: true}"
                                              clearText="Очистить" 
                                              okText="Ок" 
                                              dateFormat="dd.MM.yyyy" 
                                              required
                                              v-model="detail.temp_date_value"
                                              >
                            <template slot="dateIcon">
                              <span class="mr-4">Дата</span>
                              <v-icon>mdi-calendar</v-icon>
                            </template>
                          </v-datetime-picker>
                        </v-menu>

                        <v-menu
                          v-model="detail.menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                          v-if="detail.value_type_id == 3"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="detail.temp_date_value"
                              :label="detail.name" 
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker id="date" 
                                              ref="date"
                                              @input="detail.menu2 = false"
                                              :datePickerProps="{'first-day-of-week': 1}" 
                                              clearText="Очистить" 
                                              okText="Ок" 
                                              dateFormat="dd.MM.yyyy" 
                                              required
                                              v-model="detail.temp_date_value"
                                              >
                            <template slot="dateIcon">
                              <span class="mr-4">Дата</span>
                              <v-icon>mdi-calendar</v-icon>
                            </template>
                          </v-date-picker>
                        </v-menu>

                        <v-select
                          v-if="detail.value_type_id == 5 && !detail.is_long"
                          :label="detail.name" 
                          multiple
                          v-model="detail.value"
                          :items="detail.list_details"
                        >
                        </v-select>
                        <v-select
                          v-if="detail.value_type_id == 4"
                          :label="detail.name" 
                          v-model="detail.temp_value"
                          :items="detail.list_details"
                        >
                        </v-select>
                        <v-checkbox
                          v-if="detail.value_type_id == 7"
                          :label="detail.name" 
                          v-model="detail.temp_value"
                        >
                        </v-checkbox>

                        <v-text-field
                          v-if="detail.value_type_id == 1 || detail.value_type_id == 2"
                          v-model="detail.temp_value"
                        >
                        </v-text-field>

                        <v-btn
                          icon
                          v-if="false"
                          @click="add_value(detail)"
                          >
                          <v-icon>
                            mdi-plus
                          </v-icon>
                        </v-btn>


                      </div>
                    </div>
                  </v-col>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="closeDialog()"> Отмена </v-btn>
            <v-btn color="success" :disabled="formInputs.length == 0 || disableDoubleClick" text @click="saveRequest"> Сохранить и перейти </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import moment from "moment";

export default {
  data: function () {
    return {
      disableDoubleClick: false,
      detailsDialog: false,
      generate_rules: false,
      currentRequestStatus: null,
      currentRequest: {},
      moment,
      details_loader: false,
      menu: false,
      addApproverDialog: false,
      request: [],
      request_approve: [],
      formInputs: [],

      searchEmployeeTable: [],
      searchEmployee: [],
      globalSearchVal: "",
      approver: null,

      requestData: {
        request_type_id: "",
        request_sub_type_id: "",
      },

      requestModalType: [],
      requestModalSubType: [],

      date_toPickerState: "",
      date_fromPickerState: "",

      infoApproveDialog: false,
      infoApproveDialogData: {},

      filter: "Все",
      filterBtns: [
        { color: "primary", text: "Все", status: 0 },
        { color: "primary", text: "Подано", status: 1 },
        { color: "success", text: "Согласовано", status: 2 },
        { color: "error", text: "Отклонено", status: 3 },
      ],
      loader: false,
      isShowReqCreate: false,
      approve_comment: "",
      isShowApproveDialog: false,
    };
  },
  methods: {
    getRequestTypes() {
      this.axios
        .get(`/api/1.0/lov/ref.request_type`, {
          params: {
            is_application: this.isApplication,
          },
        })
        .then(({ data }) => {
          this.requestModalType = data
            .filter((item) => item.id > 0)
            .reduce((acc, item) => {
              acc.push({
                abbr: item.id,
                state: item.name,
              });
              return acc;
            }, []);
        });
    },


           async saveEditApprover() {
      try {
        let params = {
          orders: this.infoApproveDialogData.orders,
          ar_item_type_id: this.infoApproveDialogData.ar_item_type_id,
        }
        await this.axios.put(`/api/1.0/approve/item/${this.infoApproveDialogData.id}`, params)
      } catch (err) {
        console.error(err)
      } finally {
        this.infoApproveDialog = false
      }
    },
    showApproveDialog(isApprove) {
      this.currentRequest.isApprove = isApprove
      this.isShowApproveDialog = true
    },



            closeDialog() {
      this.$emit("close", 0);
      this.formInputs = []
    },

    validateApproverList(approver_list) {
      if (this.generate_rules) return true;
      if (approver_list.length === 0) return false;
      for (let i of approver_list) {
        if (i.request_status_id === 1) {
          return true;
        }
      }
      return false;
    },

    async loadFormForSubtype (newid) {

      this.details_loader = true
      let {data: formInputs} = await this.axios.get(`/api/1.0/request-characteristic/${newid}`)   
      if (this.requestData.request_sub_type_id == 36 || this.requestData.request_sub_type_id == 12 || this.requestData.request_sub_type_id == 22 || this.requestData.request_sub_type_id == 21  || this.requestData.request_sub_type_id == 13) {
        let {data} = await this.axios.get('/api/1.0/employee-affordable-vacation/:identification_number', {localParams:{identification_number: this.$userData.fullData.identification_number}})
        this.requestData.affordable_vacation = data
      }

      for (let i of formInputs) {
        i.value = []
        i.date_value = []
        if (i.characteristic_id == 19) {
          i.date_value[0] = this.request_type.dateFrom
        }
        if (i.characteristic_id == 20) {
          i.date_value[0] = moment(new Date()).format("YYYY-MM-DD")
        }
        if (i.value_type_id === 7) {
          i.value[0] = i.value[0] == 'true'? true: false
        }
        if (i.value_type_id === 4) {
          let {data: details} = await this.axios.get(`/api/1.0/characteristic/list/${i.characteristic_id}`)
          i.list_details = details
        }
        if (i.value_type_id === 5) {
          let {data: details} = await this.axios.get(`/api/1.0/characteristic/catalog/:catalog_name`, {localParams: {catalog_name: i.catalog_name}})
          if(details.length > 10) {
            i.is_long = true
          } else {
            i.is_long = false
            i.list_details = details
          }
        }
      }

      this.formInputs = formInputs
      this.details_loader = false
    },
     async search_detail_value(detail) {
      let {data: values} = await this.axios.get(`/api/1.0/characteristic/catalog/:catalog_name`, {localParams: {catalog_name: detail.catalog_name}, params:{search_query: detail.search_query}})
      detail.list_details = values
      this.formInputs.splice(11, 0)
    },
    selectCatalogValue(row, detail, key = 0) {
      if (!this.formInputs[detail].list_value) {
        this.formInputs[detail].list_value = [{},]
      }

            this.formInputs[detail].list_value[key].selectedRow = row
      this.formInputs[detail].list_value[key].value = row.value
      this.formInputs[detail].value[key] = row.value
      this.formInputs[detail].list_value[key].list_details = [] 
      this.formInputs[detail].list_details = [] 
      this.formInputs.splice(detail, 0)
    },

    clearFrom() {
      if (!this.isApplication) {
        return;
      }
    },

    clearDialog() {
      this.requestData = {
            request_type_id: '',
            request_sub_type_id: '',
            employees: [{
              id: this.$userData.fullData.id, 
              first_name: this.$userData.fullData.first_name, 
              last_name: this.$userData.fullData.last_name, 
              middle_name: this.$userData.fullData.middle_name, 
              }]
      }
      if (!this.isApplication) {
        return;
      }
    },

    getChipsColor(data) {
      switch (data) {
        case 1:
          return "primary";
        case 2:
          return "green";
        case 3:
          return "red";
        case 4:
          return "orange";
        default:
          break;
      }
    },

    checkType(data) {
      let params = {
        request_type_id: data,
      };
      this.axios
        .get(`/api/1.0/lov/ref.request_sub_type`, { params })
        .then(({ data }) => {
          this.requestModalSubType = data
            .filter((item) => item.id > 0)
            .reduce((acc, item) => {
              acc.push({
                abbr: item.id,
                state: item.name,
              });
              return acc;
            }, []);
        });
    },
    async saveRequest() {
      this.disableDoubleClick = true
      let err = []


      if (this.requestData.request_sub_type_id == 36) {
        let df1, dt1
        let df2, dt2
        let df3, dt3
        let df4, dt4

        for (let i of this.formInputs) {
          if (i.characteristic_id == 50) {
            df1 = moment(i.date_value[0])
          } else if (i.characteristic_id == 51) {
            dt1 = moment(i.date_value[0])
          } else if (i.characteristic_id == 48) {
            df2 = moment(i.date_value[0])
          } else if (i.characteristic_id == 49) {
            dt2 = moment(i.date_value[0])
          } else if (i.characteristic_id == 54) {
            df3 = moment(i.date_value[0])
          } else if (i.characteristic_id == 55) {
            dt3 = moment(i.date_value[0])
          } else if (i.characteristic_id == 52) {
            df4 = moment(i.date_value[0])
          } else if (i.characteristic_id == 53) {
            dt4 = moment(i.date_value[0])
          }
        }
        let bd1 = 0
        let bd2 = 0
        let bd3 = 0
        let bd4 = 0

        bd1 = this.requestData.affordable_vacation.days
        bd2 = this.requestData.affordable_vacation.short_days
        bd3 = this.requestData.affordable_vacation.bonus_days
        bd4 = this.requestData.affordable_vacation.ecology_days

        if (bd1 != 0) {
          if (dt1.diff(df1, 'days') >= bd1 ) {
            err.push('Вы взяли больше отпускных дней по ежегодному отпуску чем вам положено')
          }
        }
        if (bd2 != 0) {
          if (dt2.diff(df2, 'days') >= bd2 ) {
            err.push('Вы взяли больше отпускных дней по кратковременному отпуску чем вам положено')
          }
        }
        if (bd3 != 0) {
          if (dt3.diff(df3, 'days') >= bd3 ) {
            err.push('Вы взяли больше отпускных дней по отпуску за выслугу лет чем вам положено')
          }
        }
        if (bd4 != 0) {
          if (dt4.diff(df4, 'days') >= bd4 ) {
            err.push('Вы взяли больше отпускных дней по отпуску за экологию чем вам положено')
          }
        }
      }

      if (this.requestData.request_sub_type_id == 12 || this.requestData.request_sub_type_id == 22 || this.requestData.request_sub_type_id == 21 || this.requestData.request_sub_type_id == 13) {
        let df, dt

        for (let i of this.formInputs) {
          if (i.characteristic_id == 19) {
            df = moment(i.date_value[0])
          } else if (i.characteristic_id == 20) {
            dt = moment(i.date_value[0])
          }
        }
        let bd = 0

        if (this.requestData.request_sub_type_id == 12) {
          bd = this.requestData.affordable_vacation.days
        } else if (this.requestData.request_sub_type_id == 13) {
          bd = this.requestData.affordable_vacation.short_days
        } else if (this.requestData.request_sub_type_id == 21) {
          bd = this.requestData.affordable_vacation.bonus_days
        } else if (this.requestData.request_sub_type_id == 22) {
          bd = this.requestData.affordable_vacation.ecology_days
        }

        if (bd != 0) {
          if (dt.diff(df, 'days') >= bd ) {
            err.push('Вы взяли больше отпускных дней чем вам положено')
          }
        }
      }


      if(!this.requestData.request_type_id) {
        err.push('"Тип" обязателен для заполнения')
      }

      if(!this.requestData.request_sub_type_id) {
        err.push('"Подтип" обязателен для заполнения')
      }

      if(this.requestData.employees.length == 0) {
        this.requestData.employees.push(
          {
            id: this.$userData.fullData.id, 
            first_name: this.$userData.fullData.first_name, 
            last_name: this.$userData.fullData.last_name, 
            middle_name: this.$userData.fullData.middle_name, 
          }
        )
      }

      for (let i of this.formInputs) {
        if (i.is_required && !(i.value[0] || i.date_value[0])) {
          err.push(`Поле "${i.name}" обязательно`)
        }
      }

      if(err.length) {
        this.disableDoubleClick = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 600,
          title: err.join('; <br>'),
        });
      }
      let bindRequest = Object.assign({}, this.requestData)

      for (let i of this.formInputs) {
        if (i.value_type_id === 7) {
          if (!i.value[0]) {
            i.value[0] = 'false'
          }else {
            i.value[0] = 'true'
          }
        }
        else if (i.value_type_id === 5) {
          for (let j in i.value) {
            if (i.value[j].value){
              i.value[j] = i.value[j].value
            }
            if (!i.value[j]){
              i.value[j] = ''
            }
          }
        }
        else if (i.value_type_id === 3 && i.date_value[0]) {
          i.value[0] = this.moment(i.date_value[0]).format('YYYY-MM-DD')
        } else {
          if (!i.value[0]){
            i.value[0] = ''
          }
        }
      }

      bindRequest.details = this.formInputs

      try{
        if (bindRequest.id)
        {
          await this.axios.put(`/api/1.0/request-edit/${bindRequest.id}`, bindRequest)
        }else{
          let {data: request_id} = await this.axios.post(`/api/1.0/request`, bindRequest)
          await this.axios.post(`/api/1.0/approve/request/project`, {request_id: request_id})
        }



                this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: `Сохранено`,
        });

        this.clearDialog()
        if (this.isApplication)
        {
          this.$router.push({ path: '/all_requests' });
        } else {
          this.$emit('save_request')
        }
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: err.data ? err.data.ERR_MSG : err.msg || err,
        });
      } finally {
        this.disableDoubleClick = false
      }
    },

    getBtnsColor(btn) {
      return btn.text == this.filter ? btn.color : "";
    },

    getMinMaxDate(isMin) {
      let today = this.moment();
      let result;
      if (isMin) {
        result = today.subtract(3, "days");
        if ([5, 6, 0].includes(result.day())) {
          result = result.subtract(2, "days");
        }
      } else {
        result = today.add(3, "days");
        if ([1, 6, 0].includes(result.day())) {
          result = result.add(2, "days");
        }
      }
      return result.toISOString();
    },

    dateStrToIso(date) {
      return this.moment(date).toISOString();
    },
  },
  async mounted() {

    this.formInputs = []
    this.requestData = {
          request_type_id: '',
          request_sub_type_id: '',
          employees: []
    }
    if (this.$userData.fullData) {
      this.requestData.employees.push(
        {
          id: this.$userData.fullData.id, 
          first_name: this.$userData.fullData.first_name, 
          last_name: this.$userData.fullData.last_name, 
          middle_name: this.$userData.fullData.middle_name, 
        }
      )
    }


    this.axios
      .get(`/api/1.0/lov/ref.request_type`, {
        params: {
          is_application: this.isApplication,
        },
      })
      .then(({ data }) => {
        this.requestModalType = data
          .filter((item) => item.id > 0)
          .reduce((acc, item) => {
            acc.push({
              abbr: item.id,
              state: item.name,
            });
            return acc;
          }, []);
      });
    this.isShowReqCreate = this.employee.id == this.$userData.id ? true : false;
  },

  computed: {
    showDialog: {
      set(data) {
        this.dialog = data
      },
      get() {
        return this.dialog
      }
    }
  },

  watch: {
    async employee() {
      this.isShowReqCreate =
        this.employee.id == this.$userData.id ? true : false;
      this.requestData = {
            request_type_id: '',
            request_sub_type_id: '',
            employees: [{
              id: this.employee.id, 
              first_name: this.employee.first_name, 
              last_name: this.employee.last_name, 
              middle_name: this.employee.middle_name, 
              }]
      }
    },
    async showDialog() {
      this.formInputs = []
      if (this.employee.id) {

        this.requestData = {
              request_type_id: '',
              request_sub_type_id: '',
              employees: [{
                id: this.employee.id, 
                first_name: this.employee.first_name, 
                last_name: this.employee.last_name, 
                middle_name: this.employee.middle_name, 
                }]
        }

      }
      await this.getRequestTypes();
      await setTimeout(() => this.checkType(this.request_type.req_type), 100);
      await setTimeout(
        () => this.loadFormForSubtype(this.request_type.req_subtype),
        150
      );
      if (this.request_type) {
        this.requestData.request_type_id = this.request_type.req_type;
        this.requestData.request_sub_type_id = this.request_type.req_subtype;
      }

    },

  },
  props: ["dialog", "employee", "request_type", "isApplication"],
};
</script>