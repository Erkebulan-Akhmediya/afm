<template>
  <div>
    <v-row no-gutters>
      <v-col cols="12" sm="4">
        <v-card class="mx-auto good" max-width="450" flat>
          <v-list rounded>
            <v-subheader
              ><span>Всего</span> <v-spacer></v-spacer
              ><b
                ><span>{{ appeals_all_count }}</span></b
              ></v-subheader
            >
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="mx-auto bad" max-width="450" flat>
          <v-list rounded>
            <v-subheader
              ><span>В производстве</span> <v-spacer></v-spacer
              ><b
                ><span>{{ appeals_progress_count }}</span></b
              ></v-subheader
            >
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="mx-auto neutral" max-width="450" flat>
          <v-list rounded>
            <v-subheader
              ><span>Одобрено</span> <v-spacer></v-spacer
              ><b
                ><span>{{ appeals_approved_count }}</span></b
              ></v-subheader
            >
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <span style="font-size: 16px; color: green"
          ><b>Одобренные по направлениям</b></span
        >
        <v-chart class="chart" autoresize :option="pieOption" />
      </v-col>
      <v-col cols="8">
        <span style="font-size: 16px; color: green"
          ><b>Одобренные по подразделениям</b></span
        >
        <br /><br />
        <v-data-table
          dense
          disable-sort
          :headers="headers"
          :items="empstatistics"
          :items-per-page="10"
        >
          <template v-slot:[`item.rateNum`]="{ item }">
            {{ item.rateNum }}
          </template>
          <template v-slot:[`item.src`]="{ item }">
            <v-avatar>
              <img class="pt-1 pb-1 pl-1 pr-1" :src="item.src" />
            </v-avatar>
          </template>
          <template v-slot:[`item.score`]="{ item }">
            <v-progress-linear
              :value="
                getPercents(
                  item.score - empstatistics[empstatistics.length - 1].score,
                  empstatistics[0].score -
                    empstatistics[empstatistics.length - 1].score
                )
              "
              readonly
              rounded
              stream
              height="25"
              @click="getReportDetail(item.id)"
              :color="item.color_class"
            >
              <strong>{{ Number(item.score).toFixed(2) }}</strong>
            </v-progress-linear>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="showDetails" width="650px">
      <v-card>
        <v-spacer> </v-spacer>
        <v-card-title style="color: #000 !important">
          Детализация
        </v-card-title>
        <v-spacer> </v-spacer>
        <v-card-text>
          <hr />
          <br />
          <div v-if="reportDetails.length > 0">
            <v-row v-for="(reportDetail, index) in reportDetails" :key="index">
              <v-col cols="10">{{ reportDetail.name }}: </v-col>
              <v-col cols="2" class="text-right"
                ><strong>{{
                  Number(reportDetail.score || 0).toFixed(2)
                }}</strong></v-col
              >
            </v-row>
          </div>
          <div v-else>Без детализации</div>
          <br />
          <hr />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { TitleComponent } from "echarts/components";
import { LegendComponent } from "echarts/components";

echarts.use([TitleComponent, PieChart, LegendComponent]);

export default {
  data() {
    return {
      approved_appeals_orig: [],
      appeal_subtype_list: [],

      exist_department_rel: [],

      appeals_all_count: 0,
      appeals_progress_count: 0,
      appeals_approved_count: 0,

      showDetails: false,
      globalEmpstatistics: [],
      empstatistics: [],
      reportDetails: [],
      personalCard: {},
      topemps: [],
      headers: [
        { text: "#", value: "rateNum" },
        { text: "Наименование", value: "name" },
        { text: "Количество", value: "score", width: "40%" },
      ],

      pieOption: {
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} ({d}%)",
        },
        series: [
          {
            name: "По группам",
            type: "pie",
            radius: "60%",
            center: ["50%", "45%"],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
    };
  },
  async mounted() {
    this.getData();
  },
  methods: {
    getPercents(value, buffer) {
      return (value / buffer) * 100;
    },
    async getReportDetail(id) {
      this.showDetails = true;

      this.reportDetails = [];
      for (let i = 0; i < this.appeal_subtype_list.length; i++) {
        if (this.placeholder == 1) {
          let modifyExistDepartmentRel, filteredExistDepartmentRel;
          filteredExistDepartmentRel = this.exist_department_rel.filter(
            (item) => item.parent_department_id == id
          );

          modifyExistDepartmentRel = [];
          for (let z = 0; z < filteredExistDepartmentRel.length; z++) {
            modifyExistDepartmentRel.push(
              filteredExistDepartmentRel[z].department_id
            );
          }

          this.reportDetails.push({
            name: this.appeal_subtype_list[i].name_rus,
            score: this.approved_appeals_orig.filter(
              (item) =>
                item.appeal_subtype_id == this.appeal_subtype_list[i].id &&
                modifyExistDepartmentRel.includes(item.department_id)
            ).length,
          });
        } else {
          this.reportDetails.push({
            name: this.appeal_subtype_list[i].name_rus,
            score: this.approved_appeals_orig.filter(
              (item) =>
                item.appeal_subtype_id == this.appeal_subtype_list[i].id &&
                item.organization_id == id
            ).length,
          });
        }
      }
    },
    async refreshIndReportData() {
      this.empstatistics.sort((a, b) => {
        return b.score - a.score;
      });

      for (let i = 0; i < this.empstatistics.length; i++) {
        this.empstatistics[i].rateNum = i + 1;
      }

      let lastGreenNum, lastAmberNum;
      if (this.empstatistics.length > 0) {
        lastGreenNum = Math.floor((20 * this.empstatistics.length) / 100); 
        lastAmberNum = Math.floor((80 * this.empstatistics.length) / 100); 
      }

      for (let i = 0; i < this.empstatistics.length; i++) {
        if (this.empstatistics[i].rateNum <= lastGreenNum) {
          this.empstatistics[i].color_class = "green";
        } else if (
          this.empstatistics[i].rateNum >= lastGreenNum + 1 &&
          this.empstatistics[i].rateNum <= lastAmberNum
        ) {
          this.empstatistics[i].color_class = "amber";
        } else {
          this.empstatistics[i].color_class = "red";
        }
      }
    },
    async getData() {
      let { data } = await this.axios.get("/api/1.0/appeal/rating");
      this.appeal_subtype_list = data.appeal_subtype_list; 
      let allOrganizationList = data.organizations; 
      let appealsAllData = data.approved_appeals; 
      let centerDepartmentList = data.center_department_list; 
      this.exist_department_rel = data.exist_department_rel; 

      if (this.placeholder == 0) {
        appealsAllData = JSON.parse(JSON.stringify(appealsAllData));
        allOrganizationList = JSON.parse(JSON.stringify(allOrganizationList));
      } else if (this.placeholder == 1) {
        appealsAllData = JSON.parse(JSON.stringify(appealsAllData)).filter(
          (item) => item.organization_id == 1
        );
        allOrganizationList = JSON.parse(
          JSON.stringify(allOrganizationList)
        ).filter((item) => item.id == 1);
      } else if (this.placeholder == 2) {
        appealsAllData = JSON.parse(JSON.stringify(appealsAllData)).filter(
          (item) => item.organization_id != 1
        );
        allOrganizationList = JSON.parse(
          JSON.stringify(allOrganizationList)
        ).filter((item) => item.id != 1);
      } else {
        return alert(
          "Не корректно определен переход, обратитесь к администратору системы"
        );
      }

      this.approved_appeals_orig = JSON.parse(
        JSON.stringify(appealsAllData)
      ).filter(
        (item) =>
          item.appeal_status_id == 5 ||
          item.appeal_status_id == 6 ||
          item.appeal_status_id == 7 ||
          item.appeal_status_id == 66 ||
          item.appeal_status_id == -3
      );

      this.appeals_all_count = JSON.parse(
        JSON.stringify(appealsAllData)
      ).length;
      this.appeals_progress_count = JSON.parse(
        JSON.stringify(appealsAllData)
      ).filter(
        (item) =>
          item.appeal_status_id == 3 ||
          item.appeal_status_id == 4 ||
          item.appeal_status_id == 44 ||
          item.appeal_status_id == -4
      ).length;
      this.appeals_approved_count = this.approved_appeals_orig.length;
      this.empstatistics = [];
      let modifyExistDepartmentRel, filteredExistDepartmentRel;
      if (this.placeholder == 1) {
        for (let i = 0; i < centerDepartmentList.length; i++) {
          filteredExistDepartmentRel = this.exist_department_rel.filter(
            (item) => item.parent_department_id == centerDepartmentList[i].id
          );

          modifyExistDepartmentRel = [];
          for (let z = 0; z < filteredExistDepartmentRel.length; z++) {
            modifyExistDepartmentRel.push(
              filteredExistDepartmentRel[z].department_id
            );
          }

          this.empstatistics.push({
            id: centerDepartmentList[i].id,
            name: centerDepartmentList[i].name_rus,
            score: this.approved_appeals_orig.filter((item) =>
              modifyExistDepartmentRel.includes(item.department_id)
            ).length,
          });
        }
      } else {
        for (let i = 0; i < allOrganizationList.length; i++) {
          this.empstatistics.push({
            id: allOrganizationList[i].id,
            name: allOrganizationList[i].name_rus,
            score: this.approved_appeals_orig.filter(
              (item) => item.organization_id == allOrganizationList[i].id
            ).length,
          });
        }
      }

      this.refreshIndReportData();

      let pieSeriesData = [];
      for (let i = 0; i < this.appeal_subtype_list.length; i++) {
        if (
          this.approved_appeals_orig.filter(
            (item) => item.appeal_subtype_id == this.appeal_subtype_list[i].id
          ).length != 0
        ) {
          pieSeriesData.push({
            name: this.appeal_subtype_list[i].name_rus,
            value: this.approved_appeals_orig.filter(
              (item) => item.appeal_subtype_id == this.appeal_subtype_list[i].id
            ).length,
          });
        }
      }

      this.pieOption.series[0].data = [];
      this.pieOption.series[0].data = pieSeriesData;
    },
  },
  watch: {
    placeholder() {
      this.getData();
    },
  },
  props: ["placeholder"],
};
</script><style scoped  lang="scss">
.good {
  .v-subheader {
    border: 2px solid #5470c6;
    margin-bottom: 10px;
    border-radius: 15px;
    color: #5470c6;
    font-size: 1.3rem;
  }
}
.bad {
  .v-subheader {
    border: 2px solid #fc8452;
    margin-bottom: 10px;
    border-radius: 15px;
    color: #fc8452;
    font-size: 1.3rem;
  }
}
.neutral {
  .v-subheader {
    border: 2px solid #91cc75;
    margin-bottom: 10px;
    border-radius: 15px;
    color: #91cc75;
    font-size: 1.3rem;
  }
}
</style>