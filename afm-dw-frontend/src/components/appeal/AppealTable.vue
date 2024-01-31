<template>
  <div>
    <v-row>
      <v-col cols="4">
        <v-text-field
          v-model="search"
          prepend-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          class="mb-4"
          clear-icon="mdi-close-circle"
          clearable
          @click:clear="clearSearch"
          @keydown.enter.prevent="toSearch()"
        ></v-text-field>
      </v-col>

      <v-col cols="2" v-if="selectedTypeTable.id != 1">
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateRangeText"
              label="Дата регистрации"
              persistent-hint
              prepend-icon="event"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
            <!-- @blur="date = parseDate(dateFormatted)" -->
          </template>
          <v-date-picker range v-model="date" no-title>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Отмена </v-btn>
            <v-btn text color="primary" @click="getAppealsInDateRange()">
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="1" >
        <v-btn
          @click="reset()"
          class="mr-2"
          height="50"
          color="secondary"
          text
          outlined
          >Сброс</v-btn
        >
      </v-col>
      <v-col cols="1" v-if="(this.selectedTypeTable.id != 1 && this.selectedTypeTable.id != 3 && this.selectedTypeTable.id != 2)|| this.selectedTypeTable.sys_name=='with_me_secretary'">
        <v-btn
          @click="getXls()"
          class="mr-2"
          height="50"
          :loading="buttonDownloadLoader"
          :disabled="buttonDownloadLoader"
          color="secondary"
          text
          outlined
          >Скачать exel</v-btn
        >
      </v-col>
    </v-row>
    <v-data-table
      dense
      disable-sort
      :headers="headers"
      :items="appeal_data"
      :items-per-page="10"
      :loading="IS_SENDING_APPEAL"
      :options.sync="servicerequestOptions"
      :server-items-length="total"
      @update:options="paginatorHandler()"
    >
      <template v-slot:[`item.appeal_status_name`]="{ item }">
        <td>
          <v-chip
            class="ma-1"
            :color="getChipsColor(item)"
            text-color="white"
            v-text="item.appeal_status_name.replace(/\(.+\)/, '')"
          >
          </v-chip>
        </td>
      </template>
      <template v-slot:[`item.voted`]="{ item }">
        <td>
          {{ `${item.votes.length}/${item.experts.length}` }}
        </td>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          class="ma-1"
          small
          color="primary"
          @click.stop="goToAppealCard(item)"
        >
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>
      <template v-slot:[`item.appeal_send_date`]="{ item }">
        {{
          item.appeal_send_date
            ? $moment(new Date(item.appeal_send_date + "+0000")).format(
                "DD.MM.YYYY HH:mm"
              )
            : ""
        }}
      </template>
      <template v-slot:[`item.end_date`]="{ item }" color="red">
        <td :class="endDateColor(item)">{{ endDate(item) }}</td>
      </template>
      <template
        v-slot:[`item.expected_date_of_complete`]="{ item }"
        color="red"
      >
        <td :class="endDateColor(item)">
          {{
            item.expected_date_of_complete
              ? $moment(
                  new Date(item.expected_date_of_complete + "+0000")
                ).format("DD.MM.YYYY")
              : ""
          }}
        </td>
      </template>
    </v-data-table>
    <appeal-create-form
      :dialog="createDialog"
      @closeCreateDialog="createDialog = false"
      :dialogData="dialogData"
    />
  </div>
</template>
<script>
import AppealCreateForm from "@/components/appeal/AppealCreateForm.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    AppealCreateForm,
  },
  props: ["headers", "appeal_data", "selectedTypeTable", "voted"],
  data() {
    return {
      dialogData: {},
      createDialog: false,
      search: "",
      menu: false,
      date: null,
      dateRangeText: "",
      options: {},
      buttonDownloadLoader: false
    };
  },
  computed: {
    ...mapGetters([
      "IS_SENDING_APPEAL",
      "APPEALS_TOTAL",
      "NOTVOTED_APPEALS_TOTAL",
      "VOTED_APPEALS_TOTAL",
    ]),
    total() {
      if (this.selectedTypeTable.sys_name != "with_me") {
        return this.APPEALS_TOTAL;
      } else if (
        this.selectedTypeTable.sys_name == "with_me" &&
        this.voted == true
      ) {
        return this.VOTED_APPEALS_TOTAL;
      } else {
        return this.NOTVOTED_APPEALS_TOTAL;
      }
    },
    servicerequestOptions: {
      set(value) {
        if (this.selectedTypeTable.sys_name != "with_me") {
          this.$store.commit("change_appeals_options", value);
        } else if (
          this.selectedTypeTable.sys_name == "with_me" &&
          this.voted == true
        ) {
          this.$store.commit("change_appeals_voted_options", value);
        } else if (
          this.selectedTypeTable.sys_name == "with_me" &&
          this.voted == false
        ) {
          this.$store.commit("change_appeals_notvoted_options", value);
        }
      },
      get() {
        if (this.selectedTypeTable.sys_name != "with_me") {
          return this.$store.getters.appeals_options;
        } else if (
          this.selectedTypeTable.sys_name == "with_me" &&
          this.voted == true
        ) {
          return this.$store.getters.appeals_voted_options;
        } else{
          return this.$store.getters.appeals_notvoted_options;
        }
      },
    },
  },
  methods: {
    ...mapActions(["GET_APPEALS_WITH_PARAMS_FROM_API", "GET_APPEALS_FROM_API"]),
    paginatorHandler() {
      let params = {
        table_type: this.selectedTypeTable.sys_name,
        page: this.servicerequestOptions.page,
        itemsPerPage: this.servicerequestOptions.itemsPerPage,
      };
      if (this.date != null) {
        params.date = this.date;
      }
      if (this.search != "") {
        params.search_string = this.search;
      }
      if (this.voted != undefined) {
        params.voted = this.voted;
      }
      this.GET_APPEALS_WITH_PARAMS_FROM_API(params);
    },
    getAppealsInDateRange() {
      this.servicerequestOptions.itemsPerPage = 10;
      this.servicerequestOptions.page = 1;
      let params = {};
      if (this.search != "") {
        params = {
          date: this.date,
          search_string: this.search,
          table_type: this.selectedTypeTable.sys_name,
        };
      } else {
        params = {
          date: this.date,
          table_type: this.selectedTypeTable.sys_name,
        };
      }
      if (this.voted != undefined) {
        params.voted = this.voted;
      }
      this.GET_APPEALS_WITH_PARAMS_FROM_API(params);

      this.menu = false;
      this.dateRangeText = this.date.join(" ~ ");
    },
    clearSearch() {
      this.search = "";
      this.toSearch();
    },
    toSearch() {
      this.servicerequestOptions.itemsPerPage = 10;
      this.servicerequestOptions.page = 1;
      let params = {};
      if (this.date != null) {
        params = {
          date: this.date,
          search_string: this.search,
          table_type: this.selectedTypeTable.sys_name,
        };
      } else {
        params = {
          search_string: this.search,
          table_type: this.selectedTypeTable.sys_name,
        };
      }
      if (this.voted != undefined) {
        params.voted = this.voted;
      }
      this.GET_APPEALS_WITH_PARAMS_FROM_API(params);
    },
    reset() {
      this.search = "";
      this.date = null;
      this.dateRangeText = "";
      this.servicerequestOptions.itemsPerPage = 10;
      this.servicerequestOptions.page = 1;
      let params = { table_type: this.selectedTypeTable.sys_name };
      if (this.voted != undefined) {
        params.voted = this.voted;
      }
      this.GET_APPEALS_WITH_PARAMS_FROM_API(params);
    },

    endDate(item) {
      if (item.appeal_status_id === 4) {
        return this.$moment(new Date(item.last_status_date + "+0000"))
          .add(10, "d")
          .format("DD.MM.YYYY");
      } else if (item.appeal_status_id === 44) {
        return this.$moment(new Date(item.last_status_date + "+0000"))
          .add(3, "d")
          .format("DD.MM.YYYY");
      } else {
        return "";
      }
    },
    endDateColor(item) {
      let date = this.$moment(new Date(item.last_status_date + "+0000"));
      if (
        item.appeal_status_id === 4 &&
        this.$moment().isSameOrAfter(date.add(8, "d"))
      ) {
        return "textcolor-red";
      } else if (
        item.appeal_status_id === 44 &&
        this.$moment().isSameOrAfter(date.add(1, "d"))
      ) {
        return "textcolor-red";
      } else if (
        (item.appeal_status_id === 6 || item.appeal_status_id === 66) &&
        this.$moment().isSameOrAfter(
          this.$moment(
            new Date(item.expected_date_of_complete + "+0000")
          ).subtract(2, "d")
        )
      ) {
        return "textcolor-red";
      } else {
        return "";
      }
    },
    async goToAppealCard(data) {
      this.$router.push(`/appeals/${data.id}`);
    },
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
        item.appeal_status_id == 6
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

    saveData (data, fileName) {
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          let url = window.URL.createObjectURL(data);
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
      },

    async getXls(){
      this.buttonDownloadLoader = true
        try{
          let params = { table_type: this.selectedTypeTable.sys_name}
          if (this.date != null) {

                    let date = this.date.sort()

                       params.date_from = date[0];
            params.date_end = date[1];
      }

         let response = await this.axios.get(`/api/1.0/appeal/xlsx`, {responseType: 'blob', params})

          let blob = new Blob([response.data], { type: 'application/xlsx' })
          let disposition = response.headers['content-disposition']
          //eslint-disable-next-line
          const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i
          let filename = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1])
          this.saveData(blob, filename)

        } catch(err) {

            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 600,
              timer: 5000,
              title: err.data?.ERR_MSG ? err.data.ERR_MSG : err,
            });

                 } finally {
          this.buttonDownloadLoader = false
        }
    }
  },
  watch: {

       selectedTypeTable() {
      this.servicerequestOptions.itemsPerPage = 10;
      this.servicerequestOptions.page = 1;
    },
  },
};
</script><style scoped>
.textcolor-red {
  color: red;
}
</style>