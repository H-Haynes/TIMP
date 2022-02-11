<template lang="">
  <div
    v-loading="loading"
    class="flex-1 overflow-y-scroll"
    style="height:calc(100% - 4rem)"
    element-loading-background="transparent"
    @scroll="scroll"
  >
    <div
      class="h-full"
    >
      <ul class="flex flex-wrap justify-around" ref="listWrap">
        <li
          v-for="list in playList"
          :key="list.id||list.name"
          class="w-40 mb-4 flex flex-col justify-center items-center"
        >
          <router-link :to="{path:'/album',query:{type:2,id:list.id}}">
            <el-image
              lazy
              class="w-40 h-40"
              :src="list.picUrl"
            />
            <p class="mt-1 text-left text-xs h-10 overflow-hidden text-gray-200 font-medium">
              {{ list.name }}
            </p>
          </router-link>
        </li>
        <li
          v-for="item in emptyNum"
          :key="item"
          class="w-40 mb-4 flex flex-col justify-center items-center"
        ></li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
    import type{Ref} from 'vue';
    import {ref, watchEffect} from 'vue';
    import {getRecommendQQ} from '/@/api/qq';
    const loading=ref(false);
    const playList = ref([]);
    const emptyNum = ref(0);
    const listWrap:Ref<HTMLUListElement|null> = ref(null);

    watchEffect(()=>{
        loading.value = true;
        getRecommendQQ().then((res: any)=>{
            if(res.data.response.code === 0){
                const list = res.data.response.playlist.data.v_playlist.map(ele=>{
                    ele.name = ele.title;
                    ele.picUrl = ele.cover_url_medium;
                    ele.id = ele.tid;
                    return ele;
                });
                playList.value = list;
            }
            loading.value = false;

        });
    });
    watchEffect(()=>{
      // 计算空的li个数
      // 获取ul宽度，获取li宽度，然后计算一行的长度,根据list的个数，算出空的个数；
      // 获取跟节点字体大小
      const fontSize = parseInt(document.documentElement.style.fontSize) || 16;
      const wrapWidth = listWrap.value?.offsetWidth || 0;
      const itemWidth = fontSize * 10; // w-40 等于 10rem
      // 一行多少个
      const singleLineNum = Math.floor(wrapWidth / (itemWidth + fontSize * 0.25* 2)) ; // mx-1 等于 0.25rem *2
      console.log(singleLineNum);
      emptyNum.value =  playList.value.length % singleLineNum;
    });

    const scroll = e => {
        const scrollDis = e.target.scrollHeight - e.target.offsetHeight; // 可滚动距离
        if(scrollDis - e.target.scrollTop  < 100 && loading.value === false){
          console.log('滚动到底部');
          // getAlbumList(currentCategory.value,page.value + 1);
        }
    };
</script>
<style lang="">
    
</style>