<template>
  <div class="d-flex align-start pb-4">
    <v-select
      :items="report_forms"
      item-text="name"
      item-value="id"
      style="max-width: 200px;"
      label="Форма отчетности"
      class="ml-4 mt-0"
      v-model="report_form_filter"
      hide-details
    >
    </v-select>
    <v-select
      :items="organizations"
      item-text="name"
      item-value="id"
      style="max-width: 200px;"
      label="Подразделение"
      class="ml-4 mt-0"
      v-model="der_filter"
      hide-details
    >
    </v-select>
    <v-btn
      height="55px"
      class="ml-4"
      @click="clearFilter"
      text
      outlined
    >
    Сброс
    </v-btn>
  </div>
</template>
<script>
export default {
  data: ()=>{
    return {
      organizations: [],
      report_forms: []
    }
  },
  computed: {
    der_filter: {
      set(value) {
        this.$store.commit('der_filter', value)
      },
      get() {
        return this.$store.getters.der_filter
      }
    },
    report_form_filter: {
      set(value) {
        this.$store.commit('report_form_filter', value)
      },
      get() {
        return this.$store.getters.report_form_filter
      }
    },
  },
  async mounted() {
    let {data: organizations} = await this.axios.get(`/api/1.0/lov/hr.organization`) 
    this.organizations = organizations

    let {data: report_forms} = await this.axios.get(`/api/1.0/lov/ref.report_form`) 
    this.report_forms = report_forms
  },
  methods: {
    clearFilter() {
      this.der_filter = null
      this.report_form_filter = null
    }
  },
}
</script>