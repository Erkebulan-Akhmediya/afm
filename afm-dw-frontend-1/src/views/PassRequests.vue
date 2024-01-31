<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-tabs class="tabWithUnderline" v-model="requestTabVal" @change="changeTab">
          <v-tab class="" v-for="(item, index) in requestTab" :key="index" >
            {{ item.title }}
          </v-tab>

          <!--Заявки на пропуск-->
          <v-tab-item v-if="isAdmin()" style="padding-top: 30px">
            <PassRequestDataTable 
              :disableDoubleClick="disableDoubleClick"
              @newPassRequest="newPassRequest" 
              :loader="loader" 
              :request="request" 
              :headersRequest="headersRequest0" 
              :totalLength="totalLength"
              tab="admin"
              @openAnotherPage="openAnotherPage"
              @findRequest="findRequest" 
              @clearFindRequest="clearFindRequest" 
              @goToPassRequestCard="goToPassRequestCard"
              >
            </PassRequestDataTable>
          </v-tab-item>

          <!--Запланированные-->
          <v-tab-item v-if="isRole16()" style="padding-top: 30px">
            <PassRequestDataTable 
              :disableDoubleClick="disableDoubleClick"
              :loader="loader" 
              :request="request" 
              :headersRequest="headersRequest1" 
              :totalLength="totalLength"
              tab="security"
              @openAnotherPage="openAnotherPage"
              @nextStatus="nextStatus" 
              @findRequest="findRequest" 
              @clearFindRequest="clearFindRequest"
              >
            </PassRequestDataTable>
          </v-tab-item>

          <!--В здании-->
          <v-tab-item v-if="isRole16()" style="padding-top: 30px">
            <PassRequestDataTable 
              :disableDoubleClick="disableDoubleClick"
              :loader="loader" 
              :request="request" 
              :headersRequest="headersRequest2" 
              :totalLength="totalLength"
              tab="security"
              @openAnotherPage="openAnotherPage"
              @nextStatus="nextStatus" 
              @findRequest="findRequest" 
              @clearFindRequest="clearFindRequest"
              @commitExiting="commitExiting"
              >
            </PassRequestDataTable>
          </v-tab-item>

          <!--Покинувшие-->
          <v-tab-item v-if="isRole16()" style="padding-top: 30px">
            <PassRequestDataTable 
              :disableDoubleClick="disableDoubleClick"
              :loader="loader" 
              :request="request" 
              :headersRequest="headersRequest3" 
              :totalLength="totalLength"
              tab="securitywithdate"
              @openAnotherPage="openAnotherPage"
              @nextStatus="nextStatus" 
              @findRequest="findRequest" 
              @clearFindRequest="clearFindRequest"
              >
            </PassRequestDataTable>
          </v-tab-item>

          <!--Посетители-->
          <v-tab-item v-if="isAdmin()" style="padding-top: 30px">
            <PassRequestDataTable 
              :disableDoubleClick="disableDoubleClick"
              :loader="loader" 
              :request="request" 
              :headersRequest="headersRequest4" 
              :totalLength="totalLength"
              tab="creator"
              @openAnotherPage="openAnotherPage"
              @nextStatus="nextStatus" 
              @findRequest="findRequest" 
              @clearFindRequest="clearFindRequest" 
              @commitExiting="commitExiting"
              @showHistory="showHistory"
              @newPassRequestWithVisitor="newPassRequestWithVisitor"
              >
            </PassRequestDataTable>
          </v-tab-item>

          <v-tab-item class="ma-2">
            <v-row>
              <v-col cols="2">
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
                      v-model="date_start"
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
                                  v-model="date_start"
                                  >
                      <template slot="dateIcon">
                          <span class="mr-4">{{ $t('globalWords.date') }}</span>
                          <v-icon>mdi-calendar</v-icon>
                      </template>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="2">
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
              <v-col>
                <v-select
                  v-model="selectedOrganization"
                  :items="organizations"
                  label="Организация"
                  item-text="name"
                  item-value="id"
                  multiple
                >
                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index === 0">
                      <span>{{ item.name }}</span>
                    </v-chip>
                    <span
                      v-if="index === 1"
                      class="grey--text text-caption"
                    >
                      (+{{ selectedOrganization.length - 1 }} others)
                    </span>
                  </template>

                </v-select>
              </v-col>
              <v-col cols="4" class="d-flex">
                <v-btn style="align-self: center;"
                  color="primary"
                  outlined
                  @click="loadVisitorReport"
                  :loading="loading"
                  class="ml-2 mr-2"
                  >
                  Запросить данные
                </v-btn>

                <v-btn style="align-self: center;"
                  color="primary"
                  outlined
                  @click="resetVisitor"
                  :loading="loading"
                  class="ml-2 mr-2"
                  >
                  Сбросить фильтры
                </v-btn>
              </v-col>
            </v-row>
            <br/>
            <!--Индикаторы-->
            <v-row no-gutters>
              <v-col cols="4">
                <v-card
                  class="mx-auto good"
                  max-width="450"
                  flat
                >
                  <v-list rounded>
                    <v-subheader><span>Количество посетителей</span> <v-spacer></v-spacer><b><span>{{result_data ? result_data[0].count_visitors : null}}</span></b></v-subheader>
                  </v-list>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card
                  class="mx-auto good"
                  max-width="450"
                  flat
                >
                  <v-list rounded>
                    <v-subheader><span>Посетителей в здании</span> <v-spacer></v-spacer><b><span>{{result_data ? result_data[0].count_in_building : null}}</span></b></v-subheader>
                  </v-list>
                </v-card>
              </v-col>
              <v-col cols="4" v-if ="!result_data">
                <v-card
                  class="mx-auto good"
                  max-width="450"
                  flat
                >
                  <v-list rounded>
                    <v-subheader><span>Среднее время</span> <v-spacer></v-spacer><b><span>{{ null }}</span></b></v-subheader>
                  </v-list>
                </v-card>
              </v-col>
              <v-col cols="4" v-else-if ="result_data[0].avg_time">
                <v-card
                  class="mx-auto good"
                  max-width="450"
                  flat
                >
                  <v-list rounded>
                    <v-subheader><span>Среднее время</span> <v-spacer></v-spacer><b><span>
                    {{  result_data[0].avg_time.hours ? (result_data[0].avg_time.hours + result_data[0].avg_time.days ? (result_data[0].avg_time.days*24):result_data[0].avg_time.hours ):'00' }}:{{ get_formated_time(result_data[0].avg_time.minutes) }}:{{ get_formated_time(result_data[0].avg_time.seconds) }}
                    </span></b></v-subheader>
                  </v-list>
                </v-card>
              </v-col>
              <v-col cols="4" v-else>
                <v-card
                  class="mx-auto good"
                  max-width="450"
                  flat
                >
                  <v-list rounded>
                    <v-subheader><span>Среднее время</span> <v-spacer></v-spacer><b><span>0</span></b></v-subheader>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
            <br/>
            <v-row style="height: 600px;">
              <v-col cols="6">
                <v-chart
                  max-width="100%"
                  ref="chart" 
                  class="chart" 
                  :option="option"
                  autoresize
                />
              </v-col>
              <v-col cols="6">
                <v-chart
                  max-width="100%"
                  ref="chart" 
                  class="chart" 
                  :option="option2"
                  autoresize
                />
              </v-col>
            </v-row>

            <v-col cols="12">
              <v-text-field
                v-model="searchString"
                :disabled="copyVD.length == 0"
                label="Поиск по посетителям"
                hint="Фильтрация списка по посетителям обрабатывается в автоматическом режиме"
                persistent-hint
              >
              </v-text-field>
            </v-col>

            <v-row class="ma-2">
              <PRVReportExpander :inputData="visitorData"/>
            </v-row>
            <br/>
          </v-tab-item>


        </v-tabs>
      </v-col>
    </v-row>

    <v-dialog v-model="isShowFormDialog" width="800">
      <v-card>
        <v-card-text style="padding: 30px">
          <slot>
            <div style="color: #000;">
              <v-row>
                <v-col>
                  <v-form 
                    class="pass-request-form"
                    >
                    <v-row class="mt-2 mb-2">
                      <v-col v-if="disabledEditing">
                        <span>{{ $t('passRequest.visitorList') }}</span>
                      </v-col>
                    </v-row>
                    <v-row
                      v-for="(v, k) in editableItem.visitors"
                      :key="k"
                      >
                      <v-col cols="6">
                        <v-text-field
                          :label="$t('globalWords.last_name')" 
                          class="field-without-message"
                          v-model="v.last_name"
                          :disabled="true"
                          >
                        </v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          :label="$t('globalWords.first_name')" 
                          class="field-without-message"
                          v-model="v.first_name"
                          :disabled="true"
                          >
                        </v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          :label="$t('globalWords.middle_name')" 
                          class="field-without-message"
                          v-model="v.middle_name"
                          :disabled="true"
                          >
                        </v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                          :label="$t('passRequest.residentRK')" 
                          v-model="v.is_resident_rk"
                          :disabled="true"
                          >
                        </v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-select
                          :label="$t('passRequest.documentType')" 
                          :items="document_types"
                          v-model="v.document_type_id"
                          :disabled="true"
                          >
                        </v-select>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          :label="$t('passRequest.documentNumber')" 
                          class="field-without-message"
                          v-model="v.identification_number"
                          :disabled="true"
                          >
                        </v-text-field>
                      </v-col>
                      <!--
                      <v-col class="pt-3" cols="2" v-if="!disabledEditing">
                        <v-btn 
                          @click="deleteVisitor(v, k)"
                          text
                          >
                          <v-icon>
                            mdi-close
                          </v-icon>
                        </v-btn>
                      </v-col>
                      -->
                    </v-row>
                    <v-row>
                      <v-col sm="6">
                        <v-textarea 
                          rows="2"
                          no-resize
                          v-model="editableItem.purpose"
                          :label="$t('passRequest.purposeOfVisit')" 
                          :disabled="disabledEditing"
                          required> 
                        </v-textarea>
                      </v-col>

                      <v-col sm="6">
                        <v-textarea 
                          rows="2"
                          no-resize
                          v-model="editableItem.description"
                          :label="$t('passRequest.note')" 
                          :disabled="disabledEditing" 
                          > 
                        </v-textarea>
                      </v-col>

                      <v-col :cols="buildings.length > 1?6:12">
                        <v-select
                          :label="$t('passRequest.passRequestType')" 
                          :items="pass_request_types"
                          v-model="editableItem.pass_request_type_id"
                          :disabled="disabledEditing"
                        >
                        </v-select>
                      </v-col>
                      <v-col v-if="buildings.length > 1" cols="6">
                        <v-select
                          :label="'Здание'" 
                          :items="buildings"
                          v-model="editableItem.organization_building_id"
                          :disabled="disabledEditing"
                          >
                        </v-select>
                      </v-col>

                      <v-col 
                        sm="6" 
                        v-if="editableItem.pass_request_type_id === 1"
                        >
                        <v-datetime-picker id="datetimeFrom" 
                                            ref="datetimeFrom"
                                            :datePickerProps="{'first-day-of-week': 1, 'locale': $i18n.locale == 'KAZ'? 'kk':$i18n.locale}" 
                                            :timePickerProps="{'allowed-minutes': allowedStep, format: '24hr', scrollable: true}"
                                            :clearText="$t('globalWords.clear')" 
                                            okText="Ок" 
                                            dateFormat="yyyy.MM.dd - " 
                                            :label="$t('globalWords.dateFrom')" 
                                            required
                                            :disabled="disabledEditing"
                                            v-model="editableItem.date_from">
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
                        v-if="editableItem.pass_request_type_id === 1"
                        >
                        <v-datetime-picker id="datetimeTo" 
                                            ref="datetimeTo"
                                            :datePickerProps="{'first-day-of-week': 1, 'locale': $i18n.locale == 'KAZ'? 'kk':$i18n.locale}" 
                                            :timePickerProps="{'min': editableItem.date_from.toLocaleTimeString(), 'allowed-minutes': allowedStep, format: '24hr', scrollable: true}"
                                            :clearText="$t('globalWords.clear')" 
                                            okText="Ок" 
                                            dateFormat="yyyy.MM.dd - " 
                                            :label="$t('globalWords.dateTo')" 
                                            required
                                            :disabled="disabledEditing"
                                            v-model="editableItem.date_to">
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
                        v-if="editableItem.pass_request_type_id === 2"
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
                                v-model="editableItem.date_from"
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
                                              :locale="$i18n.locale == 'KAZ'? 'kk':$i18n.locale"
                                              @input="date_menu1 = false"
                                              :clearText="$t('globalWords.clear')" 
                                              okText="Ок" 
                                              dateFormat="yyyy.MM.dd - " 
                                              :label="$t('globalWords.dateFrom')" 
                                              :disabled="disabledEditing"
                                              v-model="editableItem.date_from">
                              <template slot="dateIcon">
                                  <span class="mr-4">{{ $t('globalWords.date') }}</span>
                                  <v-icon>mdi-calendar</v-icon>
                              </template>
                          </v-date-picker>
                          </v-menu>
                      </v-col>

                      <v-col 
                        sm="6"
                        v-if="editableItem.pass_request_type_id === 2"
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
                              v-model="editableItem.date_to"
                            ></v-text-field>
                          </template>
                          <v-date-picker id="dateTo" 
                                              ref="dateTo"
                                              @input="date_menu2 = false"
                                              first-day-of-week="1"
                                              :clearText="$t('globalWords.clear')" 
                                              :locale="$i18n.locale == 'KAZ'? 'kk':$i18n.locale"
                                              okText="Ок" 
                                              dateFormat="yyyy.MM.dd - " 
                                              :label="$t('globalWords.dateTo')" 
                                              :disabled="disabledEditing"
                                              v-model="editableItem.date_to">
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
                      v-if="!disabledEditing"
                      :style="`display: flex; position: relative; z-index:1; width: 100%; background: #fff; height: 56px; box-sizing: border-box`" 
                      >
                      <v-text-field class="searchBar" :placeholder="$t('mainPage.search.globalSearch')" v-model="globalSearchVal" @keydown.enter="globalSearch" @keydown="check" style="padding: 7px; border: 1px solid #ddd; border-radius: 5px">
                        <v-icon @click="globalSearch" slot="prepend" color="gray" style="color: #BDBDBD;">mdi-magnify</v-icon>
                      </v-text-field>
                    </div>
                    <v-col 
                      v-if="!disabledEditing"
                      cols="12"
                      >
                      <EmployeeTableSmallSearch @clickOnRow="selectEmployee" :employeeTable="searchEmployeeTable" :adminUsersForm="false"
                      ></EmployeeTableSmallSearch>
                    </v-col>
                    <v-col cols="6">
                      <div v-if="currentRow.id" class="mt-6">
                        <p>{{ $t('passRequest.applicant') }}: {{ currentRow.create_user }}</p>
                      </div>
                      <div v-if="currentRow.id" class="mt-6">
                        <p>{{ $t('globalWords.status') }}: {{ currentRow.status }}</p>
                      </div>
                    </v-col>
                  </v-form>
                </v-col>
              </v-row>
            </div>
          </slot>
        </v-card-text>
        <v-divider>
        </v-divider>
        <v-card-actions v-if="!disabledEditing">
          <v-btn
            outlined
            color="error"
            text
            @click="isShowFormDialog = false"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" text 
            @click="clickSave" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
            >
            {{ $t('globalWords.save') }}
          </v-btn>
        </v-card-actions>
        <v-card-actions v-else>
          <v-btn
            outlined
            color="error"
            text
            @click="isShowFormDialog = false"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" text 
            @click="$router.push(`/pass_request/` + this.$crypto(String(editableItem.id)))" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
            v-if="currentRow.pr_status_id == 1"
          >
            {{ $t('globalWords.edit') }}
          </v-btn>
          <v-btn outlined color="primary" text 
            @click="acceptNextStatus" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
            v-if="currentRow.pr_status_id == 1"
          >
            {{ $t('globalWords.send') }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <v-dialog v-model="isShowAcceptDialog" width="800">
      <v-card>
        <v-card-text style="padding: 30px">
          <slot>
            <div style="color: #000;">
              <v-row>
                <v-col>
                  <p><span v-if="status === 1">{{ $t('passRequest.acceptEntryQuestion') }}</span><span v-else>{{ $t('passRequest.acceptExitQuestion') }}</span>?</p>
                  <p v-if="status === 2 && checkDiffTime(editingVisitor)" style="color:red;">{{ $t('passRequest.visitorInBuildingMoreThan15MinutesWarning') }}</p>
                  <br/>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('globalWords.last_name')" 
                        class="field-without-message"
                        v-model="editingVisitor.last_name"
                        :disabled="disabledEditing"
                        >
                      </v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('globalWords.first_name')" 
                        class="field-without-message"
                        v-model="editingVisitor.first_name"
                        :disabled="disabledEditing"
                        >
                      </v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('globalWords.middle_name')" 
                        class="field-without-message"
                        v-model="editingVisitor.middle_name"
                        :disabled="disabledEditing"
                        >
                      </v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-checkbox
                        :label="$t('passRequest.residentRK')" 
                        v-model="editingVisitor.is_resident_rk"
                        :disabled="disabledEditing"
                        >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="6">
                      <v-select
                        :label="$t('passRequest.documentType')" 
                        :items="document_types"
                        v-model="editingVisitor.document_type_id"
                        :disabled="disabledEditing"
                        >
                      </v-select>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('passRequest.documentNumber')" 
                        class="field-without-message"
                        v-model="editingVisitor.identification_number"
                        :disabled="disabledEditing"
                        >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <br/>
                  <p>{{ $t('passRequest.accompanying') }}: {{ editingVisitor.full_name }}</p>
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
            @click="isShowAcceptDialog = false"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" text 
            @click="acceptNextVisitorStatus" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
          >
            {{ $t('globalWords.accept') }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <v-dialog v-model="isShowCommitExitingDialog" width="800">
      <v-card>
        <v-card-text style="padding: 30px">
          <slot>
            <div style="color: #000;">
              <v-row>
                <v-col>
                  <p>{{ $t('passRequest.acceptEndMeetingQuestion') }}?</p>
                  <br/>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('globalWords.last_name')" 
                        class="field-without-message"
                        v-model="currentRow.last_name"
                        :disabled="disabledEditing"
                        >
                      </v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('globalWords.first_name')" 
                        class="field-without-message"
                        v-model="currentRow.first_name"
                        :disabled="disabledEditing"
                        >
                      </v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('globalWords.middle_name')" 
                        class="field-without-message"
                        v-model="currentRow.middle_name"
                        :disabled="disabledEditing"
                        >
                      </v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-checkbox
                        :label="$t('passRequest.residentRK')" 
                        v-model="currentRow.is_resident_rk"
                        :disabled="disabledEditing"
                        >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="6">
                      <v-select
                        :label="$t('passRequest.documentType')" 
                        :items="document_types"
                        v-model="currentRow.document_type_id"
                        :disabled="disabledEditing"
                        >
                      </v-select>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('passRequest.documentNumber')" 
                        class="field-without-message"
                        v-model="currentRow.identification_number"
                        :disabled="disabledEditing"
                        >
                      </v-text-field>
                    </v-col>
                  </v-row>
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
            @click="isShowCommitExitingDialog = false"
          >
            {{ $t('globalWords.cancel') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" text 
            @click="commitExitingAccept" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
          >
            {{ $t('globalWords.accept') }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <v-dialog v-model="visitHistoryDialog" width="800">
      <v-card>
        <v-card-title style="background-color: #1976d2;"> 
          {{ $t('passRequest.visitHistory') }}
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="historyHeader"
            :items="visit_history"
            :no-data-text="$t('passRequest.visitHistoryIsEmpty')"
            style="margin-top: 2rem"
            class="elevation-1"
            disable-sort
            :loading="loader"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
          >
            <template v-slot:[`item.action_date`]="{ item }">
              <span>{{ $convertDate(item.action_date) }}</span>
            </template>
            <template v-slot:[`item.prv_action_type_id`]="{ item }">
              <span v-if="item.prv_action_type_id === 1">{{ $t('passRequest.entry') }}</span>
              <span v-else-if="item.prv_action_type_id === 3">{{ $t('passRequest.exit') }}</span>
              <span v-else-if="item.prv_action_type_id === 2">{{ $t('passRequest.meetingEnded') }}</span>
            </template>
          </v-data-table>
        </v-card-text>
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
            @click="savePassRequest" 
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
          >
            {{ $t('globalWords.accept') }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import * as echarts from 'echarts/core';
import {
  VisualMapComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  VisualMapComponent,
  DatasetComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer
]);


import moment from 'moment'
import checkRoles from '@/utils/check_role'
import PRVReportExpander from '@/components/PRVReportExpander'
import PassRequestDataTable from '@/components/PassRequestDataTable'
export default {
  components: {
    PassRequestDataTable,
    PRVReportExpander
  },
  data() {
    return {
      totalLength: 10,

      selectedOrganization: [],
      searchString: '',

            option: {
        title: {
          text: "Количество посетителей",
          subtext: 'При наведении отображается количественный показатель',
          left: "center"
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        dataset: {
          source: [
            ['score', 'amount', 'product'],
          ]
        },
        grid: { containLabel: true },
        xAxis: {  },
        yAxis: { type: 'category' },
        series: [
          {
            type: 'bar',
            encode: {
              x: 'amount',
              y: 'product'
            }
          }
        ]
      },

      visitorData: [],
      copyVD: [],
      loading: false,

      option2: {
        title: {
          text: "Учет среднего времени нахождения в здании (мин)",
          left: "center",
          subtext: 'При наведении отображается количественный показатель'
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'shadow'
          }
        },
        dataset: {
          source: [
            ['score', 'amount', 'product'],
          ]
        },
        grid: { containLabel: true },
        xAxis: {  },
        yAxis: { type: 'category' },
        series: [
          {
            type: 'bar',
            encode: {
              x: 'amount',
              y: 'product'
            }
          }
        ]
      },

      date_start: moment().format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD'),

      isRendering: false,


      date_menu1: false,
      date_menu2: false,
      date_menu3: false,
      date_menu4: false,
      result_data: null,

      isShowCommitExitingDialog: false,
      isShowAcceptDialog: false,
      isShowFormDialog: false,
      visitHistoryDialog: false,
      saveAcceptDialog: false,

      pass_request_types: [],
      historyHeader:[ 
        { text: this.$t('globalWords.date'), value: "action_date" }, 
        { text: this.$t('passRequest.action'), value: "prv_action_type_id" }, 
        { text: this.$t('passRequest.passRequestNumber'), value: "pr_id" }, 
        { text: this.$t('passRequest.passRequestType'), value: "type" }, 
        { text: this.$t('passRequest.purposeOfVisit'), value: "purpose" }, 
        { text: 'Организация', value: "organization" }, 
        { text: 'Здание', value: "organization_building" }, 
        ], 
      headersRequest0: [
        { text: this.$t('globalWords.number'), value: "id", sortable: false },
        { text: this.$t('passRequest.type'), value: "pass_request_type" },
        { text: this.$t('passRequest.visitors'), value: "visitors", width: '40%' },
        { text: this.$t('passRequest.accompanying'), value: "full_name" },
        { text: 'Описание причины', value: "purpose"},
        { text: this.$t('globalWords.dateFrom'), value: "date_from" },
        { text: this.$t('globalWords.dateTo'), value: "date_to" },
        { text: this.$t('passRequest.applicant'), value: "create_user" },
        { text: this.$t('passRequest.note'), value: "description" },
        { text: this.$t('globalWords.status'), value: "status" },
      ],
      headersRequest1: [
        { text: this.$t('passRequest.passRequestNumber'), value: "request_id", sortable: false },
        { text: this.$t('passRequest.type'), value: "pass_request_type" },
        { text: this.$t('passRequest.visitor'), value: "visitor" },
        { text: this.$t('passRequest.residentRK'), value: "is_resident_rk" },
        { text: this.$t('passRequest.documentType'), value: "document_type" },
        { text: this.$t('passRequest.documentNumber'), value: "identification_number" },
        { text: this.$t('passRequest.purposeOfVisit'), value: "purpose"},
        { text: 'Здание', value: "organization_building" }, 
        { text: this.$t('passRequest.accompanying'), value: "full_name" },
        { text: this.$t('globalWords.dateFrom'), value: "date_from" },
        { text: this.$t('globalWords.dateTo'), value: "date_to" },
        { text: this.$t('passRequest.applicant'), value: "create_user" },
        { text: this.$t('passRequest.note'), value: "description" },
        { text: "", value: "action" },
      ],
      headersRequest2: [
        { text: this.$t('passRequest.passRequestNumber'), value: "request_id", sortable: false },
        { text: this.$t('passRequest.type'), value: "pass_request_type" },
        { text: this.$t('passRequest.visitor'), value: "visitor" },
        { text: this.$t('passRequest.residentRK'), value: "is_resident_rk" },
        { text: this.$t('passRequest.documentType'), value: "document_type" },
        { text: this.$t('passRequest.documentNumber'), value: "identification_number" },
        { text: this.$t('passRequest.purposeOfVisit'), value: "purpose"},
        { text: 'Здание', value: "organization_building" }, 
        { text: this.$t('passRequest.accompanying'), value: "full_name" },
        { text: this.$t('passRequest.note'), value: "description" },
        { text: this.$t('passRequest.entryDate'), value: "entry_date" },
        { text: this.$t('passRequest.endMeetingDate'), value: "pass_exit_date" },
        { text: this.$t('passRequest.applicant'), value: "create_user" },
        { text: "", value: "action" },
      ],
      headersRequest3: [
        { text: this.$t('passRequest.passRequestNumber'), value: "pr_id", sortable: false },
        { text: this.$t('passRequest.type'), value: "pass_request_type" },
        { text: this.$t('passRequest.visitor'), value: "visitor" },
        { text: this.$t('passRequest.residentRK'), value: "is_resident_rk" },
        { text: this.$t('passRequest.documentType'), value: "document_type" },
        { text: this.$t('passRequest.documentNumber'), value: "identification_number" },
        { text: this.$t('passRequest.purposeOfVisit'), value: "purpose"},
        { text: 'Здание', value: "organization_building" }, 
        { text: this.$t('passRequest.accompanying'), value: "full_name" },
        { text: this.$t('passRequest.applicant'), value: "create_user" },
        { text: this.$t('passRequest.note'), value: "description" },
        { text: this.$t('passRequest.entryDate'), value: "entry_date" },
        { text: this.$t('passRequest.endMeetingDate'), value: "pass_exit_date" },
        { text: this.$t('passRequest.exitDate'), value: "exit_date" },
        { text: 'Пропустивший', value: "update_user_full_name" },
      ],
      headersRequest4: [
        { text: this.$t('passRequest.visitor'), value: "visitor" },
        { text: this.$t('passRequest.documentType'), value: "document_type" },
        { text: this.$t('passRequest.documentNumber'), value: "identification_number" },
        { text: this.$t('passRequest.residentRK'), value: "is_resident_rk" },
        { text: this.$t('passRequest.lastStatus'), value: "last_visit_status" },
        { text: "", value: "action" },
      ],
      request: [],
      currentRow: {},
      buildings: [],
      requestTabVal: 0,
      status : null,
      disableDoubleClick: false,
      loader: false,
      disabledEditing: false,

      requestTab: [],

      editingVisitor: {},

      editableItem: {
        visitors: [],
        date_from: new Date(),
        date_to: new Date(),
        employee_id: '',
        purpose: '',
        description: '',
        pass_request_type_id: null,
      },

      searchedEmployee: null,

      searchEmployee: [],
      searchEmployeeTable: [],
      globalSearchVal: '',
      document_types: [],

      visit_history: [],
      organizations: [],

      searchData: {}

          };

  },
  async created() {

    if (this.isRole18()) {
      this.requestTab = this.requestTab.concat([
        { id: 5, title: 'Аналитика' },
      ])
    }

    if (this.isAdmin()) {
      this.requestTab = this.requestTab.concat([
        { id: 0, title: this.$t('passRequest.passRequestTitle') },
      ])
    }

    if (this.isRole16()) {
      if(this.requestTab.length === 0)
        this.status = 1

      this.requestTab = this.requestTab.concat([
        { id: 1, title: this.$t('passRequest.plannedTitle') },
        { id: 2, title: this.$t('passRequest.inBuildingTitle') },
        { id: 3, title: this.$t('passRequest.leftTitle') },
      ])
    } 
    if (this.isAdmin()) {
      this.requestTab = this.requestTab.concat([
        { id: 4, title: this.$t('passRequest.visitors') },
      ])
    }
    this.requestTab.sort((a, b) => a.id-b.id)

    let {data} = await this.axios.get('/api/1.0/lov/ref.pass_request_type')
    this.pass_request_types = data.filter(item => item.id > 0).map(item => { return { value: item.id, text: item.name }})

    const {data: document_types} = await this.axios.get(`/api/1.0/pass-request-document-types/`)
    this.document_types = document_types

    const {data: buildings} = await this.axios.get(`/api/1.0/buildings/${this.$userData.fullData.organization_id}`)
    this.buildings = buildings

    const {data: organizations} = await this.axios.get(`/api/1.0/lov/hr.organization`)
    this.organizations = organizations

  },
  computed: {
    pass_request_type() {
      return this.editableItem.pass_request_type_id
    },
    pagination_options: {
      get() {
        return this.$store.state.pass_request.pagination_options
      },
      set(sc) {
        this.$store.commit('setPaginationOptions', sc)
      }
    },
  },
  watch: {
    searchString() {

      this.visitorData = JSON.parse(JSON.stringify(this.copyVD))
      if (this.searchString == '') return

      for (let j in this.visitorData) {

        for (let i in this.visitorData[j].organizations) {
          this.visitorData[j].organizations[i].visitors = this.visitorData[j].organizations[i].visitors.filter((item) => {
            return item.identification_number.toUpperCase().indexOf(this.searchString.toUpperCase()) != -1 || item.name.toUpperCase().indexOf(this.searchString.toUpperCase()) != -1
          })
        }

      }

      for (let j in this.visitorData) {

        this.visitorData[j].organizations = this.visitorData[j].organizations.filter((item)=>{return item.visitors.length > 0})

      }

      this.visitorData = this.visitorData.filter((item)=>{return item.organizations.length > 0})
    },
    pass_request_type(newid) {
      if(newid == 1)
      {
        this.editableItem.date_from = new Date(this.editableItem.date_from)
        this.editableItem.date_to = new Date(this.editableItem.date_to)
      }
      else if(newid == 2) {
        this.editableItem.date_from = this.editableItem.date_from.toISOString().substr(0, 10)
        this.editableItem.date_to = this.editableItem.date_to.toISOString().substr(0, 10)      
      }
    }
  },
  methods: {
    async openAnotherPage() {
      let request = await this.getRequest(this.status, {channel: this.$store.state.pass_request.selectedChannel})
      if (request) {
        this.request = request 
      }
    },
    get_formated_time(t) {
      return !t ? '00': t > 9 ? t : '0' + t
    },
    renderChart(bar_series){
      var option
      var option2

      option2 = {
        title: {
          text: "Учет среднего времени нахождения в здании (мин)",
          subtext: 'При наведении отображается количественный показатель',
          left: "center"
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        dataset: {
          source: [
            ['score', 'amount', 'product'],
          ]
        },
        grid: { containLabel: true },
        xAxis: {  },
        yAxis: { type: 'category' },
        series: [
          {
            type: 'bar',
            encode: {
              x: 'amount',
              y: 'product'
            }
          }
        ]
      };

      option = {
        title: {
          text: "Количество посетителей",
          subtext: 'При наведении отображается количественный показатель',
          left: "center"
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        dataset: {
          source: [
            ['score', 'amount', 'product'],
          ]
        },
        grid: { containLabel: true },
        xAxis: {  },
        yAxis: { type: 'category' },
        series: [
          {
            type: 'bar',
            encode: {
              x: 'amount',
              y: 'product'
            }
          }
        ]
      };

      for(let i of bar_series) {
        option.dataset.source.push([10, i.bar_series.count_visitors, i.organization.substr(0, 40)])
        if (i.bar_series.avg_time){
          let time = i.bar_series.avg_time.split(':')
          option2.dataset.source.push([10, Math.round(time[0]*60 + time[1]*1 + time[2]/60), i.organization.substr(0, 40)])
        } else {
          option2.dataset.source.push([10, 0, i.organization.substr(0, 40)])
        }
      }

      this.option = option
      this.option2 = option2
      this.isRendering = true

    },
    checkDiffTime(data) {
      let m = moment(Date.now())
      let p = data.pass_exit_date

      return m.diff(p, 'minutes') >= 15
    },
    async goToPassRequestCard(data) {
      this.$router.push({
        path: `/pass_request/${this.$crypto(String(data.id))}`,
      });
    },
    async newPassRequestWithVisitor(item) {
      await this.newPassRequest()
      this.editableItem.visitors.push(item)
    },
    async showHistory(item) {
      const params = {
        prv_list_id: item.prv_list_id
      }
      let {data: visit_history} = await this.axios.get(`/api/1.0/pass-request-visitor-history`, { params })

      visit_history.map(item=>{
        item.action_date?item.action_date = this.$moment(item.action_date).add(this.$moment(new Date()).utcOffset(), 'minutes'):null
      })

      this.visit_history = visit_history
      this.visitHistoryDialog = true
    },
    async commitExitingAccept(){
      let localParams = {
        prv_status_id: 2
      }
      try{
        await this.axios.post(`/api/1.0/pass-request-visitor-next-status/${this.currentRow.id}`, localParams)
      }catch(err){
        this.$swal({
                  ...this.$optionAlert.fire,
                  icon: 'error',
                  timer: 5000,
                  width: 600,
                  title: err.data.ERR_MSG  
              })
      }
      let request = await this.getRequest(this.status, {channel: 1})
      if (request) this.request = request
      this.isShowCommitExitingDialog = false
      this.disabledEditing = true
    },
    allowedStep: m => m % 5 === 0,
    commitExiting(data){
      this.isShowCommitExitingDialog = true
      this.currentRow = data
      this.disabledEditing = true
    },
    async deleteVisitor (v ,k) {
      if (v.id) {
        await this.axios.delete(`/api/1.0/pass-request-visitor/${v.id}`, {data: {}})
      }
      this.$swal({
                  ...this.$optionAlert.fire,
                  icon: 'success',
                  title: this.$t('globalWords.deleted')  
              })
      this.editableItem.visitors.splice(k, 1)
    },
    async saveVisitor (v) {
      await this.addVisitor(v)
      this.$swal({
                  ...this.$optionAlert.fire,
                  icon: 'success',
                  title: this.$t('globalWords.saved')
              })
    },
    async changeVisitor (v) {
      let localParams = {
        pass_request_id: this.currentRow.id,
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
        if (this.currentRow.id){
          await this.axios.put(`/api/1.0/pass-request-visitor/${v.id}`, localParams)
        } else {
          throw('pass request doesnt exist')
        }
        this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: this.$t('globalWords.saved')
                })
      } catch (err) {
        this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    timer: 5000,
                    width: 600,
                    title: err.ERR_MSG  
                })
        console.log(err)
      }
    },
    isAdmin () {
      return checkRoles('18', this.$userData) || checkRoles('17', this.$userData) 
    },
    isRole18 () {
      return checkRoles('18', this.$userData) 
    },
    isRole16 () {
      return checkRoles('16', this.$userData)
    },
    async newPassRequest () {
      const {data: buildings} = await this.axios.get(`/api/1.0/buildings/${this.$userData.fullData.organization_id}`)
      this.buildings = buildings

      let obid = null

      if(buildings.length === 1) {
        obid = buildings[0].value
      }

      this.editableItem= {
        visitors: [],
        date_from: new Date(),
        date_to: new Date(),
        employee_id: '',
        purpose: '',
        description: '',
        pass_request_type_id: 1,
        organization_building_id: obid,
      },
      this.searchedEmployee=null
      this.currentRow={}
      this.isShowFormDialog=true
      this.disabledEditing=false
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
      this.editableItem.employee_id = data.id
      this.searchEmployeeTable = this.searchEmployeeTable.filter(item=>item.id!=data.id)
    },
    async editCurrentRow () {
      const {data: document_types} = await this.axios.get(`/api/1.0/pass-request-document-types/`)
      this.document_types = document_types

      const {data: {[0]:searchedEmployee}} = await this.axios.get(`/api/1.0/employee/${this.currentRow.employee_id}`)
      this.searchedEmployee = searchedEmployee

      const {data: buildings} = await this.axios.get(`/api/1.0/buildings/${this.$userData.fullData.organization_id}`)
      this.buildings = buildings

      this.editableItem = {
        id: this.currentRow.id,
        visitors: this.currentRow.visitors,
        employee_id: this.currentRow.employee_id,
        identification_number: this.currentRow.identification_number,
        date_from: new Date(this.currentRow.date_from),
        date_to: new Date(this.currentRow.date_to),
        purpose: this.currentRow.purpose,
        description: this.currentRow.description,
        pass_request_type_id: this.currentRow.pass_request_type_id,
        organization_building_id: this.currentRow.organization_building_id,
      }
      this.isShowFormDialog = true
    },
    async findRequest (findData) {
      this.loader = true

      if (findData.channel === 3) {
        this.headersRequest0.splice(5, 0, 
          { text: 'Организация', value: "organization" }
        )
        this.headersRequest0.splice(6, 0, 
          { text: 'Здание', value: "organization_building" }
        )
      }

      if (!this.isAdmin() && (!this.status || this.status == 0)) this.status = 1
      this.searchData = findData
      let request = await this.getRequest(this.status)
      if (request) this.request = request
      this.loader = false
    },
    async clearFindRequest() {
      let options = this.pagination_options
      options.page = 1
      options.itemsPerPage = 10
      this.pagination_options = options
      this.searchData = {}
      let request = await this.getRequest(this.status, {channel: 1})
      if (request) this.request = request
    },
    async clickSave () {
      await this.savePassRequest()
    },
    async savePassRequest () {
      let err = []

      this.editableItem.purpose = this.editableItem.purpose.trim()
      this.editableItem.description = this.editableItem.description.trim()

      if(!this.editableItem.date_from) {
        err.push(this.$t('passRequest.warnings.dateFromIsRequired'))
      }
      if(!this.editableItem.date_to) {
        err.push(this.$t('passRequest.warnings.dateToIsRequired'))
      }
      if(this.buildings.length === 0) {
        err.push('В вашей организации не заполнена таблица зданий')
      }
      if(!this.editableItem.organization_building_id) {
        err.push('"Здание" является обязательным полем')
      }
      if(!this.editableItem.purpose) {
        err.push(this.$t('passRequest.warnings.purposeIsRequired'))
      }
      if(!this.searchedEmployee) {
        err.push(this.$t('passRequest.warnings.selectAccompanying'))
      }
      if(this.$moment(this.editableItem.date_to).isBefore(this.$moment(this.editableItem.date_from))) {
        err.push(this.$t('passRequest.warnings.dateFromMustBeMoreThanDateTo'))
      }
      if(this.$moment(this.editableItem.date_from).isBefore(this.$moment(), 'day')) {
        err.push(this.$t('passRequest.warnings.dateFromMustBeMoreThanCurrentDate'))
      }
      if(this.editableItem.pass_request_type_id == 1) {
        if(!this.$moment(this.editableItem.date_to).startOf('day').isSame(this.$moment(this.editableItem.date_from).startOf('day'))) {
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

      let localParams = {
        date_from: this.$moment(this.editableItem.date_from).format('DD.MM.YYYY HH:mm:ss'),
        date_to: this.$moment(this.editableItem.date_to).format('DD.MM.YYYY HH:mm:ss'),
        employee_id: this.editableItem.employee_id,
        purpose: this.editableItem.purpose,
        description: this.editableItem.description,
        pass_request_type_id: this.editableItem.pass_request_type_id,
        organization_id: this.$userData.fullData.organization_id,
        organization_building_id: this.editableItem.organization_building_id,
      }

      try {
        let data
        this.disableDoubleClick = true
        if (this.editableItem.id) {
          await this.axios.put(`/api/1.0/pass-request/${this.editableItem.id}`, localParams)
        } else {
          data = await this.axios.post(`/api/1.0/pass-request`, localParams)
          await this.axios.post(`/api/1.0/pass-approve-request`, {pass_request_id: data.data})
          this.editableItem.id = data.data
        }
        for (let v of this.editableItem.visitors) {
          await this.saveVisitor(v)
        }

        this.disabledEditing = true
        this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: this.$t('globalWords.saved')
                })
        this.$router.push({
          path: `/pass_request/${this.$crypto(String(this.editableItem.id))}`,
        });
      } catch (err) {
        console.log(err)
      } finally {
        this.saveAcceptDialog = false
        this.isShowFormDialog = false
        this.disableDoubleClick = false
      }
    },

    async addVisitor (visitor) {

      let localParams = {
        last_name: visitor.last_name,
        first_name: visitor.first_name,
        middle_name: visitor.middle_name,
        identification_number: visitor.identification_number,
        pass_request_id: this.editableItem.id,
        is_resident_rk: visitor.is_resident_rk,
        document_type_id: visitor.document_type_id,
      }

      try {
        const {data: {id}} = await this.axios.post(`/api/1.0/pass-request-visitor`, localParams)
        visitor.id = id
      } catch (err) {
        console.log(err)
      }
    },

    nextStatus(visitor) {
      if (visitor.prv_status_id === 0) 
      {
        this.disabledEditing = false
      } else { 
        this.disabledEditing = true
      }
      this.editingVisitor = {...visitor}

      this.isShowAcceptDialog = true
    },

    async acceptNextVisitorStatus() {
      this.disableDoubleClick = true
      try {

        let err = []
        let {data:{pass_requests:{[0]: {visitors: thisRequestVisitors}}}} = await this.axios.get(`/api/1.0/pass-request/${this.$crypto(String(this.editingVisitor.request_id))}`)
        this.editingVisitor.identification_number = this.editingVisitor.identification_number.trim()
        this.editingVisitor.first_name = this.editingVisitor.first_name.trim()
        this.editingVisitor.last_name = this.editingVisitor.last_name.trim()
        this.editingVisitor.middle_name = this.editingVisitor.middle_name.trim()


        let theSameVisitorCounter = 0

        thisRequestVisitors.map((item)=>{
            if( item.identification_number === this.editingVisitor.identification_number && 
                  item.document_type_id === this.editingVisitor.document_type_id &&
                  item.first_name.toUpperCase() === this.editingVisitor.first_name.toUpperCase() &&
                  item.last_name.toUpperCase() === this.editingVisitor.last_name.toUpperCase() &&
                  item.id !== this.editingVisitor.id
            ){
              theSameVisitorCounter++
            }
        })

        if (theSameVisitorCounter >= 1) {
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            timer: 5000,
            width: 600,
            title: this.$t('passRequest.warnings.thisVisitorIsAlreadyInPassRequest'),
          });
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

        if (this.editingVisitor.pass_identification_number && !/^\d+$/.test(this.editingVisitor.pass_identification_number)) {
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

        this.currentRow = this.editingVisitor

        try {
          let status = this.currentRow.prv_status_id
          if (status == 1 || status == 2) status = 3
          else status = 1

          let localParams = { 
            prv_status_id: status 
          }

          await this.changeVisitor({entryChange: true, ...this.currentRow})
          await this.axios.post(`/api/1.0/pass-request-visitor-next-status/${this.currentRow.id}`, localParams)

          this.request = await this.getRequest(this.status, {channel: this.$store.state.pass_request.selectedChannel})
        } catch (err) {
          console.log(err)
        }
        this.isShowAcceptDialog = false
        this.isShowFormDialog = false

      } catch (err) {
        console.log("errrrrrrrrr")
        console.error(err)
      } finally {
        this.disableDoubleClick = false
      }
    },

    async acceptNextStatus() {
      let err = []
      if(this.currentRow.visitors.length === 0) {
        err.push('Вы не добавили ни единого посетителя')
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
        await this.axios.put(`/api/1.0/pass-request/${this.currentRow.id}`, { pr_status_id: ++this.currentRow.pr_status_id })
        this.currentRow.status = this.$t('passRequest.sended')
      } catch (err) {
        console.log(err)
      }
      this.isShowAcceptDialog = false
      this.isShowFormDialog = false
    },

    async getRequest(status = '', searchDataParams={}) {
      this.loader = true
      let data

      let params = {
        pr_status_id: status, 
        organization_id: this.$userData.fullData.organization_id,
        ...searchDataParams,
        ...this.pagination_options,
        ...this.searchData
      }
      let st = this.status
      let options = {...this.pagination_options}
      try {
        if (this.status == null) {
          data = await this.axios.get(`/api/1.0/pass-request`, { params })
        } else {
          if (status <= 4) {
            params.pr_status_id = status-1
            params.current_date = status == 2 ? false : true 
            params.channel = 2
          } else {
            params.pr_status_id = null
            params.unique = true
          }

                    data = await this.axios.get(`/api/1.0/pass-request-visitor`, { params })
          data.data.pass_request_visitors.map(item => {
            if (!item.last_visit_status) {
              item.last_visit_status = this.$t('passRequest.planned')
            }

            if (item.visit_history && this.status != 4)
            {
              if (item.visit_history.length === 0)
              {
                item.prv_status_id = 0
              }
              else
              {
                for (let i = 0; i < item.visit_history.length; i++) 
                {
                  if (item.visit_history[i].prv_status_id === 1)
                  {
                    item.entry_date = item.visit_history[i].action_date
                    break
                  }
                  if (item.visit_history[i].prv_status_id === 3)
                  {
                    item.exit_date = item.visit_history[i].action_date
                    continue
                  }
                  if (item.visit_history[i].prv_status_id === 2)
                  {
                    item.pass_exit_date = item.visit_history[i].action_date
                    continue
                  }
                }
              } 
            }
            item.exit_date?item.exit_date = this.$moment(item.exit_date).add(this.$moment(new Date()).utcOffset(), 'minutes'):null
            item.entry_date?item.entry_date = this.$moment(item.entry_date).add(this.$moment(new Date()).utcOffset(), 'minutes'):null
            item.pass_exit_date?item.pass_exit_date = this.$moment(item.pass_exit_date).add(this.$moment(new Date()).utcOffset(), 'minutes'):null
          })
        }
      } catch (error) {
        console.log(error)
      }

      if (st !== this.status || options.page != this.pagination_options.page) return null

      this.totalLength = parseInt(data.data.total_length)
      this.loader = false
      return data.data.pass_requests?data.data.pass_requests:data.data.pass_request_visitors;
    },

    getChipsColor(data) {
      switch (data) {
        case 1:
          return "green";
        case 2:
          return "primary";
        case 3:
          return "red";
        default:
          break;
      }
    },

    async resetVisitor(){
      this.selectedOrganization = []
      this.searchString = ''

      this.date_start = moment().format('YYYY-MM-DD'),
      this.date_to = moment().format('YYYY-MM-DD'),

      this.option.dataset.source = []
      this.option2.dataset.source = []

      this.visitorData = []
      this.copyVD = []
      this.result_data = null
    },

    async loadVisitorReport(){
      this.searchString = ''

      if (!this.date_start || !this.date_to) {
        return this.$swal({
                  ...this.$optionAlert.fire,
                  icon: 'error',
                  timer: 5000,
                  width: 600,
                  title: 'Заполните даты'  
              })
      }
      this.loading=true
      let params = {
        date_start: this.date_start,
        date_to: this.date_to
      }

      if (this.selectedOrganization) {
        params.organization_id = this.selectedOrganization
      }

      try{
        let {data} = await this.axios.get('/api/1.0/pass-request-visitors-by-days', {params})
        this.renderChart(data.bar_series)
        this.result_data = data.result_data
        for (let i of data.visitors_by_days) {
          i.date_from = i.date_from.split(' ')[0]
        }
        this.visitorData = data.visitors_by_days
        this.copyVD = JSON.parse(JSON.stringify(this.visitorData))
      } catch (err) {
        console.error(err)
      } finally {
        this.loading=false
      }
    },

        async changeTab(data) {
      const numtab = this.requestTab[data].id
      if (numtab == 5) {
        return
      }
      this.searchData = {}
      this.request = []
      let options = this.pagination_options
      options.page = 1
      options.itemsPerPage = 10
      this.pagination_options = options
      this.status = numtab == 0 ? null : numtab == 1 ? 1 : numtab == 2 ? 2 : numtab == 3?4:5
      this.$store.commit('setIdentificationNumber', '')
      this.$store.commit('setSelectedChannel', 1)
      let request = await this.getRequest(this.status, {channel: this.$store.state.pass_request.selectedChannel})
      if (request) {
        this.request = request
      }
    }
  },
};
</script><style scoped  lang="scss">
.good {
  .v-subheader {
    border: 2px solid #5470c6;
    margin-bottom: 10px;
    border-radius: 15px;
    color: #5470c6;
    font-size: 1.3rem;
  }
}
</style>