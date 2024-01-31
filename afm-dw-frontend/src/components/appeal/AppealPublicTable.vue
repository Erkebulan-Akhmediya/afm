<template>
  <div>
    <span style="font-size: 16px; color: green"
      ><b>Одобренные и предложения в производстве</b>
     </span
    >
    <br /><br />
    <v-data-table
      dense
      disable-sort
      :headers="headers"
      :items="appeals"
      :items-per-page="10"
      :loading="load_publick_data"
      :options.sync="servicerequestOptions"
      :server-items-length="total"
      :hide-default-footer="load_publick_data"
      @update:options="paginatorHandler()"
    >
      <template v-slot:[`item.status`]="{ item }">
        <td>
          <v-chip
            class="ma-1"
            :color="getChipsColor(item)"
            text-color="white"
            v-text="getStatusName(item)"
          >
          </v-chip>
        </td>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          class="ma-1"
          small
          color="primary"
          @click.stop="
            dialog = true;
            appeal_data = item;
          "
        >
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>
      <template v-slot:[`item.appeal_send_date`]="{ item }">
        {{item.appeal_send_date ? $moment(new Date(item.appeal_send_date + '+0000')).format('DD.MM.YYYY') : ''}}
      </template>
    </v-data-table>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent width="1000">
        <v-card>
          <div class="dialog-wrapper" :style="'overflow-y: scroll;'">
          <v-card-title
            >{{ appeal_data.title }}
            <v-chip
              class="ma-1"
              :color="getChipsColor(appeal_data)"
              text-color="white"
              v-text="getStatusName(appeal_data)"
            >
            </v-chip>
          </v-card-title>
          <v-card-text class="pt-4 px-8">
            <!-- <div v-if="appeal_data.appeal_status_id == -1">
              <b class="red--text">Замечание секретаря:</b>
              <p
                class="ml-2 red--text"
                v-html="appeal_data.secretary_description"
              ></p>
            </div> -->
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

          <v-col cols="12" class="px-8">
            <v-data-table
              dense
              disable-sort
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
            </v-data-table>
          </v-col>
          <v-col
            v-if="
              appeal_data.appeal_status_id === 4 ||
              appeal_data.appeal_status_id === 44 ||
              appeal_data.appeal_status_id === -4
            "
            class="discussion"
            cols="12"
          >
          <!-- {{appeal_data}} -->
            <discussion-area
              
              :appeal="appeal_data"
              :is_private="false"
              
            />
          </v-col>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red darken-1"
              text
              @click="
                dialog = false;
                appeal_data = {};
              "
            >
              Закрыть
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import DiscussionArea from "@/components/DiscussionArea.vue";

export default {
  components: {
    DiscussionArea,
  },
  data() {
    return {
      appeal_table: [],
      appeals: [],
      dialog: false,
      appeal_data: {},
      allAppeal: 0,
      approved: 0,
      disapproved: 0,
      load_publick_data: true,
      servicerequestOptions: null,
      total: 10,

      fileHeaders: [
        { text: "№", value: "id" },
        { text: this.$t("globalWords.name"), value: "name" },
        { text: "", value: "action" },
      ],

      headers: [
        { text: "#", value: "id" },
        { text: "Тема", value: "title", width: "25%" },
        { text: "Подтип", value: "appeal_subtype_name" },
        { text: "Организация", value: "organization_name" },
        { text: "Отдел", value: "department_name" },
        { text: "Инициатор", value: "created_user_name" },
        { text: "Дата регистрации", value: "appeal_send_date" },
        { text: "Статус", value: "status" },
        { text: "Действия", value: "action" },
      ],
    };
  },
  computed: {},
  methods: {
    async paginatorHandler() {
      this.getAppeal()
    },
    async getAppeal() {
      this.load_publick_data = true;
      let params = {
        itemsPerPage: this.servicerequestOptions.itemsPerPage,
        page: this.servicerequestOptions.page,
        tabType: 0
      }


            if (this.placeholder == 0) {
        this.appeals = data;
        params.tabType = 0;
      } else if (this.placeholder == 1) {
        params.tabType = 1;
      } else if (this.placeholder == 2) {
        params.tabType = 2;
      } else {
        return alert(
          "Не корректно определен переход, обратитесь к администратору системы"
        );
      }
      let { data } = await this.axios.get("/api/1.0/appeal/public", {params});
      this.appeals = data.appeals;
      this.total = data.total;
       this.load_publick_data = false;
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
    getChipsColor(item) {
      if (
        item.appeal_status_id == 3 ||
        item.appeal_status_id == 4 ||
        item.appeal_status_id == 44 ||
        item.appeal_status_id == -4
      ) {
        return "blue lighten-1";
      }
      if (
        item.appeal_status_id == 5 ||
        item.appeal_status_id == 6 ||
        item.appeal_status_id == 7 ||
        item.appeal_status_id == -3 ||
        item.appeal_status_id == 66
      ) {
        return "green";
      }
    },
    getStatusName(item) {
      if (
        item.appeal_status_id == 3 ||
        item.appeal_status_id == 4 ||
        item.appeal_status_id == 44 ||
        item.appeal_status_id == -4
      ) {
        return "В производстве";
      }
      if (
        item.appeal_status_id == 5 ||
        item.appeal_status_id == 6 ||
        item.appeal_status_id == 7 ||
        item.appeal_status_id == -3 ||
        item.appeal_status_id == 66
      ) {
        return "Одобрено";
      }
    },
  },
  mounted() {
    this.getAppeal();
  },
  props: ["placeholder"],
};
</script><style lang="scss">
  .dialog-wrapper {
    max-height: 75vh;
    padding-right: 20px;
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
</style>