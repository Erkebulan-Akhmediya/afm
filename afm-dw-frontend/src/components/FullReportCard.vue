<template>
  <v-card >
    <v-card-title>
      {{ item.report_name }} за {{ item.period }}
    </v-card-title>
    <v-card-text>
      <v-simple-table dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left"> Организация </th>
              <th class="text-left"> Статус </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, key) in report"
              :key="key"
            >
              <td style="padding: 5px">{{ item.organization }}</td>
              <td style="padding: 5px">
                <v-chip color="red" v-if="item.ri_filled == 0">
                  Не заполнено
                </v-chip>
                <v-chip color="orange" v-else-if="item.ri_filled != item.ri_count">
                  Частично заполнено
                </v-chip>
                <v-chip color="green" v-else>
                  Заполнено
                </v-chip>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      loading: false,
      report: [],
    }
  },
  methods: {
    async loadData () {
      this.loading = true
      try{
        let {data} = await this.axios.get(`/api/1.0/report-form-by-department`, {params: {period_id: this.period_id, report_form_id: this.report_form_id}})
        this.report = data
      }catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
  },
  watch: {
    async period_id() {
      await this.loadData()
    },
    async report_form_id() {
      await this.loadData()
    }
  },
  async created() {
    await this.loadData()
  },
  props: ["period_id", "report_form_id", "item"]
}
</script>