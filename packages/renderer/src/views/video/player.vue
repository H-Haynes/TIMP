<template lang="">
  <div class="px-4 flex justify-around h-full">
    <div class="mt-16  flex justify-around flex-1 overflow-hidden hideScrollBar">
      <div style="width:550px">
        <div
          class="relative overflow-hidden"
          style="width:550px;height:300px"
        >
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
        <p class="text-gray-500 text-xs text-left leading-5 px-5 my-2">
          {{ videoData.desc }}
        </p>
        <p class="text-xs text-gray-500 flex  px-5">
          <span>发布时间：{{ $filters.timeFormat(videoData.publishTime) }}</span>
          <span class="ml-8">播放：{{ videoData.playCount }}次</span>
        </p>

        <!-- <p
          v-show="mvType == 2"
          class="mt-8"
        >
          当前视频来源于QQ音乐平台，因版权原因可能无法播放!
        </p> -->
      </div>

      <div class="w-56  ml-5 h-full overflow-y-scroll">
        <ul>
          <router-link
            v-for="mv in relatedList"
            :key="mv.id"
            :to="{path:'/video/player',query:{type:mvType,id:mv.id}}"
          >
            <li
              :key="mv.id"
              class="h-32  w-full mb-5 rounded overflow-hidden cursor-pointer relative"
            >
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
    </div>
  </div>
</template>
<script lang="ts" setup>
    import type {Ref} from 'vue';
    import {ref, watchEffect,inject,onMounted} from 'vue';
    import {useRoute} from 'vue-router';
    import { getMvDataWy,getRelatedVideoWy,getVideoUrlWy,getVideoDataWy } from '/@/api/netease';
    import { getMvDataQQ } from '/@/api/qq';
    import {getSongDetailKW, getUrlKW} from '/@/api/kuwo';
import { ElMessage } from 'element-plus';
    const route = useRoute();
    const mvId = ref(route.query.id);
    const mvType = ref(route.query.type);
    const video:Ref<null|HTMLVideoElement> = ref(null);
    const videoData = ref({});
    const $filters:any = inject('$filters');
    const $eventBus:any = inject('$eventBus');
    const relatedList = ref([]);
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
            let urlList = res.data.response.getMVUrl.data[id].mp4.reduce((prev,cur)=>prev.concat(cur.freeflow_url),[]);
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

            relatedList.value = res.data.response.other.data.list.map(ele=>({
                name:ele.name,
                pic:ele.cover_pic,
                time:ele.duration * 1000,
                id:ele.vid,
                playCount:ele.playcnt,
            }));
        }
        return videoInfo;
    };

    const getVideoWy = async(id) =>{
        let videoInfo = {};
        let url;
        const res = await getVideoUrlWy(id);
        if(res.data.code === 200){
            url = res.data.urls?.[0]?.url;
        }
        const dataResult = await getVideoDataWy(id);
        if(dataResult.data.code == 200){
            let {coverUrl:pic,title:name,description:desc,publishTime,playTime:playCount} = dataResult.data.data;
            let art = [{
                name:dataResult.data.data.creator.nickname,
                id:dataResult.data.data.creator.userId,
                type:1,
                headimg:dataResult.data.data.creator.avatarUrl,
            }];
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

    const getVideoKW = async (id) => {
      let videoInfo = {};
      let url;
      const res = await getUrlKW(id,'mv');
      if(res.data.code === 200){
        url = res.data.url;
      }else{
        ElMessage.error(res.data.msg);
      }
      const dataResult = await getSongDetailKW(id);
      if(res.data.code === 200){
        let {pic,name,albuminfo:desc,releaseDate:publishTime,mvPlayCnt:playCount} = res.data.data;
        let art = [{
          name:res.data.data.artist,
          id:res.data.data.artistid,
          type:4,
          headimg:res.data.data.pic120,
        }];
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
            if(isNaN(+mvId.value)){
               videoData.value =  await getVideoWy(mvId.value);
            }else{
                videoData.value =  await getWyMv(mvId.value);
            }
        }else if(mvType.value === '2'){
           videoData.value =  await getMvQQ(mvId.value);
        }else if(mvType.value === '4'){
          videoData.value =  await getVideoKW(mvId.value);
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

    const getRelatedWy = async (id) => {
        const res = await getRelatedVideoWy(id);
        if(res.data.code === 200 ){
            relatedList.value = res.data.data.map(ele=>({
                name:ele.title,
                pic:ele.coverUrl,
                time:ele.durationms,
                id:ele.vid,
                playCount:ele.playTime,
            }));
        }
    };
    watchEffect(()=>{
        if(mvType.value === '1') getRelatedWy(mvId.value);

    });


</script>
<style lang="">
    
</style>