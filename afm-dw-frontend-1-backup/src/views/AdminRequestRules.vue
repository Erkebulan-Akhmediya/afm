<template>
    <div v-if="$isAdminRules($userData.role, 'request_rules')" id="AdministationDepartmentsTableComponent">
        <v-tabs v-model="currentTab">
            <v-tabs-slider color="#35A4DC"></v-tabs-slider>
            <v-tab v-for="item in tabItems" :key="item.id">
                {{ item.name }}
            </v-tab>
        </v-tabs>
        
        <v-tabs-items style="padding: 20px;" v-model="currentTab">
            <!--Заявления-->
            <v-tab-item>
                <AdminApproveRule :placeholder="currentTab">
                </AdminApproveRule>
            </v-tab-item>
            <!--Заявки на бюро пропуска-->
            <v-tab-item>
                <AdminApproveRule :placeholder="currentTab">
                </AdminApproveRule>
            </v-tab-item>
        </v-tabs-items>
    </div>
    <div v-else><h2>Доступ запрещен</h2></div>
</template>
<script>
import AdminApproveRule from '@/components/AdminApproveRule';
export default {
    components: {
      AdminApproveRule
    },
    name: 'AdministationDepartmentsTableComponent',
    data() {
        return {
            tabItems: [
                {name: 'Заявления'},
                {name: 'Заявки на бюро пропуска'}
            ],
            currentTab: null,
        }
    },
    methods: {
    },
    created() {
    },
    watch: {
    },
}
</script>