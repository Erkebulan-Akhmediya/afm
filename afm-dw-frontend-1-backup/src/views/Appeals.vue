<template>
  <div>
    <v-tabs v-model="appealsTabs">
      <v-tabs-slider color="#35A4DC"></v-tabs-slider>

      <v-tab
        v-for="item in appealsTabItems"
        :key="item.id"
        :disabled="item.disabled"
      >
        {{ item.name }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="appealsTabs">
      <v-tab-item style="padding: 0px 0px 0px 30px">
        <v-tabs v-model="tab2">
          <v-tabs-slider color="#35A4DC"></v-tabs-slider>
          <v-tab
            v-for="item in individualRatingItems"
            :key="item.id"
            :disabled="item.disabled"
          >
            {{ item.name }}
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab2">
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <appealRatingUniversal :placeholder="tab2" />
                <br />
                <appeal-public-table class="mb-8" :placeholder="tab2" />
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <appealRatingUniversal :placeholder="tab2" />
                <br />
                <appeal-public-table class="mb-8" :placeholder="tab2" />
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <appealRatingUniversal :placeholder="tab2" />
                <br />
                <appeal-public-table class="mb-8" :placeholder="tab2" />
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-tab-item>

      <v-tab-item style="padding: 10px 20px 50px 30px">
        <!-- <p>{{selectedTypeTable}}</p> -->
        <div class="d-flex justify-space-between">
          <v-col class="d-flex" cols="3">
            <v-select
              dense
              v-model="selectedTypeTable"
              :items="tableTypes"
              item-text="name"
              item-value="type"
              return-object
              :menu-props="{ maxHeight: 400 }"
            ></v-select>
          </v-col>
          <v-col class="text-end">
            <v-btn
              v-if="
                selectedTypeTable
                  ? selectedTypeTable.id
                    ? selectedTypeTable.id == 1
                      ? true
                      : false
                    : false
                  : false
              "
              height="50"
              @click="createDialog = true"
              outlined
              >НОВОЕ ПРЕДЛОЖЕНИЕ</v-btn
            >
          </v-col>
        </div>

        <appeal-table
          :headers="headersAppeals"
          :appeal_data="appeals_data"
          :selectedTypeTable="selectedTypeTable"
          v-if="
            (selectedTypeTable
              ? selectedTypeTable.id
                ? selectedTypeTable.id != 2
                  ? true
                  : false
                : false
              : false) || appeal_secretary_list.includes($userData.id)
          "
        />
        <!-- in work voted/not voted -->
        <div
          v-if="
            (selectedTypeTable
              ? selectedTypeTable.id
                ? selectedTypeTable.id == 2
                  ? true
                  : false
                : false
              : false) && !appeal_secretary_list.includes($userData.id)
          "
        >
          <span style="font-size: 14px; color: red"
            >Список предложении для голосования</span
          >
          <appeal-table
            :headers="headersAppeals"
            :appeal_data="NOTVOTED_APPEALS"
            :selectedTypeTable="selectedTypeTable"
            :voted="false"
            class="mb-4"
          />
          <span style="font-size: 14px; color: grey"
            >Все оставшиеся предложения с моим участием</span
          >
          <appeal-table
            :headers="headersAppeals"
            :appeal_data="VOTED_APPEALS"
            :selectedTypeTable="selectedTypeTable"
            :voted="true"
          />
        </div>
        <appeal-create-form
          :dialog="createDialog"
          @closeCreateDialog="createDialog = false"
        />
      </v-tab-item>
      <v-tab-item>
        <appeal-expert-admin />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<script>
import AppealTable from "@/components/appeal/AppealTable.vue";
import AppealCreateForm from "@/components/appeal/AppealCreateForm.vue";
import AppealPublicTable from "@/components/appeal/AppealPublicTable.vue";
import AppealExpertAdmin from "@/components/appeal/AppealExpertAdmin.vue";

import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    AppealTable,
    AppealCreateForm,
    AppealPublicTable,
    AppealExpertAdmin,
  },

  data() {
    return {
      tab2: null,
      individualRatingItems: [
        { name: "Все", disabled: false },
        { name: "Агентство", disabled: false },
        { name: "Территориальные департаменты", disabled: false },
      ],

      appeal_secretary_list: [],

      isRendering: false,
      appealsTabItems: [],
      tabVal: 0,
      createDialog: false,

      headersAppeals: [],

      tableTypes: [
        {
          id: 1,
          name: "Мои предложения",
          sys_name: "my",
        },
      ],
      appeals_data_voted: [],
      appeals_data_notvoted: [],
    };
  },
  computed: {
    ...mapGetters(["APPEALS", "VOTED_APPEALS", "NOTVOTED_APPEALS"]),
    appeals_data() {
      let data;
      if (this.selectedTypeTable) {
        if (this.selectedTypeTable.id == 1) {
          data = this.APPEALS.filter(
            (el) => el.create_user_id == this.$userData.id
          );
        }
        if (this.selectedTypeTable.id == 2) {
          if (this.appeal_secretary_list.includes(this.$userData.id)) {
            data = this.APPEALS;
          } else {
            data = this.APPEALS;
          }
        }
        if (this.selectedTypeTable.id == 3) {
          data = this.APPEALS.filter((el) => el.appeal_status_id == 2);
        }
        if (this.selectedTypeTable.id == 4) {
          data = this.APPEALS.filter(
            (el) =>
              el.appeal_status_id == -4 ||
              el.appeal_status_id == 3 ||
              el.appeal_status_id == 4 ||
              el.appeal_status_id == 44
          );
        }
        if (this.selectedTypeTable.id == 5) {
          data = this.APPEALS.filter((el) => el.appeal_status_id == 5);
        }
        if (this.selectedTypeTable.id == 6) {
          data = this.APPEALS.filter(
            (el) => el.appeal_status_id == 6 || el.appeal_status_id == 66
          );
        }
        if (this.selectedTypeTable.id == 7) {
          data = this.APPEALS.filter((el) => el.appeal_status_id == -1);
        }
        if (this.selectedTypeTable.id == 8) {
          data = this.APPEALS.filter(
            (el) =>
              el.appeal_status_id == -3 ||
              el.appeal_status_id == -2 ||
              el.appeal_status_id == 7
          );
        }
      }

      return data;
    },
    appealsTabs: {
      set(value) {
        this.$store.commit("change_appeal_tab", value);
      },
      get() {
        return this.$store.getters.appeal_current_tab;
      },
    },
    selectedTypeTable: {
      set(value) {
        this.$store.commit("change_appeal_table_type", value);
      },
      get() {
        return this.$store.getters.appeal_table_type;
      },
    },
    notvoted_appeals() {
      let data = [];
      for (let el of this.appeals_data) {
        if (
          (el.appeal_status_id == -4 ||
            el.appeal_status_id == 3 ||
            el.appeal_status_id == 4 ||
            el.appeal_status_id == 44) &&
          !el.votes.find((el2) => el2 == this.$userData.id)
        ) {
          data.push(el);
        }
      }
      return data;
    },
    voted_appeals() {
      let data = [];
      for (let el of this.appeals_data) {
        if (
          (el.appeal_status_id == -4 ||
            el.appeal_status_id == 3 ||
            el.appeal_status_id == 4 ||
            el.appeal_status_id == 44) &&
          el.votes.find((el2) => el2 == this.$userData.id)
        ) {
          data.push(el);
        }
        if (
          el.appeal_status_id == -3 ||
          el.appeal_status_id == -2 ||
          el.appeal_status_id == 5 ||
          el.appeal_status_id == 6 ||
          el.appeal_status_id == 7 ||
          el.appeal_status_id == 66
        ) {
          data.push(el);
        }
      }
      return data;
    },
  },
  methods: {
    ...mapActions([
      "GET_APPEALS_FROM_API",
      "GET_APPEAL_TYPES_FROM_API",
      "GET_SECRETARY_LIST",
      "GET_APPEALS_WITH_PARAMS_FROM_API",
    ]),
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

    changeHeadersAppeals() {
      if (this.selectedTypeTable.id == 8) {
        this.headersAppeals = [
          { text: "№", value: "id" },
          { text: "Тема", value: "title", sortable: false, width: "20%" },
          { text: "Подтип", value: "appeal_subtype_name" },
          { text: "Организация", value: "organization_name" },
          { text: "Отдел", value: "department_name" },
          { text: "Инициатор", value: "created_user_name" },
          { text: "Дата регистрации", value: "appeal_send_date" },
          { text: "Статус", value: "appeal_status_name" },
          { text: "Проголосовало", value: "voted" },
          { text: "", value: "action" },
        ];

      } else if (
        this.selectedTypeTable.id == 4 ||
        this.selectedTypeTable.id == 5 ||
        this.selectedTypeTable.id == 2
      ) {
        this.headersAppeals = [
          { text: "№", value: "id" },
          { text: "Тема", value: "title", sortable: false, width: "20%" },
          { text: "Подтип", value: "appeal_subtype_name" },
          { text: "Организация", value: "organization_name" },
          { text: "Отдел", value: "department_name" },
          { text: "Инициатор", value: "created_user_name" },
          { text: "Дата регистрации", value: "appeal_send_date" },
          { text: "Дата окончания голосования", value: "end_date" },
          { text: "Статус", value: "appeal_status_name" },
          { text: "Проголосовало", value: "voted" },
          { text: "", value: "action" },
        ];

      } else if (this.selectedTypeTable.id == 6) {
        this.headersAppeals = [
          { text: "№", value: "id" },
          { text: "Тема", value: "title", sortable: false, width: "20%" },
          { text: "Подтип", value: "appeal_subtype_name" },
          { text: "Организация", value: "organization_name" },
          { text: "Отдел", value: "department_name" },
          { text: "Инициатор", value: "created_user_name" },
          { text: "Дата регистрации", value: "appeal_send_date" },
          { text: "Дата исполнения", value: "expected_date_of_complete" },
          { text: "Статус", value: "appeal_status_name" },
          { text: "Проголосовало", value: "voted" },
          { text: "", value: "action" },
        ];
      }

      else {
        this.headersAppeals = [
          { text: "№", value: "id" },
          { text: "Тема", value: "title", sortable: false, width: "20%" },
          { text: "Подтип", value: "appeal_subtype_name" },

          { text: "Организация", value: "organization_name" },
          { text: "Отдел", value: "department_name" },
          { text: "Инициатор", value: "created_user_name" },
          { text: "Дата регистрации", value: "appeal_send_date" },

          { text: "Статус", value: "appeal_status_name" },
          { text: "", value: "action" },
        ];
      }
    },
  },
  async created() {
    await this.getSecretaryList();

    this.GET_SECRETARY_LIST();

    this.appealsTabItems.unshift({
      name: "Работа с предложениями",
      disabled: false,
    });
    this.appealsTabItems.unshift({ name: "Общие", disabled: false });

    if (this.appeal_secretary_list.includes(this.$userData.id)) {
      this.appealsTabItems.push({ name: "Группы ЭС", disabled: false });
    }

    if (this.selectedTypeTable == null) {
      this.selectedTypeTable = this.tableTypes[0];
    }
    this.GET_APPEAL_TYPES_FROM_API();

    if (this.appeal_secretary_list.includes(this.$userData.id)) {
      this.tableTypes.push({
        id: 2,
        name: "Предложения с моим участием",
        sys_name: "with_me_secretary",
      });
      this.tableTypes.push({
        id: 3,
        name: "1. Новые и возвращенные с доработки",
        sys_name: "new",
      });
      this.tableTypes.push({
        id: 4,
        name: "2. В производстве",
        sys_name: "work",
      });
      this.tableTypes.push({
        id: 5,
        name: "3. Одобренные",
        sys_name: "approved",
      });
      this.tableTypes.push({
        id: 6,
        name: "4. На исполнении",
        sys_name: "perform",
      });
      this.tableTypes.push({
        id: 7,
        name: "5. Отправлено на доработку",
        sys_name: "rework",
      });
      this.tableTypes.push({
        id: 8,
        name: "6. Завершенные",
        sys_name: "complete",
      });
    } else {
      this.tableTypes.push({
        id: 2,
        name: "Предложения с моим участием",
        sys_name: "with_me",
      });
    }

    this.changeHeadersAppeals();
  },
  watch: {
    "selectedTypeTable.id"() {
      this.changeHeadersAppeals();
      if (
        this.selectedTypeTable.id == 2 
      ) {
        this.GET_APPEALS_WITH_PARAMS_FROM_API({
          table_type: this.selectedTypeTable.sys_name,
          voted: false,
        });
      } else {
        this.GET_APPEALS_WITH_PARAMS_FROM_API({
          table_type: this.selectedTypeTable.sys_name,
        });
      }
    },
  },
};
</script>