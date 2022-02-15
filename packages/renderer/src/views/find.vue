<template lang="">
  <div class="text-white  h-full">
    <ul class="h-16 flex items-center text-sm p-4">
      <li
        v-for="platform in platformList"
        :key="platform.type"
        class="mx-2 cursor-pointer hover:text-orange-500"
        :class="{'text-orange-500':platformType == platform.type}"
        @click="platformType = platform.type"
      >
        {{ platform.name }}
      </li>
    </ul>
    <keep-alive>
      <component :is="componentId"></component>
    </keep-alive>
  </div>
</template>
<script lang="ts" setup>
    import {ref, computed, watchEffect} from 'vue';
    import NeteaseFind from './NeteaseFind.vue';
    import QQFind from './QQFind.vue';
    import kuwoFind from './kuwoFind.vue';
    import kugouFind from './kugouFind.vue';
    const platformList = ref([
        {
            name:'网易云音乐',
            type: 1,
        },
        {
            name:'QQ音乐',
            type: 2,
        },
        {
            name:'酷狗音乐',
            type:3,
        },
        {
            name:'酷我音乐',
            type:4,
        },
        // {
        //     name:'咪咕音乐',
        //     type:5,
        // },
    ]);
    const platformType = ref(Number(sessionStorage.getItem('platformType') || 1));
   
    const componentId = computed(()=>{
      let component;
      switch(platformType.value){
        case 1: component = NeteaseFind;break;
        case 2: component = QQFind;break;
        case 3: component = kugouFind;break;
        case 4: component = kuwoFind;break;
      }
      return component;
    });

   watchEffect(()=>{
     sessionStorage.setItem('platformType',platformType.value.toString());
   });


</script>