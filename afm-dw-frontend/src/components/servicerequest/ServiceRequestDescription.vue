<template>
  <v-row justify="center">
    <v-dialog persistent v-model="dialog" max-width="700px">
      <v-card>
        <v-card-title>
          <span color="black" class="text-h5">
            {{
              servicerequest_data.dialogTitle
            }}</span
          >
        </v-card-title>
        <br>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="servicerequest_data.description"
                filled
                auto-grow
                label="Примечание"
                rows="3"
                row-height="20"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <hr align="center" width="100%" size="1" color="grey" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
          :disabled="IS_SENDING_SERVICEREQUEST" color="red darken-1" text @click="closeDialog()">
            Отмена
          </v-btn>
          <v-btn
          :disabled="IS_SENDING_SERVICEREQUEST" :loading="IS_SENDING_SERVICEREQUEST"
            color="blue darken-1"
            text
            @click="sendForm"
          >
            Обновить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
  props: ["dialog", "dialogData"],
  data() {
    return {
      servicerequest_data: {
        id: null,
        sr_status_id: null,
        description: "",
        dialogTitle: "",
      }
    };
  },
  computed: {
    ...mapGetters(["IS_SENDING_SERVICEREQUEST"])
  },
  methods: {
    ...mapActions(["CHANGE_SERVICEREQUEST_STATUS_API"]),

        async sendForm() {
      const err = [];
      if (this.servicerequest_data.description.trim() == "" && this.servicerequest_data.sr_status_id != 6) {
        err.push("Примечание обязательно для заполнения");
      }

      if (err.length) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 500,
          title: err.join("; <br>"),
        });
      }

      await this.CHANGE_SERVICEREQUEST_STATUS_API({
        id: this.servicerequest_data.id,
        sr_status_id: this.servicerequest_data.sr_status_id,
        description: this.servicerequest_data.description
      });
      this.closeDialog();
    },

    closeDialog() {
      this.$emit("closeDescriptionDialog");

      this.servicerequest_data.id = null;
      this.servicerequest_data.sr_status_id = null;
      this.servicerequest_data.description = ""; 
      this.servicerequest_data.dialogTitle = ""; 
    },
  },
  created() {
  },
  watch: {
    dialog() {
      if (this.dialog) {
        if (this.dialogData) {
          this.servicerequest_data = JSON.parse(JSON.stringify(this.dialogData))
        }
      }
    },
  },
};
</script><style scoped>
.v-card__title {
  color: rgb(24, 20, 20);
}
label {
  color: black;
  font-size: 16px;
}
</style>