<template>

  <v-app style="background-color: #F5F6F8">
    <div @mousemove="mouseMove">
      <router-view/>
      <feedback/>
    </div>
  </v-app>

</template>
<style>
  div{
    scrollbar-width: thin !important;
  }
</style>
<script>
import moment from 'moment'
import Cookies from 'js-cookie'
import Feedback from './components/Feedback/feedback.vue';

export default {
  name: 'App',

   components: {
      Feedback
  },

  data() {
    return {
      ticking: false
    }
  },
  created() {
      let lang = this.$i18n.locale == 'KAZ' ? 'kk' : this.$i18n.locale
      moment.locale(lang);
      document.addEventListener('keypress', this.onKeyPress);
      setInterval(this.onTimeOut, 5000); 
      window.addEventListener('beforeunload', () => {
        Cookies.remove("ticks")
      });
  },

  methods: {
    onTimeOut(){
      if(!Cookies.get("ticks")){
        Cookies.set("ticks", true, { expires : 3650 })
        this.ticking = true
      } 
      if(this.ticking){
        var timeout = parseInt(Cookies.get("timeout"))
        if(sessionStorage.getItem('token')){
          if(isNaN(timeout)){
            Cookies.set("timeout", 0, { expires: 365 })
          }
          if(timeout >= 10800){
            this.logOut()
          } else {  
            timeout += 5
            Cookies.set('timeout', timeout, { expires: 365 })
        } 
      }
      }
      //console.log(timeout)
    },
    mouseMove() {
      Cookies.set("timeout", 0, { expires: 365 })
    },
    onKeyPress() {
      Cookies.set("timeout", 0, { expires: 365 })
    },
    logOut() {
        this.$socket.emit('logout', {user_id: this.$userData.id,  timez: - new Date().getTimezoneOffset()})
        this.$userData = null
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('refresh')
        sessionStorage.removeItem('userId')
        sessionStorage.removeItem('role')
        sessionStorage.removeItem('roleName')
        sessionStorage.removeItem('app')
        Cookies.remove("timeout")
        Cookies.remove("ticks")
        Cookies.remove('lang')
        Cookies.remove('userId')
        Cookies.remove('userName')
        this.$router.go()
        this.$router.push({ path: '/Login' });
        // to logout on all tabs
        localStorage.setItem('logout', 'foobar');
        localStorage.removeItem('logout', 'foobar');
      },
  },
  sockets: {
      connect: function () {
        console.log('socket connected')
      },
      disconnect: function () {
        console.error('socket disconnected')
      },
      getUserId: function() {
        if(this.$userData.id) {
          this.$socket.emit('sendUserId', {user_id: parseInt(this.$userData.id),  timez: - new Date().getTimezoneOffset()})
        }
      }
  },
};
</script>
