<template>
    <div class="requestSearch">
        <div class="d-flex align-start">
            <v-select
                v-if="isPassCreator() && (tab == 'admin' || tab == 'creator')" 
                class="mr-4"
                style="max-width:300px;"
                item-text="text"
                item-value="id"
                :items="channels"
                @change="find"
                v-model="selectedChannel"
                height="55"            
                solo
                >
            </v-select>
            <v-text-field
                style="max-width:500px;"
                class="mr-4"
                hide-details 
                v-model="identification_number"
                :label="tab==='admin'?$t('passRequest.search.typePassRequestNumber'):tab==='creator'?$t('passRequest.search.typePassRequestNumberOrFullName'):$t('passRequest.search.typePassRequestNumberOrIdentificationNumberOrFullName')"
                required
                outlined
                @keydown.enter="find()"
                ></v-text-field>

            <v-col 
                cols="2"
                class="pt-0"
                v-if="tab == 'securitywithdate'" 
            >
            <v-menu
              v-model="date_menu4"
              :close-on-content-click="false"
              :nudge-right="40"
              style="width:200px;"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  class="ml-2 mr-2"
                  v-model="date_from"
                  prepend-icon="mdi-calendar"
                  :label="$t('globalWords.dateFrom')" 
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker id="dateFrom" 
                                  ref="dateFrom"
                                  @input="date_menu4 = false"
                                  first-day-of-week="1"
                                  :clearText="$t('globalWords.clear')" 
                                  :locale="$i18n.locale == 'KAZ'? 'kk':$i18n.locale"
                                  okText="Ок" 
                                  dateFormat="yyyy.MM.dd - " 
                                  label="Дата с" 
                                  v-model="date_from"
                                  >
                  <template slot="dateIcon">
                      <span class="mr-4">{{ $t('globalWords.date') }}</span>
                      <v-icon>mdi-calendar</v-icon>
                  </template>
              </v-date-picker>
            </v-menu>

            </v-col>
            <v-col 
                class="pt-0"
                cols="2"
                v-if="tab == 'securitywithdate'" 
            >
            <v-menu
              v-model="date_menu3"
              :close-on-content-click="false"
              :nudge-right="40"
              style="width:200px;"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  class="ml-2 mr-2"
                  v-model="date_to"
                  prepend-icon="mdi-calendar"
                  :label="$t('globalWords.dateTo')" 
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker id="dateTo" 
                                  ref="dateTo"
                                  @input="date_menu3 = false"
                                  first-day-of-week="1"
                                  :clearText="$t('globalWords.clear')" 
                                  :locale="$i18n.locale == 'KAZ'? 'kk':$i18n.locale"
                                  okText="Ок" 
                                  dateFormat="yyyy.MM.dd - " 
                                  label="Дата по" 
                                  v-model="date_to">
                <template slot="dateIcon">
                    <span class="mr-4">{{ $t('globalWords.date') }}</span>
                    <v-icon>mdi-calendar</v-icon>
                </template>
              </v-date-picker>
            </v-menu>


            </v-col>

            <v-btn
                class="mr-4"
                height="55"            
                style="width:150px;"
                text
                outlined
                right
                color="secondary"
                @click="find"
            >
                {{ $t('globalWords.search') }}
            </v-btn>
            <v-btn
                height="55"            
                style="width:150px;"
                text
                outlined
                right
                color="secondary"
                @click="clearFind"
            >
                {{ $t('globalWords.reset') }}
            </v-btn>
            <v-col v-if="(isAdmin() || isPassCreator()) && tab === 'admin'" class="text-right pt-0">
                <v-btn right outlined height="55" @click="newPassRequest">{{ $t('passRequest.newPassRequest') }}</v-btn>
            </v-col>

        </div>
    </div>
</template>

<script lang="ts">
import moment from 'moment'
import checkRoles from '@/utils/check_role'
export default {
    data: function() {
        return {
            date_menu3: false,
            date_menu4: false,
            moment,
            channels: [
                {
                    id: 1,
                    text: this.$t('passRequest.search.myPassRequests'),
                },
            ],

        }
    },
    computed: {
        identification_number: {
            get() {
                return this.$store.state.pass_request.identification_number
            },
            set(idn) {
                this.$store.commit('setIdentificationNumber', idn)
            }
        },
        selectedChannel: {
            get() {
                return this.$store.state.pass_request.selectedChannel
            },
            set(sc) {
                this.$store.commit('setSelectedChannel', sc)
            }
        },
        date_from: {
            get() {
                return this.$store.state.pass_request.date_from
            },
            set(val) {
                this.$store.commit('setDateFrom', val)
            }
        },
        date_to: {
            get() {
                return this.$store.state.pass_request.date_to
            },
            set(val) {
                this.$store.commit('setDateTo', val)
            }
        }
    },
    mounted() {
        this.selectedChannel = 1
        if (this.tab === 'admin')
        {
            if(this.isAdmin()) {
                this.channels.push(
                    {
                        id: 2,
                        text: this.$t('passRequest.search.allPassRequests'),
                    }
                )
            }
            if(this.isUltraAdmin()) {
                this.channels.push(
                    {
                        id: 3,
                        text: 'Все заявки во всех организациях',
                    }
                )
            }
        } 
        else if (this.tab === 'creator')
        {
            this.channels = [
                {
                    id: 1,
                    text: this.$t('passRequest.search.myVisitors'),
                },
            ]
            if (this.isAdmin()) {
                this.channels.push(
                    {
                        id: 2,
                        text: this.$t('passRequest.search.allVisitors'),
                    }
                )
            }
            if (this.isUltraAdmin()) {
                this.channels.push(
                    {
                        id: 3,
                        text: 'Все посетители во всех организациях',
                    }
                )
            }
        }
        else if (this.tab === 'security')
        {
            
            if(this.isRole16()) 
            {
                this.selectedChannel = 2
            }
        }
        this.find()
        
    },
    methods: {
        isUltraAdmin() {	
            return checkRoles('53', this.$userData)	
        },
        isAdmin() {
            return checkRoles('18', this.$userData)
        },
        isPassCreator() {
            return checkRoles('17', this.$userData) || this.isAdmin()
        },
        isRole16() {
            return checkRoles('16', this.$userData)
        },
        newPassRequest(){
            this.$emit('newPassRequest')
        },
        clearFind() {
            this.subType = 1
            this.findField = ''
            this.datePick = ''

            this.$store.commit('setIdentificationNumber', '')
            this.$store.commit('setSelectedChannel', 1)
            this.date_from = null
            this.date_to = null

            this.$emit(`clearFindRequest`)

        },

        find() {
            let findData = {
                identification_number: this.identification_number,
                channel: this.selectedChannel,
                date_from: this.date_from,
                date_to: this.date_to
            }
            this.$emit(`findRequest`, findData)
        },
    },
    watch: {
    },
    props: ["tab"],
}
</script>

<style lang="scss" scoped>
</style>