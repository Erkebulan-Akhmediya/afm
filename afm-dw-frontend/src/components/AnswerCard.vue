<template>
  <v-list-item>
        <v-list-item-avatar>
            <v-img :src="item.src"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
                <v-row class="pb-0 mb-2" style="max-height : 24px!important; overflow: visible!important;" >
                    <v-col >
                        {{name}}  
                        <span class="comments-date">{{date}}</span>
                    </v-col>
                    <v-col class="text-right pt-0 mt-0">
                        <v-btn
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
            <div style="width : 80%; white-space: pre-wrap!important;" v-if="item.discussion && item.discussion != 'undefined'">{{ item.discussion  }}</div>
            <v-list-item-subtitle class="mt-1"  v-if="item.file_name">
                Вложение: 
                <span
                    @click="$downloadFile(item)"
                    style="color: #1976d2; cursor: pointer"
                    >
                    {{ item.file_name }}
                </span>
            </v-list-item-subtitle>
            <v-list-item-subtitle>
                <!--
                <v-btn @click="setEditingDiscussion">Изменить</v-btn>
                -->
            </v-list-item-subtitle>

            <v-list-item-subtitle
            
                v-if = "isEditing" 
                >
                <discussion-form 
                    :item="item"
                    @add-comment = "saveComment"
                    />
            </v-list-item-subtitle>
        </v-list-item-content>
  </v-list-item>
</template>
<script>
import moment from 'moment'
import checkRoles from '@/utils/check_role'
export default {
    props: ['item', 'is_appeal'],
    data() {
        return {
            isEditing: false
        }
    },
    methods: {
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
        }
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