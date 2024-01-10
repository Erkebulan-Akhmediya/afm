<template>
  <div>
    <div class="employeeCard" style="">
      <!-- <p>{{userInfo}}</p> -->
      <!-- <p> объективка/послужной={{typeReference}}</p> -->
      <!-- <p>{{activetab}}</p> -->

      <v-row>
        <v-col cols="12">
          <div v-if="userInfo">
            <div style="display: flex; align-items: center">
              <v-btn class="mb-1" color="#5787A4" icon @click="$router.go(-1)">
                <v-icon>mdi-arrow-left-thin-circle-outline</v-icon>
              </v-btn>
              <p class="employeePosition">
                {{
                  userInfo.is_edited_employee
                    ? "Кандидат"
                    : userInfo.position_name
                }}
              </p>
              <!--ИЗМЕНЕНИЕ ЛИЧНЫХ ДАННЫХ-->
              <v-btn
                color="primary"
                style="margin-left: auto"
                @click="openChangeEmployee"
                v-if="userInfo.id == $userData.id"
                outlined
              >
                <v-icon class="mr-2"> mdi-pencil </v-icon>
                Изменить
              </v-btn>
              <!--ИЗМЕНЕНИЕ ДАННЫХ КАНДИДАТА-->
              <v-btn
                color="primary"
                style="margin-left: auto"
                @click="openEditEmployee"
                outlined
                v-if="userInfo.is_edited_employee"
                :disabled="is_active_candidate_request"
              >
                <v-icon class="mr-2"> mdi-pencil </v-icon>
                Изменить
              </v-btn>
            </div>
            <!--ВЕРХНЯЯ КАРТОЧКА СОТРУДНИКА-->
            <div class="card">
              <v-row>
                <!--ФИО, ЛОГО И ДАННЫЕ СОТРУДНИКА-->
                <v-col cols="8" class="pl-10">
                  <!--ФИО-->
                  <v-row>
                    <h2> {{ userInfo.last_name }} {{ userInfo.first_name }} {{ userInfo.middle_name != "null" ? userInfo.middle_name : "" }} </h2>
                  </v-row>
                  <v-row class="ma-0 pa-0">
                    <span class="employeePosition2"> {{ userInfo.is_edited_employee ? "Кандидат" : userInfo.position_name }} </span>
                  </v-row>
                  <!--ЛОГО И ДАННЫЕ СОТРУДНИКА-->
                  <v-row>
                    <v-col cols="12" sm="8" md="2">
                      <!--ЛОГО-->
                      <v-row>
                        <img
                          :src="
                            src || require('@/assets/img/default_employee.png')
                          "
                          alt=""
                        />
                      </v-row>
                      <!--ЗАГРУЗИТЬ ФОТО-->
                      <v-row>
                        <v-col
                          v-if="userInfo.is_edited_employee"
                          cols="12"
                          class="justify-center"
                        >
                          <v-btn 
                            color="primary"
                            @click="dialogPhoto = true" 
                            outlined
                            v-text="src=='/img/default_employee.d5a816ad.png'?'Загрузить фото':'Изменить фото'" 
                            :disabled="is_active_candidate_request"
                            ></v-btn
                          >
                          <v-row justify="center">
                            <v-dialog
                              v-model="dialogPhoto"
                              persistent
                              max-width="290"
                            >
                              <v-card>
                                <v-card-title class="text-h5">
                                  Загрузка фото
                                </v-card-title>
                                <v-card-text>
                                  <v-file-input
                                    accept="image/png, image/jpeg, image/bmp"
                                    placeholder="Выберите фото"
                                    prepend-icon="mdi-camera"
                                    label="Выберите фото"
                                    v-model="filePhoto"
                                  ></v-file-input>
                                </v-card-text>
                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    color="error"
                                    text
                                    @click="dialogPhoto = false"
                                  >
                                    Отмена
                                  </v-btn>
                                  <v-btn
                                    color="success"
                                    text
                                    @click="savePhoto()"
                                  >
                                    Сохранить
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-dialog>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="10" md="6">
                      <div class="cardData">
                        <p>
                          E-mail:
                          {{
                            userInfo.contacts &&
                            userInfo.contacts.length &&
                            userInfo.contacts.filter(
                              (item) => item.contact_info_type_id == 5
                            ).length
                              ? userInfo.contacts.filter(
                                  (item) =>
                                    item.contact_info_type_id == 5
                                )[0].contact
                              : ""
                          }}
                        </p>
                        <p>
                          День рождения:
                          {{
                            userInfo.employee_birth_date
                              ? moment(userInfo.employee_birth_date).format(
                                  "D MMMM"
                                )
                              : ""
                          }}
                        </p>
                        <p v-if="!userInfo.is_edited_employee">
                          Звание: {{ userInfo.rank_name }}
                        </p>
                        <p>Организация: {{ userInfo.organization_name }}</p>
                        <p>Отдел: {{ userInfo.department_name }}</p>
                        <router-link
                          v-if="
                            userInfo.manager_id &&
                            userInfo.id != userInfo.manager_id
                          "
                          :to="`/employees/${this.$crypto(
                            String(userInfo.manager_id)
                          )}`"
                        >
                          Руководитель: {{ userInfo.manager_last_name }}
                          {{ userInfo.manager_first_name }}
                          {{ userInfo.manager_middle_name }}
                        </router-link>
                        
                        <!--Рабочий телефон если по коду департамента financial - доступен по правилу доступа employeeDataAccess, иначе отображается для всех (исключение по коду департамента financial для зам рук деп, рук деп, зам рук упр и рук упр)-->
                        <p v-if="(/РУК.*ДЕП/.test(userInfo.position_name && userInfo.position_name.toUpperCase()) ||
                        /РУК.*УПР/.test(userInfo.position_name && userInfo.position_name.toUpperCase())) ? true :
                        (userInfo.department_code == 'financial' ? employeeDataAccess : true)">
                          Рабочий телефон:
                          {{
                            userInfo.contacts &&
                            userInfo.contacts.length &&
                            userInfo.contacts.some(
                              (item) => item.contact_info_type_id == 3
                            )
                              ? userInfo.contacts.find(
                                  (item) => item.contact_info_type_id == 3
                                ).contact
                              : ""
                          }}
                        </p>
                        <p>Пол: {{ userInfo ? userInfo.gender_name : "" }}</p>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
                <!--БЫСТРЫЕ ДЕЙСТВИЯ-->
                <v-col cols="4">
                  <v-card class="overflow-auto" tile>
                    <v-card-text>
                      <h4>Действия</h4>
                      <v-list dense>
                        <v-list-item
                          v-if="userInfo.id != this.$userData.id && !userInfo.is_edited_employee"
                          @click="openDialog()"
                          :disabled="isDisableBtn"
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-icon>mdi-message-text-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title style="margin-left: -20px">
                            <v-list-item-title>Начать чат</v-list-item-title>
                          </v-list-item-title>
                        </v-list-item>
                        <!-- <v-list-item
                          v-if="userInfo.id == this.$userData.id"
                          @click="
                            isApplication = true;

                            request_type = {
                              req_type: 1,
                              req_subtype: 1,
                              req_name: 'Объяснительная на опоздание',
                            };
                            dialogRequest = true;
                          "
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-icon>mdi-square-edit-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Написать объяснительную на
                              опоздание</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item> -->
                        
                        <!-- <v-list-item
                          v-if="userInfo.id == this.$userData.id"
                          @click="doNothing()"
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-icon>mdi-square-edit-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Оформить заявление на
                              командировку</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item
                          v-if="userInfo.id == this.$userData.id"
                          @click="doNothing()"
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-icon>mdi-square-edit-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Оформить заявление на отпуск</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item> -->

                        <!-- <v-list-item
                          v-if="userInfo.id == this.$userData.id"
                          @click="doNothing()"
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-icon>mdi-square-edit-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Оформить заявление на материальную
                              помощь</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item
                          v-if="userInfo.id == this.$userData.id"
                          @click="doNothing()"
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-icon>mdi-square-edit-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Оформить заявление на предоставление
                              жилья</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item> -->

                        <v-list-item
                          @click="
                            dialogRequestOpen_2_7
                          "
                          v-if="userInfo.is_edited_employee"
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-icon>mdi-square-edit-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Оформить заявление на
                              назначение</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>

                        <v-list-item
                          v-if="
                            userInfo.is_edited_employee
                          "
                          :disabled="btnLoader"
                          @click="getRequestListDialog"
                        >

                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-progress-circular
                              indeterminate
                              color="primary"
                              class="mr-2"
                              v-if="btnLoader"
                            ></v-progress-circular>

                            <v-progress-circular
                              indeterminate
                              color="primary"
                              class="mr-2"
                              v-if="requestListLoading"
                            ></v-progress-circular>

                            <v-icon>mdi-account-box</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Получить справку по изучению кандидата</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>
                        
                        <v-list-item
                          v-if="
                            typeReference == 1 &&
                            (userInfo.id == this.$userData.id ||
                              employeeDataAccess) &&
                              !userInfo.is_edited_employee
                          "
                          :disabled="btnLoader"
                          @click="downloadObjective(1)"
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-progress-circular
                              indeterminate
                              color="primary"
                              class="mr-2"
                              v-if="btnLoader"
                            ></v-progress-circular>

                            <v-icon>mdi-account-box</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Получить справку-объективку</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item
                          v-if="
                            typeReference == 2 &&
                            (userInfo.id == this.$userData.id ||
                              employeeDataAccess) &&
                              !userInfo.is_edited_employee
                          "
                          :disabled="btnLoader"
                          :loading="btnLoader"
                          @click="downloadObjective(2)"
                        >
                          <v-list-item-icon
                            style="margin-left: -15px; margin-top: 6px"
                          >
                            <v-progress-circular
                              indeterminate
                              color="primary"
                              class="mr-2"
                              v-if="btnLoader"
                            ></v-progress-circular>

                            <v-icon>mdi-account-box</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content style="margin-left: -20px">
                            <v-list-item-title
                              >Получить послужной список</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
            <!--ТАБЫ-->
            <div>
              <EmployeeTabs
                ref="tabs"
                @isShowLoader="isShowLoader"
                :employee="userInfo"
                @showDialog="showDialog"
                @updateUserInfo="updateUserInfo"
                :image="src"
                :activetab="activetab"
                :employeeDataAccess="employeeDataAccess"
                @changeTab="changeTab"
              ></EmployeeTabs>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
    <v-dialog
      v-model="isChangeEmployee"
      width="700"
      @input="(v) => v || clearDialog()"
    >
      <v-card class="dialog-wrapper">
        <v-card-text>
          <div
            class="mb-6 mt-4"
            style="
              color: #333;
              font-weight: bold;
              font-size: 2em;
              line-height: 1em;
            "
          >
            Изменить информацию
          </div>
          <div style="display: flex" class="mt-4">
            <h2 class="mt-2 mb-4" style="font-size: 1.2rem">
              <b
                >{{ userInfo.last_name }} {{ userInfo.first_name }}
                {{ userInfo.middle_name }}</b
              >
            </h2>

            <!--
            <v-btn
              style="margin-left: auto; color: green; background-color: #fff"
              @click="addMobilePhone"
              v-if="userInfo.id == $userData.id"
            >
              <v-icon> mdi-plus </v-icon>
            </v-btn>
            -->
          </div>
          <div
            style="display: flex; align-items: center"
            class="mb-5"
            v-for="(contact, i) of changeEmployee.mobile"
            :key="contact.id"
          >
            <v-text-field
              outlined
              hide-details
              :label="`Мобильный номер ${
                changeEmployee &&
                changeEmployee.mobile &&
                changeEmployee.mobile.length > 1
                  ? i + 1
                  : ''
              }`"
              v-model="contact.contact"
            >
            </v-text-field>

            <v-btn
              icon
              v-if="i > 0"
              style="margin-left: 10px; background-color: #fff"
              @click="addMobilePhone(contact, true)"
            >
              <v-icon> mdi-window-close </v-icon>
            </v-btn>
          </div>
          <v-text-field
            class="mb-5"
            outlined
            hide-details
            v-if="changeEmployee && changeEmployee.jobPhone"
            label="Рабочий номер"
            v-model="changeEmployee.jobPhone.contact"
          >
          </v-text-field>
          <v-btn color="error" text @click="passwordReset = true">
            Сбросить пароль
          </v-btn>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="error" text @click="isChangeEmployee = false">
            Отмена
          </v-btn>
          <v-btn
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
            text
            color="success"
            @click="setChangeEmployee"
          >
            Сохранить
            <template v-slot:loader>
              <span>Отправка...</span>
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="passwordReset"
      width="500"
      @input="(v) => v || clearDialogPassReset()"
    >
      <v-card>
        <v-card-title class="text-h5 blue lighten-2" dark>
          Сбросить пароль {{ userInfo.last_name }} {{ userInfo.first_name }}
        </v-card-title>
        <v-card-text style="padding: 30px">
          <slot>
            <div style="color: #000">
              <h2 class="mb-4">Введите новый пароль</h2>
              <!-- Для предотвращения ошибочного автозаполнения полей ввода -->
              <v-text-field
                style="width: 1px; height: 1px; opacity: 0; position: absolute"
                type="text"
                hide-details
                outlined
              ></v-text-field>
              <!-- //Для предотвращения ошибочного автозаполнения полей ввода -->
              <v-text-field
                id="changePass"
                autocomplete="new-password"
                type="password"
                hide-details
                class="mb-3 mt-3"
                v-model="newPassword"
                label="Новый пароль"
                outlined
              ></v-text-field>
              <v-text-field
                id="changePassControl"
                autocomplete="new-password"
                type="password"
                hide-details
                class="mb-3 mt-3"
                v-model="newPasswordControl"
                label="Повторите пароль"
                outlined
              ></v-text-field>
            </div>
          </slot>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="passwordReset = false">
            Отмена
          </v-btn>

          <v-btn
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
            text
            color="success"
            @click="changeUserPassword"
          >
            Изменить
            <template v-slot:loader>
              <span>Отправка...</span>
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <DialogInformation
      :title="error.title"
      :body="error.body"
      :isShow="error.isShow"
      @hideDialog="error.isShow = !error.isShow"
    >
    </DialogInformation>
    <EmployeeCardEdit
      :employee="userInfo"
      :dialog="dialogEdit"
      @close="
        dialogEdit = false;
        updateUserInfo();
      "
    />
    <FastRequests
      :dialog="dialogRequest"
      @save_request="close_fast_request"
      :employee="userInfo"
      :request_type="request_type"
      :isApplication="isApplication"
      @close="dialogRequestClose"
    />
    <v-overlay :value="loader">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-dialog v-model="requestListDialog" max-width="600px">
      <v-card>
        <v-card-title style="background-color: #1976d2;">
          Выберите заявку
        </v-card-title>
        <br/>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  :items="candidateRequestList"
                  label="Номер заявки"
                  required
                  dense
                  v-model="selectedCandidateRequestId"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" text @click="getRequestInDialog">
            Получить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import moment from "moment";
import EmployeeCardEdit from "@/components/EmployeeCardEdit.vue";
import FastRequests from "../components/FastRequests.vue";
import { mapGetters, mapActions } from "vuex";
import checkEmployeeDataAccess from "@/utils/check_employee_data_access";
import checkRoles from '@/utils/check_role';

export default {
  components: {
    EmployeeCardEdit,
    FastRequests,
  },
  data: () => ({
    activetab: 0,
    src: "",
    dialogEdit: false,
    dialogPhoto: false,
    filePhoto: null,
    isDisableBtn: false,
    dialogRequest: false,
    request_type: { req_type: 1, req_subtype: 1 },
    isApplication: false,
    error: {
      title: "Ошибка",
      body: "",
      isShow: false,
    },
    userInfo: "",
    moment,
    loader: true,
    user_id: "",
    isChangeEmployee: false,
    changeEmployee: {},
    disableDoubleClick: false,
    passwordReset: false,
    dialogEmployeeData: {},
    newPassword: "",
    newPasswordControl: "",
    deleteContacts: [],
    typeReferenceItems: [],
    typeReference: "",
    file: "",
    url: "",
    objectiveReference: null,
    workList: null,
    btnLoader: false,
    employeeDataAccess: false,
    requestListDialog: false,
    candidateRequestData: [],
    candidateRequestList: [],
    selectedCandidateRequestId: "",
    currentRequestDetails: "",
    requestListLoading: false,
  }),
  computed: {
    ...mapGetters(["CHATS"]),

    is_active_candidate_request: { 
      get() { return this.$store.state.employee.is_active_candidate_request },
      set(value) { this.$store.commit('setIsActiveCandidateRequest', value) }
    }
  },

  async created() {
    this.user_id = this.$crypto(this.id, "decrypt");
    if (!this.user_id) {
      this.$router.push("/not_found");
    }
    let src = await this.$getVuexStoreFile(this.user_id, 1)
    this.$set(
      this,
      "src",
      src ? src : require("@/assets/img/default_employee.png")
    );

    this.$store.commit("lastEmployee", this.user_id);

    this.checkTypeRef();
  },
  methods: {
    ...mapActions([
      "CREATE_CHAT",
      "GET_CHATS_FROM_API",
      "GET_MESSAGES",
      "GET_CHAT_USERS_FROM_API",
      "CHANGE_CHAT_ROOM",
    ]),

    async close_fast_request() {
      this.dialogRequest = false
      this.activetab = 5
      await this.$refs.tabs.update_requests()
    },

    dialogRequestOpen_2_7() {
      this.dialogRequest = true;
      this.request_type = {
        req_type: 2,
        req_subtype: 7,
        req_name: 'Назначение кандидата',
      };
      this.isApplication = false;
    },

    dialogRequestClose(tab) {
      this.dialogRequest = false;
      this.activetab = tab;
    },
    setEmployeeDataAccess() {
      this.employeeDataAccess = checkEmployeeDataAccess(this.$userData, this.userInfo)
    },
    changeTab(tab) {
      this.activetab = tab;
    },
    async openDialog() {
      this.isDisableBtn = true;
      let finded = this.CHATS.find(
        (item) =>
          item.name ==
            this.userInfo.last_name + " " + this.userInfo.first_name &&
          item.employee_id == this.userInfo.id
      );
      if (finded) {
        await this.$swal({
          ...this.$optionAlert.fire,
          icon: "warning",
          title: `Диалог уже существует`,
          timer: 500,
        });
        await this.$socket.emit("joinRoom", finded.chat_id);
        let messChat = { chat_id: finded.chat_id };
        this.CHANGE_CHAT_ROOM(finded);
        this.GET_MESSAGES(messChat);
        this.GET_CHAT_USERS_FROM_API(finded.chat_id);
        this.$router.push({ path: `/messenger` });
      } else {
        let chatData = {
          chat_name:
            this.userInfo.last_name +
            " " +
            this.userInfo.first_name +
            "-" +
            this.$userData.fullData.last_name +
            " " +
            this.$userData.fullData.first_name,
          chat_type: 1,
          users_id: [this.$userData.id * 1, this.userInfo.id],
        };

        await this.$swal({
          ...this.$optionAlert.fire,
          icon: "warning",
          title: `Диалог будет создан`,
          timer: 1000,
        });
        await this.CREATE_CHAT(chatData);
        await this.GET_CHATS_FROM_API();
        let chat = this.CHATS.find(
          (item) =>
            item.name ==
              this.userInfo.last_name + " " + this.userInfo.first_name &&
            item.employee_id == this.userInfo.id
        );
        await this.$socket.emit("joinRoom", chat.chat_id);
        this.CHANGE_CHAT_ROOM(chat);
        let messChat = { chat_id: chat.chat_id };
        this.GET_MESSAGES(messChat);
        this.GET_CHAT_USERS_FROM_API(chat.chat_id);
      }
      this.$router.push({ path: `/messenger` });
      this.isDisableBtn = false;
    },
    async savePhoto() {
      const form = new FormData();
      form.append("file", this.filePhoto);
      form.append("fileType", "employee");
      form.append("file_type_id", 1);
      form.append("object_id", this.userInfo.id);
      if(this.src=='/img/default_employee.d5a816ad.png'){
        let url = "/api/1.0/candidate/file";
        await this.axios.post(url, form);
      } else {
        let url = "/api/1.0/candidate/file/"+this.userInfo.id;
        await this.axios.put(url, form);
        url = "/api/1.0/candidate/file";
        await this.axios.post(url, form);
      }
      let src = await this.$getBackendMinioFile(this.user_id, 1);
      this.$set(
        this,
        "src",
        src ? src : require("@/assets/img/default_employee.png")
      );

      this.filePhoto = null;

      this.dialogPhoto = false;
    },
    openEditEmployee() {
      this.dialogEdit = true;
    },
    doNothing() {
      this.$swal({
        ...this.$optionAlert.fire,
        icon: "warning",
        title: `Ведется настройка процесса`,
      });
    },
    clearDialogPassReset() {
      this.newPassword = "";
    },

    async changeUserPassword() {
      if (!this.newPassword) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Для смены пароля необходимо ввести новый`,
        });
      }
      if (!this.newPasswordControl) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Введите подтверждение пароля`,
        });
      }

      if (this.newPassword != this.newPasswordControl) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Пароли не совпадают`,
        });
      }
      try {
        await this.axios
          .put(
            `/api/1.0/user/:id`,
            { password: this.newPassword, user_name: this.$userData.id },
            { localParams: { id: this.$userData.id } }
          )
          .catch((e) => {
            throw e;
          });
        this.newPassword = "";
        this.newPasswordControl = "";
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: `Пароль изменён`,
        });
        this.isChangeEmployee = false;
        this.passwordReset = false;
      } catch (e) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Ошибка: ${e}`,
        });
      }
    },

    addMobilePhone(event, isDelete = false) {
      if (isDelete) {
        this.changeEmployee.mobile = this.changeEmployee.mobile.filter(
          (item) => item != event
        );
        this.deleteContacts.push(event);
      } else {
        this.changeEmployee.mobile.push({
          contact_info_type_id: 4,
          contact: "",
        });
      }
      this.changeEmployee = Object.assign({}, this.changeEmployee);
    },

    async setChangeEmployee() {
      this.disableDoubleClick = true;
      let bind = {
        contacts: [],
      };

      this.deleteContacts = this.deleteContacts.map((item) => {
        item.is_delete = true;
        return item;
      });
      bind.contacts.push(...this.deleteContacts);
      if (
        this.changeEmployee &&
        this.changeEmployee.mobile &&
        this.changeEmployee.mobile.length
      ) {
        let changeArr = this.changeEmployee.mobile.filter((item) => {
          if (
            item.contact !==
            this.userInfo.contacts.find((findItem) => findItem.id == item.id)
              ?.contact
          ) {
            return item;
          }
        });
        bind.contacts.push(...changeArr);
      }
      if (this.changeEmployee && this.changeEmployee.jobPhone) {
        bind.contacts.push(this.changeEmployee.jobPhone);
      }

      if (bind.contacts.length && this.userInfo.id != this.$userData.id) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Ошибка: нет доступа`,
        });
        this.disableDoubleClick = false;
        return;
      }

      if (bind.contacts.length) {
        try {
          let localParams = {
            id: this.user_id,
          };
          await this.axios.put(`/api/1.0/employee/:id`, bind, { localParams });
          await this.getUserData(this.user_id);
          this.isChangeEmployee = false;
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "success",
            title: "Сохранено.",
          });
        } catch (error) {
          console.log(error);
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
          });
        } finally {
          this.disableDoubleClick = false;
        }
      } else {
        this.disableDoubleClick = false;
      }
    },

    openChangeEmployee() {
      this.changeEmployee.mobile = JSON.parse(
        JSON.stringify(
          this.userInfo.contacts.filter(
            (item) => item.contact_info_type_id == 4
          )
        )
      );
      if(this.userInfo.contacts.find((item) => item.contact_info_type_id == 3)) {
        this.changeEmployee.jobPhone = Object.assign(
          {},
          this.userInfo.contacts.find((item) => item.contact_info_type_id == 3)
        );
      } else {
        this.changeEmployee.jobPhone = {
          contact_info_type_id: 3,
          contact_info_type_name: 'Рабочий телефон',
          contact: ''
        }
      }
      this.isChangeEmployee = true;
    },

    clearDialog() {
      this.changeEmployee = {};
    },

    showDialog(data) {
      this.error.title = data.title || this.error.title;
      this.error.body = data.body || this.error.body;
      this.error.isShow = true;
    },

    isShowLoader(loader) {
      this.loader = loader;
    },
    async getUserData(id) {
      this.employeeDataAccess = false

      try {
        let res = await this.axios.get(`/api/1.0/employee/:id`, {
          localParams: { id },
        });
        this.userInfo = Object.assign({}, res.data[0]);

        if (!this.userInfo.contacts.find((item)=>item.contact_info_type_id === 4)) {
            this.userInfo.contacts.push(
                {
                    contact_info_type_id: 4,
                    contact_info_type_name: 'Мобильный номер',
                    contact: ''
                }
            )
        }

        this.is_active_candidate_request = true
        if (this.userInfo.is_edited_employee) {
          let {data: checkData} = await this.axios.get(`/api/1.0/request`, {params: {employee_id: this.userInfo.id, request_status: 0, is_application: false}})
          checkData = checkData.filter(item => item.request_sub_type_id == 7 && [1,2,4].includes(item.approve_request_status_id))
          if (checkData.length == 0 && (checkRoles('41', this.$userData) || checkRoles('39', this.$userData) || checkRoles('40', this.$userData))) {
            this.is_active_candidate_request = false
          }
        }

        this.setEmployeeDataAccess();

                this.loader = false;
      } catch (error) {
        this.loader = false;
      }
    },
    async updateUserInfo() {
      await this.getUserData(this.$crypto(this.id, "decrypt"));
    },

    async getConst() {
      let { data: array } = await this.axios.get( "/api/1.0/lov/ref.sys_all_const",
          { params: { name: "refObjectCategory,refWorklistCategory,refObjectPositionArr,refWorklistPositionArr"}}
      );
      function parseSys(name, arr) {
        return arr.find((item) => item.name == name);
      }
      return {
        refObjectArr: parseSys(`refObjectCategory`, array).const_value.split(","),
        refWorklistArr: parseSys(`refWorklistCategory`, array).const_value.split(","),
        refObjectPosArr: parseSys(`refObjectPositionArr`, array).const_value.split(","),
        refWorkPosArr: parseSys(`refWorklistPositionArr`, array).const_value.split(","),
      };
    },
    async checkTypeRef() {
      let { refObjectArr, refObjectPosArr, refWorklistArr, refWorkPosArr } = await this.getConst();

      if (refObjectArr.includes(this.userInfo.category_name) || refObjectPosArr.includes(this.userInfo.position_name_rus)) {
        this.$set(this, `typeReferenceItems`, [{ text: "Справка-объективка", value: 1 }]);
        this.typeReference = 1;
      } else if (refWorklistArr.includes(this.userInfo.category_name) || refWorkPosArr.includes(this.userInfo.position_name_rus)) {
        this.$set(this, `typeReferenceItems`, [{ text: "Послужной список", value: 2 }]);
        this.typeReference = 2;
      }

    },
    async getRequestListDialog() {
      this.requestListLoading = true
      this.selectedCandidateRequestId = null

      let {data: requests} = await this.axios.get(`/api/1.0/request`, {params: {get_full_data: true, request_status: 0, is_application: false, only_assigned_to_you: true, employee_id: this.userInfo.id}})

      this.requestListLoading = false

            this.candidateRequestData = requests.filter(item => item.request_sub_type_id == 7 && [0,1,2,3,4,5].includes(item.approve_request_status_id))

      if (this.candidateRequestData.length == 0) {
        return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: 'По кандидату нет заявок',
          });
      } else if (this.candidateRequestData.length == 1) {
        this.selectedCandidateRequestId = this.candidateRequestData[0].id
        this.currentRequestDetails = this.candidateRequestData[0].details
        this.downloadObjective(3)
      } else {
        this.candidateRequestList = this.candidateRequestData.reduce((acc, item) => {
            acc.push({
                value: item.id,
                text: item.id
            })
        return acc
        }, [])
        this.requestListDialog = true
      }
    },
    async getRequestInDialog() {
      if (!this.selectedCandidateRequestId) {
        return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: 'Выберите заявку',
          });
      }

      this.currentRequestDetails = this.candidateRequestData.filter(item => item.id == this.selectedCandidateRequestId)[0].details
      this.requestListDialog = false
      this.downloadObjective(3)
    },
    async downloadObjective(inTypeRefs) {
      this.btnLoader = true;
      let refName, type, url;
      switch (inTypeRefs) {
        case 1:
          type = `objective`;
          refName = `справка-объективка`;
          url = `pdf_object`;
          break;

                  case 2:
          type = `worklist`;
          refName = `Послужной список`;
          url = `pdf_worklist`;
          break;

                  case 3:
          type = `candidate`;
          refName = `Справка об изучении кандидата`;
          url = `pdf_candidate`;
          break;

        default:
          break;
      }
      let sendData = {
        employee_id: this.userInfo.id,
        iin: this.userInfo.identification_number,
        bin: this.userInfo.organization_identification_number,
        creator: this.$userData,
        type,
        timez: -new Date().getTimezoneOffset(),
      }
      if (inTypeRefs == 3) {
        sendData.requestData = this.currentRequestDetails
        sendData.requestId = this.selectedCandidateRequestId
      }

      await this.axios
        .get(`/api/1.0/reference/${url}`, {
          params: sendData
        })
        .then((response) => {
          let blob = new Blob([new Buffer(response.data, "base64")], {
            type: "application/document",
          });
          const a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = `${refName} - ${this.userInfo.last_name} ${this.userInfo.first_name} ${this.userInfo.middle_name}.pdf`;
          a.click();
          a.remove();
          this.btnLoader = false;
        })
        .catch((err) => {
          console.log(err);
          this.btnLoader = false;
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: `Не удалось сформировать файл: ${err.data?.ERR_MSG || err}`,
          });
        });
    },

    async createReference() {
      let data;
      switch (this.typeReference) {
        case 1:
          data = await this.axios.get(`/api/1.0/reference/get_object`, {
            params: {
              iin: this.userInfo.identification_number,
              bin: this.userInfo.organization_identification_number,
              type: "objective",
              timez: -new Date().getTimezoneOffset(),
            },
          });
          this.objectiveReference = data.data;
          break;
        case 2:
          data = await this.axios.get(`/api/1.0/reference/get_worklist`, {
            params: {
              iin: this.userInfo.identification_number,
              bin: this.userInfo.organization_identification_number,
              type: "worklist",
              timez: -new Date().getTimezoneOffset(),
            },
          });
          this.workList = data.data;
          break;

        default:
          break;
      }
      return;
    },
  },
  async mounted() {
    await this.getUserData(this.$crypto(this.id, "decrypt"));
  },

  watch: {
    async id() {
      this.user_id = this.$crypto(this.id, "decrypt");
      let src = await this.$getVuexStoreFile(this.user_id, 1);
      this.$set(
        this,
        "src",
        src ? src : require("@/assets/img/default_employee.png")
      );
      await this.getUserData(this.user_id);
      this.activetab = 0
    },
    userInfo() {
      this.objectiveReference = null;
      this.workList = null;
      this.checkTypeRef();
    },
  },
  props: ["id"],
};
</script><style lang="scss" scoped>
.dialog-wrapper {
  overflow-y: scroll;
  max-height: 65vh;
  padding-right: 30px;
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e6e6e6;
    border-radius: 7px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9e9e9e;
  }
}

.employeeCard {
  background-color: #fff;
  padding: 10px;

  .employeePosition {
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: -0.014em;
    color: #252c32;
    margin-bottom: 0;
  }

  h2 {
    font-weight: bold;
    font-size: 30px;
    line-height: 48px;
    letter-spacing: -0.022em;
    color: #252c32;
    margin-bottom: 10px;
  }
  .employeePosition2 {
    font-size: 16px;
    line-height: 24px;
    color: #252c32;
    margin-left: -10px;
  }

  .card {
    display: flex;
    margin-top: 10px;
    margin-bottom: 30px;

    img {
      width: 150px;
      border-radius: 10px;
    }

    p {
      font-weight: normal;
      font-size: 13px;
      line-height: 19px;
      letter-spacing: 0.01em;
      color: #252c32;
      margin-bottom: 4px;
    }

    a {
      font-weight: bold;
      font-size: 13px;
      line-height: 24px;
      letter-spacing: 0.01em;
      color: #109cf1;
    }
  }
}
</style>