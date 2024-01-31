<template>
  <div>
    <br/>
    <v-row>
      <v-col cols="8">
        <strong>Документы {{isApplication ? 'заявления' : 'заявки'}}</strong>
      </v-col>
      <v-col cols="4" class="d-flex justify-end">
        <!--:disabled="currentData.request_type_id != 9"-->
        <v-file-input 
          :change="fileUpload(currentData.id)"
          :label="$t('globalWords.addFile')"
          dense
          outlined
          v-model="file"
          disabled
        >
        </v-file-input>
      </v-col>
    </v-row>
    <v-data-table
      :no-data-text="$t('passRequest.fileListIsEmpty')"
      :headers="fileHeaders"
      :items="fileList"
      dense
      :loading="loader"
      class="elevation-1"
      :items-per-page="10"
    >
      <template v-slot:[`item.name`]="{ item }">
        <a
          @click="downloadFile(item)"
        >
          {{ item.name }}
        </a>
      </template>
      <template v-slot:[`item.create_date`]="{ item }">
        {{$moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          class="ma-2"
          small
          color="red"
          @click="deleteFile(item)"
          disabled
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      loader: false,
      fileHeaders: [
        { text: '№', value: 'id' },
        { text: this.$t('globalWords.name'), value: 'name' },
        { text: this.$t('globalWords.creator'), value: 'create_user' },
        { text: this.$t('passRequest.addingDate'), value: 'create_date' },
        { text: '', value: 'action' }
      ],
      file: null,
      fileList: [],
    }
  },
  methods: {
    fileUpload: async function(parentId) {
      if(this.file) {
        const form = new FormData();
        form.append("lang", this.$i18n.locale);
        form.append("user_id", this.$userData.fullData.username);
        form.append("file", this.file);
        form.append("fileType", "request");
        form.append("file_type_id", 11);
        form.append("pr_id", parentId);

        await this.axios.post(`/api/1.0/pass-request-file/`, form);
        this.file = null;

                await this.getObjectFileList()
      }
    },
    downloadFile(item) {
      let config = {
        responseType: "blob",
        params: {
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
    async deleteFile(item) {
      try{
        await this.axios.put(`/api/1.0/file-disable/${item.id}`, {is_active: false})
        await this.getObjectFileList()

        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'success',
          title: this.$t('globalWords.deleted')  
        })
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: this.$t('globalWords.deletingError')  
        })
      }
    },

    async getObjectFileList() {
      let data = await this.axios.get(`/api/1.0/file-api`, {params: {object_id: this.currentData.id, object_type_id: 11}})
      this.fileList = data.data
    },
  },
  watch: {
    async currentData() {
      if (this.currentData.request_type_id == 9) {
        await this.getObjectFileList()
      } else {
        this.fileList = []
      }
    }
  },
  props: ['currentData','isApplication']
}
</script>