<template>
  <div class="mainLatesPage">
    <div style="padding-left: 15px; padding-right: 20px">
      <v-row style="border-bottom: 2px solid #ebeff2; margin-bottom: 10px;">
        <v-col cols="12" class="d-flex justify-space-between ma-0 pa-0 pt-3 pb-1"> <!--justify-space-between-->
          <span class="font-weight-bold d-flex align-center"
            >Трудовая дисциплина ({{ this.lateEmployees.length }})</span
          >
          <v-spacer/>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn 
                icon
                class="ma-0 pb-0 pr-2"
                small
                color="primary"
                @click="$router.push({ path: `/kpi`, query:{tab: 0, subtab: 1} });"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>
            <span>Детализация</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
    <div
      @scroll="lateLazy"
      class="scrollWrapper"
      style="
        max-height: 445px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 20px;
        position: relative;
      "
    >
      <router-link
        class="eventCard lateCard"
        v-for="employee in lateEmployees"
        :key="employee.id"
        :to="`employees/${$crypto(String(employee.id))}`"
      >
        <v-row>
          <!--Фото и Светофор-->
          <v-col
            cols="2"
            style="
              padding: 0;
              position: relative;
              display: flex;
              justify-content: center;
              align-items: center;
              padding-left: 10px;
            "
          >
            <div style="padding: 0; position: relative">
              <img
                width="100%"
                :src="employee.src"
                :alt="`${employee.last_name} ${employee.first_name}`"
                style="
                  border-radius: 50%;
                  object-fit: cover;
                  max-width: 32px;
                  height: 40px;
                "
              />
              <div
                :class="[
                  `blink`,
                  employee.is_error
                    ? `gray`
                    : employee.is_violator
                    ? `red`
                    : `green`,
                ]"
              ></div>
            </div>
          </v-col>
          <!--ФИО-->
          <v-col class="align-center">
            <p class="eventAuthor" style="margin-bottom: 0">
              {{ employee.last_name }} <br />
              {{ employee.first_name }}
            </p>
          </v-col>
          <!--Данные по входу-->
          <v-col
            class="d-flex align-start justify-center"
            style="font-size: 14px; flex-direction: column"
          >
            <!--Если есть время входа-->
            <p
              v-if="employee.enterTime"
              style="margin-bottom: 0; color: rgba(0, 0, 0, 0.87)"
            >
              {{
                moment(employee.enterTime, `YYYY-MM-DDTHH:mm:ss`).format(
                  "D MMMM"
                )
              }}
              <br />
              в
              {{
                moment(employee.enterTime, `YYYY-MM-DDTHH:mm:ss`).format(
                  "HH:mm"
                )
              }}
            </p>

            <!--Если есть причина отсутствия-->
            <p
              v-if="employee.acs_status != ``"
              style="margin-bottom: 0; color: rgba(0, 0, 0, 0.87)"
            >
              {{ employee.acs_status }}
            </p>
           
            <div
             v-if="employee.is_psbl_explanatory && employee.id == $userData.id && employee.is_violator && $userData.department_name != 'Руководство'"
              style="display: flex; justify-content: flex-end"
            >
              <v-btn
                style="background-color: #2e7eb5; padding-top: 3px"
                outlined
                color="#fff"
                @click.stop.prevent="showRequestDialog(employee)"
                :loading="requestDialogLoader"
                x-small
              >
                Объяснительная
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </router-link>
      <p v-if="isNotLaters">Нет данных</p>
      <p
        v-if="allEmp"
        style="text-align: center; font-size: 13px; margin-top: 30px"
      >
        Все сотрудники
      </p>
      <div
        style="position: relative; display: flex; justify-content: center"
        v-if="!allEmp && loading"
      >
        <v-progress-circular
          indeterminate
          color="#2E7EB5"
          size="64"
        ></v-progress-circular>
      </div>

    
    </div>

    <FastRequests
      :dialog="dialog"
      :employee="userInfo"
      :request_type="request_type"
      :isApplication="true"
      @close="dialogRequestLatesClose"
    />
    <FastRequests
      :dialog="dialogRequest"
      :employee="userInfo"
      :request_type="request_type"
      :isApplication="isApplication"
      @close="dialogRequestClose"
    />
  </div>
</template>

<style scoped lang="scss">
.mainLatesPage {
  background: #fff;

  padding-top: 10px;
  padding-right: 10px;
  padding-bottom: 50px;
  padding-left: 15px;

  border-radius: 10px;
}

.eventCard {
  display: block;
  padding: 20px 10px;
  margin-left: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  margin-bottom: 10px;

  &:hover {
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.18);
  }

  p {
    margin-bottom: 10px;
  }
  .eventTitle {
    font-weight: 500;
    font-size: 15px;
    line-height: 22px;
    letter-spacing: 0.01em;
  }

  .eventDate {
    font-size: 13px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #4c5862;
  }

  .grayText {
    font-size: 13px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #4c5862;
    opacity: 0.5;
  }
  .eventAuthor {
    font-size: 13px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #707683;
  }
  .clickableIcons {
    cursor: pointer;
    color: #c4c4c4;
  }
  .clickableIcons:hover {
    color: #000;
  }
}

.lateCard {
  position: relative;
  .blink {
    display: inline-block;
    width: 10px;
    height: 10px;
    color: #fff;
    font-family: "Roboto Slab", serif;
    font-size: 40px;
    font-weight: 700;
    letter-spacing: 2px;
    border-radius: 50%;
    position: absolute;
    top: 59%;
    right: -2px;

    &.red {
      background-color: rgb(255, 0, 0);
    }
    &.green {
      background-color: rgb(2, 180, 76) !important;
    }
    &.gray {
      background-color: #808080 !important;
    }
  }
  .blink {
    animation-name: blinker;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(1, 2, 0, 1);
    animation-duration: 1s;
    -webkit-animation-name: blinker;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: cubic-bezier(1, 2, 0, 1);
    -webkit-animation-duration: 1s;
  }

  @keyframes blinker {
    from {
      background-color: rgb(150, 0, 0);
    }
    to {
      background-color: rgb(255, 0, 0);
    }
  }

  @-webkit-keyframes blinker {
    from {
      background-color: rgb(150, 0, 0);
    }
    to {
      background-color: rgb(255, 0, 0);
    }
  }
}
</style>

<script>
import moment from "moment";
import FastRequests from "../components/FastRequests.vue";
// import Select from '@/components/SelectTitle.vue';
export default {
  components: {
    FastRequests,
    //   Select
  },
  data: function () {
    return {
      requestDialogLoader: false,
      dialog: false,
      loading: false,
      moment,
      lateEmployees: [],
      isNotLaters: false,
      offsetEmployee: 0,
      limitEmployee: 5,
      lastLoadEmployee: [],
      allEmp: false,

      requestModalType: [],
      requestModalSubType: [],
      dateToPickerState: "",
      dateFromPickerState: "",

      //заявки/заявления
      dialogRequest: false,
      request_type: { req_type: 1, req_subtype: 1 },
      isApplication: false,
      userInfo: {},
    };
  },
  methods: {
    dialogRequestLatesClose(tab) {
      if (tab != 0) {
        let cryptoid = this.$crypto(String(this.userInfo.id));
        this.$router.push("/employees/" + cryptoid);
      }

      this.dialog = false;
      this.activetab = tab;
    },
    dialogRequestClose(tab) {
      if (tab != 0) {
        let cryptoid = this.$crypto(String(this.userInfo.id));
        this.$router.push("/employees/" + cryptoid);
      }

      this.dialogRequest = false;
      this.activetab = tab;
    },
    async showRequestDialog() {
      this.requestDialogLoader = true
      try{
        if (!this.requestModalType.length) {
          await this.getRequestTypes();
          await this.checkType(1);
        }

        this.request_type.dateFrom = moment().format("YYYY-MM-DD")

        let thisEmployee = this.lateEmployees.find(
          (item) => item.id == this.$userData.id
        );
        if (thisEmployee && thisEmployee.enterTime) {

          this.request_type.dateTo = moment(thisEmployee.enterTime).format("YYYY-MM-DD") + ` ${moment(thisEmployee.enterTime).format("HH:mm")}:00`
          
        }
        this.dialog = true;
      } catch(err) {
        console.error(err)
      } finally {
        this.requestDialogLoader = false
      }
    },

    async getRequestTypes() {
      try {
        let { data } = await this.axios.get(`/api/1.0/lov/ref.request_type`);
        //Убираем системное значение
        this.requestModalType = data
          .filter((item) => item.id > 0)
          .reduce((acc, item) => {
            acc.push({
              abbr: item.id,
              state: item.name,
            });
            return acc;
          }, []);
      } catch (error) {
        console.log(error);
      }
      await this.axios.get(`/api/1.0/lov/ref.request_type`).then(({ data }) => {
        //Убираем системное значение
        this.requestModalType = data
          .filter((item) => item.id > 0)
          .reduce((acc, item) => {
            acc.push({
              abbr: item.id,
              state: item.name,
            });
            return acc;
          }, []);
      });
    },

    clearDialog() {
      this.requestData = {
        dateTo: "",
        dateFrom: "",
        type: "",
        subType: "",
        comment: "",
        employeeId: this.$userData.id,
      };
      this.$refs.dateFrom.clearHandler();
      this.$refs.dateTo.clearHandler();
    },

    clearFrom() {
      if (
        this.moment(this.requestData.dateTo).isBefore(
          this.moment(this.requestData.dateFrom)
        )
      ) {
        this.requestData.dateTo = "";
        this.$refs.dateTo.clearHandler();
      }
    },

    dateStrToIso(date) {
      return this.moment(date).toISOString();
    },

    checkType(data) {
      let params = {
        request_type_id: data,
      };
      this.axios
        .get(`/api/1.0/lov/ref.request_sub_type`, { params })
        .then(({ data }) => {
          //Убираем системное значение
          this.requestModalSubType = data
            .filter((item) => item.id > 0)
            .reduce((acc, item) => {
              acc.push({
                abbr: item.id,
                state: item.name,
              });
              return acc;
            }, []);
        });
    },

    getMinMaxDate(isMin) {
      let today = this.moment();
      let result;
      if (isMin) {
        result = today.subtract(3, "days");
        if ([5, 6, 0].includes(result.day())) {
          result = result.subtract(2, "days");
        }
      } else {
        result = today.add(3, "days");
        if ([1, 6, 0].includes(result.day())) {
          result = result.add(2, "days");
        }
      }
      return result.toISOString();
    },

    async saveRequest() {
      let err = [];
      if (!this.requestData.dateFrom) {
        err.push('"Дата с" обязательна для заполнения');
      }
      if (!this.requestData.dateTo) {
        err.push('"Дата по" обязательна для заполнения');
      }
      if (!this.requestData.comment) {
        err.push('"Описание причины" обязательно для заполнения');
      }
      if (!this.requestData.type) {
        err.push('"Тип" обязателен для заполнения');
      }
      if (!this.requestData.subType) {
        err.push('"Подтип" обязателен для заполнения');
      }
      if (
        this.moment(this.requestData.dateTo).isBefore(
          this.moment(this.requestData.dateFrom)
        )
      ) {
        err.push('"Дата с" не может быть позднее "даты по"');
      }
      if (err.length) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 600,
          title: err.join("; <br>"),
        });
      }
      let bindRequest = Object.assign({}, this.requestData);
      bindRequest.dateFrom = this.moment(this.requestData.dateFrom).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      bindRequest.dateTo = this.moment(this.requestData.dateTo).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      // this.formInputs.date_value = new Date(moment().format('YYYY-MM-DD'))
      // this.axios.post(`/api/1.0/request`, bindRequest)
      try {
       
        bindRequest = {
          date_to: "Invalid date",
          date_from: "Invalid date",
          request_type_id: 1,
          request_sub_type_id: 1,
          comment: "",
          employeeId: this.$userData.id,
          details: [
            {
              characteristic_id: 25,
              is_required: true,
              is_active: true,
              value_type_id: 3,
              name: "Дата",
              catalog_name: null,
              value_length: null,
              type: "Дата",
              menu2: false,
              date_value: new Date(moment().format("YYYY-MM-DD")),
              value: new Date(moment().format("YYYY-MM-DD HH:mm:ss")),
            },
            {
              characteristic_id: 21,
              is_required: true,
              is_active: true,
              value_type_id: 1,
              name: "Описание причины",
              catalog_name: null,
              value_length: null,
              type: "Текст",
              value:
                "Отсутствовал с " +
                this.moment(this.requestData.dateFrom).format(
                  "DD-MM-YYYY HH:mm"
                ) +
                " по " +
                this.moment(this.requestData.dateTo).format(
                  "DD-MM-YYYY HH:mm"
                ) +
                " ,по причине: " +
                this.requestData.comment,
            },
          ],
        };

        // console.log("bindRequest")
        // console.log(bindRequest)

        let { data: request_id } = await this.axios.post(
          "/api/1.0/request",
          bindRequest
        );

        await this.axios.post("/api/1.0/approve/request/project", {
          request_id: request_id,
        });

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: `Сохранено`,
        });
        this.clearDialog();
        this.dialog = false;

        let cryptoid = this.$crypto(String(this.$userData.id));
        this.$router.push("/employees/" + cryptoid);
      } catch (err) {
        console.error(err);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: err.data ? err.data.ERR_MSG : err.msg || err,
        });
      } finally {
        this.disableDoubleClick = true;
      }
    },

    async getLateEmp(inType) {
      try {
        let data = await this.axios
          .get(`/api/1.0/employee/1/latecomes`, {
            params: {
              type_code: 'main_lates',
              limit: this.limitEmployee,
              offset: this.offsetEmployee,
              timeZ: -new Date().getTimezoneOffset()
            },
          })

        for (var i = 0; i < data.data.length; i++) {
          data.data[i].is_violator = data.data[i].acsData[0].is_violator;
          data.data[i].is_psbl_explanatory = data.data[i].acsData[0].is_psbl_explanatory;
          data.data[i].enterTime = data.data[i].acsData[0].enterTime;
          data.data[i].acs_status = data.data[i].acsData[0].acs_status;
          data.data[i].is_error = data.data[i].acsData[0].is_error;
        }

        //Убираем тех кого не надо показывать в трудовой дисциплине
        data.data = data.data.filter((item) => item.is_disabled_pacs == false);

        data.data = data.data.map((item) => {
          item.src = "";
          return item;
        });

        if (inType == 'lateLazy') {
          
          this.lateEmployees = [...this.lateEmployees, ...data.data];
        } else if (inType == 'created') {

          if (data.data.length == 0) {
            this.isNotLaters = true;
          }
          this.lateEmployees = data.data;
        } else {
          console.error('not defined (code 98712)')
        }

        this.lastLoadEmployee = [...data.data];
        this.loading = false;
      } catch (err) {
        this.loading = false;

        if (JSON.stringify(err).includes('ECONNABORTED')) {
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 600,
            timer: 5000,
            title: `Превышено время ожидания вызова сервиса СКУД`,
          });
        } else {
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 600,
            timer: 5000,
            title: err.data?.ERR_MSG ? err.data.ERR_MSG : err,
          });
        }
        
      }
    },

    lateLazy(e) {
      if (
        e.target.offsetHeight + e.target.scrollTop >=
        e.target.scrollHeight - 1
      ) {
        if (this.loading) {
          return;
        }
        if (this.lastLoadEmployee.length >= this.limitEmployee) {
          this.offsetEmployee += this.limitEmployee;
          this.loading = true;
          this.getLateEmp('lateLazy')
        } else {
          this.allEmp = true;
          this.loading = false;
        }
      }
    },
  },
  watch: {
    async lateEmployees(val) {
      val.map(async (item) => {
        try {
          if (!item.src) {
            item.src = require("@/assets/img/default_employee.png");
            let src = await this.$getVuexStoreFile(item.id, 1);
            this.$set(
              item,
              "src",
              src ? src : require("@/assets/img/default_employee.png")
            );
          }
        } catch (err) {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: `Ошибка загрузки сотрудников: ${
              err.message || err.ERR_MSG || err
            }`,
          });
        }
      });

      // Ставим себя первым
      if (
        val[0].id != this.$userData.id &&
        val.findIndex((item) => item.id == this.$userData.id) != -1
      ) {
        val.unshift(
          val.splice(
            val.findIndex((item) => item.id == this.$userData.id),
            1
          )[0]
        );
      }
    },
  },

  created() {
    this.loading = false;
    // this.getLateEmp('created')
  }
};
</script>
