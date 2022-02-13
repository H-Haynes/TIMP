
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div
      class="flex flex-1"
      style="height:calc(100% - 16rem)"
    >
      <layout-nav />
      <div class="flex-1  bg-primary-100 overflow-hidden">
        <n-search />
        <router-view :key="route.query.type + route.query.id" />
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
import {useRoute} from 'vue-router';
import { ElMessage } from 'element-plus';
import poster from '../../assets/poster.jpg';
const dbOnline = ref(false); // 数据库是否在线;
const likeAlbum = ref({
  title:"我喜欢",
  id:0,
  description:"我喜欢的歌",
  subscribedCount:1,
  trackCount:1,
  coverImg:poster,
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
const route = useRoute();
const likeList = ref([]);
const $eventBus:any = inject('$eventBus');

const myCollect = ref([]);
const myAlbum = ref([]);

provide('likeAlbum',likeAlbum.value);
provide('likeList',likeList);
provide('myCollect',myCollect);
provide('myAlbum', myAlbum);

// 获取我喜欢
const getLikeList = () => {
  indexedDB.get('like').then(res=>{
    likeList.value = res;
  });
};
// 获取我收藏的歌单
const getCollectList = () => {
  indexedDB.get('collect').then(res=>{
    myCollect.value = res;
  });
};

// 获取自建歌单
const getMyAlbumList = () => {
  indexedDB.get('album').then(res=>{
    myAlbum.value = res;
  });
};

indexedDB.openDB('TIMP',1).then(()=>{
  dbOnline.value = true;
  console.log('*****数据库已连接*****');
}).then(()=>{
  // 从数据库获取数据
  getLikeList();
  getCollectList();
  getMyAlbumList();
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

$eventBus.on('addCollect',albumInfo => {
  indexedDB.update('collect',albumInfo).then(()=>{
    getCollectList();
    ElMessage.success('收藏成功');
  });
});

$eventBus.on('unCollect',id => {
  indexedDB.remove('collect',id).then(()=>{
    getCollectList();
    ElMessage.success('已取消收藏');
  });
});

$eventBus.on('createAlbum',albumInfo => {

  indexedDB.add('album',albumInfo).then(()=>{
    getMyAlbumList();
    ElMessage.success('歌单创建成功');
  });
});


// 监听添加歌曲到歌单事件 


// 监听从歌单删除歌曲事件《仅自建歌单有此功能》

// 监听收藏歌单事件 【将歌单信息存入数据库: 歌单id,歌单名称】

// 监听删除歌单事件 [分自建歌单与网路歌单]


// 构建本地歌单


</script>