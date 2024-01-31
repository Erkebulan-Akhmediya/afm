<template>
<div>
  <v-data-table
    
    :hide-default-header="true"
    :headers="headers"
    :items="tableData"
    :items-per-page="employeeTable && employeeTable.length"
    hide-default-footer
    disable-pagination
    :loading="loader"
    class="clickableTable"
    :no-data-text="'Нет данных о сотрудниках этой организации'"
    @click:row="goToEmployee"
    :footer-props="{
      itemsPerPageText: $t('globalWords.itemsPerPage'),
    }"
  >
    <template v-slot:[`item.avatar`]="{ item }">
      <v-avatar color="#fff" class="employees_table-avatar">
        <img
          style="object-fit: cover; height: 30px; width: 27px;"
          :src="item.src">
        <div v-if="item && item.acsdata" :class="[`blink`, item.acsdata.is_error ? `gray` : item.acsdata.is_violator ? `red` : `green`]"></div>
      </v-avatar>
    </template>

    <template v-slot:[`item.email`]="{ item }">
      <span>
        {{item.contacts.filter(current => current.contact_info_type_id == 5).length ? item.contacts.filter(current => current.contact_info_type_id == 5)[0].contact : ''}}
      </span>
    </template>

    <template v-slot:[`item.day`]="{ item }">
      <span>
        {{item.employee_birth_date ? moment(item.employee_birth_date).format('D MMMM') : ''}}
      </span>
    </template>

    <!--Рабочий телефон если по коду департамента financial - доступен по правилу доступа employeeDataAccess, иначе отображается для всех (исключение по коду департамента financial для зам рук деп, рук деп, зам рук упр и рук упр)-->
    <template v-slot:[`item.phone_job`]="{ item }">
      <span>
        {{ (/РУК.*ДЕП/.test(item.position_name && item.position_name.toUpperCase()) || /РУК.*УПР/.test(item.position_name && item.position_name.toUpperCase())) ? (item.contacts.filter(current => current.contact_info_type_id == 3).length ? item.contacts.filter(current => current.contact_info_type_id == 3)[0].contact : '') : (item.department_code == 'financial' ? (item.employeeDataAccess ? (item.contacts.filter(current => current.contact_info_type_id == 3).length ? item.contacts.filter(current => current.contact_info_type_id == 3)[0].contact : '') : '') : (item.contacts.filter(current => current.contact_info_type_id == 3).length ? item.contacts.filter(current => current.contact_info_type_id == 3)[0].contact : '')) }}
      </span>
    </template>

    <!--Сотовый телефон доступен только по правилу доступа checkEmployeeDataAccess-->
    <template v-slot:[`item.phone_mobile`]="{ item }">
      <span>
        {{ item.employeeDataAccess ? (item.contacts.filter(current => current.contact_info_type_id == 4).length ? item.contacts.filter(current => current.contact_info_type_id == 4)[0].contact : '') : ''}}
      </span>
    </template>
    
    <template v-slot:[`item.name`]="{ item }">
      <span class="bold" :class="`scrollEmp${item.id}`"  :ref="`scrollEmp${item.id}`">
        {{item.last_name}} {{item.first_name}} {{item.middle_name!='null'?item.middle_name:''}}
      </span>
    </template>
  </v-data-table>

</div>
</template>
<script>
import moment from 'moment'
import checkEmployeeDataAccess from "@/utils/check_employee_data_access";

  export default {
    data () {
      return {
        moment,
        headers: [
          {
            text: '',
            sortable: false,
            value: 'avatar',
          },
          {
            text: 'ФИО',
            value: 'name',
            sortBy: 'last_name_rus'
          },
          { text: 'email', value: 'email' },
          { text: 'phone', value: 'phone_job' },
          { text: 'phone', value: 'phone_mobile' },
          { text: 'date', value: 'day' },
          { text: 'Должность', value: 'position_name' },
        ],
        tableData: [],
        loader: true
      }
    },
    methods: {
      getColor (calories) {
        if (calories > 400) return 'red'
        else if (calories > 200) return 'orange'
        else return 'green'
      },
      goToEmployee (data){
        let cryptoid = ""
        do
        {
          cryptoid = this.$crypto(String(data.id))
        }while (cryptoid.includes('//'))
        this.$router.push('/employees/' + cryptoid);
      },
      goto(refName) {
          var element = this.$refs[refName];
          if(element) {
            element.scrollIntoView({behavior: "smooth", block: "center"});
          }
      },
    },

    created() {
        let url = `/api/1.0/department/:id`
        let localParams = {
          id: this.employeeTable
        }
        this.axios.get(url, {localParams})
        .then(data => {
            if(data) {
              for(let el of data.data.employees) {
                el.employeeDataAccess = checkEmployeeDataAccess(this.$userData, el)
              }
              this.tableData = data.data.employees
              this.tableData.map(async item => {
                if (!item.src) {
                  let src = await this.$getVuexStoreFile(item.id, 1)
                  this.$set(item, 'src', src ? src : require('@/assets/img/default_employee.png'))
                }
              })
            }
        }).finally (() => {
          this.loader = false
        })
    },
    props: ['employeeTable'],
  }
</script>

<style lang="scss" >
.bold {
  font-weight: bold;
}
.clickableTable tr {
  cursor: pointer;
}

.v-expansion-panel--active {
  box-shadow: 6px 0px 18px rgba(0, 0, 0, 0.1);
}

.v-expansion-panel--active .v-expansion-panel-header--active {
  color: #109CF1;
}

.blink {
    display: inline-block;
    width: 10px;
    height: 10px;
    color: #fff;
    font-family: "Roboto Slab", serif;
    font-size: 40px;
    font-weight: 700;
    letter-spacing: 2px;
    border-radius: 50%;
    position: absolute;
    top: 59%;
    right: 4px;

    &.red {
      background-color: rgb(255, 0, 0);
    }
    &.green {
      background-color: rgb(2, 180, 76) !important;
    }
    &.gray {
      background-color: #808080 !important;
    }
  }
  .blink {
    animation-name: blinker;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(1, 2, 0, 1);
    animation-duration: 1s;
    -webkit-animation-name: blinker;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: cubic-bezier(1, 2, 0, 1);
    -webkit-animation-duration: 1s;
  }

  @keyframes blinker {
    from {
      background-color: rgb(150, 0, 0);
    }
    to {
      background-color: rgb(255, 0, 0);
    }
  }

  @-webkit-keyframes blinker {
    from {
      background-color: rgb(150, 0, 0);
    }
    to {
      background-color: rgb(255, 0, 0);
    }
  }
</style>