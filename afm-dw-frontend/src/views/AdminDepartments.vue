<template>
    <div v-if="$isAdminRules($userData.role, 'departments')">
        <v-row>
            <v-col>
                <SearchForm placeholder="searchPlaceholder.globalSearchDep" @search="searchDepartment" />
            </v-col>    
        </v-row>
        <v-row>
            <v-col>
                <DepartmentTable @openModal="openModal" :departments="searchDepartmentTable" :loader="loader"/>
            </v-col>
        </v-row>
        <v-dialog
            v-model="dialog"
            width="700"
            @input="v => v || clearDialog()"
            >
            <v-card>
                <v-card-title class="text-h5 blue lighten-2" dark>
                    Изменить департамент
                </v-card-title>
                <v-card-text>
                <h2 class="mt-2 mb-4" style="font-size: 1.2rem;"><b> {{dialogData ? dialogData.name : ''}}</b></h2>
                <v-text-field 
                        class="mb-2"
                        outlined 
                        hide-details 
                        v-if="dialogData"
                        v-model="dialogData.view_priority" 
                        label="Приоритет">

                </v-text-field>
                
                <v-select
                    v-model="department_type"
                    :items="departmentTypes"
                    dense
                    outlined
                    hide-details
                    class="mb-2 mt-2"
                    label="Тип департамента"
                    clearable
                ></v-select>
                <div class="mb-4" style="display: flex; align-items: center; height: 30px;">
                    <h2>Руководитель:<b> {{dialogData && dialogData.manager_name ? dialogData.manager_name : 'Нет руководителя'}}</b></h2>
                    
                    <v-btn
                        v-if="dialogData && dialogData.manager_name && dialogData.manager_name != 'Нет руководителя'"
                        icon
                        class="ma-2"
                        @click.stop="deleteManagerId()"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>

                <div style="padding: 10px 20px; border: 1px solid #d4d4d4;">
                    <h2>Назначить или изменить руководителя:</h2>
                    <v-row>
                        <v-col>
                            <div style="margin-top: 1rem;">
                                <SearchForm ref="employeeSearchForm" placeholder="mainPage.search.globalSearch" @search="searchEmployee" />
                            </div>
                        </v-col>    
                    </v-row>
                    <v-row>
                        <v-col>
                            <EmployeeTableSmallSearch @clickOnRow="selectEmployee" :employeeTable="searchEmployeeTable" :adminUsersForm="false"
                            ></EmployeeTableSmallSearch>
                        </v-col>
                    </v-row>
                    <small>* Для назначения руководителя нажмите на пользователя</small>
                </div>

                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    color="red darken-1"
                    text
                    @click="dialog = false"
                >
                    Отмена
                </v-btn>

                <v-btn
                    color="green"
                    text
                    @click="setManager"
                >
                    Сохранить
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
    <div v-else><h2>Доступ запрещен</h2></div>
</template>
<script>
import DepartmentTable from '@/components/AdminDepartmentTable';
import SearchForm from '@/components/GlobalSearch';

export default {
    name: 'AdministationDepartmentsPage',
    components: {
        DepartmentTable,
        SearchForm
    },
    data() {
        return {
            dialog: false,
            dialogData: null,
            searchEmployeeTable: [],
            searchDepartmentTable: [],
            selectEmployeeData: null,
            departmentTypes: [],
            department_type: ''
        }
    },
    async created() {
        await this.getDepartments();
        await this.getDepartmentTypes()
    },
    methods: {
        async getDepartmentTypes() {
            this.departmentTypes = []
            let {data} = await this.axios.get(`/api/1.0/lov/ref.department_type`)
            data = data.filter(item => item.id > 0)
            this.departmentTypes = data.map(item => {
                return {
                    text: item.name,
                    value: item.id
                }
            })
        }, 

        deleteManagerId() {
            this.dialogData.manager_id = null
            this.dialogData.manager_name = ''
        },

        async getDepartments() {
            try {
                this.loader = true;

                let params = {
                    admin_page: true
                }
                const {data: data} = await this.axios.get('/api/1.0/department', {params});
                this.searchDepartmentTable = data;
                this.loader = false;
            } catch(e) {
                console.log(e);
            }
        },
        clearDialog() {
            this.$refs.employeeSearchForm.clearData();
            this.searchEmployeeTable = []
        },
        async setManager() {
            try {
                this.dialog = false;
                let localParams = {
                    id: this.dialogData.id
                }
                await this.axios.put(`/api/1.0/department/:id`, { 
                    department_type: this.department_type,
                    manager_id: this.dialogData.manager_id,
                    view_priority: this.dialogData.view_priority || null,
                }, {localParams})
                this.getDepartments()
            } catch(e) {
                console.log(e);
            }
        },
        openModal(item) {
            this.dialog = true;
            this.department_type = item.department_type_id
            this.dialogData = Object.assign({}, item) ;
        },
        selectEmployee(employee) {
            this.dialogData.manager_name = `${employee.last_name} ${employee.first_name} ${employee.middle_name}` 
            this.dialogData.manager_id = employee.id

            this.$swal({
                    title: `Вы действительно хотите назначить ${employee.last_name} ${employee.first_name} ${employee.middle_name} руководителем департамента "${this.dialogData.name}" ?`,
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonText: "Отмена",
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Да'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await this.setManager(employee)
                            await this.getDepartments()
                            this.clearDialog()
                        } catch (e) {
                            console.log(e)
                        }
                    }
                })
        },
        async searchEmployee(search) {
            try {
                let params = {
                    without_performers: true,
                    text: search
                }
                const {data: data} = await this.axios.get(`/api/1.0/search`, {params});
                this.searchEmployeeTable = data;
            } catch (e) {
                console.log(e)
            }
        },
        async searchDepartment(search) {
            try {
                let params = {
                    text: search,
                    search_dep: true,
                    admin_page: true
                }
                const {data: data} = await this.axios.get(`/api/1.0/search`, {params});
                this.searchDepartmentTable = data;
            } catch (e) {
                console.log(e)
            }
        }
    }
}
</script>