<template>
    <div style="width: 100%">
        <v-skeleton-loader
        class="mt-4"
        width="100%"
        height="300"
        v-show="!isRender"
        type="image"
        ></v-skeleton-loader>
        <v-carousel v-model="model" 
            hide-delimiters
            height="auto"
            v-show="isRender"
            :hide-delimiter-background="true"
        >
            <v-carousel-item style="width: 85%; margin: auto;" v-for="slide of slides" :key="slide.id">
                <img width="100%" :src="slide.src" alt="">
            </v-carousel-item>
        </v-carousel>
    </div>
</template>
<script>

  export default {

    data: () => ({
      model: 0,
      slides: [],
      isRender: false,
    }),
    methods: {

            },

    async created() {
        try {
            const {data} = await this.axios.get('/api/1.0/kpi/slide/:tab_id', {localParams: {tab_id: this.tabId}})
            await Promise.all(
                data.map(async item => {
                     item.src = await this.$getVuexStoreFile(item.id, 5);
                    return item
                })
            )
            this.slides = data
            this.isRender = true
        } catch (error) {
            this.$swal({
                ...this.$optionAlert.fire,
                icon: "error",
                timer: 5000,
                width: 300,
                title: 'Ошибка загрузки слайдов',
            });
            this.isRender = true
        }
    },
    props: ['tabId']
  }
</script>