<template>
    <v-list-item>
        <v-list-item-avatar>
            <v-img :src="item.src"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
            <v-list-item-title style="max-height : 22px!important; overflow: visible!important;" class="pb-0 mb-1">
                <v-row >
                    <v-col> 
                        {{name}} <span class="comments-date">{{date}}</span>
                    </v-col>
                    <v-col class="text-right pt-0 mt-1">
                        <v-btn
                            class="mb-10"
                            icon
                            v-if = "isCommentManager || (appeal && item.create_user == $userData.id)"
                            @click="deleteDiscussion"
                            >
                            <v-icon>
                                mdi-close
                            </v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-list-item-title>
            <div style="width: 80%; white-space: pre-wrap!important;" v-if="item.discussion && item.discussion != 'undefined'">{{ item.discussion }}</div>
            <v-list-item-subtitle class="mt-1" v-if="item.file_name">
                Вложение: 
                <span
                    @click="$downloadFile(item)"
                    style="color: #1976d2; cursor: pointer"
                    >
                    {{ item.file_name }}
                </span>
            </v-list-item-subtitle>
            
            <v-list-item-subtitle>
                <v-col class="text-left">
                <v-btn 
                    
                    :max-height="20" 
                    class="comment-btn" 
                    @click="editingDiscussionAddParent">
                    Ответить
                </v-btn>
                
                </v-col>
            </v-list-item-subtitle>

            <v-list-item-subtitle
                v-if = "isEditing" 
                >
                <discussion-form 
                    :item="item"
                    @add-comment = "saveComment"
                    />
            </v-list-item-subtitle>

            <v-list-item-subtitle
                v-if = "isAnswering"
                >
                <discussion-form 
                    :is_sending="is_sending"
                    :item="{parent_id: item.id}"
                    @cancel-answer = "cancelAnswer"
                    @add-comment = "addAnswer"
                    />
            </v-list-item-subtitle>
            <v-list-item-subtitle>
                <v-list>
                    <answer-card 
                        :is_appeal="appeal?true:false"
                        v-for="(item, index) in answers" 
                        :key="index" 
                        :item="item" 
                        @delete-discussion="deleteAnswer"
                        />
                </v-list>

                <v-btn
                    v-if="!commentsIsDone"
                    color="primary"
                    text
                    @click="loadMoreComments"
                >
                    Загрузить еще
                </v-btn>

            </v-list-item-subtitle>

        </v-list-item-content>

    </v-list-item>
</template>
<script>
import moment from 'moment'
import checkRoles from '@/utils/check_role'
export default {
    props: ['item', 'event', 'appeal'],
    data() {
        return {
            isEditing: false,
            isAnswering: false,
            answers: [],
            commentsIsDone: false,
            offset: 0,
            is_sending: false
        }
    },
    watch:{
        item () {
            this.answers = this.item.answers
        },
        answers () {
            if(this.answers){
                if(this.answers.length) {
                    this.answers.map(async item => {
                        if (!item.src) {
                            this.$set(item, 'src', require('@/assets/img/default_employee.png'))
                            let src = await this.$getVuexStoreFile(item.image_id, 1);
                            this.$set(item, 'src', src ? src : require('@/assets/img/default_employee.png'))
                        }
                    })
                }
                this.item.answers = this.answers
            }
        }
    },
    async mounted() {
        this.answers = this.item.answers = await this.loadAnswers()
        this.offset += this.answers.length
        if(this.answers.length < 4) this.commentsIsDone = true
    },
    methods: {
        deleteAnswer(id){
            this.answers = this.answers.filter(item => item.id != id)
        },
        async loadAnswers(){
            let params = {
                parent_id: this.item.id,
                limit: 4,
                offset: this.offset,
                object_id: this.event ? this.event.event_id : this.appeal.id, 
                object_name: this.event ? 'EVENT' : 'APPEAL',
            }
            const responseData = await this.axios.get(`/api/1.0/discussion`, {params})
            return responseData.data
        },
        async loadMoreComments(){
            let newData = await this.loadAnswers()
            this.offset += newData.length
            if(newData.length < 4) this.commentsIsDone = true
            this.answers = this.answers.concat(newData)
        },
        editingDiscussionAddParent() {
            this.isAnswering = true
        },
        setEditingDiscussion() {
            this.isEditing = true
        },
        async deleteDiscussion() {

            this.$swal({
                title: `Вы действительно хотите удалить комментарий?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        let locals = { 
                            is_deleted: true
                        }

                        await this.axios.put(`/api/1.0/discussion/${this.item.id}`, locals)
                        this.$emit('delete-discussion', this.item.id)

                        this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "success",
                        title: "Комментарий удален.",
                        });
                    } catch (error) {
                        this.$swal({
                        ...this.$optionAlert.fire,
                        icon: "error",
                        title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
                        });
                    }
                }
            });

        },
        async saveComment(event) {
            this.$emit('save-comment', event)
            this.isEditing = false
        },
        cancelAnswer() {
            this.isAnswering = false
        },
        fileUpload: async function (object_id, file) {
            if (file) {
                const form = new FormData();
                form.append("file", file);
                form.append("fileType", "discussion");
                form.append("file_type_id", 13);
                form.append("object_id", object_id);
                await this.axios.post(`/api/1.0/discussion-file`, form);
            }
        },
        async addAnswer(event) {
            this.is_sending = true;
            try{
                if(event.discussion || event.file) {
                    let method = event.id? 'put':'post'

                    let locals = {
                        object_id: this.event ? this.event.event_id : this.appeal.id, 
                        object_name: this.event ? 'EVENT' : 'APPEAL',
                        discussion: event.discussion, 
                        parent_id: event.parent_id,
                        is_private: this.is_private?this.is_private:false
                    }

                    const responseCommentId = await this.axios[method](`/api/1.0/discussion${event.id?'/'+event.id:''}`, locals)

                    const newCommentId = responseCommentId.data.id
                    if (method === 'post') {
                        await this.fileUpload(newCommentId, event.file)
                    }


                                        let params = {
                        object_name: this.event ? 'EVENT' : 'APPEAL',
                    };
                    const responseData = await this.axios.get(`/api/1.0/discussion/${event.id?event.id:newCommentId}`, { params })

                                        const newComment = responseData.data[0]
                    if(!event.id) {
                        if (!this.answers) {
                            this.answers = []
                        }
                        this.answers.unshift(newComment)
                        this.offset += 1
                    }
                }

                }catch(err){
                    console.error(err)
                } finally {
                    this.is_sending = false;
                }
            this.isAnswering = false
        },
    },
    computed: {

        isCommentManager() {
            return checkRoles('15', this.$userData)
        },
        name() {
            return this.item.first_name + " " + this.item.last_name
        },
        date() {
            let date = this.item.create_date
            if (!date) {
                return '';
            }

            return moment(date).add(moment(new Date()).utcOffset(), 'minutes').format('DD MMMM, HH:mm')
        }
        }
}
</script>