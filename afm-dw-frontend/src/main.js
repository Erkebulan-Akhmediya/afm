import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import './assets/scss/main.scss'
import axios from 'axios'
import VueAxios from 'vue-axios'
import moment from 'moment'
import vueDebounce from 'vue-debounce'
import i18n from './i18n'

import DatetimePicker from 'vuetify-datetime-picker'
import CKEditor from '@ckeditor/ckeditor5-vue2';
import VueSweetalert2 from 'vue-sweetalert2';
import * as crypto from 'crypto-js';
import '@mdi/font/css/materialdesignicons.css'
import VueCoreVideoPlayer from '@algoz098/vue-player'
import VueSocketIO from 'vue-socket.io'
import SocketIO from 'socket.io-client'
import { VTooltip } from 'vuetify'

import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  BarChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent
]);
Vue.component('v-chart', ECharts)

import 'sweetalert2/dist/sweetalert2.min.css';

axios.defaults.params = {
  lang: i18n.locale,
};
axios.defaults.baseURL = `${window.location.protocol}//${window.location.hostname}:8000` 

axios.interceptors.request.use(
  (config) => {

    let token = sessionStorage.getItem('token');
    if(token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if(config.localParams) {
      for (let param in config.localParams) {
        let add = crypto.AES.encrypt(JSON.stringify(config.localParams[param]), 'secret-key').toString()
        config.url = config.url.replace(`:${param}`, add.replace(/\//g, 'SiZd8muVgR'))

      }
    }

    if(!config.params.value && !(config.data instanceof FormData)) {
      config.params = {
        value: crypto.AES.encrypt(JSON.stringify(config.params), 'secret-key').toString()
      }
    }

    if (!(config.data instanceof FormData)) {
      config.data = {
        value: crypto.AES.encrypt(JSON.stringify(config.data), 'secret-key').toString()
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

  axios.interceptors.response.use(
    response => {
    if (response.data && !(response.data instanceof Blob)
                      && response.config?.url != '/api/1.0/reference/doc_workplace'
                      && response.config?.url != '/api/1.0/reference/pdf_workplace'
                      && response.config?.url != '/api/1.0/reference/doc_jbk'
                      && response.config?.url != '/api/1.0/reference/doc_getHoliday'
                      && response.config?.url != '/api/1.0/reference/doc_Exp'
                      && response.config?.url != '/api/1.0/reference/doc_Pen'
                      && response.config?.url != '/api/1.0/reference/pdf_object'
                      && response.config?.url != '/api/1.0/reference/pdf_worklist'
                      && response.config?.url != '/api/1.0/reference/pdf_candidate') {
      let bytes = crypto.AES.decrypt(response.data, 'secret-key');
      let originalText = bytes.toString(crypto.enc.Utf8);
      let responseData
      try { responseData = JSON.parse(originalText); } catch (e) { responseData = originalText; }
      response.data = responseData;
    }
    return response
  }, (error => {
    return Promise.reject(error.response);
  })
)
Vue.prototype.$convertDate = function (in_date, installation = null) {

  if(typeof(in_date) == 'object')
  {
    in_date = moment(in_date).format('DD.MM.YYYY HH:mm:ss')
  }

  let [date, time] = in_date.replace(/T/gi, ' ').split(' ');
  let new_date = date.split('-').reverse().join('.');
  let new_time = ''
  if(time){
    new_time = time.substring(0, 8);
  }
  if (installation == 'date') {
    return new_date;
  }
  return `${new_date} ${new_time}`;
}

Vue.prototype.$crypto = function(data, type = "encrypt") {
  if (type == "encrypt") {
    let crypto_string
    do
    {
      crypto_string = crypto.AES.encrypt(data, 'secret-key').toString();
    }while (crypto_string.includes('//') || crypto_string.includes('/'))
    return crypto_string
  }
  if (type == "decrypt") {
    let bytes = crypto.AES.decrypt(data, 'secret-key');
    let originalText = bytes.toString(crypto.enc.Utf8);
    return originalText
  }
};
Vue.config.productionTip = false
Vue.component('SideBarNavMin', require('./components/SideBarNavMin.vue').default)
Vue.component('MainNews', require('./components/MainNews.vue').default)
Vue.component('MainEvents', require('./components/MainEvents.vue').default)
Vue.component('MainApps', require('./components/MainApps.vue').default)
Vue.component('MainLates', require('./components/MainLates.vue').default)
Vue.component('MainBirthday', require('./components/MainBirthday.vue').default)
Vue.component('MainCheckDoc', require('./components/MainCheckDoc.vue').default)

Vue.component('EventCards', require('./components/EventCards.vue').default)

Vue.component('EmployersExpander', require('./components/EmployeesExpander.vue').default)
Vue.component('EmployeeTable', require('./components/EmployeeTable.vue').default)
Vue.component('EmployeeTableSmallSearch', require('./components/EmployeeTableSmallSearch.vue').default)
Vue.component('EmployeeDepartmentOrganization', require('./components/EmployeeDepartmentOrganization.vue').default)
Vue.component('reportLaborDisciplineExpander', require('./components/reportLaborDisciplineExpander.vue').default)
Vue.component('PRVReportExpander', require('./components/PRVReportExpander.vue').default)

Vue.component('EmployeeTabs', require('./components/EmployeeTabs.vue').default)
Vue.component('EmployeeTabInvoc', require('./components/EmployeeTabInvoc.vue').default)
Vue.component('EmployeeTabOpv', require('./components/EmployeeTabOpv.vue').default)
Vue.component('EmployeeTabSalary', require('./components/EmployeeTabSalary.vue').default)
Vue.component('EmployeeTabOtherReference', require('./components/EmployeeTabOtherReference.vue').default)
Vue.component('EmployeeTabVisits', require('./components/EmployeeTabVisits.vue').default)

Vue.component('CalendarBlock', require('./components/CalendarBlock.vue').default)
Vue.component('CalendarBtn', require('./components/CalendarBtn.vue').default)

Vue.component('GeneralReferenceTable', require('./components/GeneralReferenceTable.vue').default)

Vue.component('DialogInformation', require('./components/DialogInformation.vue').default)

Vue.component('DepartmentTableSmallSearch', require('./components/DepartmentTableSmallSearch.vue').default)

Vue.component('KnowBaseExpander', require('./components/KnowBaseExpander.vue').default)
Vue.component('vue-player', VueCoreVideoPlayer)
Vue.component('DiscussionCard', require('./components/DiscussionCard.vue').default)
Vue.component('DiscussionForm', require('./components/DiscussionForm.vue').default)
Vue.component('DiscussionArea', require('./components/DiscussionArea.vue').default)
Vue.component('AnswerCard', require('./components/AnswerCard.vue').default)
Vue.component('NotificationSnackbars', require('./components/NotificationSnackbars.vue').default)

Vue.component('RemoteErdr', require('./components/RemoteErdr.vue').default)
Vue.component('individualRatingUniversal', require('./components/individualRatingUniversal.vue').default)
Vue.component('appealRatingUniversal', require('./components/appealRatingUniversal.vue').default)
Vue.component('VTooltip', VTooltip)

moment.locale('ru');
Vue.prototype.$moment = moment;

Vue.use(VueAxios, axios, moment)
Vue.use(vueDebounce)
Vue.use(VueCoreVideoPlayer)
Vue.use(DatetimePicker)
Vue.use(CKEditor)
Vue.use(VueSweetalert2);

const socketConnection = SocketIO(axios.defaults.baseURL, {withCredentials: false});

Vue.use(new VueSocketIO({
  debug: false,
  connection: socketConnection,
  vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
  },
  options: {
    reconnection: true
  } 
}))

const optionsAlert = {
  fire: {
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  }
}
Vue.prototype.$optionAlert = optionsAlert;

const userData = {
  id: sessionStorage.getItem('userId'),
  role: sessionStorage.getItem('role'),
  fullData: JSON.parse(sessionStorage.getItem('userdata'))
}
Vue.prototype.$userData = userData;

Vue.prototype.$downloadFile = function (item) {
      let config = {
        responseType: "blob",
        params: {
          id: item.file_id,
        },
      };
      this.axios.get(`/api/1.0/fileDownload`, config).then((response) => {
        let blob = new Blob([response.data], {
          type: "application/document",
        });
        const a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = item.file_name;
        a.click();
        a.remove();
      });
    },

Vue.prototype.$getBackendMinioFile = function(objectId, objectType, fileId = null) {
  objectId; objectType; fileId;
  // return new Promise((resolve) => {
  //   let config = {
  //     params: {
  //       objectType: objectType,
  //       object: objectId
  //     }
  //   }

  //       if(fileId != null){
  //     config.params['id'] = fileId
  //   }

    // this.axios.get(`/api/1.0/file-link`, config)
    //   .then((response) => {
    //       resolve(response.data);
    //   })
    //   .catch(() => {
    //       resolve('')
    //   })
  // })
};

Vue.prototype.$getVuexStoreFile = async function(objectId, objectType) {
  let rez

    let storeData = store.getters.FILES
  let isFinded = storeData.find(el=>el.objectType == objectType && el.object == objectId)

  if(!isFinded) {
    await store.dispatch('LOAD_FILE', {
      objectType: objectType,
      object: objectId
    });
  } else {
    return isFinded.src
  }

  storeData = store.getters.FILES
  rez  = storeData.find(el=>el.objectType == objectType && el.object == objectId)

  return rez ? rez.src : rez
};

Vue.prototype.$adminRolesData = {
  menu: ['6', '7', '8', '10', '11', '43', '34', '47', '48', '49'],
  event: ['6'],
  tests: ['10'],
  users: ['7'],
  departments: ['47'],
  inflected: ['48'],
  request_rules: ['8'],
  kpi: ['11'],
  feedbacks: ['34'],
  email_server: ['49'],
  report_form: ['43'],
  service_admin: ['34'],
}

Vue.prototype.$isAdminRules = function(roles, type) {
  if(!roles || !type) {
    return false
  }

  let localRoles
  if(typeof roles == 'string') {
    localRoles = roles.split(';')
  } else if(Array.isArray(roles)) {
    localRoles = roles
  } else {
    return false
  }

  const adminRoles = Vue.prototype.$adminRolesData[type] || []

  let isAdmin = false
  adminRoles.map(role => {
    if(localRoles.includes(role)) {
      isAdmin = true
    }
  })
  return isAdmin
};

new Vue({
  editor: CKEditor,
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
