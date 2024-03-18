<template>
  <div class="flex flex-col h-full overflow-hidden dark:bg-gray-800">
    <div class="flex flex-1 relative" style="height: calc(100% - 16rem)">
      <layout-nav />
      <div class="flex-1 flex flex-col bg-primary-100 overflow-hidden">
        <n-search class="flex-shrink-0" />
        <div class="flex-1" style="height: calc(100% - 48px)">
          <el-scrollbar class="h-full">
            <!-- <keep-alive> -->
            <router-view :key="route.path + JSON.stringify(route.query)" />
            <!-- </keep-alive> -->
          </el-scrollbar>
        </div>
      </div>
    </div>
    <!-- <audio-player /> -->
    <t-a-player></t-a-player>
    <div v-show="showAddDialog" class="fixed left-0 top-0 w-full h-full z-50">
      <div class="mask w-full h-full" @click="showAddDialog = false"></div>
      <div class="addCustomDialog w-72 absolute-center fixed p-4 z-50 bg-primary-200 rounded">
        <ul style="max-height: 300px" class="overflow-y-scroll hideScrollBar">
          <li
            v-for="item in albumList"
            :key="item.id"
            class="text-white cursor-pointer py-1 px-4 truncate text-left text-sm leading-7 hover:bg-gray-700"
            @click="handleAddCollect(item.id)"
          >
            <i class="iconfont icon-zhuanji text-xs mr-2" />
            {{ item.name || item.title }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import layoutNav from "@/layouts/LayoutNav.vue"
import nSearch from "./NSearch.vue"
import poster from "@/assets/poster.jpg"
import eventBus from "@/utils/eventBus"

const showAddDialog = ref(false)

const likeAlbum = ref({
  title: "我喜欢",
  id: 0,
  description: "我喜欢的歌",
  subscribedCount: 1,
  trackCount: 1,
  coverImg: poster,
  createTime: "",
  updateTime: "",
  avatar: "",
  custom: 1,
  creator: {
    avatar: "",
    desc: "",
    nickname: "我"
  }
})
const route = useRoute()

const myCollect = ref([])

const operateSong = ref({})

provide("likeAlbum", likeAlbum.value)

provide("myCollect", myCollect)

const {
  playlist,
  likeList,
  collectList,
  albumList,
  addSongToAlbum,
  addPlaylist,
  initDB,
  createAlbum,
  removeCollect,
  addCollect,
  removeLike,
  addLike,
  removeCustomAlbum,
  batchAddPlaylist
} = useStore("db")

/**
 * 添加歌曲到自定义歌单
 * @param albumId 歌单id
 */
const handleAddCollect = (albumId: string) => {
  eventBus.emit("addSongToAlbum", {
    id: albumId,
    song: toRaw(operateSong.value)
  })
  showAddDialog.value = false
}

// 监听添加歌曲事件，在这里弹窗
eventBus.on("triggerSongToAlbum", (song: any) => {
  if (albumList.value.length == 0) {
    return ElMessage.warning("请先创建歌单")
  }
  showAddDialog.value = true
  operateSong.value = song
})

initDB()

// 添加到我喜欢
eventBus.on("addLike", addLike)

// 取消我喜欢
eventBus.on("unLike", removeLike)

// 添加到收藏
eventBus.on("addCollect", addCollect)

// 取消收藏
eventBus.on("unCollect", removeCollect)

//创建自定义歌单
eventBus.on("createAlbum", createAlbum)

// 添加歌曲到自定义歌单
eventBus.on("addSongToAlbum", addSongToAlbum)

// 删除自定义歌单
eventBus.on("delCustomAlbum", removeCustomAlbum)

// 添加到播放列表
eventBus.on("addPlayList", addPlaylist)

// 监听添加歌曲到歌单事件

// 监听从歌单删除歌曲事件《仅自建歌单有此功能》
// 监听收藏歌单事件 【将歌单信息存入数据库: 歌单id,歌单名称】
// 监听删除歌单事件 [分自建歌单与网路歌单]
// 构建本地歌单
</script>
