<template>
  <div class="mainBirthdayPage">
    <div style="padding-left: 15px; padding-right: 20px">
      <v-row style="border-bottom: 2px solid #ebeff2; margin-bottom: 10px;">
        <v-col cols="12" class="d-flex justify-space-between ma-0 pa-0 pt-3 pb-1">
          <span style="font-weight: bold; font-size: 1rem;">{{ $t("mainPage.birthdayBlock.birthDays") }}</span>
        </v-col>
      </v-row>
    </div>
    <div
      @scroll="lateLazy"
      class="scrollWrapper"
      style="
        max-height: 350px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 6px;
        position: relative;
      "
    >
      <div
        class="eventCard"
        v-for="employee in employeesBirthday"
        :key="employee.id"
      >
        <v-row>
          <v-col cols="2"
            style="
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              padding-left: 10px;
            "
          >
            <img
              width="100%"
              :src="employee.src"
              :alt="`${employee.last_name_rus} ${employee.first_name_rus}`"
              style="border-radius: 50%; object-fit: cover; width: 30px"
            />
          </v-col>
          <v-col cols="4" class="d-flex justify-start align-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <p
                  class="eventAuthor"
                  style="margin-bottom: 0; margin-left: 5px"
                  v-bind="attrs" v-on="on"
                >
                  <router-link
                    class="eventAuthor"
                    :to="`employees/${$crypto(String(employee.id))}`"
                    >{{ employee.last_name_rus }} <br />
                    {{ employee.first_name_rus }}</router-link
                  >
                </p>
              </template>
              <span>Перейти в карточку</span>
            </v-tooltip>
          </v-col>
          <v-col cols="6" class="d-flex justify-space-around align-center">
            <p style="margin-bottom: 0; color: rgba(0, 0, 0, 0.87)">
              {{ moment(employee.birth_date).format("D MMMM") }}
            </p>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn 
                  icon
                  color="primary"
                  :disabled="isDisableBtn"
                  @click="openDialog(employee)"
                  small
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi mdi-message-text-outline</v-icon>
                </v-btn>
              </template>
              <span>Поздравить</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </div>

      <p v-if="noDataFound">Нет данных</p>
      <p v-if="allData" style="text-align: center; font-size: 13px; margin-top: 30px">Все сотрудники</p>
      <div v-if="!allData && dataLoading" style="position: relative; display: flex; justify-content: center">
        <v-progress-circular
          indeterminate
          color="#2E7EB5"
          size="64"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.mainBirthdayPage {
  background: #fff; 
  
  padding-top: 10px;
  padding-right: 10px;
  padding-bottom: 20px;
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
</style>

<script>
import moment from "moment";
// import Select from '@/components/SelectTitle.vue';
import { mapGetters, mapActions } from "vuex";
export default {
  components: {
    //   Select
  },
  data: () => ({
    dataLoading: false,
    noDataFound: false,
    allData: false,

    offsetEmployeesBirthday: 0,
    limitEmployeesBirthday: 5,
    employeesBirthday: [],
    lastLoadEmployeesBirthday: [],

    moment,
    isDisableBtn: false,
    showTooltip: false
  }),
  computed: {
    ...mapGetters(["CHATS"]),
  },
  methods: {
    ...mapActions([
      "CREATE_CHAT",
      "GET_CHATS_FROM_API",
      "GET_MESSAGES",
      "GET_CHAT_USERS_FROM_API",
      "CHANGE_CHAT_ROOM",
    ]),
    async openDialog(userInfo) {
      this.isDisableBtn = true
      // console.log(userInfo);
      
      let finded = this.CHATS.find(
        (item) =>
          item.name ==
            userInfo.last_name_rus + " " + userInfo.first_name_rus &&
          item.employee_id == userInfo.id
      );
      // console.log(finded);
      if (finded) {
        // await this.$swal({
        //   ...this.$optionAlert.fire,
        //   icon: "warning",
        //   title: `Диалог уже существует`,
        //   timer: 500,
        // });
        await this.$socket.emit("joinRoom", finded.chat_id);
        let messChat = { chat_id: finded.chat_id, offset: 0 };
        this.CHANGE_CHAT_ROOM(finded);

        this.GET_MESSAGES(messChat);
        //получить список участников
        this.GET_CHAT_USERS_FROM_API(finded.chat_id);
        this.$router.push({ path: `/messenger` });
      } else {
        let chatData = {
          chat_name:
            userInfo.last_name_rus +
            " " +
            userInfo.first_name_rus +
            "-" +
            this.$userData.fullData.last_name +
            " " +
            this.$userData.fullData.first_name,
          chat_type: 1,
          users_id: [this.$userData.id * 1, userInfo.id],
        };
       
      var new_chat = await this.CREATE_CHAT(chatData);
      if(new_chat){
        this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `У данного сотрудника нет аккаунта`,
                });
        this.isDisableBtn = false   
        return      
      }
      await this.GET_CHATS_FROM_API();
        let chat = this.CHATS.find(
          (item) =>
            item.name ==
              userInfo.last_name_rus + " " + userInfo.first_name_rus &&
            item.employee_id == userInfo.id
        );
        // console.log(chat);
        await this.$socket.emit("joinRoom", chat.chat_id);
        this.CHANGE_CHAT_ROOM(chat);
        let messChat = { chat_id: chat.chat_id, offset: 0 };
        this.GET_MESSAGES(messChat);
        //получить список участников
        this.GET_CHAT_USERS_FROM_API(chat.chat_id);
         this.$router.push({ path: `/messenger` });
         this.isDisableBtn = false
      }
     
    },

    async getEmployeesBirthday(inType) {
      //console.log(inType)

      try {
        let birthday = await this.axios
          .get(`/api/1.0/employee/1/birthday`, {
            params: {
              limit: this.limitEmployeesBirthday,
              offset: this.offsetEmployeesBirthday,
              birthdays: true
            },
          })

        if (inType == 'lateLazy') {
          
          this.employeesBirthday = [...this.employeesBirthday, ...birthday.data];
        } else if (inType == 'created') {

          if (birthday.data.length == 0) {
            this.noDataFound = true;
          }
          this.employeesBirthday = birthday.data;
        } else {
          alert('not defined (code 98101)')
        }

        this.lastLoadEmployeesBirthday = [...birthday.data];
        this.dataLoading = false;
        //console.log(this.employeesBirthday)
      } catch (err) {
        this.dataLoading = false;

        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          timer: 5000,
          title: err.data?.ERR_MSG ? err.data.ERR_MSG : err,
        });
      }
    },

    lateLazy(e) {
      if (
        e.target.offsetHeight + e.target.scrollTop >=
        e.target.scrollHeight - 1
      ) {
        if (this.dataLoading) {
          return;
        }
        if (this.lastLoadEmployeesBirthday.length >= this.limitEmployeesBirthday) {
          this.offsetEmployeesBirthday += this.limitEmployeesBirthday;
          this.dataLoading = true;
          this.getEmployeesBirthday('lateLazy')
        } else {
          this.allData = true;
          this.dataLoading = false;
        }
      }
    },
  },
  watch: {
    employeesBirthday(val) {
      val.map(async (item) => {
        try {
          this.$set(item, "src", require("@/assets/img/default_employee.png"));
          let src = await this.$getVuexStoreFile(item.id, 1)
          this.$set(
            item,
            "src",
            src ? src : require("@/assets/img/default_employee.png")
          );
        } catch (e) {
          console.log(e);
        }
      });
    },
  },
  created() {
    this.dataLoading = true;
    this.getEmployeesBirthday('created')
  },
};
</script>