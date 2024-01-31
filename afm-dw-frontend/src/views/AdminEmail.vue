<template>
  <div v-if="$isAdminRules($userData.role, 'email_server')">
    <div
      class="topBar mb-4"
      style="display: flex; justify-content: space-between"
    >
      <span class="text-h4">Список серверов</span>
      <v-btn color="primary" @click="showServerDialog()">
        <v-icon> mdi-plus </v-icon>
        Добавить
      </v-btn>
      <v-dialog v-model="isTabDialog" width="750">
        <v-card class="dialogTab">
          <v-card-title style="background-color: #1976d2">
            <span class="text-h5">{{
              isEditDialogTab
                ? `Редактировать почтовый сервер №${serverDialogData.id}`
                : "Добавить почтовый сервер"
            }}</span>
          </v-card-title>
          <v-card-text style="padding: 30px">
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="serverDialogData.name"
                    :label="`Наименование`"
                    dense
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="9">
                  <v-text-field
                    v-model="serverDialogData.in_server"
                    :label="`Адрес IMAP`"
                    dense
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    v-model="serverDialogData.in_port"
                    :label="`Порт`"
                    required
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="9">
                  <v-text-field
                    v-model="serverDialogData.out_server"
                    :label="`Адрес SMTP`"
                    required
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    v-model="serverDialogData.out_port"
                    :label="`Порт`"
                    required
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    :items="emailServerType"
                    label="Тип авторизации пользователей"
                    :disabled="serverDialogData.id ? true : false"
                    required
                    dense
                    v-model="serverDialogData.email_server_type_id"
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="isTabDialog = false">
              Закрыть
            </v-btn>
            <v-btn
              color="success"
              text
              @click="sendServer"
              :loading="isLoadSend"
              :disabled="isLoadSend"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-data-table
      :headers="serverHeaders"
      :items="servers"
      :items-per-page="10"
      class="clickableTable elevation-1 mb-4"
      :no-data-text="'Нет данных'"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
      @click:row="getUsers"
    >
      <template v-slot:[`item.action`]="{ item }">
        <div style="display: flex">
          <v-btn
            icon
            class="ma-2"
            @click="
              showUserDialog(false);
              userDialogData.email_server_id = item.id;
              userDialogData.email_server = item;
            "
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn icon class="ma-2" @click="showServerDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn color="red" icon class="ma-2" @click="deleteServer(item)">
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </div>
      </template>
      <template v-slot:[`item.email_server_type_id`]="{ item }">
        <span>{{getEmailServerTypeVal(item.email_server_type_id)}} </span>      
      </template>
      <template v-slot:[`item.create_date`]="{ item }">
        <span>{{
          $moment(new Date(item.create_date + "+0000")).format(
            "DD.MM.YYYY HH:mm:ss"
          )
        }}</span>
      </template>
      <template v-slot:[`item.update_date`]="{ item }">
        <span>{{
          $moment(new Date(item.update_date + "+0000")).format(
            "DD.MM.YYYY HH:mm:ss"
          )
        }}</span>
      </template>
    </v-data-table>
    <div
      class="topBar mb-4 mt-4"
      style="display: flex; justify-content: space-between"
    >
      <span class="text-h4 mb-2">Список пользователей</span>
      <!-- <v-btn color="primary" @click="showUserDialog()">
        <v-icon> mdi-plus </v-icon>
        Добавить
      </v-btn> -->

      <v-dialog v-model="isUserDialog" width="850">
        <v-card class="dialogTab">
          <!-- <p>{{userDialogData}}</p> -->
          <v-card-title style="background-color: #1976d2">
            <span class="text-h5">{{
              isEditDialogUser
                ? `Редактировать  почтовый аккаунт №${userDialogData.id}`
                : "Добавить почтовый аккаунт"
            }}</span>
          </v-card-title>
          <v-card-text style="padding: 30px">
            <v-form>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-if="!isEditDialogUser"
                    v-model="globalSearchVal"
                    :label="`Поиск пользователя`"
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
                    v-if="userDialogData.last_name || userDialogData.first_name"
                  >
                    <v-icon left> mdi-account-circle-outline </v-icon>
                    {{
                      userDialogData.last_name +
                      "   " +
                      userDialogData.first_name
                    }}
                  </v-chip>
                  <!-- <p>{{userDialogData.user}}</p> -->
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
              

                <v-col cols="6">
                  
                  <v-select
                    :items="servers"
                    v-model="userDialogData.email_server"
                    label="Почтовый сервер"
                    item-text="name"
                    return-object
                    outlined
                    hide-details
                  ></v-select>
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    v-model="userDialogData.email_address"
                    :label="`email_address`"
                    required
                    hide-details
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="userDialogData.email_password"
                    :label="`email_password`"
                    required
                    hide-details
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              text
              @click="
                isUserDialog = false;
                globalSearchVal = '';
              "
            >
              Закрыть
            </v-btn>
            <v-btn
              color="success"
              text
              @click="sendAccount"
              :loading="isLoadSend"
              :disabled="isLoadSend"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-data-table
      :loading="isLoadingUsers"
      :headers="usersHeaders"
      :items="users"
      :items-per-page="10"
      :search="search"
      class="clickableTable elevation-1"
      :no-data-text="'Нет данных '"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          prepend-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          class="mb-2"
        ></v-text-field>
      </template>
      <template v-slot:[`item.image`]="{ item }">
        <div style="padding: 10px 0">
          <img :src="item.src" alt="" />
        </div>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <div style="display: flex">
          <v-btn icon class="ma-2" @click.stop="showUserDialog(item, true)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn color="red" icon class="ma-2" @click.stop="deleteAccount(item)">
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </div>
      </template>
      <template v-slot:[`item.create_date`]="{ item }">
        <span>{{
          $moment(new Date(item.create_date + "+0000")).format(
            "DD.MM.YYYY HH:mm:ss"
          )
        }}</span>
      </template>
      <template v-slot:[`item.update_date`]="{ item }">
        <span>{{
          $moment(new Date(item.update_date + "+0000")).format(
            "DD.MM.YYYY HH:mm:ss"
          )
        }}</span>
      </template>
    </v-data-table>
  </div>
  <div v-else><h2>Доступ запрещен</h2></div>
</template>
<script>
export default {
  data: function () {
    return {
      serverHeaders: [
        { text: "#", value: "id" },
        { text: "Наименование", value: "name" },
        { text: "Адрес IMAP", value: "in_server" },
        { text: "Порт", value: "in_port" },
        { text: "Адрес SMTP", value: "out_server" },
        { text: "Порт", value: "out_port" },
        { text: "Тип авторизации пользователей", value: "email_server_type_id" },
        { text: "Действия", value: "action" },
      ],
      usersHeaders: [
        { text: "#", value: "id" },
        { text: "username", value: "username" },
        { text: "first_name", value: "first_name" },
        { text: "last_name", value: "last_name" },
        { text: "email_server", value: "email_server.name" },
        { text: "email_address", value: "email_address" },
        { text: "Действия", value: "action" },
      ],
      servers: [],
      users: [],

      isTabDialog: false,
      serverDialogData: {},
      isEditDialogTab: false,

      currentTab: {},
      isLoadingUsers: false,

      isLoadSend: false,

      isUserDialog: false,
      userDialogData: {},
      isEditDialogUser: false,

      globalSearchVal: "",
      searchEmployee: [],
      selectedItem: "",
      search: "",

      emailServerType: [],
    };
  },
  methods: {
    showSlideDialog(item, isEdit = false) {
      this.isEditDialogSlide = isEdit;
      this.slideDialogData = isEdit ? item : {};
      this.isUserDialog = true;
      this.currentTab = item;
    },

    async deleteServer(item) {
      this.$swal({
        title: `Вы действительно хотите удалить сервер №${item.id}?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#4caf50",
        cancelButtonColor: "#d33",
        confirmButtonText: "Удалить",
      }).then(async (result) => {
        if (result.isConfirmed) {
          item.is_active = false;
          try {
            let url = `/api/1.0/email/servers/` + item.id;
            let { data } = await this.axios.put(url, { id: item.id,
              is_deleted: true });
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "success",
              title: `Сервер №${data} удалён`,
            });
            await this.getAllTabs();
            this.isTabDialog = false;
          } catch (error) {
            if (error.data) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                timer: 5000,
                width: 300,
                title: error.data?.ERR_MSG || "Ошибка удаления",
              });
            }
          }
        }
      });
    },

    async sendServer() {
      const err = [];
      if (!this.serverDialogData.name) {
        err.push("Название Обязательно");
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
      this.isLoadSend = true;

      try {
        let method = "post";
        let url = `/api/1.0/email/servers`;
        if (this.serverDialogData.id != undefined) {
          method = "put";
          url = `/api/1.0/email/servers/` + this.serverDialogData.id;
        }

        let { data } = await this.axios[method](url, this.serverDialogData);

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: `Почтовый сервер № ${data} ${
            this.isEditDialogTab ? "обновлён" : "добавлен"
          }`,
        });
        await this.getAllTabs();
        this.isTabDialog = false;
      } catch (error) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title:
            error.data?.ERR_MSG ||
            `Ошибка ${
              this.isEditDialogTab ? "обновления" : "добавления"
            } сервера`,
        });
      }
      this.isLoadSend = false;
    },

    getEmailServerTypeVal(ID) {
      return this.emailServerType.find(item => item.value == ID).text
    },

    async sendAccount() {
      const err = [];
      if (!this.userDialogData.email_user_id) {
        err.push("Пользователь обязателен");
      }
      if (!this.userDialogData.email_address) {
        err.push("Почта обязателена");
      }
      if (!this.userDialogData.email_password) {
        err.push("Пароль от почты обязателен");
      }
       if (!this.userDialogData.email_server) {
        err.push("Почтовый сервер обязателен");
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

      this.isLoadSend = true;

      try {
        let method = "post";
        let url = `/api/1.0/email/accounts`;
        if (this.userDialogData.id) {
          method = "put";
          url = `/api/1.0/email/accounts/` + this.userDialogData.id;
        }
        if(!this.userDialogData.email_user_id) {
          this.userDialogData.email_user_id = this.userDialogData.user.id;
        }

                this.userDialogData.email_server_id = this.userDialogData.email_server.id;
        delete this.userDialogData.user;
        let { data } = await this.axios[method](url, this.userDialogData);

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: `Аккаунт №${data} ${
            this.isEditDialogUser ? "обновлён" : "добавлен"
          }`,
        });
        this.isTabDialog = false;
        this.isUserDialog = false;
      } catch (error) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title:
            error.data?.ERR_MSG ||
            `Ошибка ${
              this.isEditDialogUser ? "обновления" : "добавления"
            } аккаунта`,
        });
      }
      await this.getUsers(this.currentTab);
      this.isLoadSend = false;
      this.globalSearchVal = "";
    },

    async deleteAccount(item) {
      this.$swal({
        title: `Вы действительно хотите удалить аккаунт №${item.id}?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#4caf50",
        cancelButtonColor: "#d33",
        confirmButtonText: "Удалить",
      }).then(async (result) => {
        if (result.isConfirmed) {
          item.is_active = false;
          try {

                        let url = `/api/1.0/email/accounts/` + item.id;
            let { data } = await this.axios.put(url, { id: item.id,
              is_deleted: true });
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "success",
              title: `Аккаунт №${data} удалён`,
            });
            await this.getUsers(this.currentTab);
            this.isTabDialog = false;
          } catch (error) {
            if (error.data) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                timer: 5000,
                width: 300,
                title: error.data?.ERR_MSG || "Ошибка удаления",
              });
            }
          }
        }
      });
    },

    showServerDialog(isEdit) {
      this.serverDialogData = isEdit || {};
      this.isEditDialogTab = isEdit ? true : false;
      this.isTabDialog = true;
    },
    showUserDialog(item, isEdit = false) {
      this.userDialogData = item || {};
      this.isEditDialogUser = isEdit ? true : false;
      this.isUserDialog = true;
      this.searchEmployee = [];
    },

    async getAllTabs() {
      const {data} = await this.axios.get(`/api/1.0/email/servers`)
      this.servers = data;
    },

    async getUsers(server) {
      this.currentTab = server;
      this.isLoadingUsers = true;

      let params = { email_server_id: server.id };

      const { data } = await this.axios.get(`/api/1.0/email/accounts`, {
        params,
      });
      for (let item of data) {
        item["email_server"] = this.servers.find(
          (el) => el.id == item.email_server_id
        );
      }
      this.users = data;
      this.isLoadingUsers = false;
    },

    globalSearch() {
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
      let params = {
        email_user_id: item.id,
      };
      let { data } = await this.axios.get(`/api/1.0/email/account`, { params });
      if (!data) {
        this.userDialogData.user = item
        this.userDialogData.last_name = item.last_name;
        this.userDialogData.first_name = item.first_name;
        this.userDialogData.email_user_id = item.id;
        this.searchEmployee = [];
      } else {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 300,
          title: "У этого пользователя уже есть почтовый аккаунт",
        });
      }
    },
  },
  async created() {
    await this.axios.get(`/api/1.0/lov/ref.email_server_type`)
        .then(({data}) => {
            this.emailServerType = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

    await this.getAllTabs();
    this.globalSearch();
  },
};
</script><style lang="scss" scoped>
.topBar {
  display: flex;
  justify-content: flex-end;
}
</style>