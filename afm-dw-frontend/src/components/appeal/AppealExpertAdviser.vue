<template>
  <div>
    <div>
      <v-btn @click="expert_adviser_add = true">Добавить советника</v-btn>
    </div>
    <!-- <v-list>
                <v-list-item
                  v-for="item in expert_advisers"
                  :key="item.id"
                >
                  <v-list-item-avatar>
                    <v-img
                      :alt="`${item.user_id} avatar`"
                      :src="
                        item.src
                          ? item.src
                          : require('@/assets/img/default_employee.png')
                      "
                    ></v-img>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title
                      v-text="item.last_name_rus + ' ' + item.first_name_rus"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                        style="white-space: normal"
                        v-text="item.description"
                      ></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>  -->
    <v-row justify="center">
      <v-dialog v-model="expert_adviser_add" persistent max-width="800px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Добавить советника</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="7">
                  <!-- <p>{{dialogData.user}}</p> -->
                  <v-text-field
                    v-model="globalSearchVal"
                    :label="`Поиск пользователя(ответственный)`"
                    prepend-inner-icon="mdi-magnify"
                    required
                    hide-details
                    outlined
                    dense
                    @keyup.enter="globalSearch()"
                  ></v-text-field>
                  <!-- <v-chip
                  class="ma-2"
                  color="green"
                  outlined
                  close
                  @click:close="deleteUser(user.id)"
                  v-for="user in users"
                  :key="user.id"
                  
                >
                  <v-icon left> mdi-account-circle-outline </v-icon>
                  {{ user.last_name + "   " + user.first_name }}
                </v-chip> -->
                  <v-chip class="ma-2" color="green" outlined v-if="user">
                    <v-icon left> mdi-account-circle-outline </v-icon>
                    {{ user.last_name + "   " + user.first_name }}
                  </v-chip>

                  <v-list dense rounded>
                    <v-list-item-group v-model="selectedItem" color="primary">
                      <v-list-item
                        v-for="item in searchEmployee"
                        :key="item.id"
                        @click="selectUser(item)"
                      >
                        <v-list-item-content>
                          <v-list-item-title
                            v-text="item.last_name + '   ' + item.first_name"
                          ></v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="closeAddDialog()"> Отмена </v-btn>
            <v-btn
              color="green"
              text
              @click="sendAdviser()"
              :disabled="disabledBtn"
            >
              Передать
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
export default {
  props: ["appeal_data"],
  data() {
    return {
      expert_advisers: [],

      expert_adviser_add: false,
      globalSearchVal: "",
      searchEmployee: [],
      selectedItem: "",
      search: "",
      dialogData: {},
      disabledBtn: true,
      users: [],
      user: null,
    };
  },
  methods: {

    ...mapActions([]),
    closeAddDialog() {
      this.expert_adviser_add = false;
      this.searchEmployee = [];
      this.globalSearchVal = "";
      this.user = null;
      this.users = [];
    },
    async globalSearch() {
      let params = {
        text: this.globalSearchVal,
        without_performers: true,
      };
      this.axios.get(`/api/1.0/search`, { params }).then((data) => {
        data.data = data.data.filter((i) => !i.is_edited_employee);
        this.searchEmployee = data.data;
      });
    },
    async selectUser(item) {
      this.user = item;
      this.searchEmployee = [];
      this.globalSearchVal = "";
      this.disabledBtn = false;
    },
    async sendAdviser() {
      let payload = {
        adviser_user_id: this.user.id,
        appeal_id: this.appeal_data.id,
      };
      await this.axios.post(`/api/1.0/appeal/expert/advisers`, payload);
      this.closeAddDialog();
      this.getAdvisers();
    },
    async getAdvisers() {
      let params = {
        appeal_id: this.appeal_data.id,
      };
      let { data } = await this.axios.get(`/api/1.0/appeal/expert/advisers`, {
        params,
      });
      this.expert_advisers = data;
    },
  },
  computed: {
    ...mapGetters([]),
  },
  created() {},
  watch: {},
};
</script><style scoped>
</style>