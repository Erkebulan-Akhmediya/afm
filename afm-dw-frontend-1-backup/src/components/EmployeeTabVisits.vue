<template>
  <div class="visits">
    <v-row>
      <v-col cols="4">
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              outlined
              class="mr-4 btnStyled"
              color="#5787A4"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon small class="mr-3">
                mdi-calendar
              </v-icon>
              {{
                !dateVisits || !dateVisits.length
                  ? `Выберите период`
                  : dateVisits.length == 1 || dateVisits[0] == dateVisits[1]
                  ? `Период: ${moment(dateVisits[0], "YYYY-MM-DD").format(
                      "D MMMM YYYY"
                    )}`
                  : `Дата: с ${moment(dateVisits[0], "YYYY-MM-DD").format(
                      "D MMMM YYYY"
                    )} по 
                                    ${moment(
                                      dateVisits[1],
                                      "YYYY-MM-DD"
                                    ).format("D MMMM YYYY")}`
              }}
            </v-btn>
          </template>
          <v-date-picker
            v-model="dateVisits"
            type="date"
            range
            show-current
            :active-picker.sync="activePicker"
            :max="
              new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .substr(0, 10)
            "
            min="1950-01-01"
            @change="save"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="1"></v-col>
      <v-col cols="12" lg="4">
        <v-btn
          class="mr-4 btnStyled"
          color="#4094F7"
          @click="getAcsData(dateVisits)"
        >
          Запросить
        </v-btn>
        <v-btn class="mr-4 btnStyled" color="#4094F7" @click="clearSalaryList">
          Очистить
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
          <div style="display: flex; padding-top: 20px;">
        <v-data-table
          :headers="headers"
          :items="visitList"
          :items-per-page="10"
          class="clickableTable elevation-1"
          :no-data-text="'Нет данных о входе'"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
        >
          <template v-slot:[`item.dateFormat`]="{ item }">
            <span>{{ moment(item.date).format("DD.MM.YYYY") }} - </span>
            <span>{{ moment(item.date).format("HH:mm:ss") }}</span>
          </template>
          <template v-slot:[`item.entryFormat`]="{ item }">
            <span>{{JSON.parse(item.entry) ? 'Вход' : 'Выход'}}</span>
          </template>
        </v-data-table>

          </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import moment from "moment";
export default {
  data: function() {
    return {
      activePicker: null,
      dateVisits: [moment().format("YYYY-MM-DD")],
      menu: false,
      dialog: false,
      moment,
      loader: false,

      visitList: [],
      headers: [
        { text: "Дата", value: "dateFormat" },
        { text: "Тип", value: "entryFormat" },
      ],
    };
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },

    async getAcsData(period) {
      if (!period || !period.length) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Выберите период`,
        });
      }

      let params = {
        periodstart: period[0],
        periodend: period[1] || period[0],
        employee_id: this.employee.id,
        timez: - new Date().getTimezoneOffset()
      };

      try {
        let { data } = await this.axios
          .get(`/api/1.0/employee/:iin/acsdata`, {
            localParams: { iin: this.employee.identification_number },
            params,
          })
          .catch((err) => {
            this.loader = false;
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.message || err.ERR_MSG || err}`,
            });
          });
          data.result = data.result.map(item => {
            item.entry = JSON.parse(item.entry)
            return item
          })
        this.visitList = data.result;
        this.visitList.sort((a, b) => {
          return moment(a).isAfter(b) ? 1 : -1;
        });
      } catch (error) {
        console.log(error);
      }
    },

    clearSalaryList() {
      this.visitList = [];
      this.dateVisits = null;
    },
  },

  watch: {
    menu() {
      // чтоб месяца всегда были по порядку
      if (this.dateVisits && this.dateVisits.length == 2) {
        this.dateVisits.sort((a, b) => {
          return moment(moment(a, "YYYY-MM-DD").format()).isAfter(
            moment(b, "YYYY-MM-DD").format()
          )
            ? 1
            : -1;
        });
      }
    },
    employee() {
      this.visitList = []
    }
  },

  props: ["employee"],

  mounted() {
  },
};
</script>
