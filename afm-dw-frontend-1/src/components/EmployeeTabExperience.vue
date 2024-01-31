<template>
  <!-- <div class="tabExperience">
      <div v-if="typeReference" class="top-menu mb-4" style="display: flex; align-items: stretch;">
        <v-select
        v-model="typeReference"
        :items="typeReferenceItems"
        dense
        outlined
        hide-details
        style="max-width: 300px"
        class="ma-2"
        label="Тип"
        ></v-select>
        <v-btn style="height: 40px" class="ma-2" @click="createReference" outlined color="blue">
        <v-icon>mdi-file-document-outline</v-icon>
        Сформировать
        </v-btn>
        <v-btn
            style="height: 40px"
            :disabled="btnLoader"
            :loading="btnLoader"
            class="ma-2" 
            @click="downloadObjective" 
            outlined color="blue">
        <v-icon class="mr-2">mdi-download-circle-outline</v-icon>
        Скачать
        </v-btn>
      </div>
      <div v-else>
        Нет категории или не соответствует позиция
      </div>
    <div v-if="typeReference == 1 && objectiveReference" >
      <ObjectiveReference :btnLoader="btnLoader" @downloadObjective="downloadObjective" :objectiveReference="objectiveReference" :image="image">
      </ObjectiveReference>
    </div>
    <div v-if="typeReference == 2 && workList">
        <WorkListReference :btnLoader="btnLoader" @downloadObjective="downloadObjective" :workList="workList" :image="image">
        </WorkListReference>
    </div>
  </div> -->

  <div>
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Опыт работы</strong></div>
        <v-btn color="primary" outlined @click="employeeWorkListClear(); employeeWorkListDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeWorkListDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeWorkListModel.id ? 'Редактировать опыт работы' : 'Добавить опыт работы'}}
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="6">
                    <v-dialog
                      ref="date_from_dialog_ref"
                      v-model="employeeWorkListModel_date_from_dialog"
                      :return-value.sync="employeeWorkListModel.date_from"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeWorkListModel.date_from"
                          label="Дата с"
                          prepend-icon="mdi-calendar"
                          readonly
                          required
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeWorkListModel.date_from"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employeeWorkListModel_date_from_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.date_from_dialog_ref.save(employeeWorkListModel.date_from)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="6">
                    <v-dialog
                      ref="date_to_dialog_ref"
                      v-model="employeeWorkListModel_date_to_dialog"
                      :return-value.sync="employeeWorkListModel.date_to"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeWorkListModel.date_to"
                          label="Дата по"
                          prepend-icon="mdi-calendar"
                          readonly
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeWorkListModel.date_to"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employeeWorkListModel_date_to_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.date_to_dialog_ref.save(employeeWorkListModel.date_to)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Должность"
                      required
                      dense
                      v-model="employeeWorkListModel.position"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      label="Является руководителем?"
                      required
                      dense
                      v-model="employeeWorkListModel.is_head_position"
                      >
                    </v-checkbox>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      outlined
                      label="Место работы"
                      dense
                      v-model="employeeWorkListModel.work_place"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Причина увольнения"
                      required
                      dense
                      v-model="employeeWorkListModel.reason_for_dismissal"
                      >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeWorkListDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeWorkListSave()">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :loading="employeeWorkListLoader"
          :headers="employeeWorkListHeader"
          :items="employeeWorkListData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.is_head_position`]="{ item }">
            <span>{{ item.is_head_position ? 'Да' : 'Нет' }}</span>
          </template>
          <template v-slot:[`item.date_from`]="{ item }">
              <span>{{!employee.is_edited_employee ? item.date_from : moment(new Date(item.date_from + '+0000')).format('DD.MM.YYYY')}}</span>   
          </template>
          <template v-slot:[`item.date_to`]="{ item }">
              <span>{{!employee.is_edited_employee ? item.date_to : (item.date_to ? moment(new Date(item.date_to + '+0000')).format('DD.MM.YYYY') : null)}}</span>   
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeWorkListEdit(item)"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="primary"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeWorkListDelete(item)"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="red"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
      <!-- <v-btn @click="employeeWorkListGet()"></v-btn> -->
    </v-row>
  </div>
</template>
<script>
import moment from "moment";
export default {
  data: function() { return {
    disableDoubleClick: false,
    typeReferenceItems: [],
    typeReference: '',
    file: "",
    url: "",
    objectiveReference: null,
    workList: null,
    btnLoader: false,

    moment,
    employeeWorkListDialog: false,
    employeeWorkListData: [],
    employeeWorkListModel: {
      id: '',
      date_from: '',
      date_to: '',
      position: '',
      is_head_position: '',
      work_place: '',
      reason_for_dismissal: '',
      employee_id: this.employee.id,
      table_name: 'hr.employee_work_list'
    },
    employeeWorkListHeader: [],
    employeeWorkListType: [],
    employeeWorkListLoader: false,
    employeeWorkListModel_date_from_dialog: false,
    employeeWorkListModel_date_to_dialog: false,
  }},
  computed: {
    is_active_candidate_request: { 
      get() { return this.$store.state.employee.is_active_candidate_request },
      set(value) { this.$store.commit('setIsActiveCandidateRequest', value) }
    }
  },
  methods: {
    async getConst() {
      let { data: array } = await this.axios.get( "/api/1.0/lov/ref.sys_all_const",
          { params: { name: "refObjectCategory,refWorklistCategory,refObjectPositionArr,refWorklistPositionArr"}}
      );
      function parseSys(name, arr) {
        return arr.find((item) => item.name == name);
      }
      return {
        refObjectArr: parseSys(`refObjectCategory`, array).const_value.split(","),
        refWorklistArr: parseSys(`refWorklistCategory`, array).const_value.split(","),
        refObjectPosArr: parseSys(`refObjectPositionArr`, array).const_value.split(","),
        refWorkPosArr: parseSys(`refWorklistPositionArr`, array).const_value.split(","),
      };
    },
    async checkTypeRef() {
      let { refObjectArr, refObjectPosArr, refWorklistArr, refWorkPosArr } = await this.getConst();

      if (refObjectArr.includes(this.employee.category_name) || refObjectPosArr.includes(this.employee.position_name_rus)) {
        this.$set(this, `typeReferenceItems`, [{ text: "Справка-объективка", value: 1 }])
        this.typeReference = 1
      } else if (refWorklistArr.includes(this.employee.category_name) || refWorkPosArr.includes(this.employee.position_name_rus)) {
        this.$set(this, `typeReferenceItems`, [{ text: "Послужной список", value: 2 }])
        this.typeReference = 2
      }
    },
    async downloadObjective() {
      this.btnLoader = true
      let refName, type, url
      switch (this.typeReference) {
        case 1:
          type = `objective`
          refName = `справка-объективка`
          url = `pdf_object`
          break;
        case 2:
          type = `worklist`
          refName = `Послужной список`
          url = `pdf_worklist`
          break;

              default:
          break;
      }
      this.axios.get(`/api/1.0/reference/${url}`, {params: {employee_id: this.employee.id, iin: this.employee.identification_number, bin: this.employee.organization_identification_number, type,  timez: - new Date().getTimezoneOffset()}})
      .then((response) => {
                  let blob = new Blob([new Buffer(response.data, "base64")], {
                    type: "application/document",
                  });
                  const a = document.createElement("a");
                  document.body.appendChild(a);
                  const url = window.URL.createObjectURL(blob);
                  a.href = url;
                  a.download = `${refName} - ${this.employee.last_name} ${this.employee.first_name} ${this.employee.middle_name}.pdf`;
                  a.click();
                  a.remove();
                  this.btnLoader = false
                })
      .catch((err) => {
        console.log(err)
        this.btnLoader = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Не удалось сформировать файл: ${err.data?.ERR_MSG || err}`,
        });
      })
    },
    async createReference() {
        let data
        switch (this.typeReference) {
            case 1: 
                data = await this.axios.get(`/api/1.0/reference/get_object`, {params: {iin: this.employee.identification_number, bin: this.employee.organization_identification_number, type: 'objective', timez: - new Date().getTimezoneOffset()}})
                this.objectiveReference = data.data
                break;
            case 2: 
                data = await this.axios.get(`/api/1.0/reference/get_worklist`, {params: {iin: this.employee.identification_number, bin: this.employee.organization_identification_number, type: 'worklist',  timez: - new Date().getTimezoneOffset()}})
                this.workList = data.data
                break;

                    default:
                break;
        }
        return
    },

    employeeWorkListClear() {
      this.employeeWorkListModel = {
        id: '',
        date_from: '',
        date_to: '',
        position: '',
        is_head_position: false,
        work_place: '',
        reason_for_dismissal: '',
        employee_id: this.employee.id,
        table_name: 'hr.employee_work_list'
      }
    },

    async employeeWorkListGet() {
      this.employeeWorkListLoader = true

      if(this.employee.is_edited_employee) {
        let params = { employee_id: this.employee.id, is_deleted: false }

        this.axios.get(`/api/1.0/lov/hr.employee_work_list`, { params }) 
          .then(({data}) => {
            this.employeeWorkListLoader = false
            data.sort((a, b) => { 
              return new Date(b.date_from) - new Date(a.date_from);
            });
            this.employeeWorkListData = data
          })
          .catch((err) => {
            this.employeeWorkListLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
        } else {
          let work = await this.axios.get(`/api/1.0/employeeworklist/`+this.employee.identification_number+'/'+this.employee.organization_identification_number) 
          this.employeeWorkListLoader = false
          let data2 = []
          for( let el of work.data.Labor_Activity) {
            data2.push({date_from: el.Date_Start, date_to: el.Date_End, work_place: el.Place_Of_Work})
          }
          this.employeeWorkListData = data2.reverse()
        }
    },

    employeeWorkListEdit(data) {
      this.employeeWorkListModel.id = data.id
      this.employeeWorkListModel.date_from = data.date_from.split(' ')[0]
      this.employeeWorkListModel.date_to = data.date_to ? data.date_to.split(' ')[0] : null
      this.employeeWorkListModel.position = data.position
      this.employeeWorkListModel.is_head_position = data.is_head_position ? true : false
      this.employeeWorkListModel.work_place = data.work_place
      this.employeeWorkListModel.reason_for_dismissal = data.reason_for_dismissal

      this.employeeWorkListDialog = true;
    },

    employeeWorkListDelete(data) {
      this.$swal({
        title: `Вы действительно хотите удалить запись?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_work_list', is_deleted: true })
            this.employeeWorkListGet();
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "success",
              title: "Удален",
            });
          } catch (err) {
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          }
        }
      });
    },

        employeeWorkListSave() {
      this.disableDoubleClick = true
      let err = []

      if(!this.employeeWorkListModel.date_from) {
        err.push('"Дата с" обязателен для заполнения')
      }
      if(!this.employeeWorkListModel.position) {
        err.push('"Должность" обязателен для заполнения')
      }
      if(!this.employeeWorkListModel.work_place) {
        err.push('"Место работы" обязателен для заполнения')
      }
      if(!this.employeeWorkListModel.reason_for_dismissal) {
        err.push('"Причина увольнения" обязателен для заполнения')
      }
      if(err.length) {
        this.disableDoubleClick = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: err.join('; <br>'),
        });
      }

      let method = 'post'
      let url = `/api/1.0/lov`
      if (this.employeeWorkListModel.id != '') { 
        method = 'put'
        url = `/api/1.0/lov/`+this.employeeWorkListModel.id
      }

      this.axios[method](url, this.employeeWorkListModel)
        .then(() => {
            this.employeeWorkListGet();

                        this.$swal({
              ...this.$optionAlert.fire,
              icon: "success",
              title: method == 'post' ? `Создан` : `Обновлен`,
            });
        })
        .catch(err => {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 600,
            title: err.data ? err.data.ERR_MSG : err.msg || err,
          });
        })
        .finally(()=>{
          this.employeeWorkListDialog = false;
          this.disableDoubleClick = false
        })
    },
  },
  created() {
    this.checkTypeRef()
    this.employeeWorkListGet()

    if (this.employee.is_edited_employee) {
      this.employeeWorkListHeader = [
        { text: '', value: 'id', sortable: false },
        { text: 'Дата с', value: 'date_from', sortable: false },
        { text: 'Дата по', value: 'date_to', sortable: false },
        { text: 'Должность', value: 'position', sortable: false },
        { text: 'Является руководителем?', value: 'is_head_position', sortable: false },
        { text: 'Место работы', value: 'work_place', sortable: false },
        { text: 'Причина увольнения', value: 'reason_for_dismissal', sortable: false },
        { text: '', value: 'action', sortable: false, width: '10%' }
      ];
    } else {
      this.employeeWorkListHeader = [
        { text: '', value: 'id', sortable: false },
        { text: 'Дата с', value: 'date_from', sortable: false },
        { text: 'Дата по', value: 'date_to', sortable: false },
        { text: 'Место работы', value: 'work_place', sortable: false },
        { text: '', value: 'action', sortable: false, width: '10%' }
      ];
    }
  },
  watch: {
    employee() {
      this.objectiveReference = null
      this.workList = null
      this.checkTypeRef()
      this.employeeWorkListGet()
    }
  },
  props: ["employee", 'image'],
};
</script>