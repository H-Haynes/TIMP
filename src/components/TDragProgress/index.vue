<template lang="">
  <div
    ref="progressRef"
    class="h-1 rounded relative bg-white cursor-pointer"
    :style="{
      width: props.width
    }"
    @click.capture="setPosition"
  >
    <div
      ref="pointerRef"
      :style="{
        width: `${value}%`,
        backgroundColor: bgColor
      }"
      class="progress-pointer"
    ></div>
  </div>
</template>
<script lang="ts" setup>
interface DragProgressProps {
  width?: string
  bgColor?: string
  value?: number
}
const props = withDefaults(defineProps<DragProgressProps>(), {
  width: "100%",
  bgColor: "orange",
  value: 0
})

const emits = defineEmits(["update:value"])
const pointerRef = ref()
const progressRef = ref()
const setPosition = (e) => {
  if (pointerRef.value) {
    pointerRef.value.style.width = `${e.offsetX}px`
  }
  if (progressRef.value) {
    const percent = Math.ceil((e.offsetX / progressRef.value.offsetWidth) * 100)
    emits("update:value", percent)
  }
}
</script>
<style lang="scss" scoped>
.progress-pointer {
  width: 0px;
  height: 100%;
  position: absolute;
  left: 0;
  &::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    position: absolute;
    left: calc(100% - 10px);
    top: 50%;
    background: orange;
    transform: translateY(-50%);
  }
}
</style>
