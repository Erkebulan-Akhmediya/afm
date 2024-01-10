<template>
  <v-card class="scroll email-message no-shadow" width="100%">
    <v-card-text class="email-inserted">
      <div class="header" height="45vh"  >
      <v-btn icon @click="isMessageDetail()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-list-item-content class="right__content text--secondary">
        <v-list-item-subtitle>{{
          $moment(new Date(MESSAGE.date + "+0000")).format("DD.MM.YY HH:mm")
        }}</v-list-item-subtitle>
      </v-list-item-content>

      <v-menu left bottom offset-y v-if="SELECTED_BOX.system_name != 'Sent'">
        
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-if="SELECTED_BOX.system_name != 'Sent'" @click="nextEmail()" icon>
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn v-if="SELECTED_BOX.system_name != 'Sent'" @click="prevEmail()" icon>
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
          <v-btn v-bind="attrs" v-on="on" icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
          <v-btn
        v-if="
          SELECTED_BOX.system_name != 'Important' &&
          SELECTED_BOX.system_name != 'Sent'
        "
        :color="
          MESSAGE.flags.includes('\\Flagged') ? 'yellow accent-4' : 'grey'
        "
        @click="isFlaged(MESSAGE)"
        icon
      >
        <v-icon>{{
          MESSAGE.flags.includes("\\Flagged")
            ? "mdi-star"
            : "mdi-star-outline"
        }}</v-icon>
      </v-btn>
      <v-btn
        v-if="
          SELECTED_BOX.system_name != 'Trash' &&
          SELECTED_BOX.system_name != 'Important' &&
          SELECTED_BOX.system_name != 'Sent'
        "
        @click="toTrash(MESSAGE)"
        icon
      >
        <v-icon>mdi-delete-outline</v-icon>
      </v-btn>
        </template>

        <v-list class="pr-4">
          <forward-email />

          <reply-email />

          <v-list-item
            v-if="
              SELECTED_BOX.system_name != 'Trash' &&
              SELECTED_BOX.system_name != 'Important'
            "
            class="mt-2"
            @click="toTrash(MESSAGE)"
          >
            <v-btn class="mr-3" icon>
              <v-icon>mdi-delete-outline</v-icon>
            </v-btn>
            <v-list-item-title>Удалить</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
      <div class="d-flex justify-start align-center pl-5" v-if="SELECTED_BOX.system_name == 'Sent'">
        <div class="text-h6"> Получатели :</div>
        <div class="text--secondary mt-1 ml-1">
          <span
            v-for="(el, index) in MESSAGE.to_email_address"
            :key="index"
            >{{ el + "; " }}
          </span>
        </div>
      </div>
      <v-toolbar-title class="pl-5"
        >
        <v-list-item-title class="subject-title" > {{ MESSAGE.subject != 'undefined' ? MESSAGE.subject : 'Без темы:' }} </v-list-item-title>
        <v-list-item-title class="email-name-title"> {{MESSAGE.from_email_name != 'Me' ? MESSAGE.from_email_name : 'От:' }}
          <span >{{ MESSAGE.from_email_address }}
          </span></v-list-item-title>
        <div class="devider" ></div>
      </v-toolbar-title>
        <div
          class="text-h2 text-subtitle-1 pa-6"
          v-html="
            MESSAGE.html != 'false'
              ? MESSAGE.html
              : MESSAGE.text != 'undefined'
              ? MESSAGE.text
              : ''
          "
        ></div>
      <v-row class="justify-center">
        <div
          :max-width="checkFormat(el.name) ? 100 : 250"
          :max-heigth="160"
          class="mr-2 mb-4 file-card"
          v-for="el in MESSAGE.files"
          :key="el.file_id"
        >
        <div class="d-flex justify-between">
          <div
            class="file-content"
            v-text="el.name"
          >
        </div>
        <div class="file-buttons">
           <v-btn @click="downloadFile(el)" icon>
              <v-icon>mdi-download</v-icon>
            </v-btn>

            <v-btn
              @click="
                overlay = true;
                imageView(el);
              "
              icon
              v-if="checkFormat(el.name)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </div> 
          </div>
      </div>
      </v-row>
      <div v-if="SELECTED_BOX.system_name != 'Sent'" class="d-flex justify-start mt-4">
        <div class="email-action">
          <reply-email />
        </div>
        <div class="email-action">
          <forward-email /> 
        </div>
      </div>
      <v-overlay :absolute="overlay" :value="overlay">

      <v-row>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="overlay = false"> Закрыть </v-btn>
      </v-row>
      <v-row class="justify-center">
        <img width="70%" height="60%" :src="imgSrc"/>
      </v-row>
       
  </v-overlay>

  <v-card-actions class="justify-end"> </v-card-actions>
    </v-card-text>
</v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import ReplyEmail from "./ReplyEmail";
import ForwardEmail from "./ForwardEmail";

export default {
data() {
  return {
    overlay: false,
    imgSrc: "",
  };
},
components: {
  ReplyEmail,
  ForwardEmail,
},
computed: {
  ...mapGetters(["MESSAGE", "SELECTED_BOX"]),
},

methods: {
  ...mapActions([
    "EMAIL_DEL_FLAGS",
    "EMAIL_ADD_FLAGS",
    "PREV_NEXT_EMAIL",
    "EMAIL_TO_TRASH", 
  ]),
  isMessageDetail() {
    this.$emit("isMessageDetail");
  },
  deleteMess() {
  },
  isFlaged(payload) {

    payload.flags.includes("\\Flagged")
      ? this.EMAIL_DEL_FLAGS(payload.uid)
      : this.EMAIL_ADD_FLAGS(payload.uid);
  },
  toTrash(payload) {

      this.EMAIL_TO_TRASH(payload.uid);
    this.isMessageDetail();
  },
  nextEmail() {
    this.PREV_NEXT_EMAIL("next");
  },
  prevEmail() {
    this.PREV_NEXT_EMAIL("prev");
  },
  downloadFile(item) {
    let config = {
      responseType: "blob",
      params: {
        objectType: 9,
        id: item.id,
      },
    };
    this.axios.get(`/api/1.0/fileDownload`, config).then((response) => {
      let blob = new Blob([response.data], {
        type: "application/document",
      });
      const a = document.createElement("a");
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = item.name;
      a.click();
      a.remove();
    });
  },
  async imageView(img) {
    let src = await this.$getBackendMinioFile(img.object_id, 9, img.id);
    this.imgSrc = src;
  },
  checkFormat(str) {
    if (str == null) {
      return false
    }
    str = str.substr(str.lastIndexOf(".") + 1).toLowerCase();
    return str == "jpg" || str == "png";
  },
},
watch: {
  async MESSAGE(){
    console.log(this.MESSAGE.files)
  },
  },

  };
</script><style scoped>
.overlay{
  height: 100%;
}
.email-inserted{
  min-height: 380px;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
}
.justify-between{
  justify-content: space-between;
  align-items: center;
}
.file-card{
  border-radius: 8px;
  -webkit-box-shadow: 0px 0px 5px 0px rgba(50, 50, 50, 0.75);
  -moz-box-shadow:    0px 0px 5px 0px rgba(50, 50, 50, 0.75);
  box-shadow:         0px 0px 5px 0px rgba(50, 50, 50, 0.75);
  margin: 6px;
  height: max-content;
  width: min-content;
  width: 45%;
  max-width: 400px;
  overflow: hidden;
}
.file-content{
  margin-left: 10px;
  margin-right: 10px;
  justify-content: center;
  display: flex;
  flex-direction: column;
  text-overflow: ellipsis!important;
}
.subject-title{
  font-size: 22px;
  color: rgb(36, 36, 36);
}
.email-name-title{
  font-size: 19px;
  color: rgb(54, 54, 54);
}
.email-name-title span{
  font-size: 15px;
  color: rgb(78, 78, 78);
  
}
.email-action{
border: 2px solid rgb(184, 184, 184);
border-radius: 29px;
width: 170px;
padding-right: 12px;
padding-bottom: 5px;
padding-top: 5px;
margin: 6px;
margin-right: 10px;
overflow: hidden;
}
.devider{
width: 100%;
border-bottom: 1px solid rgb(201, 201, 201);;
}
.header{
display: flex;
align-items: center;
justify-content: center;
}
.no-shadow{
box-shadow: none!important;
padding: 0%;
}
.email-inserted{
background-color: #fff;
box-shadow: 2px 1px 4px rgb(155, 154, 154)!important;
width: 100%;
margin: auto;
margin-top: 2px;
padding-top: 4px;
border-radius: 10px;
}
.email-message{
background-color: inherit;
max-height: 85vh;
min-height: 80px;
}
.justify-start{
justify-content: flex-start!important;
text-align: start!important;
}
.right__content {
text-align: right;
}
.scroll {
overflow-y: auto;
}
.theme--dark.v-sheet {
background-color: transparent;
}
.v-menu__content {
overflow-y: hidden;
overflow-x: hidden;
}
::-webkit-scrollbar {
width: 10px;    
}
::-webkit-scrollbar-thumb {
background-color: rgb(170, 170, 170);   
border-radius: 20px;   
}
::-webkit-scrollbar-thumb:hover{
background-color: rgb(155, 155, 155);
}
</style>