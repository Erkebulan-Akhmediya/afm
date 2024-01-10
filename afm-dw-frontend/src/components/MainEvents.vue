<template>
  <div class="mainEventsPage">
    <v-row style="border-bottom: 2px solid #ebeff2">
      <v-col cols="12" class="d-flex align-center ma-0 pa-0 pt-3 pb-1">
        <span style="font-weight: bold; font-size: 1rem">
          {{ this.name ? this.name : $t("mainPage.eventsBlock.events") }}</span
        >
      </v-col>
    </v-row>
    <v-row
      v-for="(event, index) in allEvents"
      :key="event.id"
      @click="showOneNews(event)"
      class="oneEvent"
    >
      <v-col class="ma-0 pa-4">
        <v-row>
          <v-col cols="12" class="ma-0 pa-0">
            <span style="font-weight: 600; font-size: 14px; color: #252c32"
              >{{ index + 1 }}. {{ event.event_title }}</span
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" class="ma-0 pa-0">
            <span style="font-size: 12px"
              >{{ event.first_name }} {{ event.last_name }}</span
            >
          </v-col>
          <v-col cols="4" class="ma-0 pa-0" style="text-align: right">
            <span style="font-size: 12px">{{
              event.event_date
                ? moment(event.event_date).format("DD MMMM, HH:mm")
                : ""
            }}</span>
          </v-col>
          <v-col
            cols="2"
            class="d-flex ma-0 pa-0 justify-end"
            style="font-size: 12px"
          >
            <v-icon size="14"> mdi-message </v-icon>
            <div class="ml-1 mt-1 mr-2">{{ event.discussion_count }}</div>
            <v-icon size="14"> mdi-eye </v-icon>
            <div class="ml-1 mt-1">{{ event.views_count }}</div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          width="100%"
          text
          color="primary"
          :to="{
            name: 'LiveNews',
            params: { currentTab: this.name ? 'assign' : 'event' },
          }"
          >{{ $t("mainPage.eventsBlock.showAll") }}</v-btn
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
            <div class="dialog-wrapper" :style="'overflow-y: auto;'">
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
              <v-skeleton-loader
                class="mx-auto mb-4"
                max-width="100%"
                max-height="300px"
                v-show="src && imageLoader"
                type="image"
              ></v-skeleton-loader>
              <!-- <img v-if="!imageLoader" :src="src || ''" alt="" style="width:100%; max-height: 300px; object-fit: cover; margin-bottom: 20px;"> -->
              <!-- <v-carousel v-if="dialogData.files.length>1" :show-arrows="true" hide-delimiters>
                      <v-carousel-item
                        v-for="item in dialogData.files"
                        :key="item.id"
                        :src="item.src"
                        contain
                      ></v-carousel-item>
                    </v-carousel> -->
              <v-window
                v-if="!this.imageLoader && this.dialogData.files"
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
              <div v-html="dialogData.event_body" id="newsDialog"></div>
              <div class="justify-end d-flex align-end" style="font-size: 12px">
                <v-icon class="mb-1" size="14"> mdi-message </v-icon>
                <div class="ml-1 mt-1 mr-2">
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
  data: () => ({
    moment,
    dialog: false,
    dialogData: "",
    src: "",
    imageLoader: false,
  }),
  methods: {
    checkFormat(str) {
      return str == null
        ? null
        : str.toUpperCase().substr(str.lastIndexOf(".") + 1);
    },
    async showOneNews(item) {
      this.dialogData = item;
      try {
        this.imageLoader = true;
        this.dialog = true;
        await this.axios.put(`/api/1.0/views-count/event/${item.event_id}`);

                if (this.dialogData.files) {
          for await (let el of this.dialogData.files) {
            el["src"] = await this.$getBackendMinioFile(el.file_id, 2, el.file_id);
          }
        }
      } catch (error) {
        console.log(error);
      }
      this.imageLoader = false;
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

      return moment(date).format("DD MMMM");
    },

    toUpperName(str) {
      return str
        .toLowerCase()
        .split(" ")
        .map(function (word) {
          return word[0].toUpperCase() + word.substr(1);
        })
        .join(" ");
    },
  },
  watch: {
    dialog(newVal) {
      if (!newVal) {
        this.dialogData = "";
      }
    },

    allEvents() {
      if (this.allEvents.length) {
        this.allEvents.map(async (item) => {
          if (!item.src) {
            this.$set(
              item,
              "src",
              require("@/assets/img/default_employee.png")
            );
          }
        });
      }
    },
  },
  props: ["allEvents", "eventsParams", "name"],
};
</script><style scoped lang="scss">
.mainEventsPage {
  background: #fff;
  margin-bottom: 20px !important;
  padding-top: 10px;
  padding-right: 30px;
  padding-bottom: 0px;
  padding-left: 30px;

  border-radius: 10px;
}

.oneEvent {
  border-radius: 5px;
  cursor: pointer;
  transition: 0.35s;
  padding: 5px;

  &:hover {
    background-color: rgb(214, 230, 241);
    transition: 0.35s;
  }
}

.eventCard {
  cursor: pointer;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  transition: 0.3s;

  &:hover {
    transition: 0.3s;
    box-shadow: 1px 2px 10px rgba(0, 0, 0, 0.2);
  }

  p {
    margin-bottom: 5px;
  }
  .eventTitle {
    font-weight: 500;
    font-size: 15px;
    line-height: 22px;
    letter-spacing: 0.01em;
  }

  .eventDate {
    font-size: 13px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #4c5862;
  }

  .grayText {
    font-size: 13px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #4c5862;
    opacity: 0.5;
  }
  .eventAuthor {
    font-size: 13px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #707683;
  }
  .clickableIcons {
    cursor: pointer;
    color: #c4c4c4;
  }
  .clickableIcons:hover {
    color: #000;
  }
}
</style>,<style lang="scss">
.dialogOneNews {
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
}
</style>