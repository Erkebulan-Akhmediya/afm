<template>
     <v-row justify="center">
      <v-dialog v-model="vote_dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5"
              >Голосования по предложению №{{ appeal_data.id }}
              {{ appeal_data.title }}</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <!-- <p>{{ vote }}</p> -->
                  <v-select
                    :items="[
                      { name: 'За', value: true },
                      { name: ' Против', value: false },
                    ]"
                    label="Голос*"
                    required
                    item-text="name"
                    v-model="vote"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Причина*"
                    v-model="vote_description"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
           
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="closeVoteDialog()">
              Отмена
            </v-btn>
            <v-btn :disabled="vote_description=='' || !vote" color="green" text @click="sendVote()"> Отправить </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  components: {

     },
props: ['appeal_data', 'vote_dialog'],
  data() {
    return {

      vote: null,
      vote_description: "",

          };
  },
computed: {
    ...mapGetters(["APPEAL_VOTES"]),


     },
methods: {
    ...mapActions([
      "GET_APPEAL_VOTES_FROM_API",
      "GET_APPEALS_FROM_API",
    ]),
    async sendVote() {
      await this.axios.post(
        `/api/1.0/appeal/${this.appeal_data.id}/votes`,
        { vote: this.vote.value, description: this.vote_description }
      );
      this.closeVoteDialog();
    },
    closeVoteDialog() {
        this.vote = null;
        this.vote_description = "";
        this.$emit('closeDialog')
    }
    }
}
</script>