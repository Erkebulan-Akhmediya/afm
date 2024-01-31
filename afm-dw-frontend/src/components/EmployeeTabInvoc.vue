<template>
    <div>
        <v-row>
            <v-col cols="4">
                <v-menu
                    ref="menu2"
                    v-model="menu2"
                    :close-on-content-click="true"
                    transition="scale-transition"
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
                            На дату {{invocDate ? moment(invocDate).format('DD.MM.YYYY') : ''}}
                        </v-btn>
                    </template>
                    <v-date-picker
                        v-model="invocDate"
                        show-current
                        :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                        min="1950-01-01"
                        @change="save"
                    ></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="1"></v-col>
            <v-col cols="4">
                <v-btn
                    class="mr-4 btnStyled"
                    color="#4094F7"
                    @click="getInvocList(invocDate, employee.identification_number)"
                >
                    Запросить
                </v-btn>
                <v-btn
                    class="mr-4 btnStyled"
                    color="#4094F7"
                    @click="clearInvocList"
                >
                    Очистить
                </v-btn>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <table v-if="currentInvocList.length" class="invocTable" style="border-collapse: collapse; margin-top: 10px; ">
                    <caption class="invocCaption">Список долгосрочных активов {{invocSearchDate ? 'на ' + moment(invocSearchDate).format('DD.MM.YYYY') : ''}}</caption>
                    <tr>
                        <th>№</th>
                        <th>Инвентарный номер</th>
                        <th>Наименование</th>
                        <th>Серийный номер</th>
                        <th>Стоимость</th>
                    </tr>
                    <tr v-for="(invocItem, i) in currentInvocList" :key="invocItem.id">
                        <td>{{(i + 1) + paging.limit * paging.currentPage - paging.limit}}</td>
                        <td>{{invocItem ? invocItem.inventory_number : ''}}</td>
                        <td style="max-width: 300px">{{invocItem ? invocItem.name_oc : ''}}</td>
                        <td style="max-width: 150px"><div style="overflow-x: auto">{{invocItem ? invocItem.serial_number : ''}}</div></td>
                        <td>{{invocItem ? invocItem.cost : ''}}</td>
                    </tr>
                </table>
                <div v-if="currentInvocList.length" class="text-center">
                    <v-pagination
                    v-model="paging.currentPage"
                    :length="paging.pageCount"
                    :total-visible="7"
                    @next="nextPage"
                    @previous="nextPage"
                    @input="nextPage"
                    ></v-pagination>
                </div>
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
    data: () => ({
        moment,
        invocDate: moment().format('YYYY-MM-DD'),
        menu2: false,
        loader: false,
        invocList: [],
        invocSearchDate: moment().format('YYYY-MM-DD'),
        currentInvocList: [],
        paging: {
            offset: 0,
            limit: 8,
            currentPage: 1,
            pageCount: 1,
        }
    }),
    mounted() {
        this.getInvocList(this.invocSearchDate, this.employee.identification_number)
    },
    methods: {
        nextPage(data) {
            if(data) {
                this.paging.currentPage = data;
                this.currentInvocList = []
                let offset = this.paging.limit * data - this.paging.limit

                for(let i = offset; i < offset + this.paging.limit; i++) {
                    if(this.invocList[i] ) {
                        this.currentInvocList.push(this.invocList[i])
                    }
                }
            }
        },
        save (date) {
            this.$refs.menu2.save(date)
        },

        async getInvocList(date, iin) {
            if(!date) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: `Выберите дату!`  
                })
                return
            }
            this.paging.offset = 0
            this.paging.currentPage = 1
            let arr = []
            this.currentInvocList = []

            this.loader = true;
            let data
            try {
                data = await this.axios.get(`/api/1.0/employee/:iin/invoclist`, {localParams: {iin}, params: {date, employee_id: this.employee.id, timez: - new Date().getTimezoneOffset()}})
                this.invocSearchDate = date
                this.invocList = data.data

                for(let i = this.paging.offset; i < this.paging.limit; i++) {
                    if(data.data[i]) {
                        arr.push(data.data[i]) 
                    }
                }
                this.paging.pageCount = Math.trunc(this.invocList.length / this.paging.limit)
                if(this.invocList.length % this.paging.limit) {
                    this.paging.pageCount += 1
                }
                this.currentInvocList = arr

                            } catch (error) {
                return new Error('Не удалось получить список долгосрочных активов')
            } finally {
                this.loader = false;
            }
            return data.data
        },
        clearInvocList() {
            this.invocSearchDate = ''
            this.currentInvocList = []
            this.invocDate = ''

        }
    },
    watch: {
        employee() {
            this.getInvocList(this.invocSearchDate, this.employee.identification_number)
        },
    },
    props: ['employee']
}
</script><style lang="scss" scoped>

.invocTable {
    width: 100%;
    min-width: 600px;
    overflow-x: auto;
    margin-bottom: 20px;

    .invocCaption {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 20px;
    }
    th {
        border: 2px solid #656565;
        padding: 5px 10px;
        background-color: #F6EECA;
        word-break: break-word;
    }

    td {
        word-break: break-word;
        border: 2px solid #aaaaaa;
        padding: 5px 10px;
    }
}
</style>