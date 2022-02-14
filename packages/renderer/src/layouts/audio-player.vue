<template lang="">
  <div class="h-16 flex justify-between items-center bg-primary-100 border-t border-primary-500 px-5">
    <div class="flex text-gray-400 items-center h-full ">
      <i
        class="iconfont icon-shangyishou mx-4  text-xl cursor-pointer"
        @click="prevSong"
      />
      <i
        class="iconfont  mx-4 text-xl cursor-pointer"
        :class="{'icon-zantingtingzhi':audioState === 'play','icon-bofang':audioState === 'pause'}"
        @click="toggleState"
      />
      <i
        class="iconfont icon-xiayishou mx-4 text-xl cursor-pointer"
        @click="nextSong"
      />
    </div>
    <div class="flex w-96  items-center text-sm text-gray-400 h-full">
      <el-avatar
        class="flex-shrink-0"
        shape="square"
        size="large" 
        :src="playInfo.picUrl || poster"
        @click="showLyricPanel= !showLyricPanel"
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
        <drag-progress
          class="my-1"
          :value="playInfo.time ? currentTime * 1000 / playInfo.time * 100 : 0"
          @update:value="setCurrentTime"
        />
      </div>
    </div>
    <div class="flex text-gray-400">
      <i
        class="iconfont icon-list mr-4 text-lg"
        @click="visiblePlayList = true"
      />
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
      :src="playSrc"
    ></audio>

    <el-drawer
      v-model="visiblePlayList"
      :show-close="false"
    >
      <template #title>
        <div class="">
          播放列表
        </div>
      </template>
      <el-table
        :data="playList"
        @row-dblclick="toggleSong"
      >
        <el-table-column label="歌曲名">
          <template #default="scope">
            <span
              class="truncate"
              :class="{'text-red-500':curSongId == scope.row.id}"
            >{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="歌手">
          <template #default="scope">
            <span
              class="truncate"
              :class="{'text-red-500':curSongId == scope.row.id}"
            >
              {{ scope.row.art.reduce((prev,cur)=>{return prev + ' ' + cur.name},'') }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <!-- <ul>
        <li v-for="item in playList" class="text-left flex text-gray-400 py-1 px-2 text-sm truncate cursor-pointer hover:bg-gray-700" :key="item.id">
          <span class="flex-5 truncate">{{item.name}}</span> 
          <span class="flex-1"> - </span>
          <span class="flex-5 truncate">{{item.art.reduce((prev,cur)=>{return prev + ' ' + cur.name},'')}}</span>
        </li>
      </ul> -->
    </el-drawer>
    <div class="absolute  h-full border w-full bottom-0 left-0 bg-red-500">
    
    </div>
  </div>
</template>
<script lang="ts" setup>
  import type {Ref } from 'vue';
  import { platform} from '../../typings/enum';
  import {inject,ref,onMounted,watchEffect,toRaw, nextTick} from 'vue';
  import { getSongUrlQQ, getSongPicQQ, getSongInfoQQ } from '../api/qq';
  import {getSongUrlWy,getSongDetailWy,getLyricWy} from '/@/api/netease';
  import { ElMessage } from 'element-plus';
  import poster from '@/../assets/poster.jpg';
  import { getMusicUrlKW,getSongDetailKW } from '../api/kuwo';
  import { getSongDetailKG } from '../api/kugou';
  const $eventBus:any = inject('$eventBus');
  const $filters:any = inject('$filters');
  const playSrc = ref('');
  const audio:Ref<null|HTMLAudioElement> = ref(null);
  const currentTime = ref(0);
  const audioVolume = ref(1);
  const audioState = ref('pause');
  const playList = inject('playList');
  const curSongId = ref(localStorage.getItem('curSongId')||'');
  const visiblePlayList = ref(false);
  const appear = ref(true);
  const lyric = ref([]);
  const platformType = ref(0);
  const showLyricPanel = ref(false);
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
    }else if(platformType === platform.kw){
      let mid = id.toString().match(/\d+/)?.[0];
      const result = await getSongDetailKW(mid as string);
      if(result.data.code === 200){
        songInfo = {
          name:result.data.data.name,
          art:[{
            name: result.data.data.artist,
            id: result.data.data.artistid,
          }],
          time:result.data.data.duration * 1000,
          picUrl:result.data.data.pic,
        };
      }
    }else if(platformType === platform.kg){
      const result = await getSongDetailKG(id);
      songInfo = {
        name:result.data.songName,
        time:result.data.timeLength * 1000,
        picUrl:result.data?.imgUrl?.replace('{size}','400'),
        art:Array.isArray(result.data.authors)?result.data.authors?.map(ele=>({
          name:ele.author_name,
          id:ele.author_id,
        })) : [{
          name:result.data.singerName || result.data.author_name,
          id: result.data.singerId,
        }],
      };
    }
    return songInfo;
  };

  // 获取播放地址
  const getSongUrl = async (id:string|number,platformType:platform)=>{
    if(platformType == platform.wy){
      const result = await getSongUrlWy(id);
      if(result.data.code == 200 && result.data.data[0].url){
        return result.data.data[0].url;
      }else{
        ElMessage.error('暂无播放地址');
        return false;
      }
    }else if(platformType == platform.qq){
      const result = await getSongUrlQQ(id);
      if(!result.data.data.playUrl[id].error){
        return result.data.data.playUrl[id].url;
      }else{
        ElMessage.error(result.data.data.playUrl[id].error);
        return false;
      }
    }else if(platformType == platform.kw){

      const result = await getMusicUrlKW(id);
      if(result.data.code === 200){
        return result.data.data;
      }else{
        ElMessage.error('暂无播放地址');
        return false;
      }
    }else if(platformType == platform.kg){
      const result = await getSongDetailKG(id);
      return result.data.url || result.data.backup_url[0];
    }
  };

  // 获取歌词
  const getLyric = async (id:string,platformType:platform) => {
    let list = [];
    if(platformType === platform.wy ){
      const result = await getLyricWy(id);
      if(result.data.code == 200){
        let lyricArr = result.data.lrc.lyric.split('\n').filter(ele=>ele.trim()); // 去除空的
        list = lyricArr.map(ele=>{
          let temp = ele.split(']');
          let words = temp[1].trim();
          let time = temp[0].replace('[','').trim();
          return {
            time:$filters.durationTransSec(time),
            words,
          };
        });
      }
    }
    return list;
  };

  watchEffect(async()=>{
    if(curSongId.value){
      localStorage.setItem('curSongId',curSongId.value);
    }
  });

  watchEffect(async ()=>{
    if(appear.value && playList.value.length){
      let song = playList.value.find(ele=>ele.id == curSongId.value);
      lyric.value = await getLyric(curSongId.value,song.type);
      playSrc.value  = await getSongUrl(curSongId.value,song.type);
      playInfo.value= await getSongInfo(curSongId.value,song.type);
      appear.value = false;
      audio.value?.pause();

    }
  });


  // 监听播放歌曲
  $eventBus.on('playSong',async ({id:songId,type,auto=false}:any)=>{
    if(curSongId.value == songId) return; // 当前歌曲不切换
    const songUrl = await getSongUrl(songId,type);
    if(!songUrl){
      return;
    }
    playSrc.value = songUrl;
    playInfo.value = await getSongInfo(songId,type);
    
    // 触发添加播放列表事件, 并传递当前播放歌曲信息:歌曲id,歌曲名称,歌手，歌曲平台
    platformType.value = type;
    curSongId.value = songId;
    audio.value?.play();
    if(!auto){ // 如果不是自动切歌，则添加到播放列表
      $eventBus.emit('addPlayList',{
        id:songId,
        type:type,
        name:playInfo.value.name,
        art:playInfo.value.art.map(ele=>({name:ele.name,id:ele.id})),
        timestamp:Date.now(),
      });
    }
  });

  // 监听暂停歌曲
  $eventBus.on('pauseSong',()=>{
    audio.value?.pause();
  });
  const setCurrentTime = (percent:number) =>{
    if(!playInfo.value.time){
      return currentTime.value= 0;
    }
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
    // nextTick(()=>{
    //   curSongId.value =localStorage.getItem('curSongId')||'';
    // });
    if(audio.value){
      // 获取当前音量
      audioVolume.value = audio.value.volume * 100;

      audio.value.addEventListener('timeupdate',(e:any)=>{
        currentTime.value = e.target.currentTime;
      });
      // audio事件监听
      audio.value.addEventListener('play',()=>{
        audioState.value = 'play';
      });

      audio.value.addEventListener('pause',()=>{
        audioState.value = 'pause';
      });

      audio.value.addEventListener('ended',()=>{
        // 将时间设置为0
        currentTime.value = 0;
        audioState.value = 'pause';
        // 切换下一首
        nextSong();
      });
    }
  });
  watchEffect(()=>{
    if(audio.value){
      audio.value.volume = audioVolume.value / 100;
    }
  });

  // 切换播放状态
  const toggleState = () => {
    if(audioState.value === 'play'){
      audio.value?.pause();
    }else{
      audio.value?.play();
    }
  };
  
  const nextSong = () =>{
    // 获取到当前索引;
    const index = playList.value.findIndex(ele=>ele.id == curSongId.value);
    let len = playList.value.length;
    // TODO 播放模式功能在此处完成
    // 如果是最后一首，则切换到第一首
    $eventBus.emit('playSong',{
      id:playList.value[index === len - 1 ? 0 : index + 1 ].id,
      type:playList.value[index === len - 1 ? 0 : index + 1 ].type,
      auto:true,
    });
  };

  const prevSong = () =>{
    const index = playList.value.findIndex(ele=>ele.id == curSongId.value);
    let len = playList.value.length;
    // TODO 播放模式功能在此处完成
    $eventBus.emit('playSong',{
      id:playList.value[index === 0 ? len - 1 : index- 1 ].id,
      type:playList.value[index ===  0 ? len - 1 : index - 1  ].type,
      auto:true,
    });
  };
  const toggleSong = (song) =>{
    $eventBus.emit('playSong',{
      id:song.id,
      type:song.type,
      auto:true,
    });
  };

</script>
<style lang="less">
    .el-drawer{
      --el-drawer-bg-color: #212121 !important;
    }
    .el-table{
      --el-table-bg-color: red !important;
      --el-table-header-bg-color: #212121 !important;
      --el-table-border-color: #333 !important;

      --el-table-text-color: #aaa !important;
      --el-table-header-text-color: #ccc !important;
      --el-table-current-row-bg-color: purple !important;

      --el-table-fixed-box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
      --el-table-bg-color: cyan !important;
      --el-table-tr-bg-color:#212121 !important; // 背景
    }
</style>