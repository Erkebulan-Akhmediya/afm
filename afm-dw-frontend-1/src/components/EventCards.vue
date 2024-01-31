<template>
    <div class="event-table">
        <div class="cards">
            <v-row>
                <v-col cols="6" lg="4" v-for="event in eventsData" :key="event.id">
                    <div class="card" @click="showEvent(event)">
                        
                         <v-skeleton-loader
                        style="height: 12rem;"
                        class="mx-auto mb-4"
                        max-width="100%"
                        max-height= "300px"
                        v-show="event.src == 'load' && checkFormat(event.file_name) !== 'MP4'"
                        type="image"
                        ></v-skeleton-loader>

                        <img v-show="event.src != 'load' " v-if="checkFormat(event.file_name) !== 'MP4'" :src="event.src ? event.src : require('@/assets/img/default_news.jpg')" 
                        alt="" style="width:100%;
                        max-height: 300px; height: 12rem; object-fit: cover; border-radius: 8px;"  >
                        <img  v-if="checkFormat(event.file_name) == 'MP4'" :src="require('@/assets/img/video-file.jpg')" style="max-height:200px">
                        
                        <h3>{{formTitle(event.event_title)}}</h3>
                        <div class="d-flex justify-space-between">
                            <div>
                                <span class="publish_date">{{moment(event.publish_date).format('DD MMMM YYYY в HH:mm')}}</span>
                            </div>
                            <div class="d-flex"> 
                                <v-icon > mdi-message
                                </v-icon>
                                <div class="ml-1 pt-1 mr-2" >{{ event.discussion_count }}</div>
                                <v-icon>
                                    mdi-eye
                                </v-icon>
                                <div class="ml-1 pt-1">{{ event.views_count }}</div>
                            </div>
                        </div>
                    </div>
                </v-col>
            </v-row>
        </div>
    </div>
</template>
<script>
import moment from 'moment'
export default {
    data: () => ({
        src: '',
        loader: false,
        moment,
    }),
    methods: {
        showEvent(data) {
            this.$emit('showEvent', data)
        },

        formTitle(title) {
            title = title.trim()

            if(title.length > 40) {
                return title.slice(0, 40) + '...'
            }
            return title
        },
        checkFormat(str) {
            return str == null ? null : str.toUpperCase().substr(str.lastIndexOf(".") + 1);
        },
    },
    created() {
    },
    props: ['eventsData'],
}
</script><style lang="scss" scoped>
    .cards {
        // display: flex;
        // flex-wrap: wrap;
        // width: 100%;
        // justify-content: space-between;

        .card {

            &:hover {
                background: #eaf2fb;
                transition: 0.5s;
            }
            // width: 30%;
            margin-bottom: 40px;
            cursor: pointer;
            padding: 20px;
            transition: 0.5s;
            border-radius: 10px;

            img {
                object-fit: cover;
                height: 250px;
                margin-bottom: 15px;
            }
            h3 {
                font-weight: bold;
                font-size: 18px;
            }

            .publish_date {
                display: inline-block;
            }
        }
    }
    .player-container {
            //border: 1px solid rgb(78, 75, 75);
            background-color: rgb(88, 87, 87);
            padding: 1;
        }
</style>