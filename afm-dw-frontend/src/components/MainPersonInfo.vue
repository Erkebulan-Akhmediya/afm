<template>
    <div class="card">
        <v-row v-for="employee in employees" :key="employee.id" class="card-item">
          <v-col cols="2"
            style="
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              padding-left: 6px;
            "
          >
            <img
              width="100%"
              :src="employee.src"
              :alt="`${employee.last_name_rus} ${employee.first_name_rus}`"
              style="border-radius: 50%; object-fit: cover; width: 30px"
            />
          </v-col>
          <v-col cols="4" class="d-flex justify-start align-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <p
                  class="eventAuthor"
                  style="margin-bottom: 0; margin-left: 5px"
                  v-bind="attrs" v-on="on"
                >
                  <router-link
                    class="eventAuthor"
                    :to="`employees/${$crypto(String(employee.id))}`"
                    >{{ employee.last_name_rus }} <br />
                    {{ employee.first_name_rus }} <br />
                    {{ employee.middle_name_rus }}
                    </router-link
                  >
                </p>
              </template>
              <span>Перейти в карточку</span>
            </v-tooltip>
          </v-col>
          <v-col cols="6" class="d-flex justify-space-around align-center">
            <p style="margin-bottom: 0; color: rgba(0, 0, 0, 0.87); font-size: 13px;" v-html="employee.description">
             
            </p>
          
          </v-col>
        </v-row>
    </div>
  
    
</template>
<script>
    export default {
  components: {

     },
  data: () => ({
    employees: [

            ]

  }),
  methods: {
    async getMainPersonInfo() {
        let result = []
      let { data:consts } = await this.axios.get(
        "/api/1.0/lov/ref.sys_all_const",
        { params: { name: "mainPersonInfo" } }
      );

      for await(let el of consts) {
        let { data } = await this.axios.get(
        "/api/1.0/lov/hr.employee",
        { params: { id: el.const_value*1 } }
      );
      el['const_id'] = el.id
      el = {...el, ...data[0]}
      let src = await this.$getVuexStoreFile(el.id, 1)
      el['src']=src ? src : require("@/assets/img/default_employee.png")
      result.push(el)
      }

            this.employees = result.sort(function(a, b) {
         return a.const_id - b.const_id;
        });

            }
  },
  created() {
    this.getMainPersonInfo()
  }
}
</script><style scoped lang="scss">
.mainBlockPage {
  background: #fff; 
  
  padding-top: 10px;
  padding-right: 10px;
  padding-bottom: 20px;
  padding-left: 15px;

  border-radius: 10px;
  }
  .card {
    background: #fff;
    display: block;
  padding: 30px 10px;
  padding-bottom:16px;
  margin-left: 0px;
  // box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  margin-bottom: 2px;

  


  

  .eventAuthor {
    font-size: 13px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #707683;
  }

  .clickableIcons {
    cursor: pointer;
    color: #c4c4c4;
  }
  
  .clickableIcons:hover {
    color: #000;
  }
  .card-item {
    background: #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.12);
    border-radius: 5px;
    margin-left: 8px;
    margin-right: 8px;
    margin-bottom: 4px;

    &:hover {
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.18);
  }
  }
}
</style>