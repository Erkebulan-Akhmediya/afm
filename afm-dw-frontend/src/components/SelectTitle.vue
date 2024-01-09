<template>
  <div class="custom-select" :tabindex="tabindex" @blur="open = false">
    <div class="selected" :class="{ open: open }" @click="open = !open">
      {{ selected }}
    </div>
    <div class="items" :class="{ selectHide: !open }">
      <div
        v-for="(option, i) of options"
        :key="i"
        @click="
          selected = option;
          open = false;
          $emit('input', option);
        "
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    default: {
      type: String,
      required: false,
      default: null,
    },
    tabindex: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      selected: this.default
        ? this.default
        : this.options.length > 0
        ? this.options[0]
        : null,
      open: false,
    };
  },
  mounted() {
    this.$emit("input", this.selected);
  },
};
</script><style scoped>
.custom-select {
  position: relative;
  width: 5rem;
  text-align: left;
  outline: none;
  height: 47px;
  line-height: 47px;
}

.custom-select .selected {
  border-radius: 6px;
  color: #2196F3;
  padding-left: 1em;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
}

.custom-select .selected:after {
  position: relative;
  content: "";
  top: .6rem;
  left: .5rem;
  border: 5px solid transparent;
  border-color: #AEAEAE transparent transparent transparent;
}

.custom-select .items {
  color: #707683;
  border-radius: 5px;
  border: 1px solid #707683;
  overflow: hidden;
  width: 10rem;
  position: absolute;
  background-color: #fff;
  left: 0;
  right: 0;
  z-index: 1;
}

.custom-select .items div {
  color: #707683;
  padding-left: 1em;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.custom-select .items div:hover {
  background-color: #eeeeee;
}

.selectHide {
  display: none;
}
</style>