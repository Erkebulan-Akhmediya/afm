

<template>
  <v-card height="85vh" tile class="d-flex flex-column content">
    <v-app-bar v-if="this.SELECTED_CHAT.chat_id" class="appBar" dense>
      <v-list-item-avatar class="mx-2">
        <v-icon v-if="this.SELECTED_CHAT.chat_type_id == 2">mdi-account-group</v-icon>
        <v-img v-else-if="CHAT_USERS.length > 0" :src="Avatar(this.SELECTED_CHAT.employee_id)"></v-img>
        </v-list-item-avatar>
      <v-toolbar-title class="title">{{
        SELECTED_CHAT.name
      }}</v-toolbar-title>
      <p v-if="this.WRITING.find(el => el.chat_id == this.SELECTED_CHAT.chat_id)" class="ml-4 mt-4 writing" >
        {{this.WRITING.find(el => el.chat_id == this.SELECTED_CHAT.chat_id).user_name + ' пишет...' }}
      </p>
      <v-spacer></v-spacer>

      <v-menu v-if="SELECTED_CHAT.chat_id" left bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn @click="GET_MESS_USERS()" icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>

          <div v-if="SELECTED_CHAT.chat_type_id == 2">
            <v-list-item
           
           v-for="item in CHAT_USERS"
           :key="item.user_id"
   
         >
           <v-list-item-title>{{
             item.first_name + "  " + item.last_name
           }}</v-list-item-title>
         </v-list-item>

          </div>

          <v-list-item v-if="SELECTED_CHAT.chat_type_id == 2">
            <v-btn
              @click="dialogEditGroup = !dialogEditGroup"
              color="warning"
              plain
              >Редактировать</v-btn
            >
          </v-list-item>
          <v-list-item v-else>
            <v-btn
            @click="this.hide_chat"
              color="error"
              plain
              >Удалить</v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <!-- форма редактирования группового чата  -->

    <v-dialog v-model="dialogEditGroup" persistent max-width="700">
      <edit-group-chat
        @closeDialog="closeDialog"
        @updateChatList="updateChatList"
      />
    </v-dialog>

    <v-list-item class="fill-height" v-if="LOADING_MESSAGES">
        <v-row class="fill-height" align-content="center" justify="center">
          <v-col class="text-subtitle-1 text-center" cols="12">
            Загрузка сообщений
          </v-col>
          <v-col cols="6">
            <v-progress-linear
              color="deep-purple accent-4"
              indeterminate
              rounded
              height="6"
            ></v-progress-linear>
          </v-col>
        </v-row>
      </v-list-item>
      
    <v-card-text 
            ref="scroll"
            class="vertical_scroll pb-2"
            id="chatmessages">
      <!-- Сообщения -->
      <message v-if="!LOADING_MESSAGES" :show_date="this.show_date" :scrollToMessage="this.scrollToMessage" :setModal="this.setModal" class="message" :messages="MESSAGES" />
      <!-- <p>{{file}}</p> -->
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions v-if="!this.MODAL && (this.INSERTED_MESSAGE.message && this.INSERTED_MESSAGE.message.length > 0)" >
    <div class="inserted-container">
    <div class="d-flex align-start message-inserted">
        <v-icon  large class="ml-6 mr-3">
                {{this.INSERTED_MESSAGE.message_id ? `mdi-reply` : `mdi-redo` }} 
        </v-icon>
        {{this.INSERTED_MESSAGE.message_id ? `Ответить` : `Переслать ` }} 
        <div class="devider ml-3"></div>
        <div class="bold mr-3">{{  this.INSERTED_MESSAGE.name  }} : </div>
        <div class="message-inserted-content">{{ this.INSERTED_MESSAGE.message }}</div>
       
    </div>
      <v-btn @click="() => {this.SET_INSERTED_MESSAGE({})}" style="height: 50px" color="error" text>
            <v-icon large class="ml-3 mr-3">
                  mdi-close
            </v-icon>
      </v-btn>
    </div>
    </v-card-actions>
    <v-card-actions class="send-message">
      <v-row v-if="this.SELECTED_CHAT.chat_id != null"  >
        <v-col :cols="file == null ? 11 : 1" v-if="file == null">
          <v-textarea
            class="inputs"
            label="Сообщение "
            hint="(shift+enter отправить)"
            auto-grow
            rows="1"
            row-height="15"
            v-model="text"
            @keydown.shift.enter.prevent="sendMessage()"
            append-outer-icon="send"
            @click:append-outer="sendMessage()"
            :disabled="sending_message"
          ></v-textarea>
        </v-col>
        <v-col :cols="file == null ? 1 : 11">
          <!-- <v-badge
            dot
            offset-y="20"
            offset-x="10"
            :color="file.name ? 'primary' : 'transparent'"
            @click="file={}"
          > -->
          <v-file-input
            :hide-input="file == null"
            label="Выберите файл "
            hint="(shift+enter отправить)"
            @click="mess_type_file = !mess_type_file"
            @keydown.shift.enter.prevent="sendMessage()"
            :append-outer-icon="file === null ? '' : 'send'"
            @click:append-outer="sendMessage()"
            v-model="file"
            :disabled="sending_message"
          >
          </v-file-input>
          <!-- </v-badge> -->
        </v-col>
        <!-- <v-col cols="1">
          <v-btn @click='mess_type_file=!mess_type_file' icon>
            <v-icon>{{mess_type_file?'mdi-text-box-outline':'mdi-paperclip'}}</v-icon>
          </v-btn>
          
        </v-col> -->
      </v-row>

      <!-- <v-col cols="2">
        <v-btn text color="teal accent-4" @click="sendMessage()" justify-end>
        Отправить
        </v-btn>
      </v-col> -->
      <!-- <v-btn @click="downloadFile()">avatar</v-btn> -->
    </v-card-actions>
    <div v-if="this.MODAL" :class="this.animate_modal ?`active` : `inactive`" class="modal-shadow">
    <div @click="() => { this.setModal(false); this.SET_INSERTED_MESSAGE({})}"  class="modal-close-btn">
            <v-icon large class="ml-3 mr-3" style="color: red; cursor: pointer;opacity: 0.6;">
                  mdi-close
            </v-icon> 
    </div>
    <div class="modal-form" >
    <v-list class="vertical_scroll" >
      <div v-for="chat in CHATS"  :key="chat.chat_id">
        <v-list-item v-if="chat.is_hidden_users == null || !chat.is_hidden_users.split(';').includes(`${userId}`)"  @click="selectChat(chat)"  class="v-list-item ">
          <v-list-item-avatar>
          <v-icon v-if="chat.chat_type_id == 2">mdi-account-group</v-icon>
          <!-- <v-avatar v-if="chat.chat_type_id == 1"> -->
          <v-img
            v-if="chat.chat_type_id == 1"
            :src="Avatar(chat.employee_id)"
          ></v-img>
          <!-- </v-avatar> -->
        </v-list-item-avatar>
          <v-list-item-content class="chat-content">
            <v-list-item-title
          class="text-wrap "
          :color="'purple'"
          v-text="
            chat.name?chat.name:'Сохраненное'
          "
            ></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>
    </div>

    </div>

  </v-card>
</template>


<script>
import Message from "./parts/Message.vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
import editGroupChat from "./editGroupChat.vue";

export default {
  components: {
    Message,
    editGroupChat,
  },
  data: () => ({
    fetching: true,
    writing: false,
    sending_file: false,
    sending_message: false,
    text: "",
    show_date_timeout: 2,
    show_date: false,
    dialogEditGroup: false,
    file: null,
    mess_type_file: false,
    animate_modal: false,
  }),

  mounted() {
  this.$refs.scroll.addEventListener("scroll", this.handleScroll);
  this.getAvatars();
  this.scrollToEnd()   
  },
  methods: {
    ...mapMutations(["SET_INSERTED_MESSAGE", "SET_LOADING_MESSAGES", "SET_OFFSET_CHAT",  "SET_MODAL", "SET_SENDING_FILES", "REMOVE_SENDING_FILES"]),
    ...mapActions([
      "CHANGE_CHAT_ROOM",
      "GET_MESSAGES",
      "GET_CHATS_FROM_API",
      "POST_MESSAGE",
      "ADD_MESSAGE_FROM_SOCKET",
      "GET_AVATAR",
      "GET_UNREADED_MESSAGES",
      "GET_MESS_USERS",
      "READ_MESAGES",
      "HIDE_CHAT",
      "DELETED_MESSAGE",
      "GET_LAST_MESSAGES",
      "GET_CHAT_USERS_FROM_API"
  
    ]),
    async scrollToMessage() {
    this.$refs.scroll.scrollTo({top: 0, behavior: 'smooth'});
  },
    async handleScroll(){
        if(!this.show_date){
          this.show_date = true
          this.show_date_timeout = 2
          this.handleDateAppearance()
        } else {
          this.show_date_timeout = 1
        }
        if(!this.LOADING_MESSAGES){
          if(!this.CHAT_END && !this.fetching && this.$refs.scroll.scrollTop < 140){
            this.fetching = true
            var h = this.$refs.scroll.scrollHeight
            await this.fetchingMessages()
            var distance = this.$refs.scroll.scrollHeight - h 
            this.$refs.scroll.scrollTo({top: distance + 10});
            this.fetching = false
        }
        }
    },
    async fetchingMessages(){
      var offset = this.OFFSET_CHAT + 30
      await this.SET_OFFSET_CHAT(offset)
      let messChat = { chat_id: this.SELECTED_CHAT.chat_id, fetch : true };
      await this.GET_MESSAGES(messChat);
    },

    async handleDateAppearance(){
        setTimeout(() => { 
            if(this.show_date_timeout == 2){
              this.show_date = false
            } else {
              this.show_date_timeout = 2
              this.handleDateAppearance()
            }
         }, 1000)
    },
    ///Получения Аватарок для пользователей в текущем чате, показывается только в группах
    async getAvatars() {
      let users = this.CHAT_USERS;
      for (let user of users) {
        let src = await this.$getVuexStoreFile(user.id, 1);
        let avatar = { user_id: user.id, src: src };
        await this.GET_AVATAR(avatar);

      }
    },
    goToEmployee (data){
          this.$router.push({ path: `/employees/${this.$crypto(String(data.id))}` });
      },

    updateChatList() {
      this.GET_CHATS_FROM_API();
    },
    async sendFileMessage(dat){
      if(this.file){
        const form = new FormData();
        var data = await this.axios.post("/api/1.0/messenger/messages/file", form)
        if(data.data.id){
          var file_name = this.file.name;
          form.append("chat_id", this.SELECTED_CHAT.chat_id);
          form.append("message", file_name);
          form.append("lang", this.$i18n.locale);
          form.append("user_id", this.$userData.id);
          form.append("file", this.file);
          form.append("fileType", "chatmessage");
          form.append("file_type_id", 7);
          form.append("is_file", true);
          form.append("mess_id", data.data.id['id']);
          let url = "/api/1.0/messenger/messages/file";
          await this.axios.post(url, form);
          this.file = null; 
          await this.$socket.emit("sendMessage", { file_id : data.data.id['id'], data: dat });
        }
      }
    },
    async sendMessage() {
      this.sending_message = true

      //Ужасный наследственный код, не ссудите строго
      // отправка вложенных 
      if(this.INSERTED_MESSAGE.message && !this.INSERTED_MESSAGE.message_id){
        const inserted = {
          chat_id: this.SELECTED_CHAT.chat_id,
          message: this.INSERTED_MESSAGE.message.trim(),
          lang: this.$i18n.locale,
          user_id: this.$userData.id,
          is_file: this.INSERTED_MESSAGE.is_file,
          inserted: this.INSERTED_MESSAGE.user_id,
          forwarded_cm_id: this.INSERTED_MESSAGE.id,
          answered: null
        }
        ///Отправка вложеного сообщения
        await this.$socket.emit('sendMessage',  { file_id : null, data: inserted })
        this.SET_INSERTED_MESSAGE({})
      }
        // отправка обычных и ответов
        // answered нужно если сообщние файл когда пересылаем ответ
        const data = {
        chat_id: this.SELECTED_CHAT.chat_id,
        message: this.text.trim(),
        lang: this.$i18n.locale,
        user_id: this.$userData.id,
        is_file: false,
        inserted: null,
        forwarded_cm_id: this.INSERTED_MESSAGE.forwarded_cm_id ? this.INSERTED_MESSAGE.forwarded_cm_id : null,
        answered: this.INSERTED_MESSAGE.message_id ? this.INSERTED_MESSAGE.message_id : null, 
      };
      if (this.file == null) {
        if (data.message.trim().length != 0) {
          this.SET_INSERTED_MESSAGE({})
          ///Обычное сообщение
          await this.$socket.emit("sendMessage", { file_id : null, data: data });
        }
        // this.$socket.emit("sendMessage", data);
      } else {
        if (this.file.size > 52428800) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 500,
            title: "Файл "+this.file.name+' превышает допустимый размер файла 50Мб',
          });
          
          this.sending_message = false
          return
        }

        data.is_file = true;
        data.message = this.file.name;
        if (data.message.trim().length != 0) {
          await this.sendFileMessage(data)
          this.SET_INSERTED_MESSAGE({})
        }
        // this.$socket.emit("sendMessage", data);
      }
      this.text = "";
      setTimeout(() => {this.scrollToEnd()}, 220)
      await this.getLastMessages()

      this.sending_message = false
    },
  ///Нужно создать отдельную папку с методами avatar, getAvatars, getLastMessages
  ///Обновляет список последних сообщений в ChatList
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
      ///СОРТИРОВКА ПОСЛЕДНИХ СООБЩЕНИЙ ПО ДАТЕ
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
  async hide_chat(){
          this.fetching = true
          this.$swal({
                  title: `Вы действительно хотите удалить переписку?`,
                  icon: 'warning',
                  showCancelButton: true,
                  cancelButtonText: "Отмена",
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Да'
              }).then(async (result) => {
                  if (result.isConfirmed) {
                    await this.HIDE_CHAT(this.$userData.id)
                    await this.GET_CHATS_FROM_API()
                    await this.CHANGE_CHAT_ROOM({});
                  }
              })
  },
  async scrollToEnd() {
      await setTimeout(() => { }, 90)
      var container = document.querySelector(
        "#chatmessages"
      );
      var scrollHeight = container.scrollHeight;
      await container.scrollTo({top : scrollHeight});
      this.fetching = false;
    },
  closeDialog() {
      this.dialogEditGroup = false;
  },
  setModal(modal){
      this.SET_MODAL(modal)
      setTimeout(() => { this.animate_modal = modal }, 20)
  },
  
  async selectChat(chat) {
    this.$socket.emit("joinRoom", chat.chat_id);
    this.CHANGE_CHAT_ROOM(chat);
    let messChat = { chat_id: chat.chat_id, offset : 0 };
    await this.GET_MESSAGES(messChat);
    //получить список участников
    this.GET_CHAT_USERS_FROM_API(chat.chat_id);
    this.animate_modal = false
    setTimeout(() => { this.SET_MODAL(false) }, 100)

  }, 

  ///отправляет запрос на сокет что пользователь если пользователь не набирает текст
  endWriting(c_id){
    var w = this.text
    setTimeout(() => {
      if(w != this.text){
        this.endWriting(c_id)
      } else {
        this.$socket.emit("unwriting", { chat_id : c_id, user_name : this.$userData.id })
        this.writing = false
      }
    }, 1200)
  }
  },
  computed: {
    ...mapGetters([
      "INSERTED_MESSAGE",
      "MESSAGES",
      "SELECTED_CHAT",
      "CHAT_USERS",
      "LOADING_MESSAGES",
      "CHAT_AVATARS",
      "CHATS",
      "CHAT_END",
      "MODAL",
      "WRITING",
      "OFFSET_CHAT",
      "SENDING_FILES"
    ]),
    Avatar() {
    return (employee_id) =>
      this.CHAT_AVATARS.find((el) => el.user_id == `${employee_id}`)
        ? this.CHAT_AVATARS.find((el) => el.user_id == `${employee_id}`)
        : require("@/assets/img/default_employee.png");
  },
  userId: function () {
    return this.$userData.id;
  },

  },
  watch: {

  async CHAT_USERS(){
   await this.getAvatars()
  },
  async LOADING_MESSAGES(){
    if(!this.LOADING_MESSAGES){
      await this.scrollToEnd()
    }
  },
  async SELECTED_CHAT(){
    this.text = ''
    if(this.INSERTED_MESSAGE.message_id){
      this.SET_INSERTED_MESSAGE({})
    }
  },

  text: {
    handler() {
      this.scrollToEnd()
      if(this.text.length > 0){
        if(!this.writing){
          this.writing = true
          this.$socket.emit("writing", { chat_id : this.SELECTED_CHAT.chat_id, user_name : this.$userData.fullData.first_name, user_id : this.$userData.id })
          this.endWriting(this.SELECTED_CHAT.chat_id)
        }
      }
    },
  },
  },
  
  sockets: {
    getMessage: function (data) { 
      this.ADD_MESSAGE_FROM_SOCKET(data);
      if(!this.show_date){
        this.scrollToEnd()
      }
    },
    deleteMessage: function (message) {
        this.DELETED_MESSAGE(message)
    },
  },

};
</script>

<style scoped>
.fill-height{
  height: 100%;
}
.writing{
  font-size: 14px;
  color: rgb(85, 84, 84)!important;
}
.modal-form{
  background-color: white;
  height: 500px;
  max-width: 300px;
  border-radius: 8px;
  position: sticky;
  top: 26%;
  margin-left: 35%;
  overflow-x: hidden;
  overflow-y: scroll;
  padding-top: 5px;
  padding-bottom: 5px;
}
.modal-close-btn{
  position: sticky;
  top: 21%;
  margin-left: 58%;
}
.modal-form .title{
  align-items: center;
  text-align: center;

}
.inactive{
  opacity: 0.0!important;
}
.modal-shadow{
  transition: all 0.4s ease;
  height: 100%;
  width: 100%;
  position: absolute;
  background-color: rgba(51, 51, 51, 0.301);
}
.messsager-container{
  position: relative;
}

.inserted-container{
  display: flex;
  justify-content: space-between;
  background-color: rgba(219, 219, 219, 0.733);
  border-radius: 12px;
  width: 90%;
  padding: 0px;
  margin: 0px;
  margin-left: 20px;
  margin-right: 20px;
  
  overflow: hidden;
}
.message-inserted{
  justify-content: flex-start;
  align-items: center!important;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-height: 50px!important;
  max-width: 800px;
  overflow: hidden;
}
.message-inserted-content{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.message-inserted p{
  text-align: center;
  align-items: center;
  
}
.devider{
  height: 40px;
  width: 3px;
  margin-right: 5px;
  border-radius: 10px;
  background-color: rgba(41, 40, 40, 0.733);
}
.inputs{
  max-height: 200px!important;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin !important;
}

.avatar{
  border: 1px solid gray;
}
.appBar{
  z-index: 2;
}
.content{
  border-radius: 6px!important;
}
.title{
  font-size: 16px!important;
  font-weight: 600;
  color: rgb(46, 46, 46);
}
.appBar 
.message {
  padding: 20px;
}
.send-message {
  padding-left: 30px;
  padding-right: 20px;
}
.v-toolbar {
  flex: 0 1 auto;
}
.vertical_scroll {
  overflow-x: auto;
  overflow-y: auto;
  scrollbar-width: thin !important;
}
::-webkit-scrollbar {
width: 9px;    
}

::-webkit-scrollbar-thumb {
background-color: rgb(170, 170, 170);   
border-radius: 20px;   
}
::-webkit-scrollbar-thumb:hover{
background-color: rgb(155, 155, 155);
}
.watermark{
margin: 20px;
color: rgb(255, 255, 255);
font-size: 25px;
font-weight: 500;
font-style: italic;
}
</style>
<!-- Сдесь был Николай  -->