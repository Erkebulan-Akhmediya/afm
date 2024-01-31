<template>
    <div :style="`display: flex; position: relative; z-index:1; width: 100%; background: #fff; height: 56px; box-sizing: border-box`" >
        <v-text-field class="searchBar" :placeholder="$t(`${placeholder}`)" v-model="globalSearchVal" @keydown.enter="globalSearch" @keydown="check" style="padding: 7px; border: 1px solid #ddd; border-radius: 5px">
            <v-icon @click="globalSearch" slot="prepend" color="gray" style="color: #BDBDBD;">mdi-magnify</v-icon>
        </v-text-field>
    </div>
</template>
<script>
export default {
    data() {
        return {
            globalSearchVal: ''
        }
    },
    methods: {
        clearInput() {
            this.globalSearchVal = ''
        },
        globalSearch() {
            this.$emit('search', this.globalSearchVal);
        },
        check(val) {
            if(val.key.length > 1) {
                return
            }
            if(this.searchTimeoutId) {
                clearTimeout(this.searchTimeoutId)
                this.searchTimeoutId = ''
            }
            if (val && this.globalSearchVal) {
                this.searchTimeoutId = setTimeout(() => {
                    this.$emit('search', this.globalSearchVal);
                    this.searchTimeoutId = ''
                }, 1000);
            }
        },
        clearData() {
            this.globalSearchVal = '';
        }
    },
    props: ['placeholder']
}
</script>