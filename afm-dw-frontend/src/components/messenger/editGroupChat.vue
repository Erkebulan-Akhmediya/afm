<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Редактирование: {{ SELECTED_CHAT.name }}</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row justify="center">
          <v-dialog v-model="dialog" max-width="290" persistent>
            <v-card>
              <v-card-title class="text-h5" color="warning">
                Вы уверены?
              </v-card-title>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn color="red darken-1" text @click="dialog = false">
                  Нет
                </v-btn>

                <v-btn color="green darken-1" text @click="remove(dialogData)">
                  Да
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
        <v-form ref="form" v-model="valid" validation>
          <v-row>
            <v-col sm="12">
              <v-text-field
                prepend-inner-icon="mdi-message-text"
                v-model="groupName"
                :counter="50"
                :rules="nameRules"
                disabled
                :label="this.SELECTED_CHAT.name"
                required
                max-width="300px"
              ></v-text-field>
            </v-col>
            <v-col sm="12">
              <v-chip
                class="ma-1"
                color="primary"
                text-color="white"
                v-for="item in selected"
                :key="item.id"
                v-model="selected"
                :value="item"
                close
                @click:close="
                  dialog = true;
                  dialogData = item;
                "
              >
                <strong>{{ item.first_name + "  " + item.last_name }}</strong
                >&nbsp;
              </v-chip>
            </v-col>
            <v-col sm="12">
              <v-text-field
                prepend-inner-icon="mdi-magnify"
                v-model="searchString"
                label="Search"
                @keyup.enter="searchUsers()"
                oninput="this.value = this.value.replace(/\s+/g, ' ')"
              ></v-text-field>
            </v-col>
            <v-col class="searched" fluid>
              <!-- <p>{{ selected }}</p> -->
              <v-checkbox
                v-for="item in SEARCHED_USERS"
                :key="item.id"
                v-model="selected"
                :label="item.first_name + '  ' + item.last_name"
                :value="item"
                required
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="red darken-1" @click="closeDialog()"> Отмена </v-btn>
      <v-btn color="green darken-1" @click="createGroupChat()">
        Сохранить
      </v-btn>
    </v-card-actions>
    <!-- <p>{{selected}}</p> -->
  </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  data: () => ({
    searchString: "",
    dialogData: {},
    groupName: "",
    selected: [],
    dialog: false,
    valid: true,
    nameRules: [
      (v) => !!v || "Имя обязательно",
      (v) => (v && v.length <= 50) || "Имя должно быть короче 50 символов",
    ],
  }),
  computed: {
    ...mapGetters(["USERS", "SEARCHED_USERS", "SELECTED_CHAT", "CHAT_USERS"]),
  },
  methods: {
    ...mapActions([
      "CREATE_CHAT",
      "GET_MESS_USERS",
      "SEARCH",
      "EDIT_CHAT_USERS_FROM_API",
      "GET_CHAT_USERS_FROM_API",
    ]),
    searchUsers() {
      return this.SEARCH(this.searchString);
    },
    closeDialog: function () {
      this.$emit("closeDialog");
      this.dialogData = {};
      this.searchString = "";
      this.SEARCH('-')
    },
    createGroupChat() {
      let selectedId = this.selected.map((item) => item.id);

      let chatData = {
        chat_id: this.SELECTED_CHAT.chat_id,
        users_id: selectedId,
      };
      this.EDIT_CHAT_USERS_FROM_API(chatData).then(() => {
        this.$emit("closeDialog");
        this.GET_CHAT_USERS_FROM_API(chatData.chat_id);
        this.closeDialog();
      });
    },
    remove(item) {
      let selected = this.selected;
      let temp = selected.filter((el) => {
        if (el.id != item.id) {
          return item;
        }
      });
      this.selected = temp;
      this.dialog = false;
    },
  },
  mounted() {
    this.selected = this.CHAT_USERS;
  },
  watch: {
    CHAT_USERS: function () {
      this.selected = this.CHAT_USERS;
    },
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