<template>
  <div :style="this.loading ? `opacity: 0.7` : `opacity : 1` ">
    <email-message
      v-if="IS_MAIL_DETAIL"
      @isMessageDetail="isMessageDetail(false)"
    />

    <v-card class="d-flex flex-column" v-if="!IS_MAIL_DETAIL">
      <v-subheader class="pt-2">
        <v-col cols="12">
          <v-text-field
            label="Поиск в почте"
            prepend-inner-icon="mdi-magnify"
            class="search mt-6"
            v-model="searchString"
          ></v-text-field>
        </v-col>
      </v-subheader>

      <v-list :disabled="BOX_IS_LOAD">
        <v-list-item
          v-if="SELECTED_BOX.system_name != 'Important' && SELECTED_BOX.system_name != 'Sent' && EMAILS.length"
        >
          <v-list-item-action>
            <v-btn @click="selectAll()" icon
              ><v-icon :color="selected.length ? 'primary' : 'grey'">{{
                !selected.length
                  ? "mdi-checkbox-blank-outline"
                  : "mdi-minus-box-outline"
              }}</v-icon></v-btn
            >
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-subtitle>
              <h6 v-if="!selected.length">Выбрать все</h6>
              <v-btn v-if="selected.length" @click="isFlaged(selected)" icon>
                <v-icon>mdi-star-outline</v-icon>
              </v-btn>
              <v-btn
                v-if="selected.length && SELECTED_BOX.system_name != 'Trash'"
                @click="toTrash(selected)"
                icon
              >
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
              <v-btn
                v-if="selected.length"
                @click="markReaded(selected)"
                icon
              >
                <v-icon>mdi-email-mark-as-unread</v-icon>
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-content>
            <v-menu
              v-if="
                selected.length && boxesForMoved.length!=0 &&
                (SELECTED_BOX.system_name == 'Trash' ||
                  SELECTED_BOX.system_name == 'INBOX' ||
                  SELECTED_BOX.system_name == 'Spam')
              "
              left
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn text v-bind="attrs" v-on="on"> Переместить в </v-btn>
              </template>

              <v-list>
                <v-list-item
                  v-for="item in boxesForMoved"
                  :key="item.display_name"
                  @click="moveTo(item)"
                >
                  <v-list-item-title>{{ item.display_name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-content>
        </v-list-item>


        <v-list v-if="!BOX_IS_LOAD">
          <div
            v-for="item in EMAILS.slice(0, 13)"
            class="item-card item-card-container"
            :key="item.id"
          >
            <v-list-item-action v-if="SELECTED_BOX.system_name != 'Important' && SELECTED_BOX.system_name != 'Sent'">
              <!-- <v-checkbox
              :input-value="item"
              :value="item"
              v-model="selected"
              color="primary accent-4"
            ></v-checkbox> -->
              <v-btn @click="addDelSelected(item)" icon
                ><v-icon
                  :color="selected.includes(item) ? 'primary' : 'grey'"
                  >{{
                    !selected.includes(item)
                      ? "mdi-checkbox-blank-outline"
                      : "mdi-checkbox-marked-outline"
                  }}</v-icon
                ></v-btn>
            </v-list-item-action>
            <v-list-item-action v-if="SELECTED_BOX.system_name != 'Sent'">
              <v-btn
                :color="
                  item.flags.includes('\\Flagged') ? 'yellow accent-4' : 'grey'
                "
                @click="isFlaged(item)"
                icon
                :disabled="SELECTED_BOX.system_name == 'Important'"
                :loading="btnDisabled"
              >
                <v-icon>{{
                  item.flags.includes("\\Flagged")
                    ? "mdi-star"
                    : "mdi-star-outline"
                }}</v-icon>
              </v-btn>
            </v-list-item-action>
            <div v-if="SELECTED_BOX.system_name != 'Sent'" @click="markReaded([item])">
            <v-badge
              v-if="item.flags.includes('unread')"
              dot
              inline
              left
              overlap
            ></v-badge>
            </div>
            <v-list-item-content
              class="left__content"
              @click="
                getMessage(item)
              "
            >
              <div class="d-flex justify-start align-center" :class="item.flags.includes('unread') && SELECTED_BOX.system_name != 'Sent' ? 'bold' : ''" >
                <v-list-item-subtitle v-if="item.from_email_name != 'Me'"
                  class="text--primary item-email item-card"
                  v-html="item.from_email_name?item.from_email_name:item.from_email_address"
                ></v-list-item-subtitle>
                <v-list-item-subtitle v-else
                  class="text--primary item-email item-card"
                  v-html="'Кому: ' + item.to_email_address[0]"
                ></v-list-item-subtitle>
                <div class="item-title item-card" v-html="item.subject || item.subject != 'undefined'?
                 `${item.subject}:` :'Без темы: '"></div>
                <div
                  class="text--disabled item-sub-title item-card"
                  v-html="item.text!='undefined'? item.text:''"
                ></div>
              </div>
            </v-list-item-content>

            <div class="caption item-date d-flex align-center">
              <div v-if="item.files.length > 0" class="mr-2 file-icon ">
                <v-icon medium >
                    mdi-attachment
                </v-icon><v-icon/>
                <p style="margin-right  : 5px; margin-left : 5px" class="file-icon-text">{{  item.files.length  }}</p>
              </div>
              <v-list-item-subtitle>{{
                $moment(new Date(item.date + "+0000")).format("DD.MM.yyy HH:mm")
              }}</v-list-item-subtitle>
            </div>
       
          </div>
        </v-list>
      </v-list>
      
      <v-list-item
        v-if="BOXES_IS_LOAD || BOX_IS_LOAD"
        class="d-flex justify-center remove-hover"
      >
        <v-progress-circular
          :size="70"
          :width="5"
          color="primary"
          indeterminate
          style="margin-bottom:30px;"
        ></v-progress-circular>
      </v-list-item>
      <v-list-item v-else-if="EMAILS.length == 0" class="d-flex justify-center remove-hover">
        <h3 class="text-center mt-3">
          В папке <strong>{{ SELECTED_BOX.display_name }}</strong> нет писем
      </h3>
      </v-list-item>
      <v-spacer></v-spacer>
      <div class="text-center mb-8" v-if="!BOX_IS_LOAD && EMAILS.length != 0">
        <v-pagination
          v-model="paging.currentPage"
          :length="pageCounter"
          :total-visible="7"
          @input="selectPage"
        ></v-pagination>
      </div>
    </v-card>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import EmailMessage from "./EmailMessage.vue";

export default {
  data: () => ({
    searching: false,
    paging: {
      limit: 13,
      currentPage: 1,
      pages: 1,
    },
    loading: false,
    searchString: "",
    selected: [],
    model: 0,
    selectedAll: false,
    emailDetail: false,
    disabled: false,
    btnDisabled: false,
  }),
  components: {
    EmailMessage,
  },

  computed: {
    ...mapGetters([
      "EMAILS",
      "BOX_IS_LOAD",
      "BOXES_IS_LOAD",
      "SEARCHED_EMAILS",
      "SELECTED_BOX",
      "EMAIL_PAGGING",
      "BOXES",
      "IS_MAIL_DETAIL"
    ]),
    pageCounter() {
      let count;
      if (this.EMAILS.length > this.paging.limit) {
        count = this.paging.currentPage + 1;
      } else {
        count = this.paging.currentPage;
      }
      return count;
    },
    isFavorit(flags) {
      return flags.includes("\\Flagged");
    },
    boxesForMoved() {
      let boxes = [];
      if (this.SELECTED_BOX.system_name == "Trash") {
        boxes = this.BOXES.filter(
          (el) => el.system_name != "Trash" && el.system_name != "Outbox" && el.system_name != "Drafts" && el.system_name != "Sent"
        );
      }
      if (this.SELECTED_BOX.system_name == "INBOX") {
        boxes = this.BOXES.filter((el) => el.system_name == "Spam");
      }
      if (this.SELECTED_BOX.system_name == "Spam") {
        boxes = this.BOXES.filter((el) => el.system_name == "INBOX");
      }

      return boxes;
    },
    page() {
      return this.EMAIL_PAGGING.currentPage;
    },
  },
  methods: {
    ...mapActions([
      "GET_EMAILS_IN_BOX_API",
      "GET_MESSAGE",
      "READ_MESSAGE",
      "SEARCH_EMAIL",
      "EMAIL_ADD_FLAGS",
      "EMAIL_DEL_FLAGS",
      "EMAIL_TO_TRASH",
      "MOVE_EMAIL_TO",
      "GET_IMPORTANT_EMAIL_API",
      "GET_FILES"
    ]),
    ...mapMutations(['SET_MAIL_DETAIL']),

    async markReaded(items){
      var ids = []
      var unseen = true
      await items.map((i) => {
        if(i.flags.includes('unread')){
          unseen = false
          return;
        }
      })
      items.map((i) => {
        if(!unseen){
          if(i.flags.includes('unread')){
            const index = i.flags.indexOf("unread"); 
            i.flags.splice(index, 1);
            ids.push(i.id)
          }
        } else {
          if(!i.flags.includes('unread')){
            i.flags.push("unread")
            ids.push(i.id) 
          }
        }
      })
      this.selected = []
      await this.READ_MESSAGE({ 'ids' : ids, 'unseen' : unseen })
    },

    async getMessage(item) {
      if(!this.loading){
        this.loading = true
        this.SET_MAIL_DETAIL(true);
        this.GET_MESSAGE(item);
        this.loading = false
      }
    },

        isMessageDetail(bool) {
      this.SET_MAIL_DETAIL(bool)
    },
    selectPage() {
      this.selected = [];
      let paging = {
        limit: this.paging.limit + 1,
        offset: this.paging.limit * (this.paging.currentPage - 1),
        currentPage: this.paging.currentPage,
      };

      let params = { ...this.SELECTED_BOX, ...paging };
      if (this.searchString != "") {
        params = { ...params, ...{ searchString: this.searchString } };
      }
      if (this.SELECTED_BOX.system_name == "Important") {
        this.GET_IMPORTANT_EMAIL_API(params);
      } else {
        this.GET_EMAILS_IN_BOX_API(params);
      }
      this.selected = [];
    },
    async selectAll() {
      if (this.selected.length != this.EMAILS.slice(0, 13).length) {
        const selected = this.EMAILS.slice(0, 13).map((el) => el);
        this.selected = selected;
      } else {
        this.selected = [];
      }
    },

        onSearching(){
      if(!this.searching){
        var s = this.searchString
        this.searching = true
        setTimeout(() => {
          if(s != this.searchString){
            this.searching = false
            this.onSearching()
          } else {
            this.searching = false
            this.searchEmail(this.searchString)
          }
       }, 1500)
      } 
    },

    searchEmail(searchString) {
      this.paging.currentPage = 1;
      this.paging.offset = 0;

      let params = {
        ...this.SELECTED_BOX,
        ...{ searchString: searchString },
        ...{ limit: 13, offset: 0 },
      };
      this.GET_EMAILS_IN_BOX_API(params);

         },
    async isFlaged(payload) {

            this.btnDisabled = true;

      let flagged = [];
      let unflagged = [];
      if (Array.isArray(payload)) {
        payload.forEach((el) => {
          if (el.flags.includes("\\Flagged")) {
            flagged.push(el.uid);
          } else {
            unflagged.push(el.uid);
          }
        });
        if (flagged.length != 0) {
          await this.EMAIL_DEL_FLAGS(flagged);
          this.btnDisabled = false;
          this.selected = [];

                  }
        if (unflagged.length != 0) {
          await this.EMAIL_ADD_FLAGS(unflagged);
          this.btnDisabled = false;
          this.selected = [];
        }
      } else {
        this.btnDisabled = true;
       payload.flags.includes("\\Flagged")
          ? await this.EMAIL_DEL_FLAGS(payload.uid)
          : await this.EMAIL_ADD_FLAGS(payload.uid);
        this.selected = [];
        this.btnDisabled = false;
      }

            this.selected = [];



              },
    async toTrash(payload) {
      this.btnDisabled = true;
      let uids = [];
      if (Array.isArray(payload)) {
        uids = payload.map((el) => {
          return el.uid;
        });
      } else {

        uids.push(payload.uid);
      }
      await this.EMAIL_TO_TRASH(uids);
      this.selected = [];
      this.btnDisabled = false;
    },
    moveTo(mail) {
      let uids = [];
      if (Array.isArray(this.selected)) {
        uids = this.selected.map((el) => {
          return el.uid;
        });
      } else {

        uids.push(this.selected.uid);
      }
      let payload = { boxTo: mail, uids: uids };
      this.MOVE_EMAIL_TO(payload);
      this.selected = [];
    },
    addDelSelected(item) {
      if (!this.selected.includes(item)) {
        this.selected.push(item);
      } else {
        this.selected = this.selected.filter((el) => el != item);
      }
    },
  },
  created() {
    this.selected = [];
  },
  updated() {
    this.paging.currentPage = this.EMAIL_PAGGING.currentPage;
  },

    watch: {
      '$store.getters.SELECTED_BOX': function () {
       this.selected = []
      },
      searchString: {
        handler(){
          this.onSearching()
        },
        deep: true
      }
    },

  sockets: {},
};
</script><style lang="scss" scoped>
.file-icon{
  max-width: 55px;
  position: relative;
  align-items: center;
  display: flex;
  justify-content: start;
  text-align: center;
}
.file-icon-text{
  margin-top: 18px;
  font-size: 15px;
  color: rgb(63, 63, 63)!important;
  font-weight: bold;
}
.align-center{
  justify-content: center;
  align-items: center;
}
.bold{
  font-weight: bold!important;
}
.item-date{
  margin-left: 20px;
}
.item-card-container{
  height: 50px;
  margin-left: 16px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(214, 214, 214);
  border-radius: 0px!important;
  padding-right: 10px;
  transition: all 0.4s ease;
}
.item-card-container:hover{
  background-color: rgba(218, 224, 247, 0.664);
}
.item-card{
  cursor: pointer;
  text-overflow: ellipsis!important;
  overflow: hidden!important;
  white-space: nowrap!important;
}
.item-email{
  margin-right: 20px;
  max-width: 180px!important;
}
.item-title{
  margin-right: 10px;
  min-width: 60px;
  max-width: 360px;
  width: fit-content;
  color: rgb(34, 34, 34);
  font-size: 14px!important;
  
}
.item-sub-title{
  max-width: 100%;
  
}
.justify-start{
  justify-content: flex-start!important;
  text-align: start!important;
}
span {
  background-color: transparent !important;
}
.theme--light.v-btn.v-btn--disabled i {
  color: #ffd600 !important;
}
span {
  background-color: rgba(255, 0, 0, 0.4);

  padding: 0 5px;
}
.v-application--is-ltr .v-list-item__action:first-child,
.v-application--is-ltr .v-list-item__icon:first-child {
  margin-right: 5px;
}
.right__content {
  text-align: right;
  flex: 1 1 !important;
}
.left__content {
  flex: 3 1 !important;
}
.v-list-item:hover {
  background-color: #e1ebfd;
}
.remove-hover:hover {
  background-color: transparent;
}
.v-list-item-subtitle {
  overflow: hidden;
}
</style>