<template>
  <div class="mainCheckDocPage">
    <div style="padding-left: 10px; padding-right: 10px">
      <v-row style="border-bottom: 2px solid #ebeff2; margin-bottom: 10px;">
        <v-col cols="12" class="d-flex justify-space-between ma-0 pa-0 pt-3 pb-1">
          <span style="font-weight: bold; font-size: 1rem;">Сервисы</span>
        </v-col>
      </v-row>
    </div>
    <v-row>
      <v-col cols="12">
        <v-btn color="success" outlined disabled block>
          <v-icon class="mr-2"> mdi-checkbox-marked-outline </v-icon>
          Проверка документов
        </v-btn>
        <v-btn color="success" outlined block class="mt-2" @click="createAppealDialog=true">
          <v-icon class="mr-2"> mdi-lightbulb-outline </v-icon>
          Внести предложение
        </v-btn>
      </v-col>
    </v-row>
    <appeal-create-form
      :dialog="createAppealDialog"
      @closeCreateDialog="createAppealDialog = false"
    />
  </div>
</template>
<script>
import AppealCreateForm from "@/components/appeal/AppealCreateForm.vue";

export default {
  components: {
    AppealCreateForm
  },
  data: () => ({
    createAppealDialog: false
  }),
  computed: {
  },
  methods: {
  },
  watch: {
  },
  created() {
  },
};
</script><style scoped lang="scss">
  .mainCheckDocPage {
    background: #fff; 
    
    padding-top: 10px;
    padding-right: 20px;
    padding-bottom: 20px;
    padding-left: 20px;

    border-radius: 10px;
  }

  .eventCard {
    display: block;
    padding-top: 0px;
    padding-right: 25px;
    padding-bottom: 0px;
    padding-left: 5px;
  }
  </style>