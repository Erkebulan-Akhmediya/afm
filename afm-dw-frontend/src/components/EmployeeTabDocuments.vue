<template>
  <div>
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Заключения</strong></div>
        <v-btn color="primary" outlined @click="employeeConclusiveDataClear(); employeeConclusiveDataDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeConclusiveDataDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeConclusiveDataModel.id ? 'Редактировать заключение' : 'Добавить заключение'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="employeeConclusiveDataType"
                      label="Тип"
                      required
                      dense
                      v-model="employeeConclusiveDataModel.conclusive_data_type_id"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      outlined
                      label="Заключение"
                      dense
                      v-model="employeeConclusiveDataModel.description"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeConclusiveDataDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeConclusiveDataSave">
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
          :loading="employeeConclusiveDataLoader"
          :headers="employeeConclusiveDataHeader"
          :items="employeeConclusiveDataData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.conclusive_data_type_id`]="{ item }">
              <span>{{getEmployeeConclusiveDataTypeVal(item.conclusive_data_type_id)}} </span>      
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeConclusiveDataEdit(item)" v-if="employee.is_edited_employee"
              small
              color="primary"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeConclusiveDataDelete(item)" v-if="employee.is_edited_employee"
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

    {{ file }}
    <v-row>
      <v-col cols="12" md="3">
        <v-file-input
          :change="fileUpload()"
          :label="$t('globalWords.addFile')"
          dense
          outlined
          v-model="file"
          v-if="employee.is_edited_employee"
          :disabled="is_active_candidate_request"
        >
        </v-file-input>
        <!-- <v-btn @click="getDocuments()">загрузить</v-btn> -->
      </v-col>

      <!-- Документы -->
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-simple-table style="overflow-y: scroll; max-height: 200px">
          <template v-slot:default>
            <thead style="background-color: #eeeeee">
              <tr>
                <th class="text-left">№</th>
                <th class="text-left">Имя</th>
                <th class="text-left">Создатель</th>
                <th class="text-left">Дата добавления</th>
                <th class="text-left"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in files" :key="item.id">
                <td>{{ item.file_id }}</td>
                <td
                  @click="downloadFile(item)"
                  style="color: #1976d2; cursor: pointer"
                >
                  {{ item.file_name }}
                </td>
                <td>
                  {{
                    item.last_name_rus
                      ? item.last_name_rus
                      : "" + " " + item.first_name_rus
                      ? item.first_name_rus
                      : ""
                  }}
                </td>
                <td>
                  {{
                    moment(new Date(item.create_date + "+0000")).format(
                      "DD.MM.YYYY HH:mm:ss"
                    )
                  }}
                </td>

                <td>
                  <v-btn
                    @click="deleteFile(item)"
                    icon
                    class="ma-2"
                    color="red"
                    v-if="employee.is_edited_employee"
                    :disabled="is_active_candidate_request"
                  >
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import moment from "moment";
export default {
  data: () => ({
    file: null,
    files: [],
    moment,

    disableDoubleClick: false,
    employeeConclusiveDataDialog: false,
    employeeConclusiveDataData: [],
    employeeConclusiveDataModel: {
      id: '',
      conclusive_data_type_id: '',
      description: '',
      employee_id: '',
      table_name: 'hr.employee_conclusive_data'
    },
    employeeConclusiveDataHeader: [
      { text: '', value: 'id', sortable: false },
      { text: 'Тип', value: 'conclusive_data_type_id', sortable: false },
      { text: 'Заключение', value: 'description', sortable: false },
      { text: '', value: 'action', sortable: false, width: '10%' }
    ],
    employeeConclusiveDataType: [],
    employeeConclusiveDataLoader: false,
  }),
  computed: {
    is_active_candidate_request: { 
      get() { return this.$store.state.employee.is_active_candidate_request },
      set(value) { this.$store.commit('setIsActiveCandidateRequest', value) }
    }
  },
  methods: {
    employeeConclusiveDataClear() {
      this.employeeConclusiveDataModel = {
        id: '',
        conclusive_data_type_id: '',
        description: '',
        employee_id: this.employee.id,
        table_name: 'hr.employee_conclusive_data'
      }
    },

    employeeConclusiveDataGet() {
      this.employeeConclusiveDataLoader = true

      let params = { employee_id: this.employee.id, is_deleted: false }
      this.axios.get(`/api/1.0/lov/hr.employee_conclusive_data`, { params }) 
        .then(({data}) => {
          this.employeeConclusiveDataLoader = false
          this.employeeConclusiveDataData = data
        })
        .catch((err) => {
          this.employeeConclusiveDataLoader = false
          console.log(err)
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: `Ошибка: ${err.data || err}`,
          });
        })
    },

    getEmployeeConclusiveDataTypeVal(ID) {
      return this.employeeConclusiveDataType.find(item => item.value == ID).text
    },

    employeeConclusiveDataEdit(data) {
      this.employeeConclusiveDataModel.id = data.id
      this.employeeConclusiveDataModel.conclusive_data_type_id = data.conclusive_data_type_id
      this.employeeConclusiveDataModel.description = data.description
      this.employeeConclusiveDataModel.employee_id = this.employee.id
      this.employeeConclusiveDataDialog = true;
    },

    employeeConclusiveDataDelete(data) {
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
            await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_conclusive_data', is_deleted: true })
            this.employeeConclusiveDataGet();
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

        employeeConclusiveDataSave() {
      this.disableDoubleClick = true
      let err = []

      if(!this.employeeConclusiveDataModel.conclusive_data_type_id) {
        err.push('"Тип" обязателен для заполнения')
      }
      if(!this.employeeConclusiveDataModel.description) {
        err.push('"Заключение" обязателен для заполнения')
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
      if (this.employeeConclusiveDataModel.id != '') { 
        method = 'put'
        url = `/api/1.0/lov/`+this.employeeConclusiveDataModel.id
      }

      this.axios[method](url, this.employeeConclusiveDataModel)
        .then(() => {
            this.employeeConclusiveDataDialog = false;
            this.employeeConclusiveDataGet();

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

        downloadFile(item) {
      let config = {
        responseType: "blob",
        params: {
          id: item.file_id,
        },
      };
      this.axios.get(`/api/1.0/fileDownload`, config).then((response) => {
        let blob = new Blob([response.data], {
          type: "application/document",
        });
        const a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = item.file_name;
        a.click();
        a.remove();
      });
    },
    fileUpload: async function () {
      if (this.file) {
        const form = new FormData();
        form.append("file", this.file);
        form.append("fileType", "empdocument");
        form.append("file_type_id", 10);
        form.append("object_id", this.employee.id);
        await this.axios.post(`/api/1.0/candidate/file`, form);
        this.file = null;
        this.getDocuments();
      }
    },
    async getDocuments() {
      let locals = {
        object_id: this.employee.id,
      };
      let data = await this.axios.get("/api/1.0/candidate/file", {
        params: locals,
      });
      this.files = data.data;
    },
    async deleteFile(item) {
      try {
        await this.axios.put(`/api/1.0/file-disable/${item.file_id}`, {
          is_active: false,
        });
        this.getDocuments();

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: "Документ удален",
        });
      } catch (err) {
        console.error(err);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
        });
      }
    },
  },
  created() {
    this.axios.get(`/api/1.0/lov/ref.conclusive_data_type`)
      .then(({data}) => {
          this.employeeConclusiveDataType = data.reduce((acc, item) => {
              acc.push({
                  value: item.id,
                  text: item.name_rus
              })
          return acc
          }, [])
      })

          this.employeeConclusiveDataGet();
    this.getDocuments();
  },
  props: ['employee']
};
</script><style scoped>
th {
  padding-top: 10px !important;
}
</style>