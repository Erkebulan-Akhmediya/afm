<template>
  <v-card v-if="servicerequest_data.create_user_id == $userData.id || servicerequest_data.performer_user_id == $userData.id || isPerformer() || isHeadPerformer()">
    <!-- <p>{{ this.$userData }}</p> -->
    <!-- <p>{{$route.params}}</p> -->
    <v-card-actions>
      <v-col cols="1" class="ma-0 pa-0">
        <v-btn class="mb-1" color="#5787A4" icon @click="$router.go(-1)">
          <v-icon>mdi-arrow-left-thin-circle-outline</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="11" class="ma-0 pa-0" align="end">
        <v-btn
          class="ml-2"
          outlined
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          @click="openEditDialog(servicerequest_data)"
          color="primary"
          v-if="servicerequest_data.create_user_id == $userData.id && (servicerequest_data.sr_status_id == 1 || servicerequest_data.sr_status_id == 9)"
          ><v-icon left>mdi-pencil </v-icon>Редактировать</v-btn
        > <!--Редактировать может только создатель на статусе Проект-->
        <v-btn
          class="ml-2"
          outlined
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          @click="send_request"
          color="green darken-1"
          v-if="servicerequest_data.create_user_id == $userData.id && (servicerequest_data.sr_status_id == 1 || servicerequest_data.sr_status_id == 9)"
          >Отправить<v-icon right> mdi-send </v-icon></v-btn
        > <!--Отправить может только создатель на статусе Проект-->
        <v-btn
          class="ml-2"
          outlined
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          color="primary"
          @click="to_perform_dialog = true"
          v-if="(servicerequest_data.sr_status_id == 2) && isHeadPerformer()"
          >Назначить исполнителя</v-btn
        > <!--Назначить исполнителя может руководитель группы исполнителей на статусе направлен-->
        <v-btn
          class="ml-2"
          outlined
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          color="primary"
          @click="to_perform_dialog = true"
          v-if="(servicerequest_data.sr_status_id == 5 || servicerequest_data.sr_status_id == -2) && isHeadPerformer()"
          >Переназначить исполнителя</v-btn
        > <!--Переназначить исполнителя может руководитель группы исполнителей на статусах отклонен инициатором и назначен исполнитель-->
        <v-btn
          class="ml-2"
          outlined
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          color="green darken-1"
          @click="change_status({id: servicerequest_data.id, sr_status_id: 3, performer_user_id: $userData.id, current_sr_status_id: servicerequest_data.sr_status_id });"
          v-if="(servicerequest_data.sr_status_id == 2 || ((servicerequest_data.sr_status_id == 5 || servicerequest_data.sr_status_id == -2) && servicerequest_data.performer_user_id == $userData.id)) && isPerformer()"
          >Взять в работу</v-btn
        > <!--Взять в работу исполнитель по своей группе может по всем направленным, отклоненные инициатором по его запросу и назначенные ему-->
        <v-btn
          class="ml-2 white--black"
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          color="grey lighten-1"
          @click="openChangeStatusWithDescriptionDialog({id: servicerequest_data.id, sr_status_id: -1, dialogTitle: 'Отозвать запрос №'+servicerequest_data.id});"
          v-if="servicerequest_data.create_user_id == $userData.id && (servicerequest_data.sr_status_id == 2 || servicerequest_data.sr_status_id == -2 || servicerequest_data.sr_status_id == 3 || servicerequest_data.sr_status_id == 5)"
          >Отозвать</v-btn
        > <!--Иницатор может отозвать свой запрос в статусах направлен, назначен исполнитель, взят в работу и отклонен инициатором-->
        <v-btn
          class="ml-2"
          outlined
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          color="green darken-1"
          @click="openChangeStatusWithDescriptionDialog({id: servicerequest_data.id, sr_status_id: 4, dialogTitle: 'Предоставление решения по запросу №'+servicerequest_data.id});"
          v-if="servicerequest_data.sr_status_id == 3 && servicerequest_data.performer_user_id == $userData.id && isPerformer()"
          >Предоставить решение</v-btn
        > <!--Предоставить решение по своей группе можно по взятому в работу своему запросу-->
        <v-btn
          class="ml-2 white--text"
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          color="red darken-2"
          @click="openChangeStatusWithDescriptionDialog({id: servicerequest_data.id, sr_status_id: 5, dialogTitle: 'Запрос №'+servicerequest_data.id+' не решен'});"
          v-if="servicerequest_data.sr_status_id == 4 && servicerequest_data.create_user_id == $userData.id"
          >Не решена</v-btn
        > <!--Отклонить решение запроса может инициатор на статусе предоставлено решение-->
        <v-btn
          class="ml-2 white--text"
          :loading="IS_SENDING_SERVICEREQUEST"
          :disabled="IS_SENDING_SERVICEREQUEST || is_loading"
          color="green darken-2"
          @click="openChangeStatusWithDescriptionDialog({id: servicerequest_data.id, sr_status_id: 6, dialogTitle: 'Подтверждение решения запроса №'+servicerequest_data.id});"
          v-if="(servicerequest_data.sr_status_id == 3 || servicerequest_data.sr_status_id == 4) && servicerequest_data.create_user_id == $userData.id"
          >Подтверждение</v-btn
        > <!--Подтвердить решение может инициатор на статусах взят в работу исполнителем (на месте решили вопрос) и предоставлено решение-->
      </v-col>
    </v-card-actions>

    <v-row>
      <v-col cols="8">
        <v-card-title class="text-h6 mb-1">
          Запрос {{ servicerequest_data.id }} #{{ servicerequest_data.category_name }} #{{ servicerequest_data.subcategory_name }}
          <v-chip
            class="ml-2"
            small
            :color="getChipsColor(servicerequest_data)"
            text-color="white"
            v-text="servicerequest_data.status_name"
          >
           
          </v-chip>
        </v-card-title>

        <v-card-text>
          <div>
            <b>Инициатор:</b>
            <br /><span class="ml-2">{{
              servicerequest_data.department_name
            }}</span>
            <br /><span class="ml-2">{{
              servicerequest_data.position_name
            }}</span>
            <br /><span
              class="ml-2"
              v-html="servicerequest_data.created_user_name"
            ></span>
            <br /><span class="ml-2">
              {{
                servicerequest_data.work_phone
                  ? servicerequest_data.work_phone
                  : ""
              }} </span
            ><br />
          </div>
          <br />
          <div>
            <b>Описание:</b>
            <br /><span class="ml-2">{{
              servicerequest_data.description
            }}</span>
          </div>
          <!-- //доп характеристики -->
          <div v-for="item in characteristics_list" :key="item.id">
            <b>{{item.name}}:</b>
            <br /><span class="ml-2">{{
              item.value
            }}</span>
          </div>
        </v-card-text>
      </v-col>
      <v-col cols="4">
        <br/>
        <v-timeline align-top dense>
          <v-timeline-item
            v-for="(item, index) of status_history"
            :key="index"
            :color="getChipsColor(item)"
            small
          >
            <v-row class="pt-1">
              <v-col cols="4">
                <div class="text-caption">
                  {{ $moment(item.create_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') }}
                </div>
              </v-col>
              <v-col>
                <div class="text-caption">
                  <b>{{ item.sr_status_name }}</b> <br/> {{ item.description}}
                </div>
              </v-col>
            </v-row>
          </v-timeline-item>
        </v-timeline>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-col cols="3" class="pb-0">
          <v-file-input
            :change="fileUpload()"
            :label="$t('globalWords.addFile')"
            dense
            outlined
            v-model="file"
            v-if="servicerequest_data.sr_status_id == 1 && servicerequest_data.create_user_id == $userData.id"
          > <!--Прикреплять файлы к запросу может инициатор на статусе проект -->
          </v-file-input>
        </v-col>
        <v-col cols="12" class="pt-0">
          <v-data-table
            :no-data-text="$t('passRequest.fileListIsEmpty')"
            :headers="fileHeaders"
            :items="servicerequest_data.files"
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
                v-if="item.create_user == $userData.fullData.username"
              >
                <v-icon>mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
        <v-col cols="12" v-if="servicerequest_data.approve_request_id">

          <ApproveList ref="approve_list" :currentRequestStatus="servicerequest_data.sr_status_id == 1 || servicerequest_data.sr_status_id == 9?0:1" :currentRequest="servicerequest_data">
          </ApproveList>
        </v-col>
      </v-col>
    </v-row>
    <service-request-create-form
      :dialog="createDialog"
      @closeCreateDialog="
        createDialog = false;
        get_servicerequest_data();
      "
      :dialogData="dialogData"
    />
    <service-request-description
      :dialog="createDescriptionDialog"
      @closeDescriptionDialog="
        createDescriptionDialog = false;
        get_servicerequest_data();
      "
      :dialogData="dialogData"
    />
    <service-request-performer
      :servicerequest_data="servicerequest_data"
      @closeDialog="closePerformDialog"
      :to_perform_dialog="to_perform_dialog"
      @updateservicerequest="get_servicerequest_data()"
    />
    <!-- @updateservicerequest="get_servicerequest_data" -->
  </v-card>
</template>
<script>
import ServiceRequestCreateForm from "@/components/servicerequest/ServiceRequestCreateForm.vue";
import ServiceRequestDescription from "@/components/servicerequest/ServiceRequestDescription.vue";
import ServiceRequestPerformer from "@/components/servicerequest/ServiceRequestPerformer.vue";
import ApproveList from '../components/ApproveList.vue'

import { mapActions, mapGetters } from "vuex";
import moment from 'moment'

export default {
  components: {
    ApproveList,
    ServiceRequestCreateForm,
    ServiceRequestDescription,
    ServiceRequestPerformer,
  },

  data() {
    return {
      moment,

      servicerequest_data: {},
      is_loading: false,

      status_history: [],

      createDialog: false,
      createDescriptionDialog: false,
      dialogData: {},

      file: null,
      fileHeaders: [
        { text: "№", value: "id" },
        { text: this.$t("globalWords.name"), value: "name" },
        { text: this.$t("globalWords.creator"), value: "create_user_name" },
        { text: this.$t("passRequest.addingDate"), value: "create_date" },
        { text: "", value: "action" },
      ],

      to_perform_dialog: false,

      characteristics_list: []
    };
  },
  computed: {
    ...mapGetters(["IS_SENDING_SERVICEREQUEST", "PERFORMERS", "SERVICEREQUEST"]),
  },
  methods: {
    ...mapActions(["CHANGE_SERVICEREQUEST_STATUS_API","GET_SERVICEREQUEST_TYPES_FROM_API"]),
    async getStatusHistory() {
      let { data } = await this.axios.get(
        `/api/1.0/servicerequests/status/history/` +  this.$route.params.id,
        { localParams: { id: this.$route.params.id } }
      );
      this.status_history = data;
    },
    isPerformer() {
      let result = this.PERFORMERS.find(
        (el) =>
          el.user_id == this.$userData.id &&
          el.sr_performer_group_id == this.servicerequest_data.sr_performer_group_id
      );
      return result ? true : false;
    },
    isHeadPerformer() {
      let result = this.PERFORMERS.find(
        (el) =>
          el.user_id == this.$userData.id && 
            el.sr_performer_group_id == this.servicerequest_data.sr_performer_group_id &&
              el.is_head_performer
      );
      return result ? true : false;
    },
    getChipsColor(item) {
      if (item.sr_status_id == 1 || item.sr_status_id == -1) { 
        return "grey";
      }
      if (item.sr_status_id == 2) { 
        return "blue accent-2";
      }
      if (item.sr_status_id == 3 || item.sr_status_id == 4 || item.sr_status_id == -2) { 
        return "orange accent-2";
      }
      if (item.sr_status_id == 6) { 
        return "green";
      }
      if (item.sr_status_id == 5) { 
        return "red accent-2";
      }
    },
    async get_servicerequest_data() {
      this.is_loading = true;
      try {
        let { data } = await this.axios.get(
          "/api/1.0/servicerequests/one/" + this.$route.params.id
        );
        this.servicerequest_data = data;
       await  this.GET_SERVICEREQUEST_TYPES_FROM_API();

        await this.get_characteristics_list(data.sr_subcategory_id, data.id);

        this.getStatusHistory();
      } catch (err) {
        console.log(err);
      } finally {
        this.is_loading = false;
      }
    },
    openEditDialog(item) {
      this.dialogData = {}
      this.dialogData.id = item.id;
      this.dialogData.description = item.description;
      this.dialogData.category = {
        id: item.sr_category_id,
        name: item.category_name,
        need_to_be_approved: item.need_to_be_approved,
      };
      this.dialogData.subcategory = {
        id: item.sr_subcategory_id,
        name: item.subcategory_name,
        sr_category_id: item.sr_category_id,
      };
      this.createDialog = true;
    },
    openChangeStatusWithDescriptionDialog(item) {
      this.dialogData = {}
      this.dialogData.id = item.id;
      this.dialogData.sr_status_id = item.sr_status_id;
      this.dialogData.description = "";
      this.dialogData.dialogTitle = item.dialogTitle;
      this.createDescriptionDialog = true;
    },
    fileUpload: async function () {
      if (this.file) {
        const form = new FormData();
        form.append("lang", this.$i18n.locale);
        form.append("user_id", this.$userData.fullData.username);
        form.append("file", this.file);
        form.append("fileType", "servicerequest");
        form.append("file_type_id", 14);
        form.append("pr_id", this.servicerequest_data.id);

        await this.axios.post(`/api/1.0/pass-request-file/`, form);
        this.file = null;

        this.get_servicerequest_data();
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

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: this.$t("globalWords.deleted"),
        });
        this.get_servicerequest_data();
      } catch (err) {
        console.error(err);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: this.$t("globalWords.deletingError"),
        });
      }
    },
    async closePerformDialog() {
      this.to_perform_dialog = false;
      this.get_servicerequest_data();
    },
    async send_request() {
      if (this.servicerequest_data.approve_request_id) {
        if (!await this.$refs.approve_list.sendToApprove()) return
        await this.change_status({id: this.servicerequest_data.id, sr_status_id: 7, sr_category_id: this.servicerequest_data.sr_category_id });
      } else {

                await this.change_status({id: this.servicerequest_data.id, sr_status_id: 2, sr_category_id: this.servicerequest_data.sr_category_id });
      }

    },
    async change_status(params) {
      try {
        await this.CHANGE_SERVICEREQUEST_STATUS_API(params);
      } catch (error) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
        });
      }
      this.get_servicerequest_data();
    },
    async get_characteristics_list(subcategory_id, sr_id) {
      this.characteristics_loader = true
      try {
        let {data} = await this.axios.get(`/api/1.0/servicerequests/characteristic/${subcategory_id}/${sr_id}`)
        this.characteristics_list = data
      } catch(err) {
        console.log(err)
      } finally {
        this.characteristics_loader = false
      }
    }
  },

  watch: {
    "$route.params.id": {
      handler: function () {  
        this.get_servicerequest_data();

              },
      deep: true,
      immediate: true,
    },
  },

   };
</script>