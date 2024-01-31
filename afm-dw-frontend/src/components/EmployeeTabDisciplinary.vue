<template>
  <div>
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Дисциплинарные взыскания</strong></div>
        <v-btn color="primary" outlined @click="employeeDisciplinaryClear(); employeeDisciplinaryDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeDisciplinaryDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeDisciplinaryModel.id ? 'Редактировать заключение' : 'Добавить заключение'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-dialog
                      ref="offense_date_dialog_ref"
                      v-model="employeeDisciplinaryModel_offense_date_dialog"
                      :return-value.sync="employeeDisciplinaryModel.offense_date"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeDisciplinaryModel.offense_date"
                          label="Дата"
                          prepend-icon="mdi-calendar"
                          readonly
                          required
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeDisciplinaryModel.offense_date"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employeeDisciplinaryModel_offense_date_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.offense_date_dialog_ref.save(employeeDisciplinaryModel.offense_date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      :items="employeeDisciplinaryType"
                      label="Вид"
                      required
                      dense
                      v-model="employeeDisciplinaryModel.disciplinary_type_id"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      outlined
                      label="Проступок"
                      dense
                      v-model="employeeDisciplinaryModel.description"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeDisciplinaryDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeDisciplinarySave">
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
          :loading="employeeDisciplinaryLoader"
          :headers="employeeDisciplinaryHeader"
          :items="employeeDisciplinaryData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.disciplinary_type_id`]="{ item }">
              <span>{{getEmployeeDisciplinaryTypeVal(item.disciplinary_type_id)}} </span>      
          </template>
          <template v-slot:[`item.offense_date`]="{ item }">
              <span>{{moment(new Date(item.offense_date + '+0000')).format('DD.MM.YYYY')}}</span>   
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeDisciplinaryEdit(item)" v-if="employee.is_edited_employee"
              small
              color="primary"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeDisciplinaryDelete(item)" v-if="employee.is_edited_employee"
              small
              color="red"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import moment from "moment";

export default {
  data: () => ({
    moment,

        disableDoubleClick: false,
    employeeDisciplinaryDialog: false,
    employeeDisciplinaryData: [],
    employeeDisciplinaryModel: {
      id: '',
      offense_date: '',
      disciplinary_type_id: '',
      description: '',
      employee_id: '',
      table_name: 'hr.employee_disciplinary'
    },
    employeeDisciplinaryHeader: [
      { text: '', value: 'id', sortable: false },
      { text: 'Дата', value: 'offense_date', sortable: false },
      { text: 'Вид', value: 'disciplinary_type_id', sortable: false },
      { text: 'Проступок', value: 'description', sortable: false },
      { text: '', value: 'action', sortable: false, width: '10%' }
    ],
    employeeDisciplinaryType: [],
    employeeDisciplinaryLoader: false,
    employeeDisciplinaryModel_offense_date_dialog: false,
  }),
  computed: {
    is_active_candidate_request: { 
      get() { return this.$store.state.employee.is_active_candidate_request },
      set(value) { this.$store.commit('setIsActiveCandidateRequest', value) }
    }
  },
  methods: {
    employeeDisciplinaryClear() {
      this.employeeDisciplinaryModel = {
        id: '',
        offense_date: '',
        disciplinary_type_id: '',
        description: '',
        employee_id: this.employee.id,
        table_name: 'hr.employee_disciplinary'
      }
    },

    employeeDisciplinaryGet() {
      this.employeeDisciplinaryLoader = true

      let params = { employee_id: this.employee.id, is_deleted: false }
      this.axios.get(`/api/1.0/lov/hr.employee_disciplinary`, { params }) 
        .then(({data}) => {
          this.employeeDisciplinaryLoader = false
          data.sort((a, b) => { 
            return new Date(b.offense_date) - new Date(a.offense_date);
          });
          this.employeeDisciplinaryData = data
        })
        .catch((err) => {
          this.employeeDisciplinaryLoader = false
          console.log(err)
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: `Ошибка: ${err.data || err}`,
          });
        })
    },

    getEmployeeDisciplinaryTypeVal(ID) {
      return this.employeeDisciplinaryType.find(item => item.value == ID).text
    },

    employeeDisciplinaryEdit(data) {
      this.employeeDisciplinaryModel.id = data.id
      this.employeeDisciplinaryModel.offense_date = data.offense_date.split(' ')[0]
      this.employeeDisciplinaryModel.disciplinary_type_id = data.disciplinary_type_id
      this.employeeDisciplinaryModel.description = data.description
      this.employeeDisciplinaryModel.employee_id = this.employee.id
      this.employeeDisciplinaryDialog = true;
    },

    employeeDisciplinaryDelete(data) {
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
            await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_disciplinary', is_deleted: true })
            this.employeeDisciplinaryGet();
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

        employeeDisciplinarySave() {
      this.disableDoubleClick = true
      let err = []

      if(!this.employeeDisciplinaryModel.offense_date) {
        err.push('"Дата" обязателен для заполнения')
      }
      if(!this.employeeDisciplinaryModel.disciplinary_type_id) {
        err.push('"Вид" обязателен для заполнения')
      }
      if(!this.employeeDisciplinaryModel.description) {
        err.push('"Проступок" обязателен для заполнения')
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
      if (this.employeeDisciplinaryModel.id != '') { 
        method = 'put'
        url = `/api/1.0/lov/`+this.employeeDisciplinaryModel.id
      }

      this.axios[method](url, this.employeeDisciplinaryModel)
        .then(() => {
            this.employeeDisciplinaryDialog = false;
            this.employeeDisciplinaryGet();

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
          this.disableDoubleClick = false
        })
    },
  },
  created() {
    this.axios.get(`/api/1.0/lov/ref.disciplinary_type`)
      .then(({data}) => {
          this.employeeDisciplinaryType = data.reduce((acc, item) => {
              acc.push({
                  value: item.id,
                  text: item.name_rus
              })
          return acc
          }, [])
      })

          this.employeeDisciplinaryGet();
  },
  props: ['employee']
};
</script>