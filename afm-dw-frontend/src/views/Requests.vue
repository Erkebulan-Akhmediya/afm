<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-tabs class="tabWithUnderline" v-model="requestTabVal" @change="changeTab">
          <v-tab class="" v-for="(item, index) in requestTab" :key="index" >
            {{ item.title }}
          </v-tab>
          <!-- Новые -->
          <v-tab-item style="padding-top: 30px">
            <RequestDataTable :itemsPerPage="itemsPerPage" :totalLength="total_length" :loader="loader" @findRequest="findRequest" @clearFindRequest="clearFindRequest" :request="request" :headersRequest="headersRequest1" @showApproveDialog="showApproveDialog" @getRequestApproveInfo="getRequestApproveInfo">
            </RequestDataTable>
          </v-tab-item>

          <!-- Согласовано -->
          <v-tab-item style="padding-top: 30px">
            <RequestDataTable :itemsPerPage="itemsPerPage" :totalLength="total_length" :loader="loader" @findRequest="findRequest" @clearFindRequest="clearFindRequest" :request="request" :headersRequest="headersRequest" @showApproveDialog="showApproveDialog" @getRequestApproveInfo="getRequestApproveInfo">
            </RequestDataTable>
          </v-tab-item>

          <!-- Отклонено -->
          <v-tab-item style="padding-top: 30px">
            <RequestDataTable :itemsPerPage="itemsPerPage" :totalLength="total_length" :loader="loader" @findRequest="findRequest" @clearFindRequest="clearFindRequest" :request="request" :headersRequest="headersRequest" @showApproveDialog="showApproveDialog" @getRequestApproveInfo="getRequestApproveInfo">
            </RequestDataTable>
          </v-tab-item>

          <!-- Поручено -->
          <v-tab-item style="padding-top: 30px">
            <RequestDataTable :itemsPerPage="itemsPerPage" :totalLength="total_length" :loader="loader" @findRequest="findRequest" @clearFindRequest="clearFindRequest" :request="request" :headersRequest="headersRequest" @showApproveDialog="showApproveDialog" @getRequestApproveInfo="getRequestApproveInfo">
            </RequestDataTable>
          </v-tab-item>

          <!-- Исполнено -->
          <v-tab-item style="padding-top: 30px">
            <RequestDataTable :itemsPerPage="itemsPerPage" :totalLength="total_length" :loader="loader" @findRequest="findRequest" @clearFindRequest="clearFindRequest" :request="request" :headersRequest="headersRequest1" @showApproveDialog="showApproveDialog" @getRequestApproveInfo="getRequestApproveInfo">
            </RequestDataTable>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>

    <!-- Согласование или отказ -->
    <v-dialog v-model="isShowApproveDialog" width="500">
      <v-card>
        <v-card-text style="padding: 30px">
          <div v-if="currentRow.isApprove === null">
            <span style="color:red; font-size: 16px;">Заполните причину отправки на доработку</span><br/><br/>
          </div>
          <div v-else-if="!currentRow.isApprove">
            <span style="color:red; font-size: 16px;">Заполните причину отклонения</span><br/><br/>
          </div>
          <v-row>
            <v-col>
              <v-textarea
                outlined
                name="input-7-4"
                :label="$t('approve.comment')"
                v-model="approveComment"
              ></v-textarea>

              <v-file-input
                v-model="timeSheetFile"
                v-if="currentRow.isApprove && currentRow.object_info && currentRow.object_info.request_type_id == 9"
                color="blue accent-4"
                counter
                label="Загрузите подписанный ТУРВ"
                placeholder="Выберите файл"
                prepend-icon="mdi-paperclip"
                outlined
                :show-size="1000"
              >
                <template v-slot:selection="{ index, text }">
                  <v-chip
                    v-if="index < 2"
                    color="blue accent-4"
                    dark
                    label
                    small
                  >
                    {{ text }}
                  </v-chip>

                  <span
                    v-else-if="index === 2"
                    class="text-overline grey--text text--darken-3 mx-2"
                  >
                    + {{ files.length - 2 }} File(s)
                  </span>
                </template>
              </v-file-input>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            outlined
            :color="currentRow.isApprove ? 'success' : 'error'"
            text
            @click="getRequestSend" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
          >
            <span v-if="currentRow.isApprove === null">
              Вернуть на доработку
            </span>
            <span v-else-if="currentRow.request_approve_status_id == 14 && currentRow.isApprove">
              Исполнить
            </span>
            <span v-else>
              {{ currentRow.isApprove ? $t('approve.approve') : $t('approve.deny') }}
            </span>
          </v-btn>
          <v-btn
            outlined
            color="primary"
            text
            @click="isShowApproveDialog = false"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Информация о заявлении -->
    <v-dialog v-model="isShowInfoDialog" width="900">
      <v-card>
        <v-card-text style="padding: 30px">
          <slot>
            <div style="color: #000;">
              <v-row>
                <v-col>
                  <h3>{{infoDialog.object_display_type}} №{{infoDialog.object_id}}</h3>
                  <br/>
                  <h2><strong>Заявитель:</strong> <b>
                      <span v-if="infoDialog.create_user_id < 0">{{infoDialog.last_name}} {{infoDialog.first_name}} {{infoDialog.middle_name}}</span>
                      <router-link v-else :to="`employees/${$crypto(String(infoDialog.create_user_id))}`">{{infoDialog.last_name}} {{infoDialog.first_name}} {{infoDialog.middle_name}}</router-link>
                  </b></h2>
                  <span style="font-size: 12px;">{{ infoDialog.create_user_department_full_list }}</span>

                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'SERVICE_REQUEST'">
                    <strong>{{ $t('globalWords.subType') }}: </strong> {{infoDialog.object_info.category_name + ', ' + infoDialog.object_info.subcategory_name}}
                    <br />
                    <strong>Описание: </strong> {{infoDialog.object_info.description}}
                    <br />    
                    <!-- дополнительные поля/характеристики                 -->
                    <div v-if="infoDialog.object_info.characteristics_list">
                       <div v-for="item in infoDialog.object_info.characteristics_list" :key="item.id">
                        <strong>{{item.name}}: </strong> {{item.value}}
                        <br />
                      </div>
                    </div>
                  </div>

                  <span v-if="infoDialog.object_info && infoDialog.object_info.request_sub_type == 'Очередное звание'" style="font-size: 14px; color: red;"><br/><b>Внимание, отказ в согласовании очередного специального звания сотрудникам может быть только по следующим причинам:</b>
                  <br/><span style="font-size: 12px;">- до назначения на должность при нахождении в распоряжении;</span>
                  <br/><span style="font-size: 12px;">- наличие неснятого дисциплинарного взыскания;</span>
                  <br/><span style="font-size: 12px;">- решение вопроса о соответствии занимаемой должности при повторной аттестации;</span>
                  <br/><span style="font-size: 12px;">- проводится служебное расследование.</span></span>
                  <br/><br/>
                  <div v-if="infoDialog && infoDialog.object_name !== 'SERVICE_REQUEST'"><strong>{{ $t('passRequest.type') }}:</strong> {{infoDialog.object_display_subtype}}</div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'REQUEST'">
                    <strong>{{ $t('globalWords.subType') }}: </strong> {{infoDialog.object_info.request_sub_type}}
                  </div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'PASS_REQUEST'">
                    <strong>{{ $t('passRequest.purposeOfVisit') }}: </strong> {{infoDialog.object_info.purpose}}
                  </div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'REPORT_INSTANCE'">
                    <strong>Отчет: </strong> 
                    <router-link
                      :to="`report_instance/${$crypto(String(infoDialog.object_info.report_instance_id))}`"
                      >
                      {{infoDialog.object_info.name}}
                    </router-link>
                  </div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'REQUEST'">
                    <div v-if="infoDialog.object_info.request_sub_type == 'Кандидат'">
                      <strong>
                        <span>Кандидат: </span>
                        <router-link v-for="emp, k in infoDialog.employees" :key="k" :to="`employees/${$crypto(String(emp.id))}`">{{emp.last_name + ' ' + emp.first_name + ' ' + emp.middle_name}}; </router-link>
                      </strong>
                    </div>
                    <div v-else>
                      <!--Если сотрудник (по всем видам заявок и заявлении. Но не заявки на пропуск) - отображаем ФИО, Должность, Полное струк подразделение-->
                      <strong><span>Сотрудники: </span></strong>
                      <div v-for="emp, k in infoDialog.employees" :key="k">
                        <strong><router-link :to="`employees/${$crypto(String(emp.id))}`">{{emp.last_name + ' ' + emp.first_name + ' ' + emp.middle_name}}; </router-link></strong>
                        <div style="font-size: 12px;">{{ emp.position_name + '; ' + emp.employee_department_full_list }} </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'PASS_REQUEST'">
                    <strong>{{ $t('passRequest.note') }}: </strong> {{infoDialog.object_info.description}}
                  </div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'PASS_REQUEST' && infoDialog.object_info.date_from">
                    <strong>{{ $t('passRequest.planDateFrom') }}:</strong> {{ infoDialog.object_info && infoDialog.object_info.date_from ? $convertDate(infoDialog.object_info.date_from) : ''}}
                  </div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'PASS_REQUEST' && infoDialog.object_info.date_to">
                    <strong>{{ $t('passRequest.planDateTo') }}:</strong> {{ infoDialog.object_info && infoDialog.object_info.date_to ? $convertDate(infoDialog.object_info.date_to) : ''}}
                  </div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'PASS_REQUEST' && infoDialog.building_name">
                    <strong>Здание:</strong> {{ infoDialog.building_name }}
                  </div>
                  <div v-if="infoDialog.object_info && infoDialog.object_name === 'PASS_REQUEST'">
                    <strong>{{ $t('passRequest.accompanying') }}: </strong> {{infoDialog.object_info.employee_name?infoDialog.object_info.employee_name:''}}
                  </div>
                  <div v-if="infoDialog.cover_word">
                    <strong>Сопровождающий текст:</strong> {{infoDialog.cover_word}}
                  </div>
                  <div v-if="infoDialog.details">
                    <RequestDetails v-if="infoDialog.details && infoDialog.details.length !== 0" :details="infoDialog.details">
                    </RequestDetails>
                  </div>
                  <br/>

                  <div
                    v-if="infoDialog.object_info && infoDialog.object_info.file_id_list && infoDialog.object_info.file_id_list.length > 0"
                    >
                    <h2><strong>{{ $t('passRequest.documents') }}: </strong></h2>
                    <v-data-table
                      :headers="fileHeaders"
                      :items="infoDialog.object_info.file_id_list"
                      :loading="loader"
                      hide-default-footer
                      :no-data-text="$t('passRequest.fileListIsEmpty')"
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
                    </v-data-table>
                    <br />
                  </div>

                  <div
                    v-if="infoDialog.object_info && infoDialog.object_info.visitors"
                    >
                    <h2><strong>{{ $t('passRequest.visitors') }}: </strong></h2>
                    <v-data-table 
                      :headers="headersVisitor"
                      :items="infoDialog.object_info.visitors"
                      hide-default-footer
                      :loading="loader"
                      class="elevation-1"
                      :footer-props="{
                        itemsPerPageText: $t('globalWords.itemsPerPage'),
                      }"
                    >
                      <template v-slot:[`item.is_resident_rk`]="{ item }">
                        <span>
                          {{ item.is_resident_rk? $t('globalWords.yes'): $t('globalWords.no') }}
                        </span>
                      </template>
                    </v-data-table>
                    <br />
                  </div>

                  <div>
                    <h2><strong>{{ $t('passRequest.approve') }}: </strong></h2>
                    <v-data-table
                      :headers="headersRequestApprove"
                      :items="currentRow.approves"
                      class="elevation-1"
                      :no-data-text="$t('employeeCard.tabs.noData')"
                    >
                      <template v-slot:[`item.approve`]="{ item }">
                        <td>
                          {{ item.last_name }} {{ item.first_name }} {{ item.middle_name }}
                        </td>
                      </template>
                      <template v-slot:[`item.create_date`]="{ item }">
                        {{ item.create_date ? moment(item.create_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}
                      </template>
                      <template v-slot:[`item.send_date`]="{ item }">
                        {{ item.send_date ? moment(item.send_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}
                      </template>
                      <template v-slot:[`item.approve_date`]="{ item }">
                        {{ item.approve_date ? moment(item.approve_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}
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
                  </div>
                </v-col>
              </v-row>
            </div>
          </slot>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>

          <div v-if="infoDialog.request_status_id === 2 || infoDialog.request_status_id === 9 || infoDialog.request_status_id === 14">
            <v-btn
              color="primary"
              elevation="2"
              v-if="infoDialog.request_status_id === 14"
              style="color: #fff; font-size: 10px; margin-left: 10px;"
              @click.stop="showRedirectDialog(infoDialog)"
            >
              Направить на согласование
            </v-btn>
            <v-btn
              color="primary"
              elevation="2"
              style="color: #fff; font-size: 10px; margin-left: 10px;"
              @click.stop="openSubmitDialog(infoDialog)"
              :disabled="disableDoubleClick"
            >
              Вернуть на доработку
            </v-btn>
            <v-btn
              color="primary"
              elevation="2"
              style="color: #fff; font-size: 10px; margin-left: 10px;"
              @click.stop="showSendToPerformersDialog(infoDialog)"
            >
              Отправить на исполнение
            </v-btn>
          </div>
          <v-spacer></v-spacer>

          <div v-if="infoDialog.request_status_id === 14">

            <v-btn
              color="success"
              elevation="2"
              style="font-size: 10px;"
              value="item"
              @click.stop="showApproveDialog(infoDialog, true)"
              >
              Исполнено
            </v-btn>
          </div>


          <div v-if="infoDialog.request_status_id === 2 || infoDialog.request_status_id === 9">

            <v-btn
              color="success"
              elevation="2"
              style="font-size: 10px;"
              value="item"
              @click.stop="showApproveDialog(infoDialog, true)"
              >{{ $t('approve.approve') }}</v-btn
            >
            <v-btn
              color="red"
              elevation="2"
              style="color: #fff; font-size: 10px; margin-left: 10px;"
              @click.stop="showApproveDialog(infoDialog, false)"
              >{{ $t('approve.deny') }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Исполнение -->
    <v-dialog v-model="isShowSendToPerformersDialog" width="700">
      <v-card>
        <v-card-text style="padding: 30px">
          <v-container>
            <h3 class="mb-6 mt-6">Исполнение</h3>
            <v-row class="mt-6">
              <v-container>
                <v-row
                  v-for="(approver, k) in approvers"
                  :key="k"
                  class="d-flex align-center mb-6"
                  >
                  <v-col cols="3">
                    Очередь: 
                    <input 
                      class="ml-2 mr-4"
                      type="number" 
                      style="width: 30px; border-bottom: 1px solid black;"
                      v-model="approver.orders"
                      >
                  </v-col>
                  <v-col cols="3">
                    {{ approver.last_name }} {{ approver.first_name }} {{ approver.middle_name }}
                  </v-col>
                  <v-col cols="5">
                    <v-text-field
                      label="Сопровождающие текст"
                      v-model="approvers[k].cover_word"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-btn
                      icon
                      class="ma-2"
                      style="color: red;"
                      @click.stop="deleteApprover(k)"
                    >
                      <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </v-col>

                </v-row>
                <v-row v-if="approvers.length === 0">
                  <v-chip color="red">Исполнитель не выбран</v-chip>
                </v-row>
              </v-container>
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
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" text 
            @click="getAppoveSendToPerformersSend(2)" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
          >
            {{ $t('globalWords.send') }}
          </v-btn>
          <v-btn
            outlined
            color="error"
            text
            @click="closeSendToPerformersDialog()"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Перенаправление -->
    <v-dialog v-model="isShowRedirectDialog" width="700">
      <v-card>
        <v-card-text style="padding: 30px">
          <v-container>
            <h3 class="mb-6 mt-6">{{ $t('approve.approver') }}</h3>
            <v-row class="mt-6">
              <v-container>
                <v-row
                  v-for="(approver, k) in approvers"
                  :key="k"
                  class="d-flex align-center mb-6"
                  >
                  <v-col cols="3">
                    Очередь: 
                    <input 
                      class="ml-2 mr-4"
                      type="number" 
                      style="width: 30px; border-bottom: 1px solid black;"
                      v-model="approver.orders"
                      >
                  </v-col>
                  <v-col cols="3">
                    {{ approver.last_name }} {{ approver.first_name }} {{ approver.middle_name }}
                  </v-col>
                  <v-col cols="5">
                    <v-select class="ml-6" :items="ar_item_type_list" v-model="approvers[k].ar_item_type_id"></v-select>
                  </v-col>
                  <v-col cols="1">
                    <v-btn
                      icon
                      class="ma-2"
                      style="color: red;"
                      @click.stop="deleteApprover(k)"
                    >
                      <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </v-col>


                </v-row>
                <v-row v-if="approvers.length === 0">
                  <v-chip color="red">Согласующий не выбран</v-chip>
                </v-row>
              </v-container>
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
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" text 
            @click="getAppoveSendToPerformersSend(1)" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
          >
            {{ $t('globalWords.send') }}
          </v-btn>
          <v-btn
            outlined
            color="error"
            text
            @click="closeRedirectDialog()"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import moment from 'moment'
import RequestDataTable from '@/components/RequestDataTable';
import RequestDetails from '@/components/RequestDetails'
import {mapGetters, mapActions} from 'vuex'

export default {
  components: {
    RequestDataTable,
    RequestDetails,
  },
  data() {
    return {
      timeSheetFile: null,
      itemsPerPage: 10,

      ar_item_type_list: [
        {
          text: 'Утверждающий',
          value: 1,
        },
        {
          text: 'Согласующий',
          value: 2,
        }
      ],
      fileHeaders: [
        { text: '№', value: 'id' },
        { text: this.$t('globalWords.name'), value: 'name', sortable: false },
        { text: this.$t('globalWords.creator'), value: 'create_user', sortable: false },
        { text: this.$t('passRequest.addingDate'), value: 'create_date', sortable: false },
      ],
      headersVisitor: [
        { text: this.$t('globalWords.last_name'), value: "last_name", sortable: false },
        { text: this.$t('globalWords.first_name'), value: "first_name", sortable: false },
        { text: this.$t('globalWords.middle_name'), value: "middle_name", sortable: false },
        { text: this.$t('passRequest.residentRK'), value: "is_resident_rk", sortable: false },
        { text: this.$t('passRequest.documentType'), value: "document_type", sortable: false },
        { text: this.$t('passRequest.documentNumber'), value: "identification_number", sortable: false },
      ],
      moment,
      headersRequest: [
        { text: "#", value: "id", sortable: false },
        { text: this.$t('passRequest.type'), value: "object_display_type", sortable: false },
        { text: this.$t('globalWords.number'), value: "object_id", sortable: false },
        { text: this.$t('globalWords.subType'), value: "object_display_subtype", sortable: false },
        { text: this.$t('globalWords.from'), value: "employee", sortable: false },
        { text: this.$t('approve.dateSendToApprove'), value: 'create_date', sortable: false },
        { text: this.$t('passRequest.approveDate'), value: "approve_date", sortable: false },
        { text: this.$t('globalWords.status'), value: "status", sortable: false },
        { text: "", value: "action", sortable: false },
      ],
      headersRequest1: [
        { text: "#", value: "id", sortable: false },
        { text: this.$t('passRequest.type'), value: "object_display_type", sortable: false },
        { text: this.$t('globalWords.number'), value: "object_id", sortable: false },
        { text: this.$t('globalWords.subType'), value: "object_display_subtype", sortable: false },
        { text: this.$t('globalWords.from'), value: "employee", sortable: false },
        { text: this.$t('approve.dateSendToApprove'), value: 'send_date', sortable: false },
        { text: this.$t('globalWords.status'), value: "status", sortable: false },
        { text: "", value: "action", sortable: false },
      ],
      headersRequestApprove: [
        { text: 'Id', value: 'id', sortable: false },
        { text: 'Parent id', value: 'parent_id', sortable: false },
        { text: 'Шаг согласования', value: 'orders', sortable: false },
        { text: this.$t('approve.approver'), value: 'emp_name', sortable: false },
        { text: this.$t('passRequest.sendApproveDate'), value: 'send_date', sortable: false },
        { text: this.$t('passRequest.approveDate'), value: 'approve_date', sortable: false },
        { text: this.$t('employeeCard.tabs.comment'), value: 'comment', sortable: false },
        { text: this.$t('employeeCard.tabs.status'), value: 'status', sortable: false },
      ],
      approveComment: "",
      request: [],
      currentRow: {},
      approves: [],
      isShowApproveDialog: false,
      isShowSendToPerformersDialog: false,
      isShowInfoDialog: false,
      isShowRedirectDialog: false,
      infoDialog: {},
      requestTabVal: 0,
      status : 2,
      disableDoubleClick: false,
      total_length: 0,

      searchEmployee: [],
      searchEmployeeTable: [],
      globalSearchVal: '',
      approvers: [],

      requestTab: [
        { id: 0, title: this.$t('approve.new') },
        { id: 1, title: this.$t('approve.approved') },
        { id: 2, title: this.$t('approve.denied') },
        { id: 3, title: this.$t('approve.onControl') },
        { id: 4, title: this.$t('approve.fullfilled')}
      ],


            loader: false
    };
  },
   computed: {
    ...mapGetters(["UNREADED_MESS_SUMM", "APPROVE_REQUEST_NOTIFICATIONS"]),
  },
  mounted() {
  },
  methods: {
    ...mapActions(["READ_NOTIFICATION"]),
    deleteApprover(k){
      this.approvers.splice(k, 1)
    },
    goToEmployee (id){
      let cryptoid = ""
      do
      {
        cryptoid = this.$crypto(String(id))
      }while (cryptoid.includes('//'))
      this.$router.push('/employees/' + cryptoid);
    },
    async getRequestSend() {
      if(this.currentRow.isApprove === null) {
        if (!this.approveComment)
        {
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            timer: 5000,
            width: 300,
            title: "Заполните причину отправки на доработку",
          })
          return
        }
        await this.submitForRevision()
      } else {
        await this.getRequestApproveSend()
      }
      this.isShowApproveDialog = false
    },
    async openSubmitDialog(item) {
      item.approves = this.currentRow.approves
      this.currentRow = item
      this.currentRow.isApprove = null;
      this.timeSheetFile = null
      this.isShowApproveDialog = true;

    },
    async submitForRevision() {
      try{
        this.disableDoubleClick = true
        await this.axios.put(`/api/1.0/submit-for-revision/request/${this.currentRow.approve_request_id}`, {ar_item_id: this.currentRow.id, comment: this.approveComment, ...this.currentRow})
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: `Отправлено на доработку`,
        });
        this.request = await this.getRequest(this.status)
      } catch (err) {
        console.error(err)
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Ошибка: ${err.data?.ERR_MSG || err.message || err}`,
        });
      } finally {
        this.isShowRedirectDialog = false
        this.isShowInfoDialog = false
        this.disableDoubleClick = false
      }
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
      let searchedEmployee = data
      searchedEmployee.approver_id = data.id
      searchedEmployee.emp_first_name = data.first_name
      searchedEmployee.emp_last_name = data.last_name
      searchedEmployee.emp_middle_name = data.middle_name
      data.orders = 1
      data.ar_item_type_id = 1
      this.approvers.push(searchedEmployee)
      this.searchEmployeeTable = this.searchEmployeeTable.filter(item=>item.id!=data.id)
    },
    async getAppoveSendToPerformersSend(redirect_type) {

      let maxOrders = 0

      for(let i of this.approvers)
      {
        if (redirect_type == 2)
        {
          i.ar_item_type_id = 3
        }
        if (i.orders > maxOrders) {
          maxOrders = i.orders
        }
      }
      let err = []

      if (maxOrders === 0)
      {
        err.push('Заполните согласующих')
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

      if (redirect_type == 1) 
      {
        this.approvers.push({
          orders: maxOrders + 1,
          ar_item_type_id: this.currentRow.request_status_id == 2 ? 1 : this.currentRow.request_status_id == 9? 2: 3,
          approver_id: this.$userData.fullData.id
        })
      } else if (redirect_type == 2) { 
        this.approvers.push({
          orders: maxOrders + 1,
          ar_item_type_id: this.currentRow.request_status_id == 2 ? 1 : this.currentRow.request_status_id == 9? 2: 3,
          approver_id: this.$userData.fullData.id
        })
      } else {
        throw new Error('invalid redirect type')
      }

      await this.getApproveRedirectSend(redirect_type)
      await this.closeSendToPerformersDialog()
    },
    async getApproveRedirectSend(redirect_type = 1) {

      this.approvers = this.approvers.sort((i1, i2) => {return i1.orders - i2.orders})

      let orders = 1

      let old_value = this.approvers[0].orders

      for (let i of this.approvers) {
        if (i.orders == old_value) {
          i.orders = orders
        } else {
          old_value = i.orders
          orders++
          i.orders = orders
        }
      }

      let params = {
        id: this.currentRow.id,
        approve_request_id: this.currentRow.approve_request_id,
        object_name: this.currentRow.object_name,
        object_id: this.currentRow.object_id,
        request_status_id: this.currentRow.request_status_id,
        redirect_type: redirect_type,

        parent_id: this.currentRow.id,
        approve_rule_items: this.approvers
      }

      try {
        await this.axios.post('/api/1.0/approve/item/redirect', params)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: `На согласовании`,
        });
      } catch (error) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
        });
      } finally {
        this.closeRedirectDialog()

        this.isShowInfoDialog = false
      }
      this.request = await this.getRequest(this.status);
    },
    closeSendToPerformersDialog() {
      this.searchEmployee = []
      this.globalSearchVal = ''
      this.searchedEmployee = null
      this.approvers = []
      this.isShowSendToPerformersDialog = false
    },
    closeRedirectDialog() {
      this.searchEmployee = []
      this.globalSearchVal = ''
      this.searchedEmployee = null
      this.approvers = []
      this.isShowRedirectDialog = false
    },
    showSendToPerformersDialog(item) {
      item.approves = this.currentRow.approves
      this.currentRow = item;
      this.currentRow.isApprove = true;
      this.isShowSendToPerformersDialog = true;
    },
    showRedirectDialog(item) {
      item.approves = this.currentRow.approves
      this.currentRow = item;
      this.currentRow.isApprove = true;
      this.isShowRedirectDialog = true;
    },
    async clearFindRequest() {
      this.request = await this.getRequest(this.status)
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
    async findRequest(findData) {
      this.loader = true
      let params = Object.assign({request_approve_status: this.status}, findData)
      try {
        let url = '/api/1.0/approve/item/'
        let bindData = {
          params,
        } 
        let page = findData.options.page
        this.itemsPerPage = findData.options.itemsPerPage
        let {data} = await this.axios.get(url, bindData)

        if (page != findData.options.page) {
          return
        }

        if (data.length > 0) {
          this.total_length = parseInt(data[0].total)
        } else {
          this.total_length = 0
        }
        this.request = data
      } catch (error) {
        console.error(error)
      }
      this.loader = false
    },

    async getApproveRequests(item) {
      let params = {
          approve_id: item.approve_request_id,
          object_id: item.object_id,
          object_name: item.object_name,
          ar_item_id: item.id,
      }
      let {data} = await this.axios.get(`/api/1.0/approve`, {params})
      data.map(item=>{
        item.approve_items.map(j=>{
          j.create_date?j.create_date = this.$moment(j.create_date).add(this.$moment(new Date()).utcOffset(), 'minutes'):null
        })
      })
      return data
    },

    showApproveDialog(item, isApprove) {
      item.approves = this.currentRow.approves

           this.currentRow = item
      this.currentRow.isApprove = isApprove;
      this.timeSheetFile = null
      this.isShowApproveDialog = true;
    },

    async getRequest(status = '') {
      this.loader = true
      let data
      let st = this.status
      try {
        data = await this.axios.get(`/api/1.0/approve/item/`, {
          params: {request_approve_status: status, options: {page:1, itemsPerPage:10}}
        });
        if (data.data.length > 0) {
          this.total_length = parseInt(data.data[0].total)
        } else {
          this.total_length = 0
        }
      } catch (error) {
        console.error(error)
      }

      data.data.map(item=>{
        item.create_date?item.create_date = this.$moment(item.create_date).add(this.$moment(new Date()).utcOffset(), 'minutes'):null
      })
      this.loader = false

      if (st !== this.status) return
      return data.data;
    },
    async getRequestApproveInfo(data) {
      let infoDialog = await this.getApproveRequests(data)
      this.infoDialog = {...infoDialog[0], ...data}
      this.currentRow.approves = this.infoDialog.approve_items
      if(this.infoDialog.object_info && this.infoDialog.object_name === 'SERVICE_REQUEST') {
         this.infoDialog.object_info.characteristics_list = await this.get_characteristics_list(this.infoDialog.object_info.sr_subcategory_id, this.infoDialog.object_info.sr_id)
      }
      let isFind = this.APPROVE_REQUEST_NOTIFICATIONS.find(el=>el.entity_id == data.id) 
      if(isFind) {
       this.READ_NOTIFICATION(isFind)
      } 
      this.isShowInfoDialog = true
    },
    async getRequestApproveSend() {
      let item = this.currentRow;
      try {
        if (!item.isApprove && !this.approveComment) {
          throw this.$t('approve.commentIsRequired');
        }

        if (item.isApprove && item.object_info && item.object_info.request_type_id == 9 && this.timeSheetFile == null) {
          throw 'Для согласования загрузите подписанный ТУРВ';
        }

        if (item.isApprove && item.object_info && item.object_info.request_type_id == 9 && this.timeSheetFile != null) {
          const form = new FormData();
          form.append("lang", this.$i18n.locale);
          form.append("user_id", this.$userData.fullData.username);
          form.append("file", this.timeSheetFile);
          form.append("fileType", "request");
          form.append("file_type_id", 11);
          form.append("pr_id", item.object_id);

          await this.axios.post(`/api/1.0/pass-request-file/`, form);
          this.timeSheetFile = null;
        }

        item.approve_comment = this.approveComment
        item.ar_item_status_id = this.currentRow.isApprove ? 3 : 4
        item.approver_id = this.$userData.iin

        this.disableDoubleClick = true
        await this.axios.post(`/api/1.0/approve/item`, item);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: this.currentRow.isApprove ? this.$t('approve.approved'):this.$t('approve.denied'),
        });
        this.isShowApproveDialog = false;
        this.isShowInfoDialog = false;
        this.approveComment = ''
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `${this.$t('approve.approveError')}: ${err.data ? err.data.ERR_MSG : err.message || err.ERR_MSG || err}`,
        });
      }
      this.disableDoubleClick = false
      this.request = await this.getRequest(this.status);
    },
    getChipsColor(data) {
      switch(data){
      case 2:
        return 'primary'
      case 9:
        return 'primary'
      case 14:
        return 'primary'
      case 3:
        return 'green'
      case 10:
        return 'green'
      case 15:
        return 'green'
      case 4:
        return 'red'
      case 11:
        return 'red'
      case 5:
        return 'orange'
      case 13:
        return 'orange'
      default:
        break;
      }
    },

        async changeTab(tabNumber) {

      this.itemsPerPage = 10

      if (tabNumber == 0) {
        this.status = 2
      } else if (tabNumber == 1) {
        this.status = 3
      } else if (tabNumber == 2) {
        this.status = 4
      } else if (tabNumber == 3) {
        this.status = 5
      } else {
        this.status = 6
      }

      let request = await this.getRequest(this.status)
      if (request) this.request = request
    },

     async get_characteristics_list(subcategory_id, sr_id) {
      try {
        let {data} = await this.axios.get(`/api/1.0/servicerequests/characteristic/${subcategory_id}/${sr_id}`)
         return data
      } catch(err) {
        console.log(err)
      }
    }


        },
};
</script><style lang="scss" scoped></style>