<template>
    <div class="adminUsers" v-if="$isAdminRules($userData.role, 'users')">
        <v-row>
            <v-col>
                <div :style="`display: flex; position: relative; z-index:1; width: 100%; background: #fff; height: 56px; box-sizing: border-box`" >
                    <v-text-field class="searchBar" :placeholder="$t('mainPage.search.globalSearch')" v-model="globalSearchVal" @keydown.enter="globalSearch" @keydown="check" style="padding: 7px; border: 1px solid #ddd; border-radius: 5px">
                        <v-icon @click="globalSearch" slot="prepend" color="gray" style="color: #BDBDBD;">mdi-magnify</v-icon>
                    </v-text-field>
                </div>
            </v-col>    
        </v-row>
        <v-row>
            <v-col>
                <EmployeeTableSmallSearch @clickOnRow="selectEmployee" @changeEmployee="changeEmployee" :isAdmin="true" :employeeTable="searchEmployeeTable" @globalSearch="globalSearch" :adminUsersForm="true"
                ></EmployeeTableSmallSearch>
            </v-col>
        </v-row>

    <v-dialog
        v-model="dialog"
        width="500"
        @input="v => v || clearDialog()"
        >
        <v-card>
            <v-card-title style="background-color: #1976d2;"> 
                Добавить пользователя
            </v-card-title>
            <br/>
            <v-card-text>
                <v-text-field
                    v-model="dialogData.login"
                    label="Логин"
                    autocomplete="off"
                    required
                    outlined
                    :rules="textRules"
                ></v-text-field>
                <v-text-field
                    v-model="dialogData.password"
                    label="Пароль"
                    autocomplete="off"
                    type="password"
                    required
                    outlined
                    :rules="textRules"
                ></v-text-field>
                <v-select
                    required
                    outlined
                    v-model="dialogData.role_id"
                    :items="dialogData.role_list"
                    label="Роль"
                ></v-select>
                <!-- :rules="selectRules" -->
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="green"
                    text
                    @click="createUser()"
                >
                    Сохранить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="dialogEmployee"
        width="500"
        @input="v => v || clearDialog()"
        >
        <v-card>
            <v-card-title style="background-color: #1976d2;"> 
                Изменить данные сотрудника
            </v-card-title>
            <v-card-text style="padding: 30px">
                <slot>
                    <div style="color: #000;">
                        <h2 class="mb-4" style="font-weight: 600; font-size: 20px;">{{dialogEmployeeData.last_name}} {{dialogEmployeeData.first_name}} {{dialogEmployeeData.middle_name}}</h2>
                        <v-text-field
                            hide-details
                            class="mb-3 mt-3"
                            v-model="dialogEmployeeData.view_priority"
                            label="Приоритет"
                            outlined
                        ></v-text-field>
                        <div style="border: 1px solid #a7a7a7; padding: 15px; border-radius: 5px;" class="mb-3">
                            <div style="display: flex; align-items: center;">
                                
                                <div>
                                    <h2 style="font-weight: 600;" class="mb-2">Контакты:</h2>
                                </div>

                                <!--
                                <v-btn class="mb-4" style="margin-left:auto; color: green; background-color: #fff;" @click="addMobilePhone">
                                    <v-icon>
                                        mdi-plus
                                    </v-icon>
                                </v-btn>
                                -->

                            </div>
                            <div
                                    v-for="(contact) in dialogEmployeeData.changedContacts"
                                    :key="contact.id">
                                <div v-if="!contact.is_delete" style="display: flex; align-items: center;">
                                    <v-text-field
                                        hide-details
                                        class="mt-3"
                                        v-model="contact.contact"
                                        :label="contact.contact_info_type_name"
                                        outlined
                                    ></v-text-field>
                                    <!--
                                    <v-btn icon v-if="i > 0" style="margin-left:10px; background-color: #fff;" @click="addMobilePhone(contact, true)">
                                        <v-icon>
                                            mdi-window-close
                                        </v-icon>
                                    </v-btn>
                                    -->
                                </div>
                            </div>
                        </div>
                        <div style="border: 1px solid #a7a7a7; padding: 15px; border-radius: 5px;" class="mb-3">
                                <div>
                                    <h2 style="font-weight: 600;" class="mb-2">Роли:</h2>
                                </div>
                            <div style="display: flex; align-items: center; flex-wrap: wrap;">
                                
                                
                                    <v-chip
                                    @click:close="delRole(role)"
                                    append
                                    close
                                    v-for="role in this.dialogEmployeeData.role_list" :key="role.id" class="text--primary mr-2 mb-4"
                                    >
                                    {{role.role_name}}
                                    </v-chip>
                            </div>
                            <div style="display: flex; align-items: center;" class="mb-2">
                                <v-select
                                    :items="this.dialogData.role_list"
                                    dense
                                    outlined
                                    v-model="dialogData.role_id"
                                    hide-details
                                    class="ma-2"
                                    label="Добавить роль"
                                ></v-select>
                                <v-btn class="" style="margin-left:10px; color: green; background-color: #fff;" @click="addNewRole(dialogData.role_id)">
                                    <v-icon>
                                        mdi-plus
                                    </v-icon>
                                </v-btn>
                            </div>
                            <v-btn class="" style="margin-left:10px; color: green; background-color: #fff;" @click="sendRole">
                                Сохранить роли
                            </v-btn>
                        </div>

                        <div style="border: 1px solid #a7a7a7; padding: 15px; border-radius: 5px;" class="mb-3">
                                <div>
                                    <h2 style="font-weight: 600;" class="mb-2">Для высшего руководства:</h2>
                                </div>
                            <div style="display: flex; align-items: center;" class="mb-2">
                                <v-select
                                    :items="departmentType"
                                    dense
                                    outlined
                                    v-model="dialogEmployeeData.manager_department_type_id"
                                    hide-details
                                    class="ma-2"
                                    label="Тип курьирующего департамента"
                                    clearable
                                ></v-select>
                            </div>
                        </div>
                        
                        <v-btn
                            color="error"
                            text
                            @click="passwordReset = true"
                        >
                            Сбросить пароль
                        </v-btn>
                    </div>
                </slot>
            </v-card-text>

            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                color="error"
                text
                @click="dialogEmployee = false"
            >
                Отмена
            </v-btn>
            
            <v-btn
                :loading="disableDoubleClick"
                :disabled="disableDoubleClick"
                text
                color="success"
                @click="changeEmployeeSend"
                >
                Сохранить
                <template v-slot:loader>
                    <span>Отправка...</span>
                </template>
            </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="passwordReset"
        width="600"
        @input="v => v || clearDialogPassReset()"
        >
        <v-card>
            <v-card-title style="background-color: #1976d2;"> 
                Введите новый пароль
            </v-card-title>
            <v-card-text style="padding: 10px">
                <slot>
                    <div style="color: #000;">
                        <v-text-field
                            type="password"
                            hide-details
                            class="mb-3 mt-3"
                            v-model="newPassword"
                            label="Новый пароль"
                            outlined
                        ></v-text-field>
                    </div>
                </slot>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="error"
                    text
                    @click="passwordReset = false"
                >
                    Отмена
                </v-btn>
                
                <v-btn
                    :loading="disableDoubleClick"
                    :disabled="disableDoubleClick"
                    text
                    color="success"
                    @click="changeUserPassword"
                >
                    Изменить
                    <template v-slot:loader>
                        <span>Отправка...</span>
                    </template>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <DialogInformation :title="error.title" :body="error.body" :isShow="error.isShow" @hideDialog="error.isShow = !error.isShow">
    </DialogInformation>
    </div>
    <div v-else><h2>Доступ запрещен</h2></div>

</template>
<script>
export default {
    data: () => ({
        error: {
            title: 'Ошибка',
            body: '',
            isShow: false
        },
        passwordReset: false,
        newPassword: '',
        offset: 0,
        valid: false,
        globalSearchVal: '',
        prevSearchVal: null,
        searchEmployee: [],
        searchEmployeeTable: [],
        dialogEmployee: false,
        dialog: false,
        dialogEmployeeData: {},
        disableDoubleClick: false,
        dialogData: {
          contacts:[],
          id: "",
          login: "",
          password: "",
          role_id: 1,
          role_list: [],
          requestType: 'post'
        },
        textRules: [
            value => {
                return Boolean(String(value)) || 'Необходимо ввести текст'}
        ],
        selectRules: [
            v => Boolean(v) || 'Надо выбрать один пункт'
        ],
        employeeLoader: false,
        departmentType: [],
    }),
    methods: {
        async changeUserPassword() {
            if(!this.newPassword) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: `Для смены необходимо ввести новый пароль`  
                })
                return
            }
            try {
                await this.axios.put(`/api/1.0/user/:id`, {password: this.newPassword, user_name: this.$userData.id}, {localParams: {id: this.dialogEmployeeData.id}}).catch((e) => {
                    throw e
                    })
                this.newPassword = ''
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: `Пароль успешно изменён`  
                })
                this.passwordReset = false
            } catch (e) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: `Ошибка: ${e}`  
                })
            }
        },

        addMobilePhone(event, isDelete = false) {
            if(isDelete) {
                if(event.id) {
                    event.is_delete = true
                } else {
                    this.dialogEmployeeData.changedContacts = this.dialogEmployeeData.changedContacts.filter(item => item != event)
                }
            } else {
                this.dialogEmployeeData.changedContacts.push({contact_info_type_id: 4, contact_info_type_name: 'Сотовый телефон', contact: ''})
            }
            this.dialogEmployeeData = Object.assign({}, this.dialogEmployeeData)
        }, 

        showDialog() {
            this.dialog = true
        },

        clearDialog() {
            this.dialogData.id = ""
            this.dialogData.login = ""
            this.dialogData.password = ""
            this.dialogData.role_id = 1
            this.dialogData.requestType = 'post'
        },

        clearDialogPassReset() {
            this.newPassword = ''
        },

        async createUser() {
            let bind = {
                "login": this.dialogData.login,
                "password": this.dialogData.password,
                "employee_id": this.dialogData.id,
                "role_id": this.dialogData.role_id
            }
            try {
                await this.axios.post(`/api/1.0/user`, bind)
                this.error.title = `Сообщение`
                this.error.body = `Пользователь успешно создан`
                this.error.isShow = true
                this.clearDialog()
                this.dialog = false
            } catch (err) {
                this.error.title = `Ошибка`
                this.error.body = err.data.message || err.data.ERR_MSG || err.message || err
                this.error.isShow = true

                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: err.data.message || err.data.ERR_MSG || err.message || err
                })
            }
        },

        selectEmployee(data) {
            if(data.username) {
                this.dialogData.login = data.username
            }

                        this.dialogData.id = data.id
            this.dialog = true
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

        async changeEmployee(data) {
            if(!this.departmentType.length) {
                let dataRefs = await this.getRefs('department_type')
                dataRefs = dataRefs.filter(item => item.id > 0)
                this.departmentType = this.changeToSelect(dataRefs)
            }

            let localParams = {
                id: data.id
            }
            let {data: {0: userData}} = await this.axios.get(`/api/1.0/employee/:id`, {localParams})

            if (!userData.contacts.find((item)=>item.contact_info_type_id === 3)) {
                userData.contacts.push(
                    {
                        contact_info_type_id: 3,
                        contact_info_type_name: 'Рабочий телефон',
                        contact: ''
                    }
                )
            }

            if (!userData.contacts.find((item)=>item.contact_info_type_id === 4)) {
                userData.contacts.push(
                    {
                        contact_info_type_id: 4,
                        contact_info_type_name: 'Мобильный номер',
                        contact: ''
                    }
                )
            }
            this.dialogEmployeeData = userData

            let roleArr = []
            if(this.dialogEmployeeData.role_id) {
                roleArr = this.dialogEmployeeData.role_id.split(';')
            }
            let newArr = roleArr.map(item => {
                item = {role_id: item, role_name: this.dialogData.role_list.find(role => {return role.value == item}).text}

                               return item
            })
            this.$set(this.dialogEmployeeData, 'role_list', newArr)

            this.dialogEmployeeData.changedContacts = JSON.parse(JSON.stringify(this.dialogEmployeeData.contacts.filter(item => {
                                                            return (item.contact_info_type_id == 3 || item.contact_info_type_id == 4)
                                                        })))
            this.dialogEmployee = true
        },

        async changeEmployeeSend() {
            this.disableDoubleClick = true

            let changingContacts = this.dialogEmployeeData.changedContacts.filter(item => {
                let originalContact = this.dialogEmployeeData.contacts.find(originalItem => originalItem.id == item.id)
                if(!originalContact || originalContact.contact != item.contact || item.is_delete) {
                    return item
                }
            })

            if(!this.dialogEmployeeData.view_priority) {
                this.dialogEmployeeData.view_priority = null
            }

            let bind = {
                role_list: this.dialogEmployeeData.role_list,
                view_priority: this.dialogEmployeeData.view_priority,
                contacts: changingContacts,
                manager_department_type_id: this.dialogEmployeeData.manager_department_type_id
            }
            try {
                let localParams = {
                    id: this.dialogEmployeeData.id
                }
                await this.axios.put(`/api/1.0/employee/:id`, bind, {localParams})
                this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'success',
                        title: 'Сохранено.'  
                    })
            } catch (error) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`  
                })
            }
            this.dialogEmployee = false
            this.disableDoubleClick = false
        },

                addNewRole(id) {
            let roleObj = this.dialogData.role_list.find(item => item.value == id)
            let addItem = {role_id: roleObj.value, role_name: roleObj.text}
            if(this.dialogEmployeeData.role_list.find(item => item.role_id == addItem.role_id)) {
                return
            }
            let newArr = [...this.dialogEmployeeData.role_list,...[addItem]]
            this.$set(this.dialogEmployeeData, 'role_list', newArr)
        },

        delRole(data) {
            let newArr = this.dialogEmployeeData.role_list.filter(item => item.role_id != data.role_id)
            this.$set(this.dialogEmployeeData, 'role_list', newArr)
        },

        async sendRole() {
            let localParams = {
                id: this.dialogEmployeeData.id
            }
            let role_list = this.dialogEmployeeData.role_list.map(item => +item.role_id)
            try {
                await this.axios.put(`/api/1.0/user/:id`, {role_list}, {localParams})
                this.globalSearch(true)
                this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'success',
                        title: 'Роли сохранены.'  
                    })
            } catch (error) {
                console.log(error)
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: `Ошибка сохранения ролей: ${error.data?.ERR_MSG || error.message || error}`  
                })
            }

                    },

        globalSearch(is_force) {
            if(this.employeeLoader) {
                return
            }
            this.employeeLoader = true
            if (is_force || (this.prevSearchVal && this.prevSearchVal.trim() != this.globalSearchVal.trim())) {
                this.offset = 0;
                this.searchEmployee = []
                this.searchEmployeeTable = []
                this.$set(this, 'searchEmployeeTable', [])
            }

            let params = {
                text: this.globalSearchVal,
                without_performers: true,
                limit: 6,
                offset: this.offset
            }

            this.axios.get(`/api/1.0/search`, {params})
            .then(data => {
                let arr = [...this.searchEmployeeTable, ...data.data];
                arr = arr.map(employee => {
                    let roleArr = []
                    if(employee.role_id) {
                        roleArr = employee.role_id.split(';')
                    }
                    employee.role_list = roleArr.map(item => {
                        item = {role_id: +item, role_name: this.dialogData.role_list.find(role => {return role.value == item}).text}
                        return item
                    })
                    return employee
                })
                this.searchEmployee = data.data
                this.offset = 6 + this.offset;
                this.prevSearchVal = this.globalSearchVal;
                this.$set(this, 'searchEmployeeTable', arr)
                this.employeeLoader = false
            }).catch(() => {
                this.employeeLoader = false
            })
        },
        check(val) {
            if(val.key.length > 1) {
                return
            }
            if(this.searchTimeoutId) {
                clearTimeout(this.searchTimeoutId)
                this.searchTimeoutId = ''
            }
            if (val && this.globalSearchVal) {
                if (this.prevSearchVal && this.prevSearchVal.trim() != this.globalSearchVal.trim()) {
                    this.offset = 0;
                    this.searchEmployee = []
                    this.searchEmployeeTable = []
                    this.$set(this, 'searchEmployeeTable', [])
                }

                this.searchTimeoutId = setTimeout(() => {
                let params = {
                    text: this.globalSearchVal,
                    limit: 6,
                    without_performers: true,
                    offset: 0
                }

                                if(this.employeeLoader) {
                    return
                }
                this.employeeLoader = true
                this.axios.get(`/api/1.0/search`, {params})
                    .then(({data}) => {
                        data = data.map(employee => {
                            let roleArr = []
                            if(employee.role_id) {
                                roleArr = employee.role_id.split(';')
                            }
                            employee.role_list = roleArr.map(item => {
                                item = {role_id: +item, role_name: this.dialogData.role_list.find(role => {return role.value == item}).text}

                                return item
                            })
                            return employee
                        })
                        this.employeeLoader = false
                        this.searchEmployee = data
                        this.offset = 6 + this.offset;
                        this.searchEmployeeTable = data
                        this.prevSearchVal = this.globalSearchVal;
                        this.searchTimeoutId = ''
                    }).catch(() => {  this.employeeLoader = false });
                }, 1000);
            }
        },
    },

    created() {
        this.axios.get(`/api/1.0/lov/ref.role`)
        .then(data => {
            this.dialogData.role_list = data.data.reduce((acc, item) =>{
                    acc.push({
                        text: item.name,
                        value: item.id
                    })
                return acc
            }, [])
        })
    },
}
</script>