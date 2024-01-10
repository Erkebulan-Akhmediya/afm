<template>
    <div v-if="$isAdminRules($userData.role, 'kpi')" class="admin-kpi">
        <div class="topBar mb-4" style="display: flex; justify-content: space-between;">
                <span class="text-h4">Список табов</span>
                <v-btn
                    color="primary"
                    @click="showTabDialog()"
                    >
                    <v-icon>
                        mdi-plus
                    </v-icon>
                    Добавить таб
                </v-btn>
            <v-dialog v-model="isTabDialog" width="850">
                <v-card class="dialogTab">
                    <v-card-title style="background-color: #1976d2;">
                    <span class="text-h5">{{isEditDialogTab ? `Редактировать таб №${tabDialogData.id}` : 'Добавить таб'}}</span>
                    </v-card-title>
                    <v-card-text style="padding: 30px;">
                    <v-form>
                        <v-row>
                            <v-col cols="6">
                            <v-text-field
                                v-model="tabDialogData.name_rus"
                                :label="`Заголовок на Русском`"
                                required
                                hide-details
                                outlined
                            ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                            <v-text-field
                                v-model="tabDialogData.name_kaz"
                                :label="`Заголовок на Казахском`"
                                hide-details
                                required
                                outlined
                            ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                            <v-text-field
                                v-model="tabDialogData.view_priority"
                                :label="`Приоритет отображения`"
                                required
                                outlined
                            ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="error" text @click="isTabDialog = false">
                            Закрыть
                        </v-btn>
                        <v-btn color="success" text @click="sendTab"
                            :loading="isLoadSend" :disabled="isLoadSend"
                        >
                            Сохранить
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>

        <v-data-table
            :headers="tabHeader"
            :items="tabs"
            :items-per-page="10"
            class="clickableTable elevation-1 mb-4"
            :no-data-text="'Нет данных о табах KPI'"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
            @click:row="getSlide"
        >
        
        <template v-slot:[`item.view_priority`]="{ item }">
            <span>{{item.view_priority || 0}}</span>   
        </template>
        <template v-slot:[`item.action`]="{ item }">
            <div style="display: flex;">
                <v-btn
                    icon
                    class="ma-2"
                    @click="showSlideDialog(item)"
                >
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click="showTabDialog(item)"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click="deleteTab(item)"
                >
                    <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
            </div>
        </template>
        <template v-slot:[`item.create_date`]="{ item }">
            <span>{{$moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        <template v-slot:[`item.update_date`]="{ item }">
            <span>{{$moment(new Date(item.update_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        </v-data-table>

        <span class="text-h4 mb-2">Список слайдов</span>
        <v-data-table
            :loading="isLoadingSlides"
            :headers="slideHeader"
            :items="slides"
            :items-per-page="10"
            class="clickableTable elevation-1"
            :no-data-text="'Нет данных о слайдах KPI'"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
        <template v-slot:[`item.image`]="{ item }">
            <div style="padding: 10px 0;">
                <img :src="item.src" alt=""> 
            </div>
        </template>
        <template v-slot:[`item.action`]="{ item }">
            <div style="display: flex;">
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="showSlideDialog(item, true)"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="ma-2"
                    @click.stop="deleteSlide(item)"
                >
                    <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
            </div>
        </template>
        <template v-slot:[`item.create_date`]="{ item }">
            <span>{{$moment(new Date(item.create_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        <template v-slot:[`item.update_date`]="{ item }">
            <span>{{$moment(new Date(item.update_date + '+0000')).format('DD.MM.YYYY HH:mm:ss')}}</span>   
        </template>
        </v-data-table>
        
            <v-dialog v-model="isSlideDialog" width="850">
                <v-card class="dialogTab">
                    <v-card-title style="background-color: #1976d2;">
                    <span class="text-h5">{{isEditDialogSlide ? `Редактировать слайд №${slideDialogData.id}` : 'Добавить слайд'}}</span>
                    </v-card-title>
                    <v-card-text style="padding: 30px;">
                    <v-form>
                        <v-row>
                            <v-col cols="6">
                            <v-text-field
                                v-model="slideDialogData.name_rus"
                                :label="`Заголовок на Русском`"
                                required
                                hide-details
                                outlined
                            ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                            <v-text-field
                                v-model="slideDialogData.name_kaz"
                                :label="`Заголовок на Казахском`"
                                hide-details
                                required
                                outlined
                            ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                            <v-text-field
                                v-model="slideDialogData.view_priority"
                                :label="`Приоритет отображения`"
                                required
                                outlined
                            ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-file-input
                                    v-model="slideDialogData.file"
                                    color="blue accent-4"
                                    counter
                                    :label="!slideDialogData.src ? `Изображение слайда` : `Изменить изображение`"
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
                                <img v-if="slideDialogData.src" :src="slideDialogData.src" alt="">
                            </v-col>
                        </v-row>
                    </v-form>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="error" text @click="isSlideDialog = false">
                            Закрыть
                        </v-btn>
                        <v-btn color="success" text @click="sendSlide"
                            :loading="isLoadSend" :disabled="isLoadSend"
                        >
                            Сохранить
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
    </div>
    <div v-else><h2>Доступ запрещен</h2></div>
</template>
<script>
export default {
    data: function() {
        return {
            tabHeader: [
                { text: '#', value: 'id'},
                { text: 'Заголовок на русском', value: 'name_rus' },
                { text: 'Заголовок на казахском', value: 'name_kaz' },
                { text: 'Создан', value: 'create_date' },
                { text: 'Обновлен', value: 'update_date' },
                { text: 'Создан', value: 'create_user' },
                { text: 'Обновлен', value: 'update_user' },
                { text: 'Приоритет отображения', value: 'view_priority' },
                { text: 'Действия', value: 'action' },
            ],
            slideHeader: [
                { text: '#', value: 'id'},
                { text: 'Заголовок на русском', value: 'name_rus' },
                { text: 'Заголовок на казахском', value: 'name_kaz' },
                { text: 'Изображение', value: 'image' },
                { text: 'Создан', value: 'create_date' },
                { text: 'Обновлен', value: 'update_date' },
                { text: 'Создан', value: 'create_user' },
                { text: 'Обновлен', value: 'update_user' },
                { text: 'Приоритет отображения', value: 'view_priority' },
                { text: 'Действия', value: 'action' },
            ],
            tabs: [],
            slides: [],

            isTabDialog: false,
            tabDialogData: {},
            isEditDialogTab: false,

            isSlideDialog: false,
            slideDialogData: {},
            isEditDialogSlide: false,
            currentTab: {},
            isLoadingSlides: false,

            isLoadSend: false,
        }
    },
    methods: {
        showSlideDialog(item, isEdit = false) {
            this.isEditDialogSlide = isEdit
            this.slideDialogData = isEdit ? item : {}
            this.isSlideDialog = true
            this.currentTab = item
        },

        async deleteTab(item) {
            this.$swal({
                title: `Вы действительно хотите удалить таб №${item.id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Удалить",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    item.is_active = false
                    try {
                        let {data} = await this.axios.post(`/api/1.0/kpi/tab/:tab_id`, {is_active: false}, {localParams: {tab_id: item.id}})
                        this.$swal({
                            ...this.$optionAlert.fire,
                            icon: "success",
                            title: `Таб №${data} удалён`,
                        });
                        await this.getAllTabs()
                        this.isTabDialog = false
                    }  catch (error) {
                        if(error.data) {
                            this.$swal({
                                ...this.$optionAlert.fire,
                                icon: "error",
                                timer: 5000,
                                width: 300,
                                title: error.data?.ERR_MSG || 'Ошибка удаления таба',
                            });
                        }
                    }
                }
            })
        },

        async sendTab() {
            const err = []
            if(!this.tabDialogData.name_rus) {
                err.push('Название на Русском обязательно')
            }
            if(!this.tabDialogData.name_kaz) {
                err.push('Название на Казахском обязательно')
            }
            if(isNaN(this.tabDialogData.view_priority) && this.tabDialogData.view_priority !== undefined) {
                err.push('Приоритет отображения должен быть числом')
            }
            if(err.length) {
                return this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    timer: 5000,
                    width: 500,
                    title: err.join('; <br>')  
                })
            }
            this.isLoadSend = true

            try {
                let {data} = await this.axios.post(`/api/1.0/kpi/tab/:tab_id`, this.tabDialogData, {localParams: {tab_id: this.tabDialogData.id || null}})

                                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: `Таб № ${data} ${this.isEditDialogTab ? 'обновлён' : 'добавлен'}` 
                })
                await this.getAllTabs()
                this.isTabDialog = false
            } catch (error) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: error.data?.ERR_MSG || `Ошибка ${this.isEditDialogTab ? 'обновления' : 'добавления'} таба`,
                })
            }
            this.isLoadSend = false
        },

        async sendSlide() {
            const err = []
            if(!this.slideDialogData.name_rus) {
                err.push('Название на Русском обязательно')
            }
            if(!this.slideDialogData.name_kaz) {
                err.push('Название на Казахском обязательно')
            }
            if(isNaN(this.slideDialogData.view_priority) && this.slideDialogData.view_priority !== undefined) {
                err.push('Приоритет отображения должен быть числом')
            }
            if((!this.slideDialogData.file || !this.slideDialogData.file.length) && !this.slideDialogData.src) {
                err.push('Изображение слайда обязательно')
            }
            if(err.length) {
                return this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    timer: 5000,
                    width: 500,
                    title: err.join('; <br>')  
                })
            }

            this.isLoadSend = true

            try { 
                const form = new FormData()
                form.append("tab_id", this.currentTab.id);
                form.append("name_rus", this.slideDialogData.name_rus);
                form.append("name_kaz", this.slideDialogData.name_kaz);
                form.append("view_priority", this.slideDialogData.view_priority || null);
                form.append("file_type_id", 5);
                form.append("fileType", 'kpislide');
                if(this.slideDialogData.file) {
                    form.append("file", this.slideDialogData.file);
                }
                let {data} = await this.axios.post(`/api/1.0/kpi/slide/:id`, form, {localParams: {id: this.slideDialogData.id || null}})

                                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: `Слайд №${data} ${this.isEditDialogSlide ? 'обновлён' : 'добавлен'}` 
                })
                this.isTabDialog = false
                this.isSlideDialog = false
                await this.getSlide(this.currentTab)
            } catch (error) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: error.data?.ERR_MSG || `Ошибка ${this.isEditDialogSlide ? 'обновления' : 'добавления'} слайда`,
                })
            }
            this.isLoadSend = false
        },

        async deleteSlide(item) {
            this.$swal({
                title: `Вы действительно хотите удалить слайд №${item.id}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Отмена",
                confirmButtonColor: "#4caf50",
                cancelButtonColor: "#d33",
                confirmButtonText: "Удалить",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    item.is_active = false
                    try {
                        let {data} = await this.axios.post(`/api/1.0/kpi/slide/:id`, {is_active: false}, {localParams: {id: item.id}})
                        this.$swal({
                            ...this.$optionAlert.fire,
                            icon: "success",
                            title: `Слайд №${data} удалён`,
                        });
                        await this.getSlide(this.currentTab)
                        this.isTabDialog = false
                    }  catch (error) {
                        if(error.data) {
                            this.$swal({
                                ...this.$optionAlert.fire,
                                icon: "error",
                                timer: 5000,
                                width: 300,
                                title: error.data?.ERR_MSG || 'Ошибка удаления слайда',
                            });
                        }
                    }
                }
            })
        },

        showTabDialog(isEdit) {
            this.tabDialogData = isEdit || {} 
            this.isEditDialogTab = isEdit ? true : false 
            this.isTabDialog = true
        },

        async getAllTabs() {
            const {data} = await this.axios.get('/api/1.0/kpi/tab', {params: {is_admin: true}})
            this.tabs = data
        },

        async getSlide(tab) {
            this.isLoadingSlides = true
            const {data} = await this.axios.get('/api/1.0/kpi/slide/:tab_id', {params: {is_admin: true}, localParams: {tab_id: tab.id}})
            await Promise.all(
                data.map(async item => {
                     item.src = await this.$getVuexStoreFile(item.id, 5);
                    return item
                })
            )
            this.slides = data
            this.isLoadingSlides = false
        }
    },
    async created() {
        await this.getAllTabs()
    }

}
</script><style lang="scss" scoped>
.topBar {
    display: flex;
    justify-content: flex-end;
}
</style>