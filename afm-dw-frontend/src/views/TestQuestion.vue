<template>
    <div v-if="$isAdminRules($userData.role, 'tests')" class="test_question">
        <v-tabs>
            <v-tab>Тесты</v-tab>
            <v-tab>Вопросы</v-tab>
            <v-tab>Прохождения</v-tab>
            
            <v-tab-item class="tabContent mt-10 fullData">
                <AdminTest>
                </AdminTest>
            </v-tab-item>
            <v-tab-item class="tabContent mt-10 fullData">
                <AdminQuestion>
                </AdminQuestion>
            </v-tab-item>
            <v-tab-item class="tabContent mt-10 fullData">
                <AdminTestPassing>
                </AdminTestPassing>
            </v-tab-item>
        </v-tabs>
    </div>
    <div v-else><h2>Доступ запрещен</h2></div>
</template>
<script>
import AdminTest from '../components/AdminTest.vue'
import AdminQuestion from '../components/AdminQuestion.vue'
import AdminTestPassing from '../components/AdminTestPassing.vue'
export default {
    components: {
        AdminTest,
        AdminQuestion,
        AdminTestPassing
    },
    data: function() {
        return {

        }
    },


}
</script>