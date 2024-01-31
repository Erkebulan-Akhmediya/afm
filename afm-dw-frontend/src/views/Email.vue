<template>
  <!--
    Ранее было вместо div
    <v-container fluid class="mt-2 d-flex justify-space-between">
    v-row с параметрами
    <v-row class="chat md-flex-wrap">
    выходила ошибка с перемещением на правую сторону
  -->
  <div>
    <v-row>
      <!-- Ранее было <v-col md="3"> -->
      <v-col cols="2" class="column">
        <email-categories @isMessageDetail="isMessageDetail(false)" />
      </v-col>
      <v-col cols="10" class="column">
        <email-content
          v-if="!isMessage"
          @isMessageDetail="isMessageDetail(true)"
        />
        <email-message
          v-if="isMessage"
          @isMessageDetail="isMessageDetail(false)"
        />
      </v-col>
    </v-row>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import EmailCategories from "../components/email/EmailCategories.vue";
import EmailContent from "../components/email/EmailContent.vue";
import EmailMessage from "../components/email/EmailMessage.vue";
import checkRoles from "@/utils/check_role";

export default {
  data: () => ({
    isMessage: false,
  }),
  components: {
    EmailCategories,
    EmailContent,
    EmailMessage,
  },

  computed: {
    ...mapGetters([]),
    guard: function () {
      return checkRoles("31", this.$userData);
    },
  },
  methods: {
    ...mapActions(["GET_EMAILS_FROM_API", "GET_EMAILBOXES_FROM_API"]),
    ...mapMutations([]),
    isMessageDetail(bool) {
      this.isMessage = bool;
    },
    async checkAccount() {
      let params = {
        email_user_id: this.$userData.id,
      };
      let { data } = await this.axios.get(`/api/1.0/email/account`, { params });
      if (!data) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 700,
          title:
            "У Вас не настроен почтовый аккаунт! Обратитесь к администратору.",
        });
      }
    },
  },
  created() {
    this.GET_EMAILBOXES_FROM_API();

    this.checkAccount();
  },
  watch: {
    "$store.state.email.mailError": function () {
      let errorMessage
      if (this.$store.state.email.mailError.data.ERR_MSG) {
        errorMessage = this.$store.state.email.mailError.data.ERR_MSG
      } else {

                if (this.$store.state.email.mailError.data.includes('LIMIT_FILE_SIZE')) {
          errorMessage = 'Допустимый размер 1 файла - не более 50 Мб'
        } else {
          errorMessage = this.$store.state.email.mailError.data
        }
      }

      this.$swal({
        ...this.$optionAlert.fire,
        icon: "error",
        timer: 5000,
        width: 600,
        title: errorMessage,
      });
    },
  },
  sockets: {},
};
</script><style lang="scss" scoped>
.column{
  padding-left: 8px!important;
  padding-right: 8px!important;
  width: 800px;
}
span {
  background-color: rgba(255, 0, 0, 0.4);
  border-radius: 50%;
  padding: 0 5px;
}
</style>