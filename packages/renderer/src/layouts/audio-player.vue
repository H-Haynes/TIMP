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
            {{ playInfo.name }}
          </p>
          <i class="iconfont icon-icon-xian- text-sm ml-2 cursor-pointer" />
          <i class="iconfont icon-xunhuan text--sm ml-2 cursor-pointer" />
        </div>
        <p class="flex justify-between items-ceter text-xs mt-1 text-gray-500">
          <span>{{ $filters.secToMin(currentTime) }}</span>
          <span class="truncate mx-2">{{ playInfo.art.reduce((prev,cur)=>{return prev + ' ' + cur.name},'') }}-{{ playInfo.name }}</span>
          <span>{{ $filters.durationFormat(playInfo.time) }}</span>
        </p>
        <el-progress
          :stroke-width="3"
          color="orange"
          :percentage="currentTime * 1000 / playInfo.time * 100"
          class="mt-1"
          :show-text="false"
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

  import {inject,ref,onMounted,watchEffect} from 'vue';
  import { getSongUrlQQ, getSongPicQQ } from '../api/qq';
  import {getSongUrlWy} from '/@/api/netease';
  import { ElMessage } from 'element-plus';
  import DragProgress from '/@/components/DragProgress.vue';
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
  });
  $eventBus.on('playSong',async ({song,type}:any)=>{
    if(type == 1){
      const result = await getSongUrlWy(song.id);
      if(result.data.code == 200){
        playSrc.value = result.data.data[0].url;
      }
    }else if(type == 2){
      const result = await getSongUrlQQ(song.id);
      // 获取播放地址
      if(!result.data.data.playUrl[song.id].error){
        playSrc.value = result.data.data.playUrl[song.id].url;
      }else{
        return ElMessage.error(result.data.data.playUrl[song.id].error);
      }
      playInfo.value = song;
      // 获取歌曲信息
      const infoResult = await getSongPicQQ(song.id);
      if(infoResult.data.response.code === 0){
        playInfo.value.picUrl = infoResult.data.response.data.imageUrl;
      }
    }
  });
  
  // const changeVolume = e =>{
  //   console.log(e)
  //   // if(audio.value){
  //   //   audio.value.volume = e/100;
  //   // }
  // };

  onMounted(()=>{
    if(audio.value){
      // 获取当前音量
      audioVolume.value = audio.value.volume * 100;

          // audio.value.addEventListener('timeupdate',(e)=>{
          //   currentTime.value = e.target.currentTime;
          // });
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