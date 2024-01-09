<template>
  <div style=" width: 100%">
    <div style="width: 100%; display: flex; align-items: stretch">
      <div style="position: relative;">
        <div class="drawerFrame">
          <div class="drawerBtb"
            :style="configCode == `afm` ? `background-color: #18073a;` : `background-color: #0e304c;`"
          @click="changeMenuWidth">
            <v-icon class="drawerIcon" color="blue lighten-2">
              {{ mini ? "mdi-chevron-right" : "mdi-chevron-left" }}
            </v-icon>
          </div>
        </div>
        <div style="position: sticky; top: 0; background-color: #0065a2; z-index: 3;">
          <SideBarNavMin
            ref="sidebar"
            style="min-height: 100vh"
          ></SideBarNavMin>
          <div :style="this.NOTIFICATION.length > 0 ? `opacity: 1.0` : `opacity: 0.0;`" class="notification-container">
          <div v-for="(notif, key) in this.NOTIFICATION" :key="key" class="notification">
            <div style="display: flex; justify-content: space-between; align-items: center; height: 30px;">
              <div style="font-weight: 600;">
                  {{ notif.name }}
              </div>
              <v-btn
                    icon
                    @click.stop="() => { CLOSE_NOTIFICATION(key) }"
                >
                <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
            <div style="font-weight: 500;">
                {{ notif.message }}
            </div>
          </div>
          </div>
        </div>
      </div>

      <div style="width: 100%; min-height: 100vh;">
        <v-card color="grey lighten-4" flat tile style="z-index: 4 !important;">

          <v-toolbar dense>
            <!--Если внешний исполнитель, даем только экран Службы поддержки-->
            <v-btn icon @click="showSearch()" :disabled="isExternalPerformer">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <v-text-field
              v-show="isVisibleSearchField"
              hide-details
              :placeholder="$t('mainPage.search.globalSearch')"
              v-model="globalSearchVal"
              @keydown.enter="globalSearch"
              @keydown="check"
              single-line
              ref="searchField"
              @focus="globalSearchFocus = true"
              @blur="isVisibleSearchField = !isVisibleSearchField"

            ></v-text-field>

            <v-spacer></v-spacer>

              <!--
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-bell-outline</v-icon>
                </v-btn>
              </template>
            -->
            <notification-snackbars
              :toggle = "notifications"
              />

            <!--Если внешний исполнитель, даем только экран Службы поддержки-->
            <v-tooltip bottom v-if="!isExternalPerformer">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  to="/messenger"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-badge :content="UNREADED_MESS_SUMM" :color="UNREADED_MESS_SUMM?'green':'transparent'" overlap>
                    <v-icon> mdi mdi-message-text-outline </v-icon>
                  </v-badge>
                </v-btn>
              </template>
              <span>Мессенджер</span>
            </v-tooltip>

            <!--Если внешний исполнитель, даем только экран Службы поддержки-->
            <div v-if="isVisibleByRole('31') && !isExternalPerformer">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    to="/email"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <!-- <v-badge content="1" color="green" overlap> -->
                      <v-icon> mdi-email-outline </v-icon>
                    <!-- </v-badge> -->
                  </v-btn>
                </template>
                <span>Email</span>
              </v-tooltip>
            </div>
            
          </v-toolbar>
        </v-card>

        <div
          @mouseenter="globalSearchOnSearch = true"
          @mouseleave="globalSearchOnSearch = false"
          v-show="openSearchTopBox && globalSearchFocus && !firstSearch"
          style="
            max-height: 450px;
            overflow-y: auto;
            width: 84%;
            box-shadow: 2px 3px 3px 1px rgba(0, 0, 0, 0.4);
     
            position: absolute;
            left: 15%;
            top: 3.5rem;
            min-height: 3rem;
            background-color: white;
            border-radius: 6px;
            z-index: 3;
          "
        >
          <span
            v-if="!searchEmployee.length"
            style="display: flex; justify-content: center; align-items: center"
          >
            {{ $t("mainPage.search.liveSearching") }}
          </span>
          <ul>
            <li
              v-for="item in searchEmployee"
              :key="item.id"
              style="margin: 1rem 1rem"
              @click="goToEmployee(item)"
              class="list-search-employee"
            >
              <div style="display: flex">
                <div>
                  <v-avatar
                    color="white"
                    size="43"
                    class="employees_table-avatar"
                  >
                    <img
                      style="object-fit: cover"
                      v-if="true"
                      :src="item.src"
                      :alt="item.first_name + ' ' + item.middle_name"
                    />
                    <span v-else class="white--text text-h5">CJ</span>
                  </v-avatar>
                </div>
                <span
                  style="
                    display: flex;
                    align-items: center;
                    margin-left: 0.8rem;
                  "
                  >{{
                    item.last_name +
                    " " +
                    item.first_name +
                    " " +
                    item.middle_name
                  }}</span
                >
                <span
                  style="
                    display: flex;
                    align-items: center;
                    margin-left: 0.8rem;
                  "
                  >{{ item.department_name + ", " + item.position_name }}</span
                >
              </div>
            </li>
          </ul>
        </div>

        <div :style="`width: 100%; display: flex; justify-content: flex-end;`">
          <v-main  fluid>
            <router-view style="padding: 30px; width: calc(100%);" />
          </v-main>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import checkRoles from '@/utils/check_role'
import Cookies from 'js-cookie'

export default {
  data: () => ({
    firstSearch: true,
    globalSearchOnSearch: false,
    globalSearchFocus: false,
    drawer: null,
    drawerRight: null,
    right: false,
    left: false,
    globalSearchVal: "",
    mini: false,
    sidebarWidth: document.body.clientWidth - 85,
    searchEmployee: [],
    openSearchTopBox: false,
    searchTimeoutId: "",
    isVisibleSearchField: false,
    configCode: '',
    notifications: false,
    document_notification: false,
    isExternalPerformer: true,
    n: null,
  }),
  methods: {
    ...mapActions(['GET_CHATS_FROM_API', 'GET_UNREADED_MESSAGES']),
    ...mapMutations(["SET_NOTIFICATION", "CLOSE_NOTIFICATION", 'SET_SELECTED_CHAT']),
     unreadCounter() {
        var chats_ids = []
        for(let el of this.CHATS){
          chats_ids.push(el.chat_id)
        }
        this.GET_UNREADED_MESSAGES({chat_ids: chats_ids})
        setTimeout(() =>  this.$forceUpdate(), 3000);
      },
    showSearch() {
      this.isVisibleSearchField = !this.isVisibleSearchField;
      setTimeout(() => {
        this.$refs.searchField.$refs.input.focus();
      });
    },
    showNotifications() {
      this.notifications = true
    },
    globalSearch() {
      if (this.$router.history.current.name == "general_reference") {
        this.$router.push("/");
        setTimeout(() => {
          this.$router.push({
            name: "general_reference",
            query: {
              text: this.globalSearchVal,
            },
          });
        }, 0);
      } else {
        this.$router.push({
          name: "general_reference",
          query: {
            text: this.globalSearchVal,
          },
        });
      }
      this.openSearchTopBox = false;
    },

    check(val) {
      if (
        val.key.length &&
        (val.key != "Backspace" || val.key != "Delete") > 1
      ) {
        return;
      }
      if (this.searchTimeoutId) {
        clearTimeout(this.searchTimeoutId);
      }
      if (val && this.globalSearchVal) {
        this.searchTimeoutId = setTimeout(() => {
          this.searchEmployee = [];

          let params = {
            without_performers: true,
            text: this.globalSearchVal,
          };
          this.axios
            .get(`/api/1.0/search`, { params })
            .then(async ({ data }) => {
              data = data.filter(i=>!i.is_edited_employee)
              await Promise.all(
                data.map(async (item) => {
                  if (!item.src) {
                    let src = await this.$getVuexStoreFile(item.id, 1)
                    this.$set(
                      item,
                      "src",
                      src ? src : require("@/assets/img/default_employee.png")
                    );
                  }
                })
              );
              this.firstSearch = false;
              this.searchEmployee = data;
              this.searchTimeoutId = "";
            });
        }, 1000);
      }
    },
    goToEmployee(data) {
      this.$router.push({
        path: `/employees/${this.$crypto(String(data.id))}`,
      });
      this.openSearchTopBox = false;
    },
    changeMenuWidth() {
      this.mini = !this.mini;
      this.$refs.sidebar.changeMenuWidth();
    },
  },
 async created() {
    this.configCode = sessionStorage.getItem('app')

    this.isExternalPerformer = JSON.parse(sessionStorage.getItem('userdata')).is_performer

    if (
      sessionStorage.getItem("role") !== this.$userData.role ||
      sessionStorage.getItem("userId") != this.$userData.id
    ) {
      this.$userData.role = sessionStorage.getItem("role").split(";");
      this.$userData.id = sessionStorage.getItem("userId");
      this.axios
        .get(`/api/1.0/employee/:id`, {
          localParams: { id: this.$userData.id },
        })
        .then((data) => {
          data.data[0].child_department_list = JSON.parse(data.data[0].child_department_list)
          this.$userData.fullData = data.data[0];
        });
    }
    if(Notification.permission == 'default'){
      await Notification.requestPermission().then(function(permission) { console.log(permission)});
    }
  },
  mounted() {
     this.GET_CHATS_FROM_API();
     setTimeout(() => this.unreadCounter(), 3000);
     document.addEventListener("visibilitychange", () => {
      if (document.visibilityState == "visible") {
        document.title = "Цифровое рабочее место"
        setTimeout(() => { Cookies.remove("document_visible") }, 500)
      } else {
        Cookies.set("document_visible", true)
      }
    });
  },
  watch: {
    globalSearchVal() {
      this.openSearchTopBox = this.globalSearchVal;
    },
    isVisibleSearchField: {
      handler(val){
        if(!val){
          this.globalSearchVal = '';
        }
      }
    },
    "$route.path": {
      handler: function (next, prev) {
        if(prev && prev.endsWith('nger')){
          console.log(next)
          console.log(prev)
          this.SET_SELECTED_CHAT({})
        }
      },
    },
  },
  computed: {
    ...mapGetters(["UNREADED_MESS_SUMM", "CHATS", "SELECTED_CHAT", "NOTIFICATION", "CHATS"]),
    isVisibleByRole() {
      return (role) =>
       checkRoles(role, this.$userData)
    },
  },
  sockets: {
    unreadedMessages: function(chat_id){

                if(!this.SELECTED_CHAT.chat_id || chat_id != this.SELECTED_CHAT.chat_id){
          this.unreadCounter();
        }
    },
    notification: async function(data){
        var name = null
        var message = null
        this.CHATS.map((item) => {
          if(this.$userData.fullData.id != data.user_id && item.chat_id == data.chat_id){
              name = item.name 
              if(item.chat_type_id == 2){
                message = 'новое сообщение'
              }
              return 
          }
        })
      if(name){
        if(!message){
          if(data.inserted){
            message = "Отправленное сообщение"
          } else {
            message = 'написал: ' + data.message
          } 
        }
      if(!this.$route.name.endsWith('nger')){
        this.SET_NOTIFICATION({ message: message, name: name})    
      }    

      if(Cookies.get('document_visible')){
        document.title = "Новое сообщение"
        if(Notification.permission == 'granted'){
          const n = new Notification(name, { body : 'новое сообщение!' });
          setTimeout(() => { n.close() }, 4000)
        }
      }
      }
    },
  },
};
</script><style lang="scss">
.notification-container{
  position: absolute;
  left: 120%;
  bottom: 10px;
  transition: all 0.3s ease!important;
}

@media screen and (min-width: 1400px) {
    .notification-container{
      left: 119vh!important;
    }
  }
  @media screen and (min-width: 1500px){
  .notification-container{
      left: 136vh!important;
    }
}
@media screen and (min-width: 1600px){
  .notification-container{
      left: 140vh!important;
    }
}
@media screen and (min-width: 1700px){
  .notification-container{
      left: 144vh!important;
    }
}
@media screen and (min-width: 1800px){
  .notification-container{
    left: 144vh!important;
    }
}
@media screen and (min-width: 2000px){
  .notification-container{
    left: 144vh!important;
    }
}
.notification{
  background-color: #fff;
  height: 70px;
  width: 280px;
  margin: 6px;
  padding: 9px;
  padding-bottom: 15px;
  border-radius: 6px;
  box-shadow: 0 3px 1em rgba(0,0,0,0.3),
                0 2px 1em rgb(187, 187, 187);
  z-index: 999;
  overflow: hidden;
  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.notification div{
  text-overflow: ellipsis!important;
  width: 270px;
  overflow: hidden;
}
.v-input__slot::before {
}
.list-search-employee:hover {
  cursor: pointer;
}

.drawerFrame {
  position: absolute;
  right: 5px;
  z-index: 2;
  top: 0;
  bottom: 0;
  .drawerBtb {
    top: 66px;
    border-radius: 0 7px 7px 0;
    position: fixed;
    padding: 5px 0;
    cursor: pointer;

    .drawerIcon {
      color: #fff !important;
    }
  }
}
</style>