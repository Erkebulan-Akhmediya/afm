<template>
  <v-card outlined class="px-3">
    <v-btn @click="changeOption" class="mt-3">
    {{grafficType == 'Map' ? 'Вид карты': 'Вид показателей'}}
    </v-btn>
    
    <div v-if="grafficType == 'Map'">
      <v-row no-gutters >
        <v-col cols="12" sm="9">
          
          <v-chart autoresize @click="showDetails" ref="chart" class="chart" :option="mapIndicatorOption" max-width="800px"/>
        </v-col>
        <v-col cols="12" sm="3" >
          <v-card flat>
            <v-simple-table dense class="py-15 ml-3">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      {{configCode == 'afm' ? 'ДЭР' : 'Управление'}}
                    </th>
                    <th class="text-left">
                      Баллы
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in mapIndicatorDepGroupList"
                    :key="item.geo_code"
                  >
                    <td>{{ item.ratingNum }}{{'. '}}{{ item.name }}</td>
                    <!--240423 Костыль для минусовых значении для отображения-->
                    <td v-bind:style="{ 'background-color':item.color_class }">{{ item.value.toFixed(3).toString().replace('-', '') }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="selectedDepartment">
        <v-col class="text-center">
          <h1 style="font-size: 1.5rem;"> {{tabName}} {{ selectedDepartment }}</h1>
        </v-col>
      </v-row>
      <br/>
      <v-row no-gutters v-if="selectedDepartment">
        <v-col cols="12" sm="4">
          <v-card
            class="mx-auto good"
            max-width="450"
            flat
          >
            <v-list rounded>
              <!--240423 Костыль для минусовых значении для отображения-->
              <v-subheader><span>Положительный</span> <v-spacer></v-spacer><b><span>{{this.positiveMapIndicatorSum.toFixed(3).toString().replace('-', '')}}</span></b></v-subheader>

              <v-list-item v-for="(item, i) in this.positiveMapIndicatorList" :key="i">
                <v-list-item-content v-text="item.indicator_name">
                  <!-- <v-list-item-title v-text="item.indicator_name"></v-list-item-title> -->
                </v-list-item-content>
                  <v-list-item-icon>
                    <!--240423 Костыль для минусовых значении для отображения-->
                  <v-chip >{{item.score.toFixed(3).toString().replace('-', '')}}</v-chip>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" >
          <v-card
            class="mx-auto bad"
            max-width="450"
            flat
          >
            <v-list rounded>
              <!--240423 Костыль для минусовых значении для отображения-->
              <v-subheader><span>Отрицательный</span> <v-spacer></v-spacer><b><span>{{this.negativeMapIndicatorSum.toFixed(3).toString().replace('-', '')}}</span></b></v-subheader>
                <v-list-item v-for="(item, i) in this.negativeMapIndicatorList" :key="i">
                  <v-list-item-content v-text="item.indicator_name">
                    <!-- <v-list-item-title v-text="item.indicator_name"></v-list-item-title> -->
                  </v-list-item-content>
                    <v-list-item-icon>
                      <!--240423 Костыль для минусовых значении для отображения-->
                    <v-chip >{{item.score.toFixed(3).toString().replace('-', '')}}</v-chip>
                  </v-list-item-icon>
                </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" >
          <v-card
            class="mx-auto neutral"
            max-width="450"
            flat
          >
            <v-list rounded>
              <!--240423 Костыль для минусовых значении для отображения-->
              <v-subheader><span>Cмешанный</span> <v-spacer></v-spacer><b><span>{{this.hybridMapIndicatorSum.toFixed(3).toString().replace('-', '')}}</span></b></v-subheader>
                <v-list-item v-for="(item, i) in this.hybridMapIndicatorList" :key="i">
                  <v-list-item-content v-text="item.indicator_name">
                    <!-- <v-list-item-title v-text="item.name"></v-list-item-title> -->
                  </v-list-item-content>
                    <v-list-item-icon>
                      <!--240423 Костыль для минусовых значении для отображения-->
                    <v-chip >{{item.score.toFixed(3).toString().replace('-', '')}}</v-chip>
                  </v-list-item-icon>
                </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="grafficType == 'Indicator'" class="mt-5">
      <v-row no-gutters>
        <v-col cols="12" sm="4">
          <v-card
            class="mx-auto good"
            max-width="450"
            flat
          >
            <v-list rounded>
              <!--240423 Костыль для минусовых значении для отображения-->
              <v-subheader><span>Положительный</span> <v-spacer></v-spacer><b><span>{{this.positiveIndicatorMapSum.toFixed(3).toString().replace('-', '')}}</span></b></v-subheader>

              <v-list-item v-for="(item, i) in this.positiveIndicatorMapList" :key="i" @click="showIndicatorMapListener(item.indicator_name, 'positive')">
                <v-list-item-content v-text="item.indicator_name">
                  <!-- <v-list-item-title v-text="item.indicator_name"></v-list-item-title> -->
                </v-list-item-content>
                  <v-list-item-icon>
                    <!--240423 Костыль для минусовых значении для отображения-->
                  <v-chip >{{item.score.toFixed(3).toString().replace('-', '')}}</v-chip>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" >
          <v-card
            class="mx-auto bad"
            max-width="450"
            flat
          >
            <v-list rounded>
              <!--240423 Костыль для минусовых значении для отображения-->
              <v-subheader><span>Отрицательный</span> <v-spacer></v-spacer><b><span>{{this.negativeIndicatorMapSum.toFixed(3).toString().replace('-', '')}}</span></b></v-subheader>
                <v-list-item v-for="(item, i) in this.negativeIndicatorMapList" :key="i" @click="showIndicatorMapListener(item.indicator_name, 'negative')">
                  <v-list-item-content v-text="item.indicator_name">
                    <!-- <v-list-item-title v-text="item.indicator_name"></v-list-item-title> -->
                  </v-list-item-content>
                    <v-list-item-icon>
                      <!--240423 Костыль для минусовых значении для отображения-->
                    <v-chip >{{item.score.toFixed(3).toString().replace('-', '')}}</v-chip>
                  </v-list-item-icon>
                </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" >
          <v-card
            class="mx-auto neutral"
            max-width="450"
            flat
          >
            <v-list rounded>
              <!--240423 Костыль для минусовых значении для отображения-->
              <v-subheader><span>Cмешанный</span> <v-spacer></v-spacer><b><span>{{this.hybridIndicatorMapSum.toFixed(3).toString().replace('-', '')}}</span></b></v-subheader>
                <v-list-item v-for="(item, i) in this.hybridIndicatorMapList" :key="i" @click="showIndicatorMapListener(item.indicator_name, 'hybrid')">
                  <v-list-item-content v-text="item.indicator_name">
                    <!-- <v-list-item-title v-text="item.name"></v-list-item-title> -->
                  </v-list-item-content>
                    <v-list-item-icon>
                    <!--240423 Костыль для минусовых значении для отображения-->
                    <v-chip >{{item.score.toFixed(3).toString().replace('-', '')}}</v-chip>
                  </v-list-item-icon>
                </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
      <br/>
      <v-row v-if="selectedIndicatorMap_IndName">
        <v-col class="text-center">
          <h1 style="font-size: 1.5rem;"> {{tabName}} <br> по показателю {{ selectedIndicatorMap_IndName }}</h1>
        </v-col>
      </v-row>

      <v-row no-gutters v-if="selectedIndicatorMap_IndName">
        <v-col cols="12" sm="9">
          
          <v-chart ref="chart" class="chart" :option="indicatorMapOption" max-width="800px"/>
        </v-col>
        <v-col cols="12" sm="3" >
          <v-card flat>
            <v-simple-table dense class="py-15 ml-3">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      {{configCode == 'afm' ? 'ДЭР' : 'Управление'}}
                    </th>
                    <th class="text-left">
                      Баллы
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in indicatorMapDepGroupList"
                    :key="item.geo_code"
                  >
                    <td>{{ item.ratingNum }}{{'. '}}{{ item.name }}</td>
                    <!--240423 Костыль для минусовых значении для отображения-->
                    <td v-bind:style="{ 'background-color':item.color_class }">{{ item.value.toFixed(3).toString().replace('-', '') }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-card>
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
import './js/kazakhstan.js';

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
      configCode: '',

      tabName: "",
      tabReportCode: "",
      grafficType: "map",

      selectedGEOCode: "",
      selectedDepartment: "",
      selectedIndicatorMap_IndName: "",
      selectedIndicatorMap_IndType: "", 

            clearALLRatingData: [],

      mapIndicatorDepGroupList: [], 
      indicatorMapDepGroupList: [], 

      positiveMapIndicatorList: [], 
      positiveMapIndicatorSum: 0, 

      positiveIndicatorMapList: [], 
      positiveIndicatorMapSum: 0, 

      negativeMapIndicatorList: [], 
      negativeMapIndicatorSum: 0, 

      negativeIndicatorMapList: [], 
      negativeIndicatorMapSum: 0, 

      hybridMapIndicatorList: [], 
      hybridMapIndicatorSum: 0, 

      hybridIndicatorMapList: [], 
      hybridIndicatorMapSum: 0, 

      mapIndicatorOption: {},
      mapIndicator_mapOption: {
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2
        },
        visualMap: {
          inRange: { color: ['red', 'orange', 'green', 'green'] },
          show: false,
        }, 
        series: [
          {
            name: 'Казахстан',
            height: `70%`,
            id: "Kaz",
            type: "map",
            map: "Kazakhstan",
            animationDurationUpdate: 1000,
            universalTransition: true,
            color: [],
            data: [],
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2,
              borderJoin: "round",
            },
            label: {
              show: true,
              color: "#000",
              fontWeight: "bold",
              formatter: function (params) {
                return `${params.name}\n${params.data ? params.data.value.toFixed(3).toString().replace('-', '') : ''}`;
              }
            },
            emphasis: {
              itemStyle: {
                borderWidth: 2,
                borderColor: "#535353",
                areaColor: "#349FD7",
              },
              label: {
                show: true,
                color: "#000",
                fontWeight: "bold",
                fontSize: 20,
              },
            },
            select: {
              label: {
                show: true,
                color: "#000",
                fontWeight: "bold",
                fontSize: 20,
              },
              itemStyle: {
                areaColor: "#349FD7",
              },
            },
          },
        ],
      },

      indicatorMapOption: {},
      indicatorMap_mapOption: {
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2
        },
        visualMap: {
          inRange: { color: ['red', 'orange', 'green', 'green'] },
          show: false,
        }, 
        series: [
          {
            name: 'Казахстан',
            height: `70%`,
            id: "Kaz",
            type: "map",
            map: "Kazakhstan",
            animationDurationUpdate: 1000,
            universalTransition: true,
            color: [],
            data: [],
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2,
              borderJoin: "round",
            },
            label: {
              show: true,
              color: "#000",
              fontWeight: "bold",
              formatter: function (params) {
                return `${params.name}\n${params.data ? params.data.value.toFixed(3).toString().replace('-', '') : ''}`;
              }
            },
            emphasis: {
              itemStyle: {
                borderWidth: 2,
                borderColor: "#535353",
                areaColor: "#349FD7",
              },
              label: {
                show: true,
                color: "#000",
                fontWeight: "bold",
                fontSize: 20,
              },
            },
            select: {
              label: {
                show: true,
                color: "#000",
                fontWeight: "bold",
                fontSize: 20,
              },
              itemStyle: {
                areaColor: "#349FD7",
              },
            },
          },
        ],
      },
    };
  },
  methods: {
    showDetails (props) {
      this.selectedGEOCode = props.data.name
      this.selectedDepartment = props.data.department_name

      this.positiveMapIndicatorList = this.clearALLRatingData.filter(item=>item.geo_code==this.selectedGEOCode && item.indicator_type_code=='positive')
      this.positiveMapIndicatorSum = 0
      for (let i = 0; i < this.positiveMapIndicatorList.length; i++) {
        this.positiveMapIndicatorSum = this.positiveMapIndicatorSum + Number(this.positiveMapIndicatorList[i].score)
      }

            this.negativeMapIndicatorList = this.clearALLRatingData.filter(item=>item.geo_code==this.selectedGEOCode && item.indicator_type_code=='negative')
      this.negativeMapIndicatorSum = 0
      for (let i = 0; i < this.negativeMapIndicatorList.length; i++) {
        this.negativeMapIndicatorSum = this.negativeMapIndicatorSum + Number(this.negativeMapIndicatorList[i].score)
      }

      this.hybridMapIndicatorList = this.clearALLRatingData.filter(item=>item.geo_code==this.selectedGEOCode && item.indicator_type_code=='hybrid')
      this.hybridMapIndicatorSum = 0
      for (let i = 0; i < this.hybridMapIndicatorList.length; i++) {
        this.hybridMapIndicatorSum = this.hybridMapIndicatorSum + Number(this.hybridMapIndicatorList[i].score)
      }

    },
    changeOption() {
      this.grafficType = this.grafficType == 'Map' ? 'Indicator': 'Map'
    },
    rounded(number, fixed){
        return +number.toFixed(fixed);
    },
    getGradientColor (start_color, end_color, percent) {
      start_color = start_color.replace(/^\s*#|\s*$/g, '');
      end_color = end_color.replace(/^\s*#|\s*$/g, '');

      if(start_color.length == 3){
        start_color = start_color.replace(/(.)/g, '$1$1');
      }

      if(end_color.length == 3){
        end_color = end_color.replace(/(.)/g, '$1$1');
      }

      var start_red = parseInt(start_color.substr(0, 2), 16),
          start_green = parseInt(start_color.substr(2, 2), 16),
          start_blue = parseInt(start_color.substr(4, 2), 16);

      var end_red = parseInt(end_color.substr(0, 2), 16),
          end_green = parseInt(end_color.substr(2, 2), 16),
          end_blue = parseInt(end_color.substr(4, 2), 16);

      var diff_red = end_red - start_red;
      var diff_green = end_green - start_green;
      var diff_blue = end_blue - start_blue;

      diff_red = ( (diff_red * percent) + start_red ).toString(16).split('.')[0];
      diff_green = ( (diff_green * percent) + start_green ).toString(16).split('.')[0];
      diff_blue = ( (diff_blue * percent) + start_blue ).toString(16).split('.')[0];

      if( diff_red.length == 1 ) diff_red = '0' + diff_red
      if( diff_green.length == 1 ) diff_green = '0' + diff_green
      if( diff_blue.length == 1 ) diff_blue = '0' + diff_blue

      return '#' + diff_red + diff_green + diff_blue;
    },

    returnDataWithCustomColors(inputData, inputMin, inputMax){
      if (inputMax - inputMin == 0) {
        for (let i = 0; i < inputData.length; i++) {
          inputData[i].color_class = '#ffa500' 
        }
      } else {
        let colorRange100 = this.rounded(inputMax, 5)
        let colorRange0 = this.rounded(inputMin, 5)

        let colorRange70 = this.rounded(((colorRange100-colorRange0)*70/100) + colorRange0, 5)
        let colorRange65 = this.rounded(((colorRange100-colorRange0)*65/100) + colorRange0, 5)
        let colorRange60 = this.rounded(((colorRange100-colorRange0)*60/100) + colorRange0, 5)
        let colorRange55 = this.rounded(((colorRange100-colorRange0)*55/100) + colorRange0, 5)
        let colorRange50 = this.rounded(((colorRange100-colorRange0)*50/100) + colorRange0, 5)
        let colorRange45 = this.rounded(((colorRange100-colorRange0)*45/100) + colorRange0, 5)
        let colorRange40 = this.rounded(((colorRange100-colorRange0)*40/100) + colorRange0, 5)
        let colorRange35 = this.rounded(((colorRange100-colorRange0)*35/100) + colorRange0, 5)
        let colorRange30 = this.rounded(((colorRange100-colorRange0)*30/100) + colorRange0, 5)
        let colorRange25 = this.rounded(((colorRange100-colorRange0)*25/100) + colorRange0, 5)
        let colorRange20 = this.rounded(((colorRange100-colorRange0)*20/100) + colorRange0, 5)
        let colorRange15 = this.rounded(((colorRange100-colorRange0)*15/100) + colorRange0, 5)
        let colorRange10 = this.rounded(((colorRange100-colorRange0)*10/100) + colorRange0, 5)

                let colorGreen = '#008000'
        let colorName65 = '#1b8400'
        let colorName60 = '#338700'
        let colorName55 = '#6b9000'
        let colorName50 = '#809300'
        let colorName45 = '#bc9b00'
        let colorName40 = '#cc9e00'
        let colorName35 = '#ff9c00'
        let colorName30 = '#ff9400'
        let colorName25 = '#ff6800'
        let colorName20 = '#ff6300'
        let colorName15 = '#ff3400'
        let colorName10 = '#ff3200'
        let colorRed = '#ff0000'

                for (let i = 0; i < inputData.length; i++) {
          if (inputData[i].value >= colorRange70) {
            inputData[i].color_class = colorGreen
          } 
          else if (inputData[i].value >= colorRange65) {
            inputData[i].color_class = this.getGradientColor(colorName65, colorGreen, this.rounded((inputData[i].value-colorRange65)/(colorRange70 - colorRange65), 5))
          } 
          else if (inputData[i].value >= colorRange60) {
            inputData[i].color_class = this.getGradientColor(colorName60, colorName65, this.rounded((inputData[i].value-colorRange60)/(colorRange65 - colorRange60), 5))
          } 
          else if (inputData[i].value >= colorRange55) {
            inputData[i].color_class = this.getGradientColor(colorName55, colorName60, this.rounded((inputData[i].value-colorRange55)/(colorRange60 - colorRange55), 5))
          } 
          else if (inputData[i].value >= colorRange50) {
            inputData[i].color_class = this.getGradientColor(colorName50, colorName55, this.rounded((inputData[i].value-colorRange50)/(colorRange55 - colorRange50), 5))
          } 
          else if (inputData[i].value >= colorRange45) {
            inputData[i].color_class = this.getGradientColor(colorName45, colorName50, this.rounded((inputData[i].value-colorRange45)/(colorRange50 - colorRange45), 5))
          } 
          else if (inputData[i].value >= colorRange40) {
            inputData[i].color_class = this.getGradientColor(colorName40, colorName45, this.rounded((inputData[i].value-colorRange40)/(colorRange45 - colorRange40), 5))
          } 
          else if (inputData[i].value >= colorRange35) {
            inputData[i].color_class = this.getGradientColor(colorName35, colorName40, this.rounded((inputData[i].value-colorRange35)/(colorRange40 - colorRange35), 5))
          } 
          else if (inputData[i].value >= colorRange30) {
            inputData[i].color_class = this.getGradientColor(colorName30, colorName35, this.rounded((inputData[i].value-colorRange30)/(colorRange35 - colorRange30), 5))
          } 
          else if (inputData[i].value >= colorRange25) {
            inputData[i].color_class = this.getGradientColor(colorName25, colorName30, this.rounded((inputData[i].value-colorRange25)/(colorRange30 - colorRange25), 5))
          } 
          else if (inputData[i].value >= colorRange20) {
            inputData[i].color_class = this.getGradientColor(colorName20, colorName25, this.rounded((inputData[i].value-colorRange20)/(colorRange25 - colorRange20), 5))
          } 
          else if (inputData[i].value >= colorRange15) {
            inputData[i].color_class = this.getGradientColor(colorName15, colorName20, this.rounded((inputData[i].value-colorRange15)/(colorRange20 - colorRange15), 5))
          } 
          else if (inputData[i].value >= colorRange10) {
            inputData[i].color_class = this.getGradientColor(colorName10, colorName15, this.rounded((inputData[i].value-colorRange10)/(colorRange15 - colorRange10), 5))
          } 
          else {
            inputData[i].color_class = this.getGradientColor(colorRed, colorName10, this.rounded((inputData[i].value-colorRange0)/(colorRange10 - colorRange0), 5))
          }
        }
      }

      return inputData
    },

    showIndicatorMapListener (indicatorName, indicatorType) {
      this.selectedIndicatorMap_IndName = indicatorName
      this.selectedIndicatorMap_IndType = indicatorType

      this.indicatorMapDepGroupList = []
      let tempData20 = this.clearALLRatingData.filter(item => item.indicator_name == indicatorName && item.indicator_type_code == indicatorType)

      for (let i = 0; i < tempData20.length; i++) {
        let tempCheckDepExists = this.indicatorMapDepGroupList.find(item => item.name == tempData20[i].geo_code)
        if (tempCheckDepExists) {
            tempCheckDepExists.value = tempCheckDepExists.value + Number(tempData20[i].score);
        } else {
            this.indicatorMapDepGroupList.push({
              name: tempData20[i].geo_code, 
              value: Number(tempData20[i].score)
            });
        }
      }

      let getMinScore = Math.min.apply(Math, this.indicatorMapDepGroupList.map(function(o) { return o.value; }))
      let getMaxScore = Math.max.apply(Math, this.indicatorMapDepGroupList.map(function(o) { return o.value; }))

      this.indicatorMap_mapOption.visualMap.min = getMinScore
      this.indicatorMap_mapOption.visualMap.max = getMaxScore

      this.indicatorMapDepGroupList = this.returnDataWithCustomColors(this.indicatorMapDepGroupList, getMinScore, getMaxScore)

      let sortData = this.indicatorMapDepGroupList.sort((a, b) => {
        return  b.value - a.value;
      });

      for (let i = 0; i < this.indicatorMapDepGroupList.length; i++) {
        this.indicatorMapDepGroupList[i].ratingNum = i + 1
      }

      this.indicatorMap_mapOption.series.map(function(item) {
          item.data = sortData;
      })

      this.indicatorMapOption = this.indicatorMap_mapOption;
    },
  },
  props: ['placeholder']
  ,

  async mounted() {
    this.configCode = sessionStorage.getItem('app')

    this.grafficType = 'Map'
    this.selectedDepartment = ""
    this.selectedIndicatorMap_IndName = ""

    if (this.placeholder == 0) { 
      this.tabName = 'Неотвратимость наказания'
      this.tabReportCode = 'global_inev_punishment'

    } else if (this.placeholder == 1) { 
      this.tabName = 'Превенция'
      this.tabReportCode = 'global_prevention'

    } else { 
      this.tabName = 'Индекс восприятия коррупции'
      this.tabReportCode = 'global_corruption_index'
    }

    let { data: temp_data } = await this.axios.get('/api/1.0/report', {params: {report_code: this.tabReportCode}})
    for (let i = 0; i < temp_data.length; i++) {
      temp_data[i].score = Number(temp_data[i].score)
    }
    this.clearALLRatingData = temp_data

    this.mapIndicatorDepGroupList = []
    for (let i = 0; i < this.clearALLRatingData.length; i++) {
      let tempCheckDepExists = this.mapIndicatorDepGroupList.find(item => item.name == this.clearALLRatingData[i].geo_code)
      if (tempCheckDepExists) {
          tempCheckDepExists.value = tempCheckDepExists.value + Number(this.clearALLRatingData[i].score);
      } else {
          this.mapIndicatorDepGroupList.push({
            name: this.clearALLRatingData[i].geo_code, 
            value: Number(this.clearALLRatingData[i].score),
            department_name: this.clearALLRatingData[i].department_name
          });
      }
    }

    let getMinScore = Math.min.apply(Math, this.mapIndicatorDepGroupList.map(function(o) { return o.value; }))
    let getMaxScore = Math.max.apply(Math, this.mapIndicatorDepGroupList.map(function(o) { return o.value; }))

    this.mapIndicator_mapOption.visualMap.min = getMinScore
    this.mapIndicator_mapOption.visualMap.max = getMaxScore

    this.mapIndicatorDepGroupList = this.returnDataWithCustomColors(this.mapIndicatorDepGroupList, getMinScore, getMaxScore)

    let tmpIndicatorGroupData = []
    for (let i = 0; i < this.clearALLRatingData.length; i++) {
      let tempCheckDepExists = tmpIndicatorGroupData.find(item => item.indicator_name == this.clearALLRatingData[i].indicator_name && item.indicator_type_code == this.clearALLRatingData[i].indicator_type_code)
      if (tempCheckDepExists) {
          tempCheckDepExists.score = tempCheckDepExists.score + Number(this.clearALLRatingData[i].score);
      } else {
          tmpIndicatorGroupData.push({
            indicator_name: this.clearALLRatingData[i].indicator_name,
            indicator_type_code: this.clearALLRatingData[i].indicator_type_code,
            score: Number(this.clearALLRatingData[i].score)
          });
      }
    }
    this.positiveIndicatorMapList = tmpIndicatorGroupData.filter(item=>item.indicator_type_code=='positive')
    this.positiveIndicatorMapSum = 0
    for (let i = 0; i < this.positiveIndicatorMapList.length; i++) {
      this.positiveIndicatorMapSum = this.positiveIndicatorMapSum + Number(this.positiveIndicatorMapList[i].score)
    }

    this.negativeIndicatorMapList = tmpIndicatorGroupData.filter(item=>item.indicator_type_code=='negative')
    this.negativeIndicatorMapSum = 0
    for (let i = 0; i < this.negativeIndicatorMapList.length; i++) {
      this.negativeIndicatorMapSum = this.negativeIndicatorMapSum + Number(this.negativeIndicatorMapList[i].score)
    }

    this.hybridIndicatorMapList = tmpIndicatorGroupData.filter(item=>item.indicator_type_code=='hybrid')
    this.hybridIndicatorMapSum = 0
    for (let i = 0; i < this.hybridIndicatorMapList.length; i++) {
      this.hybridIndicatorMapSum = this.hybridIndicatorMapSum + Number(this.hybridIndicatorMapList[i].score)
    }
    let sortData = this.mapIndicatorDepGroupList.sort((a, b) => {
      return  b.value - a.value;
    });

    for (let i = 0; i < this.mapIndicatorDepGroupList.length; i++) {
      this.mapIndicatorDepGroupList[i].ratingNum = i + 1
    }

    this.mapIndicator_mapOption.series.map(function(item) {
        item.data = sortData;
    })

    this.mapIndicatorOption = this.mapIndicator_mapOption;
  },
  watch : {
  },
};
</script><style scoped  lang="scss">
.chart {
  height: 80vh;
}
// .v-list-item {
//   padding: 0 0 0 16px!important;
// }
.v-list-item__icon {
  padding: 16px 0 15px 16px;
  border-left: 1px solid black;
  border-radius: 36px;
  margin: 0;
 }
.good {
  .v-list-item {
    background-color: rgb(137 203 92 / 80%);
    border: 2px solid green;
    font-size: 0.875rem;
  }
  .v-list-item__icon {
    border-left: 2px solid green;
  }
  .v-subheader {
    border: 2px solid rgb(8, 184, 8);
    margin-bottom: 10px;
    border-radius: 15px;
    color: rgb(8, 184, 8);
    font-size: 1.3rem;
  }
  .v-chip {
    // background-color: rgb(255, 255, 255);
    // border: 1px solid rgb(8, 184, 8);
    background-color: transparent;
    border: none;
    //color: rgb(255, 255, 255);
    font-weight: bold;
    font-size: 1.3rem;
  }
}
.bad {
  .v-list-item {
    background-color: rgb(255 7 7/ 70%);
    border: 2px solid darkred;
    font-size: 0.875rem;
  }
  .v-list-item__icon {
    border-left: 2px solid darkred;
  }
  .v-subheader {
    border: 2px solid rgb(255, 7, 7);
    margin-bottom: 10px;
    border-radius: 15px;
    color: rgb(255, 7, 7);
      font-size: 1.3rem;
  }
  .v-chip {
    // background-color: rgb(255, 255, 255);
    // border: 1px solid rgb(255, 7, 7);
    background-color: transparent;
    border: none;
    //color: rgb(255, 255, 255);
    font-weight: bold;
    font-size: 1.3rem;
  }
}
.neutral {
  .v-list-item {
    background-color: rgb(255 105 7 / 70%);
    border: 2px solid rgb(197, 79, 0);
    font-size: 0.875rem;
  }
  .v-list-item__icon {
    border-left: 2px solid rgb(197, 79, 0);;
  }
  .v-subheader {
    border: 2px solid rgb(238, 125, 20);
    margin-bottom: 10px;
    border-radius: 15px;
    color: rgb(238, 125, 20);
    font-size: 1.3rem;
  }
  .v-chip {
    // background-color: rgb(255, 255, 255);
    // border: 1px solid rgb(238, 125, 20);
    background-color: transparent;
    border: none;
    font-weight: bold;
    font-size: 1.3rem;
  }
}
</style>