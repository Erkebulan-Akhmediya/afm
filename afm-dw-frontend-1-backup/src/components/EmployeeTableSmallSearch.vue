<template>
<div>
  <v-data-table
    :hide-default-header="!isAdmin"
    disable-sort
    :headers="headers"
    :items="employeeTable"
    :items-per-page="5"
    class="clickableTable"
    :no-data-text="'Нет данных о сотрудниках этой организации'"
    @click:row="selectEmployee"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
    @update:page="updatePagination"
  >
    <template v-slot:[`item.avatar`]="{}">
      <v-avatar color="red" size="30" class="employees_table-avatar">
        <img
          :src="require('@/assets/img/default_employee.png')">
      </v-avatar>
    </template>
    
    <template v-slot:[`item.name`]="{ item }">
      <span class="bold">
        {{item.last_name}} {{item.first_name}} {{item.middle_name}} 
      </span>
    </template>
    <template v-slot:[`item.role`]="{ item }">
        <div style="width: 250px; height: 50px; overflow-x: auto; padding-top: 10px">
          <v-chip
          @click:close="delRole(role)"
          append
          v-for="role in item.role_list" :key="role.id" class="text--primary mr-2 mb-1"
          >         

          {{role.role_name}}
          </v-chip>

        </div>
    </template>

    <template v-slot:[`item.actions`]="{ item }">
      <div style="width: 85px;">
        <v-btn icon style="background-color: #fff;" @click.stop="addEmployee(item)">
            <v-icon>
                mdi-plus
            </v-icon>
        </v-btn>
        <v-btn icon style="margin-left:10px; background-color: #fff;" @click.stop="changeEmployee(item)">
            <v-icon>
                mdi-pencil
            </v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
  
  <v-overlay :value="loader">
    <v-progress-circular
      indeterminate
      size="64"
    ></v-progress-circular>
  </v-overlay>

</div>
</template>
<script>
import moment from 'moment'
  export default {
    data () {
      return {
        moment,
        loader: false,
        nextPage: 0,
        headers: [
          { text: '', sortable: false, value: 'avatar', },
          { text: this.$t('administration.fullName'), value: 'name', },
          { text: this.$t('administration.position'), value: 'position_name' },
          { text: this.$t('administration.department'), value: 'department_name' },
        ],
        roles: []
      }
    },
    created() {
      this.axios.get(`/api/1.0/lov/ref.role`)
      .then(data => {
        this.roles = data.data.reduce((acc, item) => {
          acc.push({
            text: item.name,
            value: item.id
          })
          return acc
        }, [])
      })

      if (this.adminUsersForm) {
        this.headers = [
          { text: '', sortable: false, value: 'avatar', },
          { text: this.$t('administration.fullName'), value: 'name', },
          { text: 'Логин', value: 'username' },
          { text: this.$t('administration.position'), value: 'position_name' },
          { text: this.$t('administration.department'), value: 'department_name' },
        ]
      }
    },
    mounted() {
      if(this.isAdmin) {
        this.headers.push({
          text: this.$t('administration.viewPriority'), value: 'view_priority'
        })
        this.headers.push({
          text: '', value: 'actions'
        })
      }
    },

    props: ['employeeTable', 'isAdmin', 'globalSearch', 'adminUsersForm'],
    methods: {
      async changeRole(data) {
        this.loader = true
        let localParams = {
          id: data.id
        }
        await this.axios.put(`/api/1.0/user/:id`, {role_id: data.role_id}, {localParams})
        this.loader = false
      },

            getColor (calories) {
        if (calories > 400) return 'red'
        else if (calories > 200) return 'orange'
        else return 'green'
      },

      selectEmployee(data) {
        if(this.isAdmin) {
          return
        }
        this.$emit('clickOnRow', data)
      },

      addEmployee(data) {
        this.$emit('clickOnRow', data)
      },

      changeEmployee(data) {
        this.$emit('changeEmployee', data)
      },

      updatePagination (pagination) {
        if (pagination > this.nextPage && pagination != 1) {
            this.nextPage = pagination
            this.$emit('globalSearch')
          } 
        }
      },
      watch: {
        employeeTable(val) {
          if ([0, 6].includes(val.length)) {
            this.nextPage = 0;
          }
        }
      }
  }
</script><style lang="scss" >
.bold {
  font-weight: bold;
}
.clickableTable tr {
  cursor: pointer;
}
</style>