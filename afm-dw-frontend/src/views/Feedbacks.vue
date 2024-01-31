<template>
  <v-container v-if="$isAdminRules($userData.role, 'feedbacks')">
    <v-row justify="center" class="px-10 flex-column">
      <v-col cols="12" md="10">
        <v-expansion-panels popout>
          <h2>
            Не обработанные
            <v-btn
              class="mx-2"
              icon
              small
              color="primary"
              @click="getFeedbacks()"
            >
              <v-icon dark> mdi-reload </v-icon>
            </v-btn>
          </h2>
          <v-expansion-panel v-for="(item, i) in pagedNotComplete" :key="i">
            <v-expansion-panel-header
              :color="item.is_processed == false ? '' : 'light-green lighten-3'"
            >
              <v-row no-gutters style="width: 100%">
                <v-col cols="2"> #{{ item.id }} </v-col>
                <v-col cols="8">
                  {{ item.address }}
                </v-col>
                <v-col cols="2">
                  {{
                    moment(new Date(item.update_date + "+0000")).format(
                      "DD.MM.YYYY HH:mm"
                    )
                  }}
                </v-col>
              </v-row>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <div>
                <p v-html="item.text.replace(/\n/g, '<br>')"></p>
              </div>

              <div>
                <v-btn
                  class="mt-3"
                  outlined
                  color="green"
                  :disabled="item.is_processed"
                  @click="confirmDialog(item)"
                  >Обработана</v-btn
                >
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-pagination
          v-if="pagedNotComplete.length!=0"
            v-model="notCompletePaging.page"
            class="my-4"
            :total-visible="7"
            :length="
              Math.ceil(feedbacksNotComplete.length / notCompletePaging.limit)
            "
          ></v-pagination>
        </v-expansion-panels>
        <v-expansion-panels popout class="mt-8">
          <h2>Обработанные</h2>
          <v-expansion-panel v-for="(item, i) in pagedComplete" :key="i">
            <v-expansion-panel-header
              :color="item.is_processed == false ? '' : 'light-green lighten-3'"
            >
              <v-row no-gutters style="width: 100%">
                <v-col cols="2"> #{{ item.id }} </v-col>
                <v-col cols="8">
                  {{ item.address }}
                </v-col>
                <v-col cols="2">
                  {{
                    moment(new Date(item.update_date + "+0000")).format(
                      "DD.MM.YYYY HH:mm"
                    )
                  }}
                </v-col>
              </v-row></v-expansion-panel-header
            >

            <v-expansion-panel-content>
              <div class="mt-2">
                <p v-html="item.text.replace(/\n/g, '<br>')"></p>
              </div>
              <v-textarea
                outlined
                disabled
                auto-grow
                rows="1"
                name="Вуыскшзешщт"
                label="Примечание"
                :value="item.description"
              ></v-textarea>

              <div>
                <v-btn
                  class="mt-3"
                  outlined
                  color="green"
                  :disabled="item.is_processed"
                  @click="confirmDialog(item)"
                  >Обработана</v-btn
                >
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-pagination
            v-model="completePaging.page"
            class="my-4"
            :limit="completePaging.limit"
            :total-visible="7"
            :length="Math.ceil(feedbacksComplete.length / completePaging.limit)"
          ></v-pagination>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <!-- подтверждение выполнения -->
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="500">
        <v-card>
          <v-card-title class="text-h5">
            Вы уверены что обработали заявку
            <span class="ml-1">#{{ currentFeedback.id }}</span> ?
          </v-card-title>
          <v-card-text v-html="currentFeedback.text"></v-card-text>
          <v-col cols="12" sm="12">
            <v-textarea
              filled
              auto-grow
              label="Примечание"
              rows="2"
              row-height="20"
              v-model="description"
            ></v-textarea>
          </v-col>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red darken-1"
              text
              @click="
                dialog = false;
                description = '';
              "
            >
              Отмена
            </v-btn>
            <v-btn color="green darken-1" text @click="worked()"> Да </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import moment from "moment";

export default {
  data: () => ({
    moment,
    feedbacks: [],
    dialog: false,
    currentFeedback: {},
    description: "",
    completePaging: {
      page: 1,
      limit: 10,
    },
    notCompletePaging: {
      page: 1,
      limit: 10,
    },
  }),
  components: {},

  computed: {
    ...mapGetters([]),
    feedbacksComplete: function () {
      let feedbacks = this.feedbacks.filter((el) => el.is_processed == true);
      feedbacks = feedbacks.reverse();

      return feedbacks;
    },
    feedbacksNotComplete: function () {
      return this.feedbacks.filter((el) => el.is_processed == false);
    },
    pagedComplete() {
      return this.feedbacksComplete.slice(
        (this.completePaging.page - 1) * this.completePaging.limit,
        this.completePaging.page * this.completePaging.limit
      );
    },
    pagedNotComplete() {
      return this.feedbacksNotComplete.slice(
        (this.notCompletePaging.page - 1) * this.notCompletePaging.limit,
        this.notCompletePaging.page * this.notCompletePaging.limit
      );
    },
  },
  methods: {
    ...mapActions([]),
    ...mapMutations([]),
    confirmDialog(item) {
      this.dialog = true;
      this.currentFeedback = item;
    },
    async getFeedbacks() {
      let feedbacks = await this.axios.get(`/api/1.0/feedback`);

      this.feedbacks = feedbacks.data;
    },
    async worked() {
      let payload = {
        id: this.currentFeedback.id,
        is_processed: true,
        description: this.description,
      };
      await this.axios.put(
        `/api/1.0/feedback/` + this.currentFeedback.id,
        payload
      );
      this.dialog = false;
      this.description = "";
      this.getFeedbacks();
    },
  },
  created() {
    this.getFeedbacks();
  },
  sockets: {},
};
</script><style lang="scss" scoped>
.v-card__title {
  color: rgb(24, 20, 20);
}
</style>