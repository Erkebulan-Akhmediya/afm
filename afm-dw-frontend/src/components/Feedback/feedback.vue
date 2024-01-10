<template>
  <div class="feedback">
    <v-btn
      class="mr-6"
      fab
      raised
      dark
      color="green"
      v-if="!show"
      @click="show = !show"
    >
      <v-icon dark> mdi-help </v-icon>
    </v-btn>

    <v-card v-if="show" class="grey lighten-3" max-width="500">
      <v-card-title style="background-color: #1976d2">
        <span>Служба поддержки</span>
        <v-spacer></v-spacer>
        <v-btn
          class="mx-2"
          fab
          raised
          dark
          x-small
          color="error"
          @click="closeDialog()"
        >
          <v-icon dark> mdi-close </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-container class="ma-1 pa-0">
          <v-row class="ma-0 pa-0">
            <v-form width="500" v-model="valid" validation>
              <br />
              <v-col cols="12">
                <v-select
                  v-model="servicerequest_data.category"
                  :items="SERVICEREQUEST_CATEGORIES"
                  item-text="name"
                  item-value="type"
                  label="Категория"
                  return-object
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="servicerequest_data.subcategory"
                  :items="servicerequest_subcategories"
                  item-text="name"
                  item-value="type"
                  label="Подкатегория"
                  return-object
                  dense
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model.trim="servicerequest_data.description"
                  filled
                  auto-grow
                  label="Описание запроса"
                  rows="3"
                  row-height="20"
                ></v-textarea>
              </v-col>
            </v-form>
          </v-row>
          <hr />
          <v-row v-if="characteristics_list.length != 0" class="overflow">
            <v-col
              v-for="item in characteristics_list"
              :key="item.id"
              cols="12"
            >
              <v-textarea
                v-model.trim="item.value"
                filled
                auto-grow
                :label="item.name"
                rows="1"
                row-height="20"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row class="ma-0 pa-0">
            <v-col cols="12" class="ma-0 pa-0">
              <span v-html="contacts.description"></span>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          style="margin-right: 15px"
          color="blue darken-1"
          :loading="IS_SENDING_SERVICEREQUEST"
          text
          @click="sendForm"
          :disabled="IS_SENDING_SERVICEREQUEST"
        >
          {{ servicerequest_data.id ? "Сохранить" : "Сохранить и перейти" }}
        </v-btn>
        <!-- <v-btn 
          color="green" 
          text 
          @click="feedbackCreate()"
          :disabled="!valid"
        >
          Отправить
        </v-btn> -->
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import router from "../../router";

export default {
  data: () => ({
    ourContacts: [
      { icon: "phone", contact: "+77777777777", id: 1 },
      { icon: "email", contact: "support@dreamlab.kz", id: 2 },
    ],
    show: false,
    valid: false,
    contact: "",
    contactRules: [
      (v) => !!v || "Контакты обязательны",
    ],
    email: "",
    emailRules: [
      (v) => !!v || "E-mail обязателен",
      (v) => /.+@.+\..+/.test(v) || "E-mail некорректный",
    ],
    text: "",
    textRules: [
      (v) => !!v || "Текст обращения не может быть пустым",
      (v) => (v && v.length >= 10) || "Слишком мало информации",
    ],
    phoneNumber: "",
    phoneNumberRules: [
      (v) => !!v || "Телефонный номер не может быть пустым",
      (v) =>
        /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/.test(v) ||
        "Телефон некорректный",
    ],

    contacts: {},

    servicerequest_data: {
      id: null,
      description: "",
      category: null,
      subcategory: null,
    },
    servicerequest_subcategories: [],
    characteristics_list: [],
  }),
  components: {},

  computed: {
    ...mapGetters([
      "SERVICEREQUEST_SUBCATEGORIES",
      "SERVICEREQUEST_CATEGORIES",
      "IS_SENDING_SERVICEREQUEST",
      "SERVICEREQUEST",
    ]),
  },
  methods: {
    ...mapActions([
      "GET_SERVICEEQUESTS_FROM_API",
      "POST_SERVICEEQUEST_TO_API",
      "GET_SERVICEREQUEST_TYPES_FROM_API",
    ]),

    async sendForm() {
      const err = [];
      if (!this.servicerequest_data.category?.id) {
        err.push("Категория обязателен");
      }
      if (!this.servicerequest_data.subcategory?.id) {
        err.push("Подкатегория обязателен");
      }
      if (this.servicerequest_data.description.trim() == "") {
        err.push("Описание запроса обязательно");
      }

      if (this.characteristics_list.length != 0) {
        for (let el of this.characteristics_list) {
          if (el.value == "" || el.value == null) {
            err.push(`${el.name} обязательно`);
          }
        }
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

      let payload = this.servicerequest_data;
      payload.sr_category_id = payload.category.id;
      payload.sr_subcategory_id = payload.subcategory.id;
      payload.sr_status_id = 1;

      if(this.characteristics_list.length!=0) {
        payload.characteristics = this.characteristics_list
      }

      var data = await this.POST_SERVICEEQUEST_TO_API(payload);
      router.push(`/servicerequests/${this.$crypto(String(data))}`);

      this.closeDialog();
    },
    closeDialog() {
      this.servicerequest_data.id = null;
      this.servicerequest_data.description = "";
      this.servicerequest_data.category = {};
      this.servicerequest_data.subcategory = {};

      this.show = !this.show;

      this.characteristics_list = [];
    },
    async feedbackCreate() {
      let locals = {
        contact: this.contact,
        text: this.text.trim(),
      };

      if (this.$route.name == "Login") {
        await this.axios.post(`/api/1.0/feedback/quest`, locals);
        this.contact = "";
        this.text = "";
      } else {
        await this.axios.post(`/api/1.0/feedback`, locals);
        this.contact = "";
        this.text = "";
      }

      this.show = false;
      this.$swal({
        ...this.$optionAlert.fire,
        icon: "success",
        title: "Отправлено",
      });
    },
    async getContacts() {
      let contacts = await this.axios.get(`/api/1.0/feedback/contacts`);
      this.contacts = contacts.data;
    },
    async get_characteristics_list(subcategory_id) {
      this.characteristics_loader = true;
      try {
        let sr_id = this.servicerequest_data.id;
        let { data } = await this.axios.get(
          `/api/1.0/servicerequests/characteristic/${subcategory_id}/${
            sr_id ? sr_id : 0
          }`
        );
        this.characteristics_list = data;
      } catch (err) {
        console.log(err);
      } finally {
        this.characteristics_loader = false;
      }
    },
  },
  created() {
    this.getContacts();
    this.GET_SERVICEREQUEST_TYPES_FROM_API();
  },
  sockets: {},

  watch: {
    "servicerequest_data.category"() {
      if (
        this.servicerequest_data.subcategory?.sr_category_id !=
        this.servicerequest_data.category.id
      ) {
        this.servicerequest_data.subcategory = {};
      }

      this.servicerequest_subcategories =
        this.SERVICEREQUEST_SUBCATEGORIES.filter(
          (el) => el.sr_category_id == this.servicerequest_data.category.id
        );
    },
    "servicerequest_data.subcategory"() {
      if (this.servicerequest_data.subcategory.id) {
        this.get_characteristics_list(this.servicerequest_data.subcategory.id);
      }
    },
    dialog() {
      if (this.dialog) {
        this.GET_SERVICEREQUEST_TYPES_FROM_API();
        if (this.dialogData) {
          this.servicerequest_data = JSON.parse(
            JSON.stringify(this.dialogData)
          );
        }
      }
    },
  },
};
</script><style lang="scss" scoped>
.feedback {
  position: fixed !important;
  bottom: 0;
  margin-bottom: 80px;
  right: 3px;
  max-width: 500px;
  z-index: 999;
}
.v-form {
  width: 450px !important;
  overflow-y: scroll;
}
.overflow {
  overflow-y: auto;
  max-height: 250px;
  padding: 5px;
}
</style>