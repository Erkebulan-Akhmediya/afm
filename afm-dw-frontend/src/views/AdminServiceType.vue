<template>
  <v-card>
    <div class="d-flex justify-space-between">
      <span class="text-h4 mb-2">Список категорий</span>
      <v-btn @click="openAddCategoryDialog"> Добавить категорию </v-btn>
    </div>
    <br />
    <v-data-table
      dense
      disable-sort
      :headers="categoryHeader"
      :items="category"
      :items-per-page="10"
      class="clickableTable"
      :loading="loading_category"
      :no-data-text="'Нет данных'"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
      @click:row="getsubcategory"
    >
      <template v-slot:[`item.need_to_be_approved`]="{ item }">
        {{ item.need_to_be_approved ? "Да" : "Нет" }}
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          small
          class="ma-2"
          color="primary"
          @click="openAddSubcategoryDialog"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="ma-2"
          color="primary"
          @click="openEditCategoryDialog(item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="ma-2"
          color="red"
          @click="deleteCategory(item.id)"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <div class="d-flex justify-space-between">
      <span class="text-h4 mb-2"
        >Список подкатегорий
        <span v-if="selected_category"
          >категории: {{ selected_category.name }}</span
        >
      </span>
    </div>
    <br />
    <v-data-table
      dense
      disable-sort
      :headers="subcategoryHeader"
      :items="selected_category.subcategory"
      :items-per-page="10"
      :loading="loading_subcategory"
      :no-data-text="selected_category.id ? 'Нет данных' : 'Выберите категорию'"
      :footer-props="{
        itemsPerPageText: $t('globalWords.itemsPerPage'),
      }"
    >
      <template v-slot:[`item.action`]="{ item }">
        <v-btn
          icon
          small
          class="ma-2"
          color="primary"
          @click="
            openEditSubcategoryDialog(item);
            getCharacteristics();
          "
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="ma-2"
          color="red"
          @click="deleteSubcategory(item.id)"
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="addCategoryDialog" width="800">
      <v-card>
        <v-card-title>
          <span v-if="editingCategory.id">Редактировать категорию</span>
          <span v-else>Добавить категорию</span>
        </v-card-title>
        <v-card-text v-if="editingCategory">
          <v-text-field
            v-model="editingCategory.name_rus"
            label="Наименование на русском"
          >
          </v-text-field>
          <v-text-field
            v-model="editingCategory.name_kaz"
            label="Наименование на казахском"
          >
          </v-text-field>
          <v-checkbox
            v-model="editingCategory.need_to_be_approved"
            label="Необходимость в согласовании"
          >
          </v-checkbox>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="addCategoryDialog = false">
            Отмена
          </v-btn>
          <v-btn color="green" text @click="sendCategory"> Сохранить </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addSubcategoryDialog" width="800">
      <v-card>
        <v-card-title>
          <span v-if="editingSubcategory.id">Редактировать подкатегорию</span>
          <span v-else>Добавить подкатегорию</span>
        </v-card-title>
        <v-card-text v-if="editingSubcategory">
          <v-text-field
            v-model="editingSubcategory.name_rus"
            label="Наименование на русском"
          >
          </v-text-field>
          <v-text-field
            v-model="editingSubcategory.name_kaz"
            label="Наименование на казахском"
          >
          </v-text-field>
        </v-card-text>
        <v-card-title v-text="'Дополнительные поля'"> </v-card-title>
        <v-card-text v-if="editingSubcategory.id">
          <v-row>
            <v-col cols="9">
              <v-text-field
                v-model="new_characteristic_name"
                label="Добавить поле"
              >
              </v-text-field>
            </v-col>
            <v-col cols="3">
              <v-btn
                color="primary"
                outlined
                @click="addCharacteristic()"
                :disabled="is_characteristic_sending"
                :loading="is_characteristic_sending"
              >
                <v-icon class="mr-2"> mdi-plus </v-icon>
                Добавить
              </v-btn>
            </v-col>

            <v-col cols="12">
              <v-list>
                <v-list-item v-for="item in characteristics" :key="item.id">
                  <v-list-item-content>
                    <v-list-item-title v-text="item.name"></v-list-item-title>

                    <!-- <v-list-item-subtitle v-text="folder.subtitle"></v-list-item-subtitle> -->
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon>
                      <v-icon
                        @click="delCharacteristic(item.id)"
                        color="grey lighten-1"
                        :disabled="is_characteristic_sending"
                        :loading="is_characteristic_sending"
                        >mdi-close</v-icon
                      >
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="addSubcategoryDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn color="green" text @click="sendSubcategory"> Сохранить </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      categoryHeader: [
        { text: "#", sortable: false, value: "id" },
        { text: "Наименование на русском", value: "name_rus" },
        { text: "Наименование на казахском", value: "name_kaz" },
        { text: "Требует согласования", value: "need_to_be_approved" },
        { text: "", value: "action", align: "end", width: "20%" },
      ],
      subcategoryHeader: [
        { text: "#", sortable: false, value: "id" },
        { text: "Наименование на русском", value: "name_rus" },
        { text: "Наименование на казахском", value: "name_kaz" },
        { text: "", value: "action", align: "end", width: "20%" },
      ],
      category: [],
      loading_category: true,
      loading_subcategory: false,

      selected_category: {},

      editingCategory: {},
      editingSubcategory: {},
      addCategoryDialog: false,
      addSubcategoryDialog: false,

      new_characteristic_name: "",
      is_characteristic_sending: false,
      characteristics: [],
    };
  },
  async mounted() {
    await this.getCategory();
  },
  methods: {
    async getCharacteristics() {
      try {
        let { data } = await this.axios.get(
          `/api/1.0/servicerequests/characteristic/${this.editingSubcategory.id}/0`
        );
        this.characteristics = data;
      } catch (err) {
        console.log(err);
      }
    },
    async addCharacteristic() {
      this.is_characteristic_sending = true;
      try {
        let payload = { name: this.new_characteristic_name };
        await this.axios.post(
          `/api/1.0/servicerequests/characteristic/${this.editingSubcategory.id}`,
          payload
        );
        this.getCharacteristics();
      } catch (err) {
        console.log(err);
      } finally {
        this.is_characteristic_sending = false;
      }
      this.new_characteristic_name = "";
    },
    async delCharacteristic(id) {
      this.is_characteristic_sending = true;
      this.$swal({
        title: `Вы действительно хотите удалить характеристику №${id}?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Отмена",
        confirmButtonColor: "#4caf50",
        cancelButtonColor: "#d33",
        confirmButtonText: "Удалить",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await this.axios.put(
              `/api/1.0/servicerequests/characteristic/${id}`
            );
            this.getCharacteristics();
          } catch (err) {
            console.log(err);
          } finally {
            this.is_characteristic_sending = false;
          }
        }
      });
    },
    openAddCategoryDialog() {
      this.editingCategory = {
        name_kaz: "",
        name_rus: "",
        need_to_be_approved: false,
      };
      this.addCategoryDialog = true;
    },
    openEditCategoryDialog(item) {
      this.editingCategory = item;
      this.addCategoryDialog = true;
    },
    async getCategory() {
      try {
        this.loading_category = true;
        let { data } = await this.axios.get(`/api/1.0/service-admin/category`);
        this.category = data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading_category = false;

        this.selected_category = {};
        this.selected_category.subcategory = [];
      }
    },
    async sendCategory() {
      try {
        if (this.editingCategory.id) {
          await this.axios.put(
            `/api/1.0/service-admin/category`,
            this.editingCategory
          );
        } else {
          await this.axios.post(
            `/api/1.0/service-admin/category`,
            this.editingCategory
          );
        }

        this.getCategory();
      } catch (err) {
        console.error(err);
      } finally {
        this.addCategoryDialog = false;
      }
    },
    openAddSubcategoryDialog() {
      this.editingSubcategory = {
        name_kaz: "",
        name_rus: "",
      };
      this.addSubcategoryDialog = true;
    },
    openEditSubcategoryDialog(item) {
      this.editingSubcategory = item;
      this.addSubcategoryDialog = true;
    },
    async sendSubcategory() {
      try {
        if (this.editingSubcategory.id) {
          await this.axios.put(`/api/1.0/service-admin/subcategory`, {
            sr_category_id: this.selected_category.id,
            ...this.editingSubcategory,
          });
        } else {
          await this.axios.post(`/api/1.0/service-admin/subcategory`, {
            sr_category_id: this.selected_category.id,
            ...this.editingSubcategory,
          });
        }

        this.getsubcategory(this.selected_category);
      } catch (err) {
        console.error(err);
      } finally {
        this.addSubcategoryDialog = false;
      }
    },
    deleteCategory(id) {
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
            await this.axios.put(`/api/1.0/service-admin/category/${id}`);
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "success",
              timer: 5000,
              width: 300,
              title: `Запись удалена`,
            });
            this.getCategory();
          } catch (error) {
            if (error.data) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                timer: 5000,
                width: 300,
                title: error.data?.ERR_MSG,
              });
            }
            console.error(error);
          }
        }
      });
    },
    deleteSubcategory(id) {
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
            await this.axios.put(`/api/1.0/service-admin/subcategory/${id}`);
            this.$swal({
              ...this.$optionAlert.fire,
              icon: "success",
              timer: 5000,
              width: 300,
              title: `Запись удалена`,
            });
            this.getsubcategory(this.selected_category);
          } catch (error) {
            if (error.data) {
              this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                timer: 5000,
                width: 300,
                title: error.data?.ERR_MSG,
              });
            }
            console.error(error);
          }
        }
      });
    },
    async getsubcategory(category) {
      this.selected_category = category;
      try {
        this.loading_subcategory = true;

        let localParams = {
          category_id: category.id,
        };
        let { data } = await this.axios.get(
          `/api/1.0/service-admin/subcategory/:category_id`,
          { localParams }
        );
        this.selected_category.subcategory = data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading_subcategory = false;

      }
    },
  },
};
</script><style lang="scss">
.clickableTable tr {
  cursor: pointer;
}
</style>