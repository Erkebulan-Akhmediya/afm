<template>
  <div class="otherReference">
    <v-select
      v-model="typeReference"
      :items="typeReferenceItems"
      dense
      outlined
      hide-details
      style="max-width: 400px"
      class="ma-2"
      label="Тип справки"
    ></v-select>
    <v-btn class="ma-2" @click="createReference" outlined color="blue">
      <v-icon>mdi-file-document-outline</v-icon>
      Сформировать
    </v-btn>
    <div v-if="objectiveReference" >
      <ObjectiveReference :btnLoader="btnLoader" @downloadObjective="downloadObjective" :objectiveReference="objectiveReference">
      </ObjectiveReference>
    </div>
  </div>
</template>
<script>
import ObjectiveReference from '@/components/ObjectReference.vue'
export default {
  components: {
    ObjectiveReference
  },
  data: () => ({
    typeReference: 1,
    typeReferenceItems: [],
    isLawEnforcementEmployee: null,
    file: "",
    url: "",
    objectiveReference: null,
    btnLoader: false
  }),
  methods: {
    async downloadObjective() {
      this.btnLoader = true
      this.axios.get(`/api/1.0/reference/objective_pdf`, {params: {iin: this.employee.identification_number, bin: this.employee.organization_identification_number}})
      .then((response) => {
          let blob = new Blob([new Buffer(response.data, "base64")], {
            type: "application/document",
          });
          const a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = `${`Объективная характеристика`} - ${this.employee.last_name} ${this.employee.first_name} ${this.employee.middle_name}.pdf`;
          a.click();
          a.remove();
          this.btnLoader = false
        })
      .catch((err) => {
        console.log(err)
        this.btnLoader = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Не удалось сформировать файл: ${err.data?.ERR_MSG || err}`,
        });
      })
    },

    async createReference() {

      if (!this.isLawEnforcementEmployee) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: `Не определен системный параметр isLawEnforcementEmployee, обратитесь к администраторам системы.`,
        });
      }

      let url, docName, outputFileType, workPlaceTypeReportCode

      switch (this.typeReference) {
        case 1:
          url = this.employee.organization_identification_number == `210240035161` ? `/api/1.0/reference/pdf_workplace` : `/api/1.0/reference/doc_workplace`
          docName = `Справка с места работы общая`
          outputFileType = this.employee.organization_identification_number == `210240035161` ? `pdf` : `docx`
          workPlaceTypeReportCode = 'pdf_workplace_base'
          break;
        case 2:
          url = `/api/1.0/reference/doc_jbk`
          docName = `Справка ЖБК`
          outputFileType = `docx`
          workPlaceTypeReportCode = '-1'
          break;
        case 3:
          url = this.employee.organization_identification_number == `210240035161` ? `/api/1.0/reference/pdf_workplace` : `/api/1.0/reference/doc_Pen`
          docName = `Справка с места работы для пенсии`
          outputFileType = this.employee.organization_identification_number == `210240035161` ? `pdf` : `docx`
          workPlaceTypeReportCode = 'pdf_workplace_pen'
          break;
        case 4:
          url = this.employee.organization_identification_number == `210240035161` ? `/api/1.0/reference/pdf_workplace` : `/api/1.0/reference/doc_Exp`
          docName = `Справка с места работы со стажем`
          outputFileType = this.employee.organization_identification_number == `210240035161` ? `pdf` : `docx`
          workPlaceTypeReportCode = 'pdf_workplace_exp'
          break;
        default:
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 600,
            title: `Не определен переход по параметру typeReference`,
          });
      }

            let binds = {
        employee_id: this.employee.id,
        employee_last_name: this.employee.last_name,
        employee_first_name: this.employee.first_name,
        employee_middle_name: this.employee.middle_name,
        position_name: this.employee.position_name,
        department_name: this.employee.department_name,
        employment_date: this.employee.employment_date,
        department_id: this.employee.department_id,
        position_id: this.employee.position_id,
        gender_id: this.employee.gender_id,
        move_date: this.employee.move_date,
        timez: - new Date().getTimezoneOffset(),
        is_law_enforcement_employee: this.isLawEnforcementEmployee,
        work_place_type_report_code: workPlaceTypeReportCode
      }

      this.axios
        .post(url, binds)
        .then((response) => {
          let blob = new Blob([new Buffer(response.data, "base64")], {
            type: "application/document",
          });
          const a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = `${docName} - ${this.employee.last_name} ${this.employee.first_name}.${outputFileType}`;
          a.click();
          a.remove();
        })
        .catch((err) => {
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 600,
            title: `Ошибка формирования документа. ${err.data?.ERR_MSG || err}`,
          });
        })
    },
    async getConst() {
      let { data: array } = await this.axios.get( "/api/1.0/lov/ref.sys_all_const",
          { params: { name: "refObjectCategory,refWorklistCategory,refObjectPositionArr,refWorklistPositionArr"}}
      );
      function parseSys(name, arr) {
        return arr.find((item) => item.name == name);
      }
      return {
        refObjectArr: parseSys(`refObjectCategory`, array).const_value.split(","),
        refWorklistArr: parseSys(`refWorklistCategory`, array).const_value.split(","),
        refObjectPosArr: parseSys(`refObjectPositionArr`, array).const_value.split(","),
        refWorkPosArr: parseSys(`refWorklistPositionArr`, array).const_value.split(","),
      };
    },
    async checkTypeRef() {
      let { refObjectArr, refObjectPosArr, refWorklistArr, refWorkPosArr } = await this.getConst();

            if (refObjectArr.includes(this.employee.category_name) || refObjectPosArr.includes(this.employee.position_name_rus)) {
        this.$set(this, `isLawEnforcementEmployee`, `is_law_enforcement`)
        this.$set(this, `typeReferenceItems`, [
          { text: "Справка с места работы (базовая)", value: 1 },
          { text: "Справка ЖБК", value: 2 },
          { text: "Справка с места работы (для пенсии)", value: 3 },
          { text: "Справка с места работы (со стажем)", value: 4 },
        ]);
      } else if (refWorklistArr.includes(this.employee.category_name) || refWorkPosArr.includes(this.employee.position_name_rus)) {
        this.$set(this, `isLawEnforcementEmployee`, `public_state`)
        this.$set(this, `typeReferenceItems`, [
          { text: "Справка с места работы (базовая)", value: 1 },
          { text: "Справка ЖБК", value: 2 },
          { text: "Справка с места работы (со стажем)", value: 4 },
        ]);
      }
    }
  },
  created() {
    this.checkTypeRef()
  },
  props: ["employee"],
};
</script>