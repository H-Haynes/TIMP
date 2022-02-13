
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
    <div v-show="showAddDialog" class="fixed left-0 top-0 w-full h-full  z-50">
      <div
        class="mask w-full h-full"
        @click="showAddDialog = false"
      ></div>
      <div
        class="addCustomDialog w-72  absolute-center fixed p-4 z-50 bg-primary-200 rounded"
      >
        <ul style="max-height:300px" class="overflow-y-scroll hideScrollBar">
          <li
            v-for="item in myAlbum"
            :key="item.id"
            class="text-white cursor-pointer py-1 px-4 truncate text-left text-sm leading-7 hover:bg-gray-700"
            @click="handleAddCollect(item.id)"
          >
            <i class="iconfont icon-zhuanji text-xs mr-2" />
            {{ item.name||item.title }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import layoutNav from '@/layouts/layout-nav.vue';
import AudioPlayer from '@/layouts/audio-player.vue';
import nSearch from '../components/n-search.vue';
import indexedDB from '/@/indexedDB';
import type { Ref } from 'vue';
import {ref,provide,inject,toRaw} from 'vue';
import {useRoute} from 'vue-router';
import { ElMessage } from 'element-plus';
import poster from '../../assets/poster.jpg';

const showAddDialog = ref(false);

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
const operateSong = ref({});
const playList:Ref<any[]> = ref([]);
provide('likeAlbum',likeAlbum.value);
provide('likeList',likeList);
provide('myCollect',myCollect);
provide('myAlbum', myAlbum);
provide('playList',playList);


/**
 * 添加歌曲到自定义歌单
 * @param albumId 歌单id
 */
const handleAddCollect = (albumId:string) =>{
  $eventBus.emit('addSongToAlbum',{
    id:albumId,
    song:toRaw(operateSong.value),
  });
  showAddDialog.value = false;
};

// 监听添加歌曲事件，在这里弹窗
$eventBus.on('triggerSongToAlbum',(song:any)=>{
  if(myAlbum.value.length ==0){
    return ElMessage.warning('请先创建歌单');
  }
  showAddDialog.value = true;
  operateSong.value = song;
});

// 获取我喜欢
const getLikeList = async () => {
  indexedDB.get('like').then(res=>{
    likeList.value = res;
  });
};
// 获取我收藏的歌单
const getCollectList = async () => {
  indexedDB.get('collect').then(res=>{
    myCollect.value = res;
  });
};

// 获取自建歌单
const getMyAlbumList = async () => {
  indexedDB.get('album').then(res=>{
    myAlbum.value = res;
  });
};

// 获取播放列表
const getPlayList = async () => {
  indexedDB.get('playlist').then(res=>{
    playList.value = (res as any[]).sort((a,b)=>{
      return  b.timestamp - a.timestamp;
    });
  });
};

indexedDB.openDB('TIMP',2).then(()=>{
  dbOnline.value = true;
  console.log('*****数据库已连接*****');
}).then(async ()=>{
  // 从数据库获取数据
  await getLikeList();
  await getCollectList();
  await getMyAlbumList();
  await getPlayList();
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

/**
 * 添加歌曲到自建歌单
 * @param id 歌单id
 * @param song 歌曲信息
 */
$eventBus.on('addSongToAlbum',({id,song})=>{
  // 检查是否重复
  let album = myAlbum.value.find(item => item.id === id);
  if(album.list.some(ele=>ele.id === song.id)){
    ElMessage.warning('歌曲已存在');
    return;
  }else{
    // 未重复 , 添加歌曲，更新整项
    // TODO: 添加歌曲到自定义歌单改为添加数据到数据库，而不是更新整项
    album.list.unshift(song);
    indexedDB.update('album',toRaw(album)).then(()=>{
      getMyAlbumList();
      ElMessage.success('歌曲添加成功');
    });
  }
});

$eventBus.on('delCustomAlbum',(id:string) => {
  indexedDB.remove('album',id).then(()=>{
    getMyAlbumList();
    ElMessage.success('歌单删除成功');
  });
});

$eventBus.on('addPlayList',async (song:any) => {
  // 检查是否已存在播放列表中
  if(playList.value.some(ele=>ele.id === song.id)){
    // 如果存在则从播放列表中删除
    await indexedDB.remove('playlist',song.id);
  }
  //添加到播放列表中(顺序问题)
  await indexedDB.update('playlist',toRaw(song));
  // 重新获取列表
  await getPlayList();
});

$eventBus.on('playAll',async (list:any[]) => {
  // 清空播放列表数据库
  await indexedDB.clear('playlist');
  
  //播放第一首
  $eventBus.emit('playSong',list[0]);
  // 将所有数据添加到播放列表,反向添加顺序
  for(var i =list.length-1;i>=0;i--){
    list[i].timestamp = Date.now() - i;
    $eventBus.emit('addPlayList',list[i]);
  }
});

// 监听添加歌曲到歌单事件 


// 监听从歌单删除歌曲事件《仅自建歌单有此功能》
// 监听收藏歌单事件 【将歌单信息存入数据库: 歌单id,歌单名称】
// 监听删除歌单事件 [分自建歌单与网路歌单]
// 构建本地歌单


</script>