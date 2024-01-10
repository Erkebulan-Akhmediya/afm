<template>
    <div class="mainAppsPage">
        <v-row style="border-bottom:2px solid #EBEFF2; margin-bottom: 10px">
            <v-col cols="12" class="d-flex align-center ma-0 pa-0 pt-3 pb-1">
                <span style="font-weight: bold; font-size: 1rem;">Информационные ресурсы</span>
            </v-col>
        </v-row>

        <v-row justify="space-around">
            <v-col 
                v-for="(item, i) in appData"
                :key="i"
                cols="auto"
            >
                <v-card outlined color="transparent"
                    width="100"
                    class="ma-0 pa-0"
                    
                > 
                    <img :src="item.src" style="border-radius: 50%; cursor: pointer; object-fit: cover; width: 100px; height: 100px;" class="oneApps" @click="openApp(item.url_address)"/>
                    
                    <div v-if="item.description_rus && item.description_rus.trim() != ''">
                        <v-tooltip bottom >
                            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on" style="padding-top: 10px; padding-bottom: 5px; font-size: 14px; color: #252C32; text-align: center; display: block;">{{item.name_rus}}</span>
                            </template>
                            <span style="display:block; width:150px; word-wrap:break-word; text-align: center; font-size: 14px;">{{item.description_rus}}</span>
                        </v-tooltip>
                    </div>
                    <div v-else>
                        <span v-bind="attrs" v-on="on" style="padding-top: 10px; padding-bottom: 5px; font-size: 14px; color: #252C32; text-align: center; display: block;">{{item.name_rus}}</span>
                    </div>
                    
                    
                </v-card>
            </v-col>
        </v-row>

        <v-dialog v-model="isSlideDialog" width="850">
            <v-card class="dialogTab">
                <v-card-title style="background-color: #1976d2;">
                <span class="text-h5">{{isEditDialogSlide ? `Редактировать ресурс №${slideDialogData.id}` : 'Добавить ресурс'}}</span>
                </v-card-title>
                <v-card-text style="padding: 30px;">
                    <v-form>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="slideDialogData.name_rus"
                                    :label="`Наименование на Русском`"
                                    required
                                    hide-details
                                    outlined
                                ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="slideDialogData.name_kaz"
                                    :label="`Наименование на Казахском`"
                                    hide-details
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="slideDialogData.description_rus"
                                    :label="`Описание на Русском`"
                                    required
                                    hide-details
                                    outlined
                                ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="slideDialogData.description_kaz"
                                    :label="`Описание на Казахском`"
                                    hide-details
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="slideDialogData.url_address"
                                    :label="`URL-адрес`"
                                    hide-details
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-file-input
                                    v-model="slideDialogData.file"
                                    color="blue accent-4"
                                    counter
                                    :label="!slideDialogData.src ? `Изображение ресурса` : `Изменить изображение`"
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
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-checkbox
                                    v-model="slideDialogData.is_active"
                                    label="Активный ресурс"
                                    color="success"
                                    hide-details
                                ></v-checkbox>
                            </v-col>
                            <img v-if="slideDialogData.src" :src="slideDialogData.src" alt="">
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="isSlideDialog = false">
                        Закрыть
                    </v-btn>
                    <v-btn color="success" text @click="sendApp"
                        :loading="isLoadSend" :disabled="isLoadSend"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import moment from 'moment'
export default {
    data: () => ({
        moment,
        dialog: false,
        dialogData: '',
        src: '',
        imageLoader: false,

        appData: [],
        isSlideDialog: false,
        isEditDialogSlide: false,
        slideDialogData: {},
        isLoadSend: false,
    }),
    methods: {

        openApp(url) {
            window.open(url, '_blank');
        },
        async getApps() {
            try {
                let params = {}
                let data = await this.axios.get(`/api/1.0/application`, {params})
                data.data = data.data.filter(i=>i.is_active)
                data.data = data.data.filter(i=>i.is_main_page)
                this.$set(this, 'appData', data.data)
                await Promise.all(
                    data.data.map(async item => {
                         let a = await this.$getVuexStoreFile(item.id, 6);
                        this.$set(item, 'src', a ? a : require('@/assets/img/default_logo.jpeg'))
                    })
                )
            } catch (error) {
                console.log(error)
            }
        },
        async sendApp() {
            const err = []

            if(!this.slideDialogData.name_rus) {
                err.push('Название на Русском обязательно')
            }
            if(!this.slideDialogData.name_kaz) {
                err.push('Название на Казахском обязательно')
            }
            if(!this.slideDialogData.url_address) {
                err.push('Название на URL-адрес')
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
                form.append("name_rus", this.slideDialogData.name_rus);
                form.append("name_kaz", this.slideDialogData.name_kaz);
                form.append("description_rus", this.slideDialogData.description_rus);
                form.append("description_kaz", this.slideDialogData.description_kaz);
                form.append("url_address", this.slideDialogData.url_address);
                form.append("is_active", this.slideDialogData.is_active);
                form.append("file_type_id", 6);
                form.append("fileType", 'appslogo');
                if(this.slideDialogData.file) {
                    form.append("file", this.slideDialogData.file);
                }
                let {data} = await this.axios.post(`/api/1.0/application/:id`, form, {localParams: {id: this.slideDialogData.id || null}})
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'success',
                    title: `Ресурс №${data} ${this.isEditDialogSlide ? 'обновлён' : 'добавлен'}` 
                })
                this.isTabDialog = false
                this.isSlideDialog = false
                await this.getApps()
            } catch (error) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: error.data?.ERR_MSG || `Ошибка ${this.isEditDialogSlide ? 'обновления' : 'добавления'} ресурса`,
                })
            }
            this.isLoadSend = false
        },
        showSlideDialog(item, isEdit = false) {
            this.isEditDialogSlide = isEdit
            this.slideDialogData = isEdit ? item : {}
            this.isSlideDialog = true
        },
    },
    watch: {
        dialog(newVal) {
            if (!newVal) {
                this.dialogData = ''
            }
        },
    },
    created() {
        this.getApps()
    },
    props: ['allEvents', 'eventsParams']
}
</script><style scoped lang="scss">
    .mainAppsPage {
        background: #fff; 
        
        padding-top: 10px;
        padding-right: 30px;
        padding-bottom: 0px;
        padding-left: 30px;

        border-radius: 10px;
    }
    .oneApps {
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.12);
        transition: 0.35s;
        
        &:hover {
            box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.18);
            transition: 0.35s;
        }
    }
</style>