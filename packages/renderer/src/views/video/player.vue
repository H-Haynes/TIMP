<template lang="">
  <div class="mt-16 px-4">
    <div style="width:550px">
        <div class="relative overflow-hidden" style="width:550px;height:300px">
            <video
                ref="video"
                :src="videoData.url"
                :poster="videoData.pic"
                controls
                class="rounded object-contain w-full h-full"
            ></video>
        </div>
      <div class="flex items-center text-gray-400 my-4 px-5 text-sm">
        <el-avatar
          :src="videoData.pic"
          class="mt-2 mr-5"
        ></el-avatar>
        <span>{{ videoData?.art?.map(ele=>ele.name).join('/') }}</span>
      </div>
      <p class="text-left my-1 px-5  text-xl text-gray-300 font-bold">
        {{ videoData.name }}
      </p>
      <p class="text-gray-500 text-xs text-left leading-5 px-5 my-2">{{videoData.desc}}</p>
      <p class="text-xs text-gray-500 flex  px-5">
        <span>发布时间：{{ $filters.timeFormat(videoData.publishTime) }}</span>
        <span class="ml-8">播放：{{ videoData.playCount }}次</span>
      </p>
    </div>

    <p class="mt-8" v-show="mvType == 2">当前视频来源于QQ音乐平台，因版权原因可能无法播放!</p>
  </div>
</template>
<script lang="ts" setup>
    import type {Ref} from 'vue';
    import {ref, watchEffect,inject,onMounted} from 'vue';
    import {useRoute} from 'vue-router';
    import { getMvDataWy } from '/@/api/netease';
    import { getMvDataQQ } from '/@/api/qq';
    const route = useRoute();
    const mvId = ref(route.query.id);
    const mvType = ref(route.query.type);
    const video:Ref<null|HTMLVideoElement> = ref(null);
    const videoData = ref({});
    const $filters:any = inject('$filters');
    const $eventBus:any = inject('$eventBus');
    const getWyMv = async(id) => {
        const res = await getMvDataWy(id);
        let videoInfo = {};
        if(res.data.code === 200){
            let {cover:pic,desc,name,publishTime,playCount} =   res.data.data;
            let art = res.data.data.artists.map(ele=>({
                name:ele.name,
                id:ele.id,
                type:1,
            }));
            let url = res.data.data.brs[1080] || res.data.data.brs[720] || res.data.data.brs[480] || res.data.data.brs[240];
            videoInfo = {
                pic,
                desc,
                name,
                art,
                playCount,
                url,
                publishTime,
            };
        }
        return videoInfo;
    };

    const getMvQQ = async(id) =>{
        const res = await getMvDataQQ(id);
        let videoInfo = {};
        if(res.data.response.code === 0){
            let {cover_pic:pic,name,desc,pubdate:publishTime,playcnt:playCount} = res.data.response.mvinfo.data[id];
            publishTime *= 1000;
            let art = res.data.response.mvinfo.data[id].singers.map(ele=>({
                name:ele.name,
                id:ele.mid,
                type:2,
                headimg:ele.picurl,
            }));
            let urlList = res.data.response.getMVUrl.data[id].mp4.reduce((prev,cur)=>prev.concat(cur.url),[]);
            urlList = [...new Set(urlList)];
            let url = urlList[0];
            videoInfo = {
                pic,
                desc,
                name,
                art,
                playCount,
                url,
                publishTime,
            };
        }
        return videoInfo;
    };

    watchEffect(async ()=>{
        if(mvType.value === '1'){
           videoData.value =  await getWyMv(mvId.value);
        }else if(mvType.value === '2'){
           videoData.value =  await getMvQQ(mvId.value);
        }
    });

    onMounted(()=>{
        if(video.value){
            video.value.onplay = ()=>{
                // 暂停音乐播放
                $eventBus.emit('pauseSong');
            };
        }
    });

</script>
<style lang="">
    
</style>