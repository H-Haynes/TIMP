<template>
  <div class="px-8 flex flex-col h-full overflow-y-scroll">
    <div class="h-16 w-full flex-shrink-0"></div>
    <div class="flex-1 overflow-y-scroll">
      <div class="flex h-40 overflow-hidden">
        <el-image
          :src="albumInfo.coverImg"
          class="w-40 h-40 rounded flex-shrink-0"
        />
        <div class="ml-4 text-gray-300 text-xl text-left flex flex-col">
          <strong>{{ albumInfo.name }}</strong>
          <div class="text-gray-400 flex mt-2 justify-between items-center text-xs">
            <div class="flex items-center ">
              <el-avatar
                :size="16"
                :src="albumInfo.creator.avatar"
              />
              <span class="text-sm ml-2 text-blue-300">{{ albumInfo.creator.nickname }}</span>
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
            <span class="w-24 cursor-pointer bg-red-700 flex items-center justify-center hover:bg-red-600 leading-6 mr-3 rounded-xl">
              <i class="iconfont icon-botany2 mr-1" />
              播放全部
            </span>
            <span class="w-24 flex items-center justify-center cursor-pointer hover:bg-gray-600 bg-gray-700 leading-6 mr-3 rounded-xl">
              <i class="iconfont icon-icon-xian-" />
              收藏
            </span>
            <span class="w-24 flex items-center justify-center cursor-pointer leading-6 mr-3 rounded-xl border border-gray-500 hover:border-gray-400">
              <i class="iconfont icon-download" />
              下载全部
            </span>
          </div>
        </div>
      </div>
      <el-table
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
            />
          </template>
        </el-table-column>
        <el-table-column
          label="歌手"
          class="truncate"
        >
          <template #default="scope">
            <!-- <span
              v-for="art in scope.row.art"
              :key="art.id"
              class="truncate"
            >{{ art.name }}</span> -->
            <span>{{scope.row.art.reduce((prev,cur)=> prev + (prev ? '/'+cur.name : cur.name),'')}}</span>
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
        <template #empty>
          <div class="bg-primary-200 w-full h-80 flex justify-center items-center flex-col">
              <i class="iconfont icon-zanwushuju text-7xl" />
             <span class="text-gray-500">没有数据</span>
          </div>
         
        </template>
      </el-table>
    </div>
  </div>    
</template>
<script lang="ts" setup>
import { ref, watchEffect, inject } from 'vue';
import { getAlbumDetailWy } from '../api/netease';
import {getAlbumDetailQQ} from '../api/qq';
import { useRoute } from 'vue-router';
const $filters = inject('$filters');
const $eventBus:any = inject('$eventBus');
const route = useRoute();
const albumInfo = ref({
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
const songList = ref([]);
watchEffect(async() => {
  if (route.query.type && +route.query.type == 1) {
    getAlbumDetailWy(route.query.id as string).then((res) => {
      if (res.data.code === 200) {
        const {
          name,
          id,
          description,
          subscribedCount,
          trackCount,
          coverImgUrl: coverImg,
          createTime,
          trackUpdateTime:updateTime,
        } = res.data.playlist;
        const {
          avatarUrl: avatar,
          description: desc,
          nickname,
        } = res.data.playlist.creator;
        albumInfo.value = {
          name,
          id,
          description,
          subscribedCount,
          trackCount,
          coverImg,
          createTime,
          updateTime,
          creator: {
            avatar,
            desc,
            nickname,
          },
        };
        songList.value = res.data.playlist.tracks.map((ele:any)=>{
            return {
                name:ele.name,
                id:ele.id,
                mv:ele.mv,
                time:ele.dt,
                art:ele.ar.map((el:any)=>{
                    return {
                        name:el.name,
                        id:el.id,
                    };
                }),
                album:ele.al.name,
                picUrl:ele.al.picUrl,
            };
        });
      }
    });
  }else if(route.query.type && +route.query.type == 2){
    const albumResult = await getAlbumDetailQQ(route.query.id as string);
      if(albumResult.data.response.code === 0){
        let {
          dissname:name,
          dissid:id,
          desc:description,
          visitnum:subscribedCount,
          cmtnum:trackCount,
          logo: coverImg,
          ctime:createTime,
          ctime:updateTime,
          headurl:avatar,
          nick:desc,
          nickname
        } = albumResult.data.response.cdlist[0];
        updateTime *= 1000;
       
        albumInfo.value = {
          name,
          id,
          description,
          subscribedCount,
          trackCount,
          coverImg,
          createTime,
          updateTime,
          creator: {
            avatar,
            desc,
            nickname,
          },
        };
        songList.value = albumResult.data.response.cdlist[0].songlist.map((ele:any)=>{
            return {
                name:ele.name,
                id:ele.mid,
                mv:ele.mv.id || undefined,
                time:ele.interval * 1000,
                art:ele.singer.map((el:any)=>{
                    return {
                        name:el.name,
                        id:el.id,
                    };
                }),
                album:ele.album.name,
                picUrl:ele.album.picUrl,
            };
        });
      }
  }
});
const playSong = (song:any) => {
    $eventBus.emit('playSong',{
      id:song.id,
      type:+(route.query.type as unknown as number),
    });
};
</script>
<style lang="less">
.el-table__row--striped {
    background-color:#212121 !important;
    td{
        background-color:#212121 !important;
    }
}
.el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf{
    border-color:#121212 !important;
}
.el-table__empty-text{
  width:100%;
}
.el-table__inner-wrapper::before{
  background:none;
}
</style>