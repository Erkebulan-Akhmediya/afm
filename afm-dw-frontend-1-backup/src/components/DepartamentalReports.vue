<template>
  <v-card flat> 
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Поиск"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-card-text>
      <v-data-table
        :items="items"
        :headers="headers"
        :search="search"
      >
        <template v-slot:[`item.status`]="{ item }">
          <v-chip color="green" v-if="item.count_rfa == item.count_instance">
            Заполнено
          </v-chip>
          <v-chip color="orange" v-else>
            Частично заполнено
          </v-chip>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-btn
            :disables="true"
            icon
            @click="downloadReport(item)"
            >
            <v-icon color="primary">
              mdi-download
            </v-icon>
          </v-btn>
          
          <v-btn 
            @click="selectReport(item)"
            icon
            > 
            <v-icon color="primary">
              mdi-eye
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
    <v-dialog v-model="dialog" width="800px">
      <v-card>
        <v-card-title>
        </v-card-title>
        <v-card-text>

          <FullReportCard :item="selectedItem" :period_id="selectedItem.period_id" :report_form_id="selectedItem.report_form_id">
          </FullReportCard>

        </v-card-text>
        <v-card-actions>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>

import FullReportCard from "@/components/FullReportCard.vue";

export default {
  components: {
    FullReportCard
  },
  data() {
    return {
      search: '',
      dialog: false,
      selectedItem: {},
      items: [],
      headers: [
        {
          text: "Наименование",
          value: "report_name",
        },
        {
          text: "Период",
          value: "period",
        },
        {
          text: "Статус",
          value: "status",
        },
        {
          text: "",
          value: "action",
        },
      ],
    }
  },

  methods: {
    async downloadReport(item) {
      let response = await this.axios.get(`/api/1.0/report-full/download/:period_id/:report_form_id`, {responseType: 'blob', localParams:{period_id: item.period_id, report_form_id: item.report_form_id}})
      let blob = new Blob([response.data], { type: 'application/xls' })
      let disposition = response.headers['content-disposition']
      //eslint-disable-next-line
      const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i
      let filename = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1])
      this.saveData(blob, filename)
    },
    saveData (data, fileName) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        let url = window.URL.createObjectURL(data);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    },
    selectReport(item) {
      this.selectedItem = item
      this.dialog = true
    }
  },

  async created() {
    let {data} = await this.axios.get(`/api/1.0/report-form-exist`)
    this.items = data
  },

}
</script>