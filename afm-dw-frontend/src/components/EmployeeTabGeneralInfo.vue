<template>
  <div>
    <!--Поля Общие сведения-->
    <div class="card">
      <v-row>
        <v-col >
          <!--Категория - у Руководства и у Кандидатов не видим Категорию-->
          <p v-if="employee.department_name != 'Руководство' && !employee.is_edited_employee">Категория: {{ employee.category_name }} </p>
          <p>Дата рождения: {{ employee.employee_birth_date ? moment(employee.employee_birth_date).format("D MMMM YYYY") + "г." : "" }} </p>
          <!--ИИН - видим у Кандидатов-->
          <p v-if="employee.is_edited_employee">ИИН: {{ employee.identification_number ? employee.identification_number : "" }} </p>
          <p>Национальность: {{ employee.nationality_name || employee.original_nationality_name }} </p>
          <p>Семейное положение: {{ employee.marital_status_name?employee.marital_status_name:'' }}</p>
          <!--Отношение к религии - видим у Кандидатов-->
          <p v-if="employee.is_edited_employee">Отношение к религии: {{ employee.religion_name?employee.religion_name:'' }}</p>
          <!--Наличие негативных зависимостей - видим у Кандидатов-->
          <p v-if="employee.is_edited_employee">Наличие негативных зависимостей: {{ employee.negative_dependency?employee.negative_dependency:'' }}</p>
          <!--Увлечения - видим у Кандидатов-->
          <p v-if="employee.is_edited_employee">Увлечения: {{ employee.other_interest?employee.other_interest:'' }}</p>
          <!--Прочая информация - видим у Кандидатов-->
          <p v-if="employee.is_edited_employee">Прочая информация: {{ employee.other_information?employee.other_information:'' }}</p>
          <p v-for="(contact, i) in employee.contacts.filter(
              (item) => item.contact_info_type_id == 4
            )"
            :key="contact.id"
          >
            Мобильный номер
            {{
              employee.contacts.filter((item) => item.contact_info_type_id == 4)
                .length > 1
                ? i + 1
                : ""
            }}: {{ contact.contact }}
          </p>
          <!--Вид - не видим у Кандидатов-->
          <p v-if="!employee.is_edited_employee">Вид: {{ employee.employee_type_name }}</p>
          <!--Документы - ПРОВЕСТИ АНАЛИЗ!-->
          <div v-if="($userData.fullData.id == employee.id || $userData.fullData.identification_number == '820419350799')">
            <p v-for="document in employee.documents" :key="document.id">
              Документы: {{ document.document_type_name }} №
              {{ document.document_number }} от
              {{ moment(document.document_issue_date).format("DD.MM.YYYY") }} года
            </p>
            <!--Адрес места проживания, Адрес места рождения, Адрес информирования, Адрес по прописке-->
            <p
              v-for="contact in employee.contacts.filter((item) =>
                [1, 2, 6, 7, 9].includes(item.contact_info_type_id)
              )"
              :key="contact.id"
            >
              {{ contact.contact_info_type_name }} : {{ contact.contact }}
            </p>
          </div>
          <!--Табельный номер - не видим у Кандидатов-->
          <p v-if="!employee.is_edited_employee">Табельный номер: {{ employee.personnel_number }}</p>
          <!--Дата приема - не видим у Кандидатов-->
          <p v-if="!employee.is_edited_employee">
            Дата приема:
            {{
              employee.employment_date
                ? moment(employee.employment_date).format("DD.MM.YYYY") + " г."
                : ""
            }}
          </p>
          <!--Дата последнего перемещения - не видим у Кандидатов-->
          <p v-if="!employee.is_edited_employee">
            Дата последнего перемещения:
            {{
              employee.move_date
                ? moment(employee.move_date).format("DD.MM.YYYY") + " г."
                : ""
            }}
          </p>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script>
import moment from "moment";

export default {
  props: {
    employee: Object,
  },
  components: {
  },
  data() {
    return {
      moment,
    };
  },
  methods: {
  }
};
</script><style lang="scss" scoped>
  .card {
    display: flex;
    margin-bottom: 40px;

    p {
      font-weight: normal;
      font-size: 14px;
      line-height: 19px;
      letter-spacing: 0.01em;
      color: #252c32;
      margin-bottom: 6px;
    }
  }
</style>