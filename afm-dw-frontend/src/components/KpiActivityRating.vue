<template>
  <div>
      <v-row>
        <v-col style="display: flex; align-items: center;">
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
                    ? `Период: ${$moment(dateVisits[0], "YYYY-MM-DD").format(
                        "D MMMM YYYY"
                      )}`
                    : `Дата: с ${$moment(dateVisits[0], "YYYY-MM-DD").format(
                        "D MMMM YYYY"
                      )} по 
                                      ${$moment(
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
          <v-btn
              outlined
              class="btnStyled"
              color="#5787A4"
              @click="clearFilter()"
          >
              <v-icon small class="mr-3">
              mdi-close-circle-outline
              </v-icon>
              Сбросить
          </v-btn>
        </v-col>
      </v-row>
        
        
        <!-- <v-btn @click="changeOption">{{option === mapOption ? 'Вид графика': 'Вид карты'}}</v-btn> -->
        <div :style="`min-width: 100%; min-height: ${dat.length * 30}px;`">
          <v-chart ref="chart" style=" min-height: 800px;" class="chart" :option="option" />

        </div>
  </div>
</template>
<script>
import * as echarts from "echarts/core";
import {
  VisualMapComponent,
  GeoComponent,
  TitleComponent,
} from "echarts/components";
import { MapChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TitleComponent,
  VisualMapComponent,
  GeoComponent,
  MapChart,
  CanvasRenderer,
  UniversalTransition,
]);
export default {
  data: function() {
    return {
      menu: false,
      opvDate: '',
      model: 0,
      dat: [
      ],
      option: {},
      mapOption: {
        visualMap: {
          left: "right",
          precision:2,
          min: -9.55,
          max: 57.97,
          inRange: {
            color: ['red', 'orange', 'green', 'green', 'green']
          },
          text: ["Рейтинг выше", "Рейтинг ниже"],
          calculable: true,
          label: {
            show: true,
          },
        },
        series: [

          {
          height: `100%`,
            id: "Kaz",
            type: "map",
            map: "Kazakhstan",
            animationDurationUpdate: 1000,
            universalTransition: true,
            color: [
              "#313695",
              "#4575b4",
              "#74add1",
              "#abd9e9",
              "#e0f3f8",
              "#ffffbf",
              "#fee090",
              "#fdae61",
              "#f46d43",
              "#d73027",
              "#a50026",
            ],
            data: [],

                        itemStyle: {
              borderColor: "#18073A",
              borderWidth: 2,
              borderJoin: "round",
            },
            label: {
              show: true,
              color: "#fff",
              fontWeight: "bold",
              textBorderWidth: 2,
              textBorderColor: "#000",
              formatter: "{b}: {@score}",
            },

            emphasis: {
              itemStyle: {
                borderWidth: 2,
                borderColor: "#535353",
                areaColor: "#349FD7",
              },
              label: {
                show: true,
                color: "#fff",
                fontWeight: "bold",
                textBorderWidth: 2,
                textBorderColor: "#000",
                fontSize: 20,
              },
            },

            select: {
              label: {
                show: true,
                color: "#fff",
                fontWeight: "bold",
                textBorderWidth: 2,
                textBorderColor: "#000",
              },
              itemStyle: {
                areaColor: "#349FD7",
              },
            },
          },
        ],
      },
      barOption: {
        grid: {
          left: '5%',
          containLabel: true
        },
        title: {
          show: true,
        },
        xAxis: {
          name: "Рейтинг",
          nameLocation: "center",
          scale: true,
          nameTextStyle: {
            fontWeight: `bold`,
            verticalAlign: "top",
          },
          type: "value",
          min: 0,
        },
        yAxis: {
          axisLine: {
            onZero: true,
          },
          axisLabel: {
          },
          axisTick: {
          },
          type: "category",
          data: [],
          offset: 10,
          inverse: true,
        },
        animationDurationUpdate: 1000,
        position:[`300`, `500`],
        series: 
    {
          type: "bar",          
          id: "effect",
          data: [],
          colorBy: ["#2196f3"],
          universalTransition: true,
          label: {
            show: true,
            position: [`102%`, `45%`],
          },
        },
      },

      ratingTest: {},
      dateVisits: [],
      activePicker: null,
      date_from: '',
      date_to: '',
    };
  },
  methods: {
    clearFilter() {
      this.dateVisits = []
      this.date_from = ''
      this.date_to = ''
      this.getTestRating()
    },

    async save (date) {
        this.$refs.menu.save(date)
        let dates = this.dateVisits.sort((a, b) => {
          return this.$moment(this.$moment(a, "YYYY-MM-DD").format()).isAfter(
            this.$moment(b, "YYYY-MM-DD").format()
          )
            ? 1
            : -1;
        });

        this.date_from = dates[0]
        this.date_to = dates[1]

        await this.getTestRating(date)
    },

    async changeOption() {
    },

    async getTestRating() {
      let params = {}
      if(this.date_from) {
        params.date_from = this.date_from
      }
      if(this.date_to) {
        params.date_to = this.date_to
      }
      const {data} = await this.axios.get('/api/1.0/rating-active', {params})
      this.dat = this.parseDataChart(data)

      let sortData = this.dat.sort((a, b) => {
        return a.value - b.value;
      });

      this.barOption.yAxis.data = sortData.map(function(item) {
        return item.name;
      });

      this.barOption.series.data = sortData.map(function(item) {
        return item.value;
      });
    },

    parseDataChart(data) {
      return data.map(item => {
        return {
          name: item.organization,
          value: item.countsum
        }
      })
    }
  },
  async mounted() {
    await this.getTestRating()
    let sortData = this.dat.sort((a, b) => {
      return a.value - b.value;
    });

    this.barOption.yAxis.data = sortData.map(function(item) {
      return item.name;
    });

    this.mapOption.series.map(function(item) {
        item.data = sortData;
    })

    this.barOption.series.data = sortData.map(function(item) {
      return item.value;
    });

    this.barOption.series.color = sortData.map(() => {
      return "#2196f3";
    });
    this.option = this.barOption;
    if(this.$refs.chart) {
      this.$refs.chart.setOption(this.option);
    }
  },

    watch: {
    menu() {
      if (this.dateVisits && this.dateVisits.length == 2) {
        this.dateVisits.sort((a, b) => {
          return this.$moment(this.$moment(a, "YYYY-MM-DD").format()).isAfter(
            this.$moment(b, "YYYY-MM-DD").format()
          )
            ? 1
            : -1;
        });
      }
    }
  },
};
</script><style scoped>
.chart {
  height: 80vh;
}
</style>