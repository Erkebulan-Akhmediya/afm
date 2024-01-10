<template>
    <div>
        <div class="properties">
            <h2>404! Мы не смогли найти такую страницу!</h2>
            <router-link :to="'/'"> Вернитесь на главную</router-link>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .properties {
        height: 100vh;
        background-color: #fff;
        padding: 20px;

        h2 {
            font-size: 30px;
        }
    }
</style>