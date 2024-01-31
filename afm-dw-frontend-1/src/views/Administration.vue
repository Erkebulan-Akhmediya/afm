<template>
    <div style="padding: 30">
        <v-row>
            <v-col><h2>{{$t('administration.administration')}}</h2></v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'event')"
                    :to="'/administration/news'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    {{$t('globalWords.news')}}
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'event')"
                    :to="'/administration/events'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    {{$t('globalWords.events')}}
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'tests')"
                    :to="'/administration/tests'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    Тесты
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'users')"
                    :to="'/administration/users'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    {{$t('administration.users')}}
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'departments')"
                    :to="'/administration/departments'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    {{$t('globalWords.departments')}}
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'inflected')"
                    :to="'/administration/inflected'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    {{$t('administration.declinations')}}
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'request_rules')"
                    :to="'/administration/request_rules'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    Маршрут согласования
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'kpi')"
                    :to="'/administration/kpi'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    KPI
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'feedbacks')"
                    :to="'/administration/feedbacks'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    Служба поддержки
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'email_server')"
                    :to="'/administration/email_server'"
                    outlined
                    class=" btnStyled mr-4 my-2"
                    color="#5787A4"
                    >
                    Почтовый сервер
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'report_form')"
                    :to="'/administration/report_form'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    Отчеты
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'service_admin')"
                    :to="'/administration/service_request'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    СП исполнители
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'service_admin')"
                    :to="'/administration/service_type'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    СП категории
                </v-btn>
                <v-btn
                    v-if="$isAdminRules($userData.role, 'service_admin')"
                    :to="'/administration/another_user'"
                    outlined
                    class=" btnStyled mr-4"
                    color="#5787A4"
                    >
                    СП пользователи
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                
                <div><router-view style="background-color: #fff; padding: 15px 30px;"></router-view></div>
                <!-- <div v-else><h2>Доступ запрещен</h2></div> -->
            </v-col>
        </v-row>
    </div>
</template>
<script>
export default {
    data: function() { 
        return{
        }},
    methods: {
        getAcceptTab() {
            if(!this.$router.history.current.name) {
                if(!this.$isAdminRules(this.$userData.role, 'event')) {
                    let route = ''
                    Object.keys(this.$adminRolesData).map(item => {
                        item;
                        // if(this.$isAdminRules(this.$userData.role, item) && !route && item != 'menu') {
                        //     route = item
                        // } else {
                        //     route = item
                        // }
                        route = 'users'
                    })
                    if(route) {
                        this.$router.push({ path: `/administration/${route}` });
                    } else {
                        this.$router.push({ path: `/` });
                    }
                } else {
                    this.$router.push({ path: `/administration/news` });
                }
            }
        }
    },
    watch: {
    },
    created() {
        this.getAcceptTab()
    },
    updated() {
        this.getAcceptTab()
    }
}
</script>