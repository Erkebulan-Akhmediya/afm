<template>
    <div class="properties">
        <h2>Информационные ресурсы</h2>
        <br/>

        <v-row justify="start">
            <v-col 
                v-for="(item, i) in appData"
                :key="i"
                cols="auto"
            >
                <v-card 
                    class="mx-auto" 
                    width="350"
                    min-height="180"
                > <!--width="240" min-height="115"-->
                    <!--<v-list-item>
                        <v-list-item-content >
                            <v-list-item-title class="text-h6 mb-3 text-wrap text-center" v-text="item.name"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-divider></v-divider>

                    <v-card-actions class="justify-center">
                        <v-btn text color="green accent-4 align-center justify-center text-center" @click="openApp(item.url_address)">Запустить</v-btn>
                        
                    </v-card-actions>-->
                    <!--<span>asd</span>-->

                    <v-list-item two-line >
                        <v-list-item-content >
                            <span v-if="!item.is_active" style="color: red; font-size: 14px">Неактивный</span>
                            <v-list-item-title class="text-h6 mb-3 text-wrap" v-text="item.name_rus"></v-list-item-title>
                            <v-list-item-subtitle class="text-wrap" v-text="item.description_rus"></v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-avatar
                            size="90"
                        > <!--v-if="item.src != ``"-->
                            <v-img :src="item.src"></v-img>
                        </v-list-item-avatar>

                        <!--<v-list-item-avatar
                            v-else
                            size="90"
                            color="grey lighten-1"
                        >
                            <v-img>
                                <p 
                                    style="position: absolute; left: 50%; top: 50%; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%);
                                    color: white; font-size: 20px;">
                                    LOGO
                                </p>
                            </v-img>
                        </v-list-item-avatar>-->
                    </v-list-item>

                    <v-card-actions>
                        <v-btn text color="green accent-4" @click="openApp(item.url_address)">Запустить</v-btn>
                        <v-btn v-if="checkRole()" text color="orange accent-4" @click="showSlideDialog(item, true)">Настроить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col 
                v-if="checkRole()"
                cols="auto"
            >
                <v-card 
                    width="350"
                    min-height="180"
                    outlined
                    style="border: 3px dashed lightgrey;" 
                >
                    
                    <v-btn
                        plain
                        large
                        color="lightgrey"
                        style="position: absolute; left: 50%; top: 50%; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%);"
                        @click="showSlideDialog()"
                    >
                        ДОБАВИТЬ
                    </v-btn>
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
import checkRoles from '@/utils/check_role'
export default {
    components: { },
    data() {
        return {
            appData: [],
            isSlideDialog: false,
            isEditDialogSlide: false,
            slideDialogData: {},
            isLoadSend: false,
        };
    },
    methods: {
        checkRole() {
            if (checkRoles('14', this.$userData)) {
                return true;
            }
            return false;
        },
        openApp(url) {
            window.open(url, '_blank');
        },
        async getApps() {
            try {
                let params = {}
                if (this.checkRole()) {
                    params = { is_admin: true }
                }
                let data = await this.axios.get(`/api/1.0/application`, {params})
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
    created() {
        this.getApps()
    },
    watch: {
    }
};
</script><style lang="scss" scoped>
    .properties {
        min-height: 100vh;
        background-color: #fff;
        padding: 30px;
        //zoom: 0.9;

        h2 {
            font-size: 30px;
        }
    }
</style>