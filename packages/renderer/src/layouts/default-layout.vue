
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div
      class="flex flex-1"
      style="height:calc(100% - 16rem)"
    >
      <layout-nav />
      <div class="flex-1  bg-primary-100 overflow-hidden">
        <n-search />
        <router-view />
      </div>
    </div>
    <audio-player />
  </div>
</template>
<script lang="ts" setup>
import layoutNav from '@/layouts/layout-nav.vue';
import AudioPlayer from '@/layouts/audio-player.vue';
import nSearch from '../components/n-search.vue';
import indexedDB from '/@/indexedDB';
import {ref} from 'vue';
const dbOnline = ref(false); // 数据库是否在线;
indexedDB.openDB('TIMP',1).then(()=>{
  dbOnline.value = true;
  console.log('数据库在线');
});




// 从数据库获取数据

// 如果不存在"我喜欢"歌单，创建

// 监听添加歌曲到歌单事件 


// 监听从歌单删除歌曲事件《仅自建歌单有此功能》

// 监听收藏歌单事件 【将歌单信息存入数据库: 歌单id,歌单名称】

// 监听删除歌单事件 [分自建歌单与网路歌单]

setTimeout(()=>{
  // indexedDB.add('music', {
  //   id:789,
  //   name:"我喜欢",
  //   list:[123,2999],
  // }).then(res=>{
  //   console.log(res);
  // });
  indexedDB.get('like').then(res=>{
    console.log(res);
  });
},1000);

// 构建本地歌单


</script>