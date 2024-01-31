<template>
    <div class="employee_tab_order">

        
        <v-data-table
            :headers="orderHeaders"
            :items="orderData"
            :loading="orderLoading"
            :items-per-page="10"
            class="clickableTable elevation-1"
            :no-data-text="'Нет данных о департаментах'"
            @click:row="orderShow"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
        <template v-slot:[`item.type`]="{ item }">
            <div>
                <span>{{orderTypes.find(type => type.type == item.doc_type_id)?orderTypes.find(type => type.type == item.doc_type_id).name:''}}</span>
            </div>
        </template>
        <template v-slot:[`item.view_priority`]="{ item }">
            <span>{{item.view_priority || 0}}</span>   
        </template>
        </v-data-table>
         <v-dialog v-model="orderDialog" width="850">

            <v-card class="dialogOrder">
                <v-card-text style="padding: 30px;">
                        <p class="font-weight-bold">{{orderDialogData.organization}} </p>
                        <p>Приказ №{{orderDialogData.number}} от {{orderDialogData.date}}</p>
                        <p>{{orderTypes.find(type => type.type == orderDialogData.doc_type_id) ? orderTypes.find(type => type.type == orderDialogData.doc_type_id).name : ''}}</p>
                        <table class="orderTable">
                            <tr v-for="attr in orderDialogData.Attributes" :key="attr.id">
                                <td>{{attr.key}}</td>
                                <td>{{attr.value}}</td>
                            </tr>
                        </table>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="orderDialog = false">
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>   
    </div>
</template>
<script>
export default {
    data : function() {
        return {
            orderTypes: [],
            orderData: [],
            orderHeaders: [
                { text: 'Номер', value: 'number' },
                { text: 'От', value: 'date' },
                { text: 'Организация', value: 'organization' },
                { text: 'Тип', value: 'type' },
            ],
            orderDialog: false,
            orderDialogData: {},
            orderLoading: false
        }
    },

    methods: {
        orderShow(order) {
            this.orderDialogData = order
            this.orderDialog = true
        },

        async getOrderTypes() {
            try {
                let {data} = await this.axios.get(`/api/1.0/order-types`)
                this.orderTypes = data
            } catch (error) {
                console.log(error)
            }
        },

        async getOrders() {
            this.orderLoading = true
            try {
                let {data} = await this.axios.get(`/api/1.0/order/:iin`, {localParams: {iin: this.employee.identification_number}})
                this.orderData = data
            } catch (error) {
                console.log(error)
            } finally {
                this.orderLoading = false
            }
        }
    },

    async created() {
        await this.getOrderTypes()
        await this.getOrders()
    },

    props: ['employee']
}
</script><style lang="scss" scoped>
.dialogOrder p ,
.dialogOrder td {
    color: #000;
}
.orderTable {
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
        border: 2px solid #636363;
        padding: 5px 10px;
        width: 50%;
    }
}
</style>