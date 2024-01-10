<template>
  <v-dialog v-model="dialog" max-width="700px" @click:outside="$emit('close')" @keydown.esc="$emit('close')">
  <!--click:outside нужен чтобы передать событие закрытия диалога родителю-->
    <v-card>
      <!-- <v-card-title class="text-h5 blue lighten-2" style="color: #fff; margin-bottom: 20px">
        <span class="text-h5">Редактирование кандидата</span>
      </v-card-title> -->
      <v-card-title style="background-color: #1976d2;">
        Редактирование кандидата
      </v-card-title>
      <br/>
      <v-card-text>
        <v-container>
          <v-form>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  label="Фамилия"
                  v-model.trim="last_name"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Имя"
                  v-model.trim="first_name"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Отчество"
                  v-model.trim="middle_name"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Адрес места рождения"
                  v-model.trim="placeOfBirth"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Адрес места проживания"
                  v-model.trim="placeOfResidence"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  :items="genders"
                  v-model="gender"
                  label="Пол"
                  item-text="name_rus"
                  return-object
                  dense
                ></v-select> 
              </v-col> 
              <v-col cols="6">
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="date"
                      label="Дата рождения"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      dense
                      clearable
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date"
                    :active-picker.sync="activePicker"
                    :max="
                      new Date(
                        Date.now() - new Date().getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .substr(0, 10)
                    "
                    min="1950-01-01"
                    @change="save"
                  ></v-date-picker>
                </v-menu>
              </v-col> 
              <v-col cols="6">
                <v-text-field
                  label="Мобильный телефон"
                  v-model.trim="mobile_phone"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="Рабочий телефон"
                  v-model.trim="work_phone"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Email"
                  v-model.trim="email"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select
                  :items="marital_statuses"
                  v-model="marital_status"
                  label="Семейное положение"
                  item-text="name_rus"
                  return-object
                  dense
                  required
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  :items="nationalities"
                  v-model="nationality"
                  label="Национальность"
                  item-text="name_rus"
                  return-object
                  dense
                  required
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  :items="religions"
                  v-model="religion"
                  label="Отношение к религии"
                  item-text="name_rus"
                  return-object
                  dense
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Аккаунты в соц.сетях"
                  v-model.trim="socialMediaAddress"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Наличие негативных зависимостей"
                  v-model="negative"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Увлечения"
                  v-model="hobbies"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Прочая информация"
                  v-model="otherInfo"
                  dense
                ></v-text-field>
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
        <v-btn color="green" :disabled="disableDoubleClick" text @click="saveEmployee()">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: ["dialog", "employee"],

  data: () => ({
    disableDoubleClick: false,
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    work_phone: "",
    mobile_phone: "",
    placeOfBirth: "",
    placeOfResidence: "",
    socialMediaAddress: "",


            email_id: "",
    work_phone_id: "",
    mobile_phone_id: "",
    placeOfBirth_id: "",
    placeOfResidence_id: "",
    socialMediaAddress_id: "",

    gender: {},
    genders: [],

    activePicker: null,
    date: null,
    menu: false,
    marital_statuses: [],
    marital_status: {},
    nationalities: [],
    nationality: {},
    religions: [],
    religion: {},
    negative: "",
    hobbies: "",
    otherInfo: "",
  }),
  computed: {},
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    async saveEmployee() {
      this.disableDoubleClick = true
      let err = []

      if(!this.last_name) {
        err.push('"Фамилия" обязателен для заполнения')
      }
      if(!this.first_name) {
        err.push('"Имя" обязателен для заполнения')
      }
      if(!this.placeOfBirth) {
        err.push('"Адрес места рождения" обязателен для заполнения')
      }
      if(!this.placeOfResidence) {
        err.push('"Адрес места проживания" обязателен для заполнения')
      }
      if(!this.gender.id) {
        err.push('"Пол" обязателен для заполнения')
      }
      if(!this.date) {
        err.push('"Дата рождения" обязателен для заполнения')
      }
      if(!this.mobile_phone) {
        err.push('"Мобильный телефон" обязателен для заполнения')
      }
      if(!this.marital_status.id) {
        err.push('"Семейное положение" обязателен для заполнения')
      }
      if(!this.nationality.id) {
        err.push('"Национальность" обязателен для заполнения')
      }
      if(!this.religion.id) {
        err.push('"Отношение к религии" обязателен для заполнения')
      }
      if(!this.socialMediaAddress) {
        err.push('"Аккаунты в соц.сетях" обязателен для заполнения')
      }
      if(!this.negative) {
        err.push('"Наличие негативных зависимостей" обязателен для заполнения')
      }
      if(!this.hobbies) {
        err.push('"Увлечения" обязателен для заполнения')
      }
      if(!this.otherInfo) {
        this.otherInfo = '' 
      }
      if(!this.middle_name) {
        this.middle_name = '' 
      }
      if(!this.email) {
        this.email = '' 
      }
      if(!this.work_phone) {
        this.work_phone = '' 
      }

            if(err.length) {
        this.disableDoubleClick = false
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: err.join('; <br>'),
        });
      }

      try{

        let method = "put";
        let url = `/api/1.0/lov/` + this.employee.id;

        await this.axios[method](url, {
          first_name_rus: this.first_name.charAt(0).toUpperCase() + this.first_name.slice(1).toLowerCase(),
          last_name_rus: this.last_name.charAt(0).toUpperCase() + this.last_name.slice(1).toLowerCase(),
          middle_name_rus: this.middle_name.charAt(0).toUpperCase() +this.middle_name.slice(1),
          gender_id: this.gender.id,
          birth_date: this.date,
          marital_status_id: this.marital_status.id,
          nationality_id: this.nationality.id,
          religion_id: this.religion.id,
          negative_dependency: this.negative,
          other_interest: this.hobbies,
          other_information: this.otherInfo,
          id: this.employee.id,
          table_name: "hr.employee",
        });

        method = 'post'
        url = `/api/1.0/lov`
        if (this.work_phone_id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.work_phone_id
        }
        await this.axios[method](url, {
          contact_info_type_id: 3,
          name_rus: this.work_phone,
          name_kaz: this.work_phone,
          employee_id: this.employee.id,
          table_name: "hr.employee_contact_info",
        });

        method = 'post'
        url = `/api/1.0/lov`
        if (this.placeOfBirth_id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.placeOfBirth_id
        }
        await this.axios[method](url, {
          contact_info_type_id: 2,
          name_rus: this.placeOfBirth,
          name_kaz: this.placeOfBirth,
          employee_id: this.employee.id,
          table_name: "hr.employee_contact_info",
        });

        method = 'post'
        url = `/api/1.0/lov`
        if (this.placeOfResidence_id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.placeOfResidence_id
        }
        await this.axios[method](url, {
          contact_info_type_id: 1,
          name_rus: this.placeOfResidence,
          name_kaz: this.placeOfResidence,
          employee_id: this.employee.id,
          table_name: "hr.employee_contact_info",
        });

        method = 'post'
        url = `/api/1.0/lov`
        if (this.socialMediaAddress_id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.socialMediaAddress_id
        }
        await this.axios[method](url, {
          contact_info_type_id: 9,
          name_rus: this.socialMediaAddress,
          name_kaz: this.socialMediaAddress,
          employee_id: this.employee.id,
          table_name: "hr.employee_contact_info",
        });

        method = 'post'
        url = `/api/1.0/lov`
        if (this.mobile_phone_id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.mobile_phone_id
        }
        await this.axios[method](url, {
          contact_info_type_id: 4,
          name_rus: this.mobile_phone,
          name_kaz: this.mobile_phone,
          employee_id: this.employee.id,
          table_name: "hr.employee_contact_info",
        });

        method = 'post'
        url = `/api/1.0/lov`
        if (this.email_id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.email_id
        }
        await this.axios[method](url, {
          contact_info_type_id: 5,
          name_rus: this.email,
          name_kaz: this.email,
          employee_id: this.employee.id,
          table_name: "hr.employee_contact_info",
        });

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: "Данные сохранены",
        });

        this.$emit("close");
      } catch (err){
        console.error(err)
      } finally {
        this.disableDoubleClick = false
      }
    },

    async get_dictionaty() {
      let data = await this.axios.get(`/api/1.0/candidate/dictionary`);

      data.data.gender = data.data.gender.filter(item => item.id > 0)
      data.data.marital_status = data.data.marital_status.filter(item => item.id > 0)
      data.data.nationality = data.data.nationality.filter(item => item.name_rus != ' ' && item.id > 0)

      this.genders = data.data.gender;
      this.gender = this.genders.find((el) => el.id == this.employee.gender_id)?this.genders.find((el) => el.id == this.employee.gender_id):{};

      this.marital_statuses = data.data.marital_status;
      this.marital_status = this.marital_statuses.find(el=>el.id==this.employee.marital_status_id) ? this.marital_statuses.find(el=>el.id==this.employee.marital_status_id) : {}

            this.nationalities = data.data.nationality;
      this.nationality = this.nationalities.find(el=>el.id==this.employee.nationality_id) ? this.nationalities.find(el=>el.id==this.employee.nationality_id) : {}

            this.religions = data.data.religion
      this.religion = this.religions.find(el=>el.id==this.employee.religion_id) ? this.religions.find(el=>el.id==this.employee.religion_id) : {}

      this.first_name = this.employee.first_name;
      this.last_name = this.employee.last_name;
      this.middle_name = this.employee.middle_name;
      this.date = this.employee.employee_birth_date
      this.negative = this.employee.negative_dependency
      this.hobbies = this.employee.other_interest
      this.otherInfo = this.employee.other_information

            this.placeOfBirth = this.employee.contacts.find(el=>el.contact_info_type_id == 2) ? this.employee.contacts.find(el=>el.contact_info_type_id == 2).contact : '';
      this.placeOfBirth_id = this.employee.contacts.find(el=>el.contact_info_type_id == 2) ? this.employee.contacts.find(el=>el.contact_info_type_id == 2).id : '';

            this.placeOfResidence = this.employee.contacts.find(el=>el.contact_info_type_id == 1) ? this.employee.contacts.find(el=>el.contact_info_type_id == 1).contact : '';
      this.placeOfResidence_id = this.employee.contacts.find(el=>el.contact_info_type_id == 1) ? this.employee.contacts.find(el=>el.contact_info_type_id == 1).id : '';

            this.socialMediaAddress = this.employee.contacts.find(el=>el.contact_info_type_id == 9) ? this.employee.contacts.find(el=>el.contact_info_type_id == 9).contact : '';
      this.socialMediaAddress_id = this.employee.contacts.find(el=>el.contact_info_type_id == 9) ? this.employee.contacts.find(el=>el.contact_info_type_id == 9).id : '';

      this.work_phone = this.employee.contacts.find(el=>el.contact_info_type_id == 3) ? this.employee.contacts.find(el=>el.contact_info_type_id == 3).contact : '';
      this.work_phone_id = this.employee.contacts.find(el=>el.contact_info_type_id == 3) ? this.employee.contacts.find(el=>el.contact_info_type_id == 3).id?this.employee.contacts.find(el=>el.contact_info_type_id == 3).id: '' : '';

            this.mobile_phone = this.employee.contacts.find(el=>el.contact_info_type_id == 4) ? this.employee.contacts.find(el=>el.contact_info_type_id == 4).contact : '';
      this.mobile_phone_id = this.employee.contacts.find(el=>el.contact_info_type_id == 4) ? this.employee.contacts.find(el=>el.contact_info_type_id == 4).id?this.employee.contacts.find(el=>el.contact_info_type_id == 4).id: '' : '';

            this.email = this.employee.contacts.find(el=>el.contact_info_type_id == 5) ? this.employee.contacts.find(el=>el.contact_info_type_id == 5).contact : '';
      this.email_id = this.employee.contacts.find(el=>el.contact_info_type_id == 5) ? this.employee.contacts.find(el=>el.contact_info_type_id == 5).id : '';
    },
  },
  created() {
  },
  watch: {
    menu(val) {
      val && setTimeout(() => (this.activePicker = "YEAR"));
    },
    dialog() {
      if (this.dialog == true) {
        this.get_dictionaty();
      }
    },
  },
};
</script>