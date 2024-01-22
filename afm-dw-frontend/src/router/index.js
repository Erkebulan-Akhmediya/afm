import Vue from 'vue'
import VueRouter from 'vue-router'
import Cookies from "js-cookie";
Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/',
    component: () => import('@/views/MainPage.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'kpi',
        name: 'Kpi',
        component: () => import('@/views/KpiGraph.vue'),
      },
      {
        path: 'employees',
        name: 'employees',
        component: () => import('@/views/Employees.vue')
      },
      {
        path: 'essay_check',
        name: 'essay_check',
        component: () => import('@/views/CheckEssay.vue')
      },
      {
        path: 'test_check',
        name: 'test_check',
        component: () => import('@/views/CheckTest.vue')
      },
      {
        path: 'live',
        name: 'LiveNews',
        props: true,
        component: () => import('@/views/LiveNews.vue')
      },
      {
        path: 'tests',
        component: () => import('@/views/Tests.vue'),
        children: [
          {
            path: ':id/InProgress',
            component: () => import('@/views/TestInProgress.vue')
          }
        ]
      },
      {
        path: 'testInProgress',
        component: () => import('@/views/TestInProgress.vue')
      },
      {
        path: 'employees/:id*',
        name: 'employeesCard',
        props: true,
        component: () => import('@/views/EmployeeCard.vue')
      },
      {
        path: 'general_reference',
        name: 'general_reference',
        component: () => import('@/views/GeneralReference.vue'),
        props: (route) => ({ text: route.query.text })
      },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('@/views/Calendar.vue')
      },
      {
        path: 'messenger',
        name: 'messenger',
        component: () => import('@/views/Messenger.vue')
      },
      {
        path: 'knowbase',
        name: 'knowbase',
        component: () => import('@/views/KnowBase.vue')
      },
      {
        path: 'knowbasegrade',
        name: 'knowbasegrade',
        component: () => import('@/views/KnowBaseGrade.vue')
      },
      {
        path: 'properties',
        name: 'properties',
        component: () => import('@/views/Properties.vue')
      },
      {
        path: '/search',
        name: 'search',
        component: () => import('@/views/GeneralReference.vue'),
        props: (route) => ({ text: route.query.text })
      },
      {
        path: '/requests',
        name: 'requests',
        component: () => import('@/views/Requests.vue')
      },
      {
        path: '/pass_requests',
        name: 'pass_requests',
        component: () => import('@/views/PassRequests.vue')
      },
      {
        path: '/pass_request/:id',
        name: 'pass_request',
        component: () => import('@/views/PassRequestCard.vue')
      },
      {
        path: '/report_instance',
        name: 'report_list',
        component: () => import('@/views/ReportList.vue')
      },
      {
        path: '/report_instance/:id',
        name: 'report_instance',
        component: () => import('@/views/ReportFilling.vue')
      },
      {
        path: 'applications',
        name: 'applications',
        component: () => import('@/views/Applications.vue')
      },
      {
        path: 'email',
        name: 'email',
        component: () => import('@/views/Email.vue')
      },
      {
        path: 'all_requests',
        name: 'all_requests',
        component: () => import('@/views/AllRequests.vue')
      },
      {
        path: 'appeals',
        name: 'appeals',
        component: () => import('@/views/Appeals.vue')
      },
      {
        path: 'appeals/:id',
        name: 'appeal-card',
        component: () => import('@/views/AppealCard.vue')
      },
      {
        path: 'servicerequests',
        name: 'servicerequests',
        component: () => import('@/views/ServiceRequest.vue')
      },
      {
        path: 'servicerequests/:id',
        name: 'servicerequest-card',
        component: () => import('@/views/ServiceRequestCard.vue')
      },
      {
        path: '/email/:id',
        props: true,
        name: 'emailmessage',
        component: () => import('@/components/email/EmailMessage.vue'),
      },
      {
        path: '/administration',
        component: () => import('@/views/Administration.vue'),
        children: [
          {
            path: 'news',
            name: 'addNews',
            props: { eventType: 'Новость', eventTypeParentCase: 'новости', eventTypeId: 1 },
            component: () => import('@/views/AdminEvent.vue')
          },
          {
            path: 'events',
            name: 'addEvent',
            props: { eventType: 'Объявление', eventTypeParentCase: 'объявления', eventTypeId: 2 },
            component: () => import('@/views/AdminEvent.vue')
          },
          {
            path: 'tests',
            name: 'tests',
            component: () => import('@/views/TestQuestion.vue')
          },
          {
            path: 'users',
            name: 'users',
            component: () => import('@/views/AdminUsers.vue')
          },
          {
            name: 'departments',
            path: 'departments',
            component: () => import('@/views/AdminDepartments.vue')
          },
          {
            name: 'inflected',
            path: 'inflected',
            component: () => import('@/views/AdminInflected.vue')
          },
          {
            name: 'request_rules',
            path: 'request_rules',
            component: () => import('@/views/AdminRequestRules.vue')
          },
          {
            path: 'kpi',
            name: 'kpi',
            component: () => import('@/views/AdminKpi.vue')
          },
          {
            path: 'feedbacks',
            name: 'feedbacks',
            component: () => import('@/views/Feedbacks.vue')
          },
          {
            path: 'email_server',
            name: 'email_server',
            component: () => import('@/views/AdminEmail.vue')
          },
          {
            path: 'report_form',
            name: 'report_form',
            component: () => import('@/views/AdminReportForm.vue')
          },
          {
            path: 'service_request',
            name: 'service_request',
            component: () => import('@/views/AdminServiceRequest.vue')
          },
          {
            path: 'service_type',
            name: 'service_type',
            component: () => import('@/views/AdminServiceType.vue')
          },
          {
            path: 'another_user',
            name: 'another_user',
            component: () => import('@/views/AdminAnotherUser.vue')
          }
        ]
      },
      { path: "*",
        component: () => import('@/views/PageNotFound.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  path:'/',
  routes
})
// eslint-disable-next-line no-unused-vars
router.beforeResolve(async (to, from, next) => {
  if (to.name !== 'Login' && !sessionStorage.getItem('token')) next({ path: '/login' })
  else next()


})





router.beforeEach((to, from, next) => {


    if(JSON.parse(sessionStorage.getItem('userdata'))) {
    if (JSON.parse(sessionStorage.getItem('userdata')).is_performer == true && !to.path.includes('servicerequest') && sessionStorage.getItem('token')) {

            next({ path: '/servicerequests' });
    } else {next()}
  }


   let sessionStorage_transfer = function(event) {
    if(!event) { event = window.event; } 
    if(!event.newValue) return;          
    if (event.key === 'getSessionStorage') {
      localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
      localStorage.removeItem('sessionStorage'); 
    }
    else if(event.key==='logout'){
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('refresh')
      sessionStorage.removeItem('userId')
      sessionStorage.removeItem('role')
      sessionStorage.removeItem('roleName')
      sessionStorage.removeItem('app')
      Cookies.remove('lang')
      Cookies.remove('userId')
      Cookies.remove('userName')
      console.log('logout');
      next({ path: '/Login' });
    }
    else if(event.key==='login'){
      console.log('login');
      let data = JSON.parse(event.newValue);
      for (let key in data) {
        sessionStorage.setItem(key, data[key]);
      }
      if (JSON.parse(sessionStorage.getItem('userdata')).is_performer == true) {
        next({path: '/servicerequests'});
      } else {
        next({path: '/'});
      }
    }
    else if (event.key === 'sessionStorage' && !sessionStorage.length) {

      let data = JSON.parse(event.newValue);
      for (let key in data) {
        sessionStorage.setItem(key, data[key]);
      }
      let userData = JSON.parse(data['userdata']);
      Vue.prototype.$store.commit('role', data['role']);
      Vue.prototype.$store.commit('roleName', data['roleName']);
      Vue.prototype.$userData.iin = userData.identification_number
      Vue.prototype.$userData.department_name = userData.department_name_rus;
    }
  }

  if(window.addEventListener) {
    window.addEventListener("storage", sessionStorage_transfer, false);
  } else {
    window.attachEvent("onstorage", sessionStorage_transfer);
  }


  if (!sessionStorage.length) {
    localStorage.setItem('getSessionStorage', 'foobar');
    localStorage.removeItem('getSessionStorage', 'foobar');
  }
  next();
})

export default router
