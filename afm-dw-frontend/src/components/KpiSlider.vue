<template>
  <v-carousel v-model="model" 
  hide-delimiters
    height="auto"
    :hide-delimiter-background="true"
  >
    <v-carousel-item style="width: 93%; margin: auto;">
        <img width="100%" src="../assets/img/graph0.jpg" alt="">
    </v-carousel-item>
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/graph1.jpg" alt="">
    </v-carousel-item>
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/graph2.jpg" alt="">
    </v-carousel-item>
  </v-carousel>
</template>
<script>

  export default {

    data: () => ({
      model: 0,
    }),
    created() {
    },
  }
</script>