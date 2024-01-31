<template>
  <v-card>
    <v-card-text>
      <EmployeeTabRequest :employee="$userData.fullData" :isApplication="true" :multipleEmployee="true"> </EmployeeTabRequest>
    </v-card-text>
  </v-card>
</template>
<script>
import EmployeeTabRequest from '@/components/EmployeeTabRequest.vue';

export default {
  components: {
    EmployeeTabRequest,
  },
  data() {
    return {

    }
  }
}
</script>