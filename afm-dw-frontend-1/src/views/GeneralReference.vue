<template>
    <section id="general_refenrence">
        <v-container fluid>
            <v-row>
                <v-col cols="12">
                    <div style="display: flex; align-items: center;">
                        <span style="font-size: 12px;">Организация:</span> <Select
                        :options="['Все', 'Департаменты']"
                        :default="'Все'"
                        class="select"
                        />
                    </div>                
            </v-col>
            </v-row>
            <v-row style="max-width: 100%;">
                <v-col style="overflow: auto">
                    <GeneralReferenceTable @goToEmployee="goToEmployee" :text="text">
                    </GeneralReferenceTable>
                </v-col>
            </v-row>
            <!-- Старая таблица -->
            <!-- <v-row>
                <v-col cols="12">
                    <v-simple-table class="employees_table">
                        <template v-slot:default>
                            <tbody>
                                <tr class="employees_table-row">
                                    <td class="employees_table-row_count">
                                        <div class="selected-count">
                                            <span class="box-count">{{selected.length}}</span>
                                        </div>
                                        <span class="box-count-title">{{selected.length}} выбрано</span></td>
                                </tr>
                                <tr v-for="item in employee" :key="item.id" class="employees_table-row" @click="goToEmployee(item)">
                                    <v-container fluid>
                                        <div class="main-wrppaer">
                                            <v-row>
                                                <v-col cols="3 pa-0">
                                                <td class="employees_table-row__td">
                                                        <label class="checkbox-wraper">
                                                            <input type="checkbox" v-model="selected" :value="item.id">
                                                            <span class="checkmark"></span>
                                                        </label>
                                                        <v-avatar  size="24" class="employees_table-avatar">
                                                            <img
                                                                v-if="true"
                                                                :src="require('../assets/img/temp/employee1.png')"
                                                                :alt="item.first_name + ' ' + item.last_name">
                                                            </v-avatar><span class="name">{{ item.first_name + ' ' + item.last_name}}</span></td>
                                                </v-col>
                                                <v-col cols="1">
                                                    <td class="employees_table-row__td employees_table-row-text"><span class="row_span">{{item && item.contacts && item.contacts.length ? item.contacts[0].contact : ''}}</span></td>
                                                </v-col>
                                                <v-col cols="3">
                                                    <td class="employees_table-row__td employees_table-row-text"><span class="row_span">{{item.department_name}}</span></td>
                                                </v-col>
                                                <v-col cols="2">
                                                    <td class="employees_table-row__td employees_table-row-text"><span class="row_span">{{item.position_name}}</span></td>
                                                </v-col>
                                                <v-col cols="1">
                                                    <td class="employees_table-row__td employees_table-row-text"><span class="row_span">1 мая</span></td>
                                                </v-col>
                                                <v-col cols="2">
                                                    <td class="employees_table-row__td employees_table-row-text"><span class="row_span" style="margin-right: 1.5rem;">5 Минут назад</span></td>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-container>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-col>
            </v-row> -->
        </v-container>
        <v-overlay :value="loader">
          <v-progress-circular
            indeterminate
            size="64"
          ></v-progress-circular>
        </v-overlay>
    </section>
</template>
<script>

import Select from '@/components/SelectTitle.vue';

export default {
    components: {
        Select
    },
    props: {
        text: {
            type: String,
            default: null
        }
    },
    data () {
      return {
        loader:false,
        selected: [],
        employee: [],
      }
    },
    created() {
    },
    methods: {
        getEmployeeData(searchType = null) {
            if (!searchType && !this.text) {
                this.axios.get(`/api/1.0/employee`, {without_performers: true})
                    .then(({data}) => {
                        data = data.filter(i=>!i.is_edited_employee)
                        this.employee = data
                        this.loader = false
                    })
                    .catch(err => {
                        console.log(err)
                        this.loader = false
                    })
            } else {
                let params = {
                    without_performers: true,
                    text: this.text
                }
                this.axios.get(`/api/1.0/search`, {params})
                    .then(({data}) => {
                        data = data.filter(i=>!i.is_edited_employee)
                        this.employee = data
                        this.loader = false
                    })
                    .catch(err => {
                        console.log(err)
                        this.loader = false
                    }) 
            }
        },
        goToEmployee (data){
            this.$router.push({ path: `/employees/${this.$crypto(String(data.id))}` });
        },
    },
    watch: {
        text() {
            if (this.text) {
                this.getEmployeeData(true);
            } else {
                this.getEmployeeData(false);
            }
        }
    }
  }
</script><style lang="scss" scoped>
    #general_refenrence {

        .main-title {
            font-size: 12px;
            color: #6A707E;
            filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
        }


        .employees_table {
            .employees_table-row {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #EBEFF2;
                height: 4rem;
                .main-wrppaer {
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .employees_table-row_count {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    border: none;
                    .selected-count {
                        width: 16px;
                        height: 16px;
                        background: #109CF1;
                        border-radius: 4px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        .box-count {
                            color: #fff;
                            font-size: 9px;
                        }
                    }
                    .box-count-title {
                        margin-left: 2.5rem;
                        color: #334D6E;
                        font-size: 13px;
                    }
                }
                &:hover {
                    cursor: pointer;
                }
                .employees_table-avatar {
                    margin-right: .75rem;
                }
                .employees_table-row-text {
                    display: flex;
                    justify-content: flex-end;
                }
                .employees_table-row__td {
                    display: flex;
                    align-items: center;
                    border: none;
                    height: 100%;
                    .name {
                        font-size: 15px;
                        color: #323C47;
                    }
                    .row_span {
                        color: #707683;
                        font-size: 13px;
                    } 
                    .checkbox-wraper {
                        display: block;
                        position: relative;
                        padding-left: 3.5rem;
                        margin-bottom: 12px;
                        cursor: pointer;
                        font-size: 22px;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        margin-left: 1rem;
                        input {
                            position: absolute;
                            opacity: 0;
                            cursor: pointer;
                            height: 0;
                            width: 0;
                            &:checked ~ .checkmark {
                                background-color: #2196F3;
                                border: 2px solid #2196F3;
                            }
                        }
                        .checkmark {
                            position: absolute;
                            top: 0;
                            left: 0;
                            height: 1rem;
                            width: 1rem;
                            background: #fff;
                            border-radius: 4px;
                            border: 2px solid #d5d5d5;
                        }

                    }
                    .checkmark:after {
                        content: "";
                        position: absolute;
                        display: none;
                    }

                    .checkbox-wraper input:checked ~ .checkmark:after {
                        display: block;
                    }

                    .checkbox-wraper .checkmark:after {
                        left: 4px;
                        top: 1px;
                        width: 4px;
                        height: 7px;
                        border: solid white;
                        border-width: 0 2px 2px 0;
                        transform: rotate(45deg);
                    }
                }
                &:not(:nth-child(1)) {
                    .employees_table-checkbox {
                        margin-left: 1rem;
                    }
                }
            }
        }
        
    }
</style>