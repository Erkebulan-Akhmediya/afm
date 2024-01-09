<template>
  <!--ПРОВЕРЕНО 160822-->
  <v-tabs
    v-if="isShowTab()"
    class="tabWrapper tabWithoutUnderline"
    grow
    v-model="activetab"
  >
    <v-tab
      v-for="(item, index) in itemsTab"
      :key="index"
      :disabled="disabledTab(item.id, 'main')"
      class="empTab"
      v-show="!disabledTab(item.id, 'main')"
       @click.passive="changeTab(index)"
    >
      {{ item.title }}
    </v-tab>

    <!-- 0 Общие сведения -->
    <v-tab-item class="tabContent mt-10 fullData px-4">
      <EmployeeTabGeneralInfo :employee="employee" @updateUserInfo="updateUserInfo"/>
    </v-tab-item>

    <!-- 1 Образование -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabEducation :employee="employee" />
    </v-tab-item>

    <!-- 2 Опыт работы -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabExperience :employee="employee" :image="image">
      </EmployeeTabExperience>
    </v-tab-item>

    <!-- 3 Справки -->
    <v-tab-item>
      <!-- Справки -->
      <v-tabs right class="tabWithUnderline" v-model="referenceVal">
        <v-tab
          class=""
          v-for="(item, index) in referenceItemsTab"
          :key="index"
          :disabled="disabledTab(item.id, 'reference')"
        >
          {{ item.title }}
        </v-tab>

        <!-- Расчетный лист -->
        <v-tab-item style="padding-top: 30px">
          <EmployeeTabSalary
            :employee="employee"
            @isShowLoader="isShowLoader"
            @showDialog="showDialog"
            :image="image"
          >
          </EmployeeTabSalary>
        </v-tab-item>

        <!-- Справка об ОПВ -->
        <v-tab-item style="padding-top: 30px">
          <EmployeeTabOpv :employee="employee" @isShowLoader="isShowLoader">
          </EmployeeTabOpv>
        </v-tab-item>

        <!-- Закрепленные ОС -->
        <v-tab-item style="padding-top: 30px">
          <EmployeeTabInvoc :employee="employee" @isShowLoader="isShowLoader">
          </EmployeeTabInvoc>
        </v-tab-item>

        <!-- Прочие справки -->
        <v-tab-item style="padding-top: 30px">
          <EmployeeTabOtherReference
            :employee="employee"
            @isShowLoader="isShowLoader"
          >
          </EmployeeTabOtherReference>
        </v-tab-item>
      </v-tabs>
    </v-tab-item>

    <!-- 4 Заявления -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabRequest :employee="employee" :isApplication="true" :onlyAssignedToYou="true"> </EmployeeTabRequest>
    </v-tab-item>

    <!-- 5 Заявки -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabRequest ref="requests" :employee="employee" :isApplication="false"  :onlyAssignedToYou="true"> </EmployeeTabRequest>
    </v-tab-item>

    <!-- 6 Приказы -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabOrder :employee="employee"> </EmployeeTabOrder>
    </v-tab-item>

    <!-- 7 СКУД -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabVisits :employee="employee"> </EmployeeTabVisits>
    </v-tab-item>

    <!-- 8 Прохождение тестов -->
    <v-tab-item class="tabContent mt-10">
      <EmployeePassingTestTab />
    </v-tab-item>

    <!-- 9 Родственники -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabRelation :employee="employee" />
    </v-tab-item>

    <!-- 10 Документы -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabDocuments :employee="employee" />
    </v-tab-item>

    <!-- 11 Дисциплинарные -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabDisciplinary :employee="employee" />
    </v-tab-item>

    <!-- 12 Прочие сведения -->
    <v-tab-item class="tabContent mt-10">
      <EmployeeTabOtherData :employee="employee"> </EmployeeTabOtherData>
    </v-tab-item>
  </v-tabs>
</template>
<script>
import moment from "moment";
import EmployeeTabRequest from "@/components/EmployeeTabRequest.vue";
import EmployeeTabOtherData from "@/components/EmployeeTabOtherData.vue";
import EmployeeTabExperience from "@/components/EmployeeTabExperience.vue";
import EmployeePassingTestTab from "@/components/EmployeePassingTest.vue";
import EmployeeTabOrder from "@/components/EmployeeTabOrder.vue";
import EmployeeTabRelation from "@/components/EmployeeTabRelation.vue";
import EmployeeTabDocuments from "@/components/EmployeeTabDocuments.vue";
import EmployeeTabDisciplinary from "@/components/EmployeeTabDisciplinary.vue";
import EmployeeTabGeneralInfo from "@/components/EmployeeTabGeneralInfo.vue";
import EmployeeTabEducation from "@/components/EmployeeTabEducation.vue";

export default {
  components: {
    EmployeeTabRequest,
    EmployeeTabOtherData,
    EmployeeTabExperience,
    EmployeePassingTestTab,
    EmployeeTabOrder,
    EmployeeTabRelation,
    EmployeeTabDocuments,
    EmployeeTabDisciplinary,
    EmployeeTabGeneralInfo,
    EmployeeTabEducation
  },
  data() {
    return {
      referenceVal: 3, 
      salaryDate: [moment().format("YYYY-MM")],
      menu: false,
      tab: null,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      icons: false,
      centered: false,
      grow: false,
      vertical: false,
      prevIcon: false,
      nextIcon: false,
      right: false,
      tabs: 3,
      dialog: false,
      moment,
      itemsTab: [
        { id: 0, title: "Общие сведения" },
        { id: 1, title: "Образование" },
        { id: 2, title: "Опыт работы" },
        { id: 3, title: "Справки" },
        { id: 4, title: this.$t("employeeCard.tabs.statement") },
        { id: 5, title: "Заявки" },
        { id: 6, title: "Приказы" },
        { id: 7, title: "СКУД" },
        { id: 8, title: "Прохождение тестов" },
        { id: 9, title: "Родственники" },
        { id: 10, title: "Документы" },
        { id: 11, title: "Дисциплинарные" },
        { id: 12, title: "Прочие сведения" }
      ],
      referenceItemsTab: [
        { id: 0, title: "Расчетный лист" },
        { id: 1, title: "Справка об ОПВ" },
        { id: 2, title: "Закрепленные ОС" },
        { id: 3, title: "Прочие справки" },
      ],
    };
  },
  watch: {
    employee() {
      this.referenceVal = 3;
    },
    menu() {
      if (this.salaryDate && this.salaryDate.length == 2) {
        this.salaryDate.sort((a, b) => {
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
    async update_requests() {
      if (this.$refs.requests) {
        await this.$refs.requests.getMainRequest()
      }
    },
    changeTab(index) {
      this.$emit("changeTab", index);
    },
    updateUserInfo() {
      this.$emit("updateUserInfo");
    },
    isShowTab() {
      let isShow = false;
      this.itemsTab.map((item) => {
        if (!this.disabledTab(item.id, "main")) {
          isShow = true;
        }
      });
      return isShow;
    },
    disabledTab(idTab, type) {
      if (type == "main") {

        switch (idTab) {
          case 0: 
            if (this.employee.is_edited_employee || this.employeeDataAccess) { return false; }
            return true;
          case 1: 
            if (this.employee.is_edited_employee || this.employeeDataAccess) { return false; }
            return true;
          case 2: 
            if (this.employee.is_edited_employee || this.employeeDataAccess) { return false; }
            return true;
          case 3: 
            if (!this.employee.is_edited_employee && this.employeeDataAccess) { return false; }
            return true;
          case 4: 
            if (!this.employee.is_edited_employee && this.employeeDataAccess) { return false; }
            return true;
          case 5: 
            if (this.employee.is_edited_employee || this.employeeDataAccess) { return false; }
            return true;
          case 6: 
            if (!this.employee.is_edited_employee && this.employeeDataAccess) { return false; }
            return true;
          case 7: 
            if (!this.employee.is_edited_employee && this.employeeDataAccess) { return false; }
            return true;
          case 8: 
            if (!this.employee.is_edited_employee && this.employeeDataAccess) { return false; }
            return true;
          case 9: 
            if (this.employee.is_edited_employee) { return false; }
            return true;
          case 10: 
            if (this.employee.is_edited_employee) { return false; }
            return true;
          case 11: 
            if (this.employee.is_edited_employee) { return false; }
            return true;
          case 12: 
            if (this.employee.is_edited_employee) { return false; }
            return true;
          default:
            return true;
        }
      }
      if (type == "reference") {
        switch (idTab) {
          case 0:
            if (this.employee.id == this.$userData.id || this.$userData.fullData.identification_number == '820419350799' || this.$userData.fullData.identification_number == '800101308051') { return false; }
            return true;
          case 1:
            if (this.employee.id == this.$userData.id) { return false; }
            return true;
          case 2:
            return false;
          case 3:
            return false;
          default:
            return true;
        }
      }
    },
    isShowLoader(data) {
      this.$emit("isShowLoader", data);
    },
    showDialog(data) {
      this.$emit("showDialog", data);
    },
  },
  props: ["employee", "image", "activetab", "employeeDataAccess"],
};
</script><style lang="scss" scoped>
.empTab {
  border: 1px solid #dee2e6;
  box-sizing: border-box;
  border-radius: 9px 9px 0px 0px;

  &.v-tab--active {
    border-bottom: 0px solid #000;
    color: #109cf1;
  }
  .v-tabs-slider-wrapper {
    display: none !important;
  }
}

.tabWrapper {
  display: flex;
  flex-direction: column;
  width: 100%;

  p {
    font-size: 14px;
    line-height: 21px;
    display: flex;
    align-items: center;
    letter-spacing: 0.01em;
    color: #323c47;
    margin-bottom: 0;
  }
  min-height: 300px;
}

.fullData p {
  margin-bottom: 6px;
}

.educationCards {
  display: flex;
  flex-wrap: wrap;

  .educationItem {
    padding: 20px;
    max-width: 500px;
    margin-right: 10px;
    border-radius: 10px;
    background: #f4f4f4;

    td:first-child {
      padding-bottom: 10px;
      font-weight: bold;
      padding-right: 20px;
    }
  }
}
</style>,<style lang="scss">
.tabWithoutUnderline .v-tabs-slider-wrapper {
  display: none;
}
.tabWithUnderline .v-tabs-slider-wrapper {
  display: block;
}
.elevation-1 {
  thead {
    background-color: #eee;
    th {
      vertical-align: middle;
    }
  }
  tr:hover {
    cursor: pointer;
  }
}

.empList td {
  border: 1px dotted #000;
  padding: 2px 5px;
}

.opv .greenBack {
  background-color: #d8e9cf;
  font-weight: bold;
  color: #2d604c;
  text-align: center;

  td {
    text-align: center;
  }
}

.opv td {
  border: 1px solid #000;
  padding: 2px 5px;
}

.centerText td {
  text-align: center;
}

.boldText td,
.boldText {
  font-weight: bold;
}
.v-card__title {
  color: rgb(24, 20, 20);
}
</style>