<template lang="">
  <div class="overflow-y-scroll h-full flex flex-col" v-loading="loading" element-loading-background="rgba(0,0,0,.7)">
      {{wrapWidth}}
    <ul class="flex flex-wrap justify-around mt-16 overflow-y-scroll" @scroll="loadMore" ref="listWrap">
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
        <li class="w-44 h-44 rounded overflow-hidden  m-2 empty" v-for="item in emptyNum" :key="item"></li>
    </ul>
  </div>
</template>
<script lang="ts"  setup>
    import type { Ref} from "vue";
    import {ref, watchEffect,inject,onMounted,nextTick} from   'vue';
    import { getMvWy } from '/@/api/netease';
    // import { getMvQQ } from '../api/qq';

    const mvList = ref([]);
    const wyPage = ref(1);
    const loading = ref(false);
    // const qqPage = ref(1);
    const listWrap:Ref<null|HTMLUListElement> = ref(null)
    const $filters:any = inject('$filters');
    const getMvListWy = async (page=1) =>{
        loading.value = true;
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
        loading.value = false;
    };
    const emptyNum = ref(0);
    const wrapWidth = ref(0);

    // QQ音乐 Mv列表无返回
    // const getMvListQQ = async(page = 1) => {
    //     qqPage.value = page;
    //     const res = await getMvQQ(page);
    //     let list = [];
    //     if(res.data.response.code === 0){

    //     }
    // };

    // watchEffect(async()=>{

    //     mvList.value = wyPage.value === 1 ? await getMvListWy(wyPage.value) : mvList.value.concat(await getMvListWy(wyPage.value));
        
    //     // getMvListQQ(qqPage.value);
    // });


    watchEffect(()=>{
      // 计算空的li个数
      // 获取ul宽度，获取li宽度，然后计算一行的长度,根据list的个数，算出空的个数；
      // 获取跟节点字体大小
      const fontSize = parseInt(document.documentElement.style.fontSize) || 16;
      const itemWidth = fontSize * 11; // w-44 等于 11rem
      // 一行多少个
      const singleLineNum = Math.floor(wrapWidth.value / (itemWidth + fontSize * 0.55* 2)) ; // mx-2 等于 0.5rem *2
      emptyNum.value =  mvList.value.length % singleLineNum || 0;
    });

    onMounted(()=>{
        getMvListWy(wyPage.value);
        nextTick(()=>{
            wrapWidth.value = listWrap.value?.offsetWidth || 0;
        });
        window.onresize=()=>{
            wrapWidth.value = listWrap.value?.offsetWidth || 0;
        };
    });

    const loadMore = (e) =>{
        const scrollDis = e.target.scrollHeight - e.target.offsetHeight; // 可滚动距离
        if(scrollDis - e.target.scrollTop  < 100 && loading.value === false ){
            console.log('滚动到底部');
            // wyPage.value++;
            getMvListWy(wyPage.value + 1);
        }
    };
</script>
<style lang="">
    
</style>