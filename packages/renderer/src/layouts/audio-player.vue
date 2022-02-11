<template lang="">
  <div class="h-16 flex justify-between items-center bg-primary-100 border-t border-primary-500 px-5">
    <div class="flex text-gray-400 items-center h-full ">
      <i class="iconfont icon-shangyishou mx-4  text-xl cursor-pointer" />
      <i class="iconfont icon-bofang mx-4 text-xl cursor-pointer" />
      <i class="iconfont icon-xiayishou mx-4 text-xl cursor-pointer" />
    </div>
    <div class="flex w-96  items-center text-sm text-gray-400 h-full">
      <el-avatar
        class="flex-shrink-0"
        shape="square"
        size="large" 
        :src="playInfo.picUrl"
      />
      <div class="flex overflow-hidden flex-1 flex-col w-full item-center mx-2">
        <div class="flex">
          <p class="flex-1 truncate">
            {{ playInfo.name || "TIMP，随心听曲" }}
          </p>
          <i class="iconfont icon-icon-xian- text-sm ml-2 cursor-pointer" />
          <i class="iconfont icon-xunhuan text--sm ml-2 cursor-pointer" />
        </div>
        <p class="flex justify-between items-ceter text-xs mt-1 text-gray-500">
          <span>{{ $filters.secToMin(currentTime) }}</span>
          <span
            v-if="playInfo.name"
            class="truncate mx-2"
          >{{ playInfo.art.reduce((prev,cur)=>{return prev + ' ' + cur.name},'') }}-{{ playInfo.name }}</span>
          <span v-else>暂无歌曲</span>
          <span>{{ $filters.durationFormat(playInfo.time) }}</span>
        </p>
        <!-- <el-progress
          :stroke-width="3"
          color="orange"
          :percentage="currentTime * 1000 / playInfo.time * 100"
          class="mt-1"
          :show-text="false"
        /> -->
        <drag-progress
          class="my-1"
          :value="playInfo.time ? currentTime * 1000 / playInfo.time * 100 : 0"
          @update:value="setCurrentTime"
        />
      </div>
    </div>
    <div class="flex text-gray-400">
      <i class="iconfont icon-list mr-4 text-lg" />
      <div class="flex items-center">
        <i class="iconfont icon-yinliang mr-2 text-lg" />
        <drag-progress
          :value="audioVolume"
          width="150px"
          @update:value="e=>audioVolume = e"
        />
      </div>
      <i class="iconfont icon-ci ml-2 text-lg" />
    </div>
    <audio
      ref="audio"
      autoplay
      :src="playSrc"
    ></audio>
  </div>
</template>
<script lang="ts" setup>
  import type {Ref} from 'vue';
  import { platform} from '../../typings/enum';
  import {inject,ref,onMounted,watchEffect} from 'vue';
  import { getSongUrlQQ, getSongPicQQ, getSongInfoQQ } from '../api/qq';
  import {getSongUrlWy,getSongDetailWy} from '/@/api/netease';
  import { ElMessage } from 'element-plus';
  const $eventBus:any = inject('$eventBus');
  const $filters = inject('$filters');
  const playSrc = ref('');
  const audio:Ref<null|HTMLAudioElement> = ref(null);
  const currentTime = ref(0);
  const audioVolume = ref(1);
  const playInfo = ref({
    name:'',
    art:[],
    time:0,
    picUrl:'',
    albumId:'',
  });

  // 获取歌曲信息，包含:name,time,picUrl,art
  const getSongInfo = async (id:string|number,platformType:platform) =>{
    let songInfo = {
      name:'',
      art:[],
      time:0,
      picUrl:'',
      albumId:'',
    };
    if(platformType == platform.wy){
      const result = await getSongDetailWy(id);
      if(result.data.code === 200){
        songInfo.name = result.data.songs[0].name;
        songInfo.art = result.data.songs[0].ar;
        songInfo.picUrl = result.data.songs[0].al.picUrl;
        songInfo.time = result.data.songs[0].dt;
      }
    }else if(platformType == platform.qq){
      // 获取歌曲信息
      const infoResult = await getSongInfoQQ(id);
      if(infoResult.data.response.code === 0){
        songInfo.art = infoResult.data.response.songinfo.data.track_info.singer.map(ele=>{
          return {
            name:ele.name,
            id:ele.mid,
          };
        });
        songInfo.name = infoResult.data.response.songinfo.data.track_info.title;
        songInfo.time = infoResult.data.response.songinfo.data.track_info.interval * 1000;
        songInfo.albumId = infoResult.data.response.songinfo.data.track_info.album.mid;
      }
      const picResult = await getSongPicQQ(songInfo.albumId);
      if(picResult.data.response.code === 0){
        songInfo.picUrl = picResult.data.response.data.imageUrl;
      }
    }
    return songInfo;
  };

  // 获取播放地址
  const getSongUrl = async (id:string|number,platformType:platform)=>{
    if(platformType == platform.wy){
      const result = await getSongUrlWy(id);
      if(result.data.code == 200){
        return result.data.data[0].url;
      }else{
        return ElMessage.error('暂无播放地址');
      }
    }else if(platformType == platform.qq){
      const result = await getSongUrlQQ(id);
      if(!result.data.data.playUrl[id].error){
        return result.data.data.playUrl[id].url;
      }else{
        return ElMessage.error(result.data.data.playUrl[id].error);
      }
    }
  };

  


  $eventBus.on('playSong',async ({id:songId,type}:any)=>{
    const songUrl = await getSongUrl(songId,type);
    playSrc.value = songUrl;
    playInfo.value = await getSongInfo(songId,type);
      
  });
  const setCurrentTime = (percent:number) =>{
    console.log(percent,playInfo.value.time);
    currentTime.value = percent/100 * playInfo.value.time / 1000;
    if(audio.value){
      audio.value.currentTime = currentTime.value;
      if(audio.value.paused){
        audio.value.play();
      }
    }
  };

  onMounted(()=>{
    if(audio.value){
      // 获取当前音量
      audioVolume.value = audio.value.volume * 100;

      audio.value.addEventListener('timeupdate',(e:any)=>{
        currentTime.value = e.target.currentTime;
      });
    }
  });
  watchEffect(()=>{
    if(audio.value){
      audio.value.volume = audioVolume.value / 100;
    }
  });

</script>
<style lang="">
    
</style>