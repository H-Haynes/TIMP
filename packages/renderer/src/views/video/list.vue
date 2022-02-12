<template lang="">
  <div class="overflow-y-scroll h-full flex flex-col">
    <ul class="flex flex-wrap justify-around mt-16 overflow-y-scroll">
    <router-link v-for="mv in mvList" :key="mv.id" :to="{path:'/video/player',query:{type:1,id:mv.id}}">
      <li class="w-44 h-44 rounded overflow-hidden  m-2 relative cursor-pointer">
        <img
          :src="mv.pic"
          class="w-full h-full object-cover"
        >
        <span class="absolute left-1 top-1 text-xs text-white ">{{ $filters.durationFormat(mv.time) }}</span>
        <div class="absolute right-1 top-1 text-xs text-gray-300">
          <i class="iconfont icon-bofang2 text-xs mr-1" />
          <span>{{ $filters.countFormat(mv.playCount) }}</span>
        </div>
        <p class="absolute bottom-0 leading-5 px-2 left-0 text-xs text-center truncate bg-gray-500 bg-opacity-50 text-white w-full">
          {{ mv.name }}
        </p>
      </li>
      </router-link>
    </ul>
  </div>
</template>
<script lang="ts"  setup>
    import {ref, watchEffect,inject} from   'vue';
    import { getMvWy } from '/@/api/netease';
    // import { getMvQQ } from '../api/qq';

    const mvList = ref([]);
    const wyPage = ref(1);
    // const qqPage = ref(1);
    const $filters:any = inject('$filters');
    const getMvListWy = async (page=1) =>{
        wyPage.value = page;
        const res = await getMvWy(page);
        let list = [];
        if(res.data.code===200){
            list = res.data.data.map(ele=>({
                name:ele.name,
                id:ele.id,
                time:ele.duration,
                playCount:ele.playCount,
                pic:ele.cover,
                desc:ele.desc,
            }));
        }
        mvList.value = wyPage.value === 1 ? list : mvList.value.concat(list);
    };

    // QQ音乐 Mv列表无返回
    // const getMvListQQ = async(page = 1) => {
    //     qqPage.value = page;
    //     const res = await getMvQQ(page);
    //     let list = [];
    //     if(res.data.response.code === 0){

    //     }
    // };

    watchEffect(()=>{
        getMvListWy(wyPage.value);
        // getMvListQQ(qqPage.value);
    });
</script>
<style lang="">
    
</style>