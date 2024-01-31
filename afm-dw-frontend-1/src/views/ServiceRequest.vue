<template>
  <div>
    <v-tabs v-model="servicerequestTabs">
      <!-- <v-tabs-slider color="#35A4DC"></v-tabs-slider> -->
      <v-tab
        v-for="item in servicerequestTabItems"
        :key="'k' + item.id"
        :href="'#k' + item.id"
      >
        {{ item.name }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="servicerequestTabs">
      <v-tab-item key="k1" value="k1" v-if="isSRAdmin() || isSRUser()">
        <div class="d-flex justify-space-between">
          <v-col class="text-end">
            <v-btn
              @click="GET_SERVICEEQUESTS_FROM_API({payload: 'my', itemsPerPage: 10, page: 1}); $refs.srt1.resetOptions()"
              class="mr-2"
              height="50"
              color="secondary"
              text
              outlined
              >Обновить</v-btn
            >
            <v-btn height="50" @click="createDialog = true" outlined
              >НОВЫЙ ЗАПРОС</v-btn
            >
          </v-col>
        </div>
        <v-col>
          <service-request-table
            ref="srt1"
            :headers="headersServiceRequests"
            :servicerequest_data="SERVICEREQUESTS"
          />
        </v-col>
      </v-tab-item>
      <v-tab-item
        key="k2"
        value="k2"
        style="padding: 10px 20px 50px 30px"
        v-if="isSRAdmin()"
      >
        <div class="d-flex justify-space-between">
          <v-col class="text-start" cols="10">
            <span style="font-size: 14px; color: grey"
              >Все запросы пользователей</span
            >
          </v-col>
          <v-col class="text-end">
            <v-btn
              @click="GET_SERVICEEQUESTS_FROM_API({payload: 'all', itemsPerPage: 10, page: 1}); $refs.srt2.resetOptions()"
              class="mr-2"
              height="50"
              color="secondary"
              text
              outlined
              >Обновить</v-btn
            >
          </v-col>
        </div>
        <v-col>
          <service-request-table
            ref="srt2"
            :headers="headersServiceRequests"
            :servicerequest_data="SERVICEREQUESTS"
          />
        </v-col>
      </v-tab-item>
      <v-tab-item
        key="k3"
        value="k3"
        style="padding: 10px 20px 50px 30px"
        v-if="isSRAdmin() || isSRPerformer()"
      >
        <div class="d-flex justify-space-between">
          <v-col class="text-start" cols="10">
            <span style="font-size: 14px; color: grey"
              >Не обработанные, назначенные мне и отколненные в решении
              инициатором (отклоненные можно повторно взять в работу)</span
            >
          </v-col>
          <v-col class="text-end">
            <v-btn
              @click="GET_SERVICEEQUESTS_FROM_API({payload: 'wait', itemsPerPage: 10, page: 1}); $refs.srt3.resetOptions()"
              class="mr-2"
              height="50"
              color="secondary"
              text
              outlined
              >Обновить</v-btn
            >
          </v-col>
        </div>
        <v-col>
          <service-request-table
            ref="srt3"
            :headers="headersServiceRequests"
            :servicerequest_data="SERVICEREQUESTS"
          />
        </v-col>
      </v-tab-item>
      <v-tab-item
        key="k4"
        value="k4"
        style="padding: 10px 20px 50px 30px"
        v-if="isSRAdmin() || isSRPerformer()"
      >
        <div class="d-flex justify-space-between">
          <v-col class="text-start" cols="10">
            <span style="font-size: 14px; color: grey"
              >Принятые в работу и с предоставленным решением (не подтвержденные
              инициатором)</span
            >
          </v-col>
          <v-col class="text-end">
            <v-btn
              @click="GET_SERVICEEQUESTS_FROM_API({payload: 'progress', itemsPerPage: 10, page: 1});$refs.srt4.resetOptions()"
              class="mr-2"
              height="50"
              color="secondary"
              text
              outlined
              >Обновить</v-btn
            >
          </v-col>
        </div>
        <v-col>
          <service-request-table
            ref="srt4"
            :headers="headersServiceRequests"
            :servicerequest_data="SERVICEREQUESTS"
          />
        </v-col>
      </v-tab-item>
      <v-tab-item
        key="k5"
        value="k5"
        style="padding: 10px 20px 50px 30px"
        v-if="isSRAdmin() || isSRPerformer()"
      >
        <div class="d-flex justify-space-between">
          <v-col class="text-start" cols="10">
            <span style="font-size: 14px; color: grey"
              >Подтвержденные и отмененные инициатором запросы</span
            >
          </v-col>
          <v-col class="text-end">
            <v-btn
              @click="GET_SERVICEEQUESTS_FROM_API({payload: 'closed', itemsPerPage: 10, page: 1}); $refs.srt5.resetOptions()"
              class="mr-2"
              height="50"
              color="secondary"
              text
              outlined
              >Обновить</v-btn
            >
          </v-col>
        </div>
        <v-col>
          <service-request-table
            ref="srt5"
            :headers="headersServiceRequests"
            :servicerequest_data="SERVICEREQUESTS"
          />
        </v-col>
      </v-tab-item>
    </v-tabs-items>
    <service-request-create-form
      :dialog="createDialog"
      @closeCreateDialog="createDialog = false"
    />
  </div>
</template>
<script>
import ServiceRequestCreateForm from "@/components/servicerequest/ServiceRequestCreateForm.vue";
import ServiceRequestTable from "@/components/servicerequest/ServiceRequestTable.vue";
import checkRoles from "@/utils/check_role";

import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    ServiceRequestCreateForm,
    ServiceRequestTable,
  },

  data() {
    return {
      tab2: null,
      servicerequestTabItems: [],

      createDialog: false,

      headersServiceRequests: [
        { text: "№", value: "id" },
        { text: "Описание", value: "description", width: "25%" },
        { text: "Категория", value: "category_name" },
        { text: "Подкатегория", value: "subcategory_name" },
        { text: "Инициатор", value: "created_user_name" },
        { text: "Дата обновления", value: "update_date" },
        { text: "Текущий статус", value: "status_name" },
        { text: "", value: "action" },
      ],
    };
  },
  computed: {
    ...mapGetters(["SERVICEREQUESTS", "PERFORMERS"]),

    servicerequestTabs: {
      set(value) {
        this.$store.commit("change_servicerequest_tab", value);
      },
      get() {
        return this.$store.getters.servicerequest_current_tab;
      },
    },
  },
  methods: {
    ...mapActions([
      "GET_SERVICEREQUEST_TYPES_FROM_API",
      "GET_SERVICEEQUESTS_FROM_API",
    ]),
    retCurrentUserHeadPerformerGroupList() {
      let filterData = this.PERFORMERS.filter(
        (el) => el.user_id == this.$userData.id && el.is_head_performer
      );
      let currentUserHeadPerformerGroupList = [];
      for (let i = 0; i < filterData.length; i++) {
        if (
          !currentUserHeadPerformerGroupList.includes(
            filterData[i].sr_performer_group_id
          )
        ) {
          currentUserHeadPerformerGroupList.push(
            filterData[i].sr_performer_group_id
          );
        }
      }
      return currentUserHeadPerformerGroupList;
    },
    retCurrentUserAllPerformerGroupList() {
      let filterData = this.PERFORMERS.filter(
        (el) => el.user_id == this.$userData.id
      );
      let currentUserPerformerGroupList = [];
      for (let i = 0; i < filterData.length; i++) {
        if (
          !currentUserPerformerGroupList.includes(
            filterData[i].sr_performer_group_id
          )
        ) {
          currentUserPerformerGroupList.push(
            filterData[i].sr_performer_group_id
          );
        }
      }
      return currentUserPerformerGroupList;
    },
    servicerequest_my_request() {
      let data = this.SERVICEREQUESTS.filter(
        (el) => el.create_user_id == this.$userData.fullData.id
      );
      return data;
    },
    servicerequest_all_request() {
      return this.SERVICEREQUESTS;
    },
    servicerequest_in_new() {
      let data;
      if (this.isSRAdmin()) {
        data = this.SERVICEREQUESTS.filter(
          (el) =>
            el.sr_status_id == 2 ||
            el.sr_status_id == -2 ||
            el.sr_status_id == 5
        );
      } else {
        data = this.SERVICEREQUESTS.filter(
          (el) =>
            (el.sr_status_id == 2 &&
              this.retCurrentUserAllPerformerGroupList().includes(
                el.sr_performer_group_id
              )) ||
            ((el.sr_status_id == -2 || el.sr_status_id == 5) &&
              el.performer_user_id == this.$userData.id &&
              this.retCurrentUserAllPerformerGroupList().includes(
                el.sr_performer_group_id
              )) ||
            ((el.sr_status_id == -2 || el.sr_status_id == 5) &&
              this.retCurrentUserHeadPerformerGroupList().includes(
                el.sr_performer_group_id
              ))
        );
      }
      return data;
    },
    servicerequest_in_progress() {
      let data;
      if (this.isSRAdmin()) {
        data = this.SERVICEREQUESTS.filter(
          (el) => el.sr_status_id == 3 || el.sr_status_id == 4
        );
      } else {
        data = this.SERVICEREQUESTS.filter(
          (el) =>
            ((el.sr_status_id == 3 || el.sr_status_id == 4) &&
              el.performer_user_id == this.$userData.id &&
              this.retCurrentUserAllPerformerGroupList().includes(
                el.sr_performer_group_id
              )) ||
            ((el.sr_status_id == 3 || el.sr_status_id == 4) &&
              this.retCurrentUserHeadPerformerGroupList().includes(
                el.sr_performer_group_id
              ))
        );
      }
      return data;
    },
    servicerequest_in_closed() {
      let data;
      if (this.isSRAdmin()) {
        data = this.SERVICEREQUESTS.filter(
          (el) => el.sr_status_id == -1 || el.sr_status_id == 6
        );
      } else {
        data = this.SERVICEREQUESTS.filter(
          (el) =>
            ((el.sr_status_id == -1 || el.sr_status_id == 6) &&
              el.performer_user_id == this.$userData.id &&
              this.retCurrentUserAllPerformerGroupList().includes(
                el.sr_performer_group_id
              )) ||
            ((el.sr_status_id == -1 || el.sr_status_id == 6) &&
              this.retCurrentUserHeadPerformerGroupList().includes(
                el.sr_performer_group_id
              ))
        );
      }
      return data;
    },
    isSRAdmin() {
      return checkRoles("34", this.$userData);
    },
    isSRUser() {
      return checkRoles("50", this.$userData);
    },
    isSRPerformer() {
      return checkRoles("51", this.$userData);
    },
    async getServicerequestByTab() {
      this.servicerequestTabs;
      switch (this.servicerequestTabs) {
        case "k1":
          this.GET_SERVICEEQUESTS_FROM_API({payload: 'my', itemsPerPage: 10, page: 1});
          if(this.$refs.srt1){
            this.$refs.srt1.resetOptions()
          }
          break;
        case "k2":
          this.GET_SERVICEEQUESTS_FROM_API({payload: "all", itemsPerPage: 10, page: 1});
          if(this.$refs.srt2){
            this.$refs.srt2.resetOptions()
          }
          break;
        case "k3":
          this.GET_SERVICEEQUESTS_FROM_API({payload: "wait", itemsPerPage: 10, page: 1});
          if(this.$refs.srt3){
            this.$refs.srt3.resetOptions()
          }
          break;
        case "k4":
          this.GET_SERVICEEQUESTS_FROM_API({payload: "progress", itemsPerPage: 10, page: 1});
          if(this.$refs.srt4){
            this.$refs.srt4.resetOptions()
          }
          break;
        case "k5":
          this.GET_SERVICEEQUESTS_FROM_API({payload: 'closed', itemsPerPage: 10, page: 1});
          if(this.$refs.srt5){
            this.$refs.srt5.resetOptions()
          }
          break;
      }
    },
  },
  async mounted() {
    await this.GET_SERVICEREQUEST_TYPES_FROM_API();
     this.getServicerequestByTab()

    if (this.isSRAdmin()) {
      this.servicerequestTabItems = [
        { id: 1, name: "Мои запросы" },
        { id: 2, name: "Все запросы" },
        { id: 3, name: "Поступившие" },
        { id: 4, name: "В работе" },
        { id: 5, name: "Закрытые" },
      ];
    } else if (this.isSRUser()) {
      this.servicerequestTabItems = [{ id: 1, name: "Мои запросы" }];
    } else if (this.isSRPerformer()) {
      this.servicerequestTabItems = [
        { id: 3, name: "Поступившие" },
        { id: 4, name: "В работе" },
        { id: 5, name: "Закрытые" },
      ];
    } else {
      this.servicerequestTabItems = [];
    }

  },
  watch: {
    servicerequestTabs() {
      this.getServicerequestByTab()
    },
  },
};
</script>