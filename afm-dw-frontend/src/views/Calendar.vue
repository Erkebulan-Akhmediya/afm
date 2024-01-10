<template>
    <div>
        <div class="calendar">
            <v-row>
                <v-col cols="9">
                    <CalendarBlock ref="calendarBlock" @selectEvent="selectEvent" 
                    :getData='getData'
                    :selectedEvent="selectEventData" 
                    :events="events" 
                    @openDialogForEdit="openDialogForEdit" 
                    name="asd"></CalendarBlock>
                </v-col>
                <v-col cols="3">
                    <div class="d-flex flex-column align-start">
                        <div class="d-flex justify-end" style="width: 100%; padding-right: 40px">
                            <v-btn
                                dark
                                color="#3A91C1"
                                style="font-weight: normal"
                                class="addBtn"
                                @click="dialog = true"
                                >
                                <v-icon class="mr-3" dark style="font-weight: 400">
                                    mdi-plus-box-outline
                                </v-icon>
                                {{$t('calendarPage.add')}}
                            </v-btn>
                        </div>
                        <v-dialog
                            
                            @input="v => v || clearEntry()"
                            v-model="dialog"
                            width="800"
                            >
                            <v-card>
                                <v-card-title class="headline blue lighten-2" style="color: #fff">
                                    {{ updateState ? $t('calendarPage.updateEventTitle') : $t('calendarPage.addEventTitle')}}
                                </v-card-title>

                                <v-card-text class="overflow-y-auto" style="padding: 30px">
                                    <!-- {{$t('calendarPage.addEventContent')}} -->
                                    <div>
                                        <v-form>
                                            <v-container>
                                                <v-row>
                                                    <v-col
                                                    cols="12"
                                                    >
                                                    <v-text-field
                                                        v-model="dialogData.name"
                                                        label="Заголовок события"
                                                        required
                                                        outlined
                                                    ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                    cols="12">
                                                        <label for="bodyrus">Описание события</label>
                                                        <div>
                                                        <ckeditor 
                                                        id="bodyrus"
                                                        :editor="editor" v-model="dialogData.description" :config="{
                                                        toolbar: {items: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ], 
                                                        shouldNotGroupWhenFull: true,
                                                        },}"></ckeditor>
                                                        </div>
                                                    </v-col>
                                                    <v-col cols="6">
                                                        <v-select
                                                        required
                                                        outlined
                                                        v-model="dialogData.entry_type_id"
                                                        :items="entryType"
                                                        label="Тип события"
                                                        ></v-select>
                                                    </v-col>
                                                    <v-col cols="6">
                                                    </v-col>
                                                    <v-col cols="4">
                                                        <v-datetime-picker id="pub" :timePickerProps="{format: '24hr', scrollable: true}"
                                                                            clearText="Очистить" 
                                                                            okText="Ок" 
                                                                            dateFormat="dd.MM.yyyy" 
                                                                            label="Дата начала" 
                                                                            required
                                                                            v-model="dialogData.start_date">
                                                            <template slot="dateIcon">
                                                                <span class="mr-4">Дата</span>
                                                                <v-icon>mdi-calendar</v-icon>
                                                            </template>
                                                            <template slot="timeIcon">
                                                                <span class="mr-4">Время</span>
                                                                <v-icon>mdi-clock</v-icon>
                                                            </template>
                                                        </v-datetime-picker>
                                                    </v-col>
                                                    <v-col  cols="4">
                                                        <v-datetime-picker id="pub" :timePickerProps="{format: '24hr', scrollable: true}"
                                                                            clearText="Очистить" 
                                                                            okText="Ок"
                                                                            v-bind:disabled="this.dialogData.is_all_day"
                                                                            v-bind:aria-disabled="true"
                                                                            dateFormat="dd.MM.yyyy" 
                                                                            label="Дата конца" 
                                                                            required
                                                                            v-model="dialogData.end_date">
                                                            <template slot="dateIcon">
                                                                <span class="mr-4">Дата</span>
                                                                <v-icon>mdi-calendar</v-icon>
                                                            </template>
                                                            <template slot="timeIcon">
                                                                <span class="mr-4">Время</span>
                                                                <v-icon>mdi-clock</v-icon>
                                                            </template>
                                                        </v-datetime-picker>
                                                    </v-col>
                                                    <v-col cols="4" >
                                                        <v-checkbox v-bind:value="this.dialogData.is_all_day" hint="Весь день" label="Весь день" v-on:change="on_all_day" >
                                                        </v-checkbox>
                                                    </v-col>
                                                    <v-col
                                                    cols="12"
                                                    >
                                                    <v-text-field
                                                        v-model="dialogData.place"
                                                        label="Место события *"
                                                        required="false"
                                                        outlined
                                                    ></v-text-field>
                                                    </v-col>
                                                    <div style="border: 1px solid #ddd; border-radius: 5px; width: 100%;">
                                                        <v-col>
                                                            <h2>Поиск сотрудников для приглашения (необязательно)</h2>
                                                        </v-col>
                                                        <v-col cols="12">
                                                            <div :style="`display: flex; position: relative; z-index:1; width: 100%; background: #fff; height: 56px; box-sizing: border-box`" >
                                                                <v-text-field class="searchBar" :placeholder="$t('mainPage.search.globalSearch')" v-model="globalSearchVal" @keydown.enter="globalSearch" @keydown="check" style="padding: 7px; border: 1px solid #ddd; border-radius: 5px">
                                                                    <v-icon @click="globalSearch" slot="prepend" color="gray" style="color: #BDBDBD;">mdi-magnify</v-icon>
                                                                </v-text-field>
                                                            </div>
                                                        </v-col>
                                                        <v-col cols="12">
                                                            <EmployeeTableSmallSearch @clickOnRow="selectEmployee" :employeeTable="searchEmployeeTable" :adminUsersForm="false"
                                                            ></EmployeeTableSmallSearch>
                                                        </v-col>
                                                        <v-col cols="12">
                                                            <v-chip-group
                                                                column
                                                            >
                                                                <v-chip
                                                                
                                                                :close="updateState && employee.is_organizer ? false : true"
                                                                @click:close="deleteSelectEmployee(employee.id)"
                                                                v-for="employee in dialogData.participantsList"
                                                                :key="employee.id + dialogData.participantsList.length"
                                                                >
                                                                {{ employee.last_name }}
                                                                {{ employee.first_name }}
                                                                </v-chip>
                                                            </v-chip-group>
                                                        </v-col>

                                                    </div>
                                                </v-row>
                                            </v-container>
                                        </v-form>
                                    </div>
                                </v-card-text>

                                <v-divider></v-divider>

                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="red"
                                    text
                                    @click="dialog = false"
                                >
                                    Отмена
                                </v-btn>
                                <v-btn v-if="updateState"
                                    text
                                    outlined
                                    right
                                    color="primary"
                                    @click="saveUpdateEntry(dialogData.entry_id)"
                                >
                                    Обновить
                                </v-btn>
                                <v-btn v-else
                                    color="green"
                                    text
                                    @click="sendEntry(dialogData)"
                                >
                                    Добавить
                                </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        
                        <div style="border-bottom:2px solid #EBEFF2; margin-bottom: 17px">
                                {{$t('calendarPage.taskToday')}}
                        </div>
                        <div class="messages" v-for="entry in todayEntry" :key="entry.id">
                            <div class="message" style="cursor: pointer" @click="selectWorkToday($event, entry)">
                                <img  :src="entry.src" alt="">
                                <div>
                                    <div class="messageHeader">
                                        {{entry.first_name}} {{entry.last_name}}
                                    </div>
                                    <div class="messageContent">
                                        {{entry.entry_name}} <span class="messageData">{{moment(entry.entry_start).format('HH:mm DD.MM.YYYY')}} </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </v-col>
            </v-row>
        </div>
    <DialogInformation :title="error.title" :body="error.body" :isShow="error.isShow" @hideDialog="error.isShow = !error.isShow">
    </DialogInformation>
    </div>
</template>
<script>
import moment from 'moment'
import editor from '@ckeditor/ckeditor5-build-classic';

export default {
    data: () => ({
    editor,
    error: {
        title: 'Ошибка',
        body: '',
        isShow: false
    },
        moment,
        dialogData: {
            "is_all_day" : false,
            "method": 'post',
            "name": "",
            "place" : "",
            "description": "",
            "entry_type_id": "",
            "entry_status_id": "",
            "start_date": new Date(),
            "end_date": new Date(),
            "participantsList": [],
            "participants": [
                {employee_id: sessionStorage.getItem('userId'), is_organizer: true}
            ]
        },
        dialog: false,
        entryStatus: [],
        entryStatusData: '',
        entryType: [],
        entryTypeData: '',
        todayEntry: [],

                globalSearchVal: '',
        sidebarWidth: document.body.clientWidth - 85,
        searchEmployee: [],
        searchEmployeeTable: [],
        openSearchTopBox: false,
        searchTimeoutId: '',
        updateState: false,
        events: [],
        selectEventData: {}
    }),
    methods: {

              on_all_day(){
            this.dialogData.is_all_day = !this.dialogData.is_all_day
        },

                getTodayEntry(data) {
            this.todayEntry = data
        },
        globalSearch() {
            let params = {
                without_performers: true,
                text: this.globalSearchVal
            }
            this.axios.get(`/api/1.0/search`, {params})
            .then(data => {
                data.data = data.data.filter(i=>!i.is_edited_employee)
                this.searchEmployee = data.data
                this.searchEmployeeTable = data.data
            })
        },

        showNotifications(e) {
            console.log(e.target)
        },
        check(val) {
            if(val.key.length > 1) {
                return
            }
            if(this.searchTimeoutId) {
                clearTimeout(this.searchTimeoutId)
                this.searchTimeoutId = ''
            }
            if (val && this.globalSearchVal) {
                this.searchTimeoutId = setTimeout(() => {
                let params = {
                    without_performers: true,
                    text: this.globalSearchVal
                }
                this.axios.get(`/api/1.0/search`, {params})
                    .then(({data}) => {
                        data = data.filter(i=>!i.is_edited_employee)
                        this.searchEmployee = data
                        this.searchEmployeeTable = data
                        this.searchTimeoutId = ''
                    })
                }, 1000);
            }
        },

        selectEmployee(data) {
            if(data.id == this.dialogData.participants[0].employee_id) {
                this.error.body = 'Нельзя пригласить себя!'
                this.error.isShow = true
                return
            }
            if(this.dialogData.participantsList.findIndex(item => item.id === data.id) == -1) {
                this.dialogData.participantsList.push(data)
            }
        },
        deleteSelectEmployee(id) {
            this.dialogData.participantsList = this.dialogData.participantsList.filter(item => item.id !== id)
        },
        getEntryStatus() {
            this.axios.get(`/api/1.0/lov/ref.entry_status`)
            .then(data => {
                this.entryStatus = this.parseDataForSelect(data.data)
            })
        },
        getEntryType() {
            this.axios.get(`/api/1.0/lov/ref.entry_type`)
            .then(data => {
                this.entryType = this.parseDataForSelect(data.data)
            })
        },

                parseDataForSelect(data) {
            return data.reduce((acc, item) => {
                acc.push({
                    text: item.name,
                    value: item.id
                })
                return acc
            }, [])
        },

        sendEntry(data) {
            if(this.entryValidate(data).length) {
                this.error.body = this.entryValidate(data).join('<br>')
                this.error.isShow = true
                return
            }

            this.dialogData.participantsList.map(item => {
                data.participants.push({employee_id: item.id, is_organizer: false})
            })

                      let bindData = {
                description: data.description,
                end_date: moment(data.end_date).format(),
                entry_status_id: 1,
                entry_type_id: data.entry_type_id,
                name: data.name,
                place: data.place,
                is_all_day: data.is_all_day,
                participants: data.participants,
                start_date: moment(data.start_date).format(),
            }
            this.axios[data.method](`/api/1.0/entry`, bindData)
            .then(() => {
                this.getData()
                this.dialog = false
            })
        },

        entryValidate(data) {
            let err = []
            if(!data.description) {
                err.push('Описание события обязательно!')
            }
            if(!data.start_date) {
                err.push('Дата начала события обязательно!')
            }
            if(data.start_date.valueOf() > data.end_date.valueOf()){
                err.push("Дата завершения должна быть больше!")
            }
            if(!data.end_date) {
                err.push('Дата завершения события обязательно!')
            }
            if(!data.entry_type_id) {
                err.push('Тип события обязателен!')
            }
            if(!data.name) {
                err.push('Название события обязательно!')
            }
            return err
        },

        clearEntry() {
            this.dialogData = {
                "method": 'post',
                "name": "",
                "description": "",
                "entry_type_id": "",
                "entry_status_id": "",
                "start_date": new Date(),
                "end_date": new Date(),
                "participantsList": [],
                "participants": [
                    {employee_id: sessionStorage.getItem('userId'), is_organizer: true}
                ]
            }
        },
        openDialogForEdit(data) {
            this.dialog = !this.dialog;
            this.updateState = !this.updateState;
            data = {
                name: data.name,
                description: data.description,
                start_date: new Date(data.start),
                end_date: new Date(data.end),
                place: data.place,
                is_all_day: data.is_all_day,
                participantsList: data.participants,
                entry_type_id: data.entry_type_id,
                entry_status_id: data.entry_status_id,
                entry_id: data.entry_id,
                "participants": [
                    {employee_id: sessionStorage.getItem('userId'), is_organizer: true}
                ]
            }
            this.dialogData = data;
        },
        async saveUpdateEntry(id) {
            try {                
                let localParams = {
                    id
                }
                await this.axios.put(`/api/1.0/entry/:id`, Object.assign({}, this.dialogData, {
                    start_date: moment(this.dialogData.start_date).format(),
                    end_date: moment(this.dialogData.end_date).format(),
                }), {localParams});
                this.$swal({
                        ...this.$optionAlert.fire,
                        icon: 'success',
                        title: 'Успешно обновлено'  
                    })

                                this.$set(this.selectEventData, 'participants', this.dialogData.participantsList)
                this.$set(this.selectEventData, 'name', this.dialogData.name)
                this.$set(this.selectEventData, 'is_all_day', this.dialogData.is_all_day)
                this.$set(this.selectEventData, 'place', this.dialogData.place)
                this.$set(this.selectEventData, 'description', this.dialogData.description)
                this.$set(this.selectEventData, 'start_date', this.dialogData.start_date)
                this.$set(this.selectEventData, 'end_date', this.dialogData.end_date)
                this.$set(this.selectEventData, 'entry_type_id', this.dialogData.entry_type_id)
                this.$set(this.selectEventData, 'entry_status_id', this.dialogData.entry_status_id)
                this.$set(this.selectEventData, 'entry_type_name', this.entryType.find(item => item.value == this.dialogData.entry_type_id).text)
                this.$set(this.selectEventData, 'entry_status_name', this.entryType.find(item => item.value == this.dialogData.entry_status_id).text)

                this.getData()
                this.dialog = !this.dialog;
                this.clearEntry()

                            } catch (e) {
                console.log(`Error => ${e.message}`)
            }
        },
        parseEntry(data) {

                        return data.reduce((acc, item) => {
                if(item.is_all_day){
                    item.entry_end =  new Date(item.entry_end).setHours(23, 59)
                }
                acc.push({
                    accessEdit: item.participants.filter(item => item.id == sessionStorage.getItem('userId') && item.is_organizer).length, 
                    entry_id: item.entry_id,
                    is_all_day: item.is_all_day,
                    entry_type_id: item.entry_type_id,
                    entry_status_id: item.entry_status_id,
                    entry_status_name: item.entry_status_name,
                    entry_type_name: item.entry_type_name,
                    color: item.color,
                    start_time: item.entry_start,
                    end_time: item.entry_end,
                    end: new Date(item.entry_end).getTime(),
                    start: new Date(item.entry_start).getTime(),
                    timed: true,
                    name: item.entry_name,
                    place: item.place,
                    description: item.entry_description,
                    participants: item.participants
                })

                return acc
            }, [])
        },
        getData() {
            let params = {
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            }
            this.axios.get(`/api/1.0/entry`, {params})
            .then(data => {
                let todayEntry = data.data.filter(item => 
                    moment(item.entry_start).format('DD') <= new Date().getDate() && moment(item.entry_start).format('M') <= new Date().getMonth() + 1
                    && moment(item.entry_end).format('DD') >= new Date().getDate() && moment(item.entry_end).format('M') >= new Date().getMonth() + 1
                )
                this.getTodayEntry(todayEntry)

                this.events = this.parseEntry(data.data)
            })
        },
        selectEvent(data) {
            this.selectEventData = data;
        },
        selectWorkToday(event, data) {
            data = {
                ...data, 
                accessEdit: data.participants.filter(item => item.id == sessionStorage.getItem('userId') && item.is_organizer).length, 
                description: data.entry_description,
                end: new Date(data.entry_end).getTime(),
                start: new Date(data.entry_start).getTime(),
                name: data.entry_name
            }
            this.$refs.calendarBlock.showEvent({nativeEvent: event, event: data});
        }
    },
    created() {
        this.getEntryType()
        this.getEntryStatus()
        this.getData()
    },
    watch: {
        dialog: function(val) {
            if (!val) {
                this.searchEmployee = []
                this.searchEmployeeTable = []
                this.globalSearchVal = "";
                this.clearEntry();
                this.updateState = false;
            }
        },
        todayEntry: async function(){

                      await Promise.all(
                this.todayEntry.map(async (item) => {
                  if (!item.src) {
                    let src = await this.$getVuexStoreFile(item.participants[0].id, 1);
                    this.$set(
                      item,
                      "src",
                      src ? src : require("@/assets/img/default_employee.png")
                    );
                  }
                })
              );

                }
    }
}
</script><style lang="scss" scoped>
    .inactive_date{
        opacity: 0.6;
    }
    .addBtn {
            margin-bottom: 75px;
    }
    .messages {
        margin-bottom: 20px;
        .message img {
            width: 38px;
            height: 40px;
            border-radius: 60%;
            border: 2px solid rgba(58, 145, 193, 0.7);
            margin-right: 25px;
        }

        .message {
            display: flex;
            align-items: center;

            .messageHeader {
                font-weight: 500;
                font-size: 12px;
                line-height: 15px;
                color: #24272C;
            }

            .messageContent {
                font-size: 10px;
                line-height: 13px;
                color: #555555;

                .messageData {
                    font-weight: bold;
                    font-size: 10px;
                    line-height: 15px;
                    color: #F3477A;
                }
            }
        }
    }

    .calendar {
        background: #fff;
    }
</style>