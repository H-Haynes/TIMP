<template>
  <div
    v-loading.lock="loading"
    class="px-8 flex flex-col h-full overflow-y-scroll"
    element-loading-background="rgba(0,0,0,.7)"
  >
    <div class="h-16 w-full flex-shrink-0"></div>
    <div class="flex-1 overflow-y-scroll">
      <div class="flex h-40 overflow-hidden">
        <el-image
          :src="albumInfo.coverImg || poster"
          class="w-40 h-40 rounded flex-shrink-0"
        />
        <div class="ml-4 text-gray-300 text-xl text-left flex flex-col">
          <strong>{{ albumInfo?.name || albumInfo?.title }}</strong>
          <div class="text-gray-400 flex mt-2 justify-between items-center text-xs">
            <div class="flex items-center ">
              <el-avatar
                :size="16"
                :src="albumInfo?.creator?.avatar"
              />
              <span class="text-sm ml-2 text-blue-300">{{ albumInfo.creator?.nickname }}</span>
            </div>
            <p>最近更新：{{ $filters.timeFormat(albumInfo.updateTime) }}</p>
          </div>
          <p
            class="text-xs text-left overflow-y-scroll leading-5 mt-2"
            vue
            no-v-html
            v-html="albumInfo.description ?albumInfo.description.replace(/\n/g,'<br/>') : '' "
          />
          <div class="mt-2 text-xs flex">
            <span @click="playAll" class="w-24 cursor-pointer bg-red-700 flex items-center justify-center hover:bg-red-600 leading-6 mr-3 rounded-xl">
              <i class="iconfont icon-botany2 mr-1" />
              播放全部
            </span>
            <span
              v-show="platform"
              class="w-24 flex items-center justify-center cursor-pointer hover:bg-gray-600 bg-gray-700 leading-6 mr-3 rounded-xl"
              @click="addCollect"
            >
              <i class="iconfont icon-icon-xian-" />
              {{ myCollect.some(ele=>ele.id == albumId) ? '取消收藏' :'收藏' }}
            </span>
            <span class="w-24 flex items-center justify-center cursor-pointer leading-6 mr-3 rounded-xl border border-gray-500 hover:border-gray-400">
              <i class="iconfont icon-download" />
              下载全部
            </span>

            <span
              v-if="!platform"
              class="w-24  bg-red-700 flex items-center justify-center cursor-pointer leading-6 mr-3 rounded-xl  border-gray-500 hover:bg-red-600"
              @click="handleDelCustomAlbum"
            >
              删除歌单
            </span>
          </div>
        </div>
      </div>
      <div class="relative">
        <el-table
          :key="albumId"
          class="mt-8"
          stripe 
          cell-class-name="bg-primary-100 cursor-pointer"
          :header-cell-style="{backgroundColor: '#212121 !important'}"
          :data="songList"
          @row-dblclick="playSong"
        >
          <el-table-column
            label="歌曲"
            prop="name"
            class="whitespace-nowrap"
          >
            <template #default="scope">
              <el-tooltip :content="scope.row.name">
                <span class="whitespace-nowrap">{{ scope.row.name }}</span>
              </el-tooltip>
              <i
                v-if="scope.row.mv"
                class="iconfont ml-2 icon-mv cursor-pointer text-red-500"
                @click="playMv(scope.row.mv,scope.row.type)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="歌手"
            class="truncate"
          >
            <template #default="scope">
              <el-tooltip placement="bottom" :content="scope.row.art?.reduce((prev,cur)=> prev + (prev ? '/'+cur.name : cur.name),'')">
                <span class="truncate">{{ scope.row.art?.reduce((prev,cur)=> prev + (prev ? '/'+cur.name : cur.name),'') }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="专辑">
            <template #default="scope">
              <el-tooltip :content="scope.row.album">
                <span class="whitespace-nowrap overflow-hidden">{{ scope.row.album }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            label="时长"
            prop="name"
            width="100"
          >
            <template #default="scope">
              {{ $filters.durationFormat(scope.row.time) }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <i
                v-if="!likeList.some(ele=>ele.id === scope.row.id)"
                class="iconfont icon-xihuan cursor-pointer ml-2"
                @click="addLike(scope.row)"
              ></i>
              <i
                v-else
                class="iconfont text-red-500 cursor-pointer icon-chuangyikongjianICON_fuzhi- ml-2"
                @click="unLike(scope.row.id)"
              />
              <i
                class="iconfont icon-icon-xian- cursor-pointer ml-2"
                @click="handleCollectClick(scope.row)"
              />
              <i
                v-show="+albumId==0"
                class="iconfont icon-delete cursor-pointer ml-2"
              />
            </template>
          </el-table-column>
          <template #empty>
            <div class="bg-primary-200 w-full h-80 flex justify-center items-center flex-col">
              <i class="iconfont icon-zanwushuju text-7xl" />
              <span class="text-gray-500">没有数据</span>
            </div>
          </template>
        </el-table>
      </div>
    </div>
  </div>    
</template>
<script lang="ts" setup>
import type {Ref} from 'vue';
import { ref, watchEffect, inject,toRaw } from 'vue';
import { getAlbumDetailWy } from '../api/netease';
import {getAlbumDetailQQ, getRankDetailQQ} from '../api/qq';
import { useRoute,useRouter } from 'vue-router';
import poster from '@/../assets/poster.jpg';
import { ElMessageBox } from 'element-plus';
import { getAlbumDetailKW, getRankListKW, getRankMusicListKW } from '../api/kuwo';
import { getAlbumDetailKG, getRankMusicListKG } from '../api/kugou';

const $filters = inject('$filters');
const $eventBus:any = inject('$eventBus');
const loading = ref(false);
const route = useRoute();
const router = useRouter();
const albumId = ref(route.query.id as string);
const albumInfo:Ref<any> = ref({
  name: '',
  id: '',
  description: '',
  subscribedCount: 0,
  trackCount: 0,
  coverImg: '',
  createTime: 0,
  updateTime: 0,
  creator: {
    avatar: '',
    desc: '',
    nickname: '',
  },
});
const songList:Ref<any[]> = ref([]);
const platform = ref(+(route.query.type as string));
const likeList:Ref<any[]> = inject('likeList') as Ref<any[]>;
const likeAlbum = inject('likeAlbum');
const myCollect = inject('myCollect');
const myAlbum:Ref<any[]> = inject('myAlbum') as Ref<any[]>;

const getWyAlbum = async(id:string) =>{
  const res = await getAlbumDetailWy(id);
  if(res.data.code === 200){
    const {name,id,description,subscribedCount,trackCount,coverImgUrl: coverImg,createTime,trackUpdateTime:updateTime} = res.data.playlist;
    const {avatarUrl: avatar,description: desc,nickname} = res.data.playlist.creator;
    albumInfo.value = {name,id,description,subscribedCount,trackCount,coverImg,createTime,updateTime,creator: {avatar,desc,nickname}};
    songList.value = res.data.playlist.tracks.map((ele:any)=>{
          return {name:ele.name,id:ele.id,mv:ele.mv,time:ele.dt,album:ele.al.name,picUrl:ele.al.picUrl,
              art:ele.ar.map((el:any)=>{
                  return {
                      name:el.name,
                      id:el.id,
                  };
              }),
              
          };
    });
  }
};

const getKwAlbum = async(id:string) =>{
  const res = await getAlbumDetailKW(id);
  if(res.data.code === 200){
    const {name,id,info:description,listencnt:subscribedCount,listencnt:trackCount,img: coverImg,createTime,updateTime} = res.data.data;
    const {uPic: avatar, desc='',userName:nickname} = res.data.data;
    albumInfo.value = {name,id,description,subscribedCount,trackCount,coverImg,createTime,updateTime,creator: {avatar,desc,nickname}};
    songList.value = res.data.data.musicList.map((ele:any)=>{
          return {name:ele.name,id:ele.rid,mv:ele.mvpayinfo.vid,time:ele.duration*1000,album:ele.album,picUrl:ele.pic,
              art:[{
                      name:ele.artist,
                      id:ele.artistid,
                }],
              
          };
    });
  }
};

const getQQAlbum = async(id:string) => {
  const result = await getAlbumDetailQQ(id);
  if(result.data.response.code === 0){
    let {dissname:name,dissid:id,desc:description,visitnum:subscribedCount,cmtnum:trackCount,logo: coverImg,ctime:createTime,ctime:updateTime,headurl:avatar,nick:desc,nickname} = result.data.response.cdlist[0];
    updateTime *= 1000;
    albumInfo.value = {name,id,description,subscribedCount,trackCount,coverImg,createTime,updateTime,creator: {avatar,desc,nickname}};
    songList.value = result.data.response.cdlist[0].songlist.map((ele:any)=>{
        return {name:ele.name,id:ele.mid,mv:ele.mv.vid || undefined,time:ele.interval * 1000,album:ele.album.name,picUrl:ele.album.picUrl,
            art:ele.singer.map((el:any)=>{
                return {
                    name:el.name,
                    id:el.id,
                };
            }),
            
        };
    });
  }
};

const getKGAlbum = async (id:string) => {
  const result = await getAlbumDetailKG(id);
  console.log(result);
  if(result.data.info?.list){
    let {specialname:name,specialid:id,intro:description,collectcount:subscribedCount,commentcount:trackCount,imgurl:coverImg,publishtime:createTime,publishtime:updateTime,user_avatar:avatar,desc,nickname} = result.data.info.list;
    coverImg = coverImg.replace('{size}', '400');
    albumInfo.value = {name,id,description,subscribedCount,trackCount,coverImg,createTime,updateTime,creator: {avatar,desc,nickname}};
  }
  if(result.data?.list?.list?.info){
    songList.value = result.data.list.list.info.map(ele=>({
      name:ele.filename.split('-')[1].trim(),
      id:ele.hash,
      mv:ele.mvhash || undefined,
      time:ele.duration * 1000,
      album:'',
      picUrl:'',
      art:[
        {
          name:ele.filename.split('-')[0],
          id:0
        }
      ],
    }));
  }
};

const getQQRankDetail = async(id:number) => {
  const result = await getRankDetailQQ(id);
  console.log(result);
  if(result.data.response.code === 0){
    let {title:name,topId:id,titleShare:description,listenNum:subscribedCount,listenNum:trackCount,frontPicUrl: coverImg,updateTime:createTime,updateTime:updateTime,topAlbumURL:avatar,AdShareContent:desc,AdShareContent:nickname} = result.data.response.req_1.data.data;
    albumInfo.value = {name,id,description,subscribedCount,trackCount,coverImg,createTime,updateTime,creator: {avatar,desc,nickname}};
    let list = [];
    if(result.data.response.req_1.data.songInfoList.length>0){
      list = result.data.response.req_1.data.songInfoList.map(ele=>({
            name:ele.name,
            id:ele.mid,
            mv:ele.mv.vid || undefined,
            time:ele.interval * 1000,
            album:ele.album.name,
            picUrl:ele.album.picUrl,
            art:ele.singer.map((el:any)=>{
                return {
                    name:el.name,
                    id:el.id,
                };
            }),
            
      }));
    }else{
      list = result.data.response.req_1.data.data.song.map(ele=>({
            name:ele.title,
            id:ele.songId,
            albumMid:ele.albumMid,
            mv:ele.vid || undefined,
            time:null,
            album:'-',
            picUrl:ele.cover,
            art:[{
              name:ele.singerName,
              id:ele.singerMid,
            }],
      }));
    }
    songList.value = list;
  }
};
const getKWRankDetail = async(id:number|string) => {
  const result = await getRankMusicListKW(id);
  if(result.data.code === 200){
    songList.value = result.data.data.musicList.map(ele=>({
      name:ele.name,
      id:ele.musicrid,
      mv:ele.mvpayinfo.vid,
      time:ele.duration*1000,
      album:ele.album,
      picUrl:ele.pic,
      art:[{
        name:ele.artist,
        id:ele.artistid,
      }],
    }));
  }

  // 从排行榜列表获取到相关描述
  const rankListResult = await getRankListKW();
  if(rankListResult.data.code === 200){
    let rankList = rankListResult.data.data.reduce((prev,cur)=>{
        return prev.concat(cur.list);
    },[]);
    let rank = rankList.find(ele=>ele.sourceid === id);
    let {name,intro:description,subscribedCount=0,trackCount=0,pic: coverImg,createTime,updateTime,pic:avatar,pub:desc,nickname} = rank;
    albumInfo.value = {name,id,description,subscribedCount,trackCount,coverImg,createTime,updateTime,creator: {avatar,desc,nickname}};

  }
  
};

const getKGRankDetail = async(id:number|string) => {
  const result = await getRankMusicListKG(id);
  if(result.data.info){
    let {rankname:name,rankid:id,intro:description,play_times:subscribedCount,play_times:trackCount,imgurl:coverImg,createTime,updateTime,img_cover:avatar,desc,nickname} = result.data.info;
    coverImg = coverImg.replace('{size}', '400');
    avatar = avatar.replace('{size}', '400');
    albumInfo.value = {name,id,description,subscribedCount,trackCount,coverImg,createTime,updateTime,creator: {avatar,desc,nickname}};
    let list = [];
    if(result.data.songs?.list){
      list = result.data.songs.list.map(ele=>({
        name:ele.filename.split('-')[1].trim(),
        id:ele.hash,
        mv:ele.mvhash || undefined,
        time:ele.duration * 1000,
        album:'',
        picUrl:'',
        art:[{
          name:ele.filename.split('-')[0],
          id:Math.random().toString(36).substr(2),
        }],
      }));
    }
    songList.value = list;
  }
};

const getCustomAlbum = async (id:string|number) => {
  // 从本地歌单查找，将歌单信息和列表重新赋值
    if(!myAlbum.value) return;
    const album = myAlbum.value.find(ele=>ele.id == id);
    albumInfo.value = await toRaw(album);
    songList.value = album.list ||[];
};

const playSong = (song:any) => {
    $eventBus.emit('playSong',{
      id:song.id,
      type:song.type || platform.value,
    });
};

const playMv = (id:any,type) => {
    router.push({
      path:'/video/player',
      query:{
        id,
        type:type ||  platform.value,
      },
    });
};

const addLike = (song:any) => {
  let info = toRaw(song);
  info.type = platform.value;
  $eventBus.emit('addLike',info);
};

const unLike = (id:string) => {
  $eventBus.emit('unLike',id);
};

const addCollect = () => {
  if(myCollect.value.some(ele=>ele.id == albumId.value)){
    $eventBus.emit('unCollect',albumId.value);
  }else{
      $eventBus.emit('addCollect',{
        id:albumId.value,
        type:platform.value,
        name:albumInfo.value.name,
        isRank:route.query.isRank,
      });
  }

};

const handleCollectClick = (song) =>{
  // 传递歌曲的名称、歌手、专辑、时长、id
  let info = toRaw(song);
  let data = {
    id:info.id,
    name:info.name,
    album:info.album,
    time:info.time,
    art:info.art,
    type:platform.value,
  };
  $eventBus.emit('triggerSongToAlbum',data);
};

const playAll = () => {
  // 弹出提示框
  ElMessageBox.confirm('播放全部将会清除当前播放列表，是否继续？', '播放全部',{
    center:true,
    confirmButtonText:'确定',
    cancelButtonText:'取消',
    confirmButtonClass:'custom-cancel-btn w-24',
    cancelButtonClass:'custom-cancel-btn w-24',
  }).then(() => {
    // 将歌单歌曲整理成符合播放列表的格式传递，并触法playAll
    const list = songList.value.map(ele=>({
      id:ele.id,
      type:ele.type || platform.value,
      name:ele.name,
      art:ele.art.map(ele=>({id:ele.id,name:ele.name})),
    }));
    $eventBus.emit('playAll',list);
  });
};

/**
 * 删除自定义歌单
 */
const handleDelCustomAlbum = () => {
  ElMessageBox.confirm('确认删除歌单吗？','删除歌单',{
    center:true,
    confirmButtonText:'确定删除',
    cancelButtonText:'取消',
    confirmButtonClass:'custom-cancel-btn w-24',
    cancelButtonClass:'custom-cancel-btn w-24',
  }).then(()=>{
    $eventBus.emit('delCustomAlbum',albumId.value);
  });
};

watchEffect(async() => {
  loading.value = true;
  if(+albumId.value == 0 && platform.value ==0){
    // 我喜欢
    albumInfo.value = likeAlbum;
    songList.value = likeList.value;
  }else if (platform.value == 1) { //网易平台
    await getWyAlbum(albumId.value);
  }else if(platform.value == 2){ // QQ平台
    if(!route.query.isRank){
      await getQQAlbum(albumId.value); //歌单
    }else{
      await getQQRankDetail(+albumId.value); // 排行榜
    }
  }else if(platform.value == 3){
    if(!route.query.isRank){
      await getKGAlbum(albumId.value);
    }else{
      await getKGRankDetail(albumId.value);
    }
  }else if(platform.value == 4){ // 酷我平台
    if(!route.query.isRank){
      await getKwAlbum(albumId.value); //歌单
    }else{
      await getKWRankDetail(albumId.value);
    }
  }else if(platform.value == 0){ //自建歌单
    await getCustomAlbum(albumId.value);
  }
  loading.value = false;
});

</script>
<style lang="less">
.el-table__row--striped {
    background-color:#212121 !important;
    td{
        background-color:#212121 !important;
    }
}

.el-table__empty-text{
  width:100%;
}
.el-table__inner-wrapper::before{
  background:none;
}
</style>