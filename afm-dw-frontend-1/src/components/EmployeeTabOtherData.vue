<template>
  <div>
    <!-- <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Прочие сведения</strong></div>
        <v-btn color="primary" outlined @click="employeeApartmentClear(); employeeApartmentDialog = true;" v-if="employee.is_edited_employee">
          <v-icon class="mr-2"> mdi-pencil </v-icon>
          Изменить
        </v-btn>
      </div>
      <v-col >
        <p>Категория: {{ employee.category_name }} </p>
        <p>Категория: {{ employee.category_name }} </p>
        <p>Категория: {{ employee.category_name }} </p>
        <p>Категория: {{ employee.category_name }} </p>
      </v-col>
    </v-row> -->

    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Недвижимость</strong></div>
        <v-btn color="primary" outlined @click="employeeApartmentClear(); employeeApartmentDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeApartmentDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeApartmentModel.id ? 'Редактировать недвижимость' : 'Добавить недвижимость'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="employeeApartmentType"
                      label="Вид недвижимости"
                      required
                      dense
                      v-model="employeeApartmentModel.employee_apartment_type_id"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Регистрационные данные"
                      required
                      dense
                      v-model="employeeApartmentModel.registration_data"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      outlined
                      label="Адрес"
                      dense
                      v-model="employeeApartmentModel.address"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeApartmentDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeApartmentSave">
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
          :loading="employeeApartmentLoader"
          :headers="employeeApartmentHeader"
          :items="employeeApartmentData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.employee_apartment_type_id`]="{ item }">
              <span>{{getEmployeeApartmentTypeVal(item.employee_apartment_type_id)}} </span>      
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeApartmentEdit(item)" v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="primary"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeApartmentDelete(item)" v-if="employee.is_edited_employee"
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
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Автотранспорт</strong> </div>
        <v-btn color="primary" outlined @click="employeeCarClear(); employeeCarDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeCarDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeCarModel.id ? 'Редактировать автотранспорт' : 'Добавить автотранспорт'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      label="Марка"
                      required
                      dense
                      v-model="employeeCarModel.brand"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Модель"
                      required
                      dense
                      v-model="employeeCarModel.model"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Гос.номер"
                      required
                      dense
                      v-model="employeeCarModel.vehicle_number"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Год выпуска"
                      type="number"
                      required
                      dense
                      v-model="employeeCarModel.issue_year"
                      >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeCarDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeCarSave">
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
          :loading="employeeCarLoader"
          :headers="employeeCarHeader"
          :items="employeeCarData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeCarEdit(item)" v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="primary"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeCarDelete(item)" v-if="employee.is_edited_employee"
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
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div> <strong>Оружие</strong></div>
        <v-btn color="primary" outlined @click="employeeWeaponClear(); employeeWeaponDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeWeaponDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeWeaponModel.id ? 'Редактировать оружие' : 'Добавить оружие'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      label="Вид оружия"
                      required
                      dense
                      v-model="employeeWeaponModel.weapon_type"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Номер"
                      required
                      dense
                      v-model="employeeWeaponModel.weapon_number"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Марка"
                      required
                      dense
                      v-model="employeeWeaponModel.brand"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Модель"
                      required
                      dense
                      v-model="employeeWeaponModel.model"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Подтверждающий документ"
                      required
                      dense
                      v-model="employeeWeaponModel.confirming_document"
                      >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeWeaponDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeWeaponSave">
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
          :loading="employeeWeaponLoader"
          :headers="employeeWeaponHeader"
          :items="employeeWeaponData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeWeaponEdit(item)" v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="primary"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeWeaponDelete(item)" v-if="employee.is_edited_employee"
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
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div> <strong>Финансовые обязательства</strong></div>
        <v-btn color="primary" outlined @click="employeeFnclObligationClear(); employeeFnclObligationDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeFnclObligationDialog" max-width="500px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeFnclObligationModel.id ? 'Редактировать финансовое обязательство' : 'Добавить финансовое обязательство'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="employeeFnclObligationType"
                      label="Тип обязательства"
                      required
                      dense
                      v-model="employeeFnclObligationModel.fncl_obligation_type_id"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Ежемесячная сумма выплат"
                      required
                      dense
                      type="number"
                      v-model="employeeFnclObligationModel.payment_amount"
                      >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeFnclObligationDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeFnclObligationSave">
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
          :loading="employeeFnclObligationLoader"
          :headers="employeeFnclObligationHeader"
          :items="employeeFnclObligationData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.fncl_obligation_type_id`]="{ item }">
              <span>{{getEmployeeFnclObligationTypeVal(item.fncl_obligation_type_id)}} </span>      
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeFnclObligationEdit(item)" v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="primary"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeFnclObligationDelete(item)" v-if="employee.is_edited_employee"
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
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div> <strong>Выезд за границу</strong></div>
        <v-btn color="primary" outlined @click="employeeAbroadInfoClear(); employeeAbroadInfoDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeAbroadInfoDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeAbroadInfoModel.id ? 'Редактировать данные выезда за границу' : 'Добавить данные выезда за границу'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      label="Год выезда"
                      required
                      dense
                      type="number"
                      v-model="employeeAbroadInfoModel.abroad_year"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      :items="employeeAbroadInfoCountry"
                      label="Страна"
                      dense
                      required
                      v-model="employeeAbroadInfoModel.country_id"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      outlined
                      dense
                      required
                      label="Цель выезда"
                      v-model="employeeAbroadInfoModel.departure_purpose"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeAbroadInfoDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeAbroadInfoSave">
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
          :loading="employeeAbroadInfoLoader"
          :headers="employeeAbroadInfoHeader"
          :items="employeeAbroadInfoData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.country_id`]="{ item }">
              <span>{{getEmployeeAbroadInfoCountryVal(item.country_id)}} </span>      
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeAbroadInfoEdit(item)" v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
              small
              color="primary"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeAbroadInfoDelete(item)" v-if="employee.is_edited_employee"
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
            employeeApartmentDialog: false,
            employeeApartmentData: [],
            employeeApartmentModel: {
              id: '',
              address: '',
              employee_apartment_type_id: '',
              registration_data: '',
              employee_id: this.employee.id,
              table_name: 'hr.employee_apartment'
            },
            employeeApartmentHeader: [
              { text: '', value: 'id', sortable: false },
              { text: 'Вид недвижимости', value: 'employee_apartment_type_id', sortable: false },
              { text: 'Регистрационные данные', value: 'registration_data', sortable: false },
              { text: 'Адрес', value: 'address', sortable: false },
              { text: '', value: 'action', sortable: false, width: '10%' }
            ],
            employeeApartmentType: [],
            employeeApartmentLoader: false,

            employeeCarDialog: false,
            employeeCarData: [],
            employeeCarModel: {
              id: '',
              brand : '',
              model: '',
              vehicle_number: '',
              issue_year: '',
              employee_id: this.employee.id,
              table_name: 'hr.employee_car'
            },
            employeeCarHeader: [
              { text: '', value: 'id', sortable: false },
              { text: 'Марка', value: 'brand', sortable: false },
              { text: 'Модель', value: 'model', sortable: false },
              { text: 'Гос.номер', value: 'vehicle_number', sortable: false },
              { text: 'Год выпуска', value: 'issue_year', sortable: false },
              { text: '', value: 'action', sortable: false, width: '10%' }
            ],
            employeeCarType: [],
            employeeCarLoader: false,

            employeeWeaponDialog: false,
            employeeWeaponData: [],
            employeeWeaponModel: {
              id: '',
              weapon_type: '',
              weapon_number: '',
              brand: '',
              model: '',
              confirming_document: '',
              employee_id: this.employee.id,
              table_name: 'hr.employee_weapon'
            },
            employeeWeaponHeader: [
              { text: '', value: 'id', sortable: false },
              { text: 'Вид оружия', value: 'weapon_type', sortable: false },
              { text: 'Номер', value: 'weapon_number', sortable: false },
              { text: 'Марка', value: 'brand', sortable: false },
              { text: 'Модель', value: 'model', sortable: false },
              { text: 'Подтверждающий документ', value: 'confirming_document', sortable: false },
              { text: '', value: 'action', sortable: false, width: '10%' }
            ],
            employeeWeaponType: [],
            employeeWeaponLoader: false,

            employeeFnclObligationDialog: false,
            employeeFnclObligationData: [],
            employeeFnclObligationModel: {
              id: '',
              fncl_obligation_type_id: '',
              payment_amount: '',
              employee_id: this.employee.id,
              table_name: 'hr.employee_fncl_obligation'
            },
            employeeFnclObligationHeader: [
              { text: '', value: 'id', sortable: false },
              { text: 'Тип обязательства', value: 'fncl_obligation_type_id', sortable: false },
              { text: 'Ежемесячная сумма выплат', value: 'payment_amount', sortable: false },
              { text: '', value: 'action', sortable: false, width: '10%' }
            ],
            employeeFnclObligationType: [],
            employeeFnclObligationLoader: false,

            employeeAbroadInfoDialog: false,
            employeeAbroadInfoData: [],
            employeeAbroadInfoModel: {
              id: '',
              abroad_year: '',
              country_id: '',
              departure_purpose: '',
              employee_id: this.employee.id,
              table_name: 'hr.employee_abroad_info'
            },
            employeeAbroadInfoHeader: [
              { text: '', value: 'id', sortable: false },
              { text: 'Год выезда', value: 'abroad_year', sortable: false },
              { text: 'Страна', value: 'country_id', sortable: false },
              { text: 'Цель выезда', value: 'departure_purpose', sortable: false },
              { text: '', value: 'action', sortable: false, width: '10%' }
            ],
            employeeAbroadInfoCountry: [],
            employeeAbroadInfoLoader: false,
        }
    },
    computed: {
      is_active_candidate_request: { 
        get() { return this.$store.state.employee.is_active_candidate_request },
        set(value) { this.$store.commit('setIsActiveCandidateRequest', value) }
      }
    },
    methods: {
      employeeApartmentClear() {
        this.employeeApartmentModel = {
          id: '',
          address: '',
          employee_apartment_type_id: '',
          registration_data: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_apartment'
        }
      },

      employeeApartmentGet() {
        this.employeeApartmentLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_apartment`, { params }) 
          .then(({data}) => {
            this.employeeApartmentLoader = false
            this.employeeApartmentData = data
          })
          .catch((err) => {
            this.employeeApartmentLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      getEmployeeApartmentTypeVal(ID) {
        return this.employeeApartmentType.find(item => item.value == ID).text
      },

      employeeApartmentEdit(data) {
        this.employeeApartmentModel.id = data.id
        this.employeeApartmentModel.address = data.address
        this.employeeApartmentModel.registration_data = data.registration_data
        this.employeeApartmentModel.employee_apartment_type_id = data.employee_apartment_type_id

        this.employeeApartmentDialog = true;
      },

      employeeApartmentDelete(data) {
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
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_apartment', is_deleted: true })
              this.employeeApartmentGet();
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

            employeeApartmentSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeApartmentModel.employee_apartment_type_id) {
          err.push('"Вид недвижимости" обязателен для заполнения')
        }
        if(!this.employeeApartmentModel.registration_data) {
          err.push('"Регистрационные данные" обязателен для заполнения')
        }
        if(!this.employeeApartmentModel.address) {
          err.push('"Адрес" обязателен для заполнения')
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
        if (this.employeeApartmentModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeApartmentModel.id
        }

        this.axios[method](url, this.employeeApartmentModel)
          .then(() => {
              this.employeeApartmentDialog = false;
              this.employeeApartmentGet();

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

      employeeCarClear() {
        this.employeeCarModel = {
          id: '',
          brand: '',
          model: '',
          vehicle_number: '',
          issue_year: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_car'
        }
      },

      employeeCarGet() {
        this.employeeCarLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_car`, { params }) 
          .then(({data}) => {
            this.employeeCarLoader = false
            this.employeeCarData = data
          })
          .catch((err) => {
            this.employeeCarLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      employeeCarEdit(data) {
        this.employeeCarModel.id = data.id
        this.employeeCarModel.brand = data.brand
        this.employeeCarModel.model = data.model
        this.employeeCarModel.vehicle_number = data.vehicle_number
        this.employeeCarModel.issue_year = data.issue_year

        this.employeeCarDialog = true;
      },

      employeeCarDelete(data) {
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
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_car', is_deleted: true })
              this.employeeCarGet();
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

            employeeCarSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeCarModel.brand) {
          err.push('"Марка" обязателен для заполнения')
        }
        if(!this.employeeCarModel.model) {
          err.push('"Модель" обязателен для заполнения')
        }
        if(!this.employeeCarModel.vehicle_number) {
          err.push('"Гос.номер" обязателен для заполнения')
        }
        if(!this.employeeCarModel.issue_year) {
          err.push('"Год выпуска" обязателен для заполнения')
        }
        if(err.length) {
          this.disableDoubleClick = false
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: err.join('; <br>'),
          });
        }

                if(this.employeeCarModel.issue_year < 1950 || this.employeeCarModel.issue_year > 2050) {
          err.push('Некорректно указан "Год выпуска"')
        }
        if(err.length) {
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: err.join('; <br>'),
          });
        }

        let method = 'post'
        let url = `/api/1.0/lov`
        if (this.employeeCarModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeCarModel.id
        }

        this.axios[method](url, this.employeeCarModel)
          .then(() => {
              this.employeeCarDialog = false;
              this.employeeCarGet();

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

      employeeWeaponClear() {
        this.employeeWeaponModel = {
          id: '',
          weapon_type: '',
          weapon_number: '',
          brand: '',
          model: '',
          confirming_document: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_weapon'
        }
      },

      employeeWeaponGet() {
        this.employeeWeaponLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_weapon`, { params }) 
          .then(({data}) => {
            this.employeeWeaponLoader = false
            this.employeeWeaponData = data
          })
          .catch((err) => {
            this.employeeWeaponLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      employeeWeaponEdit(data) {
        this.employeeWeaponModel.id = data.id
        this.employeeWeaponModel.weapon_type = data.weapon_type
        this.employeeWeaponModel.weapon_number = data.weapon_number
        this.employeeWeaponModel.brand = data.brand
        this.employeeWeaponModel.model = data.model
        this.employeeWeaponModel.confirming_document = data.confirming_document

        this.employeeWeaponDialog = true;
      },

      employeeWeaponDelete(data) {
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
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_weapon', is_deleted: true })
              this.employeeWeaponGet();
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

            employeeWeaponSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeWeaponModel.weapon_type) {
          err.push('"Вид оружия" обязателен для заполнения')
        }
        if(!this.employeeWeaponModel.weapon_number) {
          err.push('"Номер" обязателен для заполнения')
        }
        if(!this.employeeWeaponModel.brand) {
          err.push('"Марка" обязателен для заполнения')
        }
        if(!this.employeeWeaponModel.model) {
          err.push('"Модель" обязателен для заполнения')
        }
        if(!this.employeeWeaponModel.confirming_document) {
          err.push('"Подтверждающий документ" обязателен для заполнения')
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
        if (this.employeeWeaponModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeWeaponModel.id
        }

        this.axios[method](url, this.employeeWeaponModel)
          .then(() => {
              this.employeeWeaponDialog = false;
              this.employeeWeaponGet();

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

      employeeFnclObligationClear() {
        this.employeeFnclObligationModel = {
          id: '',
          fncl_obligation_type_id: '',
          payment_amount: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_fncl_obligation'
        }
      },

      employeeFnclObligationGet() {
        this.employeeFnclObligationLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_fncl_obligation`, { params }) 
          .then(({data}) => {
            this.employeeFnclObligationLoader = false
            this.employeeFnclObligationData = data
          })
          .catch((err) => {
            this.employeeFnclObligationLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      getEmployeeFnclObligationTypeVal(ID) {
        return this.employeeFnclObligationType.find(item => item.value == ID).text
      },

      employeeFnclObligationEdit(data) {
        this.employeeFnclObligationModel.id = data.id
        this.employeeFnclObligationModel.payment_amount = data.payment_amount
        this.employeeFnclObligationModel.fncl_obligation_type_id = data.fncl_obligation_type_id

        this.employeeFnclObligationDialog = true;
      },

      employeeFnclObligationDelete(data) {
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
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_fncl_obligation', is_deleted: true })
              this.employeeFnclObligationGet();
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

            employeeFnclObligationSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeFnclObligationModel.fncl_obligation_type_id) {
          err.push('"Тип обязательства" обязателен для заполнения')
        }
        if(!this.employeeFnclObligationModel.payment_amount) {
          err.push('"Ежемесячная сумма выплат" обязателен для заполнения')
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
        if (this.employeeFnclObligationModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeFnclObligationModel.id
        }

        this.axios[method](url, this.employeeFnclObligationModel)
          .then(() => {
              this.employeeFnclObligationDialog = false;
              this.employeeFnclObligationGet();

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

      employeeAbroadInfoClear() {
        this.employeeAbroadInfoModel = {
          id: '',
          abroad_year: '',
          country_id: '',
          departure_purpose: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_abroad_info'
        }
      },

      employeeAbroadInfoGet() {
        this.employeeAbroadInfoLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_abroad_info`, { params }) 
          .then(({data}) => {
            this.employeeAbroadInfoLoader = false
            data.sort((a, b) => { 
              return b.abroad_year - a.abroad_year;
            });
            this.employeeAbroadInfoData = data
          })
          .catch((err) => {
            this.employeeAbroadInfoLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      getEmployeeAbroadInfoCountryVal(ID) {
        return this.employeeAbroadInfoCountry.find(item => item.value == ID).text
      },

      employeeAbroadInfoEdit(data) {
        this.employeeAbroadInfoModel.id = data.id
        this.employeeAbroadInfoModel.abroad_year = data.abroad_year
        this.employeeAbroadInfoModel.country_id = data.country_id
        this.employeeAbroadInfoModel.departure_purpose = data.departure_purpose

        this.employeeAbroadInfoDialog = true;
      },

      employeeAbroadInfoDelete(data) {
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
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_abroad_info', is_deleted: true })
              this.employeeAbroadInfoGet();
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

            employeeAbroadInfoSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeAbroadInfoModel.abroad_year) {
          err.push('"Год выезда" обязателен для заполнения')
        }
        if(!this.employeeAbroadInfoModel.country_id) {
          err.push('"Страна" обязателен для заполнения')
        }
        if(!this.employeeAbroadInfoModel.departure_purpose) {
          err.push('"Цель выезда" обязателен для заполнения')
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
        if (this.employeeAbroadInfoModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeAbroadInfoModel.id
        }

        this.axios[method](url, this.employeeAbroadInfoModel)
          .then(() => {
              this.employeeAbroadInfoDialog = false;
              this.employeeAbroadInfoGet();

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
      await this.axios.get(`/api/1.0/lov/ref.employee_apartment_type`)
        .then(({data}) => {
            this.employeeApartmentType = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name_rus
                })
            return acc
            }, [])
        })

      await this.axios.get(`/api/1.0/lov/ref.fncl_obligation_type`)
        .then(({data}) => {
            this.employeeFnclObligationType = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name_rus
                })
            return acc
            }, [])
        })

      await this.axios.get(`/api/1.0/lov/ref.country`)
        .then(({data}) => {
            this.employeeAbroadInfoCountry = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name_rus
                })
            return acc
            }, [])
        })

        this.employeeApartmentGet()
        this.employeeCarGet()
        this.employeeWeaponGet()
        this.employeeFnclObligationGet()
        this.employeeAbroadInfoGet()
    },
    props: ['employee']
}
</script>