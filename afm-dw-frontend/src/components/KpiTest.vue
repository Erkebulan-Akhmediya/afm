<template>
  <div>
      <div style="display: flex; align-items: center;" class="mb-7">
         <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="true"
            transition="scale-transition"
            min-width="auto"
            >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    style="height: 70px"
                    outlined
                    class="mr-2 btnStyled"
                    color="#5787A4"
                    v-bind="attrs"
                    v-on="on"
                >
                    <v-icon small class="mr-3">
                    mdi-calendar
                    </v-icon>
                    {{opvDate ? $moment(opvDate).format('MMMM YYYY') : 'Фильтр по периоду'}}
                </v-btn>
            </template>
            <v-date-picker
                v-model="opvDate"
                type="month"
                show-current
                :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                min="1950-01-01"
                @change="save"
            ></v-date-picker>
          </v-menu>
          <v-select
          style="max-width: 400px;"
          class=" mr-2"
          v-model="filterTest"
          :items="filterTestItems"
          hide-details
          chips
          label="Фильтр по тесту"
          multiple
          outlined
        ></v-select>
        <v-btn
          outlined
          class="mb-4 mr-2 btnStyled"
          color="#5787A4"
          @click="getTestRating()"
      >
          <v-icon small class="mr-3">
          mdi-filter
          </v-icon>
          Применить фильтр
      </v-btn>
      <v-btn
          outlined
          class="mb-4 btnStyled"
          color="#5787A4"
          @click="clearFilter()"
      >
          <v-icon small class="mr-3">
          mdi-close-circle-outline
          </v-icon>
          Сбросить фильтры
      </v-btn>
    </div>
    <v-carousel v-model="model" 
    hide-delimiters
      height="auto"
      :hide-delimiter-background="true"
    >
      <v-carousel-item style="width: 93%; margin: auto;">
        <p class="text-h5">Рейтинг тестов</p> 
        
          
        <!-- <v-btn @click="changeOption">{{option === mapOption ? 'Вид графика': 'Вид карты'}}</v-btn> -->
        <div :style="`min-width: 100%; min-height: ${dat.length * 30}px;`">
          <v-chart ref="chart" style=" min-height: 800px;" class="chart" :option="option" />

        </div>
      </v-carousel-item>
      
      <v-carousel-item style="width: 93%; margin: auto;">
        <p class="text-h5">Рейтинг уровня знаний</p> 
        
          
        <!-- <v-btn @click="changeOption">{{option === mapOption ? 'Вид графика': 'Вид карты'}}</v-btn> -->
        <div :style="`min-width: 100%; min-height: ${dat.length * 30}px;`">
          <v-chart ref="chart" style=" min-height: 800px;" class="chart" :option="option" />

        </div>
      </v-carousel-item>
    </v-carousel>
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
        height: 400,
        grid: {
          left: '10%',
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
            lineHeight: 55,
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
      filterTestItems: [],
      filterTest: [],
    };
  },
  methods: {
    async save (date) {
        this.$refs.menu.save(date)
        this.filterTest = []
        await this.getTestRating()
    },

    clearFilter() {
        this.$refs.menu.save('')
        this.opvDate = ''
        this.filterTest = []
        this.getTestRating()
    },

    async changeOption() {
    },

    parseDataForSelect(data) {
        return data.reduce((acc, item) => {
            acc.push({
                text: item.name,
                value: item.id
            })
            return acc
        }, [])
    },

    async getTestRating() {
      let params = {}
      if(this.opvDate) {
        params.period = this.opvDate
      }

      if(this.filterTest.length) {
        params.test_id = this.filterTest.join(',')
      }

            let url = this.model == 0 ? '/api/1.0/test-rating' : '/api/1.0/know-level'
      const {data} = await this.axios.get(url, {params})
      this.dat = this.parseDataChart(data.rating)
      this.filterTestItems = this.parseDataForSelect(data.tests)

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
          value: item.round || item.knowledge_level
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

    this.$refs.chart.setOption(this.option);
  },
  watch : {
    model() {
      this.clearFilter()
      this.getTestRating()
    }
  }
};
</script><style scoped>
.chart {
  height: 80vh;
}
</style>