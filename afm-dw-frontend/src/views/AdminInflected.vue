<template>
    <div v-if="$isAdminRules($userData.role, 'inflected')" class="admin_inflected">
        <h1 class="mb-6">{{$t('administration.declinations')}}</h1>
        <div
            class="mb-6"
            style="display: flex; align-items: center;">
            <v-select
                v-model="selectValueType"
                :items="entityTypes"
                dense
                outlined
                hide-details
                :label="$t('administration.selectRefType')"
            ></v-select>
            <v-btn class="ml-6" icon style="background-color: #fff;" 
                outlined
                @click="showAddInflected"
            >
                <v-icon>
                    mdi-plus
                </v-icon>
            </v-btn>
        </div>
        <v-data-table
            disable-sort
            :headers="headers"
            :items="tableData"
            :items-per-page="10"
            class="clickableTable elevation-1"
            :no-data-text="'Нет данных о департаментах'"
            @click:row="selectRow"
            :footer-props="{
              itemsPerPageText: $t('globalWords.itemsPerPage'),
            }"
        >
        </v-data-table>
        
        <v-dialog
            v-model="dialog"
            width="500"
            @input="v => v || clearDialog()"
            >
            <v-card>
                <v-card-text style="padding: 30px">
                    <slot>
                        <div style="color: #000;">
                            <h2 class="mb-4">Изменить словосочетание</h2>
                            <v-text-field
                                style="color: #aaa;"
                                hide-details
                                class="mb-6 mt-3"
                                v-model="dialogData.name"
                                disabled
                                label="Оригинальное слово"
                                outlined
                            ></v-text-field>
                            <v-text-field
                                hide-details
                                class="mb-6 mt-3"
                                v-model="dialogData.declination_word"
                                :label="$t('administration.changedWord')"
                                outlined
                            ></v-text-field>
                            <v-select
                                v-model="dialogData.declination_id"
                                :items="declination"
                                dense
                                outlined
                                disabled
                                hide-details
                                class="mb-6"
                                :label="$t('administration.case')"
                            ></v-select>
                            <v-select
                                v-model="dialogData.gender_id"
                                :items="gender"
                                dense
                                disabled
                                outlined
                                hide-details
                                class="mb-6"
                                :label="$t('administration.gender')"
                            ></v-select>
                            <v-select
                                v-model="dialogData.language_id"
                                :items="language"
                                dense
                                disabled
                                outlined
                                hide-details
                                class="mb-6"
                                :label="$t('administration.language')"
                            ></v-select>
                        </div>
                    </slot>
                </v-card-text>

                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="error"
                    text
                    @click="dialog = false"
                >
                    Отмена
                </v-btn>
                
                <v-btn
                    :loading="disableDoubleClick"
                    :disabled="disableDoubleClick"
                    text
                    color="success"
                    @click="sendAddInflectedWord(dialogData, 'edit')"
                    >
                    Сохранить
                    <template v-slot:loader>
                        <span>Отправка...</span>
                    </template>
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <v-dialog
            v-model="addDialog"
            width="800"
            @input="v => v || clearDialog()"
            >
            <v-card>
                <v-card-text style="padding: 30px">
                    <slot>
                        <div style="color: #000;">
                            <h2 class="mb-4">Добавить словосочетание</h2>
                            
                            <v-data-table
                                disable-sort
                                :headers="headersAddWord"
                                :items="wordsAddDialog"
                                :items-per-page="5"
                                v-model="addDialogData.addItem"
                                class="clickableTable elevation-1"
                                :no-data-text="'Нет данных о департаментах'"
                                @click:row="(data, item) => {item.select(true)}"
                                single-select
                                show-select
                                :item-key="'original_word_id'"
                                :footer-props="{
                                itemsPerPageText: $t('globalWords.itemsPerPage'),
                                }"
                            >
                            </v-data-table>
                            <v-text-field
                                hide-details
                                class="mb-6 mt-3"
                                v-model="addDialogData.declination_word"
                                :label="$t('administration.changedWord')"
                                outlined
                            ></v-text-field>
                            <v-select
                                v-model="addDialogData.declination_id"
                                :items="declination"
                                dense
                                outlined
                                hide-details
                                class="mb-6"
                                :label="$t('administration.case')"
                            ></v-select>
                            <v-select
                                v-model="addDialogData.gender_id"
                                :items="gender"
                                dense
                                outlined
                                hide-details
                                class="mb-6"
                                :label="$t('administration.gender')"
                            ></v-select>
                            <v-select
                                v-model="addDialogData.language_id"
                                :items="language"
                                dense
                                outlined
                                hide-details
                                class="mb-6"
                                :label="$t('administration.language')"
                            ></v-select>
                        </div>
                    </slot>
                </v-card-text>

                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="error"
                    text
                    @click="addDialog = false"
                >
                    Отмена
                </v-btn>
                
                <v-btn
                    :loading="disableDoubleClick"
                    :disabled="disableDoubleClick"
                    text
                    color="success"
                    @click="sendAddInflectedWord(addDialogData, 'add')"
                    >
                    Добавить
                    <template v-slot:loader>
                        <span>Отправка...</span>
                    </template>
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
            entityTypes: [],
            selectValueType: '',
            headers: [
                { text: '#', sortable: false, value: 'original_word_id'},
                { text: this.$t('administration.collocation'), value: 'name' },
                { text: this.$t('administration.changedWord'), value: 'declination_word' },
                { text: this.$t('administration.case'), value: 'declination' },
                { text: this.$t('administration.gender'), value: 'gender_name' },
                { text: this.$t('administration.language'), value: 'language_name' },
            ],
            headersAddWord: [
                { text: '#', sortable: false, value: 'original_word_id'},
                { text: this.$t('administration.collocation'), value: 'name' }
            ],
            tableData: [],
            dialog: false,
            dialogData: {},
            addDialog: false,
            addDialogData: {},
            wordsAddDialog: [],
            declination: [],
            gender: [],
            language: [],
            disableDoubleClick: false
        }
    },

    created() {
        this.getUniversalDataSelect('language')
        .then(data => (this.language = data))

        this.getUniversalDataSelect('gender')
        .then(data => (this.gender = data))

        this.getUniversalDataSelect('entity_type')
        .then(data => (this.entityTypes = data))

        this.getUniversalDataSelect('declination')
        .then(data => (this.declination = data))
    },

    methods: {  

        async showAddInflected() {
            if(!this.selectValueType) {
                this.$swal({
                            ...this.$optionAlert.fire,
                            icon: 'error',
                            title: this.$t('administration.selectRefType') 
                        })
                return 
            }
            let localParams = {
                type: this.selectValueType
            }
            let wordsAdd = await this.axios.get(`/api/1.0/entity_table/:type`, {localParams})
            this.wordsAddDialog = wordsAdd.data
            this.addDialog = true

        },

        async getUniversalDataSelect(variable) {
            let data = await this.axios.get(`/api/1.0/${variable}`)
            return data.data.reduce((arr, item) => {
                    arr.push({
                        text: item.name,
                        value: item.id
                    })
                    return arr
                }, [])
        },

        clearDialog() {
            this.dialogData = {}
            this.addDialogData = {}
        },

        selectRow(data) {
            this.dialog = true
            this.dialogData = Object.assign({}, data)
        },

        async getTableData(data) {
            try {
                let localParams = {
                    id: data
                }
                let {data: result} = await this.axios.get(`/api/1.0/inflected_word/:id`, {localParams})
                return result
            } catch (error) {
                console.log(error)
            }

        },

        async sendInflectedWord() {
            if(!this.dialogData.declination_id) {
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: `Выберите падеж`  
                })
                return
            }
            this.disableDoubleClick = true
            let bind = {
                word: this.dialogData.name,
                declination_word: this.dialogData.declination_word,
                declination_id: this.dialogData.declination_id,
                external_id: this.dialogData.original_word_id,
                entity_type_id: this.selectValueType,
                gender_id: this.dialogData.gender_id || null,
                language_id: this.dialogData.language_id || null
            }
            try {
                if(this.dialogData.inflected_word_id) {
                    let localParams = {
                        id: this.dialogData.inflected_word_id
                    }
                    await this.axios.put(`/api/1.0/inflected_word/:id`, bind, {localParams})
                } else {
                    await this.axios.post(`/api/1.0/inflected_word`, bind)
                }
                this.tableData = await this.getTableData(this.selectValueType)
                this.$swal({
                            ...this.$optionAlert.fire,
                            icon: 'success',
                            title: 'Сохранено.'  
                        })
                this.dialog = false

                            } catch (error) {
                this.$swal({
                            ...this.$optionAlert.fire,
                            icon: 'error',
                            title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}` 
                        })

                            }
            this.disableDoubleClick = false
        },

        async sendAddInflectedWord(data, type) {
            let err = []
            if(type == 'add' && (!data.addItem || !data.addItem[0])) {
                err.push('Выберите оригинальное слово')
            }

            if(!data.declination_word) {
               err.push('Введите слово')
            }
            if(!data.declination_id) {
               err.push('Выберите падеж')
            }

            if(err.length) {
                 this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: `Ошибки: ${err.join(', ')}`  
                })
                return
            }

            this.disableDoubleClick = true
            let bind = {
                declination_word: data.declination_word,
                declination_id: data.declination_id,
                entity_type_id: this.selectValueType,
                gender_id: data.gender_id || null,
                language_id: data.language_id || null
            }

            if(type == 'add') {
                bind.word = data.addItem[0].name
                bind.external_id =  data.addItem[0].original_word_id
            } else {
                bind.word = this.dialogData.name
                bind.external_id = this.dialogData.original_word_id
            }
            try {
                await this.axios.post(`/api/1.0/inflected_word`, bind)
                this.tableData = await this.getTableData(this.selectValueType)
                this.$swal({
                            ...this.$optionAlert.fire,
                            icon: 'success',
                            title: 'Сохранено.'  
                        })
                this.dialog = false
                this.addDialog = false

                            } catch (error) {
                this.$swal({
                            ...this.$optionAlert.fire,
                            icon: 'error',
                            title: `Ошибка: ${error.data?.ERR_MSG || error.message || error}` 
                        })

                            }
            this.disableDoubleClick = false
        }
    },

    watch: {
        async selectValueType(data) {
            if(data) {
                this.tableData = await this.getTableData(data)
            }
        }
    }
}
</script>