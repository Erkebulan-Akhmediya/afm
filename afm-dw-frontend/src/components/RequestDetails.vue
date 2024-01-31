<template>
  <div>
    <div
      v-for="(v, k) in details"
      :key="k"
      >
      <b v-if="v.name">{{ v.name }}: </b> 
      <!--
        В зависимости от типа отображаем значение
      -->
      <span v-if="v.value_type_id === 3"><span v-for="i, k in v.value" :key="k">{{ v.value?$convertDate(i):'' }}; </span> </span>
      <span v-else-if="v.value_type_id === 7"><span v-for="i, k in v.value" :key="k">{{ v.value=='true'?'Да':'Нет' }}; </span> </span>
      <span v-else-if="v.value_type_id === 4 || v.value_type_id === 5"><span v-for="i, k in v.list_value" :key="k">{{ i.selectedRow.text }}; </span></span>
      <span v-else ><span v-for="i, k in v.value" :key="k">{{ i }}; </span></span>
    </div>
  </div>
</template>
<script>
export default {
  props: ['details']
}
</script>