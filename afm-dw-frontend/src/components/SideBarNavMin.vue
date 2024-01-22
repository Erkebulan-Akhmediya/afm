<template>
    <v-navigation-drawer
    mini-variant-width="80"
    disable-route-watcher
    disable-resize-watcher
    mobile-breakpoint="0"
      id="sidebar"
      :style="`box-shadow: 6px 0px 18px rgba(0, 0, 0, 0.06); position:relative; min-height: 620px;` + (configCode == `afm` ? `background-color: #18073A;` : `background-color: #0e304c;` )"
      :mini-variant="mini"
    >
      <v-list-item class="px-5">
        <v-list-item-avatar v-if="configCode == 'afm'">
          <v-img class="logo" src="../assets/img/logo_kz_white.png"></v-img>
        </v-list-item-avatar>

        <v-list-item-title v-if="configCode == 'afm'" style="color: #fff;"> {{$t('mainPage.portalName_afm')}} </v-list-item-title>

        <v-select
          :items="availableLocales"
          :value="$i18n.locale"
          color="#fff"
          style="width: 70px; position: absolute; right: -25px; top: -5px; color: #fff;"
          @change="changeLang"
        ></v-select>
      </v-list-item>

      <v-divider></v-divider>
      <div class="d-flex flex-column justify-space-between sidebar-wrapper" style="min-height: 570px;">

      <v-list dense>
        <router-link :to="`/employees/` + $crypto(String(userId))" v-bind:class="{ routerLinkDisabled: isExternalPerformer }">
          <v-list-item class="px-5 mb-5 avatarMy">
            <v-list-item-avatar rounded="0">
              <v-img :src="employee.photo || require('@/assets/img/default_employee.png')"></v-img>
            </v-list-item-avatar>

            <v-list-item-content :style= "configCode == `afm` ? `color: #36A9E1;` : `color: #82bbd7;`">

                <v-list-item-title  style="font-size: 1rem !important;text-overflow: clip;white-space: inherit; ">
                  {{ employee.first_name }} {{employee.last_name }}
                </v-list-item-title>
                <v-list-item-subtitle :style= "configCode == `afm` ? `color: #36A9E1;` : `color: #82bbd7;`">{{employee.contact_email}}</v-list-item-subtitle>
              </v-list-item-content>
          </v-list-item>
        </router-link>

        <router-link style="text-decoration:none;" class="links" :to="item.href"
          v-for="item in items" :exact="item.title == $t('mainPage.mainMenu.home')"
          :key="item.title">{{item.name}}
            <v-list-item>
                <v-list-item-icon>
                  <v-badge v-if="item.badge" :content="badge_content(item)" :color="badge_content(item)?'green':'transparent'" overlap>
                    <v-icon v-bind:class="[{ 'link-icon-afm' : configCode == `afm` }]">{{ item.icon }}</v-icon>
                  </v-badge>
                  <v-icon v-else v-bind:class="[{ 'link-icon-afm' : configCode == `afm` }]">{{ item.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title v-bind:class="['text-wrap', { 'link-title-afm' : configCode == `afm` }]">{{ item.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </router-link>


        <!-- Пункт меню "Администрирование" -->
        <router-link style="text-decoration:none;" class="links admin-link" to="/administration"
         v-if="$isAdminRules($userData.role, 'menu')"
          >
            <v-list-item>
                <v-list-item-icon>
                    <v-icon v-bind:class="[{ 'link-icon-afm' : configCode == `afm` }]">mdi-dots-horizontal</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title v-bind:class="[{ 'link-title-afm' : configCode == `afm` }]">{{ $t('mainPage.mainMenu.property') }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </router-link>

      </v-list>

      <v-list style="position: absolute;bottom: 0; left: 0; right: 0; padding-bottom: 0;">
        <v-list-item @click="logOut" class="exitBtn">
            <v-list-item-icon>
                <v-icon style="color: #95c1dc;">mdi-power-standby</v-icon>
            </v-list-item-icon>

            <v-list-item-content style="color: #95c1dc;">
                <v-list-item-title>{{$t('mainPage.mainMenu.exit')}}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
      </v-list>
      </div>
      </v-navigation-drawer>
</template>
<script>
  import moment from 'moment'
  import Cookies from 'js-cookie'

  import { mapGetters } from "vuex";

  export default {
    data () {
      return {
        adminItems: [{
          id: 1,  name: '', data: 'Администрирование', to:'/administration/news',
          children: [
            { id: 2, name: '', data: 'Новости', to:'/administration/news'},
            { id: 3, name: '', data: 'Объявления', to:'/administration/events'},
            { id: 4, name: '', data: 'Пользователи', to:'/administration/users'},
          ],
        }],
        drawer: false,
        Cookies,
        availableLocales: this.$i18n.availableLocales,
        items: [],
        mini: false,
        userId: sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : 1,
        userName: '',
        twoLineName: '',
        employee: {},
        configCode: '',
        isExternalPerformer: true
      }
    },
    methods : {
      badge_content(item) {
        if(item.href=='/messenger') {
          return this.UNREADED_MESS_SUMM
        } else if(item.href=='/requests') {
          return this.APPROVE_REQUEST_NOTIFICATIONS.length
        }
      },
      toUpperName(str) {
        str = str.toLowerCase();
        str = str[0].toUpperCase() + str.slice(1);
        return str;
      },

      update(data) {
        if(data.length && this.$router.history.current.fullPath != this.adminItems[0].children.filter(item => item.id == data[0])[0].to) {
          this.$router.push(this.adminItems[0].children.filter(item => item.id == data[0])[0].to)
        }
      },

      async changeLang(lang) {
        this.axios.defaults.params = {
            lang: lang,
        };
        this.$i18n.locale = lang
        moment.locale(lang == 'RUS' ? 'ru' : 'kk');
        this.items = []
        await this.axios.put(`/api/1.0/lang/${lang}`)
        sessionStorage.setItem('lang', lang)
        this.$router.go(0)
      },
      changeMenuWidth() {
        this.mini = !this.mini
      },
      logOut() {
        this.$socket.emit('logout', {user_id: this.$userData.id,  timez: - new Date().getTimezoneOffset()})
        this.$userData = null
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('refresh')
        sessionStorage.removeItem('userId')
        sessionStorage.removeItem('role')
        sessionStorage.removeItem('roleName')
        sessionStorage.removeItem('app')
        Cookies.remove("ticks")
        Cookies.remove('lang')
        Cookies.remove('userId')
        Cookies.remove('userName')
        this.$router.go()
        this.$router.push({ path: '/Login' });

        localStorage.setItem('logout', 'foobar');
        localStorage.removeItem('logout', 'foobar');
      },
      changeAction() {
      },
    },
    created() {
      this.configCode = sessionStorage.getItem('app')

      this.isExternalPerformer = JSON.parse(sessionStorage.getItem('userdata')).is_performer

      if (this.isExternalPerformer) {
        this.items.push(
          { title: 'Служба поддержки', icon: 'mdi-headset', href: '/servicerequests' }
        )
      } 

      else {

                this.items.push(
          { title: this.$t('mainPage.mainMenu.tests'), icon: 'mdi-clipboard-outline', href: '/tests' },
          { title: 'Проверка психотеста', icon: 'mdi-note-text-outline', href: '/test_check'},
          { title: 'Проверка эссе', icon: 'mdi-note-text-outline', href: '/essay_check'},
        )





      }

      this.axios.get(`/api/1.0/employee/:id`, {localParams: {id: sessionStorage.getItem('userId')}})
        .then( async ({data}) => {
          this.employee = data[0]
          let email = this.employee.contacts.find(item => item.contact_info_type_id == 5)
          if (email) {
            email = email.contact;
          }
          this.$set(this.employee, 'contact_email', email ? email : '')
          this.$set(this.employee, 'last_name', this.toUpperName(this.employee.last_name))
          this.$set(this.employee, 'first_name', this.toUpperName(this.employee.first_name))
          this.$set(this.employee, 'photo', await this.$getVuexStoreFile(this.employee.id, 1))
        })
    },
    computed: {
    ...mapGetters(["UNREADED_MESS_SUMM", "APPROVE_REQUEST_NOTIFICATIONS"]),
  },
  }
</script><style lang="scss" scoped>
  .v-list-item {
    padding: 0 34px 0 27px;
  }
    .links {
      .link-title-afm {
        font-size: 13px;
        text-decoration: none;
        color: #36A9E1;
      }
      .link-icon-afm {
        color: #36A9E1;
      }
      &:hover {
        .link-title-afm {
          color: #fff;
        }
        .link-icon-afm {
          color: #fff;
        }
      }
      &.admin-link > div {
        border-top: 1px solid #EBEFF2;
        margin-top: 10px;
        padding-top: 10px;
      }
    }

    .router-link-active .v-list-item__title,
    .router-link-active .v-list-item__icon i{
        color: #fff;
    }

</style>,<style lang="scss">
  .avatarMy .v-image__image {
    border: 1px solid #fff;
    border-radius: 10px;
  }
  .router-link-active .avatarMy .v-image__image {
    border: 1px solid #109CF1;
  }

  #sidebar .theme--light.v-select .v-select__selections {
    color: #fff
  }

  .exitBtn:hover .v-list-item__title,
  .exitBtn:hover .v-icon.mdi-power-standby {
    color: #fff !important;
  }
</style>