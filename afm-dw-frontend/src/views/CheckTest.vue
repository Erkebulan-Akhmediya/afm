<template>
  <div>
    <div class="text-h4 mb-10">
      Проверка опроса по определений личностных качеств

    </div>
    <TestRespondents :test_id="30"></TestRespondents>
  </div>
</template>

<style lang="scss" scoped>
.testCheckContainer {
min-height: 100vh;
background-color: #fff;
padding: 20px;

h2 {
  font-size: 30px;
}
}
</style>

<script>
import TestRespondents from '../components/TestRespondents.vue';
export default {
components: {
    TestRespondents
},
data() {
  return {
    tests: [],
    test_names: [],
    selectedTest: '',
  };
},
methods: {
  
},
computed:{

},
created() {
},
};
</script>
