<template>
    <div>
        <div class="properties">
            <h2>{{$t('liveNews.allNews')}}</h2>
            <v-container>
                <v-tabs @change="changeTab" target="3" class="tabWrapper tabWithoutUnderline" v-model="current">
                    <v-tab :href="'#news'" class="empTab">Новости</v-tab>
                    <v-tab :href="'#event'" class="empTab">{{$t('globalWords.events')}}</v-tab>
                    <v-tab :href="'#assign'" class="empTab">Назначения</v-tab>
                    <v-tab :href="'#global_news'" class="empTab">Международные</v-tab>

                    <!-- Новости -->
                    <v-tab-item :value="'news'" id="news" class="tabContent mt-10 fullData"> 
                        <EventCards :eventsData="eventsData" @showEvent="showEvent"  v-if="this.eventsData.length">
                        </EventCards>
                    </v-tab-item>
                    <!-- Объявления -->
                    <v-tab-item :value="'event'" id="event" class="tabContent mt-10 fullData"> 
                        <EventCards :eventsData="eventsData" @showEvent="showEvent"  v-if="this.eventsData.length">
                        </EventCards>
                    </v-tab-item>
                     <!-- Назначения -->
                     <v-tab-item :value="'assign'" id="assign" class="tabContent mt-10 fullData"> 
                        <EventCards :eventsData="eventsData" @showEvent="showEvent"  v-if="this.eventsData.length">
                        </EventCards>
                    </v-tab-item>
                    <!-- Новости -->
                    <v-tab-item :value="'global_news'" id="global_news" class="tabContent mt-10 fullData"> 
                        <EventCards :eventsData="eventsData" @showEvent="showEvent"  v-if="this.eventsData.length">
                        </EventCards>
                    </v-tab-item>
                </v-tabs>
                <v-btn @click="getMore" v-if="eventsData.length && this.newsParams.offset + this.newsParams.limit <= eventsData.length">
                    Больше
                </v-btn>
                
                <v-overlay :value="loader">
                    <v-progress-circular
                        indeterminate
                        size="64"
                    ></v-progress-circular>
                </v-overlay>
            </v-container>
        </div>
        
        
        <v-dialog
        v-if="dialogData"
        v-model="dialog"
        width="50%"
        >
        <v-card
        class="dialogOneNews"
        >
            <v-card-text  style="padding: 30px; padding-right: 5px;">
                <!-- <p>{{dialogData.event_id}}</p> -->
            <slot>
                <div class="dialog-wrapper">
                    <div class="mb-6" style="color: #333; font-weight: bold; font-size: 2em; line-height: 1em;">
                    {{dialogData.event_title}}
                    </div>
                <v-skeleton-loader
                  v-if="this.isLoadingFile"
                  class="mx-auto mb-4"
                  max-width="100%"
                  height="400px"
                  type="image"
                >
                </v-skeleton-loader>
              <div>
                <v-window
                  v-if="!this.isLoadingFile && this.dialogData.files"
                  :show-arrows="this.dialogData.files.length > 1"
                  hide-delimiters
                  dark
                >
                  <v-window-item
                    v-for="item in dialogData.files"
                    :key="item.id"
                    
                    contain
                  >
                    <img
                      v-if="checkFormat(item.name) != 'MP4'"
                      :src="item.src"
                      
                       style="
                    width: 100%;
                    max-height: 400px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    overflow: auto;
                  "
                    />
                    <video
                      width="100%"
                      controls
                      controlsList="nodownload"
                      v-if="checkFormat(item.name) == 'MP4'"
                    >
                      <source :src="item.src" type="video/mp4" />
                    </video>
                  </v-window-item>
                </v-window>
              </div>
                    
                    <div v-html="dialogData.event_body"
                        id="newsDialog"
                    ></div>

                    <div class="d-flex justify-end"> 
                        <v-icon >
                            mdi-message
                        </v-icon>
                        <div class="ml-1 pt-1 mr-2" >{{ dialogData.discussion_count }}</div>
                        <v-icon>
                            mdi-eye
                        </v-icon>
                        <div class="ml-1 pt-1">{{ dialogData.views_count }}</div>
                    </div>

                    <v-divider></v-divider>

                    <discussion-area 
                        :event="dialogData" 
                        />
                </div>
            </slot>
            </v-card-text>

            <v-divider></v-divider>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                color="primary"
                text
                @click="dialog = false"
            >
                Закрыть
            </v-btn>
            </v-card-actions>
        </v-card>
        </v-dialog>
    </div>
</template>
<script>
export default {
    data: () => ({
        eventsData: [],
        current : 'news',
        dialog: false,
        dialogData: '',
        src: '',
        loader: true,
        absolute: true,
        overlay: false,
        isLoadingFile: false,

                newsParams: { 
            isVisibleMoreBtn: true,
            limit: 9,
            offset: 0
        },
        showVideoDialog: false
    }),
    methods: {        
        async changeTab() {
            this.newsParams.limit = 9
            this.newsParams.offset = 0
            const types = { 
                "news" : 1,
                "event" : 2,
                "assign" : 3,
                "global_news" : 4
             }
            const type = types[this.current]
            try {
                this.loader = true
                this.eventsData = []
                if(this.current == 'archive') {
                    this.loader = false
                    return
                }
                let params = {
                    offset: this.newsParams.offset,
                    limit: this.newsParams.limit,
                    event_type: type,
                    add_view: true,
                }
                let data = await this.axios.get(`/api/1.0/event`, {params})
                this.loader = false
                data.data.map(item => {
                    item.src = 'load'
                })

                this.eventsData = data.data
                await Promise.all(
                        data.data.map(async item => {
                            if (this.checkFormat(item.file_name) !== 'MP4') {
                                let a = await this.$getVuexStoreFile(item.event_id, 2)
                                item.src = a
                            } 
                    })  
                )
            } catch (error) {
                console.log(error)
                this.loader = false
            }
        },

        async showEvent(item) {
            this.isLoadingFile = true
            try{
                this.dialogData = item
                this.dialog = true
                await this.axios.put(`/api/1.0/views-count/event/${item.event_id}`)
                this.dialogData.src = await this.$getBackendMinioFile(item.event_id, 2)
                 if(this.dialogData.files.length) {
                    for await(let el of this.dialogData.files) {
                        el['src'] = await this.$getBackendMinioFile(el.file_id, 2, el.file_id);
                    }
                    }
            } catch (err) {
                console.error(err)
            } finally {
                this.isLoadingFile = false
            }

        },


               async getMore () {
            this.loader = true
            this.newsParams.offset += this.newsParams.limit

            const type = this.current == 'news' ? 1 : this.current == 'event' ? 2 : 3

            let params = {
                offset: this.newsParams.offset,
                limit: this.newsParams.limit,
                event_type: type,
                add_view: true,
            }
            let data = await this.axios.get(`/api/1.0/event`, {params})
            data.data.map(item => {
                item.src = 'load'
            })
            this.eventsData = [...this.eventsData, ...data.data]
            await Promise.all(
                    data.data.map(async item => {
                        if (this.checkFormat(item.file_name) !== 'MP4') {
                            let a = await this.$getVuexStoreFile(item.event_id, 2)
                            item.src = a
                        }
                })  
            )
            this.loader = false
        },
        checkFormat(str) {
            return str == null ? null : str.toUpperCase().substr(str.lastIndexOf(".") + 1);
        },
    },
    watch: {
        dialog(newVal) {
            if (!newVal) {
                this.dialogData = ''
            }
        },
    },
    created() {
        if(this.currentTab) {
            this.current = this.currentTab
        }
        this.changeTab(this.current)



                    },
    props: ['currentTab']
}
</script><style lang="scss" scoped>
    .loading-container{
        position: relative;
    }
    .loading-circular{
        position: absolute;
        left: 48%;
        top: 46%;
    }
    .properties {
        background-color: #fff;
        padding: 20px;

        h2 {
            font-size: 30px;
        }
    }
    
  .dialog-wrapper {
    max-height: 65vh;
    overflow-y: auto;
    padding-right: 20px;
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: #e6e6e6;
      border-radius: 7px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #9e9e9e;
    }
  }
  
  .oneNews {
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    transition: 0.35s;

    &:hover {
      background-color: rgb(214, 230, 241);
      transition: 0.35s;
    }
  }

  .video-container {
      margin-bottom: 10px;
  }
  .video-container input {
      color: black;
  }
</style>