<template>
  <div>
    <!--Поля Общие сведения-->
    <div class="card">
      <v-row>
        <v-col>

          <p v-if="employee.birthplace">
            Место рождения: {{ employee.birthplace ? employee.birthplace : "" }} 
          </p>

          <p v-if="employee.identification_number">
            ИИН: {{ employee.identification_number ? employee.identification_number : "" }} 
          </p>

          <p v-if="employee.citizen">
            Гражданство: {{ employee.citizen ? employee.citizen : '' }} 
          </p>

          <p v-if="employee.is_married">
            Женат / Замужем: {{ employee.is_married ? 'Да' : 'Нет' }}
          </p>
          
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";

export default {
  components: {},
  data() {
    return {
      moment,
      employee: {},
    };
  },
  async created() {
    try {
      const { id } = this.$route.params;
      this.$crypto(id, 'decrypt');
      const { data } = await axios.get(
        `http://localhost:8000/api/1.0/employee/${this.$crypto(id, 'decrypt')}`,
      );
      this.employee = data[0];
      console.log(data[0]);
    } catch(err) {
      console.log(err);
    }
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
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