<template>
    <div id="AdministationDepartmentsTableComponent">
        <v-data-table
            :hide-default-header="true"
            :headers="headers"
            :items="departments"
            :items-per-page="10"
            class="clickableTable elevation-1"
            :no-data-text="'Нет данных о департаментах'"
            @click:row="edit"
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
        </template>
        <template v-slot:[`item.view_priority`]="{ item }">
            <span>{{item.view_priority || 0}}</span>   
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
export default {
    name: 'AdministationDepartmentsTableComponent',
    data() {
        return {
            headers: [
                { text: '#', sortable: false, value: 'id'},
                { text: 'Наименование департамента', value: 'name' },
                { text: 'Руководитель департамента', value: 'manager_name' },
                { text: 'Согласующий для табелирования', value: 'approver_name' },
                { text: 'Приоритет отображения', value: 'view_priority' },
                { text: 'Приоритет отображения', value: 'organization_name' },
                { text: 'Тип департамента', value: 'department_type_name' },
                { text: '', value: 'action' }
            ]
        }
    },
    methods: {
        edit(item) {
            this.$emit('openModal', item)
        }
    },
    props: ['departments', 'loader']
}
</script>