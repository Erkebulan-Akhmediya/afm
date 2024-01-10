<template>
  <v-card>
    <!-- <p>{{ this.$userData }}</p> -->
    <v-card-actions>
      <v-btn class="mb-1" color="#5787A4" icon @click="$router.go(-1)">
        <v-icon>mdi-arrow-left-thin-circle-outline</v-icon>
      </v-btn>
    </v-card-actions>

    <v-row>
      <v-col cols="9">
        <v-card-title class="text-h4 mb-1">
          {{ appeal_data.title }}
          <v-chip
            class="ml-2"
            small
            :color="getChipsColor(appeal_data)"
            text-color="white"
            v-text="appeal_data.appeal_status_name"
          >
            <!-- v-text="appeal_data.appeal_status_name.replace(/\(.+\)/, '')" -->
            <!-- checkRole(1) || checkRole(2) || checkRole(3)
                ? appeal_data.appeal_status_name
                : appeal_data.appeal_status_name.replace(/\(.+\)/, '') -->
          </v-chip>
          <v-spacer></v-spacer>
          <v-btn
            :loading="IS_SENDING_APPEAL"
            :disabled="IS_SENDING_APPEAL || is_loading"
            outlined
            v-if="
              appeal_data.create_user_id == $userData.id &&
              (appeal_data.appeal_status_id == 1 ||
                appeal_data.appeal_status_id == -1)
            "
            @click="openEditDialog(appeal_data)"
            color="primary"
            ><v-icon left> mdi-pencil </v-icon>Редактировать</v-btn
          >
          <v-btn
            class="ml-2"
            outlined
            :loading="IS_SENDING_APPEAL"
            :disabled="IS_SENDING_APPEAL || is_loading"
            v-if="
              appeal_data.create_user_id == $userData.id &&
              (appeal_data.appeal_status_id == 1 ||
                appeal_data.appeal_status_id == -1)
            "
            @click="
              sendAppeal(appeal_data);
              getAppeal();
            "
            color="green"
            >Отправить <v-icon right> mdi-send </v-icon></v-btn
          >
          <v-card-actions class="mt-4">
            <v-spacer />
            <div
              v-if="
                appeal_secretary_list.includes($userData.id) &&
                appeal_data.appeal_status_id == 2
              "
            >
              <v-btn
                :loading="IS_SENDING_APPEAL"
                :disabled="IS_SENDING_APPEAL || is_loading"
                color="red darken-1"
                outlined
                @click="
                  returnDialog = true;
                  returnType = 2;
                "
              >
                Отказать
              </v-btn>
              <v-btn
                class="ml-2"
                :loading="IS_SENDING_APPEAL"
                :disabled="IS_SENDING_APPEAL || is_loading"
                color="orange darken-1"
                outlined
                @click="
                  returnDialog = true;
                  returnType = 1;
                "
              >
                Вернуть на доработку
              </v-btn>
              <v-btn
                class="ml-2"
                :loading="IS_SENDING_APPEAL"
                :disabled="IS_SENDING_APPEAL || is_loading"
                color="green darken-1"
                outlined
                @click="checkedAppeal(appeal_data)"
              >
                Данные корректны
              </v-btn>
            </div>
            <v-btn
              :loading="IS_SENDING_APPEAL"
              :disabled="IS_SENDING_APPEAL || is_loading"
              color="green "
              class="white--text"
              v-if="appeal_secretary_list.includes($userData.id) && 
                    appeal_data.appeal_status_id == -4"
              @click="
                CHANGE_APPEAL_STATUS_API({
                  id: appeal_data.id,
                  appeal_status_id: 44,
                });
                getAppeal();
              "
            >
              Продлить голосование
            </v-btn>
            <v-btn
              :loading="IS_SENDING_APPEAL"
              :disabled="IS_SENDING_APPEAL || is_loading"
              color="green darken-3"
              class="white--text"
              v-if="checkRole(3) && appeal_data.appeal_status_id == 5"
              @click="to_perform_dialog = true"
            >
              Передать на исполнение
            </v-btn>
            <v-btn
              :loading="IS_SENDING_APPEAL"
              :disabled="IS_SENDING_APPEAL || is_loading"
              color="green darken-3"
              class="white--text"
              v-if="
                appeal_secretary_list.includes($userData.id) &&
                appeal_data.appeal_status_id == 66
              "
              @click="
                CHANGE_APPEAL_STATUS_API({
                  id: appeal_data.id,
                  appeal_status_id: 6,
                });
                getAppeal();
              "
            >
              На исполнении
            </v-btn>
            <v-btn
              v-if="
                appeal_data.appeal_status_id == 3 &&
                (checkRole(1) ||
                  checkRole(2) ||
                  checkRole(3) ||
                  appeal_data.create_user_id == $userData.id)
              "
              color="green "
              class="white--text"
              @click="openChat()"
            >
              Перейти в обсуждение
            </v-btn>
          </v-card-actions>
        </v-card-title>

        <v-card-text>
          <div
            v-if="
              (appeal_data.appeal_status_id == -1 ||
              appeal_data.appeal_status_id == -2) &&
              appeal_data.secretary_description
            "
          >
            <b class="red--text">Замечание секретаря:</b>
            <p
              class="ml-2 red--text"
              v-html="appeal_data.secretary_description"
            ></p>
          </div>

          <div v-if="appeal_data.appeal_status_id == 66">
            <b>Срок исполнения:</b>
            <p class="ml-2 rd--text">
              {{
                $moment(appeal_data.expected_date_of_complete).format(
                  "DD.MM.YYYY "
                )
              }}
            </p>
          </div>

          <div>
            <b>Тип:</b> {{ appeal_data.appeal_type_name }} <br />
            <b>Подтип:</b> {{ appeal_data.appeal_subtype_name }} <br />

            <br /><b>Автор:</b>
            <br /><span class="ml-2">{{ appeal_data.department_name }}</span>
            <br /><span class="ml-2">{{ appeal_data.position_name }}</span>
            <br /><span
              class="ml-2"
              v-html="appeal_data.created_user_name"
            ></span>
            <br /><span class="ml-2">
              {{ appeal_data.work_phone ? appeal_data.work_phone : "" }}
            </span><br>
            <!-- <span class="ml-2">
              {{ appeal_data.mobile_phone ? appeal_data.mobile_phone : "" }}
            </span> -->
          </div>

          <br />
          <div>
            <b>Описание:</b>
            <p class="ml-2" v-html="appeal_data.description"></p>
          </div>

          <div>
            <b>Пути решения:</b>
            <p class="ml-2" v-html="appeal_data.solutions"></p>
          </div>

          <div>
            <b>Ожидаемый результат:</b>
            <p class="ml-2" v-html="appeal_data.expected_result"></p>
          </div>
        </v-card-text>
      </v-col>
      <v-col cols="3">
        <!-- <p>{{status_history}}</p> -->
        <v-timeline align-top dense>
          <v-timeline-item
            v-for="(item, index) of status_history"
            :key="index"
            :color="getChipsColor(item)"
            small
          >
            <v-row class="pt-1">
              <v-col cols="3">
                <div class="text-caption">
                  <!-- {{ $moment(item.date).format("DD.MM.YY HH:mm") }} -->
                  {{ $moment(item.date).format("DD.MM.YY") }}
                </div>
                <div
                  class="text-caption"
                  v-if="
                    item.appeal_status_id == 4 || item.appeal_status_id == 44
                  "
                >
                  {{
                    $moment(item.date)
                      .add(item.appeal_status_id == 4 ? 10 : 3, "d")
                      .format("DD.MM.YY")
                  }}
                </div>
              </v-col>
              <v-col>
                <div class="text-caption">
                  <!-- {{ item.appeal_status_name.replace(/\(.+\)/, "") }} -->
                  {{ item.appeal_status_name }}
                </div>
              </v-col>
            </v-row>
          </v-timeline-item>
        </v-timeline>
        <v-card-title
          v-if="
            (appeal_data.appeal_status_id == 6 ||
              appeal_data.appeal_status_id == 7 ||
              appeal_data.appeal_status_id == 6 ||
              appeal_data.appeal_status_id == -3) &&
            (appeal_secretary_list.includes($userData.id) || checkRole(3))
          "
        >
          Срок исполнения:
          {{
            $moment(appeal_data.expected_date_of_complete).format("DD.MM.YYYY ")
          }}
        </v-card-title>
        <v-card-actions
          v-if="
            appeal_secretary_list.includes($userData.id) &&
            appeal_data.appeal_status_id == 6
          "
        >
          <v-btn
            @click="
              completeDialog = true;
              complete_appeal_status_id = -3;
            "
             :loading="IS_SENDING_APPEAL"
              :disabled="IS_SENDING_APPEAL || is_loading"
            class="mr-2 white--text mx-auto"
            color="error "
            >Не исполнен</v-btn
          >

          <v-btn
            @click="
              completeDialog = true;
              complete_appeal_status_id = 7;
            "
             :loading="IS_SENDING_APPEAL"
              :disabled="IS_SENDING_APPEAL || is_loading"
            color="green "
            class="white--text mx-auto"
            >Исполнен</v-btn
          >
        </v-card-actions>
      </v-col>
      <v-row class="flex-column">
        <v-col cols="12">
          <v-tabs v-model="tab">
            <v-tab key="k1" href="#k1">Файлы</v-tab>
            <v-tab
              key="k2"
              href="#k2"
              v-show="appeal_data.appeal_status_id != 2"
              v-if="
                (appeal_data.appeal_status_id < -1 ||
                  appeal_data.appeal_status_id > 1) &&
                (checkRole(1) ||
                  checkRole(3) ||
                  appeal_secretary_list.includes($userData.id) ||
                  appeal_data.create_user_id == $userData.id)
              "
              >Обсуждение</v-tab
            >
            <v-tab
              key="k3"
              href="#k3"
              v-if="
                (appeal_data.appeal_status_id < -1 ||
                  appeal_data.appeal_status_id > 1) &&
                (checkRole(1) ||
                  checkRole(3) ||
                  appeal_secretary_list.includes($userData.id))
              "
              >Участники ЭС</v-tab
            >

            <v-tab
              key="k4"
              href="#k4"
              v-show="appeal_data.appeal_status_id != 2"
              v-if="
                (appeal_data.appeal_status_id < -1 ||
                  appeal_data.appeal_status_id > 1) &&
                (checkRole(1) ||
                  checkRole(3) ||
                  appeal_secretary_list.includes($userData.id))
              "
              >Голосование</v-tab
            >
            <v-tab
              key="k5"
              href="#k5"
              v-if="
                (appeal_data.appeal_status_id == 6 ||
                  appeal_data.appeal_status_id == 7 ||
                  appeal_data.appeal_status_id == 66 ||
                  appeal_data.appeal_status_id == -3) &&
                (appeal_secretary_list.includes($userData.id) || checkRole(3))
              "
              >Исполнители</v-tab
            >
            <!-- <v-tab key='k6' href='#k6' v-if="(checkRole(1) || checkRole(3)) && (appeal_data.appeal_status_id == 4 || appeal_data.appeal_status_id == 44)">Советник(и)</v-tab> -->
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item key="k1" value="k1">
              <v-col cols="3" class="pb-0">
                <v-file-input
                  :change="fileUpload()"
                  :label="$t('globalWords.addFile')"
                  dense
                  outlined
                  v-if="
                    appeal_data.create_user_id == $userData.id &&
                    (appeal_data.appeal_status_id == 1 ||
                      appeal_data.appeal_status_id == -1)
                  "
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
                  <template v-slot:[`item.create_date`]="{ item }">
                    <span>{{
                      $moment(new Date(item.create_date + "+0000")).format(
                        "DD.MM.YYYY"
                      )
                    }}</span>
                  </template>

                  <template v-slot:[`item.action`]="{ item }">
                    <v-btn
                      icon
                      @click="deleteFile(item)"
                      v-if="
                        item.create_user == $userData.fullData.username &&
                        (appeal_data.appeal_status_id == 1 ||
                          appeal_data.appeal_status_id == -1)
                      "
                    >
                      <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-col>
            </v-tab-item>
            <v-tab-item key="k2" value="k2">
              <v-col class="discussion" cols="12">
                <!-- <p>{{appeal_data}}</p> -->
                <discussion-area
                  
                  :appeal="appeal_data"
                  :is_private="true"
                />
              </v-col>
            </v-tab-item>
            <v-tab-item key="k3" value="k3">
              <v-col cols="12">
                <!-- <p>{{experts}}</p> -->
                <appeal-experts
                  :appeal_data="appeal_data"
                  @changeSelectedGroup="changeSelectedGroup"
                  @changeExperts="changeExperts"
                  @updateData="getAppeal"
                />
              </v-col>
            </v-tab-item>

            <v-tab-item key="k4" value="k4">
              <v-col cols="12">
                <!-- v-if="
                    (appeal_data.appeal_status_id == 4 ||
                      appeal_data.appeal_status_id == 44) &&
                    (checkRole(1) || checkRole(3))
                  " -->
                <v-btn
                  color="primary"
                  class="white--text"
                  @click="vote_dialog = true"
                  v-if="
                    (appeal_data.appeal_status_id == 4 ||
                      appeal_data.appeal_status_id == 44) &&
                    (checkRole(1) || checkRole(3))
                  "
                  >{{
                    !APPEAL_VOTES.find((el) => el.user_id == this.$userData.id)
                      ? "Проголосовать"
                      : "Изменить голос"
                  }}</v-btn
                >
                <v-list subheader>
                  <v-subheader>Проголосовавшие</v-subheader>

                  <v-list-item v-for="item in APPEAL_VOTES" :key="item.id">
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
                        v-text="item.user_name"
                      ></v-list-item-title>
                      <v-list-item-subtitle
                        style="white-space: normal"
                        v-text="item.description"
                      ></v-list-item-subtitle>
                    </v-list-item-content>
                    <span class="mx-auto">{{
                      $moment(new Date(item.create_date + "+0000")).format(
                        "DD.MM.YYYY HH:mm"
                      )
                    }}</span>
                    <v-list-item-icon>
                      <v-icon :color="item.vote ? 'green' : 'red'">
                        {{ item.vote ? "mdi-thumb-up" : "mdi-thumb-down" }}
                      </v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-tab-item>

            <v-tab-item key="k5" value="k5">
              <v-list class="mt-2">
                <v-list-item
                  v-for="item in appeal_data.performers"
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
                    <v-col cols="2">
                      {{ item.last_name_rus + " " + item.first_name_rus }}
                    </v-col>
                    <v-col cols="6">
                      {{ item.department_name }}
                    </v-col>
                    <v-col cols="4">
                      {{ item.position_name }}
                    </v-col>
                    <!-- <v-list-item-title
                      v-text="item.last_name_rus + ' ' + item.first_name_rus"
                    ></v-list-item-title>
                    <v-list-item-title
                      v-text="item.department_name"
                    ></v-list-item-title>
                     <v-list-item-title
                      v-text="item.position_name"
                    ></v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-tab-item>
            <v-tab-item key="k6" value="k6">
              <v-col>
                <appeal-expert-adviser :appeal_data="appeal_data" />
              </v-col>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
    </v-row>

    <appeal-voting
      :appeal_data="appeal_data"
      @closeDialog="closeVoteDialog"
      :vote_dialog="vote_dialog"
    />
    <appeal-create-form
      :dialog="createDialog"
      @closeCreateDialog="
        createDialog = false;
        getAppeal();
      "
      :dialogData="dialogData"
    />
    <appeal-to-perform-form
      :appeal_data="appeal_data"
      @closeDialog="closePerformDialog"
      :to_perform_dialog="to_perform_dialog"
      @updateAppeal="getAppeal"
    />
    <appeal-complete-form
      :appeal_data="appeal_data"
      @closeDialog="closeCompleteDialog"
      :completeDialog="completeDialog"
      :appeal_status_id="complete_appeal_status_id"
      @updateAppeal="getAppeal"
    />
    <v-row justify="center">
      <v-dialog v-model="returnDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span v-if="returnType == 1" class="text-h5"
              >Вернуть предложение №{{ appeal_data.id }} на доработку
            </span>
            <span v-if="returnType == 2" class="text-h5" style="color: red"
              >Отказать предложение №{{ appeal_data.id }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" class="px-0">
                  <v-textarea
                    label="Причина"
                    auto-grow
                    outlined
                    rows="1"
                    row-height="15"
                    v-model="secretary_description"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              text
              @click="
                returnDialog = false;
                secretary_description = '';
              "
            >
              Отмена
            </v-btn>
            <v-btn
              color="green"
              :disabled="secretary_description == ''"
              text
              @click="returnAppeal(appeal_data)"
            >
              <span v-if="returnType == 1">Вернуть</span>
              <span v-if="returnType == 2">Отказать</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import AppealCreateForm from "@/components/appeal/AppealCreateForm.vue";
import AppealVoting from "@/components/appeal/AppealVoting.vue";
import AppealToPerformForm from "@/components/appeal/AppealToPerformForm.vue";
import AppealCompleteForm from "@/components/appeal/AppealCompleteForm.vue";
import DiscussionArea from "@/components/DiscussionArea.vue";
import AppealExperts from "@/components/appeal/AppealExperts.vue";


export default {
  components: {
    AppealVoting,
    AppealCreateForm,
    AppealToPerformForm,
    AppealCompleteForm,
    DiscussionArea,
    AppealExperts,

  },

  data() {
    return {
      appeal_data: {},

      is_loading: false,

      file: null,
      autor_data: {},
      status_history: [],
      vote_dialog: false,
      vote: null,
      vote_description: "",
      fileHeaders: [
        { text: "№", value: "id" },
        { text: this.$t("globalWords.name"), value: "name" },
        { text: this.$t("globalWords.creator"), value: "create_user_name" },
        { text: this.$t("passRequest.addingDate"), value: "create_date" },
        { text: "", value: "action" },
      ],
      dialogData: {},
      createDialog: false,
      to_perform_dialog: false,

      completeDialog: false,
      complete_appeal_status_id: null,

      tab: 0,

      selected_expert_group: null,

      returnDialog: false,
      secretary_description: "",
      returnType: null, 

      appeal_secretary_list: [],

      experts: [],
    };
  },
  computed: {
    ...mapGetters([
      "APPEALS",
      "EXPERT_GROUPS",
      "CHATS",
      "APPEAL_VOTES",
      "IS_SENDING_APPEAL",
    ]),


     },
  methods: {
    ...mapActions([
      "CHANGE_APPEAL_STATUS_API",
      "CREATE_CHAT",
      "GET_CHATS_FROM_API",
      "GET_MESSAGES",
      "GET_CHAT_USERS_FROM_API",
      "CHANGE_CHAT_ROOM",
      "GET_APPEAL_VOTES_FROM_API",
      "GET_APPEALS_FROM_API",
      "GET_APPEAL_TYPES_FROM_API",
    ]),
    getChipsColor(item) {
      if (item.appeal_status_id == 1 || item.appeal_status_id == -1) {
        return "grey";
      }
      if (item.appeal_status_id == 2) {
        return "orange accent-1";
      }
      if (
        item.appeal_status_id == 3 ||
        item.appeal_status_id == 4 ||
        item.appeal_status_id == 44 ||
        item.appeal_status_id == 6 ||
        item.appeal_status_id == 66
      ) {
        return "green lighten-2";
      }
      if (item.appeal_status_id == 5) {
        return "green";
      }
      if (item.appeal_status_id == -3 || item.appeal_status_id == -2) {
        return "red";
      }
      if (item.appeal_status_id == 7) {
        return "green accent-2";
      }
      if (item.appeal_status_id == -4) {
        return "deep-purple accent-4";
      }
    },


        changeSelectedGroup(group) {
      this.selected_expert_group = group;
    },
    changeExperts(experts) {
      this.experts = experts;
    },

    async getSecretaryList() {
      let { data: array } = await this.axios.get(
        "/api/1.0/lov/ref.sys_all_const",
        { params: { name: "appealSecretaryList" } }
      );
      this.appeal_secretary_list = array[0].const_value
        .split(",")
        .reduce((acc, item) => {
          acc.push(item);
          return acc;
        }, []);
    },

    sendAppeal(item) {
      const err = [];
      if (!item.appeal_type_id) {
        err.push("Тип предложения обязателен");
      }
      if (!item.appeal_subtype_id) {
        err.push("Подтип предложения обязателен");
      }
      if (!item.title) {
        err.push("Тема предложения обязателена");
      }
      if (!item.solutions) {
        err.push("Пути решения для предложения не заполнены");
      }
      if (!item.description) {
        err.push("Описание предложения не заполнено");
      }
      if (!item.expected_result) {
        err.push("Ожидаемый результат предложения не заполнен");
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

      this.CHANGE_APPEAL_STATUS_API({ id: item.id, appeal_status_id: 2 });
      this.getAppeal();
    },
    checkedAppeal(item) {
      const err = [];
      if (!this.experts.find((el) => el.expert_type == 1)) {
        err.push("Выберите участников Экспертного совета");
      }
      if (!this.experts.find((el) => el.expert_type == 2)) {
        err.push("Выберите секретаря Экспертного совета");
      }
      if (!this.experts.find((el) => el.expert_type == 3)) {
        err.push("Выберите председателя Экспертного совета");
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

      this.$swal({
        title: `Вы действительно хотите направить предложение №${item.id} дальше?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.CHANGE_APPEAL_STATUS_API({
            id: item.id,
            appeal_status_id: 4,
            expert_group_id: this.selected_expert_group
              ? this.selected_expert_group.id
              : -1,
            experts: this.experts,
          });

          this.getAppeal();
          this.tab = 0;
          this.experts = [];
        }
      });
    },
    returnAppeal(item) {
      this.CHANGE_APPEAL_STATUS_API({
        id: item.id,
        appeal_status_id: this.returnType == 1 ? -1 : -2,
        secretary_description: this.secretary_description,
      });
      this.secretary_description = "";
      this.returnDialog = false;
      this.getAppeal();
      this.returnType = null;
    },

       checkRole(item) {
      if (this.appeal_data.experts) {
        let is_finded = this.appeal_data.experts.find(
          (el) =>
            el.user_id == this.$userData.id && el.appeal_expert_type_id == item
        );
        if (is_finded) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },


       async getStatusHistory() {
      let { data } = await this.axios.get(
        `/api/1.0/appeal/status/history/:id`,
        { localParams: { id: this.appeal_data.id } }
      );
      this.status_history = data;
    },
    async getAppeal() {
      this.is_loading = true;
      let { data } = await this.axios.get(
        "/api/1.0/appeal/one/" + this.$route.params.id
      );
      this.appeal_data = data;
      this.getStatusHistory();
      if (
        this.appeal_data.appeal_status_id > 2 ||
        this.appeal_data.appeal_status_id < -1
      ) {
        this.GET_APPEAL_VOTES_FROM_API({ appeal_id: this.appeal_data.id });
      }

      if (data.performers) {
        for (let el of data.performers) {
          el["src"] = await this.$getVuexStoreFile(el.user_id, 1);
        }
      }
      this.appeal_data = data;
      this.is_loading = false;
    },

        closeVoteDialog() {
      this.vote_dialog = false;
      this.GET_APPEAL_VOTES_FROM_API({ appeal_id: this.appeal_data.id });
    },
    closePerformDialog() {
      this.to_perform_dialog = false;
      this.getAppeal();
    },
    closeCompleteDialog() {
      this.completeDialog = false;
      this.complete_appeal_status_id = null;
      this.getAppeal();
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

        this.getAppeal();
      }
    },
    downloadFile(item) {
      let config = {
        responseType: "blob",
        params: {
          id: item.id,
        },
      };
      this.axios.get(`/api/1.0/fileDownload`, config).then((response) => {
        let blob = new Blob([response.data], {
          type: "application/document",
        });
        const a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = item.name;
        a.click();
        a.remove();
      });
    },
    async deleteFile(item) {
      try {
        await this.axios.put(`/api/1.0/file-disable/${item.id}`, {
          is_active: false,
        });
        this.GET_APPEALS_FROM_API();

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: this.$t("globalWords.deleted"),
        });
        this.getAppeal();
      } catch (err) {
        console.error(err);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: this.$t("globalWords.deletingError"),
        });
      }
    },
    openEditDialog(item) {
      this.dialogData.id = item.id;
      this.dialogData.title = item.title;
      this.dialogData.description = item.description;
      this.dialogData.solutions = item.solutions;
      this.dialogData.expected_result = item.expected_result;
      this.dialogData.appeal_type = {
        id: item.appeal_type_id,
        name: item.appeal_type_name,
      };
      this.dialogData.appeal_subtype = {
        id: item.appeal_subtype_id,
        name: item.appeal_subtype_name,
        appeal_type_id: item.appeal_type_id,
      };
      this.createDialog = true;
    },
  },
  mounted() {
    this.getAppeal();
    this.GET_APPEAL_TYPES_FROM_API();
    this.getSecretaryList();

    if (
      this.appeal_data.appeal_status_id > 2 ||
      this.appeal_data.appeal_status_id < -1
    ) {
      this.GET_APPEAL_VOTES_FROM_API({ appeal_id: this.appeal_data.id });
    }
  },

  watch: {
    "$store.state.appeal.appeals"() {
      this.getAppeal();
    },
  },
};
</script><style scoped>
.discussion {
  max-height: 800px;
  overflow-y: scroll;
}
</style>