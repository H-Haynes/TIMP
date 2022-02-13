<template lang="">
  <div
    ref="progress"
    class="h-1 rounded relative bg-white cursor-pointer"
    :style="{
      width:props.width,
    }"
    @click.capture="setPosition"
  >
    <div
      ref="pointer"
      :style="{
        width:`${value}%`,
        backgroundColor:bgColor,
      }"
      class="progress-pointer"
    ></div>
  </div>
</template>
<script lang="ts" setup>
    import type { Ref } from 'vue';

    import {ref} from 'vue';
    const props = defineProps({
        width:{
            type:String,
            default:'100%',
        },
        bgColor:{
            type:String,
            default:'orange',
        },
        value:{
            type:Number,
            default:0,
        },
    });
    const emit = defineEmits(['update:value']);
    const pointer:Ref<null|HTMLElement> = ref(null);
    const progress:Ref<null|HTMLDivElement> = ref(null);
    const setPosition = e =>{
        if(pointer.value){
            pointer.value.style.width = `${e.offsetX}px`;
        }
        if(progress.value){
            const percent = Math.ceil(e.offsetX / progress.value.offsetWidth * 100);
            emit('update:value',percent);
        }
    };
    
</script>
<style lang="less" scoped>  
    .progress-pointer{
        width:0px;
        height:100%;
        position:absolute;
        left:0;
        &::after{
            content:"";
            width:10px;
            height:10px;
            border-radius:50%;
            position:absolute;
            left:calc(100% - 10px);
            top:50%;
            background:orange;
            transform: translateY(-50%);
        }
    }
</style>