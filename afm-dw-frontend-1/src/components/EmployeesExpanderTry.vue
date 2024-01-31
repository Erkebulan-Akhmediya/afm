<template>
    <div>
        <v-row>
            <v-col>
                <h2>СПРАВОЧНИК ПОДРАЗДЕЛЕНИЙ</h2>
            </v-col>
        </v-row>
        <v-row align="center">
            <v-col>
                <div class="rowExpander" v-for="item in testData" :key="item.id">
                    <div class="title rowExpander" @click.stop="isShow">
                        {{item.name_rus}}
                    </div>
                    <div v-for="childDepartment in item.department" class="rowExpander hide" :key="childDepartment.id" @click.stop="isShow">
                        <div class="title rowExpander">
                            {{childDepartment.name_rus}}
                        </div>
                        <div class="employees hide" >
                            <EmployeeTable :employeeTable="childDepartment.employee"
                            ></EmployeeTable>
                        </div>
                    </div>
                </div>
                <!-- <v-expansion-panels
                :accordion="accordion"
                :popout="popout"
                :inset="inset"
                :multiple="multiple"
                :focusable="focusable"
                :disabled="disabled"
                :readonly="readonly"
                :flat="flat"
                :hover="hover"
                :tile="tile"
                >
                <v-expansion-panel class="parent-department expander-reverse"
                    v-for="(item,i) in tableData"
                    :key="i"
                >
                    <v-expansion-panel-header v-if="item.department.length">{{item.name_rus}}</v-expansion-panel-header>
                    <v-expansion-panel-content v-if="item.department.length">
                        
                    <v-expansion-panels
                    :accordion="false"
                    :popout="popout"
                    :inset="inset"
                    :multiple="multiple"
                    :focusable="focusable"
                    :disabled="disabled"
                    :flat="true"
                    :hover="hover"
                    :tile="tile"
                    >
                        <v-expansion-panel
                        class="child-department"
                            v-for="(department,j) in item.department"
                            :key="j"
                        >
                            <v-expansion-panel-header class="child-department">{{department.name_rus}}</v-expansion-panel-header>
                            <v-expansion-panel-content> 
                                <EmployeeTable :employeeTable="department.employee"
                                ></EmployeeTable>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                </v-expansion-panels> -->
            </v-col>
        </v-row>
    </div>
</template>
<script>
  export default {
    data: () => ({
      accordion: true,
      popout: false,
      inset: false,
      multiple: false,
      disabled: false,
      readonly: false,
      focusable: false,
      flat: false,
      hover: false,
      tile: false,

      tableData: [],

      testData: [
            {
                name_rus: 'Руководство',
                department: [
                    {
                            name_rus: 'Руководство-child',
                            department: [

                                                            ]
                    }
                ],
            },
            {
              name_rus: 'Департаменты',
              department: [
                  {
                        name_rus: 'Департамент по работе с субъектами финансового мониторинга',
                        employee: [

                                                    ]
                  },
                  {
                        name_rus: 'Департамент финансового мониторинга',
                        employee: [

                                                    ]
                  },
                  {
                        name_rus: 'Следственный департамент',
                        employee: [
                            {
                                last_name_rus: 'Махметович',
                                middle_name_rus: 'Саят',
                                first_name_rus: 'Саукомбеков',
                                email: 's.saukombekov@afmrk.gov.kz',
                                personnel_number: '2350106',
                                phone: '7771231212',
                                date: '1 мая',
                                roleName: 'Руководитель',
                                avatar: 'employee1.png'
                            },
                            {
                                last_name_rus: '',
                                middle_name_rus: 'Ален',
                                first_name_rus: 'Куватов',
                                email: 'a.kuvatov@afmrk.gov.kz',
                                personnel_number: '2350106',
                                phone: '7771231212',
                                date: '3 сентября',
                                roleName: 'Главный менеджер',
                                avatar: 'employee2.png'
                            },
                            {
                                last_name_rus: '',
                                middle_name_rus: 'Алексей',
                                first_name_rus: 'Тихонов',
                                email: 'a.tihonov@afmrk.gov.kz',
                                personnel_number: '2350106',
                                phone: '7771231212',
                                date: '4 июля',
                                roleName: 'Главный специалист',
                                avatar: 'employee3.png'
                            }
                        ]
                  },
              ]
            }
      ]
    }),
    methods:{
        isShow(e) {
            if(!e.target.classList.contains('rowExpander')) return
            let arr = [...e.target.childNotes]

                        e.target.nextSibling.classList.toggle('show')
        },
        getDepartments: function() {
            this.axios.get('/api/1.0/department')
            .then((data) => {
                this.tableData = data.data
            })
        }
    },
    mounted: function(){
        this.$nextTick(this.getDepartments)
    }
  }
</script><style lang="scss" scoped>

h2 {
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.018em;
    text-transform: uppercase;
    color: #84919A;
}
.child-department {
    border-top: 1px solid rgba(229, 229, 229,0.6);
}
.child-department:first-child {
    border-top: none
}
.expander-reverse button .v-expansion-panel-header {
    display: flex;
    flex-direction: row-reverse;

}
.hide {
    display: none;
}
.show {
    display: block;
}
</style>