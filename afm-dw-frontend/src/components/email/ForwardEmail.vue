<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="1200px">
      <template v-slot:activator="{ on, attrs }">
        <v-list-item v-bind="attrs" v-on="on">
          <v-btn class="mx-3" icon>
            <v-icon>mdi-share</v-icon>
          </v-btn>
          <v-list-item-title  class="mt-2" >Переслать</v-list-item-title>
        </v-list-item>
      </template>
      <v-card>
        <v-card-title>
          <span color="black" class="text-h5">Пересылаемое сообщение</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-combobox
                  v-model="emailSendAddressList"
                  :items="personalEmailList"
                  :search-input.sync="emailAddressSearch"
                  chips
                  hide-selected
                  clearable
                  label="Кому*"
                  multiple
                  :menu-props="{ closeOnContentClick: true, maxHeight: 200 }"
                >
                  <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip
                      v-bind="attrs"
                      :input-value="selected"
                      close
                      @click="select"
                      @click:close="remove(item)"
                    >
                      <!--:color="getColor(item)"-->
                      <strong>{{ item }}</strong>&nbsp;
                    </v-chip>
                  </template>
                  <template v-slot:no-data>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          Нет данных по "<strong>{{ emailAddressSearch }}</strong>". Для добавления нажмите <kbd>enter</kbd>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-combobox>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="subject"
                  label="Тема*"
                  required
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <label for="emailtext"> Текст</label>
                <ckeditor
                  id="emailtext"
                  :editor="editor"
                  v-model="textAsHtml"
                  :config="{
                    toolbar: {
                      items: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'bulletedList',
                        'numberedList',
                        'blockQuote',
                        '|',
                        'undo',
                        'redo',
                      ],
                      shouldNotGroupWhenFull: true,
                    },
                  }"
                ></ckeditor>
              </v-col>
              <v-col cols="8"
                ><v-file-input
                  label="Выберите файл"
                  v-model="files"
                  counter
                  multiple
                  show-size
                  :clearable="false"
                  small-chips
                  truncate-length="20"
                  @change="fileAdded"
                >
                  <!--05122022 Убрал clearable как то не корректно работает с removeFile-->
                  <template v-slot:selection="{ index, text }">
                    <v-chip
                      small
                      close
                      @click:close="removeFile(index)"
                    >
                      <strong>{{ text }}</strong>&nbsp;
                    </v-chip>
                  </template>
                </v-file-input>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <hr align="center" width="100%" size="2" color="grey" />
        <v-card-actions >
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeDialog()"> Отмена </v-btn>
          <v-btn
            color="blue darken-1"
            :loading="isSendingEmail"
            text
            @click="sendEmail"
          >
            Отправить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
  import { mapActions, mapGetters } from "vuex";
  import editor from "@ckeditor/ckeditor5-build-classic";
  import moment from "moment";

  export default {
    data() {
      return {
        isSendingEmail: false,
        editor: editor,
        subject: "",
        textAsHtml: "",
        valid: false,
        dialog: false,
        files: [],
        previousFiles: [],
        emailAddressSearch: null,
        emailSendAddressList: [],
        personalEmailList: [],
      };
    },
    methods: {
      ...mapActions(["SET_ERROR_ACTION"]),

      async sendEmail() {
        for (let file of this.files) {
          if (file.size > 52428800) {
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 500,
              title: "Файл "+file.name+' превышает допустимый размер файла 50Мб',
            });
            return
          }
        }

        if (this.emailSendAddressList.length == 0) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 500,
            title: "Заполните Кому*",
          });
          return
        }

        if (this.subject == '') {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 500,
            title: "Заполните Тему*",
          });
          return
        }

        if (this.files.length > 10) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 500,
            title: "Допустимое количество файлов - не более 10",
          });
          return
        }

        const form = new FormData();
        form.append("subject", this.subject);
        form.append("to", JSON.stringify(this.emailSendAddressList));
        form.append("text", this.textAsHtml.replace(/<\/?[^>]+(>|$)/g, ""))
        form.append("textAsHtml", this.textAsHtml);

        for (let file of this.files) {
          form.append("file", file);
        }

                try {
          this.isSendingEmail = true
          let data = await this.axios.post("/api/1.0/email", form);

          if(data.data.status == 'Sended!') {
            this.isSendingEmail = false

            this.clearData()
            this.closeDialog()
          } else {
            this.isSendingEmail = false
            this.SET_ERROR_ACTION('Обратитесь к администратору системы, не получен статус Sended');
          }
        } catch(err) {
          this.isSendingEmail = false
          this.SET_ERROR_ACTION(err);
        }
      },
      async getPersonalEmailList() {
        this.personalEmailList = []
        let personalAddressList = await this.axios.get("/api/1.0/email/personal_address_list", {params:{}});
        if (personalAddressList.data.length > 0) {
          this.personalEmailList = personalAddressList.data.reduce((acc, item) => {
            acc.push(item.address)
            return acc
          }, [])
        }
      },
      clearData() {
        this.personalEmailList = []
        this.emailSendAddressList = []

        this.subject= "";
        this.textAsHtml= "";
        this.files = []
      },
      closeDialog() {
        this.dialog = false;
      },
      remove (item) {
        this.emailSendAddressList.splice(this.emailSendAddressList.indexOf(item), 1)
      },
      removeFile (index) {
        this.files.splice(index, 1)
      },
      fileAdded () {
        if (this.previousFiles.length > 0) {
          this.files.push(...this.previousFiles)
        }
      },
      dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);

                    while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }

                return new File([u8arr], filename, {type:mime});
      }
    },
    computed: {
      ...mapGetters(["MESSAGE"]),
    },
    watch: {
      async dialog() {
        this.clearData()
        this.getPersonalEmailList()

                let objectFile, fileSource
        for (let file of this.MESSAGE.files) {
          fileSource = await this.$getBackendMinioFile(file.object_id, 9);
          objectFile = this.dataURLtoFile(fileSource, file.name);
          this.files.push(objectFile)
        }

        this.subject = "Fwd:  " + this.MESSAGE.subject;
        this.textAsHtml =
          "<br><p>-------- ​Forwarded message --------</p>"+
          "<p><strong>From:</strong> "+this.MESSAGE.from_email_address+
          "<br><strong>Sent:</strong> "+moment(new Date(this.MESSAGE.date + "+0000")).format("DD.MM.YY HH:mm")+
          "<br><strong>Subject:</strong> "+this.MESSAGE.subject+"</p>"+
          "<p><span>"+this.MESSAGE.text+"</span></p>"
      },
      files (val) {
        this.previousFiles = val
      }
    }
  };
</script><style scoped>
  .v-card__title {
    color: rgb(24, 20, 20);
  }
</style>