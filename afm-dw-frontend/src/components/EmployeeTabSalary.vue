<template>
    <div>
        <v-row>
            <v-col cols="4">
                
                    <v-menu
                        ref="menu"
                        v-model="menu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                        >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                outlined
                                class="mr-4 btnStyled"
                                color="#5787A4"
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon small class="mr-3">
                                mdi-calendar
                                </v-icon>
                                {{
                                    !salaryDate || !salaryDate.length ? `Выберите период` : salaryDate.length == 1 || salaryDate[0] == salaryDate[1]
                                    ? `Период: ${moment(salaryDate[0], "YYYY-MM").format('MMMM YYYY')}` 
                                    : `Дата: с ${moment(salaryDate[0], "YYYY-MM").format('MMMM YYYY')} по 
                                    ${moment(salaryDate[1], "YYYY-MM").format('MMMM YYYY')}`
                                }}
                            </v-btn>
                        </template>
                        <!--Для 800618400935 и 820419350799 без ограничении по дате-->
                        <v-date-picker
                            v-model="salaryDate"
                            type="month"
                            range
                            show-current
                            :active-picker.sync="activePicker"
                            :max="$userData.fullData.identification_number == '800618400935' || $userData.fullData.identification_number == '820419350799' ? moment().format('YYYY-MM-DD') : (new Date().getDate() < 22 ? moment().subtract(1, 'M').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'))"
                            min="1950-01-01"
                            @change="save"
                        ></v-date-picker>
                    </v-menu>
            </v-col>
            <v-col cols="1"></v-col>
            <v-col cols="12" lg="4">
                <v-btn
                    class="mr-4 btnStyled"
                    color="#4094F7"
                    @click="getSalaryList(salaryDate)"
                >
                    Запросить
                </v-btn>
                <v-btn
                    class="mr-4 btnStyled"
                    color="#4094F7"
                    @click="clearSalaryList"
                >
                    Очистить
                </v-btn>
            </v-col>
        </v-row>
        <v-row v-for="salaryList in salaryListData" :key="salaryList.id" style="margin-bottom: 20px; border-bottom: 1px solid gray; padding-bottom: 20px">
            <v-col>
                <h2 style="font-size: 15px; font-weight:bold;">Период: {{salaryList.period}}</h2>
                <table class="empList" style="border-collapse: collapse; border: 1px dotted #000;">
                    <tr>
                        <td width="50%" colspan="5">
                            {{salaryList.organization}}
                        </td>
                        <td colspan="3">
                            Базовый склад: {{salaryList.based_salary}}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="5" class="boldText">
                            Работник {{salaryList.employee}}
                        </td>
                        <td colspan="3">
                            Категория: {{salaryList.category}} | Стаж: {{salaryList.rank}}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="5">Подразделение: {{salaryList.department}}</td>
                        <td colspan="3">
                            Поправочный коэффициент: {{salaryList.correction_point_expected}}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="5">Вид работника: {{employee.employee_type_name}}</td>
                        <td colspan="3">
                            коэффициент от стажа: -
                        </td>
                    </tr>
                    <tr class="boldText">
                        <td colspan="5">Должность: {{salaryList.position}}</td>
                        <td colspan="3">
                            Оклад: {{digit(salaryList.salary)}}
                        </td>
                    </tr>
                </table>

                <v-row class="pa-3">
                    <v-col cols="12" md="12" lg="6" class="pa-0"> 
                        <table class="empList" style="border-collapse: collapse; margin-top: 10px; width:100%;">
                            <tr style="background-color: #ECFEE9;" class="centerText boldText">
                                <td>Вид</td>
                                <td>Период</td>
                                <td>Дни</td>
                                <td>Часы</td>
                                <td>Сумма</td>
                            </tr>
                            <tr class="boldText">
                                <td colspan="5">1. Начислено</td>
                            </tr>
                            <tr v-for="accrual in salaryList.accrual_list" :key="accrual.number">
                                <td style="max-width:345px">{{accrual.name}}</td>
                                <td>{{moment(accrual.period.start_date).format('MM.YYYY')}}</td>
                                <td>{{accrual.days}}</td>
                                <td></td>
                                <td>{{digit(accrual.sum)}}</td>
                            </tr>
                            <tr class="boldText">
                                <td>Итого начислено</td>
                                <td></td>
                                <td>{{salaryList.accrual_list.length ? salaryList.accrual_list[0].days : ''}}</td>
                                <td>{{salaryList.accrual_list.length ? salaryList.accrual_list[0].days * 8 : ''}}</td>
                                <td>{{digit(salaryList.all_accrual)}}</td>
                            </tr>
                        </table>
                    </v-col>
                    <v-col cols="12" lg="6" class="pa-0">
                        <table class="empList" style="border-collapse: collapse; margin-top: 10px; width: 100%;">
                            <tr style="background-color: #ECFEE9;" class="centerText boldText">
                                <td>Вид</td>
                                <td>Период</td>
                                <td>Сумма</td>
                            </tr>
                            <tr class="boldText">
                                <td colspan="3">1. Удержано</td>
                            </tr>
                            <tr v-for="retention in salaryList.retention_list" :key="retention.id">
                                <td>{{retention.name}}</td>
                                <td>{{moment(retention.period.start_date).format('MM.YYYY')}}</td>
                                <td>{{digit(retention.sum)}}</td>
                            </tr>
                            <tr class="boldText">
                                <td colspan="2">Итого удержано</td>
                                <td>{{digit(salaryList.all_retention)}}</td>
                            </tr>
                            <tr class="boldText">
                                <td colspan="3">Перечисления ЗП</td>
                            </tr>
                            <tr v-for="payment in salaryList.payment_list" :key="payment.number">
                                <td>{{payment.name}}</td>
                                <td>{{payment.name.slice(-10)}}</td>
                                <td>{{digit(payment.sum)}}</td>
                            </tr>
                            <tr class="boldText">
                                <td colspan="2">Итого перечислено</td>
                                <td>{{digit(salaryList.all_payment)}}</td>
                            </tr>
                        </table>
                    </v-col>
                </v-row>
                
            </v-col>
        </v-row>
        <v-progress-circular
            style="width: 100%;"
            v-show="loader"
            indeterminate
            size="64"
        ></v-progress-circular>
    </div>
</template>
<script>
import moment from 'moment'

  export default {
    data () {
      return {
        activePicker: null,
        salaryDate: [(this.$userData.fullData.identification_number == '800618400935' || this.$userData.fullData.identification_number == '820419350799' ? moment().format('YYYY-MM-DD') : (new Date().getDate() < 23 ? moment().subtract(1, 'M').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')))],
        menu: false,
        dialog: false,
        moment,
        loader: false,

        requestModalType: [],
        requestModalSubType: [],

            dateToPickerState: false,
        dateFromPickerState: false,

        requestData: {
            dateTo: new Date().toISOString().substr(0, 10),
            dateFrom: new Date().toISOString().substr(0, 10),
            type: '',
            subType: '',
            comment: '',
            employeeId: this.$route.params.id
        },
        headersRequest: [
          {text: 'Номер', value: 'id', sortable: false},
          { text: 'Тип', value: 'type' },
          { text: 'Дата с', value: 'date_from' },
          { text: 'Дата по', value: 'date_to' },
          { text: 'Подтип', value: 'sub_type' },
          { text: 'Комментарий', value: 'comment' },
          { text: 'Статус', value: 'status' },
        ],
        headersRequestApprove: [
          {text: 'Номер', value: 'id'},
          { text: 'Согласующий', value: 'approve' },
          { text: 'Дата согласования', value: 'approve_date' },
          { text: 'Комментарий', value: 'comment' },
          { text: 'Статус', value: 'status' },
        ],
        request: [],
        request_approve: [],

        salaryListData: [],
      }
    },
    watch: {
      menu () {
        if(this.salaryDate && this.salaryDate.length == 2) {
            this.salaryDate.sort((a, b) => {
                return moment(moment(a, 'YYYY-MM').format()).isAfter(moment(b, 'YYYY-MM').format()) ? 1 : -1
            })
        }
      }
    },
    created() {
        this.loader = true
        this.getSalaryList(this.salaryDate)
        .then(() => {
            this.loader = false
        }).catch((err) => {
            console.log(err)
            this.loader = false
        })
    },
    methods: {
        save (date) {
            this.$refs.menu.save(date)
        },
        async getSalaryList(period) {
            if(!period || !period.length) {
                return this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `Выберите период`,
                });
            }
            this.loader = true
            if(period.length == 1) {
                period.push(period[0])
            }
            let start_month = moment(period[0], 'YYYY-MM').format('MM')
            let start_year = moment(period[0], 'YYYY-MM').format('YYYY')
            let end_month = moment(period[1], 'YYYY-MM').format('MM')
            let end_year = moment(period[1], 'YYYY-MM').format('YYYY')

            let params = {
                start_month,
                start_year,
                end_month,
                end_year,
                employee_id: this.employee.id,
                timez: - new Date().getTimezoneOffset()
            }
            try {
                let salaryListData = await this.axios.get(`/api/1.0/employee/:iin/salarylist`, {localParams: {iin: this.employee.identification_number}, params})
                this.salaryListData = salaryListData.data
            } catch (error) {
                console.log(error)
            }
            this.loader = false
        },
        clearSalaryList() {
            this.salaryListData = ''
            this.salaryDate = null
        },

        digit(string) {
            return string.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')
        },

        isShowLoader(data) {
            this.$emit('isShowLoader', data)
        }


            },
    props: ['employee']
  }
</script>