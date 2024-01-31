<template>
  <div>
    <EmployeeTable v-if="isEmployee" :employeeTable="departmentData.id" />
    <v-expansion-panels
      :accordion="false"
      :popout="false"
      :inset="false"
      :multiple="false"
      :focusable="false"
      :disabled="false"
      :flat="true"
      :hover="true"
      :tile="false"
      v-model="expansionValue"
      @change="openExpanderStore"
      class="pb-"
    >
      <v-expansion-panel
        class="child-department"
        v-for="(department, j) in tableData"
        :key="j"
      >
        <v-expansion-panel-header class="child-department py-0">
          <span v-text="department.name || department.name_rus"></span>
          <!--Здесь правильно, правила доступа регулируется с фильтрацией записи внизу-->
          <v-btn
            max-width="160px" 
            style="margin-right: 30px;"
            v-if = "department.is_edited_employee"
            @click.native.stop="createCandidateDialog(department)"
            color="primary" 
            outlined
          >
            <v-icon class="mr-2"> mdi-plus </v-icon>
            Добавить 
          </v-btn>
          
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <EmployeeDepartmentOrganization
            :data="department.id"
            :level="level + 1"
          />

          <!-- <EmployeeTable v-if="departmentData.employees && departmentData.employees.length && !department.department.length" :employeeTable="department.id" /> -->
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-row align="center">
      <CandidateCreate
        :dialog="candidateCreate"
        @close="candidateCreate = false"
        :inputDepartmentId="departmentId"
      />
    </v-row>
  </div>
</template>
<script>
import CandidateCreate from "./CandidateCreate.vue";
import checkRoles from '@/utils/check_role'

export default {
  components: {
    CandidateCreate,
  },
  data() {
    return {
      expansionValue: "",
      store: "",
      tableData: [],
      departmentData: {},
      isEmployee: false,
      candidateCreate: false,
      departmentId: null,
    };
  },
  created() {

        let url,
      params = {},
      localParams;
    if (this.level == 0) {
      url = `/api/1.0/department`;
      params.parent_id = "null";
    }
    else {
      url = `/api/1.0/department/:num`;
      localParams = { num: this.data || "" };
    }

    this.expansionValue = this.openedExpanderCalc();
    this.axios.get(url, { localParams, params }).then((data) => {
      if (data) {
        if (checkRoles('41', this.$userData) || checkRoles('39', this.$userData) || checkRoles('40', this.$userData)) { 
          if (checkRoles('40', this.$userData)) {
            if (data.data.department) {
              data.data.department = data.data.department.filter(item => item.is_edited_employee == false || (item.is_edited_employee == true && item.organization_id == this.$userData.fullData.organization_id))
            }
          }
        } else {
          if (data.data.department) {
            data.data.department = data.data.department.filter(item => item.is_edited_employee == false)
          }
        }

        this.tableData = Array.isArray(data.data)
          ? data.data.filter(
              (data) => data.identification_number != "100200300400"
            )
          : data.data.department.filter((data) => data.id != -1);

        this.$set(this, "departmentData", data.data);

        if (
          (data.data.employees && data.data.employees.length) ||
          ((!data.data.department || !data.data.department.length) &&
            this.level != 0 &&
            this.level != 1)
        ) {
          this.isEmployee = true;
        } else {
          this.isEmployee = false;
        }
      }
    });
  },

  watch: {},

  methods: {
    openedExpanderCalc() {
      let isHaveParent = true;
      for (let i = 0; i <= this.level; i++) {
        if (this.$store.state.openDepartments[i] === undefined) {
          isHaveParent = false;
        }
      }
      return isHaveParent ? this.$store.state.openDepartments[this.level] : "";
    },

    openExpanderStore() {
      this.$store.commit("openDepartments", {
        level: this.level,
        value: this.expansionValue,
      });
      this.expansionValue = this.openedExpanderCalc();
    },
    createCandidateDialog(item) {
      this.candidateCreate = true;
      this.departmentId = item.parent_id;
    },
  },
  props: ["data", "level"],
};
</script>