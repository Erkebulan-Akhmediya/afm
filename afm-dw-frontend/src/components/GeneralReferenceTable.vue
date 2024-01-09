<template>
    <div>
        <h2 class="mb-4">Выбрано: {{selected.length}}</h2>
        <v-data-table
        id="fullEmpTable"
        @click:row="goToEmployee"
        :headers="headers"
        :items="employees"
        :options.sync="options"
        :server-items-length="totalEmployees"
        :loading="loading"
        v-model="selected"
        :header-props="{mobile: true, everyItem: true}"
        class="elevation-1 allEmpTable"
        checkbox-color="#109CF1"
        :footer-props="{
          itemsPerPageText: $t('globalWords.itemsPerPage'),
        }"
        >
            <template v-slot:[`item.avatar`]="{ item }">
                <v-avatar  size="24" class="employees_table-avatar">
                <img
                    v-if="true"
                    :src="item.src || require('@/assets/img/default_employee.png')"
                    :alt="item.first_name + ' ' + item.last_name">
                    <!-- <span v-else class="white--text text-h5">CJ</span> -->
                </v-avatar>
            </template>
        
            <template v-slot:[`item.fio`]="{ item }">
                <span>
                    {{item.last_name}} {{item.first_name}} 
                </span>
            </template>

            <template v-slot:[`item.email`]="{ item }">
            <span>
                {{item.contacts.filter(current => current.contact_info_type_id == 5).length ? item.contacts.filter(current => current.contact_info_type_id == 5)[0].contact : ''}}
            </span>
            </template>

            <template v-slot:[`item.work_phone`]="{ item }">
            <span>
                {{item.contacts.filter(current => current.contact_info_type_id == 3).length ? item.contacts.filter(current => current.contact_info_type_id == 3)[0].contact : ''}}
            </span>
            </template>

            <template v-slot:[`item.mobile_phone`]="{ item }">
            <span>
                {{item.contacts.filter(current => [4].includes(current.contact_info_type_id)).length ? item.contacts.filter(current => [4].includes(current.contact_info_type_id))[0].contact : ''}}
            </span>
            </template>

            <template v-slot:[`item.birthday`]="{ item }">
            <span>
                {{item.employee_birth_date ? moment(item.employee_birth_date).format('DD MMMM') : ''}}
            </span>
            </template>

            <template v-slot:[`item.online`]="{ item }">
            <span>
                {{item.id > 100 ? (item.id + '').slice(2, 3) : item.id}} минут назад
            </span>
            </template>
        </v-data-table>
    </div>
</template>
<script>
import moment from 'moment'
  export default {
    data () {
      return {
        selected: [],
        moment,
        totalEmployees: 0,
        employees: [],
        loading: true,
        options: {},
        offset: 0,
        headers: [
          {
            text: '',
            align: 'end',
            sortable: false,
            value: 'avatar',
          },
          {
            text: 'Имя',
            align: 'start',
            sortable: false,
            value: 'fio',
          },
          {
            text: 'E-mail',
            align: 'start',
            sortable: false,
            value: 'email',
          },
          {
            text: 'Рабочий телефон',
            align: 'start',
            sortable: false,
            value: 'work_phone',
          },
          {
            text: 'Мобильный телефон',
            align: 'start',
            sortable: false,
            value: 'mobile_phone',
          },
          {
            text: 'Отдел',
            align: 'start',
            sortable: false,
            value: 'department_name',
          },
          {
            text: 'Должность',
            align: 'start',
            sortable: false,
            value: 'position_name',
          },
          {
            text: 'День рождения',
            align: 'start',
            sortable: false,
            value: 'birthday',
          },
        ],
      }
    },
    watch: {
      options: {
        handler () {
          this.getDataFromApi()
        },
        deep: true,
      },
      employees(val) {
        val.map(async item => {
          let src = await this.$getVuexStoreFile(item.id, 1);
          this.$set(item, 'src', src ? src : require('@/assets/img/default_employee.png'))
        })
      }
    },
    mounted () {
      this.getDataFromApi()
    },
    methods: {

              goToEmployee(data) {
            this.$emit('goToEmployee', data)
        }, 
        getDataFromApi () {
            this.loading = true
            this.apiCall().then(data => {
            this.employees = data.items
            this.totalEmployees = data.total
            this.loading = false
            })
      },
        apiCall () {
        return new Promise((resolve) => {
          const {page, itemsPerPage } = this.options
          this.offset = itemsPerPage * page - itemsPerPage

                    let params = {
            limit: itemsPerPage + 1,
            without_performers: true,
            offset: this.offset,
            text: this.text || ''
          }
          this.axios.get(`/api/1.0/employee`, {params})
          .then(data => {
              data.data = data.data.filter(i=>!i.is_edited_employee)
              let items = data.data

                            const total = items.length * page
              resolve({
                items,
                total,
              })
          })
        })
      },
    },
    props: ['text']
  }
</script><style lang="scss">
#fullEmpTable.elevation-1 thead {
    background-color: #109CF1;
    color: #fff !important;
}

#fullEmpTable.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    color: #fff;
}

#fullEmpTable.v-data-table thead .v-icon.notranslate.mdi.mdi-checkbox-marked.theme--light {
    color: #fff !important;
    caret-color: #fff !important;
}
</style>