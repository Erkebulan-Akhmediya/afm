<template>
  <div>
    <h1>Справка о прохождении тестов</h1>
    <v-btn 
      class="ma-2" 
      @click="createReference" 
      outlined 
      color="blue"
    >
      <v-icon>mdi-file-document-outline</v-icon>
      Сформировать
    </v-btn>
  </div>
</template>

<script>
export default {
  methods: {
    async createReference() {
      try {
        const res = await this.axios.post(
          '/api/1.0/reference/pdf_summary',
          {
            work_place_type_report_code: 'pdf_workplace_base',
          },
        );

        let binaryString = window.atob(res.data);
        let binaryLen = binaryString.length;
        let bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
          let ascii = binaryString.charCodeAt(i);
          bytes[i] = ascii;
        }
        let blob = new Blob([bytes], { type: 'application/pdf' });
        let url =  URL.createObjectURL(blob);
        window.open(url, '_blank');

      } catch(err) {
        console.log('erroR in createReference', err);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: 'error',
          title: 'Убедитесь в том, что вы прошли все тесты, либо дождитесь результатов',
        });
      }
    },
  },
  props: ["employee"],
};
</script>