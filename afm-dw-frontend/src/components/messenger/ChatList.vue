<template>
  <v-list subheader :height="this.privateType ? '70vh' : '78vh' " class="mt-6 vertical_scroll" >
    <v-subheader>Недавние чаты</v-subheader>
    <div v-for="chat in CHATS"  :key="chat.chat_id">
    <v-list-item
      class="v-list-item"
      v-if="chat.is_hidden_users == null || !chat.is_hidden_users.split(';').includes(`${userId}`)"
      :class="chat.chat_id == SELECTED_CHAT.chat_id ? 'active' : ''"
      @click="selectChat(chat)"
    >
      <v-badge
        
        :color="unreadCount(chat.chat_id).count ? 'green' : 'transparent'"
        overlap
        :content="unreadCount(chat.chat_id).count"
        left
        offset-y="25"
        offset-x="25"
      >
        <v-list-item-avatar>
          <v-icon v-if="chat.chat_type_id == 2">mdi-account-group</v-icon>

          <!-- <v-avatar v-if="chat.chat_type_id == 1"> -->
          <v-img
            v-if="chat.chat_type_id == 1"
            :src="avatar(chat.employee_id)"
          ></v-img>
          <!-- </v-avatar> -->
        </v-list-item-avatar>
      </v-badge>
      <v-list-item-content class="chat-content">
        <v-list-item-title
          class="text-wrap title "
          :color="'purple'"
          v-text="
            chat.name?chat.name:'Сохраненное'
          "
        ></v-list-item-title>
      
      <p class="last-message " v-if="WRITING.find(el => el.chat_id == chat.chat_id)">
        {{ WRITING.find(el => el.chat_id == chat.chat_id).user_name + " пишет..."  }}
      </p>
      <p v-else-if="!chat.last_message_deleted" class="last-message ">
          {{ chat.last_message ? (chat.last_message_user == userId ?  'Вы: '+ chat.last_message :  chat.last_message_user_name + ": " + chat.last_message ) : '...' }}
      </p>
      <p v-else class="last-message">
        сообщение удалено
      </p>
      </v-list-item-content>
      <div>
      
      <p class="time-content">
        <v-icon v-if="chat.last_message_user == userId" small class="mb-1">
                  {{chat.is_readed ? `mdi-check-all` : `mdi-check` }}
        </v-icon>
        {{ 

            chat.last_date ?
            (new Date(chat.last_date  + '+0000').getFullYear() === new Date().getFullYear() && 
                   new Date(chat.last_date  + '+0000').getMonth() === new Date().getMonth() && 
                  new Date(chat.last_date  + '+0000').getDate() === new Date().getDate() ? $moment(new Date(chat.last_date + '+0000')).format('HH:mm')
                  :  $moment(new Date(chat.last_date + '+0000')).format('DD.MM.yyy')) : 
             '' 
            }}</p>
      </div>
    </v-list-item>
  </div>
  </v-list>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
  data: () => ({
    searchChat: "",
    last_dates: [],
  }),
  props: {
    privateType: { type : Boolean }
  },
  computed: {
    ...mapGetters([
      "SELECTED_CHAT",
      "CHATS",
      "UNREADED_MESS_SUMM",
      "UNREADED_MESSAGES",
      "LOADING_CHATS",
      "CHAT_AVATARS",
      "RECENT_CHATS",
      "WRITING",
      "PREV_CHATS"
    ]),
    userId: function () {
      return this.$userData.id;
    },
    unreadCount() {
        return (chat_id) =>
        this.UNREADED_MESSAGES.find((el) => el.chat_id == `${chat_id}`)
          ? this.UNREADED_MESSAGES.find((el) => el.chat_id == `${chat_id}`)
          : 0;
    },
    avatar() {
      return (employee_id) =>
        this.CHAT_AVATARS.find((el) => el.user_id == `${employee_id}`)
          ? this.CHAT_AVATARS.find((el) => el.user_id == `${employee_id}`)
          : require("@/assets/img/default_employee.png");
    },

     },
  methods: {
    ...mapActions([
      "CHANGE_CHAT_ROOM",
      "ADD_ROOM",
      "GET_MESSAGES",
      "GET_CHAT_USERS_FROM_API",
      "GET_UNREADED_MESSAGES",
      "GET_AVATAR",
      "GET_LAST_MESSAGES",
      "READ_MARK",
      "MARK_READED_MESSAGES"
    ]),

        ...mapMutations(["SET_INSERTED_MESSAGE", "SET_MODAL", "SET_WRITING", 'REMOVE_UNREADED_MESS', "SET_READED"]),

    async selectChat(chat) {
      if(chat.chat_id != this.SELECTED_CHAT.chat_id){
        this.$socket.emit("joinRoom", chat.chat_id);
        await this.CHANGE_CHAT_ROOM(chat);
        let messChat = { chat_id: chat.chat_id, offset : 0};
        await this.GET_MESSAGES(messChat);
        this.GET_CHAT_USERS_FROM_API(chat.chat_id);
        this.SET_INSERTED_MESSAGE({})
        this.SET_MODAL(false)
        this.$socket.emit("readed", { chat_id: chat.chat_id, lang: this.$i18n.locale, user_id: this.$userData.id });
        setTimeout(() => this.unreadCounter(), 1500);
      }
    },
    async unreadCounter() {
        var chats_ids = []
        for(let el of this.CHATS){
          chats_ids.push(el.chat_id)
        }

        await this.GET_UNREADED_MESSAGES({chat_ids: chats_ids})
        setTimeout(() =>  this.$forceUpdate(), 1000);
      },
    async getAvatars() {
      let chats = this.CHATS.filter((el) => el.chat_type_id == 1);
      for (let chat of chats) {
        let src = await this.$getVuexStoreFile(chat.employee_id, 1);
        let avatar = { user_id: chat.employee_id, src: src ? src : require("@/assets/img/default_employee.png") };
        this.GET_AVATAR(avatar);
      }
    },
    chatsIconsLoad() {
      if (this.LOADING_CHATS===false) {
      this.unreadCounter()
      this.getAvatars()
      } else {
        setTimeout(() => this.chatsIconsLoad(), 3000);
      }
    },
    async getLastMessages(){
      var chats = []
      this.CHATS.map((e) => {
        chats.push(e.chat_id)
      })
      var data = await this.GET_LAST_MESSAGES({ chats : chats })
      await data.map((e) => {
        if(e != null){
          var index = 0
          this.CHATS.map((el) => {
            if(el.chat_id == e.chat_id){
              this.CHATS[index]['last_message'] = e.message
              this.CHATS[index]['last_date'] = e.create_date
              this.CHATS[index]['last_message_user'] = e.user_id
              this.CHATS[index]['last_message_user_name'] = e.first_name
              this.CHATS[index]['last_message_deleted'] = e.is_deleted
              this.CHATS[index]['is_readed'] = e.is_readed
            }
            index += 1
          })
        }
      })
      if(!navigator.userAgent.includes("Firefox")){
          await this.CHATS.sort(
              function
              (a,b){
                if(b.last_date){
                  return new Date(b.last_date) - new Date(a.last_date);
                } else {
                  return -1;
                }
              });
        } else {
          await this.CHATS.sort(
              function
              (a,b){
                if(b.last_date){
                  if(new Date(b.last_date) < new Date(a.last_date)){
                    return -1
                  } else {
                    return 1;
                  }
                } else {
                  return -1
                }
              });
        }
    },
  },
  sockets: {
    unreadedMessages: async function (chat_id) {

            await this.getLastMessages()
      if(this.SELECTED_CHAT.chat_id && chat_id == this.SELECTED_CHAT.chat_id){
        await this.MARK_READED_MESSAGES({ chat_id : this.SELECTED_CHAT.chat_id})
        this.$socket.emit("readed", { chat_id: this.SELECTED_CHAT.chat_id, lang: this.$i18n.locale, user_id: this.$userData.id });
      } else {
        await this.unreadCounter();
      }
    },
    readed: async function (data){
      if(data.user_id != this.$userData.id){
        await this.READ_MARK(data)
        this.$forceUpdate();
      }
    },
    writing: async function (data){
        this.SET_WRITING({ user_name : data.user_name, chat_id : data.chat_id })
    },
    unwriting: async function (data){
        this.SET_WRITING({ chat_id : data.chat_id })
    }

  },

    created() {
    this.chatsIconsLoad()
  },
  watch: {
    async LOADING_CHATS(){
      if(!this.LOADING_CHATS){
        this.getLastMessages()
      }
    },
  },
};
</script><style scoped>
.time-content{
  font-size: 13px;
  margin-bottom: 45px;
}
.last-message{
  font-size: 14px;
  color : rgb(63, 63, 63);
  width: 110px!important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 10px;
  margin-right: 6px;
}
.v-list-item {
  padding-left: 0px!important;
  margin-left: 3px;
  margin-right: 3px;
}
.active{
  background: linear-gradient( rgb(214, 232, 248), rgb(192, 203, 250));
  border-radius: 6px;
}
.title{
    font-size: 14px!important;
    font-weight: 600;
    color: rgb(36, 36, 36);
    
  }
.vertical_scroll {
  overflow-x: auto!important;
  overflow-y: auto!important;
  scrollbar-width: thin !important;
}
/* ::-webkit-scrollbar {
  width: 0;
} */
::-webkit-scrollbar {
  width: 10px;    
}
::-webkit-scrollbar-thumb {
  background-color: rgb(170, 170, 170);   
  border-radius: 20px;   
}
::-webkit-scrollbar-thumb:hover{
  background-color: rgb(155, 155, 155);
}
</style>