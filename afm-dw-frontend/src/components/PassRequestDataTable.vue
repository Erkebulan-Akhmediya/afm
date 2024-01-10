<template>
  <div class="request-data-table pass-request-form">
    <div class="pa-2 pt-0 mt-0 pb-0">
      <IdNumberFindRequest 
        :tab="tab"
        @newPassRequest="newPassRequest" 
        @findRequest="findRequest2" 
        @clearFindRequest="clearFindRequest"
        >
      </IdNumberFindRequest>
    </div>
    <v-data-table
      :headers="headersRequest"
      :items="request"
      style="margin-top: 2rem"
      dense
      :options.sync="pagination_options"
      :server-items-length="totalLength"
      class="elevation-1"
      disable-sort
      :loading="loader"
      @click:row="goToPassRequestCard"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
    >
      <template v-slot:[`item.is_resident_rk`]="{ item }">
        <span>
          {{ item.is_resident_rk? $t('globalWords.yes'): $t('globalWords.no') }}
        </span>
      </template>
      <template v-slot:[`item.visitors`]="{ item }">
        <div 
          style="width:100%;"
          >
          <v-textarea 
            style="width:100%;"
            rows="1"
            disabled :value="getNameListFormat(item.visitors)"
            >
          </v-textarea>
        </div>
      </template>
      <template v-slot:[`item.pass_exit_date`]="{ item }">
        <td v-if="item.pass_exit_date">
          <span style="color:red;" v-if="checkDiffTime(item) && item.exit_date == null">{{ $convertDate(item.pass_exit_date) }}</span>
          <span v-else>{{ $convertDate(item.pass_exit_date) }}</span>
        </td>
      </template>
      <template v-slot:[`item.date_from`]="{ item }">
        <td>{{ item.date_from?$convertDate(item.date_from):'' }}</td>
      </template>
      <template v-slot:[`item.date_to`]="{ item }">
        <td>{{ item.date_to?$convertDate(item.date_to):'' }}</td>
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <td>
          <v-chip
            class="ma-2"
            :color="getChipsColor(item)"
            text-color="white"
          >
            {{ tab==='admin'?calculate_status(item):item.status }}
          </v-chip>
        </td>
      </template>
      <template v-slot:[`item.entry_date`]="{ item }">
        <td v-if="item.entry_date">{{ $convertDate(item.entry_date) }}</td>
      </template>
      <template v-slot:[`item.exit_date`]="{ item }">
        <td v-if="item.exit_date">{{ $convertDate(item.exit_date) }}</td>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <td style="display: flex;" v-if="item.pr_status_id !== 4">
          <v-btn
            :disabled="disableDoubleClick"
            color="success"
            elevation="2"
            style="font-size: 10px;"
            value="item"
            @click.stop="nextStatus(item)"
            v-if="tab === 'security'"
            >
            <span v-if="item.prv_status_id === 0 || item.prv_status_id === 3">{{ $t('passRequest.acceptEntry') }}</span>
            <span v-if="item.prv_status_id === 1 || item.prv_status_id === 2">{{ $t('passRequest.acceptExit') }}</span>
          </v-btn>
          <v-btn
            :disabled="disableDoubleClick"
            color="success"
            elevation="2"
            style="font-size: 10px;"
            value="item"
            class="ml-1"
            @click.stop="checkExited(item)"
            v-if="tab==='creator' && item.last_visit_status === $t('passRequest.inBuildingTitle') && $userData.id == item.create_user_id"
            >
            <!-- Важное место, нужно проверять соответсвие текста в переводе и то что возвращает бэк -->
            <span>{{ $t('passRequest.meetingEnded') }}</span>
          </v-btn>
          <v-btn
            :disabled="disableDoubleClick"
            color="success"
            elevation="2"
            style="font-size: 10px;"
            value="item"
            class="ml-1"
            @click.stop="showHistory(item)"
            v-if="tab==='creator'"
            >
            <span>{{ $t('passRequest.visitHistory') }}</span>
          </v-btn>
          <v-btn
            :disabled="disableDoubleClick"
            color="success"
            elevation="2"
            style="font-size: 10px;"
            value="item"
            class="ml-1"
            @click.stop="newPassRequestWithVisitor(item)"
            v-if="tab==='creator'"
            >
            <span>{{ $t('passRequest.createPassRequest') }}</span>
          </v-btn>
        </td>
      </template>
    </v-data-table>
  </div>
</template>
<script>
import moment from 'moment'
import checkRoles from '@/utils/check_role'
import IdNumberFindRequest from '../components/IdNumberFindRequest.vue'

export default {
  components: {
    IdNumberFindRequest
  },
  data: function() {
    return {
      moment,
    };
  },
  computed: {
    pagination_options: {
      get() {
        return this.$store.state.pass_request.pagination_options
      },
      set(sc) {
        this.$store.commit('setPaginationOptions', sc)
      }
    },
  },
  watch: {
    pagination_options: {
      handler () {
        this.$emit('openAnotherPage')
      },
      deep: true,
    },
  },
  methods: {
    calculate_status (item) {
      if (item.pr_status_id === 2)
      {
        if (item.accept_list && item.accept_list.length === 0)
        {
         return item.status
        }

        for (let i of item.accept_list) 
        {
          if (i.request_status_id === 2)
          {
            return this.$t('passRequest.toBeAgreed')
          }
          if (i.request_status_id === 4)
          {
            return this.$t('passRequest.denied')
          }
        }
      }
      return item.status
    },
    checkDiffTime(data) {
      let m = moment(Date.now())
      let p = data.pass_exit_date

      return m.diff(p, 'minutes') >= 15
    },
    isAdmin () {
      return checkRoles('18', this.$userData) || checkRoles('17', this.$userData) 
    },
    isRole16 () {
      return checkRoles('16', this.$userData)
    },
    getNameListFormat(visitors) {
      if(!visitors) return
      let str = ""
      for (let i of visitors) {
        str += i.last_name
        str += " "
        if (i.first_name)
        {
          str += i.first_name[0]
          str += "."
        }
        if (i.middle_name)
        {
          str += i.middle_name[0]
          str += "."
        }
        str += " "
      }
      return str
    },
    newPassRequestWithVisitor(item) {
      this.$emit('newPassRequestWithVisitor', item)
    },
    newPassRequest() {
      this.$emit('newPassRequest')
    },
    nextStatus(item) {
      this.$emit('nextStatus', item)
    },
    showHistory(item) {
      this.$emit('showHistory', item)
    },
    findRequest2(data) {
      this.$emit("findRequest", {...data})
    }, 
    goToPassRequestCard(data) {
      this.$emit("goToPassRequestCard", data)
    },
    checkExited(data) {
      this.$emit("commitExiting", data)
    },
    clearFindRequest() {
      this.$emit("clearFindRequest")
    },
    getChipsColor(item) {
      let cs = this.calculate_status(item)
      if (cs === this.$t('passRequest.toBeAgreed')) {
        return "primary";
      }
      if (cs === this.$t('passRequest.denied'))
      {
        return "red";
      }


      let data = item.pr_status_id?item.pr_status_id:item.prv_status_id

      switch (data) {
        case 1:
          return "primary";
        case 2:
          return "green";
        case 3:
          return "red";
        default:
          break;
      }
    },
  },
  props: ["request", "headersRequest", "loader", "tab", "totalLength", "disableDoubleClick"],
};
</script>