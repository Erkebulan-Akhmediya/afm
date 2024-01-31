<template>
  <v-container fluid class="mt-2 d-flex justify-space-between">
    <v-row class="chat md-flex-wrap">
      <v-col md="3">
        <v-card class="mx-auto">
          <v-toolbar color="grey lighten-4" >
            <v-text-field
              @keyup.enter="searchChat()"
              label="Поиск чата"
              prepend-inner-icon="mdi-magnify"
              class="search"
              v-model="searchString"
              oninput="this.value = this.value.replace(/\s+/g, ' ')"
            ></v-text-field>
            <v-spacer></v-spacer>

            <v-btn
              @click="newRoomType = !newRoomType"
              icon
              title="СОЗДАТЬ НОВЫЙ ЧАТ"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>

          <!-- созданиеновой комнаты -->
          <div class="chat-type" v-show="newRoomType">
            <v-btn
              @click="
                dialogPrivat = true;
                newRoomType = !newRoomType;
              "
              outlined
              text
            >
              Личный чат
            </v-btn>
            <v-btn
              @click="
                dialogGroup = true;
                newRoomType = !newRoomType;
              "
              outlined
              text
            >
              Создать новую группу
            </v-btn>
          </div>
          <!-- форма создания группового чата  -->
          <v-row justify="center">
            <v-dialog v-model="dialogGroup" persistent max-width="700">
              <new-group-chat
                @closeDialog="closeDialog"
                @updateChatList="updateChatList"
              />
            </v-dialog>
          </v-row>
          <!-- форма создания приватного чата  -->
          <v-row justify="center">
            <v-dialog v-model="dialogPrivat" persistent max-width="500">
              <new-privat-chat
                @closeDialog="closeDialog"
                @updateChatList="updateChatList"
              />
            </v-dialog>
          </v-row>

          <chat-list :privateType="this.newRoomType" />
        </v-card>
      </v-col>
      <v-col md="9">
        <chat-contant :avatar="avatar" :setAvatar="this.setAvatar" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import ChatList from "../components/messenger/ChatList.vue";
import ChatContant from "../components/messenger/ChatContent.vue";
import newGroupChat from "../components/messenger/newGroupChat.vue";
import newPrivatChat from "../components/messenger/newPrivatChat.vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
export default {
  data: () => ({
    newRoomType: false,
    searchString: "",
    dialogGroup: false,
    dialogPrivat: false,
    avatar: "",
  }),
  components: {
    ChatList,
    ChatContant,
    newGroupChat, 
    newPrivatChat,
  },
  computed: {
    ...mapGetters(["USERS", "SEARCHED_USERS", "CHATS", "UNREADED_MESSAGES"]),
  },
  methods: {
    ...mapActions([
      "ADD_ROOM",
      "GET_MESS_USERS",
      "SEARCH",
      "GET_CHATS_FROM_API",
      "SEARCH_CHAT",
    ]),
    ...mapMutations(["SET_CHATS_VUEX"]),
    searchChat() {
      if (this.searchString == "") {
        this.GET_CHATS_FROM_API();
      } else {
        let searchStr = this.searchString.trim().toLowerCase();


                       let chats = this.CHATS.filter(el=> el.name!=null);
        let result = []

               for(let chat of chats) {
           let reverce = chat.name.split(' ').reverse().join().replace(',', ' ')
          if(chat.name.toLowerCase().includes(searchStr)  || chat.name.toLowerCase() == searchStr || reverce.toLowerCase() == searchStr) {
            result.push(chat)
          }
        }
        if (result.length != []) {
          this.SET_CHATS_VUEX(result);
        } else {
          this.GET_CHATS_FROM_API();
        }
      }

    },
    setAvatar(avatar){
      this.avatar = avatar;
    },
    closeDialog() {
      this.dialogGroup = false;
      this.dialogPrivat = false;
    },
    updateChatList() {
      this.GET_CHATS_FROM_API();
    },
  },
  created() {
    this.GET_CHATS_FROM_API();
    this.GET_MESS_USERS();
  },
  sockets: {
    updateChats: function () {
      this.GET_CHATS_FROM_API();
    },
  },
};
</script><style lang="scss" scoped>
.chat-toolbar{
  background-color: #fff!important;
}
.properties {
  height: 100vh;
  background-color: #fff;
  padding: 20px;

  h2 {
    font-size: 30px;
  }
}
.search {
  margin-top: 22px;
}

.chat {
  height: 90vh !important;
  display: flex;
  flex-direction: row;
}
.newRoomInput {
  margin-left: 40px;
  margin-right: 40px;
  margin-top: 10px;
}
.chat-type {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
// div{
//   overflow: hidden;
// }


</style>