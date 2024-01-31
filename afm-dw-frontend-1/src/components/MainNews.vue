<template>
  <div class="mainEventsNews">
    <div style="padding-left: 10px; padding-right: 10px">
      <v-row style="border-bottom: 2px solid #ebeff2; margin-bottom: 10px">
        <v-col cols="12" class="d-flex align-center ma-0 pa-0 pt-3 pb-1">
          <span style="font-weight: bold; font-size: 1rem">{{
            $t("mainPage.newsBlock.news")
          }}</span>
        </v-col>
        <!-- <v-col cols="2" class="d-flex justify-end">
            <div style="display: flex; align-items: center;">
                <span style="font-size: 12px;">{{$t('globalWords.show')}}:</span> <Select
                :options="[this.$t('globalWords.thisWeek'), this.$t('globalWords.all')]"
                :default="this.$t('globalWords.all')"
                class="select"
                />
            </div>                
        </v-col> -->
      </v-row>
    </div>
    <v-row
      v-for="news in allNews"
      :key="news.id"
      class="oneNews"
      @click="showOneNews(news)"
    >
      <!-- <v-skeleton-loader
          style="width: 6rem; max-height: 4rem;margin: auto 1rem;"
          v-show="news.src ? false : true"
          type="image"
        ></v-skeleton-loader> -->

      <v-col cols="3" class="ma-0 pa-3">
        <img
          v-if="checkFormat(news.file_name) !== 'MP4'"
          :src="news.src ? news.src : require('@/assets/img/default_news.jpg')"
          alt=""
          style="
            width: 100px;
            max-height: 56px;
            object-fit: cover;
            margin: auto auto;
            border-radius: 5px;
          "
        />
        <img
          v-if="checkFormat(news.file_name) == 'MP4'"
          :src="require('@/assets/img/video-file.jpg')"
          alt=""
          style="
            width: 100px;
            max-height: 56px;
            object-fit: contain;
            margin: auto auto;
            border-radius: 5px;
          "
        />
        <!--v-show="news.src ? true : false" -->
      </v-col>
      <v-col cols="7" class="ma-0 pa-0 d-flex align-center">
        <v-col cols="12" class="ma-0 pa-0">
          <span style="font-weight: 600; font-size: 15px; color: #252c32">{{
            news.event_title
          }}</span>
          <br />
          <v-chip v-if="news.is_global_news" outlined color="purple" small><span>Международные</span></v-chip>
          <br v-if="news.is_global_news" />
          <span style="font-size: 12px">{{ checkDate(news.event_date) }}</span>
        </v-col>
      </v-col>
      <v-col cols="2" class="d-flex align-end" style="font-size: 12px">
        <v-icon class="mb-1" size="14"> mdi-message </v-icon>
        <div class="ml-1 mr-2" style="margin-top: 2px">
          {{ news.discussion_count }}
        </div>
        <v-icon class="mb-1" size="14"> mdi-eye </v-icon>
        <div class="ml-1" style="margin-top: 2px">{{ news.views_count }}</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          width="100%"
          text
          color="primary"
          @click="$emit('getMoreNews')"
          v-if="newsParams && newsParams.isVisibleMoreBtn"
          >Показать еще</v-btn
        >
      </v-col>
    </v-row>

    <v-dialog
      v-if="dialogData"
      v-model="dialog"
      class="dialogOneNews"
      width="800"
    >
      <v-card class="dialogOneNews">
        <v-card-text style="padding: 30px; padding-right: 5px">
          <slot>
            <div class="dialog-wrapper" :style="'overflow-y: scroll;'">
              <div
                class="mb-6"
                style="
                  color: #333;
                  font-weight: bold;
                  font-size: 2em;
                  line-height: 1em;
                "
              >
                {{ dialogData.event_title }}
              </div>
              <span style="margin-bottom: 0.5rem; display: inline-block"
                >Дата:
                {{
                  moment(dialogData.event_date).format("DD MMMM YYYY, HH:mm")
                }}</span
              >

              <!-- <div v-show="this.imageLoader" class="loading-container">
                <v-skeleton-loader
                  class="mx-auto mb-4"
                  max-width="100%"
                  max-height="300px"
                  type="image"
                >
                </v-skeleton-loader>
                <v-progress-circular
                  v-show="checkFormat(dialogData.file_name) == 'MP4'"
                  indeterminate
                  class="loading-circular"
                ></v-progress-circular>
              </div> -->
              <!-- <div v-show="!this.imageLoader">
                <img
                  v-if="
                    dialogData.files.length < 2 &&
                    checkFormat(dialogData.files[0].name) != 'MP4'
                  "
                  :src="dialogData.files[0].src ? dialogData.files[0].src : ''"
                  alt=""
                  style="
                    width: 100%;
                    max-height: 400px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    overflow: auto;
                  "
                />
                <div
                  class="player-container"
                  v-if="checkFormat(dialogData.files[0].name) == 'MP4'"
                >
                  <video width="100%" controls>
                    <source :src="dialogData.files[0].src" type="video/mp4" />
                  </video>
                </div> -->
              <!-- </div> -->
              <v-skeleton-loader
                  v-if="this.isLoadingFile"
                  class="mx-auto mb-4"
                  max-width="100%"
                  height="400px"
                  type="image"
                >
                </v-skeleton-loader>
              <div>
                <v-window
                  v-if="!this.isLoadingFile && this.dialogData.files"
                  :show-arrows="this.dialogData.files.length > 1"
                  hide-delimiters
                  dark
                >
                  <v-window-item
                    v-for="item in dialogData.files"
                    :key="item.id"
                    
                    contain
                  >
                    <img
                      v-if="checkFormat(item.name) != 'MP4'"
                      :src="item.src"
                       style="
                    width: 100%;
                    max-height: 400px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    overflow: auto;
                  "
                    />
                    <video
                      width="100%"
                      controls
                      v-if="checkFormat(item.name) == 'MP4'"
                      controlsList="nodownload"
                    >
                      <source :src="item.src" type="video/mp4" />
                    </video>
                  </v-window-item>
                </v-window>
              </div>

              <div v-html="dialogData.event_body" id="newsDialog"></div>
              <div class="justify-end d-flex align-end" style="font-size: 12px">
                <v-icon class="mb-1" size="14"> mdi-message </v-icon>
                <div class="ml-1 mr-2" style="margin-top: 2px">
                  {{ dialogData.discussion_count }}
                </div>
                <v-icon class="mb-1" size="14"> mdi-eye </v-icon>
                <div class="ml-1" style="margin-top: 2px">
                  {{ dialogData.views_count }}
                </div>
              </div>

              <v-divider></v-divider>

              <discussion-area :event="dialogData" />
            </div>
          </slot>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false"> Закрыть </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import moment from "moment";
export default {
  components: {
  },
  data: () => ({
    moment,
    isLoadingFile: false,
    dialog: false,
    dialogData: "",
    src: "",
    firstSrc: "",
    firstImageLoader: false,
  }),
  methods: {
    checkFormat(str) {
      return str == null
        ? null
        : str.toUpperCase().substr(str.lastIndexOf(".") + 1);
    },

    async showOneNews(item) {
      this.dialogData = item;
      this.isLoadingFile = true;
      try {
        this.$set(this, "src", item.src);

        this.dialog = true;
        await this.axios.put(`/api/1.0/views-count/event/${item.event_id}`);
        this.dialogData.src = await this.$getBackendMinioFile(item.event_id, 2);

        if (this.dialogData.files.length) {
          for await (let el of this.dialogData.files) {
            el["src"] = await this.$getBackendMinioFile(el.file_id, 2, el.file_id);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoadingFile = false;
      }
    },

    checkDate(date) {
      if (!date) {
        return "";
      }

      const nowDate = new Date();
      const publishDate = new Date(date);

      if (
        nowDate.getFullYear() == publishDate.getFullYear() &&
        nowDate.getMonth() + 1 == publishDate.getMonth() + 1
      ) {
        if (nowDate.getDate() == publishDate.getDate()) {
          return "Сегодня";
        }
        if (nowDate.getDate() + 1 == publishDate.getDate()) {
          return "Завтра";
        }
        if (nowDate.getDate() - 1 == publishDate.getDate()) {
          return "Вчера";
        }
      }

      return moment(date).format("DD MMMM, HH:mm");
    },
  },
  watch: {
    dialog(newVal) {
      if (!newVal) {
        this.dialogData = "";
      }
    },
    allNews: async function (val) {
      await Promise.all(
        val.map(async (item) => {
          if (!item.src) {
            if (this.checkFormat(item.file_name) !== "MP4") {
              let src = await this.$getVuexStoreFile(item.event_id, 2);
              this.$set(item, "src", src ? src : "");
            }
          }
        })
      );
    },
  },
  props: ["allNews", "newsParams"],
};
</script><style lang="scss" scoped>
.loading-container {
  position: relative;
}
.loading-circular {
  position: absolute;
  left: 48%;
  top: 46%;
}
.mainEventsNews {
  background: #fff;

  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 0px;
  padding-left: 20px;

  border-radius: 10px;
}
</style>,<style lang="scss">
#newsDialog {
  h1 {
    font-size: 20px;
    color: #000;
    margin-bottom: 13px;
  }
  h2 {
    font-size: 17px;
    color: #000;
    margin-bottom: 10px;
  }
  p {
    font-size: 16px;
    color: #000;
  }
}

.dialog-wrapper {
  max-height: 65vh;
  padding-right: 20px;
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e6e6e6;
    border-radius: 7px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9e9e9e;
  }
}

.oneNews {
  border-radius: 5px;
  padding: 3px;
  cursor: pointer;
  transition: 0.35s;

  &:hover {
    background-color: rgb(214, 230, 241);
    transition: 0.35s;
  }
}
.loader {
  width: 100%;
  text-align: center;
}
</style>