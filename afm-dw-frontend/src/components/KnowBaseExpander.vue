<template>
  <div>
    <!-- <EmployeeTable v-if="isEmployee" :employeeTable="departmentData.id" /> -->
    <v-expansion-panels
      :accordion="false"
      :popout="false"
      :inset="true"
      :multiple="false"
      :focusable="false"
      :disabled="false"
      :flat="true"
      :hover="true"
      :tile="false"
      v-model="expansionValue"
      @change="openExpanderStore"
    >
      <v-expansion-panel
        class="child-department"
        v-for="(knowData, j) in expanderData"
        :key="j"
      >
        <v-expansion-panel-header class="child-department">
          <div
            style="display: flex; justify-content: space-between; align-items: center;"
          >
            <span>{{ knowData.name }}</span>
            <div v-if="checkRole()">
              <v-btn
                outlined
                class="mr-4 btnStyled"
                color="success"
                @click.stop="showAddSection(knowData)"
              >
                <v-icon small>
                  mdi-plus
                </v-icon>
              </v-btn>

              <v-btn
                outlined
                class="mr-4 btnStyled"
                color="primary"
                @click.stop="showEditSection(knowData, true)"
              >
                <v-icon small>
                  mdi-pencil
                </v-icon>
              </v-btn>

              <v-btn
                outlined
                class="mr-4 btnStyled"
                color="error"
                @click.stop="deleteSection(knowData)"
              >
                <v-icon small>
                  mdi-trash-can-outline
                </v-icon>
              </v-btn>
            </div>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content style="padding-top: 20px">
          <v-data-table
            :hide-default-header="false"
            :headers="headers"
            :items.sync="tableData"
            :items-per-page="10"
            class="clickableTable elevation-1"
            :no-data-text="'Нет данных'"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
          >
            <template v-slot:[`item.body_data`]="{ item }">
              <div v-if="item.body">
                <span
                  >{{ item.body.substring(0, 20)
                  }}{{ item.body.length > 22 ? "..." : "" }}</span
                >
                <v-btn
                  icon
                  v-if="item.body.length > 20"
                  color="grey darken-2"
                  @click="showBodyAction(item, expansionValue)"
                >
                  <v-icon>
                    mdi-dock-window
                  </v-icon>
                </v-btn>
              </div>
            </template>
            <template v-slot:[`item.file`]="{ item }">
              <div v-if="item.file_name">
                <span>{{ item.file_name }}</span>
                <v-btn
                  v-if="checkFormat(item.file_name) !== 'mp4'"
                  @click="downloadFile(item)"
                  color="grey darken-2"
                  icon
                >
                  <v-icon>
                    mdi-download-circle-outline
                  </v-icon>
                </v-btn>
                <v-btn
                  v-if="checkFormat(item.file_name) == 'mp4'"
                  @click="showVideo(item)"
                  color="grey darken-2"
                  icon
                >
                  <v-icon>
                    mdi-filmstrip
                  </v-icon>
                </v-btn>
              </div>
              <div v-else-if="item.url">
                <a target="_blank" :href="item.url">{{
                  item.url_name || item.url
                }}</a>
              </div>
            </template>
            <template v-slot:[`item.action`]="{ item }">
              <div style="display:flex; min-width: 140px;">
                <v-btn
                  v-if="checkRole()"
                  icon
                  class="ma-2"
                  @click.stop="showEditSection(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  v-if="checkRole()"
                  icon
                  class="ma-2"
                  @click.stop="deleteSection(item)"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog v-model="showBody" width="700">
      <v-card class="dialogOneNews">
        <v-card-text style="padding: 30px;">
          <slot>
            <h2 class="mb-4" style="font-size: 20px;">{{ bodyTitle }}</h2>
            <p>{{ bodyText }}</p>
          </slot>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showBody = false">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Видео проигрыватель -->
    <v-dialog v-model="showVideoDialog" width="600">
      <v-card class="dialogOneNews">
        <v-card-text style="padding: 0; overflow: hidden">
          <slot>
            <div class="player-container">
              <vue-player
                :src="src"
                poster="https://via.placeholder.com/150"
                title="this is a title"
              ></vue-player>
            </div>
            <!-- <video
              v-if="src"
              width="100%"
              controls
              muted
              autoPlay
              id="videoKnowBaseId"
            >
              <source
                :src="`http://84.252.143.13:5131/api/1.0/media${src}`"
                type="video/mp4"
              />
            </video> -->
          </slot>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Создание позиции -->

    <v-dialog
      v-model="addSectionPopup"
      width="700"
      @input="(v) => v || clearDialog()"
    >
      <v-card class="dialogOneNews">
        <v-card-text style="padding: 30px;">
          <slot>
            <h2 v-if="dialogData.isSection" class="mb-4" style="font-size: 20px;">Изменить раздел</h2>
            <h2 v-else class="mb-4" style="font-size: 20px;">Добавить подраздел</h2>

            <v-form>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="dialogData.name_rus"
                    :label="`Заголовок на Русском`"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="dialogData.name_kaz"
                    :label="`Заголовок на Казахском`"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-if="!dialogData.isSection" >
                <v-col cols="6">
                  <v-textarea
                    outlined
                    name="input-7-4"
                    label="Описание на Русском"
                    v-model="dialogData.body_rus"
                  ></v-textarea>
                </v-col>
                <v-col cols="6">
                  <v-textarea
                    outlined
                    name="input-7-4"
                    label="Описание на Казахском"
                    v-model="dialogData.body_kaz"
                  ></v-textarea>
                </v-col>
              </v-row>
              <v-row v-if="!dialogData.isSection">
                <v-col cols="6">
                  <v-file-input
                    v-if="!dialogData.file_name"
                    v-model="dialogData.file"
                    color="blue accent-4"
                    counter
                    :label="`Документ или видео`"
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
                        +{{ files.length - 2 }} File(s)
                      </span>
                    </template>
                  </v-file-input>

                  <v-chip
                    close
                    style="white-space: break-spaces; height: auto;"
                    :active="!!dialogData.file_name"
                    @click:close="dialogData.file_name = ''; dialogData.deleteFile = true"
                    >{{ dialogData.file_name }}</v-chip
                  >
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="dialogData.url"
                    :label="`Ссылка`"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-if="!dialogData.isSection">
                <v-col cols="6">
                  <v-text-field
                    v-model="dialogData.url_name_rus"
                    :label="`Название ссылки на Русском`"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="dialogData.url_name_kaz"
                    :label="`Название ссылки на Казахском`"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  Доступен только для департаментов:
                  <v-chip
                    v-if="privateDepartments.length === 0"
                  >
                   Все департаменты
                  </v-chip>
                  <v-chip
                    style="margin-bottom:10px;"
                    close
                    @click:close="deleteSelectDepartment(department)"
                    v-for="department in privateDepartments"
                    :key="department.id"
                  >
                   {{department.id}} - {{department.name}}
                  </v-chip>
                        <v-row>
                            <v-col>
                                <div style="margin-top: 1rem;">
                                  <SearchForm ref="searchComponent" placeholder="searchPlaceholder.globalSearchDep" @search="searchDepartment" />
                                </div>
                            </v-col>    
                        </v-row>
                        <v-row>
                            <v-col>
                              <DepartmentTable @openModal="addDepartment" :departments="searchDepartmentTable" :loader="departmentTableloader"/>
                            </v-col>
                        </v-row>
                </v-col>
              </v-row>
            </v-form>
          </slot>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            text
            @click="addSection"
            :loading="disableDoubleClick"
            :disabled="disableDoubleClick"
          >
            Создать
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="
              addSectionPopup = false;
              clearDialog();
            "
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import checkRoles from '@/utils/check_role'
import DepartmentTable from '@/components/AdminDepartmentTable';
import SearchForm from '@/components/GlobalSearch';
export default {
  components: {
      DepartmentTable,
      SearchForm
  },
  data() {
    return {
      playing: {},
      value: true,
      streamObject: {},
      headers: [
        { text: this.$t('knowBase.nameSubSection'), value: "name" },
        { text: this.$t('knowBase.description'), value: "body_data" },
        { text: this.$t('knowBase.content'), value: "file" },
        { text: "", value: "action" },
      ],
      expansionValue: "",
      store: "",
      departmentData: {},
      isEmployee: false,

      dialogData: {},
      expanderData: [],
      tableData: [],
      showBody: false,
      bodyText: "",
      bodyTitle: "",
      src: "",
      showVideoDialog: false,
      file: [],
      disableDoubleClick: false,
      addSectionPopup: false,
      currentItem: {},
      currentSection: "",
      departmentTableloader: false,
      searchDepartmentTable: [],
      privateDepartments: [],
    };
  },

  methods: {
    addDepartment(data) {
      this.searchDepartmentTable = this.searchDepartmentTable.filter(item => item != data)
      if(!this.privateDepartments.find(item => item.id == data.id)) {
        this.privateDepartments = [...[data], ...this.privateDepartments]
      }
    },
    deleteSelectDepartment(department) {
      this.searchDepartmentTable = [...[department], ...this.searchDepartmentTable]
      this.privateDepartments = this.privateDepartments.filter(item => item.id != department.id)

    },
    async searchDepartment(search) {
        try {
            let params = {
                text: search,
                search_dep: true,
                admin_page: true
            }
            const {data: data} = await this.axios.get(`/api/1.0/search`, {params});
            this.searchDepartmentTable = data;
        } catch (e) {
            console.log(e)
        }
    },
    clearDialog() {
      this.dialogData = {};
      this.searchDepartmentTable = []
      this.$refs.searchComponent.clearInput()
    },

    showAddSection(item) {
      this.privateDepartments = []
      this.currentItem = item;
      this.addSectionPopup = true;
    },

        showEditSection(item, isSection = false) {
      this.currentItem = item;
      this.privateDepartments = item.accessDepartment
      this.addSectionPopup = true;
      this.dialogData = Object.assign({}, item);
      this.dialogData.isSection = isSection
    },

    async addSection() {
      try {

                if(!this.dialogData.name_rus && !this.dialogData.name_kaz) {
          throw {data: {ERR_MSG: 'Введите название записи'}}
        }

        const form = new FormData();
        form.append("name_rus", this.dialogData.name_rus);
        form.append("name_kaz", this.dialogData.name_kaz);
        form.append("body_rus", this.dialogData.body_rus);
        form.append("body_kaz", this.dialogData.body_kaz);
        form.append("url", this.dialogData.url);
        form.append("url_name_rus", this.dialogData.url_name_rus);
        form.append("url_name_kaz", this.dialogData.url_name_kaz);
        form.append("parent_id", this.currentItem.id);
        form.append("file_name", this.dialogData.file_name);
        form.append("deleteFile", this.dialogData.deleteFile);
        if(this.privateDepartments.length) {
          form.append("privateDepartments", JSON.stringify(this.privateDepartments));
        }
        if (this.dialogData.file) {
          form.append("file", this.dialogData.file);
        }
        form.append("file_type_id", 4);
        form.append("fileType", "knowbase");
        form.append("know_base_type_id", this.$route.path == '/knowbasegrade' ? 2 : 1);

        this.disableDoubleClick = true;

                if(this.dialogData.id) {
          await this.axios.put("api/1.0/know_base/:id", form, {localParams: {id: this.dialogData.id}});
        } else {
          await this.axios.post("api/1.0/know_base", form);
        }
        await this.openExpanderStore(this.currentSection);

        if(this.dialogData.isSection) {
          this.refreshExpander()
        }
        this.addSectionPopup = false;
        this.clearDialog();
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: "Создано.",
        });
      } catch (error) {
        this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}`,
        });
      }

      this.disableDoubleClick = false;
    },

    checkFormat(str) {
      return str == null ? null : str.substr(str.lastIndexOf(".") + 1);
    },

    async showVideo(item) {
      this.showVideoDialog = true;
      this.src = `${this.axios.defaults.baseURL}/api/1.0/media?object=${item.id}&objectType=4`;
    },

    downloadFile(item) {
      let config = {
        responseType: "blob",
        params: {
          objectType: 4,
          object: item.id,
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
        a.download = item.file_name;
        a.click();
        a.remove();
      });
    },

    async openExpanderStore(a) {
      if (!a && a !== 0) {
        return;
      }
      if (
        (this.currentSection || this.currentSection === 0) &&
        this.expanderData[a].id != this.expanderData[this.currentSection].id
      ) {
        this.tableData = [];
      }
      this.currentSection = a;
      let id = this.expanderData[a].id;

      let url = `/api/1.0/know_base/:id`;
      let localParams = { id };
      let params = { know_base_type_id : this.$route.path == '/knowbasegrade' ? 2 : 1 };
      let data = await this.axios.get(url, { localParams, params });
      this.tableData = data.data;
    },

    showBodyAction(item, expansionValue) {
      this.bodyTitle = `${this.expanderData[expansionValue].name}, ${item.name}`;
      this.bodyText = item.body;
      this.showBody = true;
    },

    async deleteSection(item) {
      this.$swal({
        title: `Вы действительно хотите удалить запись ${item.name}?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            let url = `/api/1.0/know_base/:id`;
            let localParams = { id: item.id };

            await this.axios.delete(url, { localParams });
            if (item.parent_id) {
              await this.openExpanderStore(this.currentSection);
            } else {
              this.refreshExpander();
            }

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

    refreshExpander() {
      this.$emit("refreshExpanders");
    },

    checkRole() {
      if (checkRoles('5', this.$userData)) {
        return true;
      }
      return false;
    },
  },
  watch: {
    showVideoDialog(val) {
      if (!val) {
        this.src = "";
      }
    },

    know_data(val) {
      if (val.length || val.length == 0) {
        this.expanderData = this.know_data;
      }
    },
  },
  mounted() {
  },
  created() {
    this.expanderData = this.know_data;
  },
  props: ["know_data", "level"],
};
</script>