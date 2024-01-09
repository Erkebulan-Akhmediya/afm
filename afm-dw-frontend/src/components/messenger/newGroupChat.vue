<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Новый групповой чат</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-form
        ref="form"
    v-model="valid"
    validation
        >
        <v-row>
          <v-col sm="12">
            <v-text-field
              prepend-inner-icon="mdi-message-text"
              v-model="groupName"
              :counter="30"
              :rules="nameRules"
              label="Название группы"
              required
              max-width="300px"
              oninput="this.value = this.value.replace(/\s+/g, ' ')"
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
              @click:close="remove(item)"
            >
              <strong>{{item.first_name + "  " + item.last_name}}</strong
              >&nbsp;
            </v-chip>
          </v-col>
          <v-col sm="12">
            <v-text-field
              prepend-inner-icon="mdi-magnify"
              v-model="searchString"
              label="Поиск"
              @keyup.enter="searchUsers()"
              oninput="this.value = this.value.replace(/\s+/g, ' ')"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12"
            ><v-col class="searched" fluid>
            <!-- <p>{{ selected }}</p> -->
              <v-checkbox
                v-for="item in searchedUsers"
                :key="item.id"
                v-model="selected"
                :label="item.first_name + '  ' + item.last_name"
                :value="item"
                required
              ></v-checkbox>
            </v-col>
          </v-col>
        </v-row>
        </v-form>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="red " @click="closeDialog()"> Отмена </v-btn>
      <v-btn
        color="green "
        
        :disabled="!valid || selected.length==0"
        @click="createGroupChat()"
      >
        Создать
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
    groupName: "",
    selected: [],
    valid:true,
    nameRules: [
        v => !!v || 'Обязательное поле',
        v => (v && v.length <= 30) || 'Имя не должно превышать 30 символов',
      ],
  }),
  computed: {
    ...mapGetters(["USERS", "SEARCHED_USERS"]),
     searchedUsers() {
            return this.SEARCHED_USERS.filter(el=>el.id!= this.$userData.id)
        },

  },
  methods: {
    ...mapActions(["CREATE_CHAT", "GET_MESS_USERS", "SEARCH"]),
    searchUsers() {
      return this.SEARCH(this.searchString);
    },
    closeDialog: function () {
      this.$emit("closeDialog");
      this.selected = [];
      this.searchString = '';
      this.groupName = '';
      this.SEARCH('-')
    },
    createGroupChat() {
      this.selected.push({ "last_name": this.$userData.fullData.first_name, "first_name": this.$userData.fullData.first_name, "id": this.$userData.id })
      let selectedId = this.selected.map(item => item.id)

            let chatData = {
        chat_name: this.groupName,
        chat_type: 2,
        users_id: selectedId,
      };
      this.CREATE_CHAT(chatData).then(() => {
        this.$emit("updateChatList");
        this.closeDialog()
      })

         },
    remove(item) {
      this.selected.splice(this.selected.indexOf(item), 1);
      this.selected = [...this.selected];
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