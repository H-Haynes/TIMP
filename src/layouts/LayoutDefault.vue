<template>
  <div class="flex flex-col h-full overflow-hidden dark:bg-gray-800">
    <div class="flex flex-1 relative" style="height: calc(100% - 16rem)">
      <layout-nav />
      <div class="flex-1 flex flex-col bg-primary-100 overflow-hidden">
        <n-search class="flex-shrink-0" />
        <div class="flex-1" style="height: calc(100% - 48px)">
          <el-scrollbar class="h-full">
            <router-view :key="route.path + JSON.stringify(route.query)" />
          </el-scrollbar>
        </div>
      </div>
    </div>
    <t-a-player></t-a-player>
    <div v-show="showAddDialog" class="fixed left-0 top-0 w-full h-full z-50">
      <div class="mask w-full h-full" @click="showAddDialog = false"></div>
      <div class="addCustomDialog w-72 absolute-center fixed p-4 z-50 bg-primary-200 rounded">
        <ul style="max-height: 300px" class="overflow-y-scroll hideScrollBar">
          <li
            v-for="item in albumList"
            :key="item.id"
            class="text-white cursor-pointer py-1 px-4 truncate text-left text-sm leading-7 hover:bg-gray-700"
            @click="handleAddToAlbum(item.id)"
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

const { albumList, addSongToAlbum, initDB } = useStore("db")

const handleAddToAlbum = (albumId: string) => {
  addSongToAlbum(albumId, toRaw(operateSong.value))
  showAddDialog.value = false
}

initDB()
</script>
