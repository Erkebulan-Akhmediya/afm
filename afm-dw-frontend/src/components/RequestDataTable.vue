<template>
  <div class="request-data-table">
    <div class="pa-2">
      <FindRequest @findRequest="findRequest2" @clearFindRequest="clearFindRequest"></FindRequest>
    </div>
    <v-data-table
      :headers="headersRequest"
      :items="request"
      :options.sync="options"
      :server-items-length="totalLength"
      style="margin-top: 2rem"
      class="elevation-1"
      :loading="loader"
      @click:row="getRequestApproveInfo"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
    >
      <template v-slot:[`item.type`]="{ item }">
        <td>{{ item.request_type_name }}</td>
      </template>
      <template v-slot:[`item.create_date`]="{ item }">
        {{item.create_date?$convertDate(item.create_date):''}}
      </template>
      <template v-slot:[`item.employee`]="{ item }">
        <td>
          {{ item.last_name }} {{ item.first_name }}
          {{ item.middle_name }}
        </td>
      </template>
      <template v-slot:[`item.approve_date`]="{ item }">
        <td>{{ item.approve_date ? moment(item.approve_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}</td>
      </template>
      <template v-slot:[`item.send_date`]="{ item }">
        <td>{{ item.send_date ? moment(item.send_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}</td>
      </template>
      <template v-slot:[`item.sub_type`]="{ item }">
        <td>{{ item.request_sub_type_name }}</td>
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <td>
          <v-chip
            class="ma-2"
            :color="getChipsColor(item.request_status_id)"
            text-color="white"
          >
            {{ item.request_status_name }}
          </v-chip>
        </td>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <td style="display: flex;" v-if="item.request_status_id == 1 && item.request_approve_status_id == 3">
          <v-btn
            color="success"
            elevation="2"
            style="font-size: 10px;"
            value="item"
            @click.stop="showApproveDialog(item, true)"
            >Согласовать</v-btn
          >
          <v-btn
            color="red"
            elevation="2"
            style="color: #fff; font-size: 10px; margin-left: 10px;"
            @click.stop="showApproveDialog(item, false)"
            >Отклонить</v-btn
          >
        </td>
      </template>
    </v-data-table>
  </div>
</template>
<script>
import moment from 'moment'
import FindRequest from '../components/FindRequest.vue'

export default {
  components: {
    FindRequest

  },
  data: function() {
    return {
      moment,
      options: {},
      searchData: {},
    };
  },

  methods: {
    findRequest2(data) {
      this.searchData = data
      data.options = this.options
      this.$emit("findRequest", data);
    }, 

    clearFindRequest() {
      this.searchData = {}
      let data = {}
      this.options.page = 1
      this.options.itemsPerPage = 10
      data.options = this.options
      this.$emit("clearFindRequest", data);
    },

    getRequestApproveInfo(data) {
      this.$emit("getRequestApproveInfo", data);
    },
    showApproveDialog(data, isApprove) {
      this.$emit("showApproveDialog", data, isApprove);
    },
    getChipsColor(data) {
      switch(data){
        case 2:
          return 'primary'
        case 9:
          return 'primary'
        case 14:
          return 'primary'
        case 3:
          return 'green'
        case 10:
          return 'green'
        case 15:
          return 'green'
        case 4:
          return 'red'
        case 11:
          return 'red'
        case 5:
          return 'orange'
        case 13:
          return 'orange'
        default:
          break;
      }
    },
  },
  watch: {
    options: {
      handler () {
        let data = this.searchData
        data.options = this.options
        this.$emit("findRequest", data);
      }
    },
    itemsPerPage: {
      handler (data) {
        this.options.itemsPerPage = data
      }
    }
  },
  props: ["request", "headersRequest", "loader", "totalLength", "itemsPerPage"],
};
</script>