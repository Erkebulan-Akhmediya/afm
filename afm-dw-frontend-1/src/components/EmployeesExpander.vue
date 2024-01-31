<template>
  <div>
    <v-overlay :value="loader">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-row>
      <v-col>
        <h2>{{ $t("employeesPage.empDirectory") }}</h2>
      </v-col>
    </v-row>
    <CandidateList />
  </div>
</template>

<script>
// import CandidateCreate from './CandidateCreate.vue';
// import checkRoles from '@/utils/check_role'
import CandidateList from './candidates/CandidateList.vue'

export default {
  components: {
    CandidateList,
  },
  data: () => ({
    loader: false,
    // candidateCreate: false
    // disabled: false,
    // accordion: true,
    // popout: false,
    // inset: false,
    // multiple: false,
    // readonly: false,
    // focusable: false,
    // flat: false,
    // hover: false,
    // tile: false,
    // tableData: [],
  }),
  // components: {
  //   CandidateCreate
  // },
  methods: {
    // createCandidateDialog() {
    //   this.candidateCreate = true
    // },
    // isCandidateModer() {
    //   return checkRoles('41', this.$userData) || checkRoles('39', this.$userData) || checkRoles('40', this.$userData)  
    // },
  },
};
</script>

<style lang="scss" scoped>
h2 {
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.018em;
  text-transform: uppercase;
  color: #84919a;
}
.child-department {
  border-top: 1px solid rgba(229, 229, 229, 0.6);
}
.child-department:first-child {
  border-top: none;
}
.expander-reverse button .v-expansion-panel-header {
  display: flex;
  flex-direction: row-reverse;
}
</style>