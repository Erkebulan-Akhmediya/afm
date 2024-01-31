<template>
  <div v-if="appeal_secretary_list.includes(this.$userData.id)">
    <!--  <h1>{{selectedExpertGroup}}</h1> -->
    <!-- <p>{{ experts }}</p> -->
    <div
      class="topBar my-4 mx-4"
      style="display: flex; justify-content: space-between"
    >
      <span class="text-h4">Список групп</span>
      <v-btn color="primary" @click="dialogGroup = true">
        <v-icon> mdi-plus </v-icon>
        Добавить
      </v-btn>
    </div>
    <v-col cols="12" class="pt-0">
      <v-data-table
        dense
        no-data-text="Нет данных"
        :headers="tableHeadersGroups"
        :items="EXPERT_GROUPS"
        max-width="400px"
        class="elevation-1"
        :items-per-page="10"
        :loading="IS_SENDING_APPEAL"
      >
        <template v-slot:[`item.action`]="{ item }">
          <v-btn
            v-if="appeal_secretary_list.includes($userData.id)"
            :loading="IS_SENDING_APPEAL"
            :disabled="IS_SENDING_APPEAL"
            icon
            @click="selectGroup(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            v-if="appeal_secretary_list.includes($userData.id)"
            :loading="IS_SENDING_APPEAL"
            :disabled="IS_SENDING_APPEAL"
            icon
            @click="
              selectGroup(item);
              dialogAddExpert = true;
            "
          >
            <v-icon>mdi-account-multiple-plus</v-icon>
          </v-btn>
          <v-btn
            :loading="IS_SENDING_APPEAL"
            :disabled="IS_SENDING_APPEAL"
            icon
            @click="deleteGroup(item)"
          >
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table></v-col
    >
    <div
      class="topBar my-4 mx-4"
      style="display: flex; justify-content: space-between"
    >
      <span class="text-h4"
        >Участники группы
        {{ selectedExpertGroup ? selectedExpertGroup.name : "" }}</span
      >
      <!-- <v-btn
        v-if="selectedExpertGroup"
        color="primary"
        @click="dialogAddExpert = true"
        :loading="IS_SENDING_APPEAL"
            :disabled="IS_SENDING_APPEAL"
      >
        <v-icon> mdi-plus </v-icon>
        Добавить эксперта
      </v-btn> -->
    </div>
    <v-col cols="12" class="pt-0">
      <v-data-table
        dense
        no-data-text="Нет данных"
        :headers="tableHeadersExpert"
        :items="experts"
        max-width="400px"
        class="elevation-1"
        :items-per-page="10"
        :loading="IS_SENDING_APPEAL"
      >
        <template v-slot:[`item.action`]="{ item }">
          <v-btn
            :loading="IS_SENDING_APPEAL || disabledTrashBtn"
            :disabled="IS_SENDING_APPEAL || disabledTrashBtn"
            icon
            @click="deleteExpert(item)"
          >
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table></v-col
    >

    <v-row justify="center">
      <v-dialog v-model="dialogGroup" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Новая группа ЭС</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Название"
                    required
                    v-model="groupName"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="closeGroupDialog()">
              Отмена
            </v-btn>
            <v-btn
              :loading="IS_SENDING_APPEAL"
              :disabled="!groupName || IS_SENDING_APPEAL"
              color="green"
              text
              @click="createGroup()"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- добавление/замена участника -->
    <v-row justify="center">
      <v-dialog v-model="dialogAddExpert" persistent max-width="800px">
        <v-card>
          <v-card-title>
            <span class="text-h5" v-text="`Добавить участника ЭС `"></span>
            <!--{{ change_expert_id }}-->
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="7">
                  <v-text-field
                    v-model="globalSearchVal"
                    :label="`Поиск пользователя(ответственный)`"
                    prepend-inner-icon="mdi-magnify"
                    required
                    hide-details
                    outlined
                    dense
                    @keyup.enter="globalSearch()"
                  ></v-text-field>
                  <v-chip
                    class="ma-2"
                    color="green"
                    outlined
                    v-if="dialogData.last_name || dialogData.first_name"
                  >
                    <v-icon left> mdi-account-circle-outline </v-icon>
                    {{ dialogData.last_name + "   " + dialogData.first_name }}
                  </v-chip>

                  <v-list dense rounded>
                    <v-list-item-group v-model="selectedItem" color="primary">
                      <v-list-item
                        v-for="item in searchEmployee"
                        :key="item.id"
                        @click="selectUser(item)"
                      >
                        <v-list-item-content>
                          <v-list-item-title
                            v-text="item.last_name + '   ' + item.first_name"
                          ></v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                  <!-- {{new_expert_type}} -->
                  <v-select
                    :items="expert_types"
                    label="Тип*"
                    required
                    item-text="expert_type_name"
                    v-model="expert_type"
                    @click="filter"
                    return-object
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="closeExpertDialog()">
              Отмена
            </v-btn>
            <v-btn
              :loading="IS_SENDING_APPEAL"
              :disabled="IS_SENDING_APPEAL || disabledBtn || !expert_type"
              color="green"
              text
              @click="addExpert()"
            >
              Добавить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
  components: {},

  data() {
    return {
      disabledBtn: true,
      disabledTrashBtn: false,
      tableHeadersExpert: [
        { text: "Роль", value: "expert_type_name" },
        { text: "Пользователь", value: "user_name" },
        { text: "Департамент", value: "department_name" },
        { text: "", value: "action", align: "end", width: "20%" },
      ],
      tableHeadersGroups: [
        { text: "№", value: "id" },
        { text: "Название группы", value: "name" },
        { text: "", value: "action", align: "end", width: "20%" },
      ],

      appeal_secretary_list: [],

      experts: [],
      selectedExpertGroup: null,

      dialogGroup: false,
      groupName: "",

      dialogAddExpert: false,
      selectedItem: "",
      searchEmployee: [],
      globalSearchVal: "",
      dialogData: {},
      expert_types: [
        { expert_type: 1, expert_type_name: "Участник ЭС" },
        { expert_type: 2, expert_type_name: "Секретарь ЭС" },
        { expert_type: 3, expert_type_name: "Председатель ЭС" },
      ],
      expert_type: null,
    };
  },
  computed: {
    ...mapGetters(["APPEALS", "EXPERT_GROUPS", "IS_SENDING_APPEAL"]),
  },
  methods: {
    ...mapActions([
      "GET_APPEALS_FROM_API",
      "GET_APPEAL_TYPES_FROM_API",
      "GET_SECRETARY_LIST",
      "POST_EXPERTGROUP_TO_API",
      "DELETE_EXPERTGROUP_FROM_API",
    ]),

    async getSecretaryList() {
      let { data: array } = await this.axios.get(
        "/api/1.0/lov/ref.sys_all_const",
        { params: { name: "appealSecretaryList" } }
      );
      this.appeal_secretary_list = array[0].const_value
        .split(",")
        .reduce((acc, item) => {
          acc.push(item);
          return acc;
        }, []);
    },

    selectGroup(item) {
      this.selectedExpertGroup = item;
      this.experts = item.experts;
    },
    closeGroupDialog() {
      this.dialogGroup = false;
      this.groupName = "";
    },
    async createGroup() {
      this.POST_EXPERTGROUP_TO_API({ expert_group_name: this.groupName });
      this.$swal({
        ...this.$optionAlert.fire,
        icon: "success",
        title: "Сохранено",
      });

      this.closeGroupDialog();
    },
    async deleteGroup(item) {
      this.$swal({
        title: `Вы действительно хотите удалить группу "${item.name}"?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.DELETE_EXPERTGROUP_FROM_API({
            expert_group_id: item.id,
          });
          this.experts = [];
          this.selectedExpertGroup = null;
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "success",
            title: "Удалено",
          });

                  }
      });
    },
    async globalSearch() {
      let params = {
        text: this.globalSearchVal,
        without_performers: true,
      };
      this.axios.get(`/api/1.0/search`, { params }).then((data) => {
        data.data = data.data.filter((i) => !i.is_edited_employee);
        this.searchEmployee = data.data;
      });
    },
    async selectUser(item) {
      if (this.experts.find((el) => el.user_id == item.id)) {
        this.disabledBtn = true;
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 500,
          title: "Пользователь уже в группе ЭС",
        });
      } else {
        this.dialogData.user = item;
        this.dialogData.last_name = item.last_name;
        this.dialogData.first_name = item.first_name;
        this.searchEmployee = [];
        this.globalSearchVal = "";
        this.disabledBtn = false;
      }
    },
    closeExpertDialog() {
      this.dialogAddExpert = false;
      this.dialogData = {};
      this.disabledBtn = true;
      this.expert_type = null;
      this.selectedItem = "";
    },
    async addExpert() {
        this.disabledBtn = true;
    try {
        await this.axios.post(`/api/1.0/appeal/expert_group/expert/ref`, {
            expert_group_id: this.selectedExpertGroup.id,
            expert_user_id: this.dialogData.user.id,
            expert_type_id: this.expert_type.expert_type,
        });
        this.$swal({
            ...this.$optionAlert.fire,
            icon: "success",
            title: "Добавлен",
            timer: 2000,
        }).then(async () => {
            await this.GET_APPEAL_TYPES_FROM_API();
            this.closeExpertDialog();
        });
        }catch {
            this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            title: "Ошибка добавления",
            timer: 2000,
        })
        }

          },
    async deleteExpert(item) {
      this.$swal({
        title: `Вы действительно хотите удалить эксперта ${item.user_name}?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.disabledTrashBtn = true;
          await this.axios.put(
            `/api/1.0/appeal/expert_group/expert/ref/${item.id}`,
            {
              expert_group_id: this.selectedExpertGroup.id,
              expert_user_id: item.user_id,
            }
          );
          this.$swal({
            ...this.$optionAlert.fire,
            icon: "success",
            title: "Удален",
            timer: 2000,
          }).then(async () => {
            await this.GET_APPEAL_TYPES_FROM_API();
            this.closeExpertDialog();
          });
        }
      });
    },
    filter() {
      let temp = [
        { expert_type: 1, expert_type_name: "Участник ЭС" },
        { expert_type: 2, expert_type_name: "Секретарь ЭС" },
        { expert_type: 3, expert_type_name: "Председатель ЭС" },
      ];
      if (
        this.experts.find(
          (el) => el.expert_type == 2 || el.appeal_expert_type_id == 2
        )
      ) {
        temp = temp.filter((el) => el.expert_type != 2);
      }
      if (
        this.experts.find(
          (el) => el.expert_type == 3 || el.appeal_expert_type_id == 3
        )
      ) {
        temp = temp.filter((el) => el.expert_type != 3);
      }
      this.expert_types = temp;
    },
  },
  async created() {
    await this.getSecretaryList();

  },
  watch: {
    "$store.state.appeal.appeal_expert_groups"() {
      if(this.selectedExpertGroup){
        let data = this.EXPERT_GROUPS.find(
        (el) => el.id == this.selectedExpertGroup.id
      );
      this.selectGroup(data);
      this.disabledTrashBtn = false;
      }

          },
  },
};
</script>