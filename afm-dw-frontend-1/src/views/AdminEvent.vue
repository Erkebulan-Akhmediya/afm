<template>
  <div v-if="$isAdminRules($userData.role, 'event')">
    <h2>{{ $t(`administration.${event_type_name}.name`) }}</h2>
    <div class="d-flex justify-end">
      <v-btn color="blue lighten-2" dark @click="dialog = true">
        <v-icon small class="mr-3"> mdi-plus </v-icon>
        {{ $t(`administration.${event_type_name}.add`) }}
      </v-btn>
    </div>
    <v-dialog v-model="dialog" width="800" @input="(v) => v || clearDialog()">
      <v-card>
        <v-card-title class="text-h5 blue lighten-2" dark>
          {{
            dialogData.title
              ? dialogData.title
              : $t(`administration.${event_type_name}.add`)
          }}
        </v-card-title>

        <v-form v-model="valid">
          <v-container>
            <div v-if="dialogData.id" class="mb-4">
               <b>Создал:</b> {{dialogData.create_user_name}} <br />
                <b v-if="dialogData.update_user_name">Отредактировал:</b> {{dialogData.update_user_name}} - {{dialogData.update_date}}<br />
            </div>
           
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="dialogData.title_rus"
                  :label="`Заголовок ${eventTypeParentCase} на Русском`"
                  required
                  outlined
                  :rules="textRules"
                ></v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="dialogData.title_kaz"
                  outlined
                  :label="`Заголовок ${eventTypeParentCase} на Казахском`"
                  required
                  :rules="textRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <label for="bodyrus"
                  >{{ $t(`administration.${event_type_name}.text`) }} на
                  Русском</label
                >
                <ckeditor
                  id="bodyrus"
                  :editor="editor"
                  v-model="dialogData.body_rus"
                  :config="{
                    toolbar: {
                      items: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        'blockQuote',
                      ],
                      shouldNotGroupWhenFull: true,
                    },
                  }"
                ></ckeditor>
              </v-col>
              <v-col cols="12">
                <label for="bodykaz"
                  >{{ $t(`administration.${event_type_name}.text`) }} на
                  Казахском</label
                >
                <ckeditor
                  id="bodykaz"
                  :editor="editor"
                  v-model="dialogData.body_kaz"
                  :config="{
                    toolbar: {
                      items: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        'blockQuote',
                      ],
                      shouldNotGroupWhenFull: true,
                    },
                  }"
                ></ckeditor>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select
                  required
                  outlined
                  v-model="dialogData.event_priority_type_id"
                  :items="priorityTypes"
                  label="Приоритет"
                  :rules="selectRules"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  required
                  v-model="dialogData.event_status_id"
                  outlined
                  :items="eventStatus"
                  label="Статус"
                  :rules="selectRules"
                ></v-select>
              </v-col>

              <v-col cols="6">
                <v-datetime-picker
                  id="event"
                  :timePickerProps="{ format: '24hr', scrollable: true }"
                  clearText="Очистить"
                  okText="Ок"
                  dateFormat="dd.MM.yyyy"
                  :label="$t(`administration.${event_type_name}.date`)"
                  required
                  v-model="dialogData.event_date"
                >
                  <template slot="dateIcon">
                    <span class="mr-4">Дата</span>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <template slot="timeIcon">
                    <span class="mr-4">Время</span>
                    <v-icon>mdi-clock</v-icon>
                  </template>
                </v-datetime-picker>
              </v-col>
              <v-col cols="6">
                <v-datetime-picker
                  id="pub"
                  :timePickerProps="{ format: '24hr', scrollable: true }"
                  clearText="Очистить"
                  okText="Ок"
                  dateFormat="dd.MM.yyyy"
                  :label="$t(`administration.publishDate`)"
                  required
                  v-model="dialogData.publish_date"
                >
                  <template slot="dateIcon">
                    <span class="mr-4">Дата</span>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <template slot="timeIcon">
                    <span class="mr-4">Время</span>
                    <v-icon>mdi-clock</v-icon>
                  </template>
                </v-datetime-picker>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :label="`Вес ${eventTypeParentCase}`"
                  :rules="dialogData.rules_order"
                  :value="dialogData.display_order"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
              <!-- пустышка для выравнивания -->
              <v-col cols="12"></v-col>
              <!--  -->
              <v-col cols="6">
                <h3 class="mb-2">
                  Основное изображение/видео {{ eventTypeParentCase }}
                </h3>

                <v-progress-linear
                  indeterminate
                  v-if="imageLoader"
                  color="primary"
                  class="mb-4 align-self-center"
                ></v-progress-linear>

                <img
                  class="mb-4"
                  v-if="
                    dialogData.image_link &&
                    checkFormat(dialogData.file_name) != 'MP4'
                  "
                  :src="dialogData.image_link"
                  alt=""
                />
                <div class="player-container mb-4" v-if="dialogData.image_link">
                  <video
                    v-if="
                      dialogData.image_link &&
                      checkFormat(dialogData.file_name) == 'MP4'
                    "
                    max-width="100%"
                    controls
                    controlsList="nodownload"
                    :poster="require('@/assets/img/video-file.jpg')"
                  >
                    <source :src="dialogData.image_link" type="video/mp4" />
                  </video>
                </div>
                <v-file-input
                  v-model="dialogData.mainFile"
                  color="blue accent-4"
                  counter
                  clearable
                  small-chips
                  accept="image/png, image/jpeg, video/mp4"
                  label="
                     Новое изображение/видео
                    "
                  placeholder="Выберите файл"
                  prepend-icon="mdi-paperclip"
                  outlined
                  :show-size="1000"
                >
                </v-file-input>
              </v-col>
              <v-col cols="6">
                <h3 class="mb-2">
                  Дополнительные изображения/видео {{ eventTypeParentCase }}
                </h3>
                <ul v-if="files && files.length > 1" class="mb-1">
                  <li v-for="item of files" :key="item.id">
                    <v-chip>{{ item.name }}</v-chip>
                  </li>
                </ul>

                <v-file-input
                  v-model="dialogData.files"
                  color="blue accent-4"
                  counter
                  multiple
                  clearable
                  small-chips
                  accept="image/png, image/jpeg, video/mp4"
                  label="
                     Новые изображения/видео
                    "
                  placeholder="Выберите файлы"
                  prepend-icon="mdi-paperclip"
                  outlined
                  :show-size="1000"
                >
                </v-file-input>
              </v-col>
            </v-row>
            <v-checkbox v-if="eventTypeParentCase == 'новости'"
              label="Международная новость"
              v-model="isGlobalNews"
              >
            </v-checkbox>
          </v-container>
        </v-form>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            text
            @click="sendDialog(dialogData.method, dialogData)"
            :disabled="isSending"
            :loading="isSending"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col class="mt-3"> </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          id="adminNewsTable"
          :headers.sync="headers"
          :items="newsTableData"
          :options.sync="options"
          :server-items-length="total"
          disable-sort
          @click:row="editNews"
          class="elevation-1 outsetWithoutBorder"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
        >
          <template v-slot:[`item.body`]="{ item }">
            <div style="padding: 10px 0">
              <div
                v-html="item.body_rus"
                style="height: 70px; overflow: auto"
              ></div>
            </div>
          </template>
          <template v-slot:[`item.eventType`]="{ item }">
            <span>{{
              item.event_type_id == 1 ? "Новость" : "Объявление"
            }}</span>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <span>{{
              item.event_status_id == 1 ? "Опубликовано" : "Не опубликовано"
            }}</span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div style="min-width: 105px">
              <v-btn icon class="ma-2" @click.stop="editNews(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                class="ma-2"
                color="red"
                @click.stop="showSureDialog(item)"
              >
                <v-icon>mdi-trash-can-outline</v-icon>
              </v-btn>
            </div>
          </template>
          <template v-slot:[`item.eventDate`]="{ item }">
            <span>{{
              moment(item.event_date).format("DD.MM.YYYY HH:mm")
            }}</span>
          </template>
          <template v-slot:[`item.publishDate`]="{ item }">
            <span>{{
              moment(item.publish_date).format("DD.MM.YYYY HH:mm")
            }}</span>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="sureDialog" max-width="290">
      <v-card>
        <v-card-title class="text-h5"> Подтверждение </v-card-title>

        <v-card-text>
          Вы действительно хотите удалить {{ eventTypeParentCase }} id
          {{ deleteNewsData.id }}?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="sureDialog = false">
            Отмена
          </v-btn>

          <v-btn
            color="red darken-1"
            text
            @click="deleteNews()"
            :disabled="isSending"
            :loading="isSending"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <DialogInformation
      :title="error.title"
      :body="error.body"
      :isShow="error.isShow"
      @hideDialog="error.isShow = !error.isShow"
    >
    </DialogInformation>

    <v-overlay :value="loader">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
  <div v-else><h2>Доступ запрещен</h2></div>
</template>
<script>
import moment from "moment";
import editor from "@ckeditor/ckeditor5-build-classic";

export default {
  data: function () {
    return {
      total: 0,
      options: {
        itemsPerPage: 5,
        page: 1
      },

      imageLoader: false,
      editor: editor,
      error: {
        title: "Ошибка",
        body: "",
        isShow: false,
      },
      isGlobalNews: false,
      loader: true,
      moment,
      sureDeleteNews: false,
      deleteNewsData: {},
      sureDialog: false,
      textRules: [
        (value) => {
          return Boolean(String(value)) || "Необходимо ввести текст";
        },
      ],
      selectRules: [(v) => Boolean(v) || "Надо выбрать один пункт"],
      dialogData: {
        id: "",
        title: "",
        title_rus: "",
        title_kaz: "",
        body_rus: "",
        body_kaz: "",
        event_priority_type_id: "",
        event_status_id: "",
        event_type_id: this.eventTypeId,
        event_date: new Date(),
        publish_date: new Date(),
        display_order: 1,
        image_link: "",
        title_file: null,
        file: [],
        fileVideo: [],
        file_name: "",
        rules_order: [
          (value) => Boolean(parseInt(value)) || "Должно быть число!",
        ],
        method: "post",
        mainFile: null,
      },
      dialog: false,
      valid: false,
      firstname: "",
      lastname: "",
      priorityTypes: [],
      eventTypes: [],
      eventStatus: [],
      newsParams: {
        offset: 0,
        limit: 5,
      },
      eventTypeLowerCase: this.eventType.toLowerCase(),
      newsTableData: [],
      event_type_name: "news",
      headers: [
        {
          text: "ID",
          align: "start",
          sortable: false,
          value: "id",
        },
        { text: this.$t("administration.title"), value: "title_rus" },
        { text: this.$t("administration.type"), value: "eventType" },
        {
          text: this.$t(
            `administration.${this.eventTypeId == 1 ? "news" : "events"}.text`
          ),
          value: "body",
        },
        { text: this.$t("administration.status"), value: "status" },
        {
          text: this.$t(
            `administration.${this.eventTypeId == 1 ? "news" : "events"}.date`
          ),
          value: "eventDate",
          align: "start",
          sortable: false,
        },
        {
          text: this.$t("administration.publishDate"),
          value: "publishDate",
          align: "start",
          sortable: false,
        },
        { text: this.$t("administration.actions"), value: "actions" },
      ],
      currentPage: 1,
      files: [],
      isSending: false,
    };
  },
  methods: {
    async getNews(event_type_id) {
      let news;
      try {
        news = await this.axios.get(`/api/1.0/lov/hr.event`, {params: {event_type_id, ...this.options}});

      } catch (error) {
        console.log('error')
        throw new Error(error);
      }
      this.total = Number.parseInt(news.headers.total)
      if (news.data) {
        return news.data;
      } else return [];
    },

    parseDataForSelect(data) {
      return data.reduce((acc, item) => {
        acc.push({
          text: item.name,
          value: item.id,
        });
        return acc;
      }, []);
    },
    async editNews(news) {
      this.imageLoader = true;
      this.dialogData.title = `Редактировать`;
      this.dialogData.id = news.id;
      this.dialogData.title_rus = news.title_rus;
      this.dialogData.title_kaz = news.title_kaz;
      this.dialogData.body_rus = news.body_rus;
      this.dialogData.body_kaz = news.body_kaz;
      this.dialogData.event_priority_type_id = news.event_priority_type_id;
      this.dialogData.event_status_id = news.event_status_id;
      this.dialogData.event_date = news.event_date
        ? moment(news.event_date).format("DD.MM.YYYY HH:mm")
        : "";
      this.dialogData.publish_date = news.publish_date
        ? moment(news.publish_date).format("DD.MM.YYYY HH:mm")
        : "";
      this.dialogData.display_order = news.display_order;
      this.dialogData.method = "put";
      this.dialogData.event_type_id = 1;
      this.dialogData.create_user_name = news.create_user_name
      this.dialogData.update_user_name = news.update_user_name
      this.dialogData.update_date = news.update_date
        ? moment(news.update_date + '+0000').format("DD.MM.YYYY HH:mm")
        : "";
      this.dialog = true;
      let files = await this.axios.get(`/api/1.0/event/files/${news.id}`);

      this.files = files.data;

       this.dialogData.image_link = await this.$getBackendMinioFile(news.id, 2);

      if (this.dialogData.image_link.status == 404) {
        this.dialogData.image_link = "";
      }

      let params = {
        obj_id: news.id,
        obj_type: 2,
      };
      let { data } = await this.axios.get(`/api/1.0/file/name/${news.id}`, {
        params,
      });
      this.dialogData.file_name = data.name ? data.name : "";

      this.imageLoader = false;

    },

    showSureDialog(news) {
      this.deleteNewsData = Object.assign({}, news);
      this.sureDialog = true;
    },

    async deleteNews() {
      this.deleteNewsData.event_status_id = 2;
      await this.sendDialog("put", this.deleteNewsData, true);
      let data = await this.getNews(this.eventTypeId);
      this.newsTableData = data;
      this.sureDialog = false;
      this.deleteNewsData = {};
    },
    clearDialog() {
      this.files = [];
      this.dialogData = {
        id: "",
        title: "",
        title_rus: "",
        title_kaz: "",
        body_rus: "",
        body_kaz: "",
        event_priority_type_id: "",
        event_status_id: "",
        event_date: new Date(),
        publish_date: new Date(),
        display_order: 1,
        event_type_id: 1,
        imageLink: "",
        title_file: null,
        files: null,
        rules_order: [
          (value) => Boolean(parseInt(value)) || "Должно быть число!",
        ],
        method: "post",
      };
    },
    async sendDialog(method, news, isDel = false) {
      this.isSending = true;
      let bindData = {
        title_rus: news.title_rus,
        title_kaz: news.title_kaz,
        body_rus: news.body_rus,
        body_kaz: news.body_kaz,
        display_order: news.display_order,
        event_date: isDel
          ? news.event_date
          : moment(news.event_date, "DD.MM.YYYY HH:mm").format(),
        event_priority_type_id: news.event_priority_type_id,
        event_status_id: news.event_status_id,
        event_type_id: this.eventTypeId,
        publish_date: isDel
          ? news.publish_date
          : moment(news.publish_date, "DD.MM.YYYY HH:mm").format(),
      };
      if (news.file?.length == undefined) {
        bindData.file = news.file;
      }

      if (this.checkDataForm(bindData).length) {
        this.error.isShow = true;
        this.isSending = false;
        this.error.body = this.checkDataForm(bindData).join("<br>");
        return;
      }

      let err = [];
      if (this.dialogData.files && this.dialogData.files.length > 5) {
        err.push("Максимальное количество файлов 5");
      }

      if (err.length) {
        this.isSending = false;
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 600,
          title: err.join("; <br>"),
        });
      }

      const form = new FormData();
      form.append("title_rus", bindData.title_rus);
      form.append("title_kaz", bindData.title_kaz);
      form.append("body_rus", bindData.body_rus);
      form.append("body_kaz", bindData.body_kaz);
      form.append("display_order", bindData.display_order);
      form.append("event_date", bindData.event_date);
      form.append("event_priority_type_id", bindData.event_priority_type_id);
      form.append("event_status_id", bindData.event_status_id);
      form.append("event_type_id", bindData.event_type_id);
      form.append("file_name", this.dialogData.file_name);
      if (isDel == false) {
        if (this.dialogData.mainFile) {
          if (this.dialogData.mainFile.size > 52428800) {
            this.isSending = false;
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 500,
              title:
                "Файл " +
                this.dialogData.mainFile.name +
                " превышает допустимый размер файла 50Мб",
            });
          } else {
            form.append("file", this.dialogData.mainFile);
          }
        }
        if (this.dialogData.files) {
          if (this.dialogData.files && this.dialogData.files.length != 0) {
            for (let file of this.dialogData.files) {
              if (file.size > 52428800) {
                return this.$swal({
                  ...this.$optionAlert.fire,
                  icon: "error",
                  width: 500,
                  title:
                    "Файл " +
                    file.name +
                    " превышает допустимый размер файла 50Мб",
                });
              } else {
                form.append("file", file);
              }
            }
          }
        }
      }

      form.append("publish_date", bindData.publish_date);
      form.append("file_type_id", 2);
      form.append("fileType", "event");
      form.append("is_global_news", this.isGlobalNews ? true : false);

      let localParams = {};
      let url = `/api/1.0/event`;
      if (method == "put") {
        localParams.id = news.id;
        url += `/:id`;
      }
      await this.axios[method](url, form, { localParams });
      this.dialog = false;
      this.isSending = false;
      this.$swal({
        ...this.$optionAlert.fire,
        icon: "success",
        title: !isDel ? "Сохранено" : "Удалено",
      });
      this.clearDialog();
      let dataNews = await this.getNews(this.eventTypeId);
      this.newsTableData = dataNews;
    },
    checkDataForm(obj) {
      let err = [];
      if (!String(obj.title_rus)) {
        err.push("Название на Русском языке обязательно!");
      }
      if (!String(obj.title_kaz)) {
        err.push("Название на Казахском языке обязательно!");
      }
      if (!String(obj.body_rus)) {
        err.push("Текст на Русском языке обязателен!");
      }
      if (!String(obj.body_kaz)) {
        err.push("Текст на Казахском языке обязателен!");
      }
      if (!parseInt(obj.display_order)) {
        err.push("Вес обязателен!");
      }
      if (!parseInt(obj.display_order)) {
        err.push("Вес обязателен!");
      }
      if (!parseInt(obj.event_priority_type_id)) {
        err.push("Приоритет обязателен!");
      }
      if (!parseInt(obj.event_status_id)) {
        err.push("Статус обязателен!");
      }
      if (!new Date(obj.event_date)) {
        err.push(`Дата ${this.eventTypeParentCase} обязательна!`);
      }
      if (!new Date(obj.publish_date)) {
        err.push("Дата публикации обязательна!");
      }

      return err;
    },
    checkFormat(str) {
      return str == null
        ? null
        : str.toUpperCase().substr(str.lastIndexOf(".") + 1);
    },
  },
  mounted() {
    this.event_type_name = this.eventTypeId == 1 ? "news" : "events";
    this.headers[5].text = this.$t(
      `administration.${this.event_type_name}.date`
    );
    this.headers[3].text = this.$t(
      `administration.${this.event_type_name}.text`
    );
    this.getNews(this.eventTypeId).then((data) => {
      this.newsTableData = data;
      this.loader = false;
    });
    Promise.all([
      this.axios.get("/api/1.0/lov/ref.event_priority_type").then((data) => {
        this.priorityTypes = this.parseDataForSelect(data.data);
      }),
      this.axios.get("/api/1.0/lov/ref.event_type").then((data) => {
        this.eventTypes = this.parseDataForSelect(data.data);
      }),
      this.axios.get("/api/1.0/lov/ref.event_status").then((data) => {
        this.eventStatus = this.parseDataForSelect(data.data);
      }),
    ])
      .catch((err) => {
        alert(err);
      })
      .then(() => {
        this.loader = false;
      });
  },
  watch: {
    options: {
      async handler() {
        let data = await this.getNews(this.eventTypeId);
        this.newsTableData = data;
      },
      deep: true
    },
    eventTypeId: async function (val) {
      this.options.page = 1;
      this.options.itemsPerPage = 5;
      this.newsTableData = await this.getNews(val);
      this.event_type_name = val == 1 ? "news" : "events";
      this.headers[5].text = this.$t(
        `administration.${this.event_type_name}.date`
      );
      this.headers[3].text = this.$t(
        `administration.${this.event_type_name}.text`
      );

    },
  },
  props: ["eventType", "eventTypeParentCase", "eventTypeId"],
};
</script><style scoped lang="scss">
.outsetWithoutBorder {
  .v-text-field--outlined fieldset {
    display: none;
  }
}

video {
  max-height: 300px;
}
</style>