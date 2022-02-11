<template lang="">
  <div
    v-loading="loading"
    class="h-full"
    element-loading-background="transparent"
  >
    <ul class="flex flex-wrap justify-around">
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
    </ul>
  </div>
</template>
<script lang="ts" setup>
    import {ref, watchEffect} from 'vue';
    import {getRecommendQQ} from '/@/api/qq';
    const loading=ref(false);
    const playList = ref([]);

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
</script>
<style lang="">
    
</style>