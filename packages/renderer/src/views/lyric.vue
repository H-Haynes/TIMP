<template lang="">
  <div
    class=" bg-opacity-10 h-full "
    @mouseenter="focus = true"
    @mouseleave="focus = false"
  >
    <div class="toolbar h-8 relative">
      <div
        v-show="!isLock"
        class="text-gray-400"
      >
        <i
          class="iconfont icon-yanse cursor-pointer hover:text-red-500 hover:font-bold"
          @click="showColorList = true"
        ></i>
        <i
          class="iconfont icon-sousuofangda ml-2 cursor-pointer hover:text-red-500 hover:font-bold"
          @click="magnify"
        ></i>
        <i
          class="iconfont icon-suoxiao ml-2 cursor-pointer hover:text-red-500 hover:font-bold"
          @click="lessen"
        ></i>
        <i
          class="iconfont icon-suoding ml-2 cursor-pointer hover:text-red-500 hover:font-bold"
          @click="fixedWindow"
        ></i>
      </div>
      <ul
        v-show="showColorList"
        class="flex justify-center items-center absolute "
        style="left:50%;bottom:-10px;transform:translateX(-50%)"
      >
        <li
          v-for="item in colorList"
          :key="item"
          class="mr-1"
          @click="()=>{color = item;showColorList = false}"
        >
          <span
            class="cursor-pointer inline-block w-2 h-2"
            :style="{background:item}"
          ></span>
        </li>
      </ul>
      <i
        v-show="isLock && focus"
        class="iconfont icon-suoding text-green-500 cursor-pointer"
        @click="unlockWindow"
      ></i>
    </div>
    <p
      class="font-bold mt-4"
      :style="{fontSize:fontSize + 'px',color:color}"
      v-html="lyric"
    >
    </p>
  </div>
</template>
<script setup lang="ts">
    import {ref,onMounted,watch} from 'vue';
    const isLock = ref(false);
    const lyric = ref('TIMP，你想听的都在这里!');
    const fontSize = ref(+(localStorage.getItem('fontSize')||20));
    const color = ref(localStorage.getItem('color')||'#f40');
    const focus = ref(false);
    const showColorList = ref(false);
    const colorList = ['#f40','#FF6633','#FFFF33','#66FF00','#66FFFF','#3366FF','#6600FF'];
    onMounted(()=>{
          window.api.receive('lyric',(e,message) => {
            if(message){
              lyric.value = message;
            }
          });
    });


    const magnify = () => {
      if(fontSize.value < 40){
        fontSize.value = fontSize.value + 2;
      }
    };

    const lessen = () => {
      if(fontSize.value == 16 ){ return; }
      fontSize.value = fontSize.value - 2;
    };

    const fixedWindow = () => {
      window.api.send('fixed');
      isLock.value = true;
    };

    const unlockWindow = () => {
      window.api.send('unlock');
      isLock.value = false;
    };

    watch([()=>color.value,()=>fontSize.value],()=>{
      // 存储用户设置
      localStorage.setItem('color',color.value);
      localStorage.setItem('fontSize',fontSize.value.toString());
    });

</script>
<style lang="less">
    html,body{
        background:rgba(0,0,0,0);
    }
</style>