<template>
  <div>
    <!--////////EMPLOYEE Education-->
    <v-row>
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Образование</strong></div>
        <v-btn color="primary" outlined @click="employeeEducationClear(); is_editable_dialog = true; employeeEducationDialog = true;" 
          v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeEducationDialog" max-width="700px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeEducationModel.id ? 'Редактировать образование' : 'Добавить образование'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="6">
                    <v-select
                      :items="employeeEducationType"
                      v-model="employeeEducationModel.education_type_id"
                      label="Вид образования"
                      required
                      :disabled="!is_editable_dialog"
                      dense
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      :items="employeeEducationForm"
                      v-model="employeeEducationModel.education_form_id"
                      label="Форма обучения"
                      required
                      dense
                      :disabled="!is_editable_dialog"
                    ></v-select>
                  </v-col>
                  <v-col cols="6" v-if="!is_editable_dialog">
                    <v-text-field
                      label="Дата поступления"
                      v-model="employeeEducationModel.enrollment_date"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" v-if="is_editable_dialog">
                    <v-dialog
                      ref="employee_education_enrollment_date_dialog_ref"
                      v-model="employee_education_enrollment_date_dialog"
                      :return-value.sync="employeeEducationModel.enrollment_date"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeEducationModel.enrollment_date"
                          label="Дата поступления"
                          prepend-icon="mdi-calendar"
                          readonly
                          required
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeEducationModel.enrollment_date"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employee_education_enrollment_date_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.employee_education_enrollment_date_dialog_ref.save(employeeEducationModel.enrollment_date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="6" v-if="!is_editable_dialog">
                    <v-text-field
                      label="Дата выпуска"
                      v-model="employeeEducationModel.graduation_date"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" v-if="is_editable_dialog">
                    <v-dialog
                      ref="employee_education_graduation_date_dialog_ref"
                      v-model="employee_education_graduation_date_dialog"
                      :return-value.sync="employeeEducationModel.graduation_date"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeEducationModel.graduation_date"
                          label="Дата выпуска"
                          prepend-icon="mdi-calendar"
                          readonly
                          required
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeEducationModel.graduation_date"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employee_education_graduation_date_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.employee_education_graduation_date_dialog_ref.save(employeeEducationModel.graduation_date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      :items="employeeEducationInstitution"
                      v-model="employeeEducationModel.education_institution_id"
                      label="Учебное заведение"
                      required
                      dense
                      :disabled="!is_editable_dialog"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      :items="employeeEducationSpeciality"
                      v-model="employeeEducationModel.education_speciality_id"
                      label="Специальность"
                      required
                      dense
                      :disabled="!is_editable_dialog"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      :items="employeeEducationQualification"
                      v-model="employeeEducationModel.education_qualification_id"
                      label="Квалификация"
                      required
                      dense
                      :disabled="!is_editable_dialog"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      :items="employeeEducationProfile"
                      v-model="employeeEducationModel.education_profile_id"
                      label="Профиль образования"
                      required
                      dense
                      :disabled="!is_editable_dialog"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      :items="employeeEducationDocument"
                      v-model="employeeEducationModel.education_document_id"
                      label="Вид документа"
                      required
                      :disabled="!is_editable_dialog"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Номер документа"
                      v-model="employeeEducationModel.education_document_number"
                      :disabled="!is_editable_dialog"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" v-if="!is_editable_dialog">
                    <v-text-field
                      label="Дата документа"
                      v-model="employeeEducationModel.education_document_date"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" v-if="is_editable_dialog">
                    <v-dialog
                      ref="employee_education_document_date_dialog_ref"
                      v-model="employee_education_document_date_dialog"
                      :return-value.sync="employeeEducationModel.education_document_date"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeEducationModel.education_document_date"
                          label="Дата документа"
                          prepend-icon="mdi-calendar"
                          readonly
                          required
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeEducationModel.education_document_date"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employee_education_document_date_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.employee_education_document_date_dialog_ref.save(employeeEducationModel.education_document_date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions v-if="is_editable_dialog">
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeEducationDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeEducationSave">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :loading="employeeEducationLoader"
          :headers="employeeEducationHeader"
          :items="employeeEducationData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.education_type_id`]="{ item }">
              <span>{{getEmployeeEducationTypeVal(item.education_type_id)}} </span>      
          </template>
          <template v-slot:[`item.education_institution_id`]="{ item }">
              <span>{{getEmployeeEducationInstitutionVal(item.education_institution_id)}} </span>      
          </template>
          <template v-slot:[`item.education_speciality_id`]="{ item }">
              <span>{{getEmployeeEducationSpecialityVal(item.education_speciality_id)}} </span>      
          </template>
          <template v-slot:[`item.enrollment_date`]="{ item }">
              <span>{{moment(new Date(item.enrollment_date + '+0000')).format('DD.MM.YYYY')}}</span>   
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              small
              color="primary"
              @click.stop="employeeEducationEdit(item, false)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              small
              color="primary"
              @click.stop="employeeEducationEdit(item, true)"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              small
              color="red"
              @click.stop="employeeEducationDelete(item)"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!--////////EMPLOYEE Language-->
    <v-row v-if="employee.is_edited_employee">
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Знание языков</strong></div>
        <v-btn color="primary" outlined @click="employeeLanguageClear(); employeeLanguageDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeLanguageDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeLanguageModel.id ? 'Редактировать языки' : 'Добавить языки'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="employeeLanguage"
                      label="Язык"
                      required
                      v-model="employeeLanguageModel.language_id"
                      dense
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      :items="employeeKnowledgeLevel"
                      label="Уровень знания"
                      required
                      v-model="employeeLanguageModel.knowledge_level_id"
                      dense
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeLanguageDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeLanguageSave">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-row>
    <v-row v-if="employee.is_edited_employee">
      <v-col cols="12">
        <v-data-table
          :loading="employeeLanguageLoader"
          :headers="employeeLanguageHeader"
          :items="employeeLanguageData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.language_id`]="{ item }">
              <span>{{getEmployeeLanguageVal(item.language_id)}} </span>      
          </template>
          <template v-slot:[`item.knowledge_level_id`]="{ item }">
              <span>{{getEmployeeKnowledgeLevelVal(item.knowledge_level_id)}} </span>      
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeLanguageEdit(item)"
              color="primary"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeLanguageDelete(item)"
              color="red"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!--////////EMPLOYEE Qualification-->
    <v-row v-if="employee.is_edited_employee">
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Квалификация</strong></div>
        <v-btn color="primary" outlined @click="employeeQualificationClear(); employeeQualificationDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeQualificationDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeQualificationModel.id ? 'Редактировать квалификацию' : 'Добавить квалификацию'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="6">
                    <v-dialog
                      ref="issue_date_dialog_ref"
                      v-model="employeeQualificationModel_issue_date_dialog"
                      :return-value.sync="employeeQualificationModel.issue_date"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeQualificationModel.issue_date"
                          label="Дата получения"
                          prepend-icon="mdi-calendar"
                          readonly
                          required
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeQualificationModel.issue_date"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employeeQualificationModel_issue_date_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.issue_date_dialog_ref.save(employeeQualificationModel.issue_date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Номер документа"
                      required
                      v-model="employeeQualificationModel.doc_number"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      outlined
                      label="Описание"
                      v-model="employeeQualificationModel.description"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeQualificationDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeQualificationSave">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-row>
    <v-row v-if="employee.is_edited_employee">
      <v-col cols="12">
        <v-data-table
          :loading="employeeQualificationLoader"
          :headers="employeeQualificationHeader"
          :items="employeeQualificationData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.issue_date`]="{ item }">
              <span>{{moment(new Date(item.issue_date + '+0000')).format('DD.MM.YYYY')}}</span>   
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeQualificationEdit(item)"
              color="primary"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeQualificationDelete(item)"
              color="red"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!--////////EMPLOYEE TestResult-->
    <v-row v-if="employee.is_edited_employee">
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Аттестация</strong></div>
        <v-btn color="primary" outlined @click="employeeTestResultClear(); employeeTestResultDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeTestResultDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeTestResultModel.id ? 'Редактировать результаты' : 'Добавить результаты'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="6">
                    <v-dialog
                      ref="testing_date_dialog_ref"
                      v-model="employeeTestResultModel_testing_date_dialog"
                      :return-value.sync="employeeTestResultModel.testing_date"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeTestResultModel.testing_date"
                          label="Дата прохожения"
                          prepend-icon="mdi-calendar"
                          readonly
                          required
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeTestResultModel.testing_date"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employeeTestResultModel_testing_date_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.testing_date_dialog_ref.save(employeeTestResultModel.testing_date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Наименование"
                      required
                      v-model="employeeTestResultModel.description"
                      >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Результат"
                      required
                      v-model="employeeTestResultModel.result"
                      >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeTestResultDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeTestResultSave">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-row>
    <v-row v-if="employee.is_edited_employee">
      <v-col cols="12">
        <v-data-table
          :loading="employeeTestResultLoader"
          :headers="employeeTestResultHeader"
          :items="employeeTestResultData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.testing_date`]="{ item }">
              <span>{{moment(new Date(item.testing_date + '+0000')).format('DD.MM.YYYY')}}</span>   
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeTestResultEdit(item)"
              color="primary"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeTestResultDelete(item)"
              color="red"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!--////////EMPLOYEE Achievement-->
    <v-row v-if="employee.is_edited_employee">
      <div style="width: 100%; display: flex; justify-content: space-between; position: relative; margin: 12px;">
        <div><strong>Достижения</strong></div>
        <v-btn color="primary" outlined @click="employeeAchievementClear(); employeeAchievementDialog = true;" v-if="employee.is_edited_employee" :disabled="is_active_candidate_request">
          <v-icon class="mr-2"> mdi-plus </v-icon>
          Добавить
        </v-btn>
        <v-dialog v-model="employeeAchievementDialog" max-width="600px">
          <v-card>
            <v-card-title style="background-color: #1976d2;">
              {{employeeAchievementModel.id ? 'Редактировать достижения' : 'Добавить достижения'}}
            </v-card-title>
            <br/>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-dialog
                      ref="achievement_date_dialog_ref"
                      v-model="employeeAchievementModel_achievement_date_dialog"
                      :return-value.sync="employeeAchievementModel.achievement_date"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeAchievementModel.achievement_date"
                          label="Дата"
                          prepend-icon="mdi-calendar"
                          readonly
                          required
                          clearable
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="employeeAchievementModel.achievement_date"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="error"
                          @click="employeeAchievementModel_achievement_date_dialog = false"
                        >
                          Отмена
                        </v-btn>
                        <v-btn
                          text
                          color="success"
                          @click="$refs.achievement_date_dialog_ref.save(employeeAchievementModel.achievement_date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      outlined
                      label="Описание"
                      v-model="employeeAchievementModel.description"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="employeeAchievementDialog = false">
                Отмена
              </v-btn>
              <v-btn color="success" :disabled="disableDoubleClick" text @click="employeeAchievementSave">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-row>
    <v-row v-if="employee.is_edited_employee">
      <v-col cols="12">
        <v-data-table
          :loading="employeeAchievementLoader"
          :headers="employeeAchievementHeader"
          :items="employeeAchievementData"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: $t('globalWords.itemsPerPage'),
          }"
          :no-data-text="$t('employeeCard.tabs.noData')"
        >
          <template v-slot:[`item.achievement_date`]="{ item }">
              <span>{{moment(new Date(item.achievement_date + '+0000')).format('DD.MM.YYYY')}}</span>   
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeAchievementEdit(item)"
              color="primary"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="ma-2"
              @click.stop="employeeAchievementDelete(item)"
              color="red"
              v-if="employee.is_edited_employee"
              :disabled="is_active_candidate_request"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import moment from "moment";

export default {
  components: {
  },
    data: function() {
      return {
        disableDoubleClick: false,
        moment,

        employeeLanguageDialog: false,
        employeeLanguageData: [],
        employeeLanguageModel: {
          id: '',
          language_id: '',
          knowledge_level_id: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_language'
        },
        employeeLanguageHeader: [
          { text: '', value: 'id', sortable: false },
          { text: 'Язык', value: 'language_id', sortable: false },
          { text: 'Уровень знания', value: 'knowledge_level_id', sortable: false },
          { text: '', value: 'action', sortable: false, width: '15%' }
        ],
        employeeLanguage: [],
        employeeKnowledgeLevel: [],
        employeeLanguageLoader: false,

        employeeQualificationDialog: false,
        employeeQualificationData: [],
        employeeQualificationModel: {
          id: '',
          issue_date: '',
          doc_number: '',
          description: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_qualification'
        },
        employeeQualificationHeader: [
          { text: '', value: 'id', sortable: false },
          { text: 'Дата получения', value: 'issue_date', sortable: false },
          { text: 'Номер документа', value: 'doc_number', sortable: false },
          { text: 'Описание', value: 'description', sortable: false },
          { text: '', value: 'action', sortable: false, width: '15%' }
        ],
        employeeQualificationLoader: false,
        employeeQualificationModel_issue_date_dialog: false,

        employeeTestResultDialog: false,
        employeeTestResultData: [],
        employeeTestResultModel: {
          id: '',
          testing_date: '',
          description: '',
          result: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_test_result'
        },
        employeeTestResultHeader: [
          { text: '', value: 'id', sortable: false },
          { text: 'Дата прохожения', value: 'testing_date', sortable: false },
          { text: 'Наименование', value: 'description', sortable: false },
          { text: 'Результат', value: 'result', sortable: false },
          { text: '', value: 'action', sortable: false, width: '15%' }
        ],
        employeeTestResultLoader: false,
        employeeTestResultModel_testing_date_dialog: false,

        employeeAchievementDialog: false,
        employeeAchievementData: [],
        employeeAchievementModel: {
          id: '',
          achievement_date: '',
          description: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_achievement'
        },
        employeeAchievementHeader: [
          { text: '', value: 'id', sortable: false },
          { text: 'Дата', value: 'achievement_date', sortable: false },
          { text: 'Описание', value: 'description', sortable: false },
          { text: '', value: 'action', sortable: false, width: '15%' }
        ],
        employeeAchievementLoader: false,
        employeeAchievementModel_achievement_date_dialog: false,

        employeeEducationDialog: false,
        employeeEducationData: [],
        employeeEducationModel: {
          id: '',
          education_type_id: '',
          education_form_id: '',
          enrollment_date: '',
          graduation_date: '',
          education_institution_id: '',
          education_speciality_id: '',
          education_qualification_id: '',
          education_profile_id: '',
          education_document_id: '',
          education_document_number: '',
          education_document_date: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_education'
        },
        employeeEducationHeader: [
          { text: '', value: 'id', sortable: false },
          { text: 'Вид образования', value: 'education_type_id', sortable: false },
          { text: 'Дата поступления', value: 'enrollment_date', sortable: false },
          { text: 'Учебное заведение', value: 'education_institution_id', sortable: false },
          { text: 'Специальность', value: 'education_speciality_id', sortable: false },
          { text: '', value: 'action', sortable: false, width: '15%' }
        ],

        employeeEducationType: [],
        employeeEducationForm: [],
        employeeEducationInstitution: [],
        employeeEducationSpeciality: [],
        employeeEducationQualification: [],
        employeeEducationProfile: [],
        employeeEducationDocument: [],

                employee_education_enrollment_date_dialog: null,
        employee_education_graduation_date_dialog: null,
        employee_education_document_date_dialog: null,

        employeeEducationLoader: false,
        is_editable_dialog: false
      }
    },
    computed: {
      is_active_candidate_request: { 
        get() { return this.$store.state.employee.is_active_candidate_request },
        set(value) { this.$store.commit('setIsActiveCandidateRequest', value) }
      }
    },
    methods: {
      employeeLanguageClear() {
        this.employeeLanguageModel = {
          id: '',
          language_id: '',
          knowledge_level_id: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_language'
        }
      },

      async employeeLanguageGet() {
        this.employeeLanguageLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_language`, { params }) 
          .then(({data}) => {
            this.employeeLanguageLoader = false
            this.employeeLanguageData = data
          })
          .catch((err) => {
            this.employeeLanguageLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      getEmployeeLanguageVal(ID) {
        return this.employeeLanguage.find(item => item.value == ID).text
      },

      getEmployeeKnowledgeLevelVal(ID) {
        return this.employeeKnowledgeLevel.find(item => item.value == ID).text
      },

      employeeLanguageEdit(data) {
        this.employeeLanguageModel.id = data.id
        this.employeeLanguageModel.language_id = data.language_id
        this.employeeLanguageModel.knowledge_level_id = data.knowledge_level_id

        this.employeeLanguageDialog = true;
      },

      employeeLanguageDelete(data) {
        this.$swal({
          title: `Вы действительно хотите удалить запись?`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Отмена",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Да",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_language', is_deleted: true })
              this.employeeLanguageGet();
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: "Удален",
              });
            } catch (err) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `Ошибка: ${err.data || err}`,
              });
            }
          }
        });
      },

            employeeLanguageSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeLanguageModel.language_id) {
          err.push('"Вид недвижимости" обязателен для заполнения')
        }
        if(!this.employeeLanguageModel.knowledge_level_id) {
          err.push('"Адрес" обязателен для заполнения')
        }
        if(err.length) {
          this.disableDoubleClick = false
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: err.join('; <br>'),
          });
        }

        let method = 'post'
        let url = `/api/1.0/lov`
        if (this.employeeLanguageModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeLanguageModel.id
        }

        this.axios[method](url, this.employeeLanguageModel)
          .then(() => {
              this.employeeLanguageDialog = false;
              this.employeeLanguageGet();

                            this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: method == 'post' ? `Создан` : `Обновлен`,
              });
          })
          .catch(err => {
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 600,
              title: err.data ? err.data.ERR_MSG : err.msg || err,
            });
          })
          .finally(()=>{
            this.disableDoubleClick = false
          })
      },

      employeeQualificationClear() {
        this.employeeQualificationModel = {
          id: '',
          issue_date: '',
          doc_number: '',
          description: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_qualification'
        }
      },

      async employeeQualificationGet() {
        this.employeeQualificationLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_qualification`, { params }) 
          .then(({data}) => {
            this.employeeQualificationLoader = false
            data.sort((a, b) => { 
              return new Date(b.issue_date) - new Date(a.issue_date);
            });
            this.employeeQualificationData = data
          })
          .catch((err) => {
            this.employeeQualificationLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      employeeQualificationEdit(data) {
        this.employeeQualificationModel.id = data.id
        this.employeeQualificationModel.issue_date = data.issue_date.split(' ')[0]
        this.employeeQualificationModel.doc_number = data.doc_number
        this.employeeQualificationModel.description = data.description

        this.employeeQualificationDialog = true;
      },

      employeeQualificationDelete(data) {
        this.$swal({
          title: `Вы действительно хотите удалить запись?`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Отмена",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Да",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_qualification', is_deleted: true })
              this.employeeQualificationGet();
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: "Удален",
              });
            } catch (err) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `Ошибка: ${err.data || err}`,
              });
            }
          }
        });
      },

            employeeQualificationSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeQualificationModel.issue_date) {
          err.push('"Дата получения" обязателен для заполнения')
        }
        if(!this.employeeQualificationModel.doc_number) {
          err.push('"Номер документа" обязателен для заполнения')
        }
        if(!this.employeeQualificationModel.description) {
          err.push('"Описание" обязателен для заполнения')
        }
        if(err.length) {
          this.disableDoubleClick = false
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: err.join('; <br>'),
          });
        }

        let method = 'post'
        let url = `/api/1.0/lov`
        if (this.employeeQualificationModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeQualificationModel.id
        }

        this.axios[method](url, this.employeeQualificationModel)
          .then(() => {
              this.employeeQualificationDialog = false;
              this.employeeQualificationGet();

                            this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: method == 'post' ? `Создан` : `Обновлен`,
              });
          })
          .catch(err => {
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 600,
              title: err.data ? err.data.ERR_MSG : err.msg || err,
            });
          })
          .finally(()=>{
            this.disableDoubleClick = false
          })
      },

      employeeTestResultClear() {
        this.employeeTestResultModel = {
          id: '',
          testing_date: '',
          description: '',
          result: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_test_result'
        }
      },

      async employeeTestResultGet() {
        this.employeeTestResultLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_test_result`, { params }) 
          .then(({data}) => {
            this.employeeTestResultLoader = false
            data.sort((a, b) => { 
              return new Date(b.testing_date) - new Date(a.testing_date);
            });
            this.employeeTestResultData = data
          })
          .catch((err) => {
            this.employeeTestResultLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      employeeTestResultEdit(data) {
        this.employeeTestResultModel.id = data.id
        this.employeeTestResultModel.testing_date = data.testing_date.split(' ')[0]
        this.employeeTestResultModel.description = data.description
        this.employeeTestResultModel.result = data.result

        this.employeeTestResultDialog = true;
      },

      employeeTestResultDelete(data) {
        this.$swal({
          title: `Вы действительно хотите удалить запись?`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Отмена",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Да",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_test_result', is_deleted: true })
              this.employeeTestResultGet();
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: "Удален",
              });
            } catch (err) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `Ошибка: ${err.data || err}`,
              });
            }
          }
        });
      },

            employeeTestResultSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeTestResultModel.testing_date) {
          err.push('"Дата прохожения" обязателен для заполнения')
        }
        if(!this.employeeTestResultModel.description) {
          err.push('"Наименование" обязателен для заполнения')
        }
        if(!this.employeeTestResultModel.result) {
          err.push('"Результат" обязателен для заполнения')
        }
        if(err.length) {
          this.disableDoubleClick = false
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: err.join('; <br>'),
          });
        }

        let method = 'post'
        let url = `/api/1.0/lov`
        if (this.employeeTestResultModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeTestResultModel.id
        }

        this.axios[method](url, this.employeeTestResultModel)
          .then(() => {
              this.employeeTestResultDialog = false;
              this.employeeTestResultGet();

                            this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: method == 'post' ? `Создан` : `Обновлен`,
              });
          })
          .catch(err => {
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 600,
              title: err.data ? err.data.ERR_MSG : err.msg || err,
            });
          })
          .finally(()=>{
            this.disableDoubleClick = false
          })
      },

      employeeAchievementClear() {
        this.employeeAchievementModel = {
          id: '',
          achievement_date: '',
          description: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_achievement'
        }
      },

      async employeeAchievementGet() {
        this.employeeAchievementLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_achievement`, { params }) 
          .then(({data}) => {
            this.employeeAchievementLoader = false
            data.sort((a, b) => { 
              return new Date(b.achievement_date) - new Date(a.achievement_date);
            });
            this.employeeAchievementData = data
          })
          .catch((err) => {
            this.employeeAchievementLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      employeeAchievementEdit(data) {
        this.employeeAchievementModel.id = data.id
        this.employeeAchievementModel.achievement_date = data.achievement_date.split(' ')[0]
        this.employeeAchievementModel.description = data.description

        this.employeeAchievementDialog = true;
      },

      employeeAchievementDelete(data) {
        this.$swal({
          title: `Вы действительно хотите удалить запись?`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Отмена",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Да",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_achievement', is_deleted: true })
              this.employeeAchievementGet();
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: "Удален",
              });
            } catch (err) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `Ошибка: ${err.data || err}`,
              });
            }
          }
        });
      },

            employeeAchievementSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeAchievementModel.achievement_date) {
          err.push('"Дата" обязателен для заполнения')
        }
        if(!this.employeeAchievementModel.description) {
          err.push('"Описание" обязателен для заполнения')
        }
        if(err.length) {
          this.disableDoubleClick = false
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: err.join('; <br>'),
          });
        }

        let method = 'post'
        let url = `/api/1.0/lov`
        if (this.employeeAchievementModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeAchievementModel.id
        }

        this.axios[method](url, this.employeeAchievementModel)
          .then(() => {
              this.employeeAchievementDialog = false;
              this.employeeAchievementGet();

                            this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: method == 'post' ? `Создан` : `Обновлен`,
              });
          })
          .catch(err => {
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 600,
              title: err.data ? err.data.ERR_MSG : err.msg || err,
            });
          })
          .finally(()=>{
            this.disableDoubleClick = false
          })
      },

      employeeEducationClear() {
        this.employeeEducationModel = {
          id: '',
          education_type_id: '',
          education_form_id: '',
          enrollment_date: '',
          graduation_date: '',
          education_institution_id: '',
          education_speciality_id: '',
          education_qualification_id: '',
          education_profile_id: '',
          education_document_id: '',
          education_document_number: '',
          education_document_date: '',
          employee_id: this.employee.id,
          table_name: 'hr.employee_education'
        }
      },

      async employeeEducationGet() {
        this.employeeEducationLoader = true

        let params = { employee_id: this.employee.id, is_deleted: false }
        this.axios.get(`/api/1.0/lov/hr.employee_education`, { params }) 
          .then(({data}) => {
            this.employeeEducationLoader = false
            data.sort((a, b) => { 
              return new Date(b.enrollment_date) - new Date(a.enrollment_date);
            });
            this.employeeEducationData = data
          })
          .catch((err) => {
            this.employeeEducationLoader = false
            console.log(err)
            return this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              title: `Ошибка: ${err.data || err}`,
            });
          })
      },

      getEmployeeEducationTypeVal(ID) {
        return this.employeeEducationType.find(item => item.value == ID).text
      },

      getEmployeeEducationInstitutionVal(ID) {
        return this.employeeEducationInstitution.find(item => item.value == ID).text
      },

      getEmployeeEducationSpecialityVal(ID) {
        return this.employeeEducationSpeciality.find(item => item.value == ID).text
      },

      employeeEducationEdit(data, isEditableDialog) {
        this.is_editable_dialog = isEditableDialog
        this.employeeEducationModel.id = data.id
        this.employeeEducationModel.education_type_id = data.education_type_id
        this.employeeEducationModel.education_form_id = data.education_form_id
        this.employeeEducationModel.enrollment_date = data.enrollment_date.split(' ')[0]
        this.employeeEducationModel.graduation_date = data.graduation_date.split(' ')[0]
        this.employeeEducationModel.education_institution_id = data.education_institution_id
        this.employeeEducationModel.education_speciality_id = data.education_speciality_id
        this.employeeEducationModel.education_qualification_id = data.education_qualification_id
        this.employeeEducationModel.education_profile_id = data.education_profile_id
        this.employeeEducationModel.education_document_id = data.education_document_id
        this.employeeEducationModel.education_document_number = data.education_document_number
        this.employeeEducationModel.education_document_date = data.education_document_date.split(' ')[0]
        this.employeeEducationDialog = true;
      },

      employeeEducationDelete(data) {
        this.$swal({
          title: `Вы действительно хотите удалить запись?`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Отмена",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Да",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await this.axios.put(`/api/1.0/lov/`+data.id, { table_name: 'hr.employee_education', is_deleted: true })
              this.employeeEducationGet();
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: "Удален",
              });
            } catch (err) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                title: `Ошибка: ${err.data || err}`,
              });
            }
          }
        });
      },

            employeeEducationSave() {
        this.disableDoubleClick = true
        let err = []

        if(!this.employeeEducationModel.education_type_id) {
          err.push('"Вид образования" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.education_form_id) {
          err.push('"Форма обучения" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.enrollment_date) {
          err.push('"Дата поступления" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.graduation_date) {
          err.push('"Дата выпуска" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.education_institution_id) {
          err.push('"Учебное заведение" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.education_speciality_id) {
          err.push('"Специальность" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.education_qualification_id) {
          err.push('"Квалификация" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.education_profile_id) {
          err.push('"Профиль образования" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.education_document_id) {
          err.push('"Вид документа" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.education_document_number) {
          err.push('"Номер документа" обязателен для заполнения')
        }
        if(!this.employeeEducationModel.education_document_date) {
          err.push('"Дата документа" обязателен для заполнения')
        }

        if(err.length) {
          this.disableDoubleClick = false
          return this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: err.join('; <br>'),
          });
        }

        let method = 'post'
        let url = `/api/1.0/lov`
        if (this.employeeEducationModel.id != '') { 
          method = 'put'
          url = `/api/1.0/lov/`+this.employeeEducationModel.id
        }

        this.axios[method](url, this.employeeEducationModel)
          .then(() => {
              this.employeeEducationDialog = false;
              this.employeeEducationGet();

                            this.$swal({
                ...this.$optionAlert.fire,
                icon: "success",
                title: method == 'post' ? `Создан` : `Обновлен`,
              });
          })
          .catch(err => {
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "error",
              width: 600,
              title: err.data ? err.data.ERR_MSG : err.msg || err,
            });
          })
          .finally(()=>{
            this.disableDoubleClick = false
          })
      },
    },
    async created() {

      await this.axios.get(`/api/1.0/lov/ref.language`)
        .then(({data}) => {
            this.employeeLanguage = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

      await this.axios.get(`/api/1.0/lov/ref.knowledge_level`)
        .then(({data}) => {
            this.employeeKnowledgeLevel = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name_rus
                })
            return acc
            }, [])
        })

      await this.axios.get(`/api/1.0/lov/ref.education_document`)
        .then(({data}) => {
            this.employeeEducationDocument = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

      await this.axios.get(`/api/1.0/lov/ref.education_qualification`)
        .then(({data}) => {
            this.employeeEducationQualification = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

      await this.axios.get(`/api/1.0/lov/ref.education_form`)
        .then(({data}) => {
            this.employeeEducationForm = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

              await this.axios.get(`/api/1.0/lov/ref.education_speciality`)
        .then(({data}) => {
            this.employeeEducationSpeciality = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

              await this.axios.get(`/api/1.0/lov/ref.education_type`)
        .then(({data}) => {
            this.employeeEducationType = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

              await this.axios.get(`/api/1.0/lov/ref.education_institution`)
        .then(({data}) => {
            this.employeeEducationInstitution = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

              await this.axios.get(`/api/1.0/lov/ref.education_profile`)
        .then(({data}) => {
            this.employeeEducationProfile = data.reduce((acc, item) => {
                acc.push({
                    value: item.id,
                    text: item.name
                })
            return acc
            }, [])
        })

      await this.employeeLanguageGet()
      await this.employeeQualificationGet()
      await this.employeeTestResultGet()
      await this.employeeAchievementGet()
      await this.employeeEducationGet()
    },
    props: ['employee']
}
</script>