<template>
  <div v-if="$isAdminRules($userData.role, 'service_admin')">
    <div
      class="topBar mb-4"
      style="display: flex; justify-content: space-between"
    >
    <span class="text-h4 mb-2">
      Список внешних пользователей
    </span>
      <v-spacer></v-spacer>
      <!-- <v-btn class="mx-2"  @click="getPerformers()">
        Обновить
      </v-btn> -->
      <v-btn class="mx-2" color="primary" @click="openDialog()">
        <v-icon> mdi-plus </v-icon>
        Добавить пользователя
      </v-btn>
      
      <v-dialog v-model="dialog" max-width="600px" @click:outside="closeDialog()" @keydown.esc="closeDialog()">
        <v-card>
          <v-card-title style="background-color: #1976d2;">
            {{currentUserId ? 'Редактирование пользователя' : 'Создание пользователя'}}
          </v-card-title>
          <br/>
          <v-card-text>
            <v-container>
              <v-form>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model.trim="lastName"
                      label="Фамилия"
                      required
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model.trim="firstName"
                      label="Имя"
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model.trim="middleName"
                      label="Отчество"
                      dense
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" v-if="!currentUserId">
                    <v-text-field
                      v-model.trim="login"
                      label="Логин"
                      dense
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" v-if="!currentUserId">
                    <v-text-field
                      v-model.trim="password"
                      label="Пароль"
                      dense
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="closeDialog()">
              Отмена
            </v-btn>
            <v-btn color="green" :disabled="disableDoubleClick" text @click="saveUser()">
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <v-dialog v-model="changePswDialog" max-width="600px" @click:outside="closeChangePswDialog()" @keydown.esc="closeChangePswDialog()">
        <v-card>
          <v-card-title style="background-color: #1976d2;">
            Изменение пароля
          </v-card-title>
          <br/>
          <v-card-text>
            <v-container>
              <v-form>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model.trim="password"
                      label="Новый пароль"
                      required
                      dense
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="closeChangePswDialog()">
              Отмена
            </v-btn>
            <v-btn color="green" :disabled="disableDoubleClick" text @click="saveChangePsw()">
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-data-table
      dense
      disable-sort
      :headers="headers"
      :items="usersPerformer"
      :items-per-page="10"
      class="clickableTable elevation-1 mb-4"
    >
      <template class="text-end" v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          small
          class="ma-2"
          @click.stop="userChangePsw(item)"
          color="primary"
        >
          <v-icon>mdi-account-key</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="ma-2"
          @click.stop="userEdit(item)"
          color="primary"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="ma-2"
          @click.stop="deleteUser(item)"
          color="red"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
  <div v-else><h2>Доступ запрещен</h2></div>
</template>
<script>
import axios from 'axios'
export default {
  data: () => ({
    dialog: false,
    changePswDialog: false,
    disableDoubleClick: false,
    currentUserId: "",
    firstName: "",
    lastName: "",
    middleName: "",
    login: "",
    password: "",
    usersPerformer: [],
    headers: [
      { text: "№", value: "id" },
      { text: "Фамилия", value: "last_name_rus", sortable: false },
      { text: "Имя", value: "first_name_rus" },
      { text: "Отчество", value: "middle_name_rus" },
      { text: "Логин", value: "login" },
      { text: "", value: "action", align: 'end', width: '20%' },
    ],
  }),
  computed: {

  },
  methods: {
    async saveUser() {
      this.disableDoubleClick = true
      let err = []

            if(!this.lastName?.trim()) {
        err.push('"Фамилия" обязателен для заполнения')
      }
      if(!this.firstName?.trim()) {
        err.push('"Имя" обязателен для заполнения')
      }

      if (this.currentUserId == "") {
        if(!this.login?.trim()) {
          err.push('"Логин" обязателен для заполнения')
        }
        if(!this.password?.trim()) {
          err.push('"Пароль" обязателен для заполнения')
        }
      }

            if(!this.middleName) {
        this.middleName = '' 
      }

            if(err.length) {
        this.disableDoubleClick = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: err.join('; <br>'),
        });
      }

      try {
        if (this.currentUserId == "") {
          await axios.post("/api/1.0/service-admin/another_user", {
            first_name: this.firstName.charAt(0).toUpperCase() +this.firstName.slice(1),
            last_name: this.lastName.charAt(0).toUpperCase() +this.lastName.slice(1),
            middle_name: this.middleName.charAt(0).toUpperCase() +this.middleName.slice(1),
            login: this.login,
            password: this.password
          });
        } else {
          await axios.put("/api/1.0/service-admin/another_user/"+this.currentUserId, {
            first_name: this.firstName.charAt(0).toUpperCase() +this.firstName.slice(1),
            last_name: this.lastName.charAt(0).toUpperCase() +this.lastName.slice(1),
            middle_name: this.middleName.charAt(0).toUpperCase() +this.middleName.slice(1)
          });
        }

        this.closeDialog()
        this.getPerformers()
      } catch (error) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Ошибка: ${error.data?.ERR_MSG || error.data?.message || error.message || error}`,
        });
      } finally {
        this.disableDoubleClick = false
      }
    },
    async saveChangePsw() {
      this.disableDoubleClick = true
      let err = []

            if(!this.password?.trim()) {
        err.push('"Новый пароль" обязателен для заполнения')
      }

            if(err.length) {
        this.disableDoubleClick = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: err.join('; <br>'),
        });
      }

      try {
        await this.axios.put(`/api/1.0/user/:id`, { password: this.password, user_name: this.$userData.id }, { localParams: { id: this.currentUserId } })

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: `Пароль изменён`,
        });

        this.closeChangePswDialog()
        this.getPerformers()
      } catch (error) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Ошибка: ${error.data?.ERR_MSG || error.data?.message || error.message || error}`,
        });
      } finally {
        this.disableDoubleClick = false
      }
    },
    async deleteUser(item) {
        this.$swal({
                title: `Вы действительно хотите удалить пользователя ?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                       await axios.put("/api/1.0/service-admin/another_user/"+item.id, {
                          is_fired: true
                        });

                        this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "success",
                        title: "Пользователь удален.",
                        });

                        this.closeDialog()
                        this.getPerformers()
                    } catch (error) {
                        this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "error",
                        title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
                        });
                    }
                }
            });
    },
    openDialog() {
      this.currentUserId = "";

      this.firstName = "";
      this.lastName = "";
      this.middleName = "";
      this.login = "";
      this.password = "";

            this.dialog = true;
    },
    userEdit(item) {
      this.currentUserId = item.id;

      this.firstName = item.first_name_rus;
      this.lastName = item.last_name_rus;
      this.middleName = item.middle_name_rus;

            this.dialog = true;
    },
    userChangePsw(item) {
      this.currentUserId = item.id;
      this.password = "";

      this.changePswDialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    closeChangePswDialog() {
      this.changePswDialog = false;
    },
    async getPerformers() {
      const {data} = await axios.get("/api/1.0/service-admin/another_user/performers");
      this.usersPerformer = data
    }
  },
  created() {
    this.getPerformers()
  },
  watch: {
  }
};
</script>