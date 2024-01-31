<template>
    <div class="objectReference">
        <h2 class="text-weight-bold text-h4 text-center" style="color: #2196F3;">{{objectiveReference.Surname}} {{objectiveReference.Name}} {{objectiveReference.Middlename}}</h2>
        <p class="text-h6 text-center">{{objectiveReference.Position}}</p>
        <table class="referenceTable mb-16 mt-10" style="border-collapse: collapse; margin-top: 10px; width:100%;">
            <tr>
                <td style="max-width:100px" class="head text-left">Дата рождения</td>
                <td>{{objectiveReference.Birthday}}</td>
            </tr>
            <tr>
                <td style="max-width:100px" class="head text-left">Место рождения</td>
                <td>{{objectiveReference.Place_Of_Birth}}</td>
            </tr>
            <tr>
                <td style="max-width:200px" class="head text-left">Национальность</td>
                <td>{{objectiveReference.Nationality}}</td>
            </tr>
            <tr>
                <td style="max-width:100px" class="head text-left">Образование</td>
                <td>{{objectiveReference.Education}}</td>
            </tr>
        </table>
        
        <p class="text-h4 text-center" style="color: #2196F3;">Трудовая деятельность</p>
        <table class="referenceTable" style="border-collapse: collapse; margin-top: 10px; width:100%;">
            <tr>
                <td colspan="2" class="head">Дата</td>
                <td rowspan="2" class="head">Должность, место работы, местонахождение организации</td>
            </tr>
            <tr>
                <td class="head">Приема</td>
                <td class="head">Увольнения</td>
            </tr>
            <tr v-for="activity of this.objectiveReference.Labor_Activity" :key="activity.id">
                <td class="text-center">{{activity.Date_Start}}</td>
                <td class="text-center">{{activity.Date_End}}</td>
                <td>{{activity.Place_Of_Work}}</td>
            </tr>
        </table>
    </div>
</template>
<script>
export default {
    data: function() {
        return {

                    }
    },
    methods: {
        downloadObjective() {
            this.$emit(`downloadObjective`)
        }
    },

    created() {
    },

        props: ['objectiveReference', 'btnLoader']  
}
</script><style lang="scss" scoped>
  .referenceTable td{
    border: 1px solid #000;
    padding: 2px 20px;

    &.head {
        text-align: center;
        font-weight: bold;
    }
  }
</style>