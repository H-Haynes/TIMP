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
    <div class="h-full flex-1 overflow-y-scroll">
      <ul class="flex flex-wrap justify-around">
        <li
          v-for="list in playList"
          :key="list.id||list.name"
          class="w-40 mb-4 flex flex-col justify-center items-center"
        >
          <router-link :to="{path:'/album',query:{type:platformType,id:list.id}}">
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
  </div>
</template>
<script lang="ts" setup>
    import {ref, watchEffect} from 'vue';
    import {getRecommendQQ} from '/@/api/qq';
    import {getRecommendWy} from '/@/api/netease';
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
        {
            name:'咪咕音乐',
            type:5,
        },
    ]);
    const platformType = ref(1);
    const loading=ref(false);
    const playList = ref([]);
    watchEffect(()=>{
        console.log(platformType.value);
        loading.value = true;
        if(platformType.value === 1){
            getRecommendWy().then(res=>{
                if(res.data.code === 200){
                    playList.value = res.data.result;
                }
                loading.value = false;
            });
        }else if(platformType.value == 2){
            getRecommendQQ().then((res: any)=>{
                if(res.data.response.code === 0){
                    const list = res.data.response.playlist.data.v_playlist.map(ele=>{
                        ele.name = ele.title;
                        ele.picUrl = ele.cover_url_medium;
                        return ele;
                    });
                    playList.value = list;
                }
                loading.value = false;

            });
        }
    });
</script>
<style lang="">
    
</style>