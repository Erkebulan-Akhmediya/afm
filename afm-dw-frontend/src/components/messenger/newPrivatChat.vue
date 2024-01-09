<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Новый личный чат</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col sm="12">
            <v-text-field
              prepend-inner-icon="mdi-magnify"
              v-model="searchString"
              label="Поиск"
              oninput="this.value = this.value.replace(/\s+/g, ' ')"
              @keyup.enter="searchUsers()"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12"
            ><v-col  fluid>
              <!-- <p>{{ selected }}</p> -->
              <v-radio-group class="searched" v-model="selected">
                <v-radio
                  v-for="item in SEARCHED_USERS"
                  :key="item.id"
                  :label="item.first_name + '  ' + item.last_name"
                  :value="item"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-col>
          <v-col sm="12">
            <v-alert dense outlined type="error" v-if="error">
              <strong>{{ error }}</strong>
            </v-alert>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="red" @click="closeDialog()"> Отмена </v-btn>
      <v-btn color="green " @click="createPrivatChat()">
        Создать
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  data: () => ({
    searchString: "",
    selected: null,
    error: "",
  }),
  computed: {
    ...mapGetters(["USERS", "SEARCHED_USERS", "CHATS"]),
  },
  methods: {
    ...mapActions(["CREATE_CHAT", "SHOW_CHAT", "GET_MESS_USERS", "SEARCH"]),
    searchUsers() {
       this.SEARCH(this.searchString);
    },
    closeDialog: function () {
      this.$emit("closeDialog");
      this.searchString = "";
      this.selected = null;
      this.SEARCH('-');
      this.error = "";
    },
    createPrivatChat() {
      let chatData = {
        chat_name:
          this.selected.last_name +
          " " +
          this.selected.first_name +
          "-" +
          this.$userData.fullData.last_name +
          " " +
          this.$userData.fullData.first_name,
        chat_type: 1,
        users_id: [this.$userData.id * 1, this.selected.id],
      };
      let finded = false
      let finded_item = {}
      this.CHATS.map((item) => {
        if(item.name == this.selected.last_name + " " + this.selected.first_name && item.employee_id == this.selected.id){
          finded = true
          finded_item = item;
        }
      })


                  let hasSelfChat = this.CHATS.find(
        (item) =>
          item.name === null
      );
      if(finded_item.is_hidden_users && finded_item.is_hidden_users.split(';').includes(this.$userData.id)){
        var hidden_array = finded_item.is_hidden_users.split(';')
        const index = hidden_array.indexOf(this.$userData.id);
        hidden_array.splice(index, 1)
        var hidden = hidden_array.join('')
        this.SHOW_CHAT({ chat_id : finded_item.chat_id, is_hidden : hidden }).then(() => {
          this.$emit("updateChatList");
          this.closeDialog();
          this.error = "";
        })
      } else {
        if (finded) {
        this.error = "Диалог уже существует";

              } else {
        if (hasSelfChat && this.selected.id == this.$userData.id * 1) {
          this.error = "Диалог уже существует";

                  } else {
          this.CREATE_CHAT(chatData).then(() => {
            this.$emit("updateChatList");
            this.closeDialog();
            this.error = "";
          });
        }
      }
      }
    },
  },
  created() {
    this.GET_MESS_USERS();
  },
};
</script><style scoped>
.v-card__title {
  color: rgb(24, 20, 20);
}
.v-input--selection-controls {
  margin-top: 5px;
}
.searched {
  max-height: 400px;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>