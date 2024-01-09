<template>
  <v-row class="fill-height calendarBlock">
    <v-col>
      <v-sheet height="64">
        <v-toolbar
          flat
          class="ps-0"
        >
          <v-btn
            outlined
            class="mr-4 btnStyled"
            color="#5787A4"
            @click="setToday"
          >
            <v-icon small class="mr-3">
              mdi-calendar
            </v-icon>
            {{getTodayForCalendar()}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="prev"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar" style="width: 150px; text-align: center">
            {{ getTitleCalendar() }}
          </v-toolbar-title>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="next"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          
          <v-btn
            outlined
            :class="['mr-4', type == 'month' ? 'activeBtn' : '', 'btnStyled']"
            color="#b8b8b8"
            @click="type = 'month'"
          >
            {{$t('calendarPage.month')}}
          </v-btn>
          <v-btn
            outlined
            :class="['mr-4', type == 'week' ? 'activeBtn' : '', 'btnStyled']"
            color="#b8b8b8"
            @click="type = 'week'"
          >
            {{$t('calendarPage.week')}}
          </v-btn>
          <v-btn
            outlined
            :class="[type == 'day' ? 'activeBtn' : '', 'btnStyled']"
            color="#b8b8b8"
            @click="type = 'day'"
          >
            {{$t('calendarPage.day')}}
          </v-btn>
          <!-- <v-menu
            bottom
            right
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                outlined
                color="grey darken-2"
                v-bind="attrs"
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>
                  mdi-menu-down
                </v-icon>
              </v-btn>
            </template>
            
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu> -->
        </v-toolbar>
      </v-sheet>
      <v-sheet height="700">
        <v-calendar
          :event-overlap-threshold="30"
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          :month-format="monthFormat"
          :weekdays="weekdaysArr"
          :weekday-format="weekdayFormat"
          :locale="'RU-ru'"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color=""
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-toolbar-title>
                <span v-html="selectedEvent.name"></span>
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <div v-if="selectedEvent.accessEdit">
                <v-btn icon @click="editEntryBtn">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="deleteEntryDialog(selectedEvent.entry_id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-toolbar>
            <v-card-text>
              <div style="display: flex; justify-content: space-between;">
              <div style="display: flex;">
                <div>
                  <span>Тип: </span><span style="font-weight: bold; margin-right: 1rem;">{{selectedEvent.entry_type_name}}</span>
                </div>
                <div>
                  <span v-if="selectedEvent.place && selectedEvent.place.length > 0" >Место: </span><span style="font-weight: bold;">{{selectedEvent.place}}</span>
                </div>
              </div>
              <div style="font-weight: bold; margin-left: 1rem;">
                  <span>{{moment(selectedEvent.start_date).format('hh:mm')}} - </span> 
                  <span v-if="selectedEvent.is_all_day">весь день</span>
                  <span v-else>{{moment(selectedEvent.end_date).format('hh:mm')}}</span>
                </div>
              </div>
              <br>
              <div class="mt-4 mb-2" style="color: #333; font-size: 16px;">Описание:</div>
              <div style="color: #333; font-size: 16px;" v-html="selectedEvent.description"></div>
              <br>
              <div class="mt-4 mb-2" style="color: #333; font-size: 16px;">Участники:</div>
              <div style="max-width: 500px">
                <v-chip
                  :color="employee.is_organizer ? 'blue' : ''"
                  :text-color="employee.is_organizer ? 'white' : ''"
                  v-for="employee in selectedEvent.participants" :key="employee.id" class="text--primary mr-2 mb-4"
                >
                  {{employee.last_name}} {{employee.first_name}}
                </v-chip>
              </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
              <v-btn
                text
                outlined
                right
                color="secondary"
                @click="selectedOpen = false"
              >
                Закрыть
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>
<script>
import moment from 'moment'

  export default {
    data: () => ({
      moment,
      weekdaysArr: [
          1,2,3,4,5,6,0
      ],
      focus: '',
      type: 'month',
      currentMonth: new Date().getMonth() + 1,
      currentYear: new Date().getFullYear(),
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        '4day': '4 Days',
      },
      selectedElement: null,
      selectedOpen: false,
      colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
      names: ['Совещание', 'Встреча', 'PTO', 'Показ', 'Объявления', 'День рождения', 'Конференция', 'Командировка'],
    }),
    mounted () {

           this.$refs.calendar.checkChange()
    },
    methods: {
      getTitleCalendar() {
        let lang = this.$i18n.locale == 'kz' ? 'kk' : this.$i18n.locale
        moment.locale(lang);
        return moment(this.$refs.calendar.lastEnd.date).format('MMMM YYYY');
      },
      monthFormat(e) {
        return this.$t('calendarPage.months')[e.month - 1]
      },
      weekdayFormat(e) {
        return this.$t('calendarPage.weekDays')[e.weekday]
      },

      getTodayForCalendar() {
          return  moment().format('dddd, MMMM DD, YYYY');
      },
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      setToday () {
        this.focus = ''
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },
      showEvent ({ nativeEvent, event }) {

              const open = () => {
          this.$emit('selectEvent', event);
          this.selectedElement = nativeEvent.target
          requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          requestAnimationFrame(() => requestAnimationFrame(() => open()))
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
      updateRange () {
        let calendarDate = new Date(this.$refs.calendar.lastEnd.date)
        if(this.currentYear !== calendarDate.getFullYear() || this.currentMonth !== calendarDate.getMonth() + 1) {
          this.currentYear = calendarDate.getFullYear()
          this.currentMonth = calendarDate.getMonth() + 1
          this.getEntry()
        }
      },
      getEntry() {
        let params = {
          month: this.currentMonth,
          year: this.currentYear
        }
        this.axios.get(`/api/1.0/entry`, {params})
        .then(data => {
          this.$set(this, 'events', this.parseEntry(data.data))
        })
      },
      submit(){
      },
      editEntryBtn() {
        this.$emit('openDialogForEdit', this.selectedEvent)
        this.selectedOpen = false;
      },
      async deleteEntryDialog(id){
        this.$swal({
                title: `Вы действительно хотите удалить событие?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Да",
            }).then(async (result) => {
                if(result.isConfirmed){
                  this.deleteEntryBtn(id)
                }   
            })
      },
      async deleteEntryBtn(id) {
        try {
          let localParams = {
            id
          }
          await this.axios.delete(`/api/1.0/entry/:id`, {localParams});
          const index = this.events.findIndex(item => item.entry_id == id)
          this.$delete(this.events, index)
          this.selectedOpen = false;
          this.getData()
          this.$swal({
                ...this.$optionAlert.fire,
                icon: 'success',
                title: 'Успешно удалено'  
            })
        } catch (e) {
          console.log(`Error => ${e.message}`)
        }
      },
    },
    props: ['events', 'selectedEvent', 'getData']
  }
</script><style lang="scss">
.calendarBlock {
    padding: 33px;
    
    .v-toolbar__content {
        padding: 0;
    }

    .v-calendar-weekly__day-label {
        text-align-last: left;
        padding-left: 10px;
    }
    .activeBtn {
        color: rgb(87, 135, 164) !important;
        caret-color: rgb(87, 135, 164) !important;
    }
    .btnStyled {
        font-size: 12px; 
        line-height: 130%;
        font-weight: normal;
    }

}
</style>