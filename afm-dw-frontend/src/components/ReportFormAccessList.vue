<template>
  <div>
    <div class="d-flex justify-space-between">
      <span class="text-h4 mb-2">Список пользователей с доступом</span>
      <v-btn
        @click="dialog = true"
        >
        <v-icon>
          mdi-plus
        </v-icon>
      </v-btn>
    </div>
    <v-data-table
      class="clickableTable elevation-1 mb-4"
      :no-data-text="'Нет данных о формах'"
      :loading = "loading"
      :headers = "headers"
      :items = "access_list"
      >
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          class="ma-2"
          @click.stop="deleteItem(item)"
        >
          <v-icon color="red">mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" width="600px"> 
      <v-card>
        <v-card-title>
          <span class="text-h5">Выбор пользователя</span>
        </v-card-title>
        <v-card-text>
          <v-col v-if="!selectedEmployee" cols="12">
            <v-chip color="red">Пользователь не выбран</v-chip>
          </v-col>
          <v-col v-else cols="12">
            Выбран пользователь: {{ selectedEmployee.last_name }} {{ selectedEmployee.first_name }} {{ selectedEmployee.middle_name }}
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
        </v-card-text>
        <v-card-actions>
          <v-btn
            @click="closeDialog"
            color="error"
          >
            Отмена
          </v-btn>
          <v-spacer>
          </v-spacer>
          <v-btn
            color="success"
            :disabled="disableDoubleClick"
            @click="saveAccessEmployee"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      disableDoubleClick: false,
      searchEmployeeTable: [],
      searchEmployee: [],
      globalSearchVal: '',
      selectedEmployee: null,
      access_list: [],
      headers: [
        {text: 'Фамилия', value: 'last_name'},
        {text: 'Имя', value: 'first_name'},
        {text: 'Отчество', value: 'middle_name'},
        {text: 'Департамент', value: 'department_name'},
        {text: 'Организация', value: 'organization_name'},
        {text: '', value: 'action', align: 'end'}
      ],
      dialog: false,
      loading: false,
    }
  },
  watch: {
    async report_form_id() {
      this.loading = true
      await this.loadData()
      this.loading = false
    }
  },
  methods: {
    selectEmployee (data) {
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
    async deleteItem(item) {

      this.$swal({
        title: `Вы действительно хотите удалить доступ у пользователя?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) {

          await this.axios.delete(`/api/1.0/report_access_list/${item.id}`, {localParams: {}, params: {}})
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "success",
            title: "Доступ пользователя удален.",
          });

          this.loading = true
          await this.loadData()
          this.loading = false
        }
      });


    }, 
    async saveAccessEmployee() {
      if (!(this.selectedEmployee && this.selectedEmployee.id)) {

                this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: "Вы не выбрали пользователя.",
        });
        return
      }

      this.disableDoubleClick = true
      let params = {
        report_form_id: this.report_form_id, 
        access_user_id: this.selectedEmployee.id
      }

      await this.axios.post(`/api/1.0/report_access_list/`, params)

      this.$swal({
        ...this.$optionAlert.fire,
        icon: "success",
        title: "Сохранено",
      });
      this.closeDialog()
      this.disableDoubleClick = false
      this.loading = true
      await this.loadData()
      this.loading = false
    },
    closeDialog() {
      this.selectedEmployee = null
      this.dialog = false
    },
    async loadData() {
      let {data: list} = await this.axios.get(`/api/1.0/report_access_list/${this.report_form_id}`) 
      this.access_list = list
    },
  },
  async mounted() {
    await this.loadData()
  },
  props: ['report_form_id'],
}
</script>