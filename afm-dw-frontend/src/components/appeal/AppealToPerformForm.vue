<template>
  <v-row justify="center">
    <v-dialog v-model="to_perform_dialog" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5"
            >На исполнение предложение №{{ appeal_data.id }}
            {{ appeal_data.title }}</span
          >
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
                <v-chip
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
              <v-col cols="7">
                <!-- <p>{{date}}</p> -->
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :return-value.sync="date"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="date"
                      label="Срок исполнения"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="date" no-title scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="menu = false">
                      Cancel
                    </v-btn>
                    <v-btn text color="primary" @click="$refs.menu.save(date)">
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu></v-col
              >
              <!-- <v-col cols="12" class="px-0">
                <v-col cols="4" class="pb-0">
                  <v-file-input
                    :change="fileUpload()"
                    :label="$t('globalWords.addFile')"
                    dense
                    outlined
                    v-model="file"
                  >
                  </v-file-input>
                </v-col>
                <v-col cols="12" class="pt-0">
                  <v-data-table
                    :no-data-text="$t('passRequest.fileListIsEmpty')"
                    :headers="fileHeaders"
                    :items="appeal_data.files"
                    max-width="200px"
                    class="elevation-1"
                    :items-per-page="10"
                  >
                    <template v-slot:[`item.name`]="{ item }">
                      <a @click="downloadFile(item)">
                        {{ item.name }}
                      </a>
                    </template>

                    <template v-slot:[`item.action`]="{ item }">
                      <v-btn
                        icon
                        @click="deleteFile(item)"
                        v-if="item.create_user == $userData.fullData.username"
                      >
                        <v-icon>mdi-trash-can-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </v-col>
              </v-col> -->
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeDialog()"> Отмена </v-btn>
          <v-btn color="green" text @click="sendAppeal()"> Передать </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { mapActions } from "vuex";
export default {
  components: {},
  props: ["appeal_data", "to_perform_dialog"],
  data() {
    return {
      file: null,
      fileHeaders: [
        { text: "№", value: "id" },
        { text: this.$t("globalWords.name"), value: "name" },
        { text: "", value: "action" },
      ],
      globalSearchVal: "",
      searchEmployee: [],
      selectedItem: "",
      search: "",
      dialogData: {},
      file_is_added: false,
      menu: false,
      date: null,

      users: []
    };
  },
  computed: {
  },
  methods: {
    ...mapActions([
      "GET_APPEAL_VOTES_FROM_API",
      "GET_APPEALS_FROM_API",
      "CHANGE_APPEAL_STATUS_API",
    ]),
    async getAppeal() {
      let { data } = await this.axios.get("/api/1.0/appeal/one/");
      this.appeals = data;
    },

        closeDialog() {
      this.vote = null;
      this.vote_description = "";
      this.$emit("closeDialog");
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
      this.dialogData.user = item;
      this.dialogData.last_name = item.last_name;
      this.dialogData.first_name = item.first_name;
      this.dialogData.email_user_id = item.id;
      this.users.push(item)
      this.searchEmployee = [];

         },
    deleteUser(id) {
      this.users = this.users.filter(el=>el.id!=id)
    },
    fileUpload: async function () {
      if (this.file) {
        const form = new FormData();
        form.append("lang", this.$i18n.locale);
        form.append("user_id", this.$userData.fullData.username);
        form.append("file", this.file);
        form.append("fileType", "appeal");
        form.append("file_type_id", 12);
        form.append("pr_id", this.appeal_data.id);

        await this.axios.post(`/api/1.0/pass-request-file/`, form);
        this.file = null;
        this.file_is_added = true;

        this.$emit("updateAppeal");
      }
    },
    async deleteFile(item) {
      try {
        await this.axios.put(`/api/1.0/file-disable/${item.id}`, {
          is_active: false,
        });
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: this.$t("globalWords.deleted"),
        });
        this.$emit("updateAppeal");
      } catch (err) {
        console.error(err);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: this.$t("globalWords.deletingError"),
        });
      }
    },
    async sendAppeal() {
      const err = [];
      if (!this.users) {
        err.push("Ответственный обязателен");
      }
      if (!this.date) {
        err.push("Срок исполнения обязателен");
      }
      if (this.users.length == 0) {
        err.push("Исполнитель обязателен");
      }


      if (err.length) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 500,
          title: err.join("; <br>"),
        });
      }
      let performers = [];
      for(let el of this.users) {
        performers.push(el.id)
      }
      this.CHANGE_APPEAL_STATUS_API({
        id: this.appeal_data.id,
        appeal_status_id: 66,
        performers: performers,
        expected_date_of_complete: this.date,
      });
      this.closeDialog();
    },
  },
};
</script>