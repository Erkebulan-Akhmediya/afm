<template>
  <v-row justify="center">
    <v-dialog persistent v-model="dialog" max-width="700px">
      <v-card>
        <v-card-title>
          <span color="black" class="text-h5">
            {{
              servicerequest_data.id
                ? `Редактирование запроса №` + servicerequest_data.id
                : "Новый запрос "
            }}</span
          >
        </v-card-title>
        <br>
        <v-card-text>
          <v-row>
            <v-col cols="5">
              <v-select
                v-model="servicerequest_data.category"
                :items="SERVICEREQUEST_CATEGORIES.filter((item)=>{ return servicerequest_data.category? item.need_to_be_approved == servicerequest_data.category.need_to_be_approved: true })"
                item-text="name"
                item-value="type"
                label="Категория"
                return-object
                dense
              ></v-select>
            </v-col>
            <v-col cols="7">
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
                v-model="servicerequest_data.description"
                filled
                auto-grow
                label="Описание запроса"
                rows="3"
                row-height="20"
              ></v-textarea>
            </v-col>
            <v-row v-if="characteristics_list.length!=0">
              <v-col  v-for="item in characteristics_list" :key="item.id" cols="12">
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
             
          </v-row>
        </v-card-text>
        <hr align="center" width="100%" size="1" color="grey" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeDialog()">
            Отмена
          </v-btn>
          <v-btn
            color="blue darken-1"
            :loading="IS_SENDING_SERVICEREQUEST"
            text
            @click="sendForm"
            :disabled="IS_SENDING_SERVICEREQUEST"
          >
            {{ servicerequest_data.id ? "Сохранить" : "Сохранить и перейти" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import editor from "@ckeditor/ckeditor5-build-classic";
import router from "../../router";

export default {
  props: ["dialog", "dialogData"],
  data() {
    return {
      editor: editor,
      servicerequest_data: {
        id: null,
        description: "", 
        category: null,
        subcategory: null
      },
      servicerequest_subcategories: [],
      characteristics_list: []
    };
  },
  methods: {
    ...mapActions(["GET_SERVICEEQUESTS_FROM_API", "POST_SERVICEEQUEST_TO_API", "GET_SERVICEREQUEST_TYPES_FROM_API"]),

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
      if (this.characteristics_list.length!=0) {
        for(let el of this.characteristics_list) {
          if(el.value == ''||el.value == null) {
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
      this.$emit("closeCreateDialog");

      this.servicerequest_data.id = null;
      this.servicerequest_data.description = ""; 
      this.servicerequest_data.category = null;
      this.servicerequest_data.subcategory = {};
      this.characteristics_list = [];
    },
    async get_characteristics_list(subcategory_id) {
      this.characteristics_loader = true
      try {
        let sr_id = this.servicerequest_data.id
        let {data} = await this.axios.get(`/api/1.0/servicerequests/characteristic/${subcategory_id}/${sr_id?sr_id:0}`)
        this.characteristics_list = data
      } catch(err) {
        console.log(err)
      } finally {
        this.characteristics_loader = false
      }
    }
  },
  computed: {
    ...mapGetters(["SERVICEREQUEST_SUBCATEGORIES", "SERVICEREQUEST_CATEGORIES", "IS_SENDING_SERVICEREQUEST", "SERVICEREQUEST"]),
  },
  created() {
  },
  watch: {
    "servicerequest_data.category"() {
      if (this.servicerequest_data.subcategory?.sr_category_id != this.servicerequest_data.category?.id) {
        this.servicerequest_data.subcategory = {};
      }

      this.servicerequest_subcategories = this.SERVICEREQUEST_SUBCATEGORIES.filter(
        (el) => el.sr_category_id == this.servicerequest_data.category?.id
      );
    },
    "servicerequest_data.subcategory"() {
      if(this.servicerequest_data.subcategory.id) {
       this.get_characteristics_list(this.servicerequest_data.subcategory.id)
      }
    },
    dialog() {
      if (this.dialog) {
        this.GET_SERVICEREQUEST_TYPES_FROM_API();
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