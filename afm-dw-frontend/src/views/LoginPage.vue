<template>
  <div v-if="isLicence && configCode == 'afm'">
    <div class="LoginPage_afm d-flex">

      <v-container class="loginContainer align-center d-flex"
        :style="'min-heigt:100vh'"
      >
        <div class="loginWrapper">
          <div>
            <div class="grid-container" style="margin-top: 10px;">
              <div class="item1">
                <v-img width="80" src="../assets/img/login/logo_afm.png"></v-img>
              </div>
              <div class="item2" style="margin-top: 10px">
                <span style="color: #001d2f; font-size: 30px;">
                  АФМ РК
                </span>
              </div>
              <div class="item3" style="margin-top: 12px">
                <span style="color: #001d2f; font-size: 14px;">
                  АИС Цифровое рабочее место
                </span>
              </div>
            </div>

            <v-form style="margin-top: 20px;"
              ref="form"
              v-model="valid"
              lazy-validation
            >
              <v-text-field
                @keydown.enter="validate"
                v-model="login"
                :rules="loginRules"
                label="Логин"
                required
              ></v-text-field>
              <v-text-field
                @keydown.enter="validate"
                v-model="pass"
                :rules="passRules"
                label="Пароль"
                required
                type="password"
                class="mb-5"
              ></v-text-field>
              <v-btn
                :disabled="!valid"
                color="#36A9E1"
                dark
                class="cta mb-5"
                @click="validate"
                :loading="loader"
              >
                Вход
              </v-btn>
            </v-form>
          </div>
        </div>
      </v-container>
    </div>
  </div>

  <div v-else>
    <v-card v-if="licenceErrorDesc">
      <v-card-title>АИС "Цифровое рабочее место"</v-card-title>
      <v-card-text style="color: red">{{licenceErrorDesc}}</v-card-text>
    </v-card>
  </div>
</template>
<script>
  import Cookies from 'js-cookie'
  import moment from 'moment'

  export default {
    data: () => ({
      loader: false,
      valid: true,
      login: '',
      loginRules: [
        v => !!v || 'Логин обязателен!'
      ],
      pass: '',
      passRules: [
        v => !!v || 'Пароль обязателен!',
      ],

      isLicence: false,
      licenceErrorDesc: '',
      configCode: ''
    }),

    methods: {
      validate () {
        if(this.$refs.form.validate()) {
          this.sendLogin()
        }
      },

      sendLogin() {
        this.loader = true

        this.axios.post('/api/1.0/auth/login', {
            username: this.login,
            password: this.pass
          }
        ).then(async login => {
          if(!login.data) {
            return ('Ошибка сервера')
          }
          if(!login.data.access_token) {
            throw ('Ошибка авторизации')
          }

          this.$i18n.locale = login.data.lang_code
          this.axios.defaults.params = {
              lang: login.data.lang_code,
          };
          Cookies.remove("timeout")
          Cookies.remove("ticks")
          sessionStorage.setItem('token', login.data.access_token);
          sessionStorage.setItem('refresh', login.data.refresh_token);
          sessionStorage.setItem('userId', login.data.user_id)
          sessionStorage.setItem('lang', login.data.lang_code)
          sessionStorage.setItem('role', login.data.role_id)
          sessionStorage.setItem('roleName', login.data.role_name)
          let {data: {0: userData}} = await this.axios.get(`/api/1.0/employee/:id`, {localParams: {id: login.data.user_id}})
          userData.child_department_list = JSON.parse(userData.child_department_list)
          sessionStorage.setItem('userdata', JSON.stringify(userData))
          this.$userData.iin = userData.identification_number
          this.$userData.department_name = userData.department_name_rus
          this.$socket.emit('sendUserId', {user_id: login.data.user_id,  timez: - new Date().getTimezoneOffset()})


          Cookies.set('lang', login.data.lang_code, { expires: 365 })
          Cookies.set('userId', login.data.user_id, { expires: 365 })
          Cookies.set('userName', `${userData.last_name} ${userData.first_name}`, { expires: 365 })

          this.$store.commit('role', login.data.role_id)
          this.$store.commit('roleName', login.data.role_name)

          moment.locale(login.data.lang_code == 'RUS' ? 'ru' : 'kk');

          localStorage.setItem('login', JSON.stringify(sessionStorage));
          localStorage.removeItem('login');

          this.loader = false
          if (JSON.parse(sessionStorage.getItem('userdata')).is_performer == true) {
            this.$router.push({ path: '/servicerequests' });
          } else {
            this.$router.push({ path: '/' });
          }

                  }, (err) => {
          this.loader = false
          this.$swal({
              ...this.$optionAlert.fire,
              icon: 'error',
              title: err.data.message
          })
        }).catch(err => {
          this.loader = false
          this.$swal({
              ...this.$optionAlert.fire,
              icon: 'error',
              title: err.data.message
          })
        })
      }
    },
    async created() {
      try {
        const configData = await this.axios.get(`/api/1.0/app/config`)
        this.isLicence = true
        this.configCode = configData.data[0].code
        sessionStorage.setItem('app', configData.data[0].code);
      } catch (err) {
        this.isLicence = false
        this.licenceErrorDesc = err.data?.message || err
      }
    },
  }
</script><style lang="scss" scoped>
  .item1 { grid-area: item1; }
  .item2 { grid-area: item2; }
  .item3 { grid-area: item3; }

  .grid-container {
    display: grid;
    grid-template-columns: 100px auto;
    grid-template-rows: 35px;
    grid-template-areas:
      'item1 item2'
      'item1 item3';
  }

  h1 {
    color: #36A9E1;
  }

  .viewport-header {
    position: relative;
    height: 100vh;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .LoginPage_base {
    background-size: cover;
    background-color: #000000;
    background-position: center;
    width: 100%;
    height: 100vh;

    .loginWrapper {
      // background: rgba(1, 4, 10, 0.65);
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 47%;
      min-width: 500px;

      & > div {
        background: #fff;
        padding: 17px 55px;
        width: 50%;
        border-radius: 20px;
      }

      input {
        background: #FFFFFF;
        border: 1px solid #524040;
        box-sizing: border-box;
        border-radius: 12px;
        color: #707683;
      }

      .cta {
        width: 100%;
      }
    }
  }

  .LoginPage_afm {
    background-image: url('../assets/img/login/background.jpg');
    background-size: cover;
    background-color: #424B50;
    background-position: center;
    width: 100%;
    height: 100vh;

    .loginWrapper {
      // background: rgba(1, 4, 10, 0.65);
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 47%;
      min-width: 500px;

      & > div {
        background: #fff;
        padding: 17px 55px;
        width: 50%;
        border-radius: 20px;
      }

      input {
        background: #FFFFFF;
        border: 1px solid #524040;
        box-sizing: border-box;
        border-radius: 12px;
        color: #707683;
      }

      .cta {
        width: 100%;
      }
    }
  }

  #backgroundVideo {
    object-fit: cover;
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
  }
</style>