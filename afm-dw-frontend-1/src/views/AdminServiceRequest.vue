<template>
  <v-card>
    <div class="d-flex justify-space-between">
      <span class="text-h4 mb-2">Список групп</span>
      <v-btn
       @click="openAddGroupDialog"
      >
        Добавить группу
      </v-btn>
    </div>
    <v-data-table
      dense
      :headers="performerGroupHeader"
      :items="performer_group"
      :items-per-page="10"
      class="clickableTable elevation-1 mb-4"
      :loading="loading_performer_group"
      :no-data-text="'Нет данных о группах'"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
      @click:row="getPerformer"
    >
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          small
          class="ma-2"
          color="primary"
          @click="openAddPerformerDialog"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="ma-2"
          color="primary"
          @click="openEditGroupDialog(item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="ma-2"
          color="red"
          @click="deletePerformerGroup(item.id)"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <div 
      
      class="d-flex justify-space-between"
      >
      <span class="text-h4 mb-2">Список исполнителей <span v-if="selected_performer_group">группы: {{selected_performer_group.name}}, категории: {{selected_performer_group.category_name}}</span> </span>
    </div>
    <v-data-table
      dense
     
      :headers="performerHeader"
      :items="selected_performer_group?selected_performer_group.performer:[]"
      :items-per-page="10"
      :loading="loading_performer"
      class="clickableTable elevation-1 mb-4"
      :no-data-text="selected_performer_group?'Нет данных об исполнителях':'Выберите группу'"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
    >
      <template v-slot:[`item.user`]="{ item }">
        {{ item.user.last_name }} {{ item.user.first_name }} {{ item.user.middle_name }}
      </template>
      <template v-slot:[`item.is_head_performer`]="{ item }">
        {{ item.is_head_performer?'Да':'Нет' }}
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          small
          class="ma-2"
          color="primary"
          @click="openEditPerformerDialog(item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="ma-2"
          color="red"
          @click="deletePerformer(item.id)"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="addGroupDialog" width="600">
      <v-card>
        <v-card-title>
          <span v-if="editingGroup.id">Редактировать группу</span>
          <span v-else>Добавить группу</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editingGroup.name_rus_buf"
            label="Название(rus)"
          >
          </v-text-field>
          <v-text-field
            v-model="editingGroup.name_kaz_buf"
            label="Название(kaz)"
          >
          </v-text-field>

          <v-select
            ref="category"
            :items="serviceCategory"
            label="Категория"
            required
            dense
            item-text="name"
            item-value="id"
            v-model="editingGroup.sr_category_id_buf"
          >
          </v-select>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="addGroupDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn 
            color="green"
            text
            @click="sendGroup"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addPerformerDialog" width="800">
      <v-card>
        <v-card-title>
          <span v-if="editingPerformer.id">Редактировать исполнителя</span>
          <span v-else>Добавить исполнителя</span>
        </v-card-title>
        <v-card-text>

          <v-col v-if="editingPerformer.user_buf == null" cols="12">
            <v-chip color="red">Исполнитель не выбран</v-chip>
          </v-col>
          <v-col v-else cols="12">
            <v-chip color="grey">{{ editingPerformer.user_buf.last_name }} {{ editingPerformer.user_buf.first_name }} {{ editingPerformer.user_buf.middle_name }}</v-chip>
          </v-col>
          <v-col cols="12">
            <div 
              :style="`display: flex; position: relative; z-index:1; width: 100%; background: #fff; height: 56px; box-sizing: border-box`" 
              >
              <v-text-field class="searchBar" :placeholder="$t('mainPage.search.globalSearch')" v-model="globalSearchVal" @keydown.enter="globalSearch" @keydown="check" style="padding: 7px; border: 1px solid #ddd; border-radius: 5px">
                <v-icon @click="globalSearch" slot="prepend" color="gray" style="color: #BDBDBD;">mdi-magnify</v-icon>
              </v-text-field>
            </div>
          </v-col>
          <v-col cols="12">
            <EmployeeTableSmallSearch @clickOnRow="selectEmployee" :employeeTable="searchEmployeeTable" :adminUsersForm="false"></EmployeeTableSmallSearch>
          </v-col>
          <v-checkbox
            v-model="editingPerformer.is_head_performer_buf"
            label="Главный исполнитель"
          >
          </v-checkbox>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="addPerformerDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn 
            color="green"
            text
            @click="sendPerformer"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
  </v-card>
</template>
<script>
export default {
  data () {
    return {

      searchEmployeeTable: [],
      searchEmployee: [],
      globalSearchVal: '',

      addGroupDialog: false,
      addPerformerDialog: false,
      editingGroup: {},
      editingPerformer: {},

      serviceCategory: [],

      performerGroupHeader: [
        { text: '#', sortable: false, value: 'id'},
        { text: 'Название(rus)', value: 'name_rus'},
        { text: 'Название(kaz)', value: 'name_kaz'},
        { text: 'Категория', value: 'category_name'},
        { text: '', value: 'action', align: 'end', width: '20%' }
      ],

      performerHeader: [
        { text: '#', sortable: false, value: 'id'},
        { text: 'Главный исполнитель', value: 'is_head_performer'},
        { text: 'ФИО', value: 'user'},
        { text: '', value: 'action', align: 'end', width: '20%' }
      ],


      performer_group: [],
      loading_performer_group: true,
      loading_performer: false,

      selected_performer_group: null,

    }
  },
  async mounted () {
    await this.getPerformerGroup() 

  },
  methods: {
    deletePerformerGroup (id) {
            this.$swal({
                title: `Вы действительно хотите удалить запись №${id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Удалить",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await this.axios.put(`/api/1.0/service-admin/performer_group/${id}`)
                        this.$swal({
                            ...this.$optionAlert.fire,
                            icon: "success",
                            timer: 5000,
                            width: 300,
                            title: `Запись удалена`,
                        });
                        this.getPerformerGroup()
                    }  catch (error) {
                        if(error.data) {
                            this.$swal({
                                ...this.$optionAlert.fire,
                                icon: "error",
                                timer: 5000,
                                width: 600,
                                title: error.data?.ERR_MSG,
                            });
                        }
                        console.error(error)
                    }
            }})
    },
    deletePerformer (id) {
            this.$swal({
                title: `Вы действительно хотите удалить запись №${id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Удалить",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await this.axios.put(`/api/1.0/service-admin/performer/${id}`)
                        this.$swal({
                            ...this.$optionAlert.fire,
                            icon: "success",
                            timer: 5000,
                            width: 300,
                            title: `Запись удалена`,
                        });
                        this.getPerformer(this.selected_performer_group)
                    }  catch (error) {
                        if(error.data) {
                            this.$swal({
                                ...this.$optionAlert.fire,
                                icon: "error",
                                timer: 5000,
                                width: 300,
                                title: error.data?.ERR_MSG,
                            });
                        }
                        console.error(error)
                    }
            }})
    },
    selectEmployee (data) {
      this.editingPerformer.user_buf = data

      this.editingPerformer.performer_id_buf = data.id

      this.searchEmployeeTable = this.searchEmployeeTable.filter(item=>item.id!=data.id)
    },
    globalSearch () {
      let params = {
        without_performers: false,
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
          without_performers: false,
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
    async openAddGroupDialog() {

      if (this.serviceCategory.length == 0)
      {
        try{
          let {data} = await this.axios.get(`/api/1.0/service-admin/category`)
          this.serviceCategory = data
        } catch(err) {
          console.error(err)
        }
      }

      this.editingGroup = {
        name_rus: '',
        name_kaz: '',
        sr_category_id: null,
      }
      this.addGroupDialog = true
    },
    async openEditGroupDialog(item) {

      if (this.serviceCategory.length == 0)
      {
        try{
          let {data} = await this.axios.get(`/api/1.0/service-admin/category`)
          this.serviceCategory = data
        } catch(err) {
          console.error(err)
        }
      }

      this.editingGroup = item
      this.editingGroup.name_kaz_buf = this.editingGroup.name_kaz
      this.editingGroup.name_rus_buf = this.editingGroup.name_rus
      this.editingGroup.sr_category_id_buf = this.editingGroup.sr_category_id
      this.addGroupDialog = true
    },
    async sendGroup() {
      try{

        this.editingGroup.name_kaz = this.editingGroup.name_kaz_buf
        this.editingGroup.name_kaz_buf = null
        this.editingGroup.name_rus = this.editingGroup.name_rus_buf
        this.editingGroup.name_rus_buf = null
        this.editingGroup.sr_category_id = this.editingGroup.sr_category_id_buf
        this.editingGroup.sr_category_id_buf = null

        if (this.editingGroup.id) {
          await this.axios.put(`/api/1.0/service-admin/performer_group`, this.editingGroup)
        } else {
          await this.axios.post(`/api/1.0/service-admin/performer_group`, this.editingGroup)
        }

        this.getPerformerGroup()

      } catch (err) {
        console.error(err)
      } finally {
        this.addGroupDialog = false
      }

    },
    openAddPerformerDialog() {
      this.editingPerformer = {
        performer_id_buf: null,
        is_head_performer_buf: false,
      }
      this.addPerformerDialog = true
    },
    openEditPerformerDialog(item) {
      this.editingPerformer = item
      this.editingPerformer.user_buf = this.editingPerformer.user
      this.editingPerformer.performer_id_buf = this.editingPerformer.performer_id
      this.addPerformerDialog = true
    },
    async sendPerformer() {
      try{
        this.editingPerformer.user = this.editingPerformer.user_buf
        this.editingPerformer.performer_id = this.editingPerformer.performer_id_buf
        this.editingPerformer.is_head_performer = this.editingPerformer.is_head_performer_buf
        if (this.editingPerformer.id) {
          if(this.editingPerformer.id)
          await this.axios.put(
            `/api/1.0/service-admin/performer`, 
            {
              sr_performer_group_id: this.selected_performer_group.id, 
              performer_id: this.editingPerformer.performer_id_buf, 
              is_head_performer: this.editingPerformer.is_head_performer_buf?this.editingPerformer.is_head_performer_buf: false,
              id: this.editingPerformer.id,
            }
          )
        }else {
          await this.axios.post(`/api/1.0/service-admin/performer`, {sr_performer_group_id: this.selected_performer_group.id, performer_id: this.editingPerformer.performer_id_buf, is_head_performer: this.editingPerformer.is_head_performer_buf})
        }

        this.getPerformer(this.selected_performer_group)

      } catch (err) {
        console.error(err)
      } finally {
        this.addPerformerDialog = false
      }

    },
    async getPerformerGroup() {

      try {
        this.loading_performer_group = true
        let {data} = await this.axios.get(`/api/1.0/service-admin/performer_group`)
        this.performer_group = data
      } catch(err) {
        console.error(err)
      } finally {
        this.loading_performer_group = false
      }

    },
    async getPerformer(group) {

      this.selected_performer_group = group

      try {
        this.loading_performer = true

        let localParams = {
          performer_group_id: group.id
        }

        let {data} = await this.axios.get(`/api/1.0/service-admin/performer/:performer_group_id`, {localParams})
        this.selected_performer_group.performer = data
      } catch(err) {
        console.error(err)
      } finally {
        this.loading_performer = false
      }

    }
  }
}
</script>