<template>
  <v-row justify="center">
    <v-dialog persistent v-model="dialog" max-width="700px">
      <v-card>
        <v-card-title>
          <span color="black" class="text-h5">
            {{
              appeal_data.id
                ? `Редактирование предложения №` + appeal_data.id
                : "Новое предложение"
            }}</span
          >
        </v-card-title>
        <br>
        <v-card-text>
          <v-row>
            <v-col cols="5">
              <v-select
                v-model="appeal_data.appeal_type"
                :items="APPEAL_TYPES"
                item-text="name"
                item-value="type"
                label="Тип"
                return-object
                dense
              ></v-select>
            </v-col>
            <v-col cols="7">
              <v-select
                v-model="appeal_data.appeal_subtype"
                :items="appeal_subtypes"
                item-text="name"
                item-value="type"
                label="Подтип"
                return-object
                dense
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                dense
                v-model="appeal_data.title"
                label="Тема предложения"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <label for="description"> Описание предложения</label>
              <ckeditor
                id="description"
                :editor="editor"
                v-model="appeal_data.description"
                :config="{
                  toolbar: {
                    items: [
                      '|',
                      'bold',
                      'italic',
                      'bulletedList',
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
            <v-col cols="12">
              <label for="solution"> Пути решения</label>
              <ckeditor
                id="solution"
                :editor="editor"
                v-model="appeal_data.solutions"
                :config="{
                  toolbar: {
                    items: [
                      '|',
                      'bold',
                      'italic',
                      'bulletedList',
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
            <v-col cols="12">
              <label for="expected_result"> Ожидаемый результат</label>
              <ckeditor
                id="expected_result"
                :editor="editor"
                v-model="appeal_data.expected_result"
                :config="{
                  toolbar: {
                    items: [
                      '|',
                      'bold',
                      'italic',
                      'bulletedList',
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
          </v-row>
        </v-card-text>
        <hr align="center" width="100%" size="2" color="grey" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeDialog()">
            Отмена
          </v-btn>
          <v-btn
            color="blue darken-1"
            :loading="IS_SENDING_APPEAL"
            text
            @click="sendForm"
            :disabled="IS_SENDING_APPEAL"
          >
            {{ appeal_data.id ? "Сохранить" : "Сохранить и перейти" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import editor from "@ckeditor/ckeditor5-build-classic";
let _ = require('lodash');

export default {
  props: ["dialog", "dialogData"],
  data() {
    return {
      editor: editor,
      appeal_data: {
        id: null,
        title: "",
        description: "", 
        solutions: "", 
        expected_result: "", 
      },
      appeal_subtypes: []
    };
  },
  methods: {
    ...mapActions(["GET_APPEAL_TYPES_FROM_API", "POST_APPEAL_TO_API"]),

        async sendForm() {
      const err = [];
      if (!this.appeal_data.appeal_type || _.isEmpty(this.appeal_data.appeal_type)) {
        err.push("Тип предложния обязателен");
      }
      if (!this.appeal_data.appeal_subtype || _.isEmpty(this.appeal_data.appeal_subtype)) {
        err.push("Подтип предложения обязателен");
      }
      if (this.appeal_data.title.trim() == "") {
        err.push("Тема предложения обязательна");
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

      let payload = this.appeal_data;
      payload.appeal_type_id = payload.appeal_type.id;
      payload.appeal_subtype_id = payload.appeal_subtype.id;
      payload.appeal_status_id = 1;

      await this.POST_APPEAL_TO_API(payload);
      this.closeDialog();
    },

    closeDialog() {
      this.$emit("closeCreateDialog");

      this.appeal_data.id = null;
      this.appeal_data.title = "";
      this.appeal_data.description = ""; 
      this.appeal_data.solutions = ""; 
      this.appeal_data.expected_result = ""; 
      this.appeal_data.appeal_type = {};
      this.appeal_data.appeal_subtype = {};
    },
  },
  computed: {
    ...mapGetters(["APPEAL_SUBTYPES", "APPEAL_TYPES", "IS_SENDING_APPEAL"]),
  },
  created() {
  },
  watch: {
    "appeal_data.appeal_type"() {
      this.appeal_subtypes = this.APPEAL_SUBTYPES.filter(
        (el) => el.appeal_type_id == this.appeal_data.appeal_type.id
      );
    },
    dialog() {
      if (this.dialog) {
        this.GET_APPEAL_TYPES_FROM_API();
        if (this.dialogData) {
          this.appeal_data = this.dialogData;
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