<template>
  <v-row class="mt-2">
    <v-col
      v-if="appeal_data.appeal_status_id == 2"
      class="d-flex alighn-center"
      cols="3"
    >
      <v-select
        v-model="selectedExpertGroup"
        :items="ACTIVE_EXERT_GROUPS"
        item-text="name"
        label="Экспертная группа"
        return-object
        @change="getExperts(selectedExpertGroup)"
      ></v-select>
    </v-col>
    <v-col cols="6">
      <v-btn
        v-if="
          appeal_secretary_list.includes($userData.id) &&
          (appeal_data.appeal_status_id == 2 ||
            appeal_data.appeal_status_id == 4 ||
            appeal_data.appeal_status_id == 44)
        "
        @click="dialogAddExpert = true"
        class="ml-1"
        outlined
        color="green"
        >Добавить участника</v-btn
      >
    </v-col>

    <v-col cols="12" class="pt-0">
      <v-data-table
        no-data-text="Нет данных"
        :headers="appeal_data.appeal_status_id == 2?tableHeaders:tableHeadersDetail"
        :items="experts"
        max-width="200px"
        class="elevation-1"
        :items-per-page="15"
        ><template v-slot:[`item.update_date`]="{ item }">
          <span>{{
            $moment(new Date(item.update_date + "+0000")).format(
              "DD.MM.YYYY"
            )
          }}</span>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-btn
            v-if="
              appeal_secretary_list.includes($userData.id) &&
              (appeal_data.appeal_status_id == 4 ||
                appeal_data.appeal_status_id == 44) &&
              item.user_id != $userData.id
            "
            :loading="IS_SENDING_APPEAL"
            :disabled="IS_SENDING_APPEAL"
            icon
            @click="openChangeExpertDialog(item)"
          >
            <v-icon>mdi-account-convert</v-icon>
          </v-btn>
          <v-btn
            v-if="
              appeal_secretary_list.includes($userData.id) &&
              (appeal_data.appeal_status_id == 2 ||
                appeal_data.appeal_status_id == 4 ||
                appeal_data.appeal_status_id == 44) &&
              item.user_id != $userData.id
            "
            v-show="
              item.appeal_expert_type_id != 3 && item.appeal_expert_type_id != 2
            "
            :loading="IS_SENDING_APPEAL"
            :disabled="IS_SENDING_APPEAL"
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
            <v-btn color="error" text @click="dialogGroup = false">
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
            <span
              class="text-h5"
              v-text="
                `${change_expert_id ? 'Замена' : 'Добавить'} участника ЭС ${
                  change_expert_id ? change_expert_id.user_name : ''
                }`
              "
            ></span>
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
                    v-if="!change_expert_id"
                    :items="expert_types"
                    label="Тип*"
                    required
                    item-text="expert_type_name"
                    v-model="new_expert_type"
                    @click="filter"
                    return-object
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              text
              @click="
                dialogAddExpert = false;
                dialogData = {};
                disabledBtn = true;
                new_expert_type = null;
                change_expert_id = null;
              "
            >
              Отмена
            </v-btn>
            <v-btn
              v-if="!change_expert_id"
              :loading="IS_SENDING_APPEAL"
              :disabled="IS_SENDING_APPEAL || disabledBtn || !new_expert_type"
              color="green"
              text
              @click="addExpert()"
            >
              Добавить
            </v-btn>
            <v-btn
              v-if="change_expert_id"
              :loading="IS_SENDING_APPEAL"
              :disabled="IS_SENDING_APPEAL || disabledBtn"
              color="green"
              text
              @click="changeExpert()"
            >
              Заменить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-row>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  components: {},
  props: ["appeal_data"],
  data() {
    return {
      tableHeadersDetail: [
        { text: "Роль", value: "expert_type_name" },
        { text: "Пользователь", value: "user_name" },
        { text: "Департамент", value: "department_name" },
        { text: "Обновил", value: "update_user_name" },
        { text: "Дата обновления", value: "update_date" },
        { text: "Заменяет", value: "parent_expert_name" },
        { text: "", value: "action" },
      ],
      tableHeaders: [
        { text: "Роль", value: "expert_type_name" },
        { text: "Пользователь", value: "user_name" },
        { text: "Департамент", value: "department_name" },
        { text: "", value: "action" },
      ],
      experts: [],
      selectedExpertGroup: null,

      dialogGroup: false,
      groupName: "",

      dialogAddExpert: false,
      globalSearchVal: "",
      searchEmployee: [],
      selectedItem: "",
      search: "",
      dialogData: {},
      disabledBtn: true,
      expert_types: [
        { expert_type: 1, expert_type_name: "Участник ЭС" },
        { expert_type: 2, expert_type_name: "Секретарь ЭС" },
        { expert_type: 3, expert_type_name: "Председатель ЭС" },
      ],

      new_expert_type: null,

      appeal_secretary_list: [],

      change_expert_id: null,
    };
  },
  computed: {
    ...mapGetters([
      "EXPERT_GROUPS",
      "IS_SENDING_APPEAL",
      "ACTIVE_EXERT_GROUPS",
      "SECRETARY_LIST",
      "APPEAL_VOTES",
    ]),
  },
  methods: {
    ...mapActions([
      "POST_EXPERTGROUP_TO_API",
      "POST_EXPERT_TO_API",
      "GET_APPEAL_TYPES_FROM_API",
      "DELETE_EXPERT_TO_API",
      "DELETE_EXPERTGROUP_FROM_API",
    ]),
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
    getExperts(group) {
      this.experts = group.experts;
      this.$emit("changeSelectedGroup", group);
      this.$emit("changeExperts", group.experts);
    },

        async createGroup() {
      this.POST_EXPERTGROUP_TO_API({ expert_group_name: this.groupName });
      this.$swal({
        ...this.$optionAlert.fire,
        icon: "success",
        title: "Сохранено",
      });

      this.dialogGroup = false;
    },
    async deleteGroup() {
      this.$swal({
        ...this.$optionAlert.fire,
        icon: "success",
        title: "Сохранено",
      });

      this.$swal({
        title: `Вы действительно хотите удалить группу "${this.selectedExpertGroup.name}"?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Да",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.DELETE_EXPERTGROUP_FROM_API({
            expert_group_id: this.selectedExpertGroup.id,
          });
        }
      });
      (this.experts = []), (this.dialogGroup = false);
    },
    async deleteExpert(item) {
      if (this.APPEAL_VOTES.find((el) => el.user_id == item.user_id)) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 500,
          title: "Нельзя удалить проголосовавшего эксперта",
        });
      } else {
        this.$swal({
          title: `Вы действительно хотите удалить участника "${item.user_name}"?`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Отмена",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Да",
        }).then(async (result) => {
          if (result.isConfirmed) {
            if (this.appeal_data.appeal_status_id == 2) {
              this.experts = this.experts.filter(
                (el) => el.user_id != item.user_id
              );
              this.$emit("changeExperts", this.experts);
            } else {
              this.DELETE_EXPERT_TO_API({
                appeal_id: this.appeal_data.id,
                expert_user_id: item.user_id,
              });
              this.$emit("updateData");
            }
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "success",
              title: "Удалено",
            });
          }
        });
      }
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
      }
      this.disabledBtn = false;
    },

    async addExpert() {
      if (
        !this.appeal_secretary_list.find(
          (el) => el == this.dialogData.user.id
        ) &&
        this.new_expert_type.expert_type == 2
      ) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 500,
          title:
            "Данный пользователь не входит в список утвержденных секретарей ЭС",
        });
      } else {
        if (this.appeal_data.appeal_status_id == 2) {
          this.experts.push({
            expert_user_id: this.dialogData.user.id,
            expert_group_id: this.selectedExpertGroup
              ? this.selectedExpertGroup.id
              : -1,
            expert_type: this.new_expert_type.expert_type,
            expert_type_name: this.new_expert_type.expert_type_name,
            user_name:
              this.dialogData.last_name + " " + this.dialogData.first_name,
            department_name: this.dialogData.user.department_name,
            user_id: this.dialogData.user.id,
          });
          this.$emit("changeExperts", this.experts);
        } else {
          await this.POST_EXPERT_TO_API({
            expert_user_id: this.dialogData.user.id,
            expert_group_id: this.selectedExpertGroup
              ? this.selectedExpertGroup.id
              : -1,
            expert_type: this.new_expert_type.expert_type,
            appeal_id: this.appeal_data.id,
          });
          this.$emit("updateData");
        }

        this.$swal({
          ...this.$optionAlert.fire,
          icon: "success",
          title: "Участник добавлен",
        });

        this.dialogAddExpert = false;
        this.dialogData = {};
        this.disabledBtn = true;
        this.new_expert_type = null;
      }
    },
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
    openChangeExpertDialog(item) {
      if (this.APPEAL_VOTES.find((el) => el.user_id == item.user_id)) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 500,
          title: "Нельзя заменить проголосовавшего эксперта",
        });
      } else {
        this.change_expert_id = item;
        this.dialogAddExpert = true;
      }
    },
    async changeExpert() {
      if (
        !this.appeal_secretary_list.find(
          (el) => el == this.dialogData.user.id
        ) &&
        this.change_expert_id.appeal_expert_type_id == 2
      ) {
        return this.$swal({
          ...this.$optionAlert.fire,
          icon: "error",
          timer: 5000,
          width: 500,
          title:
            "Данный пользователь не входит в список утвержденных секретарей ЭС",
        });
      } else {
        await this.POST_EXPERT_TO_API({
          expert_user_id: this.dialogData.user.id,
          expert_group_id: this.selectedExpertGroup
            ? this.selectedExpertGroup.id
            : -1,
          expert_type: this.change_expert_id.appeal_expert_type_id,
          appeal_id: this.appeal_data.id,
          parent_appeal_expert_id: this.change_expert_id.user_id,
        });
        this.DELETE_EXPERT_TO_API({
          appeal_id: this.appeal_data.id,
          expert_user_id: this.change_expert_id.user_id,
        });
        this.change_expert_id = null;
        this.dialogAddExpert = false;
        this.dialogData = {};
        this.disabledBtn = true;
        this.new_expert_type = null;
        this.$emit("updateData");
      }
    },
  },
  mounted() {
    if (this.appeal_data.expert_group_id) {
      let group = this.EXPERT_GROUPS.find(
        (el) => el.id == this.appeal_data.expert_group_id
      );
      this.experts = group.experts;
    }
    if (this.appeal_data.appeal_status_id != 2) {
      this.experts = this.appeal_data.experts;
    }
    this.getSecretaryList();
  },

  watch: {
    appeal_data() {
      this.experts = this.appeal_data.experts;
    },
  },
};
</script>