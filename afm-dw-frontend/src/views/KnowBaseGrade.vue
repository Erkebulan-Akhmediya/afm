<template>
  <div>
    <div class="knowBaseGrade">
      <div
        class="header justify-space-between align-center mb-4"
        style="display: flex;"
      >
        <h2>{{$t('yesshir')}}</h2>
        <v-btn
          style="width: 200px; margin-left: auto;"
          outlined
          class="mr-4 btnStyled"
          color="#5787A4"
          @click="addSectionPopup = true"
          v-if="isCheckRoles()"
        >
          <v-icon small class="mr-3">
            mdi-plus
          </v-icon>
          {{$t('knowBaseGrade.addSection')}}
        </v-btn>
      </div>
      <KnowBaseExpander @refreshExpanders="getKnowBaseGrade" :know_data="know_data" :level="0"> </KnowBaseExpander>
    </div>
    <v-dialog v-model="addSectionPopup" width="700">
      <v-card class="dialogOneNews">
        <v-card-text style="padding: 30px;">
          <slot>
            <h2 class="mb-4" style="font-size: 20px;">{{$t('knowBaseGrade.addSection')}}</h2>

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
                                  <SearchForm placeholder="searchPlaceholder.globalSearchDep" @search="searchDepartment" />
                                </div>
                            </v-col>    
                        </v-row>
                        <v-row>
                            <v-col>
                              <DepartmentTable @openModal="openModal" :departments="searchDepartmentTable" :loader="departmentTableloader"/>
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
              dialogData = '';
            "
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.knowBaseGrade {
  min-height: 100vh;
  background-color: #fff;
  padding: 20px;

  h2 {
    font-size: 30px;
  }
}
</style>

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
      dialogData: {},
      addSectionPopup: false,
      expanded: [],
      singleExpand: true,
      know_data: [],
      disableDoubleClick: false,
      privateDepartments: [],
      departmentTableloader: false,
      searchDepartmentTable: [],
    };
  },
  methods: {
    openModal(data) {
      this.searchDepartmentTable = this.searchDepartmentTable.filter(item => item != data)
      if(!this.privateDepartments.find(item => item.id == data.id)) {
        this.privateDepartments = [...[data], ...this.privateDepartments]
      }
    },
    isCheckRoles() {
      return checkRoles('5', this.$userData)
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
    async addSection() {
      try {
        this.disableDoubleClick = true;
        this.dialogData.privateDepartments = JSON.stringify(this.privateDepartments)
        this.dialogData.know_base_type_id = this.$route.path == '/knowbasegrade' ? 2 : 1
        
        await this.axios.post("api/1.0/know_base", this.dialogData);
        await this.getKnowBaseGrade();
        this.addSectionPopup = false;
        this.dialogData = {}
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

    async getKnowBaseGrade() {
        let data
        try {
            data = await this.axios.get("/api/1.0/know_base", {params: {know_base_type_id: this.$route.path == '/knowbasegrade' ? 2 : 1}});
            this.know_data = data.data;
        } catch (error) {
            console.log(error)
            this.know_data = []
        }
    },
  },
  created() {
    this.getKnowBaseGrade();
  },
};
</script>
