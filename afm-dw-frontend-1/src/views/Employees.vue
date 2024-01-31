<template>
    <div>
        <!-- <p>{{$t('employeesPage.department')}}: {{$t('globalWords.all')}}</p> -->
        <div class="employees">
            <EmployersExpander></EmployersExpander>
        </div>
    </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.employees {
    background: #fff;
    padding: 20px;
}
</style>