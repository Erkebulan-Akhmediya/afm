<template>
    <div class="objectReference">
        <h2 class="text-h5 text-center font-weight-bold">МЕМЛЕКЕТТІК ҚЫЗМЕТШІНІҢ ҚЫЗМЕТТIК ТIЗIМІ</h2>
        <h2 class="text-h5 text-center font-weight-bold">ПОСЛУЖНОЙ СПИСОК ГОСУДАРСТВЕННОГО СЛУЖАЩЕГО</h2>

        <div class="headWrapper" style="display: flex; justify-content: space-between">
            <div class="headRef" style="width: 100%">
                <p class="textUnderline">Т.А.Ж. (болған жағдайда) / Ф.И.О. (при наличии)</p>
                <h2 class="font-weight-bold text-center"> <span style="width: 50%" class="textUnderline">{{workList.Surname}} {{workList.Name}} {{workList.Middlename}}</span></h2> <br>
                <p class="textUnderline">Жұмыс орны, лауазымы, санаты / Место работы, должность, категория</p>
                <p class="font-weight-bold text-center"> <span style="width: 50%" class="textUnderline">{{workList.Position}}</span></p><br>
                <p class="textUnderline">ЖСН / ИИН</p>
                <p class="font-weight-bold text-center"> <span style="width: 50%" class="textUnderline">{{workList.IIN}}</span></p>
            </div>
            <img :src="image" style="width: 200px; object-fit: cover; height: 100%" alt="">
        </div>

        <table class="referenceTable mb-2">
            <tr>
                <td colspan="2"  style="width: 50%;">Туылғанкүні (күнi, айы, жылы)/ <br>
                Дата рождения (число, месяц, год)</td>
                <td colspan="2"  style="width: 50%;">{{workList.Birthday}}</td>
            </tr>
            <tr>
                <td colspan="2"  style="width: 50%;">Туылғанжерi/Место рождения</td>
                <td colspan="2"  style="width: 50%;">{{workList.Place_Of_Birth}}</td>
            </tr>
            <tr>
                <td style="width: 25%;">Ұлты/Национальность *</td>
                <td style="width: 25%;">{{workList.Nationality}}</td>
                <td style="width: 25%;">Бiлiмi/Образование</td>
                <td style="width: 25%;">{{workList.Education}}</td>
            </tr>
            <tr>
                <td colspan="2"  style="width: 50%;">Оқу орнын бiтiрген жылы және оның атауы/ <br>
                    Год окончания и наименование учебного заведения</td>
                <td colspan="2" v-html="workList.Institution.replaceAll('\n', '<br>')"></td>
            </tr>
            <tr>
                <td colspan="2"  style="width: 50%;">Мамандығы/Специальность</td>
                <td colspan="2"  style="width: 50%;">{{workList.Qualification}}</td>
            </tr>
            <tr>
                <td style="width: 25%;">Шетел тілдерін білуі / Владение 
                    иностранными языками</td>
                <td style="width: 25%;">{{workList.Languages}}</td>
                <td style="width: 25%;">Ғылыми дәрежесi, ғылыми атағы/
                    Ученая степень, ученое звание</td>
                <td style="width: 25%;">{{workList.Academic_Degree}}</td>
            </tr>
            <tr>
                <td colspan="2"  style="width: 50%;">Мемлекеттік наградалары, құрметті атақтары және мерекелік медальдары/ <br>
                     Государственные награды, почетные звания и юбилейные медали</td>
                <td colspan="2"  style="width: 50%;">{{workList.Rank}}</td>
            </tr>
            <tr>
                <td style="width: 25%;">Арнайы тексеру нәтижелерi/
                    Результаты специальной проверки</td>
                <td style="width: 25%;">{{workList.Special_Test_Result}}</td>
                <td style="width: 25%;">Әскери, арнайы атақтары, сыныптық 
                    шені, біліктілік сыныбы, 
                    дипломатиялық дәрежесі (жыл) / <br>
                    Воинское, специальное звания, 
                    классный чин, квалификационный 
                    класс, дипломатический ранг (год)
                </td>
                <td style="width: 25%;">{{workList.Diplomatic_Rank}}</td>
            </tr>
            <tr>
                <td style="width: 25%;">Мемлекеттік қызметке кір келтіретін 
                    терiс қылық жасағаны үшін тәртiптiк 
                    жаза қолданылғаны туралы мәлiмет / <br>
                    Сведения о наложении дисциплинарных 
                    взысканий за совершение 
                    дисциплинарных проступков, 
                    дискредитирующих государственную 
                    службу</td>
                <td style="width: 25%;">{{workList.Corruption}}</td>
                <td style="width: 25%;">Сыбайлас жемқорлық құқық 
                    бұзушылық жасағаны үшiн 
                    әкімшілік жаза қолданылғаны 
                    туралы мәлiмет (қолданылған және 
                    орындалған күні)/ <br>
                    Сведения о наложении административного 
                    взыскания за совершение 
                    коррупционного правонарушения 
                    (дата наложения и исполнения)
                </td>
                <td style="width: 25%;">{{workList.Corruption_Adm}}</td>
            </tr>
            <tr>
                <td style="width: 25%;">Жалпы еңбек өтілі / 
                Общий трудовой стаж</td>
                <td style="width: 25%;">{{workList.Work_Experience}}</td>
                <td style="width: 25%;">Мемлекеттік қызметшінің ант 
                    берген күні / Дата принесения 
                    присяги государственным служащим
                </td>
                <td style="width: 25%;">{{workList.Date_Of_Oath}}</td>
            </tr>
            <tr>
                <td style="width: 25%;">Мемлекеттік қызмет өтілі / Стаж 
                государственной службы</td>
                <td style="width: 25%;">{{workList.Work_Experience_State}}</td>
                <td style="width: 25%;">Отбасылық жағдайы / Семейное положение</td>
                <td style="width: 25%;" v-html="workList.Family_Status.replaceAll('\n', '<br> ')"></td>
            </tr>
        </table>
        <p>* қалауы бойынша толтырылады/заполняется по желанию</p>
        <p>Мөрдің орны <br>
        Место печати</p>
        <br><br>
        <p>М.П. <br>
            М.О</p>
        

        <h2 class="text-h5 text-center font-weight-bold">II. ЕҢБЕК ЖОЛЫ</h2>
        <h2 class="text-h5 text-center font-weight-bold">ТРУДОВАЯ ДЕЯТЕЛЬНОСТЬ</h2>

        <table class="referenceTable mb-2">
            <tr>
                <td colspan="2">Күні/Дата</td>
                <td rowspan="2" class="head">Лауазымы, жұмыс орны, ұйымның орналасқан жерi /Должность, место работы, местонахождение организации</td>
            </tr>
            <tr>
                <td>қабылданған/приема</td>
                <td>босатылған/увольнения</td>
            </tr>
            <tr v-for="place in workList.Labor_Activity" :key="place.id">
                <td>{{place.Date_Start}}</td>
                <td>{{place.Date_End}}</td>
                <td>{{place.Place_Of_Work}}</td>
            </tr>
        </table>
        <p>* қалауы бойынша толтырылады/заполняется по желанию</p>
        <p>Персоналды басқару қызметінің (кадр қызметiнiң) басшысы / <br>
            Руководитель службы управления персоналом (кадровой службы):
        </p>
        <br>
        <p style="border-top: 1px solid black; text-align: center; width: 60%">(тегi, аты, әкесiнiң аты/фамилия, имя, отчество (при наличии))</p>
        <p>Қолы/Подпись ________________ ___________ жыл/год  ______________________________  айы/месяц</p>
        <br>
        <p>Мөрдің орны <br>
            Место печати</p>
            <br><br>
        <p>М.П. <br>
М.О</p>
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

        props: ['workList', 'btnLoader', 'image']  
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

.textUnderline {
    border-bottom: 1px solid #000;
    padding: 0 20px 5px 20px;
    display: inline-block;
    margin-bottom: 2px;
}
</style>