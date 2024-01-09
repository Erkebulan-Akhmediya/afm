<template>
  <div class="employeeRequest">
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div>
          <v-chip
          v-for="btn of filterBtns"
          :key="btn.id"
          class="mr-2"
          :color="getBtnsColor(btn)"
          :text-color="getBtnsColor(btn) ? 'white' : 'black'"
          @click="changeFilter(btn)"
          >
            {{btn.text}}
          </v-chip>
          
        </div>
      
        <!--<v-btn  v-if="isShowReqCreate" color="primary" depressed @click="dialog = true">
          Подать заявление
        </v-btn>-->
        <v-btn color="primary" outlined @click="openNewRequestDialog();">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          <span v-if="isApplication">Подать заявление</span>
          <span v-else>Подать заявку</span>
        </v-btn>

        <v-dialog v-model="dialog" max-width="800px"
            @input="v => v || clearDialog()">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              <span v-if="isApplication">Форма заявления</span><span v-else>Форма заявки</span>
            </v-card-title>
            <br/>
            <v-card-text>

              <div v-if="multipleEmployee">
                <p>

                  <span class="mt-1 mb-1 ml-1">Список сотрудников: </span>
                  <v-chip class="mt-1 mb-1 ml-1" v-for="v, k in requestData.employees" :key="k">
                    {{ v.last_name }} {{ v.first_name }} {{ v.middle_name }}
                    <v-btn
                      icon
                      @click="deleteEmployee(k)"
                      >
                      <v-icon>
                        mdi-close
                      </v-icon>
                    </v-btn>
                  </v-chip>
                </p>
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
              </div>

              <v-container>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-select
                      ref="type"
                      :items="requestModalType"
                      label="Тип"
                      item-text="state"
                      item-value="abbr"
                      required
                      dense
                      @change="checkType"
                      v-model="requestData.request_type_id"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      ref="subtype"
                      :items="requestModalSubType"
                      label="Подтип"
                      @change="loadFormForSubtype"
                      required
                      dense
                      item-text="state"
                      item-value="abbr"
                      v-model="requestData.request_sub_type_id"
                    ></v-select>
                  </v-col>

                  <v-col v-if="requestData.affordable_vacation">
                    <div v-if="(requestData.request_sub_type_id == 36 || requestData.request_sub_type_id == 12) && requestData.affordable_vacation.days !== null">Количество дней по ежегодному трудовому отпуску: {{requestData.affordable_vacation.days}}</div>
                    <div v-if="(requestData.request_sub_type_id == 36 || requestData.request_sub_type_id == 13) && requestData.affordable_vacation.short_days !== null">Количество дней по краткосрочному трудовому отпуску: {{requestData.affordable_vacation.short_days}}</div>
                    <div v-if="(requestData.request_sub_type_id == 36 || requestData.request_sub_type_id == 22) && requestData.affordable_vacation.ecology_days !== null">Количество дней по отпуску за экологию: {{requestData.affordable_vacation.ecology_days}}</div>
                    <div v-if="(requestData.request_sub_type_id == 36 || requestData.request_sub_type_id == 21) && requestData.affordable_vacation.bonus_days !== null">Количество дней по отпуску за выслугу лет: {{requestData.affordable_vacation.bonus_days}}</div>
                  </v-col>

                  <v-col cols="12" v-if="details_loader">
                    <v-skeleton-loader
                      type="article"
                    >
                    </v-skeleton-loader>
                  </v-col>
                  <v-col cols="12" v-else>
                    <!-- Дополнительные поля -->
                    <div
                      v-for="detail, k in formInputs"
                      :key="k"
                    >
                      <div v-if="!detail.is_multiple">
                        <div
                          v-if="detail.value_type_id == 5 && detail.is_long"
                        >
                          <span>{{ formInputs[k].name }}: </span>
                          <b>{{ 
                            formInputs[k].value[0] && formInputs[k].value[0].selectedRow?formInputs[k].value[0].selectedRow.text:formInputs[k].list_value?formInputs[k].list_value[0].selectedRow.text:'Не выбрано' 
                          }}</b>
                          <v-text-field
                            v-model="detail.search_query"
                            label="Поиск"
                            @keydown.enter="search_detail_value(detail)"
                            @input="search_detail_value(detail)"
                          >
                          </v-text-field>
                          <v-data-table
                            :headers="[{text: '', value: 'text'}]"
                            dense
                            :items="detail.list_details"
                            hide-default-footer
                            hide-default-header
                            :no-data-text="detail.search_query?'Отсутствуют данные': ''"
                            @click:row="(row) => {selectCatalogValue(row, k)}"
                            >
                          </v-data-table>
                        </div>
                        <v-select
                          v-if="detail.value_type_id == 5 && !detail.is_long"
                          :label="detail.name" 
                          v-model="detail.value[0]"
                          :items="detail.list_details"
                        >
                        </v-select>
                        <v-select
                          v-if="detail.value_type_id == 4"
                          :label="detail.name" 
                          v-model="detail.value[0]"
                          :items="detail.list_details"
                        >
                        </v-select>
                        <v-checkbox
                          v-if="detail.value_type_id == 7"
                          :label="detail.name" 
                          v-model="detail.value[0]"
                        >
                        </v-checkbox>

                        <v-menu
                          v-model="detail.menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                          v-if="detail.value_type_id == 6"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="detail.date_value[0]"
                              :label="detail.name" 
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-datetime-picker id="date" 
                                              ref="date"
                                              @input="detail.menu2 = false"
                                              :datePickerProps="{'first-day-of-week': 1}" 
                                              :timePickerProps="{format: '24hr', scrollable: true}"
                                              clearText="Очистить" 
                                              okText="Ок" 
                                              dateFormat="dd.MM.yyyy" 
                                              required
                                              v-model="detail.date_value[0]"
                                              >
                            <template slot="dateIcon">
                              <span class="mr-4">Дата</span>
                              <v-icon>mdi-calendar</v-icon>
                            </template>
                          </v-datetime-picker>
                        </v-menu>

                        <v-menu
                          v-model="detail.menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                          v-if="detail.value_type_id == 3"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="detail.date_value[0]"
                              :label="detail.name" 
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker id="date" 
                                              ref="date"
                                              @input="detail.menu2 = false"
                                              :datePickerProps="{'first-day-of-week': 1}" 
                                              clearText="Очистить" 
                                              okText="Ок" 
                                              dateFormat="dd.MM.yyyy" 
                                              required
                                              v-model="detail.date_value[0]"
                                              >
                            <template slot="dateIcon">
                              <span class="mr-4">Дата</span>
                              <v-icon>mdi-calendar</v-icon>
                            </template>
                          </v-date-picker>
                        </v-menu>
                        <v-text-field
                          :label="detail.name"
                          v-if="detail.value_type_id == 1 || detail.value_type_id == 2"
                          :type="detail.value_type_id == 1? 'text': 'number'"
                          required
                          v-model="detail.value[0]"
                        ></v-text-field>
                      </div>
                      <div 
                        v-else
                      >
                        <div
                          >
                          <!--
                          <span
                            class="mb-1 mt-1"
                            >
                            {{ detail.name }}: 
                          </span>
                          {{ detail.value }}

                          <v-chip 
                            class="ml-1 mb-1 mt-1"
                            v-for="value, i of detail.value"
                            :key="i"
                            >

                            <span
                              v-if="detail.value_type_id == 5 || detail.value_type_id == 4"
                            >
                              <b>{{ formInputs[k].value[i] && formInputs[k].value[i].selectedRow?formInputs[k].value[i].selectedRow.text:formInputs[k].list_value[i]?formInputs[k].list_value[i].selectedRow.text:'Не выбрано' }}</b>
                            </span>


                            <span
                              v-if="detail.value_type_id != 5 && detail.value_type_id != 4"
                            >
                              {{ detail.value[i] }}
                            </span>
                            <v-btn
                              icon
                              @click="delete_value(detail, i)"
                              >
                              <v-icon>
                                mdi-close
                              </v-icon>
                            </v-btn>

                          </v-chip>
                          -->

                        </div>

                        <div
                          v-if="detail.value_type_id == 5 && detail.is_long"
                        >
                          <v-text-field
                            v-model="detail.search_query"
                            label="Поиск"
                            @keydown.enter="search_detail_value(detail)"
                            @input="search_detail_value(detail)"
                          >
                          </v-text-field>
                          <v-data-table
                            :headers="[{text: '', value: 'text'}]"
                            dense
                            :items="detail.list_details"
                            :no-data-text="detail.search_query?'Отсутствуют данные': ''"
                            hide-default-footer
                            hide-default-header
                            @click:row="(row) => {selectCatalogValue(row, detail.value.length, k)}"
                            >
                          </v-data-table>
                        </div>


                        <v-menu
                          v-model="detail.menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                          v-if="detail.value_type_id == 6"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="detail.temp_date_value"
                              :label="detail.name" 
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-datetime-picker id="date" 
                                              ref="date"
                                              @input="detail.menu2 = false"
                                              :datePickerProps="{'first-day-of-week': 1}" 
                                              :timePickerProps="{format: '24hr', scrollable: true}"
                                              clearText="Очистить" 
                                              okText="Ок" 
                                              dateFormat="dd.MM.yyyy" 
                                              required
                                              v-model="detail.temp_date_value"
                                              >
                            <template slot="dateIcon">
                              <span class="mr-4">Дата</span>
                              <v-icon>mdi-calendar</v-icon>
                            </template>
                          </v-datetime-picker>
                        </v-menu>

                        <v-menu
                          v-model="detail.menu2"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                          v-if="detail.value_type_id == 3"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="detail.temp_date_value"
                              :label="detail.name" 
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker id="date" 
                                              ref="date"
                                              @input="detail.menu2 = false"
                                              :datePickerProps="{'first-day-of-week': 1}" 
                                              clearText="Очистить" 
                                              okText="Ок" 
                                              dateFormat="dd.MM.yyyy" 
                                              required
                                              v-model="detail.temp_date_value"
                                              >
                            <template slot="dateIcon">
                              <span class="mr-4">Дата</span>
                              <v-icon>mdi-calendar</v-icon>
                            </template>
                          </v-date-picker>
                        </v-menu>

                        <v-select
                          v-if="detail.value_type_id == 5 && !detail.is_long"
                          :label="detail.name" 
                          multiple
                          v-model="detail.value"
                          :items="detail.list_details"
                        >
                        </v-select>
                        <v-select
                          v-if="detail.value_type_id == 4"
                          :label="detail.name" 
                          v-model="detail.temp_value"
                          :items="detail.list_details"
                        >
                        </v-select>
                        <v-checkbox
                          v-if="detail.value_type_id == 7"
                          :label="detail.name" 
                          v-model="detail.temp_value"
                        >
                        </v-checkbox>

                        <v-text-field
                          v-if="detail.value_type_id == 1 || detail.value_type_id == 2"
                          v-model="detail.temp_value"
                        >
                        </v-text-field>

                        <v-btn
                          icon
                          v-if="false"
                          @click="add_value(detail)"
                          >
                          <v-icon>
                            mdi-plus
                          </v-icon>
                        </v-btn>


                      </div>
                    </div>
                  </v-col>
                  <v-col 
                    v-if="isApplication"
                    cols="12"
                    >
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="closeDialog()">
                Отмена
              </v-btn>
              <v-btn color="success" text @click="saveRequest" :disabled="disableDoubleClick || formInputs.length == 0" :loading="sendingApplication">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="mb-6">
          <FindRequest @findRequest="findRequest" @clearFindRequest="clearFindRequest"></FindRequest>
        </div>

        <v-data-table
          :loading="loader"
          dense
          :headers="headersRequest"
          :items="request"
          :options.sync="options"
          :server-items-length="totalRequestLength"
          class="elevation-1"
          @click:row="getRequestApproveInfo"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.type`]="{ item }">
            <td>{{ item.request_type_name }}</td>
          </template>
          <template v-slot:[`item.date_from`]="{ item }">
            <td>{{ item.date_from ? moment(item.date_from).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : '' }}</td>
          </template>
          <template v-slot:[`item.date_to`]="{ item }">
            <td>{{ item.date_to ? moment(item.date_to).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : ''}}</td>
          </template>
          <template v-slot:[`item.create_date`]="{ item }">
            <td>{{ item.create_date ? moment(item.create_date).add($moment(new Date()).utcOffset(), 'minutes').format('DD.MM.YYYY HH:mm') : ''}}</td>
          </template>
          <template v-slot:[`item.sub_type`]="{ item }">
            <td>{{ item.request_sub_type_name }}</td>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <td>
              <v-chip
                class="ma-2"
                :color="getChipsColor(item.request_status_id)"
                text-color="white"
              >
                <span>{{ item.request_status_name }}</span>
              </v-chip>
            </td>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              small
              color="primary"
              @click.stop="openDetailsDialog(item)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              small
              color="red"
              @click.stop="openDeactivateDialog(item)"
              v-if="item.request_status_id == 1 && item.create_user == $userData.fullData.username"
            >
              <v-icon>mdi-undo</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              small
              color="primary"
              v-if="item.request_status_id == 0 || item.request_status_id == 5 || item.request_status_id == 6"
              @click="showEditRequestDialog(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              small
              color="red"
              v-if="item.request_status_id == 0 && $userData.fullData.username == item.create_user"
              @click="deleteRequest(item)"
            >
              <v-icon>mdi-trash-can</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              small
              color="green"
              v-if="item.request_status_id === 0 || item.request_status_id === 5  || item.request_status_id === 6 /*0 - проект, 5 - отправлен на доработку*/"
              @click.stop="sendToApprove(item)"
              >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <ApproveList ref="approve_list" :currentRequestStatus="currentRequestStatus" :currentRequest="currentRequest">
        </ApproveList>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <FileList :currentData="currentRequest" :isApplication="isApplication">
        </FileList>
      </v-col>
    </v-row>


    <v-dialog 
      v-model="detailsDialog"
      max-width="600px"
      >
      <v-card>
        <v-card-title style="background-color: #1976d2;">
          Информация по заявке
        </v-card-title>
        <br/>
        <v-card-text>

          <p>
          <span class="mt-1 mb-1 ml-1">Список сотрудников: </span>
          <v-chip class="mt-1 mb-1 ml-1" v-for="v, k in currentRequest.employees" :key="k">
            {{ v.last_name }} {{ v.first_name }} {{ v.middle_name }}
          </v-chip> 
          </p>

          <p><b>{{ $t('globalWords.type') }}:</b> {{ currentRequest.request_type_name }}</p>
          <p><b>{{ $t('globalWords.subType') }}:</b> {{ currentRequest.request_sub_type_name }}</p>
          <p><b>{{ $t('globalWords.status') }}:</b> 
            <v-chip
              class="ma-2"
              :color="getChipsColor(currentRequest.request_status_id)"
              text-color="white"
              >
              <span>{{ currentRequest.request_status_name }}</span>
            </v-chip>
          </p>
          
          <RequestDetails v-if="currentRequest.details && currentRequest.details.length !== 0" :details="currentRequest.details">
          </RequestDetails>

        </v-card-text>
        <br/>
        <v-card-actions>
          <v-btn
            @click="detailsDialog = false"
            >
            Отмена
          </v-btn>
          <v-spacer> </v-spacer>
          <v-btn
            v-if="currentRequest.request_type_id == 4"
            @click="downlaodVacationFile"
            :disabled="true"
          >
            Сформировать справку
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-dialog
      v-model="infoApproveDialog"
      width="500"
    >
      <v-card>
        <v-card-text style="padding: 30px">
            <slot>
                <div style="color: #000;">
                    
                    <p>Очередь согласования: <input 
                      class="mr-2 ml-4"
                      type="number" 
                      style="width: 50px;"
                      v-model="infoApproveDialogData.orders"
                      >
                    </p>
                    <p>Согласующий: <b>{{infoApproveDialogData.emp_name}}</b></p>
                    <v-select v-if="infoApproveDialogData.request_status_id" class="ml-6" :items="ar_item_type_list" v-model="infoApproveDialogData.ar_item_type_id"></v-select>
                </div>
            </slot>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
          outlined
            color="primary"
            text
            @click="saveEditApprover()"
          >
            Ок
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="addApproverDialog"
      width="700"
      >
      <v-card>
        <v-card-text>
          <v-container>
            <h3 class="mb-6 mt-6">{{ $t('approve.approver') }}</h3>
            <v-row class="mt-6">
              <v-container>
                <v-row
                  v-if="approver != null"
                  class="d-flex align-center mb-6"
                  >
                  Шаг согласования: 
                  <input 
                    class="ml-2 mr-4"
                    type="number" 
                    style="width: 30px; border-bottom: 1px solid black;"
                    v-model="approver.orders"
                    >
                  {{ approver.last_name }} {{ approver.first_name }} {{ approver.middle_name }}
                  <v-select class="ml-6" :items="ar_item_type_list" v-model="approver.ar_item_type_id"></v-select>
                </v-row>
                <v-row v-else>
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
                <EmployeeTableSmallSearch @clickOnRow="selectApprover" :employeeTable="searchEmployeeTable" :adminUsersForm="false"
                ></EmployeeTableSmallSearch>
              </v-col>
            </v-row>
          </v-container>

        </v-card-text>
        <v-card-actions>
          <v-btn
            @click="addApproverDialog = false"
            >
            Отмена
          </v-btn>
          <v-spacer>
          </v-spacer>
          <v-btn
            @click="addApprover"
            >
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Согласование или отказ -->
    <v-dialog v-model="isShowApproveDialog" width="500">
      <v-card>
        <v-card-text style="padding: 30px">
          <slot>
            <div style="color: #000;">
              <v-row>
                <v-col>
                  <v-textarea
                    outlined
                    name="input-7-4"
                    :label="$t('approve.comment')"
                    v-model="approve_comment"
                  ></v-textarea>
                </v-col>
              </v-row>
            </div>
          </slot>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            outlined 
            color="primary" 
            text 
            @click="getRequestApproveSend" 
          >
            {{ $t('globalWords.send') }}
          </v-btn>
          <v-btn
            outlined
            color="error"
            text
            @click="isShowApproveDialog = false"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import FileList from '../components/FileList.vue'
import ApproveList from '../components/ApproveList.vue'
import moment from 'moment'
import checkRoles from '@/utils/check_role'
import FindRequest from '../components/FindRequest.vue'
import RequestDetails from '../components/RequestDetails.vue'

export default {
  components: {
    FileList,
    ApproveList,
    FindRequest,
    RequestDetails
  },
  computed: {
    is_active_candidate_request: { 
      get() { return this.$store.state.employee.is_active_candidate_request },
      set(value) { this.$store.commit('setIsActiveCandidateRequest', value) }
    }
  },
  data: function() {
    return {
      employees: [],
      btnLoader:false,
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

      details_loader: false,
      detailsDialog: false,
      generate_rules: false,
      currentRequestStatus: null,
      currentRequest: {},
      moment,
      menu: false,
      dialog: false,
      addApproverDialog: false,
      request: [],
      request_approve: [],
      formInputs: [

      ],

      searchEmployeeTable: [],
      searchEmployee: [],
      globalSearchVal: '',
      approver: null,

      requestData: {
        request_type_id: '',
        request_sub_type_id: '',
        employees: [{
          id: this.employee.id, 
          first_name: this.employee.first_name, 
          last_name: this.employee.last_name, 
          middle_name: this.employee.middle_name, 
          }]
      },

      headersRequest: [
      { text: 'Номер', value: 'id', sortable: false },
      { text: this.$t('employeeCard.tabs.type'), value: 'type' },
      { text: this.$t('employeeCard.tabs.subType'), value: 'sub_type' },
      { text: 'Дата создания', value: 'create_date' },
      { text: this.$t('employeeCard.tabs.status'), value: 'status' },
      { text: '', value: 'action', width: '15%' },
      ],
      headersRequestApprove: [
      { text: 'Id', value: 'id' },
      { text: 'Parent id', value: 'parent_id' },
      { text: 'Шаг согласования', value: 'orders' },
      { text: 'Согласующий', value: 'emp_name' },
      { text: 'Дата отправки', value: 'send_date' },
      { text: 'Дата согласования/поручения', value: 'approve_date' },
      { text: this.$t('employeeCard.tabs.comment'), value: 'comment' },
      { text: this.$t('employeeCard.tabs.status'), value: 'status' },
      { text: '', value: 'action' },
      ],

      disableDoubleClick: false,
      sendingApplication: false,
      requestModalType: [],
      requestModalSubType: [],

        date_toPickerState: '',
      date_fromPickerState: '',

      infoApproveDialog: false,
      infoApproveDialogData: {},

      filter: 'Все',
      filterBtns: [
       {color: 'primary', text: 'Все', status: 0},
       {color: 'primary', text: 'Подано', status: 1},
       {color: 'success', text: 'Согласовано', status: 2},
       {color: 'error', text: 'Отклонено', status: 3},
      ],
      loader: false,
      isShowReqCreate: false,
      approve_comment: '',
      isShowApproveDialog: false,

      options: {},
      totalRequestLength: 0,
    }

      },
  methods: {

        async downlaodVacationFile() {

      let df, dt


      if (this.currentRequest.request_sub_type_id == 12 || this.currentRequest.request_sub_type_id == 22 || this.currentRequest.request_sub_type_id == 21 || this.currentRequest.request_sub_type_id == 13) {

        for (let i of this.currentRequest.details) {
          if (i.characteristic_id == 19) {
            df = moment(i.value[0]).format('dd MMMM YYYY')
          } else if (i.characteristic_id == 20) {
            dt = moment(i.value[0]).format('dd MMMM YYYY')
          }
        }
      }


      let url, docName
      let binds = {
        first: this.currentRequest.employees[0].first_name,
        last: this.currentRequest.employees[0].last_name, 
        middle: this.currentRequest.employees[0].middle_name,
        employee_first_name: this.currentRequest.employees[0].first_name,
        employee_middle_name: this.currentRequest.employees[0].middle_name,
        employee_last_name: this.currentRequest.employees[0].last_name,
        date_from: df,
        date_to: dt,
      }
      url = `/api/1.0/reference/doc_getHoliday`
      docName = `Справка по отпуску`

      this.axios
        .post(url, binds)
        .then((response) => {
          let blob = new Blob([new Buffer(response.data, "base64")], {
            type: "application/document",
          });
          const a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = `${docName}.docx`;
          a.click();
          a.remove();
        });

    },
    delete_value(detail, k) {
      detail.value.splice(k, 1)
    },
    add_value(detail) {
      if (detail.temp_value) {
        detail.value.push(detail.temp_value)
      }
      detail.temp_value = null
    },
    edit_value(i) {
      this.editValueIndex = i
    },
    async search_detail_value(detail) {
      let {data: values} = await this.axios.get(`/api/1.0/characteristic/catalog/:catalog_name`, {localParams: {catalog_name: detail.catalog_name}, params:{search_query: detail.search_query}})
      detail.list_details = values
      this.formInputs.splice(11, 0)
    },
    selectCatalogValue(row, detail, key = 0) {
      if (!this.formInputs[detail].list_value) {
        this.formInputs[detail].list_value = [{},]
      }

            this.formInputs[detail].list_value[key].selectedRow = row
      this.formInputs[detail].list_value[key].value = row.value
      this.formInputs[detail].value[key] = row.value
      this.formInputs[detail].list_value[key].list_details = [] 
      this.formInputs[detail].list_details = [] 
      this.formInputs.splice(detail, 0)
    },
    closeDialog() {
      this.dialog = false;  
    },
    openNewRequestDialog() {
      this.requestData = {
        request_type_id: '',
        request_sub_type_id: '',
        employees: [{
          id: this.employee.id, 
          first_name: this.employee.first_name, 
          last_name: this.employee.last_name, 
          middle_name: this.employee.middle_name, 
          }]
      }


           this.formInputs = []

           this.dialog = true
    },
    async deleteRequest(item){

      this.$swal({
        title: `Вы действительно хотите удалить запись ${item.id}?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await this.axios.put(`/api/1.0/request-delete/${item.id}`)
            await this.getMainRequest()

            this.$swal({
            ...this.$optionAlert.fire,
            icon: "success",
            title: "Запись удалена.",
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
    async showEditRequestDialog(item) {


      let params = {
        request_status: status, 
        is_application: this.isApplication, 
        only_assigned_to_you: this.onlyAssignedToYou,
        employee_id: this.employee.id,
      }

      if (this.searchData) {
        params.search_query = this.searchData.search_query
      }

      let {data: requests} = await this.axios.get(`/api/1.0/request/:id`, {localParams: {id: item.id}, params })
      item = requests[0]

      if (!item.details) {
        item.details = []
      }

      if (item.request_sub_type_id == 36 || item.request_sub_type_id == 12) {
        let {data} = await this.axios.get('/api/1.0/employee-affordable-vacation/:identification_number', {localParams:{identification_number: this.$userData.fullData.identification_number}})
        item.affordable_vacation = data
      }

      for (let i of item.details) {
        if (i.value_type_id === 3) {
          if (!i.date_value) {
            i.date_value = []
          }
          if (i.value[0] != '') {
            i.date_value[0] = moment(i.value[0]).format('YYYY-MM-DD')
          }
          else {
            i.date_value[0] = null
          }
        } else if (i.value_type_id === 4) {
          let {data: details} = await this.axios.get(`/api/1.0/characteristic/list/${i.characteristic_id}`)
          i.list_details = details
        } else if (i.value_type_id === 7) {
          i.value[0] = i.value[0] == 'true'? true: false
        } else if (i.value_type_id === 5) {
          let {data: details} = await this.axios.get(`/api/1.0/characteristic/catalog/:catalog_name`, {localParams: {catalog_name: i.catalog_name}})
          for (let j in i.value) {
            i.value[j] = parseInt(i.value[j])
          }
          if(details.length > 10) {
            i.is_long = true
          } else {
            i.list_details = details
            i.is_long = false
          }
        }
      }

      this.formInputs = item.details

      for (let i of this.formInputs) 
      {
        i.selectedRow = {
          value: i.value,
          text: i.list_value
        }
      }

      let {data} = await this.axios.get(`/api/1.0/lov/ref.request_sub_type`, {params: {request_type_id: item.request_type_id}})

      this.requestModalSubType = data.filter(item => item.id > 0).reduce((acc, item) => {
        acc.push({
          abbr: item.id,
          state: item.name
        })
        return acc
      }, [])


            this.requestData = item

      this.dialog = true
    },
    async saveEditApprover() {
      try {
        let params = {
          orders: this.infoApproveDialogData.orders,
          ar_item_type_id: this.infoApproveDialogData.ar_item_type_id
        }
        await this.axios.put(`/api/1.0/approve/item/${this.infoApproveDialogData.id}`, params)
      } catch (err) {
        console.error(err)
      } finally {
        this.infoApproveDialog = false
      }
    },
    showApproveDialog(isApprove) {
      this.currentRequest.isApprove = isApprove
      this.isShowApproveDialog = true
    },
    async getRequestApproveSend() {
      let params = {
      }

      try {
        if (!this.currentRequest.isApprove && !this.approve_comment) {
          throw this.$t('approve.commentIsRequired');
        }

        params.approve_comment = this.approve_comment
        params.ar_item_status_id = this.currentRequest.isApprove ? 2 : 3

        await this.axios.put(`/api/1.0/approve/request/${this.currentRequest.approve_request_id}`, params);
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: this.currentRequest.isApprove ? this.$t('approve.approved'):this.$t('approve.denied'),
        });
        await this.getMainRequest()
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `${this.$t('approve.approveError')}: ${err.data ? err.data.ERR_MSG : err.message || err.ERR_MSG || err}`,
        });
      } finally {
        this.isShowApproveDialog = false
        this.approveComment = ''
        this.detailsDialog = false
      }
    },
    async openDeactivateDialog (item) {

      this.$swal({
        title: `Вы действиьельно хотите деактивировать заявление?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#4caf50",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if(result.isConfirmed){
          await this.axios.put(`/api/1.0/request-deactivate/${item.approve_request_id}`, {})
          await this.getMainRequest()
        }   
      })
    },
    async openDetailsDialog (item) {

      let params = {
        request_status: status, 
        is_application: this.isApplication, 
        only_assigned_to_you: this.onlyAssignedToYou,
        employee_id: this.employee.id,
      }

      if (this.searchData) {
        params.search_query = this.searchData.search_query
      }

      let {data: requests} = await this.axios.get(`/api/1.0/request/:id`, {localParams: {id: item.id}, params })
      item = requests[0]

      this.detailsDialog = true
      this.currentRequest = item
    },
    async deleteApprover (item) {
      try{
        await this.axios.delete(`/api/1.0/approve/item/${item.id}`, {id: item.id})
        await this.getRequestApproveInfo(this.currentRequest)
      } catch (err) {
        console.error(err)
      }
    },
    async addApprover () {

      let approvers = this.request_approve.filter(item => item.request_status_id == 1 || item.request_status_id == 2)

      if (approvers.length > 0)
      {

        let max = approvers[0].orders
        for (let i of approvers) {
          if (max < i.orders) {
            max = i.orders
          }
        }
        if (this.approver.orders > max) {
          this.approver.orders = Number(max) + 1
        }
      } else {
        this.approver.orders = 1
      }

      try {
        let params = {
          approve_request_id: this.currentRequest.approve_request_id,
          item: {
            ar_item_type_id: this.approver.ar_item_type_id,
            orders: this.approver.orders,
            approver_id: this.approver.id
          }
        }

        await this.axios.post(`/api/1.0/approve/item/project`, params)

        await this.getRequestApproveInfo(this.currentRequest)

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          width: 600,
          title: `Согласующий добавлен`,
        });
      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: err.data ? err.data.ERR_MSG : err.msg || err,
        });
      } finally {
        this.searchEmployee = []
        this.globalSearchVal = ''
        this.searchedEmployee = null
        this.approver = null
        this.addApproverDialog = false
      }

    },
    validateApproverList(approver_list) {
      if (this.generate_rules) return true
      if (approver_list.length === 0) return false
      for (let i of approver_list)
      {
        if (i.request_status_id === 1 || i.request_status_id === 12 || i.request_status_id === 8 )
        {
          return true
        }
      }
      return false
    },
    async sendToApprove () {

      await this.$refs.approve_list.sendToApprove()
      await this.getMainRequest()
      this.is_active_candidate_request = true
    },
    deleteEmployee (id) {
      this.requestData.employees.splice(id, 1)
    },
    selectEmployee (data) {

      if (this.requestData.employees.findIndex((item)=>{
        return item.id == data.id && item.first_name == data.first_name && item.last_name == data.last_name && item.middle_name == data.middle_name
      }) != -1) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: "Данный пользователь уже добавлен в заявку",
        });
      }
      let searchedEmployee = {}

      searchedEmployee.id = data.id
      searchedEmployee.first_name = data.first_name
      searchedEmployee.last_name = data.last_name
      searchedEmployee.middle_name = data.middle_name
      this.requestData.employees.push(searchedEmployee)
      this.searchEmployeeTable = this.searchEmployeeTable.filter(item=>item.id!=data.id)
    },
    globalSearch () {
      let params = {
        text: this.globalSearchVal,
        organization_id: this.$userData.fullData.organization_id,
        without_performers: true,
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
          text: this.globalSearchVal,
          organization_id: this.$userData.fullData.organization_id,
          without_performers: true,
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
    selectApprover (data) {
      let searchedEmployee = data
      searchedEmployee.approver_id = data.id
      searchedEmployee.emp_first_name = data.first_name
      searchedEmployee.emp_last_name = data.last_name
      searchedEmployee.emp_middle_name = data.middle_name
      data.orders = 1
      this.approver = searchedEmployee
      this.approver.ar_item_type_id = 1
      this.searchEmployeeTable = this.searchEmployeeTable.filter(item=>item.id!=data.id)
    },
    async loadFormForSubtype (newid) {
      this.details_loader = true
      let {data: formInputs} = await this.axios.get(`/api/1.0/request-characteristic/${newid}`)   

            if (this.requestData.request_sub_type_id == 36 || this.requestData.request_sub_type_id == 12 || this.requestData.request_sub_type_id == 22 || this.requestData.request_sub_type_id == 21  || this.requestData.request_sub_type_id == 13) {
        let {data} = await this.axios.get('/api/1.0/employee-affordable-vacation/:identification_number', {localParams:{identification_number: this.$userData.fullData.identification_number}})
        this.requestData.affordable_vacation = data
      }

      for (let i of formInputs) {
        i.value = []
        i.date_value = []
        if (i.value_type_id === 7) {
          i.value[0] = i.value[0] == 'true'? true: false
        }
        if (i.value_type_id === 4) {
          let {data: details} = await this.axios.get(`/api/1.0/characteristic/list/${i.characteristic_id}`)
          i.list_details = details
        }
        if (i.value_type_id === 5) {
          let {data: details} = await this.axios.get(`/api/1.0/characteristic/catalog/:catalog_name`, {localParams: {catalog_name: i.catalog_name}})
          if(details.length > 10) {
            i.is_long = true
          } else {
            i.is_long = false
            i.list_details = details
          }
        }
      }

      this.formInputs = formInputs
      this.details_loader = false
    },

    async clearFindRequest() {
      this.searchData = null
      await this.getMainRequest()
    },

    async findRequest(data) {
      this.searchData = data
      try {
        await this.getMainRequest()

      } catch (err) {
        console.error(err)
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          width: 600,
          title: err.data ? err.data.ERR_MSG : err.msg || err,
        });
      }
    },

        clearFrom() {
      if(!this.isApplication)
      {
        return
      }

          },

      clearDialog() {
      this.requestData = {
            request_type_id: '',
            request_sub_type_id: '',
            employees: [{
              id: this.employee.id, 
              first_name: this.employee.first_name, 
              last_name: this.employee.last_name, 
              middle_name: this.employee.middle_name, 
              }]
      }

         },

      getChipsColor(data) {
          switch(data){
              case 1:
                  return 'primary'
              case 8:
                  return 'primary'
              case 13:
                  return 'primary'
              case 2:
                  return 'green'
              case 9:
                  return 'green'
              case 14:
                  return 'green'
              case 3:
                  return 'red'
              case 10:
                  return 'red'
              case 4:
                  return 'orange'
              case 12:
                  return 'orange'
              default:
                  break;
          }
      },

            checkType(data) {
          let params = {
              request_type_id: data,
          }
          this.axios.get(`/api/1.0/lov/ref.request_sub_type`, {params})
              .then(({data}) => {
                  this.requestModalSubType = data.filter(item => item.id > 0).reduce((acc, item) => {
                      acc.push({
                          abbr: item.id,
                          state: item.name
                      })
                  return acc
                  }, [])
              })        
      },

      async saveRequest() {
        this.disableDoubleClick = true
        this.sendingApplication = true
        let err = []

        if (this.requestData.request_sub_type_id == 36) {
          let df1, dt1
          let df2, dt2
          let df3, dt3
          let df4, dt4

          for (let i of this.formInputs) {
            if (i.characteristic_id == 50) {
              df1 = moment(i.date_value[0])
            } else if (i.characteristic_id == 51) {
              dt1 = moment(i.date_value[0])
            } else if (i.characteristic_id == 48) {
              df2 = moment(i.date_value[0])
            } else if (i.characteristic_id == 49) {
              dt2 = moment(i.date_value[0])
            } else if (i.characteristic_id == 54) {
              df3 = moment(i.date_value[0])
            } else if (i.characteristic_id == 55) {
              dt3 = moment(i.date_value[0])
            } else if (i.characteristic_id == 52) {
              df4 = moment(i.date_value[0])
            } else if (i.characteristic_id == 53) {
              dt4 = moment(i.date_value[0])
            }
          }
          let bd1 = 0
          let bd2 = 0
          let bd3 = 0
          let bd4 = 0

          bd1 = this.requestData.affordable_vacation.days
          bd2 = this.requestData.affordable_vacation.short_days
          bd3 = this.requestData.affordable_vacation.bonus_days
          bd4 = this.requestData.affordable_vacation.ecology_days

          if (bd1 != 0) {
            if (dt1.diff(df1, 'days') >= bd1 ) {
              err.push('Вы взяли больше отпускных дней по ежегодному отпуску чем вам положено')
            }
          }
          if (bd2 != 0) {
            if (dt2.diff(df2, 'days') >= bd2 ) {
              err.push('Вы взяли больше отпускных дней по кратковременному отпуску чем вам положено')
            }
          }
          if (bd3 != 0) {
            if (dt3.diff(df3, 'days') >= bd3 ) {
              err.push('Вы взяли больше отпускных дней по отпуску за выслугу лет чем вам положено')
            }
          }
          if (bd4 != 0) {
            if (dt4.diff(df4, 'days') >= bd4 ) {
              err.push('Вы взяли больше отпускных дней по отпуску за экологию чем вам положено')
            }
          }
        }

        if (this.requestData.request_sub_type_id == 12 || this.requestData.request_sub_type_id == 22 || this.requestData.request_sub_type_id == 21 || this.requestData.request_sub_type_id == 13) {
          let df, dt

          for (let i of this.formInputs) {
            if (i.characteristic_id == 19) {
              df = moment(i.date_value[0])
            } else if (i.characteristic_id == 20) {
              dt = moment(i.date_value[0])
            }
          }
          let bd = 0

          if (this.requestData.request_sub_type_id == 12) {
            bd = this.requestData.affordable_vacation.days
          } else if (this.requestData.request_sub_type_id == 13) {
            bd = this.requestData.affordable_vacation.short_days
          } else if (this.requestData.request_sub_type_id == 21) {
            bd = this.requestData.affordable_vacation.bonus_days
          } else if (this.requestData.request_sub_type_id == 22) {
            bd = this.requestData.affordable_vacation.ecology_days
          }

          if (bd != 0) {
            if (dt.diff(df, 'days') >= bd ) {
              err.push('Вы взяли больше отпускных дней чем вам положено')
            }
          }
        }


        if(!this.requestData.request_type_id) {
          err.push('"Тип" обязателен для заполнения')
        }

        if(!this.requestData.request_sub_type_id) {
          err.push('"Подтип" обязателен для заполнения')
        }

        if(this.requestData.employees.length == 0) {
          err.push('Вы не добавили ни одного сотрудника')
        }

        for (let i of this.formInputs) {
          if (i.is_required && !(i.value[0] || i.date_value[0])) {
            err.push(`Поле "${i.name}" обязательно`)
          }
        }

        if(err.length) {
          this.disableDoubleClick = false
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            timer: 5000,
            width: 600,
            title: err.join('; <br>'),
          });
        }
        let bindRequest = Object.assign({}, this.requestData)

        this.dialog = false

        for (let i of this.formInputs) {
          if (i.value_type_id === 7) {
            if (!i.value[0]) {
              i.value[0] = 'false'
            }else {
              i.value[0] = 'true'
            }
          }
          else if (i.value_type_id === 5) {
            for (let j in i.value) {
              if (i.value[j].value){
                i.value[j] = i.value[j].value
              }
              if (!i.value[j]){
                i.value[j] = ''
              }
            }
          }
          else if (i.value_type_id === 3 && i.date_value[0]) {
            i.value[0] = this.moment(i.date_value[0]).format('YYYY-MM-DD')
          } else {
            if (!i.value[0]){
              i.value[0] = ''
            }
          }
        }

        bindRequest.details = this.formInputs

        try{
          if (bindRequest.id)
          {
            bindRequest.details = this.formInputs
            await this.axios.put(`/api/1.0/request-edit/${bindRequest.id}`, bindRequest)
          }else{
            let {data: request_id} = await this.axios.post(`/api/1.0/request`, bindRequest)
            await this.axios.post(`/api/1.0/approve/request/project`, {request_id: request_id})
          }



                    this.$swal({
            ...this.$optionAlert.fire,
            icon: "success",
            title: `Сохранено`,
          });

                    this.clearDialog()

          await this.getMainRequest()

        } catch (err) {
          console.error(err)
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            width: 600,
            title: err.data ? err.data.ERR_MSG : err.msg || err,
          });
        } finally {
          this.disableDoubleClick = false
          this.sendingApplication = false
        }
      },

      async getMainRequest(status = 0) {
        this.loader = true
        let page = this.options.page
        try{

          let filter = this.filterBtns.find(item => item.text == this.filter)
          if(filter) {
            status = filter.status
          }

          let params = {
            request_status: status, 
            is_application: this.isApplication, 
            only_assigned_to_you: this.onlyAssignedToYou,
            employee_id: this.employee.id,
            ...this.options
          }

          if (this.searchData) {
            params.search_query = this.searchData.search_query
          }



          let {data: requests} = await this.axios.get(`/api/1.0/request/`, {params })


          if(requests[0]) {
            this.totalRequestLength = parseInt(requests[0].total) 
          } else {
            this.totalRequestLength = 0
          }


          if (!(checkRoles('41', this.$userData) || checkRoles('39', this.$userData))) { 
            requests = requests.filter(item => item.request_type_id != 3)
          }

          if(page != this.options.page) {
            return
          }

          this.request = requests        
          } catch(err) {
          console.error(err)
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: `${this.$t('approve.approveError')}: ${err.data ? err.data.ERR_MSG : err.message || err.ERR_MSG || err}`,
          });
        } finally {
          if (page == this.options.page)
          {
            this.loader = false
          }
        }
      },

      async getRequestApproveInfo(data) {
          let params = {
              object_info: {
                object_id: data.id,
                object_name: 'REQUEST',
              },
          }

          this.currentRequest = data
          this.currentRequestStatus = data.request_status_id

          const {data: approves} = await this.axios.get(`/api/1.0/approve/item`, {params})

          this.request_approve = approves
      },

      showInfoApproveDialog(data) {
          this.infoApproveDialogData = data
          this.infoApproveDialog = true
      },

      async changeFilter(btn) {
        if(this.filter != btn.text) {
          this.filter = btn.text
          this.options.page = 1
          this.options.itemsPerPage = 10

          await this.getMainRequest(btn.status)
          this.request_approve = []
        }


      },

      getBtnsColor(btn) {
        return btn.text == this.filter ? btn.color : ''
      },

            getMinMaxDate(isMin) {
        let today = this.moment()
        let result
        if(isMin) {
          result = today.subtract(3, 'days')
          if([5,6,0].includes(result.day())) {
            result = result.subtract(2, 'days')
          }
        } else {
          result = today.add(3, 'days')
          if([1,6,0].includes(result.day())) {
            result = result.add(2, 'days')
          }
        }
          return result.toISOString()
      },

      dateStrToIso(date) {
        return this.moment(date).toISOString()
      },
       async downloadObjective() {
      this.btnLoader = true;
      let refName, type, url;
          type = `candidate`;
          refName = `Справка об изучении кандидата`;
          url = `pdf_candidate`;
      await this.axios
        .get(`/api/1.0/reference/${url}`, {
          params: {
            employee_id: this.employee.id,
            iin: this.employee.identification_number,
            bin: this.employee.organization_identification_number,
            creator: this.$userData,
            type,
            timez: -new Date().getTimezoneOffset(),
            requestData: this.currentRequest.details
          },
        })
        .then((response) => {
          let blob = new Blob([new Buffer(response.data, "base64")], {
            type: "application/document",
          });
          const a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = `${refName} - ${this.employee.last_name} ${this.employee.first_name} ${this.employee.middle_name}.pdf`;
          a.click();
          a.remove();
          this.btnLoader = false;
        })
        .catch((err) => {
          console.log(err);
          this.btnLoader = false;
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: `Не удалось сформировать файл: ${err.data?.ERR_MSG || err}`,
          });
        });
    },
    },
    async mounted() {

        this.axios.get(`/api/1.0/lov/ref.request_type`, {
          params: {
            is_application: this.isApplication
          }
        })
                .then(({data}) => {
                    this.requestModalType = data.filter(item => item.id > 0).reduce((acc, item) => {
                        acc.push({
                            abbr: item.id,
                            state: item.name
                        })
                    return acc
                    }, [])
                })
      this.isShowReqCreate = this.employee.id == this.$userData.id ? true : false
    },

        watch: {
      options: {
        handler () {
          this.getMainRequest()
        },
        deep: true,
      },
      async employee() {
        this.isShowReqCreate = this.employee.id == this.$userData.id ? true : false
        await this.getMainRequest()
        this.requestData = {
                request_type_id: '',
                request_sub_type_id: '',
                employees: [{
                  id: this.employee.id, 
                  first_name: this.employee.first_name, 
                  last_name: this.employee.last_name, 
                  middle_name: this.employee.middle_name, 
                }]
            }
      },

           },
    props: ['employee', 'isApplication', 'multipleEmployee', 'onlyAssignedToYou']
}
</script>