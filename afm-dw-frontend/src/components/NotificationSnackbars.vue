<template>

  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <div
        v-click-outside="()=>{if(toggle)toggle = false}"
        >
        <v-btn
          v-bind="attrs"
          v-on="on"
          text
          icon
          @click.stop="openNotifications" 
          >
          <v-badge dot transition="fade-transition"  :color="ALL_NOTIFICATIONS.length?'red':'transparent'">
            <v-icon 
              style="color: grey;" 
              color="grey">
              mdi-bell-outline
            </v-icon>
          </v-badge>
        </v-btn>
        <v-snackbar
          top
          right
          absolute
          color="rgba(0, 0, 0, 0)"
          v-model="toggle"
          style="top: 30px; right: -30px; z-index: 4;"
          max-width="600px"
          min-width="500px"
          elevation="0"
          >
          <div style="max-height: 400px; overflow-y: scroll;">
          <v-alert
            v-for="(v, k) in ALL_NOTIFICATIONS"
            :key="k"
            border="left"
            color="#3f3f3f"
            elevation="3"
            width="100%"
            >
            <v-row 
              align="center"
              >
              <v-col class="grow">
                <p>{{ v.subject }}</p>
                <p>{{ v.description }}</p>
              </v-col>
              <v-col class="shrink">
                <v-btn @click="READ_NOTIFICATION(v)">
                  <v-icon>mdi-check-bold</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>
          <v-alert
            v-if="ALL_NOTIFICATIONS.length == 0"
            border="left"
            color="#3f3f3f"
            elevation="3"
            width="100%"
            >
            <v-row 
              align="center"
              >
              <v-col>
                Новых уведомлений нет
              </v-col>
            </v-row>
          </v-alert>
        </div>
         
        </v-snackbar>
      </div>
    </template>
    <span>Уведомления</span>
  </v-tooltip>
</template>
<script>
import {mapMutations, mapGetters, mapActions} from 'vuex'

export default {
  data () {
    return {
      toggle: false,
      glowing: false
    }
  },
  async mounted () {
    this.GET_NOTIFICATIONS()
  },
  computed: {
    ...mapGetters(["ALL_NOTIFICATIONS"])
  },
  methods: {
    ...mapMutations(['SET_NOTIFICATIONS']),
    ...mapActions(['GET_NOTIFICATIONS', 'READ_NOTIFICATION']),

       async addNotification() {
      let locals = {
        channel: 1, 
        recipients:[36], 
        subject:"Вопрос по событию 235", 
        description:"К вам пришел вопрос от Katrenov.N",
        entity_type_id:5,
        entity_id:2746,

              }

      await this.axios.post('/api/1.0/notification/', locals)
    },
    async openNotifications () {
      this.toggle = !this.toggle
    },

      },
  sockets: {
    async getNotifications () {
      this.GET_NOTIFICATIONS()
    }
  },

  }
</script>