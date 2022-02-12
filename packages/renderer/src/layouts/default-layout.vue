
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
import {ref,provide,inject} from 'vue';
const dbOnline = ref(false); // 数据库是否在线;
const likeAlbum = ref({
  title:"我喜欢",
  id:0,
  description:"我喜欢的歌",
  subscribedCount:1,
  trackCount:1,
  coverImg:"",
  createTime:"",
  updateTime:"",
  avatar:"",
  custom:1,
  creator:{
    avatar:"",
    desc:"",
    nickname:"我"
  }
});
const likeList = ref([]);
const $eventBus:any = inject('$eventBus');

provide('likeAlbum',likeAlbum.value);
provide('likeList',likeList);


// 获取我喜欢
const getLikeList = () => {
  indexedDB.get('like').then(res=>{
    likeList.value = res;
  });
};

indexedDB.openDB('TIMP',1).then(()=>{
  dbOnline.value = true;
  console.log('*****数据库已连接*****');
}).then(()=>{
  // 从数据库获取数据
  getLikeList();
});

$eventBus.on('addLike',song =>{
  indexedDB.update('like',song).then(()=>{
    getLikeList();
  });
});

$eventBus.on('unLike',id => {
  indexedDB.remove('like',id).then(()=>{
    getLikeList();
  });
});



// 监听添加歌曲到歌单事件 


// 监听从歌单删除歌曲事件《仅自建歌单有此功能》

// 监听收藏歌单事件 【将歌单信息存入数据库: 歌单id,歌单名称】

// 监听删除歌单事件 [分自建歌单与网路歌单]


// 构建本地歌单


</script>