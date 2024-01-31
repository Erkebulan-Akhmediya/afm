<template>
  <v-carousel v-model="model" 
    height="auto"
    hide-delimiters
  >
   <!-- <template v-slot:prev="{ on, attrs }">
      <v-btn
        color="success"
        v-bind="attrs"
        v-on="on"
      >Previous slide</v-btn>
    </template>
    <template v-slot:next="{ on, attrs }">
      <v-btn
        color="info"
        v-bind="attrs"
        v-on="on"
      >Next slide</v-btn>
    </template> -->
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/project/project1.jpg" alt="">
    </v-carousel-item>
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/project/project2.jpg" alt="">
    </v-carousel-item>
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/project/project3.jpg" alt="">
    </v-carousel-item>
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/project/project4.jpg" alt="">
    </v-carousel-item>
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/project/project5.jpg" alt="">
    </v-carousel-item>
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/project/project6.jpg" alt="">
    </v-carousel-item>
    <v-carousel-item style="width: 80%; margin: auto;">
        <img src="../assets/img/project/project7.jpg" alt="">
    </v-carousel-item>
  </v-carousel>
</template>
<script>

  export default {

    data: () => ({
      model: 0,
    }),
  }
</script>