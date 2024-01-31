<template>
  <div>
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Родственники</strong></div>
        <v-btn color="primary" outlined @click="employeeRelationClear(); employeeRelationDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeRelationDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeRelationModel.id ? 'Редактировать родственника' : 'Добавить родственника'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="employeeRelationType"
                      label="Кем приходится"
                      required
                      dense
                      v-model="employeeRelationModel.employee_relation_type_id"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Фамилия"
                      required
                      dense
                      v-model="employeeRelationModel.last_name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Имя"
                      required
                      dense
                      v-model="employeeRelationModel.first_name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Отчество"
                      dense
                      v-model="employeeRelationModel.middle_name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Место проживания"
                      required
                      dense
                      v-model="employeeRelationModel.live_place"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Должность"
                      required
                      dense
                      v-model="employeeRelationModel.position"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      label="Место работы"
                      required
                      dense
                      v-model="employeeRelationModel.work_place"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-checkbox
                      v-model="employeeRelationModel.is_worked_law"
                      label="Работал в правоохранительных органах?"
                      dense
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" v-if="employeeRelationModel.is_worked_law">
                    <v-checkbox
                      v-model="employeeRelationModel.is_active_work_law"
                      label="Работает сейчас?"
                      dense
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="4" v-if="employeeRelationModel.is_worked_law">
                    <v-text-field
                      label="Должность в прав."
                      v-model="employeeRelationModel.law_position"
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="8" v-if="employeeRelationModel.is_worked_law">
                    <v-text-field
                      label="Правоохранительный орган"
                      v-model="employeeRelationModel.law_agency"
                      dense
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeRelationDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeRelationSave">
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
          :loading="employeeRelationLoader"
          :headers="employeeRelationHeader"
          :items="employeeRelationData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.employee_relation_type_id`]="{ item }">
            <span>{{getEmployeeRelationTypeVal(item.employee_relation_type_id)}} </span>      
          </template>
          <template v-slot:[`item.full_name`]="{ item }">
            <span>{{ item.last_name + ' ' + item.first_name + (item.middle_name ? ' ' + item.middle_name : '') }} </span>      
          </template>
          <template v-slot:[`item.is_worked_law`]="{ item }">
            <span>{{ item.is_worked_law ? 'Да' : 'Нет' }} </span>      
          </template>
          <template v-slot:[`item.is_active_work_law`]="{ item }">
            <span>{{ item.is_worked_law ? (item.is_active_work_law ? 'Да' : 'Нет') : '' }} </span>      
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeRelationEdit(item)" v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="primary"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeRelationDelete(item)" v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="red"
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
export default {
  components: {
  },
    data: function() {
        return {

            disableDoubleClick: false,
            employeeRelationDialog: false,
            employeeRelationData: [],
            employeeRelationModel: {
              id: '',
              employee_relation_type_id: '',
              last_name: '',
              first_name: '',
              middle_name: '',
              live_place: '',
              position: '',
              work_place: '',
              is_worked_law: '',
              is_active_work_law: '',
              law_position: '',
              law_agency: '',
              employee_id: this.employee.id,
              table_name: 'hr.employee_relation'
            },
            employeeRelationHeader: [
              { text: '', value: 'id', sortable: false },
              { text: 'Кем приходится', value: 'employee_relation_type_id', sortable: false },
              { text: 'ФИО', value: 'full_name', sortable: false },
              { text: 'Место проживания', value: 'live_place', sortable: false },
              { text: 'Должность', value: 'position', sortable: false },
              { text: 'Место работы', value: 'work_place', sortable: false },
              { text: 'Работал ли в правоохранительных органах', value: 'is_worked_law', sortable: false },
              { text: 'Все еще работает?', value: 'is_active_work_law', sortable: false },
              { text: 'Должность в прав.', value: 'law_position', sortable: false },
              { text: 'Правоохранительный орган', value: 'law_agency', sortable: false },
              { text: '', value: 'action', sortable: false, width: '10%' }
            ],
            employeeRelationType: [],
            employeeRelationLoader: false,
        }
    },
    computed: {
      is_active_candidate_request: { 
        get() { return this.$store.state.employee.is_active_candidate_request },
        set(value) { this.$store.commit('setIsActiveCandidateRequest', value) }
      }
    },
    methods: {
      employeeRelationClear() {
        this.employeeRelationModel = {
          id: '',
          employee_relation_type_id: '',
          last_name: '',
          first_name: '',
          middle_name: '',
          live_place: '',
          position: '',
          work_place: '',
          is_worked_law: false,
          is_active_work_law: false,
          law_position: '',
          law_agency: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_relation'
        }
      },

      employeeRelationGet() {
        this.employeeRelationLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_relation`, { params }) 
          .then(({data}) => {
            this.employeeRelationLoader = false
            this.employeeRelationData = data
          })
          .catch((err) => {
            this.employeeRelationLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      getEmployeeRelationTypeVal(ID) {
        return this.employeeRelationType.find(item => item.value == ID).text
      },

      employeeRelationEdit(data) {
        this.employeeRelationModel.id = data.id
        this.employeeRelationModel.employee_relation_type_id = data.employee_relation_type_id
        this.employeeRelationModel.last_name = data.last_name
        this.employeeRelationModel.first_name = data.first_name
        this.employeeRelationModel.middle_name = data.middle_name
        this.employeeRelationModel.live_place = data.live_place
        this.employeeRelationModel.position = data.position
        this.employeeRelationModel.work_place = data.work_place
        this.employeeRelationModel.is_worked_law = data.is_worked_law
        this.employeeRelationModel.is_active_work_law = data.is_active_work_law
        this.employeeRelationModel.law_position = data.law_position
        this.employeeRelationModel.law_agency = data.law_agency

        this.employeeRelationDialog = true;
      },

      employeeRelationDelete(data) {
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
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_relation', is_deleted: true })
              this.employeeRelationGet();
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

            employeeRelationSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeRelationModel.employee_relation_type_id) {
          err.push('"Кем приходится" обязателен для заполнения')
        }
        if(!this.employeeRelationModel.last_name) {
          err.push('"Фамилия" обязателен для заполнения')
        }
        if(!this.employeeRelationModel.first_name) {
          err.push('"Имя" обязателен для заполнения')
        }
        if(!this.employeeRelationModel.live_place) {
          err.push('"Место проживания" обязателен для заполнения')
        }
        if(!this.employeeRelationModel.position) {
          err.push('"Должность" обязателен для заполнения')
        }
        if(!this.employeeRelationModel.work_place) {
          err.push('"Место работы" обязателен для заполнения')
        }
        if(this.employeeRelationModel.is_worked_law) {

          if(!this.employeeRelationModel.law_position) {
            err.push('"Должность" обязателен для заполнения')
          }
          if(!this.employeeRelationModel.law_agency) {
            err.push('"Правоохранительный орган" обязателен для заполнения')
          }
        }

                if(err.length) {
          this.disableDoubleClick = false
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: err.join('; <br>'),
          });
        }

                if(!this.employeeRelationModel.is_worked_law) {
          this.employeeRelationModel.is_active_work_law = false
          this.employeeRelationModel.law_position = ''
          this.employeeRelationModel.law_agency = ''
        }

        this.employeeRelationModel.last_name = this.employeeRelationModel.last_name.charAt(0).toUpperCase() + this.employeeRelationModel.last_name.slice(1)
        this.employeeRelationModel.first_name = this.employeeRelationModel.first_name.charAt(0).toUpperCase() + this.employeeRelationModel.first_name.slice(1)
        this.employeeRelationModel.middle_name = this.employeeRelationModel.middle_name.charAt(0).toUpperCase() + this.employeeRelationModel.middle_name.slice(1)

        let method = 'post'
        let url = `/api/1.0/lov`
        if (this.employeeRelationModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeRelationModel.id
        }

        this.axios[method](url, this.employeeRelationModel)
          .then(() => {
              this.employeeRelationDialog = false;
              this.employeeRelationGet();

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
    async created() {
      await this.axios.get(`/api/1.0/lov/ref.employee_relation_type`)
        .then(({data}) => {
            this.employeeRelationType = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name_rus
                })
            return acc
            }, [])
        })

      this.employeeRelationGet()
    },
    props: ['employee']
}
</script>