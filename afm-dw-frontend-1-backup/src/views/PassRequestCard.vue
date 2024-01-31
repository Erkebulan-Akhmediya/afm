<template>
  <section>
    <v-card>
      <v-card-text style="padding: 30px">
        <v-dialog v-model="editPassRequestDialog" width="800">
          <v-card style="color: #000;">
            <v-card-title>
              <span style="color: #000;">{{ $t('passRequest.editingPassRequest') }}</span>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col>
                  <v-form 
                    class="pass-request-form"
                    >
                    <v-row>
                      <v-col sm="6">
                        <v-textarea 
                          rows="2"
                          no-resize
                          v-model="editingItem.purpose"
                          :label="$t('passRequest.purposeOfVisit')" 
                          required> 
                        </v-textarea>
                      </v-col>

                      <v-col sm="6">
                        <v-textarea 
                          rows="2"
                          no-resize
                          v-model="editingItem.description"
                          :label="$t('passRequest.note')" 
                          > 
                        </v-textarea>
                      </v-col>

                      <v-col :cols="buildings.length > 1?6:12">
                        <v-select
                          :label="$t('passRequest.passRequestType')"
                          :items="pass_request_types"
                          v-model="editingItem.pass_request_type_id"
                        >
                        </v-select>
                      </v-col>
                      <v-col v-if="buildings.length > 1" cols="6">
                        <v-select
                          :label="'Здание'" 
                          :items="buildings"
                          v-model="editingItem.organization_building_id"
                          >
                        </v-select>
                      </v-col>

                      <v-col 
                        sm="6" 
                        v-if="editingItem.pass_request_type_id === 1"
                        >
                        <v-datetime-picker id="datetimeFrom" 
                                            ref="datetimeFrom"
                                            :datePickerProps="{'first-day-of-week': 1, 'locale': $i18n.locale == 'KAZ'? 'kk':$i18n.locale }" 
                                            :timePickerProps="{'allowed-minutes': allowedStep, format: '24hr', scrollable: true}"
                                            :clearText="$t('globalWords.clear')" 
                                            okText="Ок" 
                                            dateFormat="yyyy.MM.dd - " 
                                            :label="$t('globalWords.dateFrom')" 
                                            required
                                            v-model="editingItem.date_from">
                            <template slot="dateIcon">
                                <span class="mr-4">{{ $t('globalWords.date') }}</span>
                                <v-icon>mdi-calendar</v-icon>
                            </template>
                            <template slot="timeIcon">
                                <span class="mr-4">{{ $t('globalWords.time') }}</span>
                                <v-icon>mdi-clock</v-icon>
                            </template>
                        </v-datetime-picker>

                      </v-col>

                      <v-col 
                        sm="6"
                        v-if="editingItem.pass_request_type_id === 1"
                        >
                        <v-datetime-picker id="datetimeTo" 
                                            ref="datetimeTo"
                                            :datePickerProps="{'first-day-of-week': 1, 'locale': $i18n.locale == 'KAZ'? 'kk':$i18n.locale}" 
                                            :timePickerProps="{'min': passRequest.date_from.toLocaleTimeString(), 'allowed-minutes': allowedStep, format: '24hr', scrollable: true}"
                                            :clearText="$t('globalWords.clear')" 
                                            okText="Ок" 
                                            dateFormat="yyyy.MM.dd - " 
                                            :label="$t('globalWords.dateTo')" 
                                            required
                                            v-model="editingItem.date_to">
                            <template slot="dateIcon">
                                <span class="mr-4">{{ $t('globalWords.date') }}</span>
                                <v-icon>mdi-calendar</v-icon>
                            </template>
                            <template slot="timeIcon">
                                <span class="mr-4">{{ $t('globalWords.time') }}</span>
                                <v-icon>mdi-clock</v-icon>
                            </template>
                        </v-datetime-picker>

                      </v-col>

                      <v-col 
                        sm="6"
                        v-if="editingItem.pass_request_type_id === 2"
                        >
                          <v-menu
                            v-model="date_menu1"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="auto"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="editingItem.date_from"
                                prepend-icon="mdi-calendar"
                                :label="$t('globalWords.dateFrom')" 
                                readonly
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </template>
                          <v-date-picker id="dateFrom" 
                                              ref="dateFrom"
                                              first-day-of-week="1"
                                              @input="date_menu1 = false"
                                              :clearText="$t('globalWords.clear')" 
                                              okText="Ок" 
                                              dateFormat="yyyy.MM.dd" 
                                              :label="$t('globalWords.dateFrom')" 
                                              v-model="editingItem.date_from">
                              <template slot="dateIcon">
                                  <span class="mr-4">{{ $t('globalWords.date') }}</span>
                                  <v-icon>mdi-calendar</v-icon>
                              </template>
                          </v-date-picker>
                          </v-menu>
                      </v-col>

                      <v-col 
                        sm="6"
                        v-if="editingItem.pass_request_type_id === 2"
                        >
                        <v-menu
                          v-model="date_menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              :label="$t('globalWords.dateTo')" 
                              v-model="editingItem.date_to"
                            ></v-text-field>
                          </template>
                          <v-date-picker id="dateTo" 
                                              ref="dateTo"
                                              @input="date_menu2 = false"
                                              first-day-of-week="1"
                                              :clearText="$t('globalWords.clear')" 
                                              okText="Ок" 
                                              dateFormat="yyyy.MM.dd" 
                                              :label="$t('globalWords.dateTo')" 
                                              v-model="editingItem.date_to">
                              <template slot="dateIcon">
                                  <span class="mr-4">{{ $t('globalWords.date') }}</span>
                                  <v-icon>mdi-calendar</v-icon>
                              </template>
                          </v-date-picker>
                        </v-menu>

                      </v-col>


                    </v-row>

                    <div v-if="searchedEmployee">
                      {{ $t('passRequest.accompanying') }}: <v-chip color="grey">{{ searchedEmployee.last_name }} {{ searchedEmployee.first_name }}</v-chip>
                    </div>
                    <div v-else>
                      <v-chip color="red">{{ $t('passRequest.accompanyingNotSelected') }}</v-chip>
                    </div>
                    <div 
                      class="mt-2"
                      :style="`display: flex; position: relative; z-index:1; width: 100%; background: #fff; height: 56px; box-sizing: border-box`" 
                      >
                      <v-text-field class="searchBar" :placeholder="$t('mainPage.search.globalSearch')" v-model="globalSearchVal" @keydown.enter="globalSearch" @keydown="check" style="padding: 7px; border: 1px solid #ddd; border-radius: 5px">
                        <v-icon @click="globalSearch" slot="prepend" color="gray" style="color: #BDBDBD;">mdi-magnify</v-icon>
                      </v-text-field>
                    </div>
                    <v-col 
                      cols="12"
                      >
                      <EmployeeTableSmallSearch @clickOnRow="selectEmployee" :employeeTable="searchEmployeeTable" :adminUsersForm="false"
                      ></EmployeeTableSmallSearch>
                    </v-col>
                  </v-form>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn 
                outlined 
                text 
                @click="editPassRequestDialog=false" 
                color="error"
              >
                {{ $t('globalWords.cancel') }}
              </v-btn>
              <v-spacer> </v-spacer>
              <v-btn outlined color="primary" text 
                @click="clickSave" 
              >
                {{ $t('globalWords.save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <slot>
          <v-row>
            <v-col cols="6">
              <div>
                <v-btn
                class="mb-1"
                color="#5787A4"
                icon
                @click="$router.go(-1)"
                >
                    <v-icon>mdi-arrow-left-thin-circle-outline</v-icon>
                </v-btn>
              </div>
              <div 
                style="color: #000;"
                :loading="loader"
                >
                <v-row>
                  <v-col>
                    <br/>
                    <div v-if="passRequest.id">
                      <h3>{{ $t('passRequest.requestApprove') }} №{{passRequest.id}}</h3>
                    </div>
                    <br/>

                    <div v-if="passRequest.id">
                      <b>{{ $t('globalWords.from') }} {{ passRequest.create_user }}</b>
                    </div>
                    <div v-if="passRequest.id">
                      <b>{{ $t('passRequest.passRequestStatus') }}:</b> {{ calculate_status }}
                    </div>
                    <br/>

                    <div>
                      <b>Организация:</b> {{ passRequest.organization }}
                    </div>
                    <div>
                      <b>Здание:</b> {{ passRequest.organization_building }}
                    </div>
                    <div>
                      <b>{{ $t('passRequest.passRequestType') }}:</b> {{ passRequest.pass_request_type }}
                    </div>
                    <div>
                      <b>{{ $t('passRequest.purposeOfVisit') }}:</b> {{ passRequest.purpose }}
                    </div>
                    <div>
                      <b>{{ $t('passRequest.planDateFrom') }}:</b> {{ $convertDate($moment(passRequest.date_from)) }}
                    </div>
                    <div>
                      <b>{{ $t('passRequest.planDateTo') }}:</b> {{ $convertDate($moment(passRequest.date_to)) }}
                    </div>
                    <div>
                      <b>{{ $t('passRequest.note') }}:</b> {{ passRequest.description }}
                    </div>
                    <div v-if="searchedEmployee">
                      <b>{{ $t('passRequest.accompanying') }}:</b> {{ searchedEmployee.last_name }} {{ searchedEmployee.first_name }}
                    </div>
                    <div v-else>
                      <b>{{ $t('passRequest.accompanyingNotSelected') }}</b>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-col>
            <v-col cols="6" class="d-flex flex-row-reverse">
              <v-btn outlined color="primary" text 
                class="ml-2"
                :loading="loader"
                :disabled="disabledEditing"
                @click="clickNextStatus" 
              >
                {{ $t('globalWords.send') }}
              </v-btn>
              <v-btn outlined color="primary" text
                @click="startEditingPassRequest"
                :loading="loader"
                :disabled="disabledEditing"
                >
                <v-icon class="mr-2">
                  mdi-pencil
                </v-icon>
                {{ $t('globalWords.edit') }}
              </v-btn>
            </v-col>
          </v-row>
        </slot>
        <br/>
        <slot>
          <v-tabs v-model="currentTab" active-class="asd" class="mt-4 tabWrapper tabWithoutUnderline">
            <v-tab :href="'#visitors'" class="empTab">{{ $t('passRequest.visitors') }}</v-tab>
            <v-tab :href="'#files'" class="empTab">{{ $t('passRequest.documents') }}</v-tab>
            <v-tab :href="'#accept'" class="empTab">{{ $t('passRequest.approve') }}</v-tab>

            <v-tab-item :value="'visitors'" id="visitors"> 
              <div class="d-flex justify-end" v-if="passRequest.pr_status_id === 1 && $userData.id == passRequest.create_user_id">
                <v-dialog
                  v-model="visitorFromListDialog"
                  max-width="600px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      dark
                      v-bind="attrs"
                      v-on="on"
                      class="ml-4"
                    >
                      {{ $t('passRequest.selectFromList') }}
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                    </v-card-title>
                    <v-card-text>
                      <!-- todo -->
                      
                      <v-text-field
                        v-model="visitorOptions.searchQuery"
                        @keydown.enter="loadVisitors"
                        label="Поиск"
                      >
                      </v-text-field>

                      <v-col cols="12">
                        <v-data-table 
                        hide-default-header
                        hide-default-footer
                        :loading="visitors_loader"
                        dense
                        :items="visitors"
                        :headers="visitorsTableHeaders"
                        @click:row="selectVisitorFromTable"
                        >
                          <template v-slot:[`item.name`]="{ item }">
                            {{ item.last_name }} {{ item.first_name }} {{ item.middle_name }}
                          </template>
                        </v-data-table>
                      </v-col>

                      <v-select
                        ref="visitorSelect"
                        :label="$t('passRequest.selectFromList')"
                        v-model="newVisitor"
                        :items="all_visitors"
                        @change="selectVisitor"
                        item-text="name"
                        item-value="id"
                      >
                      </v-select>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="visitorFromListDialog = false"
                      >
                        {{ $t('globalWords.cancel') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-btn 
                  :loading="loader"
                  text
                  @click="plusVisitor"
                  >
                  <v-icon>
                    mdi-plus
                  </v-icon>
                </v-btn>
              </div>
              <br/>
              <v-data-table 
                :no-data-text="$t('passRequest.visitorListIsEmpty')"
                :headers="headersRequest"
                :items="passRequest.visitors"
                :loading="loader"
                class="elevation-1"
                :footer-props="{
                  itemsPerPageText: $t('globalWords.itemsPerPage'),
                }"
              >
                <template v-slot:[`item.is_resident_rk`]="{ item }">
                  <span>
                    {{ item.is_resident_rk? $t('globalWords.yes'): $t('globalWords.no')  }}
                  </span>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <div>
                    <v-btn 
                      @click="deleteVisitor(item)"
                      icon
                      v-if="passRequest.pr_status_id === 1"
                      >
                      <v-icon>
                        mdi-trash-can-outline
                      </v-icon>
                    </v-btn>
                    <v-btn 
                      @click="editingVisitor={...item}; currentVisitor=item; editVisitorDialog = true"
                      icon
                      v-if="passRequest.pr_status_id === 1"
                      >
                      <v-icon>
                        mdi-pencil
                      </v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-tab-item>

            <v-tab-item eager :value="'accept'" id="accept"> 
              <br/>
              <ApproveList ref="approve_list" :currentRequestStatus="disabledEditing?1:0" :currentRequest="passRequest">
              </ApproveList>
              <!--
              <v-data-table
                :no-data-text="$t('passRequest.approveListIsEmpty')"
                :headers="acceptHeaders"
                :items="passRequest.accept_list"
                :loading="loader"
                class="elevation-1"
                :items-per-page="10"
              >
                <template v-slot:[`item.name`]="{ item }">
                  <td>
                    {{ item.last_name }} {{ item.first_name }} {{ item.middle_name }}
                  </td>
                </template>
                <template v-slot:[`item.create_date`]="{ item }">
                  {{item.create_date?$convertDate($moment(item.create_date).add($moment(new Date()).utcOffset(), 'minutes')):''}}
                </template>
                <template v-slot:[`item.approve_date`]="{ item }">
                  <td>{{item.approve_date?$convertDate($moment(item.approve_date).add($moment(new Date()).utcOffset(), 'minutes')):''}}</td>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <td>
                    <v-chip
                      class="ma-2"
                      :color="getChipsColor(item.request_status_id)"
                      text-color="white"
                    >
                      {{ item.request_status_name }}
                    </v-chip>
                  </td>
                </template>
              </v-data-table>
              -->
            </v-tab-item>

            <v-tab-item :value="'files'" id="files"> 
              <br/>
              <div class="d-flex justify-end" v-if="passRequest.pr_status_id === 1 && $userData.id == passRequest.create_user_id">
                <v-row>
                  <v-col cols="4">
                    <v-file-input 
                      :change="fileUpload(passRequest)"
                      :label="$t('globalWords.addFile')"
                      dense
                      outlined
                      v-model="file">
                    </v-file-input>
                  </v-col>
                </v-row>
              </div>
              <v-data-table
                :no-data-text="$t('passRequest.fileListIsEmpty')"
                :headers="fileHeaders"
                :items="passRequest.file_id_list"
                :loading="loader"
                class="elevation-1"
                :items-per-page="10"
              >
                <template v-slot:[`item.name`]="{ item }">
                  <a
                    @click="downloadFile(item)"
                  >
                    {{ item.name }}
                  </a>
                </template>
                <template v-slot:[`item.create_date`]="{ item }">
                  {{$moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-btn
                    icon
                    @click="deleteFile(item)"
                    v-if="passRequest.pr_status_id === 1"
                    >
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-tab-item>

          </v-tabs>
        </slot>
      </v-card-text>
    </v-card>

    <v-dialog v-model="editVisitorDialog" width="800">
      <v-card>
        <v-card-title style="background-color: #1976d2;">
          <span v-if="this.editingVisitor.id" class="text-h5">{{ $t('passRequest.editVisitor') }}</span>
          <span v-else class="text-h5">{{ $t('passRequest.createVisitor') }}</span>
        </v-card-title>
        <v-card-text>
          <v-row style="margin-top:2rem;">
            <v-col cols="6">
              <v-text-field
                :label="$t('globalWords.last_name')" 
                class="field-without-message"
                v-model="editingVisitor.last_name"
                >
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                :label="$t('globalWords.first_name')" 
                class="field-without-message"
                v-model="editingVisitor.first_name"
                >
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                :label="$t('globalWords.middle_name')" 
                class="field-without-message"
                v-model="editingVisitor.middle_name"
                >
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-checkbox
                :label="$t('passRequest.residentRK')" 
                v-model="editingVisitor.is_resident_rk"
                >
              </v-checkbox>
            </v-col>
            <v-col cols="6">
              <v-select
                :label="$t('passRequest.documentType')" 
                :items="document_types"
                v-model="editingVisitor.document_type_id"
                >
              </v-select>
            </v-col>
            <v-col cols="6">
              <v-text-field
                :label="$t('passRequest.documentNumber')" 
                class="field-without-message"
                v-model="editingVisitor.identification_number"
                >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            outlined
            color="error"
            text
            @click="editVisitorDialog = false"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" text 
            @click="clickSaveVisitor" 
            :disabled="disableDoubleClick"
          >
            {{ $t('globalWords.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="saveAcceptDialog" width="800">
      <v-card>
        <v-card-text style="padding: 30px">
          <slot>
            <div style="color: #000;">
              <v-row>
                <v-col>
                  <p>{{ $t('passRequest.notResidentWarning') }}?</p>
                </v-col>
              </v-row>
            </div>
          </slot>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            outlined
            color="error"
            text
            @click="saveAcceptDialog = false"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" text 
            @click="acceptNextStatus" 
            :disabled="false"
          >
            {{ $t('globalWords.accept') }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </section>
</template>
<script>
import checkRoles from '@/utils/check_role'
import ApproveList from '../components/ApproveList.vue'
export default {
  components: {
    ApproveList,
  },
  data() {
    return {
      visitorsTableHeaders: [
        { text: 'ФИО', value: 'name' },
      ],

            disableDoubleClick: false,
      currentTab: 'visitors',
      tab: 0,
      buildings: [],

      date_menu1: false,
      date_menu2: false,

      visitorFromListDialog: false,
      editPassRequestDialog: false,
      editVisitorDialog: false,
      saveAcceptDialog: false,

      newVisitor: null,
      currentVisitor: {},

      visitors: [],
      all_visitors: [],
      acceptHeaders:[
        { text: '№', value: 'id' },
        { text: this.$t('globalWords.fullName'), value: 'name' },
        { text: this.$t('globalWords.status'), value: 'status' },
        { text: this.$t('passRequest.sendApproveDate'), value: 'create_date' },
        { text: this.$t('passRequest.approveDate'), value: 'approve_date' },
        { text: this.$t('passRequest.comment'), value: 'comment' },
      ],
      fileHeaders: [
        { text: '№', value: 'id' },
        { text: this.$t('globalWords.name'), value: 'name' },
        { text: this.$t('globalWords.creator'), value: 'create_user' },
        { text: this.$t('passRequest.addingDate'), value: 'create_date' },
        { text: '', value: 'action' }
      ],

      headersRequest: [
        { text: this.$t('globalWords.last_name'), value: "last_name" },
        { text: this.$t('globalWords.first_name'), value: "first_name" },
        { text: this.$t('globalWords.middle_name'), value: "middle_name" },
        { text: this.$t('passRequest.residentRK'), value: "is_resident_rk" },
        { text: this.$t('passRequest.documentType'), value: "document_type" },
        { text: this.$t('passRequest.documentNumber'), value: "identification_number" },
        { text: "", value: "action" },
      ],
      pass_request_types: [],
      document_types: [],

      request: [],
      requestTabVal: 0,
      loader: false,
      visitors_loader: false,

      requestTab: [],

      passRequest: {
        visitors: [],
        date_from: new Date(),
        date_to: new Date(),
        employee_id: '',
        purpose: '',
        description: '',
        pass_request_type_id: null,
      },

      editingItem: {},
      editingVisitor: {},

      searchedEmployee: null,
      searchEmployee: [],
      searchEmployeeTable: [],
      globalSearchVal: '',

      file: null,

      visitorOptions: {
        itemsPerPage: 10,
        page: 1,
        searchQuery: ''
      }
    }
  },
  async mounted() {
    this.loader = true

    this.passRequest = await this.getRequest(this.$route.params.id)

    const {data: {[0]:searchedEmployee}} = await this.axios.get(`/api/1.0/employee/${this.passRequest.employee_id}`)
    this.searchedEmployee = searchedEmployee

    let {data} = await this.axios.get('/api/1.0/lov/ref.pass_request_type')
    this.pass_request_types = data.filter(item => item.id > 0).map(item => { return { value: item.id, text: item.name }})

    const {data: document_types} = await this.axios.get(`/api/1.0/pass-request-document-types/`)
    this.document_types = document_types

    const {data: buildings} = await this.axios.get(`/api/1.0/buildings/${this.$userData.fullData.organization_id}`)
    this.buildings = buildings

    let params = {
      channel: 1,
      unique: true,
    }
    const {data: {pass_request_visitors:visitors}} = await this.axios.get(`/api/1.0/pass-request-visitor`, { params })
    visitors.map((item)=>{
      item.name = item.last_name + ' ' + item.first_name + ' ' + item.middle_name
    })
    this.all_visitors = visitors

    this.loader = false

    await this.loadVisitors()
  },
  computed: {
    disabledEditing () {
      return this.passRequest.pr_status_id !== 1 || this.$userData.id != this.passRequest.create_user_id
    }, 
    calculate_status () {
      if (this.passRequest.pr_status_id === 2)
      {
        if (this.passRequest.accept_list && this.passRequest.accept_list.length === 0)
        {
         return this.passRequest.status
        }

        for (let i of this.passRequest.accept_list) 
        {
          if (i.request_status_id === 2)
          {
            return this.$t('passRequest.toBeAgreed')
          }
          if (i.request_status_id === 4)
          {
            return this.$t('passRequest.denied')
          }
        }
      }
      return this.passRequest.status
    },
  },
  methods: {
    selectVisitorFromTable(item) {
      this.newVisitor = item.id
      this.selectVisitor()
    },

    async loadVisitors() {
      try{
        this.visitors_loader = true
        let params = {
          channel: 1,
          unique: true,
          itemsPerPage: this.visitorOptions.itemsPerPage,
          identification_number: this.visitorOptions.searchQuery,
          page: this.visitorOptions.page,
        }
        const {data: {pass_request_visitors: visitors}} = await this.axios.get(`/api/1.0/pass-request-visitor`, { params })
        visitors.map((item)=>{
          item.name = item.last_name + ' ' + item.first_name + ' ' + item.middle_name
        })
        this.visitors = visitors

      } catch (err) {
        console.error(err)
      } finally {
        this.visitors_loader = false
      }
    },
    selectVisitor () {
      if(this.newVisitor){
        let v = [...this.all_visitors]
        v = v.filter(item=>item.id === this.newVisitor)
        let visitor = v[0]

        this.editingVisitor.document_type_id= visitor.document_type_id
        this.editingVisitor.first_name= visitor.first_name
        this.editingVisitor.middle_name= visitor.middle_name
        this.editingVisitor.last_name= visitor.last_name
        this.editingVisitor.identification_number= visitor.identification_number
        this.editingVisitor.is_resident_rk= visitor.is_resident_rk

        this.currentVisitor = null
        this.visitorFromListDialog = false
        this.editVisitorDialog = true

        this.$refs["visitorSelect"].reset()
        this.newVisitor = null
      }

    },
    downloadFile(item) {
      let config = {
        responseType: "blob",
        params: {
          id: item.id,
        },
      };
      this.axios.get(`/api/1.0/fileDownload`, config).then((response) => {
        let blob = new Blob([response.data], {
          type: "application/document",
        });
        const a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = item.name;
        a.click();
        a.remove();
      });
    },
    startEditingPassRequest () {
      this.editingItem = {
        date_from: this.passRequest.date_from,
        date_to: this.passRequest.date_to,
        employee_id: this.passRequest.employee_id,
        purpose: this.passRequest.purpose,
        organization_building_id: this.passRequest.organization_building_id,
        description: this.passRequest.description,
        pass_request_type_id: this.passRequest.pass_request_type_id,
      }

      this.editPassRequestDialog = true
    },
    convertDateByPassRequestType (requestTypeId, item) {
      if(requestTypeId == 1)
      {
        item.date_from = new Date(item.date_from)
        item.date_to = new Date(item.date_to)
      }
      else if(requestTypeId == 2) {
        item.date_from = this.$moment(item.date_from).format('YYYY-MM-DD')
        item.date_to = this.$moment(item.date_to).format('YYYY-MM-DD')
      }
    },
    async deleteFile(item) {
      try{
        await this.axios.put(`/api/1.0/file-disable/${item.id}`, {is_active: false})

        let passRequest = await this.getRequest(this.passRequest.id)
        this.passRequest.file_id_list = passRequest.file_id_list

        this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: this.$t('globalWords.deleted')  
                })
      }catch (err) {
        console.error(err)
        this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: this.$t('globalWords.deletingError')  
                })
      }
    },
    fileUpload: async function(data) {
      if(this.file)
      {
        const form = new FormData();
        form.append("lang", this.$i18n.locale);
        form.append("user_id", this.$userData.fullData.username);
        form.append("file", this.file);
        form.append("fileType", "passrequest");
        form.append("file_type_id", 8);
        form.append("pr_id", data.id);

        await this.axios.post(`/api/1.0/pass-request-file/`, form);
        this.file = null;

        let passRequest = await this.getRequest(data.id)

        this.passRequest.file_id_list = passRequest.file_id_list

      }
    },
    allowedStep: m => m % 5 === 0,
    async deleteVisitor (v) {
      try{
        await this.axios.delete(`/api/1.0/pass-request-visitor/${v.id}`, {data: {}})

        this.passRequest.visitors = this.passRequest.visitors.filter(item=>item.id!=v.id)

        this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: this.$t('globalWords.deleted')  
                })
      }catch (err) {
        console.error(err)
        this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: this.$t('globalWords.deletingError')  
                })
      }
    },
    async clickSaveVisitor () {
      this.disableDoubleClick = true

      try {

        let flag = !this.currentVisitor
        if (flag)
        {
          this.currentVisitor = {}
        }

        this.editingVisitor.identification_number = this.editingVisitor.identification_number.trim()
        this.editingVisitor.first_name = this.editingVisitor.first_name.trim()
        this.editingVisitor.last_name = this.editingVisitor.last_name.trim()
        this.editingVisitor.middle_name = this.editingVisitor.middle_name.trim()

        const visitors = this.passRequest.visitors.filter(
          (item)=>{
            return item.identification_number === this.editingVisitor.identification_number && 
                  item.document_type_id === this.editingVisitor.document_type_id &&
                  item.first_name.toUpperCase() === this.editingVisitor.first_name.toUpperCase() &&
                  item.last_name.toUpperCase() === this.editingVisitor.last_name.toUpperCase() &&
                  this.editingVisitor.id !== item.id
          }
        )

        if (visitors.length !== 0) {
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: this.$t('passRequest.visitorAlreadyExist'),
          });
        }


        await this.saveVisitor(this.currentVisitor)

      } catch (err) {
        console.error(err)
      } finally {
        this.disableDoubleClick = false
      }

    },
    async saveVisitor (v) {
      let err = []

      if (!this.editingVisitor.last_name) {
        err.push(this.$t('passRequest.warnings.lastNameIsRequired'))
      }
      if (!this.editingVisitor.first_name) {
        err.push(this.$t('passRequest.warnings.firstNameIsRequired'))
      }
      if (/[0-9]/.test(this.editingVisitor.last_name)) {
        err.push(this.$t('passRequest.warnings.lastNameMustHaveNoNumbers'))
      }
      if (/[0-9]/.test(this.editingVisitor.first_name)) {
        err.push(this.$t('passRequest.warnings.firstNameMustHaveNoNumbers'))
      }
      if (/[0-9]/.test(this.editingVisitor.middle_name)) {
        err.push(this.$t('passRequest.warnings.middleNameMustHaveNoNumbers'))
      }

      if (!this.editingVisitor.identification_number) {
        err.push(this.$t('passRequest.warnings.identificationNumberIsRequired'))
      }
      if (!/^\d+$/.test(this.editingVisitor.identification_number)) {
        err.push(this.$t('passRequest.warnings.identificationNumberMustContainsOnlyNumbers'))
      }

      if(err.length) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 600,
          title: err.join('; <br>'),
        });
      }

      this.currentVisitor.document_type_id= this.editingVisitor.document_type_id, 
      this.currentVisitor.first_name= this.editingVisitor.first_name 
      this.currentVisitor.middle_name= this.editingVisitor.middle_name 
      this.currentVisitor.last_name= this.editingVisitor.last_name
      this.currentVisitor.identification_number= this.editingVisitor.identification_number
      this.currentVisitor.is_resident_rk= this.editingVisitor.is_resident_rk


      if (v.id) {
        await this.changeVisitor(v)
      } else {
        await this.addVisitor(v)
      }
      this.$swal({
                  ...this.$optionAlert.fire,
                  icon: 'success',
                  title: this.$t('globalWords.saved')
              })
      this.editVisitorDialog = false

            let passRequest = await this.getRequest(this.passRequest.id)
      this.passRequest.visitors = passRequest.visitors
      this.passRequest.file_id_list = passRequest.file_id_list

    },
    async changeVisitor (v) {
      let localParams = {
        pass_request_id: this.passRequest.id,
        no_date: true,
      }

      if (v.entryChange) {
        localParams = {
          pass_last_name: v.last_name,
          pass_first_name: v.first_name,
          pass_middle_name: v.middle_name,
          pass_identification_number: v.identification_number,
          pass_is_resident_rk: v.is_resident_rk,
          pass_document_type_id: v.document_type_id,
          ...localParams
        }
      } else {
        localParams = {
          last_name: v.last_name,
          first_name: v.first_name,
          middle_name: v.middle_name,
          identification_number: v.identification_number,
          is_resident_rk: v.is_resident_rk,
          document_type_id: v.document_type_id,
          ...localParams
        }
      }

      try {
        if (this.passRequest.id){
          await this.axios.put(`/api/1.0/pass-request-visitor/${v.id}`, localParams)
        } else {
          throw('pass request doesnt exist')
        }
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: this.$t('passRequest.visitorEditError'),
        })
      }
    },
    isAdmin () {
      return checkRoles('18', this.$userData) || checkRoles('17', this.$userData) 
    },
    isRole16 () {
      return checkRoles('16', this.$userData)
    },
    globalSearch () {
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
    check (val) {
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
    selectEmployee (data) {
      this.searchedEmployee = data
      this.passRequest.employee_id = data.id
      this.searchEmployeeTable = this.searchEmployeeTable.filter(item=>item.id!=data.id)
    },
    async clickSave () {
      let err = []

      this.editingItem.purpose = this.editingItem.purpose.trim()
      if (this.editingItem.description)
      {
        this.editingItem.description = this.editingItem.description.trim()
      }

      if(!this.editingItem.date_from) {
        err.push(this.$t('passRequest.warnings.dateFromIsRequired'))
      }
      if(!this.editingItem.date_to) {
        err.push(this.$t('passRequest.warnings.dateToIsRequired'))
      }
      if(!this.editingItem.purpose) {
        err.push(this.$t('passRequest.warnings.purposeIsRequired'))
      }
      if(!this.searchedEmployee) {
        err.push(this.$t('passRequest.warnings.selectAccompanying'))
      }
      if(this.$moment(this.editingItem.date_to).isBefore(this.$moment(this.editingItem.date_from))) {
        err.push(this.$t('passRequest.warnings.dateFromMustBeMoreThanDateTo'))
      }
      if(this.$moment(this.editingItem.date_from).isBefore(this.$moment(), 'day')) {
        err.push(this.$t('passRequest.warnings.dateFromMustBeMoreThanCurrentDate'))
      }
      if(this.editingItem.pass_request_type_id == 1) {
        if(!this.$moment(this.editingItem.date_to).startOf('day').isSame(this.$moment(this.editingItem.date_from).startOf('day'))) {
          err.push(this.$t('passRequest.warnings.dateFromAndDateToInOneDay'))
        }
      }

      if(err.length) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 600,
          title: err.join('; <br>'),
        });
      }


      this.passRequest.pass_request_type_id= this.editingItem.pass_request_type_id
      this.passRequest.date_from= this.editingItem.date_from
      this.passRequest.date_to= this.editingItem.date_to
      this.passRequest.purpose= this.editingItem.purpose
      this.passRequest.description= this.editingItem.description

      await this.savePassRequest()
      this.editPassRequestDialog = false

    },
    async savePassRequest () {
      let localParams = {
        date_from: this.$moment(this.passRequest.date_from).format('DD.MM.YYYY HH:mm:ss'),
        date_to: this.$moment(this.passRequest.date_to).format('DD.MM.YYYY HH:mm:ss'),
        employee_id: this.passRequest.employee_id,
        purpose: this.passRequest.purpose,
        organization_building_id: this.passRequest.organization_building_id,
        description: this.passRequest.description,
        pass_request_type_id: this.passRequest.pass_request_type_id,
      }

      try {
        let data
        if (this.passRequest.id) {
          await this.axios.put(`/api/1.0/pass-request/${this.passRequest.id}`, localParams)
          data = this.passRequest.id
        } else {
          data = await this.axios.post(`/api/1.0/pass-request`, localParams)
        }

        this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: this.$t('globalWords.saved') 
                })

                        this.passRequest = await this.getRequest(data)
      } catch (err) {
        console.log(err)
      } finally {
        this.saveAcceptDialog = false
        this.isShowFormDialog = false
      }
    },

    async addVisitor (visitor) {
      if (visitor.id)
      {
        return
      }
      let localParams = {
        last_name: visitor.last_name,
        first_name: visitor.first_name,
        middle_name: visitor.middle_name,
        identification_number: visitor.identification_number,
        pass_request_id: this.passRequest.id,
        is_resident_rk: visitor.is_resident_rk?true:false,
        document_type_id: visitor.document_type_id,
      }

      try {
        if (this.passRequest.id){
          const {data: id} = await this.axios.post(`/api/1.0/pass-request-visitor`, localParams)
          visitor.id = id
        }
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: this.$t('passRequest.visitorCreateError'),
        })
      }
    },

    nextStatus(item) {
      this.passRequest = item;
      this.isShowAcceptDialog = true
    },

    async clickNextStatus() {
        for (let item of this.passRequest.visitors) {
          if (!item.is_resident_rk) {
            this.saveAcceptDialog = true
            return
          }
        }

        await this.acceptNextStatus()

    },

    async acceptNextStatus() {
      let err = []

      for (let i of this.passRequest.visitors) {
        const visitors = this.passRequest.visitors.filter(
          (item)=>{
            return item.identification_number === i.identification_number && 
                  item.document_type_id === i.document_type_id &&
                  item.first_name.toUpperCase() === i.first_name.toUpperCase() &&
                  item.last_name.toUpperCase() === i.last_name.toUpperCase()
          }
        )
        if (visitors.length > 1) {
          err.push('Посетители дублируются')
          break
        }
      }


      if(this.passRequest.visitors.length === 0) {
        err.push(this.$t('passRequest.warnings.visitorListIsEmpty'))
      }
      if(err.length) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 600,
          title: err.join('; <br>'),
        });
      }

      try {
        let params = {
          pass_request_id: this.passRequest.id,
          pass_request_type_id: this.passRequest.pass_request_type_id,
          is_resident_rk: true,
        } 
        for (let item of this.passRequest.visitors) {
          if (!item.is_resident_rk) {
            params.is_resident_rk = false
            break
          }
        }

        this.saveAcceptDialog = false

        if((params.is_resident_rk!==null && !params.is_resident_rk) || params.pass_request_type_id == 2)
        {
          if (await this.$refs.approve_list.sendToApprove() !== true) {
            return
          }
        } else 
        {
          if (await this.$refs.approve_list.sendToApproveOrApproveAuto() !== true) {
            return
          }
        }

                await this.axios.put(`/api/1.0/pass-request/${this.passRequest.id}`, { pr_status_id: ++this.passRequest.pr_status_id })
        this.passRequest.status = this.$t('passRequest.sended')

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: this.$t('passRequest.sended'),
        });

        let passRequest = await this.getRequest(this.passRequest.id)
        this.passRequest.visitors = passRequest.visitors
        this.passRequest.file_id_list = passRequest.file_id_list
        this.passRequest.accept_list = passRequest.accept_list

      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: err.data.ERR_MSG,
        });
      } finally {
        this.isShowAcceptDialog = false
        this.isShowFormDialog = false
        this.saveAcceptDialog = false
      }
    },

    plusVisitor() {
      this.editingVisitor = {
        document_type_id: 1, 
        first_name: '', 
        middle_name: '', 
        last_name: '', 
        identification_number: '', 
        is_resident_rk: true,
      }
      this.currentVisitor = null
      this.editVisitorDialog = true
    },

    getChipsColor(data) {
      switch (data) {
        case 3:
          return "green";
        case 2:
          return "primary";
        case 4:
          return "red";
        default:
          break;
      }
    },
    async getRequest(id) {
      if(!Number.isNaN(parseInt(id))){
        id = this.$crypto(String(id))
      }
      if (id === null) 
      {
        console.error('function getRequest value of id cannot be null')
        return
      }

      this.loader = true
      try{

                let {data: {pass_requests: {[0]:pass_request}}} = await this.axios.get(`/api/1.0/pass-request/${id}`)

        this.convertDateByPassRequestType(pass_request.pass_request_type_id, pass_request)

        this.loader = false
        return pass_request

      } catch (error) {
        console.error(error)
      }
    },
  },
}
</script><style lang="scss" scoped>
.empTab {
    border: 1px solid #DEE2E6;
    box-sizing: border-box;
    border-radius: 9px 9px 0px 0px;

    &.v-tab--active {
        border-bottom: 0px solid #000;
        color: #109CF1;
    }
    .v-tabs-slider-wrapper {
        display: none !important;
    }

}

.tabWrapper {
    display: flex;
    flex-direction: column;
    width: 100%;

    p {
        font-size: 14px;
        line-height: 21px;
        display: flex;
        align-items: center;
        letter-spacing: 0.01em;
        color: #323C47;
        margin-bottom: 0;
    }
    min-height: 300px;
}

.fullData p {
    margin-bottom: 6px;
}

.educationCards {
    display: flex;
    flex-wrap: wrap;

    .educationItem {
        padding: 20px;
        max-width: 500px;
        margin-right: 10px;
        border-radius: 10px;
        background: #f4f4f4;

        td:first-child {
            padding-bottom: 10px;
            font-weight: bold;
            padding-right: 20px;
        }
    }
}
</style>,<style lang="scss">
.tabWithoutUnderline .v-tabs-slider-wrapper {
    display: none;
}
.tabWithUnderline .v-tabs-slider-wrapper {
    display: block;
}
.elevation-1 {
    thead{
        background-color: #eee;
        th {
            vertical-align:middle;
        }
    }
    tr:hover {
        cursor: pointer;
    }
}

.empList td {
    border: 1px dotted #000;
    padding: 2px 5px;
}
</style>