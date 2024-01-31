<template>
    <div>
        <div class="d-flex justify-end">
            <v-btn
                color="primary"
                dark
                @click.stop="showAddRuleDialog()"
                class="ml-4"
            >
                <v-icon small class="mr-3">
                    mdi-plus
                </v-icon>
                Добавить
            </v-btn>
        </div>
        <br/>
        <v-data-table
            :headers="headers"
            :items="rules"
            :items-per-page="10"
            @click:row="getItemRules"
            class="clickableTable elevation-1 mb-4"
            :no-data-text="'Нет данных о маршрутах'"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
            <template v-slot:[`item.action`]="{ item }">
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="edit(item)"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="addItem(item)"
                >
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="deleteRule(item)"
                >
                    <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
            </template>
            <template v-slot:[`item.view_priority`]="{ item }">
                <span>{{item.view_priority || 0}}</span>
            </template>
            <template v-slot:[`item.is_resident_rk`]="{ item }">
                <v-simple-checkbox
                    v-model="item.is_resident_rk"
                    disabled
                ></v-simple-checkbox>
            </template>
            <template v-slot:[`item.is_required_approve`]="{ item }">
                <v-simple-checkbox
                    v-model="item.is_required_approve"
                    disabled
                ></v-simple-checkbox>
            </template>
        </v-data-table>

        <!-- Items -->
        <br/>
        Позиции маршрута согласования
        <br/><br/>
        <v-data-table
            :headers="itemHeaders"
            :items="items"
            :items-per-page="10"
            class="clickableTable elevation-1"
            :no-data-text="'Нет данных о позициях маршрута'"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
            <template v-slot:[`item.action`]="{ item }">
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="editItem(item)"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="deleteItem(item)"
                >
                    <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
            </template>
            <template v-slot:[`item.view_priority`]="{ item }">
                <span>{{item.view_priority || 0}}</span>   
            </template>
        </v-data-table>

        <v-dialog
            v-model="dialog"
            width="700"
            >
            <v-card>
                <v-card-title style="background-color: #1976d2;"> 
                    {{dialogData.id ? 'Редактировать маршрут согласования' : 'Добавить маршрут согласования'}}
                </v-card-title>
                <br/>
                <v-card-text>
                    <v-select
                        v-model="dialogData.departmentType"
                        :items="departmentTypesWithAll"
                        dense
                        outlined
                        hide-details
                        label="Тип департамента инициатора"
                        class="ma-2"
                    ></v-select>
                    <v-select v-if="placeholder == 0"
                        v-model="dialogData.requestType"
                        :items="requestTypes"
                        dense
                        outlined
                        @change="getSubType"
                        hide-details
                        label="Тип заявления"
                        class="ma-2"
                    ></v-select>
                    <v-select v-if="placeholder == 0"
                        v-model="dialogData.requestSubType"
                        :items="requestSubTypes"
                        dense
                        outlined
                        hide-details
                        label="Подтип заявления"
                        class="ma-2"
                    ></v-select>
                    <v-select v-if="placeholder != 0"
                        v-model="dialogData.passRequestType"
                        :items="passRequestTypes"
                        dense
                        outlined
                        hide-details
                        label="Тип заявки на пропуск"
                        class="ma-2"
                    ></v-select>
                    <v-switch v-if="placeholder != 0"
                        v-model="dialogData.isResidentRK"
                        label="Является резидентом?"
                        color="success"
                    ></v-switch>
                    <v-select
                        v-model="dialogData.initiatorPositionName"
                        :items="employeePositions"
                        dense
                        outlined
                        hide-details
                        label="Наименование позиции инициатора (опционально)"
                        class="ma-2"
                        clearable
                    ></v-select>
                    <v-switch
                        v-model="dialogData.isRequiredApprove"
                        label="Требует согласования?"
                        color="success"
                    ></v-switch>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="dialog = false;"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="green"
                        text
                        @click="addRule"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        
        <v-dialog
            v-model="dialogItem"
            width="700"
            >
            <v-card>
                <v-card-title style="background-color: #1976d2;">
                    {{dialogDataItem.id ? 'Редактировать позиции маршрута согласования' : 'Добавить позиции маршрута согласования'}}
                </v-card-title>
                <v-card-text>
                    <v-select
                        v-model="dialogDataItem.approve_position_name"
                        :items="employeePositions"
                        dense
                        outlined
                        hide-details
                        label="Позиция согласующего"
                        class="ma-2"
                        clearable
                    ></v-select>
                    <v-select
                        v-model="dialogDataItem.managerDepartmentTypeId"
                        :items="departmentTypes"
                        dense
                        outlined
                        hide-details
                        label="Тип курирующего департамента (для высшего руководства)"
                        class="ma-2"
                        clearable
                    ></v-select>
                    <v-text-field
                        v-model="dialogDataItem.orders"
                        :label="`Шаг согласования`"
                        required
                        outlined
                        type="number"
                        class="ma-2"
                    ></v-text-field>
                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    color="red darken-1"
                    text
                    @click="dialogItem = false;"
                >
                    Отмена
                </v-btn>

                <v-btn
                    color="green"
                    text
                    @click="sendAddItem"
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
    name: 'AdministationDepartmentsTableComponent',
    data() {
        return {
            headers: [
                { text: '#', sortable: false, value: 'id'},
                { text: 'Тип департамента инициатора', value: 'department_type_name' },
                { text: 'Позиция инициатора', value: 'initiator_position_name' },
                { text: '', value: 'action' }
            ],
            itemHeaders: [
                { text: '#', sortable: false, value: 'id'},
                { text: 'Шаг согласования', value: 'orders' },
                { text: 'Позиция согласующего', value: 'approve_position_name' },
                { text: 'Тип курирующего департамента (для высшего руководства)', value: 'manager_department_type_name' },
                { text: '', value: 'action' }
            ],
            rules: [],
            items: [],
            departmentTypes: [],
            departmentTypesWithAll: [],
            requestTypes: [],
            passRequestTypes: [],
            requestSubTypes: [],
            dialog: false,
            dialogData: {},
            currentRowRule: {},
            dialogDataItem: {},
            employeePositions: [],
            dialogItem: false,
        }
    },
    methods: {
        async getRules() {
            let data = await this.axios.get(`/api/1.0/request-approve-rule`, {params: {object_name: this.placeholder == 0 ? 'REQUEST' : 'PASS_REQUEST'}})
            return data.data
        },

        async getRefs(tableName, id = undefined, column = undefined) {
            let params = {
                tableName,
                id,
                column
            }
            let data = await this.axios.get(`/api/1.0/request-approve-refs`, {params})
            return data.data
        },

        changeToSelect(data) {
            return data.map(item => {
                return {
                    text: item.name,
                    value: item.id
                }
            })
        },

        async showAddRuleDialog() {
            this.clearDialog()
            this.requestSubTypes = []

            this.dialog = true
        },

        async addRule() {
            let err = []

                        if(this.placeholder == 0) {
                if(!this.dialogData.departmentType) {
                    err.push('"Тип департамента инициатора" обязательна для заполнения')
                } 
                if(!this.dialogData.requestType) {
                    err.push('"Тип заявления" обязательна для заполнения')
                } 
                if(!this.dialogData.requestSubType) {
                    err.push('"Подтип заявления" обязательна для заполнения')
                }
            }

                        if(this.placeholder != 0) {
                if(!this.dialogData.departmentType) {
                    err.push('"Тип департамента инициатора" обязательна для заполнения')
                } 
                if(!this.dialogData.passRequestType) {
                    err.push('"Тип заявки на пропуск" обязательна для заполнения')
                } 
            }

            if(err.length) {
                return this.$swal({
                    ...this.$optionAlert.fire,
                    icon: "error",
                    timer: 5000,
                    width: 600,
                    title: err.join('; <br>'),
                });
            }

            let requestTypeValue, requestSubTypeValue, passRequestTypeValue, isResidentRKValue, isRequiredApproveValue
            if (this.placeholder == 0) {
                requestTypeValue = this.dialogData.requestType
                requestSubTypeValue = this.dialogData.requestSubType
                passRequestTypeValue = -1
                isResidentRKValue = false
            }

            if (this.placeholder != 0) {
                requestTypeValue = -1
                requestSubTypeValue = -1
                passRequestTypeValue = this.dialogData.passRequestType
                isResidentRKValue = this.dialogData.isResidentRK == undefined || this.dialogData.isResidentRK == null || this.dialogData.isResidentRK == false ? false : true
            }
            isRequiredApproveValue = this.dialogData.isRequiredApprove == undefined || this.dialogData.isRequiredApprove == null || this.dialogData.isRequiredApprove == false ? false : true

                        let method = 'post'
            if(this.dialogData.id) {
                method = `put`
            }
            let body = {
                id: this.dialogData.id,
                object_name: this.placeholder == 0 ? 'REQUEST' : 'PASS_REQUEST',
                department_type: this.dialogData.departmentType,
                request_type: requestTypeValue,
                request_sub_type: requestSubTypeValue,
                pass_request_type: passRequestTypeValue,
                is_resident_rk: isResidentRKValue,
                is_required_approve: isRequiredApproveValue,
                initiator_position_name: this.dialogData.initiatorPositionName
            }

                         try {
                await this.axios[method](`/api/1.0/request-approve-rule`, body)
                this.dialog = false

                                this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: "Сохранено",
                });
                this.dialog = false
                this.getRules()
                .then(data => {
                    this.rules = data
                })

            } catch (error) {
                this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
                });
            }

        },

        edit(item) {
            this.clearDialog()

            this.dialogData.id = item.id
            this.dialogData.departmentType = item.department_type_id
            this.dialogData.requestType = item.request_type_id
            this.dialogData.passRequestType = item.pass_request_type_id
            this.dialogData.isResidentRK = item.is_resident_rk
            this.dialogData.isRequiredApprove = item.is_required_approve

            this.getSubType(item.request_type_id)

                        this.dialogData.requestSubType = item.request_sub_type_id
            this.dialogData.initiatorPositionName = item.initiator_position_name
            this.dialog = true
        },

        clearDialog() {
            this.dialogData = {}
        },
        clearDialogItem() {
            this.dialogDataItem = {}
        },
        async getSubType(id) {
            try {
                let data = await this.getRefs('request_sub_type', id, 'request_type_id')
                data = data.filter(item => item.id > 0)
                data = [{name: 'Все подтипы', id: -1},...data]
                this.requestSubTypes = this.changeToSelect(data)
            } catch (error) {
                console.error(error)
            }
        },
        async getItemRules(data) {
            this.currentRowRule = data
            let localParams = {
                id: data.id
            }
            let {data: items} = await this.axios.get(`/api/1.0/request-approve-rule-item/:id`, {localParams})
            this.items = items
        },

        async getEmployeePositions() {
            let {data} = await this.axios.get(`/api/1.0/positions`)
            data = [...new Set(data.map(item => item.name.trim()))];
            data = data.filter(item => item != '-')
            this.employeePositions = data.map(item => {
                return {
                    text: item,
                    value: item
                }
            })
        },

        async addItem(data) {
            this.clearDialogItem()

            this.currentRowRule = data
            await this.getItemRules(this.currentRowRule)

                        this.dialogItem = true
        },

        async deleteRule(data) {
            this.$swal({
                title: `Вы действительно хотите удалить запись ${data.id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await this.axios.delete(`/api/1.0/request-approve-rule/:id`, {localParams: {id: data.id}})
                        this.rules = await this.getRules()
                        this.items = []

                        this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "success",
                        title: "Запись удалена.",
                        });
                    } catch (error) {
                        this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "error",
                        title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
                        });
                    }
                }
            });
        },

                async deleteItem(data) {
            this.$swal({
                title: `Вы действительно хотите удалить запись ${data.id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await this.axios.delete(`/api/1.0/request-approve-rule-item/:id`, {localParams: {id: data.id}})
                        await this.getItemRules({id: data.rule_id})
                        this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "success",
                        title: "Запись удалена.",
                        });
                    } catch (error) {
                        this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "error",
                        title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
                        });
                    }
                }
            });
        },

        async editItem(data) {
            this.clearDialogItem()

            this.dialogDataItem.managerDepartmentTypeId = data.manager_department_type_id
            this.dialogDataItem.approve_position_name = data.approve_position_name
            this.dialogDataItem.orders = data.orders
            this.dialogDataItem.id = data.id
            this.dialogItem = true
        },

                async sendAddItem() {
            let method =  this.dialogDataItem.id ? 'put' : 'post'

                        let body = {
                id: this.dialogDataItem.id,
                rule_id: this.currentRowRule.id,
                approve_position_name: this.dialogDataItem.approve_position_name,
                orders: this.dialogDataItem.orders,
                manager_department_type_id: this.dialogDataItem.managerDepartmentTypeId
            }

            try {
                await this.axios[method](`/api/1.0/request-approve-rule-item`, body)
                this.dialogItem = false

                                this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: "Сохранено",
                });

                await this.getItemRules(this.currentRowRule)

            } catch (error) {
                this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
                });
            }

        }
    },
    props: ['placeholder'],
    created() {
        if (this.placeholder == 0) {
            this.headers = [
                { text: '#', sortable: false, value: 'id'},
                { text: 'Тип департамента инициатора', value: 'department_type_name' },
                { text: 'Тип заявления', value: 'request_type_name' },
                { text: 'Подтип заявления', value: 'request_sub_type_name' },
                { text: 'Позиция инициатора', value: 'initiator_position_name' },
                { text: 'Требует согласования?', value: 'is_required_approve' },
                { text: '', value: 'action' }
            ]
        } else {
            this.headers = [
                { text: '#', sortable: false, value: 'id'},
                { text: 'Тип департамента инициатора', value: 'department_type_name' },
                { text: 'Тип заявки на пропуск', value: 'pass_request_type_name' },
                { text: 'Является резидентом РК?', value: 'is_resident_rk' },
                { text: 'Позиция инициатора', value: 'initiator_position_name' },
                { text: 'Требует согласования?', value: 'is_required_approve' },
                { text: '', value: 'action' }
            ]
        }

        this.getEmployeePositions()

                this.getRules()
        .then(data => {
            this.rules = data
        })

        this.getRefs('department_type')
        .then(data => {
            data = data.filter(item => item.id > 0)

                        this.departmentTypes = this.changeToSelect(data)

            data = [{name: 'Все типы', id: -1},...data]

            this.departmentTypesWithAll = this.changeToSelect(data)
        })

        this.getRefs('request_type')
        .then(data => {
            data = data.filter(item => item.id > 0)
            data = [{name: 'Все типы', id: -1},...data]

                        this.requestTypes = this.changeToSelect(data)
        })

        this.axios.get('/api/1.0/lov/ref.pass_request_type')
        .then(data => {
            data = data.data.filter(item => item.id > 0)
            data = [{name: 'Все типы', id: -1},...data]

            this.passRequestTypes = data.map(item => { return { value: item.id, text: item.name }})
        })
    },
}
</script>