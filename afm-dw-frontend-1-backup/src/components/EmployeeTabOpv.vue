<template>
  <div>
    <v-row class="mb-5">
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
                !opvDate || !opvDate.length
                  ? `Выберите период`
                  : opvDate.length == 1 || opvDate[0] == opvDate[1]
                  ? `Период: ${moment(opvDate[0], "YYYY-MM").format(
                      "MMMM YYYY"
                    )}`
                  : `Дата: с ${moment(opvDate[0], "YYYY-MM").format(
                      "MMMM YYYY"
                    )} по 
                                    ${moment(opvDate[1], "YYYY-MM").format(
                                      "MMMM YYYY"
                                    )}`
              }}
            </v-btn>
          </template>
          <v-date-picker
            v-model="opvDate"
            type="month"
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
          @click="getOpvList(opvDate)"
        >
          Запросить
        </v-btn>
        <v-btn class="mr-4 btnStyled" color="#4094F7" @click="clearOpvList">
          Очистить
        </v-btn>
      </v-col>
    </v-row>
    <h2 v-if="opvData[0]" style="font-weight: bold;">
      Сальдо на начало периода: {{ digit(opvData[0].balance_start) }}
    </h2>
    <v-row>
      <v-col>
        <table
          class="opv"
          v-if="opvData.length"
          style="border-collapse: collapse; margin-top: 10px; width:100%;"
        >
          <tr class="greenBack">
            <td rowspan="2">Месяц</td>
            <td rowspan="2">Сальдо на начало месяца</td>
            <td rowspan="2">Удержано за месяц</td>
            <td colspan="2">Перечислено</td>
            <td rowspan="2">Сальдо на конец месяца</td>
          </tr>
          <tr class="greenBack">
            <td>№дата счета к оплате</td>
            <td>Сумма</td>
          </tr>
          <tr class="greenBack">
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td>5</td>
            <td>6</td>
          </tr>
          <tr
            v-for="opv in opvData"
            :key="opv.id"
            style="margin-bottom: 20px; border-bottom: 1px solid gray; padding-bottom: 20px"
          >
            <td>{{ moment(opv.period, "YYYY-MM").format("MMMM YYYY") }}</td>
            <td>{{ digit(opv.balance_start) }}</td>
            <td>{{ digit(opv.subtract) }}</td>
            <td>{{ opv.document }}</td>
            <td>{{ digit(opv.sum) }}</td>
            <td>{{ digit(opv.balance_end) }}</td>
          </tr>
          <tr class="greenBack">
            <td colspan="2">Итого</td>
            <td>{{ digit(calcSumm(opvData, 'subtract').toFixed(2) + '') }}</td>
            <td></td>
            <td>{{ digit(calcSumm(opvData, 'sum').toFixed(2) + '') }}</td>
            <td></td>
          </tr>
          <tr>
            <td colspan="6" style="font-weight: bold;">
              Сальдо на конец периода: {{ opvData.at(-1).balance_end }}
            </td>
          </tr>
        </table>
      </v-col>
    </v-row>
    <v-progress-circular
      style="width: 100%;"
      v-show="loader"
      indeterminate
      size="64"
    ></v-progress-circular>
  </div>
</template>
<script>
import moment from "moment";

export default {
  data() {
    return {
      activePicker: null,
      opvDate: [],
      menu: false,
      dialog: false,
      moment,
      loader: false,

      requestModalType: [],
      requestModalSubType: [],

      dateToPickerState: false,
      dateFromPickerState: false,

      requestData: {
        dateTo: new Date().toISOString().substr(0, 10),
        dateFrom: new Date().toISOString().substr(0, 10),
        type: "",
        subType: "",
        comment: "",
        employeeId: this.$route.params.id,
      },
      headersRequest: [
        { text: "Номер", value: "id", sortable: false },
        { text: "Тип", value: "type" },
        { text: "Дата с", value: "date_from" },
        { text: "Дата по", value: "date_to" },
        { text: "Подтип", value: "sub_type" },
        { text: "Комментарий", value: "comment" },
        { text: "Статус", value: "status" },
      ],
      headersRequestApprove: [
        { text: "Номер", value: "id" },
        { text: "Согласующий", value: "approve" },
        { text: "Дата согласования", value: "approve_date" },
        { text: "Комментарий", value: "comment" },
        { text: "Статус", value: "status" },
      ],
      request: [],
      request_approve: [],

      opvData: [],
    };
  },
  watch: {
    menu() {
      if (this.opvDate && this.opvDate.length == 2) {
        this.opvDate.sort((a, b) => {
          return moment(moment(a, "YYYY-MM").format()).isAfter(
            moment(b, "YYYY-MM").format()
          )
            ? 1
            : -1;
        });
      }
    },
  },
  created() {
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    async getOpvList(period) {
      if (!period || !period.length) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Выберите период`,
        });
      }
      this.loader = true;
      if (period.length == 1) {
        period.push(period[0]);
      }
      let start_month = moment(period[0], "YYYY-MM").format("MM");
      let start_year = moment(period[0], "YYYY-MM").format("YYYY");
      let end_month = moment(period[1], "YYYY-MM").format("MM");
      let end_year = moment(period[1], "YYYY-MM").format("YYYY");

      let params = {
        periodstart: `${start_year}-${start_month}`,
        periodend: `${end_year}-${end_month}`,
        employee_id: this.employee.id,
        timez: - new Date().getTimezoneOffset()
      };
      let opvData = await this.axios
        .get(`/api/1.0/employee/:iin/opvlist`, {
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
      this.opvData = opvData.data?.result || [];
      this.loader = false;
    },
    clearOpvList() {
      this.opvData = [];
      this.opvDate = null;
    },

    digit(string) {
      return string.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ");
    },

    calcSumm(arr, prop) {
      return arr.reduce((acc, item) => {
        return acc + (item[prop] - 0);
      }, 0);
    },

    isShowLoader(data) {
      this.$emit("isShowLoader", data);
    },
  },
  props: ["employee"],
};
</script>