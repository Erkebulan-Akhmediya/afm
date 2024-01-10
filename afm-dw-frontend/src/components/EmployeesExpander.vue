<template>
  <div>
    <v-overlay :value="loader">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-row>
      <v-col>
        <h2>{{ $t("employeesPage.empDirectory") }}</h2>
      </v-col>
      <v-col align="right">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn :disabled="!isCandidateModer()" outlined color="primary"  v-bind="attrs" v-on="on"> 
              <v-icon class="mr-2"> mdi-format-list-bulleted </v-icon>
              Список действии 
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title 
                ><v-btn @click="createCandidateDialog()" text> Добавить кандидата </v-btn></v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col>
        <EmployeeDepartmentOrganization :level="0">
        </EmployeeDepartmentOrganization>
      </v-col>
    </v-row>
    <v-row align="center">
      <CandidateCreate :dialog="candidateCreate" @close="candidateCreate = false"/>
      </v-row>
  </div>
</template>
<script>
import CandidateCreate from './CandidateCreate.vue';
import checkRoles from '@/utils/check_role'

export default {
  data: () => ({
    loader: false,
    accordion: true,
    popout: false,
    inset: false,
    multiple: false,
    disabled: false,
    readonly: false,
    focusable: false,
    flat: false,
    hover: false,
    tile: false,
    tableData: [],
    candidateCreate: false
  }),
  components: {
    CandidateCreate
  },
  methods: {
    createCandidateDialog() {
      this.candidateCreate = true
    },
    isCandidateModer() {
      return checkRoles('41', this.$userData) || checkRoles('39', this.$userData) || checkRoles('40', this.$userData)  
    },
  },
};
</script><style lang="scss" scoped>
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