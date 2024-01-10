<template>
  <div v-if="isRendering">
    <v-tabs v-model="tab" align-with-title
    >
      <v-tabs-slider color="#35A4DC"></v-tabs-slider>

      <v-tab v-for="item in items" :key="item.id" :disabled="item.disabled">
        {{ item.name }}
      </v-tab>
    </v-tabs>
    <v-tabs-items style="padding: 20px;" v-model="tab">
      
      <v-tab-item>
        <v-tabs v-model="tab3" align-with-title>
          <v-tabs-slider color="#35A4DC"></v-tabs-slider>
          <v-tab v-for="item in reportItems" :key="item.id" :disabled="item.disabled">
            {{ item.name }}
          </v-tab>
        </v-tabs>

        <v-tabs-items style="padding: 20px;" v-model="tab3">
          <!-- <v-tab-item>
            <v-card flat>
              <v-card-text>
                <span>В разработке</span>
              </v-card-text>
            </v-card>
          </v-tab-item> -->
          <v-tab-item>
            <DepartamentalReports>
            </DepartamentalReports>
          </v-tab-item>
          <v-tab-item>
            <reportLaborDiscipline/>
          </v-tab-item>
        </v-tabs-items>
      </v-tab-item>

      <v-tab-item>
        <v-tabs v-model="tab4" align-with-title>
          <v-tabs-slider color="#35A4DC"></v-tabs-slider>
          <v-tab v-for="item in globalRatingItems" :key="item.id" :disabled="item.disabled">
            {{ item.name }}
          </v-tab>
        </v-tabs>
        <v-tabs-items style="padding: 20px;" v-model="tab4">
          <!--профилактика правонарушений-->
          <!-- <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item> -->
          <!--оперативно-следственная-->
          <!-- <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item> -->
          <!--противодействие коррупции-->
          <!-- <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item> -->
          <!--работа со СМИ-->
          <!-- <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item> -->
          <!--исполнительская-->
          <!-- <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item> -->
          <!--обучение-->
          <!-- <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item> -->
          <!--Неотвратимость наказания-->
          <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item>
          <!--Превенция-->
          <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item>
          <!--Индекс восприятия коррупции-->
          <v-tab-item>
            <geoMapRating :placeholder="tab4">
            </geoMapRating>
          </v-tab-item>
        </v-tabs-items>
      </v-tab-item>
      
      <v-tab-item>
        <v-tabs v-model="tab2" align-with-title>
          <v-tabs-slider color="#35A4DC"></v-tabs-slider>
          <v-tab v-for="item in individualRatingItems" :key="item.id" :disabled="item.disabled">
            {{ item.name }}
          </v-tab>
        </v-tabs>

        <v-tabs-items style="padding: 20px;" v-model="tab2">
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <individualRatingUniversal :placeholder="tab2">
                </individualRatingUniversal>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <individualRatingUniversal :placeholder="tab2">
                </individualRatingUniversal>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <individualRatingUniversal :placeholder="tab2">
                </individualRatingUniversal>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <individualRatingUniversal :placeholder="tab2">
                </individualRatingUniversal>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <individualRatingUniversal :placeholder="tab2">
                </individualRatingUniversal>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <individualRatingUniversal :placeholder="tab2">
                </individualRatingUniversal>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <!-- <RemoteErdr>
                </RemoteErdr> -->
                <individualRatingUniversal :placeholder="tab2">
                </individualRatingUniversal>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <individualRatingUniversal :placeholder="tab2">
                </individualRatingUniversal>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-tab-item>
      
      <v-tab-item v-for="slide of otherTabs" :key="slide.id">
        <v-card flat>
          <v-card-text>
              <KpiSliderTemplate :tabId="slide.id">
              </KpiSliderTemplate>
          </v-card-text>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <KpiTest>
        </KpiTest>
      </v-tab-item>
      
      <v-tab-item>
        <v-card flat>
          <v-card-text>
              <KpiActivityRating>
              </KpiActivityRating>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<!--<style lang="scss">
  .v-window__prev, .v-window__next {
    top: 200px !important;
  }
</style>-->
<script>
import KpiSliderTemplate from '@/components/KpiSliderTemplate';
import KpiTest from '@/components/KpiTest';
import checkRoles from '@/utils/check_role'
import KpiActivityRating from '@/components/KpiActivityRating';
import geoMapRating from '@/components/geoMapRating';
import reportLaborDiscipline from '@/components/reportLaborDiscipline';
import DepartamentalReports from '../components/DepartamentalReports.vue'
  export default {
    components: {
      KpiSliderTemplate,
      KpiTest,
      KpiActivityRating,
      geoMapRating,
      reportLaborDiscipline,
      DepartamentalReports,
  },
    data () {
      return {
        tab: null,
        tab2: null,
        tab3: null,
        tab4: null,
        otherTabs: [],
        items: [
          { name: 'Рейтинг тестов', disabled: false },
          { name: 'Рейтинг активности', disabled: true }
        ],
        reportItems: [
          //{ name: 'Общая статистика', disabled: true },
          { name: 'Ведомственные отчеты', disabled: true },
          { name: 'Трудовая дисциплина', disabled: false }
        ],
        individualRatingItems: [
          { name: 'Руководители', disabled: true },
          { name: 'Заместители по ОР', disabled: true },
          { name: 'Заместители по СР', disabled: true },
          { name: 'Руководители ОУ', disabled: true },
          { name: 'Руководители СУ', disabled: true },
          { name: 'Оперативные сотрудники', disabled: true },
          { name: 'Следователи', disabled: true },
          { name: 'Криминалисты', disabled: true }
        ],
        globalRatingItems: [
          {name: 'Неотвратимость наказания', disabled: true},
          {name: 'Превенция', disabled: true},
          {name: 'Индекс восприятия коррупции', disabled: true},
        ],
        isRendering: false
      }
    },
    watch: {
    },
    mounted() {
      let tab = this.$route.query.tab, subtab = this.$route.query.subtab
      if (tab) {
        this.tab = parseInt(tab)
        if (subtab == 0) {
          this.tab2 = parseInt(subtab)
        } else if (subtab == 1) {
          this.tab3 = parseInt(subtab)
        } else if (subtab == 2) {
          this.tab4 = parseInt(subtab)
        }
      }
    },
    async created() {
      try {
        if (checkRoles('45', this.$userData))
        {
          this.reportItems[0].disabled = false
        }

        const tabs = await this.axios.get('/api/1.0/kpi/tab')
        this.otherTabs = tabs.data
        this.items = [...tabs.data, ...this.items]
        this.items.unshift({name: 'Индивидуальные рейтинги', disabled: true})
        this.items.unshift({name: 'Общие рейтинги', disabled: true})
        this.items.unshift({name: 'Отчеты', disabled: true})
        this.isRendering = true

        for (let i = 0; i < this.individualRatingItems.length; i++) {
          if (this.individualRatingItems[i].name == 'Руководители' && checkRoles('20', this.$userData)) {
            this.individualRatingItems[i].disabled = false
          }
          if (this.individualRatingItems[i].name == 'Заместители по ОР' && checkRoles('21', this.$userData)) {
            this.individualRatingItems[i].disabled = false
          }
          if (this.individualRatingItems[i].name == 'Заместители по СР' && checkRoles('22', this.$userData)) {
            this.individualRatingItems[i].disabled = false
          }
          if (this.individualRatingItems[i].name == 'Руководители ОУ' && checkRoles('23', this.$userData)) {
            this.individualRatingItems[i].disabled = false
          }
          if (this.individualRatingItems[i].name == 'Руководители СУ' && checkRoles('24', this.$userData)) {
            this.individualRatingItems[i].disabled = false
          }
          if (this.individualRatingItems[i].name == 'Оперативные сотрудники' && checkRoles('25', this.$userData)) {
            this.individualRatingItems[i].disabled = false
          }
          if (this.individualRatingItems[i].name == 'Следователи' && checkRoles('26', this.$userData)) {
            this.individualRatingItems[i].disabled = false
          }
          if (this.individualRatingItems[i].name == 'Криминалисты' && checkRoles('32', this.$userData)) {
            this.individualRatingItems[i].disabled = false
          }
        }

        for (let i = 0; i < this.globalRatingItems.length; i++) {
          if (this.globalRatingItems[i].name == 'Неотвратимость наказания' && checkRoles('55', this.$userData)) {
            this.globalRatingItems[i].disabled = false
          }
          if (this.globalRatingItems[i].name == 'Превенция' && checkRoles('55', this.$userData)) {
            this.globalRatingItems[i].disabled = false
          }
          if (this.globalRatingItems[i].name == 'Индекс восприятия коррупции' && checkRoles('55', this.$userData)) {
            this.globalRatingItems[i].disabled = false
          }
        }

        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].name == 'Отчеты') {
            if (this.reportItems.findIndex(item => item.disabled == false) != -1) {
              this.items[i].disabled = false
            }
          }
          if (this.items[i].name == 'Индивидуальные рейтинги') {
            if (this.individualRatingItems.findIndex(item => item.disabled == false) != -1) {
              this.items[i].disabled = false
            }
          }
          if (this.items[i].name == 'Общие рейтинги') {
            if (this.globalRatingItems.findIndex(item => item.disabled == false) != -1) {
              this.items[i].disabled = false
            }
          }
        }
      } catch (error) {
        this.$swal({
            ...this.$optionAlert.fire,
            icon: "error",
            timer: 5000,
            width: 300,
            title: 'Ошибка загрузки данных рейтинга',
        });
        this.isRendering = true
      }
    }
  }
</script>

