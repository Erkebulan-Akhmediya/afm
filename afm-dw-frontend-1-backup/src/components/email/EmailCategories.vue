<template>
  <v-card class="mx-auto" max-width="350">
    <v-list>
      <v-list-item class="justify-center">
        <new-email />
      </v-list-item>
      <v-list-item v-if="BOXES_IS_LOAD" class="d-flex justify-center">
        <v-progress-circular
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-list-item>
      <v-list-item-group>
        <v-subheader>Системные папки</v-subheader>
         <!--ПАПКИ -->
        <v-list-item
          class='list-item'
          v-for=" item in DEFAULT_BOXES"
          :key="item.id"
          :disabled="BOX_IS_LOAD"
          active-class="primary--text text--accent-4"
          @click="changeBox(item)"
        >
          <!--<v-icon v-if="(DEFAULT_BOXES.length < 5)" size="20" class="list-item-icon">{{ icons[index] }}</v-icon> -->
          <v-list-item-content class="list-item-name ml-4">        
            <div> <v-icon size="20" class="list-item-icon">{{ item.icon }}</v-icon> {{ item.display_name }}</div>
          </v-list-item-content>
          <v-list-item-avatar class="mx-2">
            <v-avatar v-if="item.count" left class="text-white" size="24">
              {{ item.count }}
            </v-avatar>
          </v-list-item-avatar>
        </v-list-item>
        <v-divider></v-divider>
        <v-subheader>Пользовательские папки</v-subheader>
        <v-list-item
          class='list-item'
          v-for="item in CUSTOM_BOXES"
          :key="item.id"
          :disabled="BOX_IS_LOAD"
          active-class="primary--text text--accent-4"
          @click="changeBox(item)"
        >
          <v-list-item-content class="list-item-name ml-4">
            <div> <v-icon size="20" class="list-item-icon">mdi-folder</v-icon>{{ item.display_name }}</div>
          </v-list-item-content>
          <v-list-item-avatar class="mx-2">
            <v-avatar v-if="item.count" left class="text-white" size="24">
              {{ item.count }}
            </v-avatar>
          </v-list-item-avatar>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item :disabled="BOX_IS_LOAD" class="mt-2" color="grey lighten-4">
          <v-spacer></v-spacer>
          <v-btn :disabled="BOX_IS_LOAD" @click="selectImportantBox()" rounded
            ><v-icon
              :color="
                SELECTED_BOX.system_name == 'Important' ? 'yellow' : 'grey'
              "
              >mdi-star</v-icon
            ></v-btn
          >
          <v-spacer></v-spacer>
        </v-list-item>
      </v-list-item-group>

      
    </v-list>
  </v-card>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import NewEmail from "./NewEmail.vue";
export default {
  data: () => ({
  }),
  components: {
    NewEmail,
  },

  computed: {
    ...mapGetters([
      "BOXES",
      "BOX_IS_LOAD",
      "BOXES_IS_LOAD",
      "DEFAULT_BOXES",
      "CUSTOM_BOXES",
      "SELECTED_BOX",
    ]),
  },
  methods: {
    ...mapActions(["GET_EMAILS_IN_BOX_API", "GET_IMPORTANT_EMAIL_API"]),
    ...mapMutations(["SET_MAIL_DETAIL"]),
    changeBox(item) {
      let payload = { ...item, ...{ currentPage: 1 } };
      this.GET_EMAILS_IN_BOX_API(payload);

      this.SET_MAIL_DETAIL(false);
    },
    selectImportantBox() {
      let payload = {
        ...{ system_name: "Important", display_name: "Важные" },
        ...{ currentPage: 1 },
      };
      this.GET_IMPORTANT_EMAIL_API(payload);
      this.SET_MAIL_DETAIL(false);
    },
  },
  watch: {
    async BOXES_IS_LOAD(){
      if(!this.BOXES_IS_LOAD){
        this.changeBox(this.DEFAULT_BOXES[0])
      }  
    }
  },
  created() {},
  sockets: {},
};
</script><style lang="scss" scoped>
.list-item-icon{
  padding: 0px;
  margin-left: 0px;
  margin-right: 8px;
  margin-bottom: 4px;
}
.list-item-name{
  padding-top: 0px;
  padding-bottom: 0px;
}
.list-item-name div{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
}
.list-item-name div{
  font-size: 14px;
}
.list-item{
  padding: 0px!important;
  height: 50px;
}
span {
  background-color: rgba(255, 0, 0, 0.4);
  border-radius: 50%;
  padding: 0 5px;
}
.text-white {
  color: azure;
  background-color: rgba(153, 74, 243, 0.6);
}
// .v-list-item {
//     border-bottom: 1px solid black;
// }
</style>