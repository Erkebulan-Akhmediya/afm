<template>
     <v-row justify="center">
      <v-dialog v-model="completeDialog" persistent max-width="800px">
        <v-card>
          <v-card-title>
            <span class="text-h5"
              >Присвоить предложению №{{ appeal_data.id }}
              {{ appeal_data.title }} статус {{' - '}}
              </span
            >
           
            <v-chip
            class="ml-2"
            small
            :color="appeal_status_id > 0 ? 'green' : 'red'"
            text-color="white"
            v-text="
             appeal_status_id == -3 ? 'НЕ ИСПОЛНЕНО' : 'ИСПОЛНЕНО'
            "
          >
            
          </v-chip>
          </v-card-title>
          
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" class="px-0">
<v-col cols="4" class="pb-0">
                     <v-file-input 
              :change="fileUpload()"
              :label="$t('globalWords.addFile')"
              dense
              outlined
               
              v-model="file"
            >
            </v-file-input>
                </v-col>
                <v-col cols="12" class="pt-0">
                   
                  <v-data-table
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
                  v-if="
                    item.create_user == $userData.fullData.username 
                  "
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </template>
            </v-data-table>
                </v-col>
                </v-col>
                
              </v-row>
            </v-container>
           
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="closeDialog()">
              Отмена
            </v-btn>
            <v-btn  color="green" text @click="sendAppeal()"> Сохранить </v-btn>
            <!-- :disabled="file_added_counter==0" -->
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
</template>
<script>
import {  mapActions, mapGetters } from "vuex";
export default {
  components: {

     },
props: ['appeal_data', 'appeal_status_id', 'completeDialog'],
  data() {
    return {
        file: null,
      fileHeaders: [
        { text: "№", value: "id" },
        { text: this.$t("globalWords.name"), value: "name" },
        { text: this.$t("globalWords.creator"), value: "create_user_name" },
        { text: this.$t("passRequest.addingDate"), value: "create_date" },
        { text: "", value: "action" },
      ],

            dialogData: {},

          file_added_counter: 0
    };
  },
computed: {
    ...mapGetters(["APPEAL_STATUS_LIST"]),

     },
methods: {
    ...mapActions([

            "GET_APPEALS_FROM_API",
      "CHANGE_APPEAL_STATUS_API"
    ]),
    async getAppeal() {
      let { data } = await this.axios.get("/api/1.0/appeal/public");
      this.appeals = data;
    },

       closeDialog() {
       this.file_added_counter = 0
        this.$emit('closeDialog')
    },

       fileUpload: async function () {
      if (this.file) {
        const form = new FormData();
        form.append("lang", this.$i18n.locale);
        form.append("user_id", this.$userData.fullData.username);
        form.append("file", this.file);
        form.append("fileType", "appeal");
        form.append("file_type_id", 12);
        form.append("pr_id", this.appeal_data.id);

        await this.axios.post(`/api/1.0/pass-request-file/`, form);
        this.file = null;

               this.file_added_counter += 1

         this.$emit('updateAppeal')
      }
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
         this.$emit('updateAppeal');

         this.file_added_counter -= 1
      } catch (err) {
        console.error(err);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: this.$t("globalWords.deletingError"),
        });
      }
    },
    sendAppeal() {
        const err = [];
      if (this.file_added_counter==0) {
        err.push("Файл(протокол, другие материалы) обязателен");
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

      this.CHANGE_APPEAL_STATUS_API({id: this.appeal_data.id, appeal_status_id: this.appeal_status_id})
      this.closeDialog()
    }
    }
}
</script>