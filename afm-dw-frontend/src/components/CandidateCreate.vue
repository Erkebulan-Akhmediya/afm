<template>
  <div>
    <v-dialog v-model="dialog" max-width="400px" @click:outside="$emit('close')" @keydown.esc="$emit('close')">
      <v-card>
        <v-card-title style="background-color: #1976d2;">
          Создание кандидата
        </v-card-title>
        <br/>
        <v-card-text>
          <v-container>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="ИИН"
                    v-model="iin"
                    required
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model.trim="lastName"
                    label="Фамилия"
                    required
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model.trim="firstName"
                    label="Имя"
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model.trim="middleName"
                    label="Отчество"
                    dense
                  >
                  </v-text-field>
                </v-col>
                <v-col class="d-flex" cols="12">
                  <v-select
                    :items="departments"
                    v-model="department"
                    :disabled="regionButton"
                    label="Подразделение"
                    item-text="name_rus"
                    return-object
                    dense
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="$emit('close')">
            Отмена
          </v-btn>
          <v-btn color="green" :disabled="disableDoubleClick && sendingCandidate" :loading="sendingCandidate" text @click="checkCandidate()">
            Сохранить и перейти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-dialog persistent v-model="confirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="red darken-1" >
          Внимание
        </v-card-title>
        <br/>
        <v-card-text class="text-body-1">
          После регистрации кандидата, изменение ИИН невозможно. Пожалуйста, подтвердите корректность: <br/><br/> <strong>ИИН {{iin}}</strong>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="confirmDialog = false">
            Отмена
          </v-btn>
          <v-btn color="green" :disabled="disableDoubleClick && sendingCandidate" :loading="sendingCandidate" text @click="createCandidate()" >
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import axios from 'axios'
import checkRoles from '@/utils/check_role'

export default {
  props: {
    dialog: Boolean,
    inputDepartmentId: Number
  },
  data: () => ({
    disableDoubleClick: false,
    sendingCandidate: false,
    firstName: "",
    lastName: "",
    middleName: "",
    regionButton: true,
    email: "",
    firstPhone: "",
    secondPhone: "",
    iin: "",
    department: null,
    departments: [],
    confirmDialog: null,

      }),
  computed: {
  },
  methods: {
    async checkCandidate() {
      this.disableDoubleClick = true
      let err = []

      if(!this.iin?.trim()) {
        err.push('"ИИН" обязателен для заполнения')
      }
      if(!this.lastName?.trim()) {
        err.push('"Фамилия" обязателен для заполнения')
      }
      if(!this.firstName?.trim()) {
        err.push('"Имя" обязателен для заполнения')
      }
      if(!this.department) {
        err.push('"Подразделение" обязателен для заполнения')
      }
      if(!this.middle_name) {
        this.middle_name = '' 
      }

            if(err.length) {
        this.disableDoubleClick = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: err.join('; <br>'),
        });
      }

      if (!/^[0-9]+$/.test(this.iin.trim()) || this.iin.trim().length != 12){
        err.push('"ИИН" должен состоять из 12 цифровых значении!')
      }

            if(err.length) {
        this.disableDoubleClick = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: err.join('; <br>'),
        });
      }

      let checkCandidate = await axios.get('/api/1.0/candidate/check-for-create', {params: {identification_number: this.iin.trim()}})

      console.log('checkCandidate.data[0].employee_history_count', checkCandidate.data[0].employee_history_count)

      if (checkCandidate.data[0].employee_history_count > 0) {
        err.push('Кандидат с указанным ИИН является бывшим сотрудником!')
      }

            if(err.length) {
        this.disableDoubleClick = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: err.join('; <br>'),
        });
      }

            this.confirmDialog = true
      this.disableDoubleClick = false
    },

        async createCandidate() {
      this.sendingCandidate = true

      try {
        let {data} = await this.axios['post'](`/api/1.0/lov`, {
          first_name_rus: this.firstName.charAt(0).toUpperCase() +this.firstName.slice(1),
          first_name_kaz: this.firstName.charAt(0).toUpperCase() +this.firstName.slice(1),
          last_name_rus: this.lastName.charAt(0).toUpperCase() +this.lastName.slice(1),
          last_name_kaz: this.lastName.charAt(0).toUpperCase() +this.lastName.slice(1),
          middle_name_rus: this.middleName.charAt(0).toUpperCase() +this.middleName.slice(1),
          middle_name_kaz: this.middleName.charAt(0).toUpperCase() +this.middleName.slice(1),
          identification_number: this.iin.trim(),
          department_id: this.department.child_id,
          table_name: 'hr.employee'
        });

              let cryptoid = this.$crypto(String(data.id));
        this.$router.push('/employees/' + cryptoid);
        this.confirmDialog = false
      } catch(err) {
        this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 600,
            title: err.data ? err.data.ERR_MSG : err.msg || err,
          });
      } finally {

                this.$emit("close");

                 this.sendingCandidate = false
      }
    },

    async get_dictionaty() {
      let data = await axios.get('/api/1.0/candidate/department')

      if (checkRoles('41', this.$userData) || checkRoles('39', this.$userData) || checkRoles('40', this.$userData)) { 
        if (checkRoles('40', this.$userData)) {
          this.departments = data.data.filter(item => item.organization_id == this.$userData.fullData.organization_id)
        } else {
          this.departments = data.data
        }
        data.data = data.data.sort((a, b) => { return a.view_priority - b.view_priority; });

              } else {
        this.departments = []
      }
    },
  },
  created() {

  },
  watch: {
    async dialog() {
      if (this.dialog == true) {
        await this.get_dictionaty();
        if (this.inputDepartmentId) {
          this.department = this.departments.find(el=>el.id==this.inputDepartmentId)
          this.regionButton = true
        } else {
          this.regionButton = false
        }
      }
    },
  }
};
</script>