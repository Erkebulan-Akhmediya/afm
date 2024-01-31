<template>
    <!-- <v-col :sm="12" v-if="!appeal || (appeal && appeal.appeal_status_id == 3||appeal.appeal_status_id == 4||appeal.appeal_status_id == 44)"> -->
    <!-- <v-row class="pb-1 mb-1" >
        <v-col class="pb-0 mb-0" :sm="12" v-if="!appeal || appeal">
            
        </v-col>
    </v-row> -->

    <v-list-item>
        <v-list-item-avatar>
            <v-img :src="this.avatar"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
            <v-row>
                <v-col class="pb-0" :cols="item.parent_id ? 9 : 10">
                    <v-textarea
                        id="message-input"
                        :label="item.parent_id ? 'Написать ответ' : 'Написать сообщение'"
                        v-model="item.discussion"
                        auto-grow
                        rows="1"
                        row-height="15"
                        :dense="true"
                        hide-details
                    >
                    </v-textarea>
                </v-col>
                <v-col class="input-buttons" :cols="1">
                    <v-btn :loading="is_sending" :disabled="is_sending " icon @click="file = null; addComment()">
                        <v-icon medium>
                            mdi-send
                        </v-icon>
                    </v-btn>
                    <v-file-input
                        style="height: 40px; width: 40px; margin-left: 10px; margin-top: 10px;" 
                        :label="$t('globalWords.addFile')"
                        dense
                        @change="handleFile"
                        v-model="item.file"
                        hide-input
                    >
                    </v-file-input>
                    <v-btn
                        v-if="item.parent_id"
                        icon
                        style="height: 30px; width: 30px; margin-left: 5px; "
                        @click="cancelAnswer"
                    >
                        <v-icon class="ml-2 mr-2" medium>
                            mdi-close
                        </v-icon>
                    </v-btn>
                </v-col>
            </v-row>    

            <v-list-item-subtitle v-if="this.file">
                Вложение: <span> {{ this.file.name }} </span>
                <v-btn icon v-if="this.file" @click="file = null; item.file = null;" style="height: 30px; width: 30px;" >
                    <v-icon medium>
                        mdi-close
                    </v-icon>
                </v-btn>
            </v-list-item-subtitle>
        </v-list-item-content>
    </v-list-item>
</template>
<script>
export default {
    props: ['item', 'appeal', 'event', 'is_sending'],
    data() {
    return {
      avatar: null,  
      file: null,
    };
    },
    methods: {
        addComment() {
            if(this.item.discussion){
                this.item.discussion = this.item.discussion.trim()
            }
            this.$emit('add-comment', this.item)
        },
        cancelAnswer() {
            this.$emit('cancel-answer', this.item)
        },
        handleFile(e){
            this.file = e
        },
        async getUserAvatar(){
            let src = await this.$getVuexStoreFile(this.$userData.id, 1);
            if(src){
                this.avatar = src
            } else {
                this.avatar = require("@/assets/img/default_employee.png");
            }

        }
    },
    mounted () {
      this.getUserAvatar()
    },
}
</script><style >
.input-buttons{
    align-items: center;
    display: flex;
    height: 60px;
    justify-content: flex-start;
    margin-left: 0px!important;
    padding-left: 0px;
}
.discussion-btn{
    position: relative;
    margin-left: 20px;
    height: 28px!important;
}

::-webkit-scrollbar {
    width: 10px;    
}
::-webkit-scrollbar-thumb {
background-color: rgb(170, 170, 170);   
border-radius: 20px;   
}
::-webkit-scrollbar-thumb:hover{
background-color: rgb(155, 155, 155);
}
.file-input input{
  flex-direction: row-reverse;
  width: 70px!important;
  margin-right: 12px;
  height: 34px;
}
.container-box{
  padding: 0px!important;
  margin: 0px!important
}
</style>