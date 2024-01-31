<template>
  <div>
    <v-data-table
      dense
      disable-sort
      :headers="headers"
      :items="servicerequest_data"
      :items-per-page="10"
      :options.sync="options"
      :server-items-length="SERVICEREQUESTS_COUNT"
    >
      <template v-slot:[`item.description`]="{ item }">
        <td>
          <!-- <h4 class="ma-auto" v-html="item.description.substr(0, 15)"></h4> -->
          <h4 class="ma-auto" v-html="truncateString(item.description, 25)"></h4>
        </td>
      </template>
      <template v-slot:[`item.status_name`]="{ item }">
        <td>
          <v-chip
            class="ma-1"
            :color="getChipsColor(item)"
            text-color="white"
            v-text="item.status_name.replace(/\(.+\)/,'')"
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
          @click.stop="goToCard(item)"
        >
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>
      <template v-slot:[`item.update_date`]="{ item }">
        {{$moment(new Date(item.update_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}
      </template>
    </v-data-table>
  </div>
</template>
<script>

import moment from 'moment'
import { mapActions, mapGetters } from "vuex";

export default {
  components: {

     },
  props: ["headers", 'servicerequest_data'],
  data() {
    return {
      moment,
      dialogData: {},
      createDialog: false,
      options: {}
    }
  },
  computed: {
    ...mapGetters(['SERVICEREQUESTS_COUNT']),
  },
  watch: {
    options: {
      handler() {
        this.SERVICEEQUESTS_CHANGE_PAGE_FROM_API(this.options)
      },
    }
  },
  methods: {
    ...mapActions(['SERVICEEQUESTS_CHANGE_PAGE_FROM_API']),
    resetOptions() {
      this.options = {page: 1, itemsPerPage: 10}
    },
    truncateString (s, w) 
    {
      return s.length > w ? s.slice(0, w).trim() + "..." : s;
    },
    async goToCard(data) {
      this.$router.push(`/servicerequests/${this.$crypto(String(data.id))}`)
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
  },
}
</script>