<template>
  <v-row justify="center">
    <v-dialog v-model="to_perform_dialog" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            {{
              servicerequest_data.sr_status_id == 2
                ? "Назначить исполнителя по запросу №" + servicerequest_data.id
                : "Переназначить исполнителя по запросу №" +
                  servicerequest_data.id
            }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- <p>{{selectedPerformer}}</p> -->
              <v-select
                v-model="selectedPerformer"
                :items="performers"
                item-text="performer_name"
                item-value="user_id"
                label="Исполнитель"
                return-object
                dense
              ></v-select>
              <!-- <v-col cols="7">
               
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
              </v-col> -->
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="IS_SENDING_SERVICEREQUEST"
            :disabled="IS_SENDING_SERVICEREQUEST"
            color="error"
            text
            @click="closeDialog()"
          >
            Отмена
          </v-btn>
          <v-btn
            :loading="IS_SENDING_SERVICEREQUEST"
            :disabled="IS_SENDING_SERVICEREQUEST "
            color="green"
            text
            @click="send()"
          >
            Передать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
export default {
  components: {},
  props: ["servicerequest_data", "to_perform_dialog"],
  data() {
    return {
      globalSearchVal: "",
      searchEmployee: [],
      selectedItem: "",
      search: "",
      dialogData: {},

      users: [],

      performers: [],
      selectedPerformer: {},
    };
  },
  computed: {
    ...mapGetters(["PERFORMERS", "IS_SENDING_SERVICEREQUEST"]),
  },
  methods: {
    ...mapActions(["CHANGE_SERVICEREQUEST_STATUS_API"]),

    async globalSearch() {
      let params = {
        text: this.globalSearchVal,
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
      this.users.push(item);
      this.searchEmployee = [];
    },
    deleteUser(id) {
      this.users = this.users.filter((el) => el.id != id);
    },

    async send() {
      const err = [];
      if (!this.users) {
        err.push("Ответственный обязателен");
      }
      if (this.users.length > 1) {
        err.push("Ответственный должен быть один");
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
      try {
        await this.CHANGE_SERVICEREQUEST_STATUS_API({
          id: this.servicerequest_data.id,
          sr_status_id: -2,
          performer_user_id: this.selectedPerformer.user_id,
          current_sr_status_id: this.servicerequest_data.sr_status_id,
        });
      } catch (error) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Ошибка: ${
            error.data?.ERR_MSG || error.data?.message || error.message || error
          }`,
        });
      } finally {
        this.$emit("updateservicerequest");
      }

      this.closeDialog();
    },
    closeDialog() {
      this.users = [];

      this.$emit("closeDialog");
    },
  },
  watch: {
    to_perform_dialog() {
      this.performers = this.PERFORMERS.filter(
        (el) =>
          el.sr_performer_group_id ==
          this.servicerequest_data.sr_performer_group_id
      );
    },
  },
};
</script>