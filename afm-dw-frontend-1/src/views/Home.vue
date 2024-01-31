<template>
  <div>
    <v-row>
      <v-col cols="9" class="ma-0 pa-2">
        <v-row>
          <v-col cols="12" class="ma-0 pa-2 pb-5">
            <MainApps :allEvents="allEvents" @getMoreEvents="getMoreEvents" :eventParams="eventParams" />  
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6" class="ma-0 pa-2">
            <MainEvents :name="'Назначения'" :allEvents="allAssign" @getMoreEvents="getMoreAssign" :eventParams="assignParams" /> 
            <MainEvents :allEvents="allEvents" @getMoreEvents="getMoreEvents" :eventParams="eventParams" />   
          </v-col>
          <v-col cols="6" class="ma-0 pa-2">
            <MainNews :allNews="allNews" :newsParams="newsParams" @getMoreNews="getMoreNews"/>
          </v-col>
        </v-row>

      </v-col>
      <v-col cols="3" class="ma-0 pa-2">
        <v-row>
          <v-col cols="12" class="ma-0 pa-2 pl-4">
            <MainPersonInfo />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="ma-0 pa-2 pl-4">
            <MainCheckDoc/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="ma-0 pa-2 pl-4">
            <MainBirthday/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="ma-0 pa-2 pl-4">
            <MainLates/>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-overlay :value="loader">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </div>
</template>
<script>
import MainPersonInfo from '../components/MainPersonInfo.vue'
export default {
    components: {
      MainPersonInfo
    },
    data: () => ({
    loader: true,
    newsParams: { 
      isVisibleMoreBtn: true,
      limit: 8,
      offset: 0
    },
    eventParams: { 
      isVisibleMoreBtn: true,
      limit: 4,
      offset: 0
    },
    assignParams: {
      isVisibleMoreBtn: true,
      limit: 4,
      offset: 0
    },
    allNews:[],
    allEvents:[],
    allAssign: []
  }),
  created() {
    this.$router.push('/employees/' + this.$crypto(sessionStorage.getItem('userId')));
  },
  methods: {
    async getEvents(type) {
        let news
        try {
            let params = {
              offset: type == 1 ? this.newsParams.offset : type == 2 ? this.eventParams.offset : this.assignParams.offset,
              limit:  type == 1 ? this.newsParams.limit : type == 2 ? this.eventParams.limit : this.assignParams.limit,
              event_type: type,
              is_start_page: true
            }
            news = await this.axios.get(`/api/1.0/event`, {params})
        } catch (error) {
            throw new Error(error)
        }
        return news.data
    },
    async getMoreNews() {
      this.newsParams.offset += this.newsParams.limit
      let moreNews = await this.getEvents(1)
      if(moreNews.length < this.newsParams.limit) {
        this.newsParams.isVisibleMoreBtn = false
      }

            moreNews.map(item => item.image_link = `temp/randomnews/${this.getRandom()}.jpg`)
      this.allNews = [...this.allNews, ...moreNews]
    },
    async getMoreEvents() {
      this.eventParams.offset += this.eventParams.limit
      let moreEvents = await this.getEvents(2)
      if(moreEvents.length < this.eventParams.limit) {
        this.eventParams.isVisibleMoreBtn = false
      }
      this.allEvents = [...this.allEvents, ...moreEvents]
    },
    async getMoreAssign() {
      this.assignParams.offset += this.assignParams.limit
      let more = await this.getEvents(3)
      if(more.length < this.assignParams.limit) {
        this.assignParams.isVisibleMoreBtn = false
      }
      this.allAssign = [...this.allAssign, ...more]
    },
    getRandom(){
      return Math.floor(Math.random() * 4) + 1; 
    },

      }
}
</script><style scoped>

</style>