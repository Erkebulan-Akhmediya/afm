<template>
  <v-list
  three-line class="d-flex flex-column messages-section">
  <div v-for="(day, i) in messages" :key="i">
    <div style="position: relative!important; padding-top: 30px;">
      <!-- Плавающая дата sticky, каждый день это отдельный блок(массив) сообщений -->
      <div v-if="day.length > 0" class="floating-date-container">
        <span :class="(show_date ? '' : 'inactive')" class="floating-date" >
          <p class="date-content"
                  v-if="new Date(day[0].create_date + '+0000').getFullYear() === new Date().getFullYear() && 
                   new Date(day[0].create_date + '+0000').getMonth() === new Date().getMonth() && 
                  (new Date(day[0].create_date + '+0000').getDate() === new Date().getDate() || 
                    new Date(day[0].create_date + '+0000').getDate() === new Date().getDate() - 1)" 
                    v-html="new Date(day[0].create_date + '+0000').getDate() === new Date().getDate() ? `Сегодня` : `Вчера`" ></p>
         
          <p class="date-content"
              v-else v-html="$moment(new Date(day[0].create_date + '+0000')).format('DD.MM.yyy')">
          </p>
        </span> 
      </div>
      <!-- Сообщения внутри блока -->
    <template v-for="(item, index) in day">
      <div :key="index" class="message-container"
            @mouseover="
            hovered_message = { 'day' : i, 'message' : index }"
            @mouseleave="hovered_message = { 'day' : -1,  'message' : -1 }"  >
      <div
        :class="item.user_id == user_id ? 'd-flex al-right' : 'd-flex al-left'"
        color="item.color"
      >
      <div class="avatar-container">
        <v-list-item-avatar v-if="item.user_id != user_id && SELECTED_CHAT.chat_type_id == 2">
          <v-img v-if="day[index + 1] == undefined || day[index + 1] != undefined && item.user_id != day[index + 1].user_id " 
                  :src="avatar(item.user_id)"></v-img>
        </v-list-item-avatar>
      </div>

        <div
          class="d-flex flex-row-reverse"
          :class="
            item.user_id == user_id && item.is_deleted
              ? 'me red'
              : item.user_id != user_id && item.is_deleted
              ? 'other red'
              : item.user_id == user_id && !item.is_deleted 
              ? `me ${day[index + 1] == undefined || day[index + 1] != undefined && item.user_id != day[index + 1].user_id ? 'sent' : ''}`
              : `other ${day[index + 1] == undefined ||day[index + 1] != undefined && item.user_id != day[index + 1].user_id ? 'sent' : ''}`
          "
        >
          <div class="message-inside"
               >
            <div class="message-content">
              <!-- ВЛОЖЕННЫЕ И ПЕРЕПРАВЛЕННЫЕ СООБЩЕНИЯ -->
              <div v-if="item.inserted && !item.is_deleted" class="mb-2" >
                <div class="bold d-flex">Отправленное сообщение</div>
                <div>{{ item.inserted }} : </div>
              </div>
               <div v-if="item.answered && !item.is_deleted" class="mb-2">
                <div class="answered">
                <div class="bold">{{ item.answered.first_name + ' ' + item.answered.last_name }}</div>
        
                <div v-if="item.answered.is_file && !item.answered.is_deleted" md="10" class="py-auto file-container">
                  <v-btn
                    v-if="item.answered.is_file"
                    color="blue-grey"
                    class="mt-1 white--text"
                    fab
                    x-medium
                    @click="downloadFile(item.forwarded_cm_id ? { id : item.forwarded_cm_id, message : item.answered.message } :item.answered)"
                  >
                    <v-icon dark large> mdi-file-download </v-icon>
                  </v-btn>
                </div>
                <p
                  :style="item.answered.is_deleted ? 'font-style: italic;' : ''"
                  v-html="
                    item.answered.is_deleted
                      ? 'Сообщение удалено ' + '(' + $moment(new Date(item.answered.deleted_date + '+0000')).format(
                    'DD.MM.YY HH:mm' + ')'
                  )
                      : item.answered.message.replace(/\n/g, '<br>')
                  "
                ></p>
                </div>
              </div>
              <!--  -->
              <div v-if="item.is_file && !item.is_deleted" md="10" class="py-auto  file-container">
              <v-btn
                
                v-if="item.is_file && !SENDING_FILES.find((el) => el.id == item.id)"
                color="blue-grey"
                class="mt-1 white--text"
                fab
                x-medium
                @click="!item.inserted ? downloadFile(item) : downloadFile({ id : item.forwarded_cm_id, message : item.message })"
              >
                <v-icon dark large> mdi-file-download </v-icon>
              </v-btn>
              <v-progress-circular
                  v-if="SENDING_FILES.find((el) => el.id == item.id)"
                  indeterminate
                  class="mt-1 white--text"
                  color="primary"
                ></v-progress-circular>
            </div>
          
                <p
                  :style="item.is_deleted ? 'font-style: italic;' : ''"
                  v-html="
                    item.is_deleted
                      ? 'Сообщение удалено ' + '(' + $moment(new Date(item.deleted_date + '+0000')).format(
                'DD.MM.YY HH:mm' + ')'
              )
                      : item.message.replace(/\n/g, '<br>')
                  "
                ></p>
            </div>
          </div>
        </div>
        <span class="time-content" v-html="$moment(new Date(item.create_date + '+0000')).format(
                'HH:mm')">
          </span>
          <v-icon v-if="item.user_id == user_id" small class="mb-2">
                  {{item.is_readed ? `mdi-check-all` : `mdi-check` }}
          </v-icon>
        <v-list-item-avatar v-if="!item.is_deleted" class="mx-1 action-button"
                           :class="hovered_message.day == i && hovered_message.message == index ? '' : ' inactive-action-button'" >
          
          <v-menu offset-y>
            <template  v-slot:activator="{ on, attrs }">
              <v-btn class="mx-1" fab v-bind="attrs" v-on="on">
                <v-icon dark> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="
                onInsertedMessage({ name : item.first_name + ' ' + item.last_name, user_id : item.user_id , message : item.message.replace(/\n/g, '<br>'), message_id : item.id, forwarded_cm_id : item.forwarded_cm_id });
                " >
                <v-list-item-title>Ответить</v-list-item-title>
              </v-list-item> 
              <v-list-item @click="
                setModal(true);
                onInsertedMessage({ name : item.first_name + ' ' + item.last_name, user_id : item.user_id , message : item.message.replace(/\n/g, '<br>'), is_file : item.is_file, id : item.id });
                " >
                <v-list-item-title>Отправить</v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="item.user_id != user_id"
                @click.stop="deleteDialog=true; temp = item"
              >
                <v-list-item-title>Удалить</v-list-item-title>
              </v-list-item>
            </v-list>
            <v-dialog v-model="deleteDialog" persistent max-width="290">
              <v-card>
                <v-card-title class="text-h5"> Удалить сообщение </v-card-title>
                <v-card-text>Вы действительно хотите удалить сообщение?
                  
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" text @click="deleteDialog = false; temp = {}">
                    Нет
                  </v-btn>
                  <v-btn color="green darken-1" text @click="deleteMess(temp)">
                    Да
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-menu>
        </v-list-item-avatar>
        </div>
      <span v-if="item.user_id != user_id && 
                  SELECTED_CHAT.chat_type_id == 2 && 
                  ( day[index + 1] == undefined 
                    || day[index + 1] != undefined &&
                   item.user_id != day[index + 1].user_id)"
           :class="item.user_id == user_id ? 'd-flex right mr-2' : 'd-flex left ml-16'">
          <v-list-item-subtitle
            class="time-content"
            v-html="
              item.first_name +
              ' ' +
              item.last_name + ' '
            "
          ></v-list-item-subtitle>
          </span>
      </div>
    </template>
    </div>
    </div>
  </v-list>
</template>
<script>
import { mapGetters, mapMutations} from "vuex";

export default {
  data() {
    return {
      hovered_message: { 'day' : -1, 'message' : -1 },
      user_id: this.$userData.id,
      deleteDialog: false,
      temp: {},
    };
  },

  props: {
    messages: {
      type: Array,
      default() {
        return {};
      },
    },
    show_date: { type: Boolean },
    scrollToMessage: { type: Function }, 
    setModal: { type: Function }
  },
  computed: {
    ...mapGetters(["CHAT_AVATARS", "SELECTED_CHAT", "CHAT_USERS", "SENDING_FILES"]),
    avatar() {
      return (user_id) =>
        this.CHAT_AVATARS.find((el) => el.user_id == `${user_id}`)
          ? this.CHAT_AVATARS.find((el) => el.user_id == `${user_id}`)
          : require("@/assets/img/default_employee.png");
    },
  },
  methods: {
  ...mapMutations(["SET_INSERTED_MESSAGE","SET_SENDING_FILES", "REMOVE_SENDING_FILES"]),
    async onInsertedMessage(date){

    this.SET_INSERTED_MESSAGE(date)
  },
  async compareDate(prev, next){
    if(prev.getMonth() < next.getMonth()){
      return true
    } else {
      return false
    }
  },
async onShowDate(){
  if(!this.show_date){
    this.show_date = true
    await setTimeout(()=>{}, 1000)
    this.show_date = false 
  } else {
    this.show_date = false
  }
},

async deleteMess(item) {
      await this.axios.put(`/api/1.0/messenger/messages/delete`, {message_id: item.id, chat_id: item.chat_id})
      this.deleteDialog = false
},
async downloadFile(item) {
      this.SET_SENDING_FILES({ 'id' : item.id, 'name' : item.message, 'chat_id' : this.SELECTED_CHAT.chat_id })
      try {
        if(!navigator.userAgent.includes("Firefox")){
          var file = await this.$getBackendMinioFile(item.id, 7);
          const a = document.createElement("a");
          document.body.appendChild(a);
          a.href = file;
          a.download = item.message;
          a.click();
          a.remove();
        } else {
          let config = {
            responseType: "blob",
            params: {
              objectType: 7,
              object: item.id,
            },
          };
          await this.axios.get(`/api/1.0/fileDownload`, config).then((response) => {
          let blob = new Blob([response.data], {
            type: "application/document",
          });
          const a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = item.message;
          a.click();
          a.remove();
        });

        }
      } catch(e){
        console.log(e)
        this.REMOVE_SENDING_FILES({ 'id' : item.id, 'name' : item.message })
      }
      this.REMOVE_SENDING_FILES({ 'id' : item.id, 'name' : item.message })
    },
  },

};
</script><style scoped>
.new_messages{
  display: flex;
  width: 95%;
  justify-content: center;
  text-align: center;
  font-weight: 600!important;
  font-size: 15px;
  color: rgb(151, 151, 151);
}
.file-container{
  padding: 3px;
}
.answered{
  border-left: 2px solid rgb(71, 71, 71);
  min-height: 20px;
  min-width: 10px;
  padding: 6px;
  align-items: flex-start;
}
.avatar-container{
  height: 100%;
  align-items: flex-end;
  justify-content: end;
}
.al-right{
  align-items: flex-end;
  flex-direction: row-reverse;
}
.al-left{
  align-items: flex-end;
}
.action_button{
  transition: opacity 0.3s, visibility 0s linear 0.3s;
  transition: all 0.5s ease!important;
}
.inactive{
  opacity: 0.7!important;
}
.inactive-action-button{
  opacity: 0.0;
}
.message-content p{
  word-wrap: break-word;
  word-break: break-all;
  margin: 0px!important;
  font-size: 16px;
}
.messages-section{
  position: sticky;
  top: 0;
}
.messages-box{
  position: relative;
}
.floating-date-container{
  top: 0px;
  height: 100%;
  width: 100%;
  position: absolute;
}
.floating-date{
  left: 43.5%;
  z-index: 2;
  position: sticky;
  top: 5px;
  height: 26px;
  width: 95px;
  background-color: rgba(134, 134, 134, 0.986);
  border-radius: 20px;
  font-size: 16px;
  font-style: bold;
  color: #fff!important;
  text-align: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding-top: 2px;
  transition: all 0.2s ease;
  margin-bottom: 5px;
}
.message-content{
  margin-top: 3px;
  margin-bottom: 0px;
  z-index: 2;
  word-wrap: break-word;
  word-break: break-all;
}
.message-container .date-content{
  margin-left: 45%;
  margin-bottom: 0%;
}
.space-between{
  justify-content: space-between;
  align-items: center;

}
.date-content{
  font-size: 14px;
  color: rgb(250, 249, 249)!important;
  margin: 0%;
  margin-left: 5px;
  margin-right: 5px;
}
.time-content{
  font-size: 13px;
  color: rgb(46, 45, 45)!important;
  margin: 0%;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
}
.other {
  padding-right: 12px;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 12px;
  word-break: break-all;
  background-color: rgb(231, 231, 231);
  height: min-content;
  width: fit-content;
  min-width: 2%;
  max-width: 40%!important;
  position: relative;
  border-radius: 10px;
  margin-bottom: 8px;
  display: inline-block;
}
.right {
  flex-direction: row-reverse !important;
  text-align: right !important;
  justify-content: flex-start;
}
.left{
  flex-direction: row-reverse !important;
  text-align: left !important;
  justify-content: flex-start;
}
.me {
  padding-right: 12px;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 12px;
  word-break: break-all;
  background: rgb(189, 208, 233);
  height: min-content;
  width: fit-content;
  min-width: 2%;
  max-width: 40%!important;
  position: relative;
  border-radius: 10px;
  margin-bottom: 8px;
  display: inline-block;
}
.other.sent:before {
  content: "";
  position: absolute;
  z-index: -1;
  bottom: 0;
  left: -7px;
  height: 20px;
  width: 20px;
  background-color: rgb(231, 231, 231);
  border-bottom-right-radius: 15px;
}
.other.sent:after {
  content: "";
  position: absolute;
  z-index: -1;
  bottom: 0;
  left: -10px;
  width: 10px;
  height: 20px;
  background: white;
  border-bottom-right-radius: 10px;
}
.me.sent:before {
  content: "";
  position: absolute;
  z-index: 0;
  bottom: 0;
  right: -8px;
  height: 20px;
  width: 20px;
  background: rgb(189, 208, 233);
  background-attachment: fixed;
  border-bottom-left-radius: 15px;

}

.me.sent:after {
  content: "";
  position: absolute;
  z-index: 1;
  bottom: 0;
  right: -10px;
  width: 10px;
  height: 20px;
  background: white;
  border-bottom-left-radius: 10px;
}

.v-list-item__content {
  padding: 5px 8px;
  overflow: visible;
  overflow-wrap: break-word;
  max-width: 85%;
  
}
p {
  color: black !important;
  overflow: hidden;
}

.red {
  background-color: rgba(95, 92, 92, 0.4) !important;
  margin-left: 3px;
  margin-right: 3px;
}
.v-card__title {
  color: black !important;
}
.col {
  max-width: 500px;
}
</style>