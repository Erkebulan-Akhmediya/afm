<script>
export default {};
</script>

<template>
    <div 
        class="ml-15 py-3 pl-10 grid-container" 
        style="margin-top: 10px;"
    >
        <div class="item1">
            <v-img 
                class="d-flex justify-center align-center"
                width="60" 
                src="../../assets/img/login/logo_afm.png"
            ></v-img>
        </div>

        <div 
            class="item2" 
            style="margin-top: 10px"
        >
            <span 
                style="color: #001d2f; 
                font-size: 25px;"
            >
                АФМ РК
            </span>
        </div>

        <div 
            class="item3" 
            style="margin-top: 12px"
        >
            <span 
                style="color: #001d2f; 
                font-size: 14px;"
            >
                АИС Цифровое рабочее место
            </span>
        </div>
    </div>
</template>

<style>

.item1 { grid-area: item1; }
.item2 { grid-area: item2; }
.item3 { grid-area: item3; }

.grid-container {
    background-color: white;

    display: grid;
    grid-template-columns: 90px auto;
    grid-template-rows: 25px;
    grid-template-areas:
        'item1 item2'
        'item1 item3';
}

</style>