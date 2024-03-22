<template>
  <el-scrollbar ref="containerRef" class="p-6 pt-0 play-list-container relative" @scroll="handleScroll">
    <div ref="contentRef">
      <h4 class="text-20px mb-6 sticky top-0 z-999 h-40px dark:bg-gray-800 leading-40px bg-white">推荐歌单</h4>

      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="playlist-container gap-x-6 gap-y-6 w-full">
            <el-skeleton-item v-for="item in 100" variant="rect" style="width: 12rem; height: 12rem; border-radius: 8px" />
          </div>
        </template>
        <template #default>
          <div class="playlist-container gap-x-6 gap-y-6 w-full">
            <div
              class="w-48 h-48 rounded-md overflow-hidden relative cursor-pointer relative"
              @click="handlePlayListDetail(playlist)"
              v-for="playlist in recommendData.list"
              :key="playlist.relationId"
            >
              <img :src="playlist.pic" class="w-48" />
              <img width="24" class="absolute left-1 top-1" :src="whichLogo(playlist.platform)" />
              <p class="box-border absolute w-full bottom-0 left-0 text-xs p-1 bg-gray-900 text-white bg-opacity-50">{{ playlist.name }}</p>
              <span class="absolute text-xs text-white top-2 right-2 inline-flex items-center">
                <i class="iconfont !text-10px icon-bofang1 mr-1"></i>
                {{ countFormat(playlist.playCount) }}
              </span>
            </div>
          </div>
        </template>
      </el-skeleton>
      <div class="w-full h-full absolute mask left-0 top-0 bg-opacity-5" v-if="moreLoading"></div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { getRecommendPlaylist } from "@/api"
import { whichLogo, countFormat } from "@/utils/filters"
import { IRank } from "../rank.vue"
import { throttle } from "throttle-debounce"

const router = useRouter()
const loading = ref(false)
const moreLoading = ref(false)

const contentRef = ref()
const containerRef = ref()

const recommendData = ref({
  list: [] as IRank[],
  pageNum: 1,
  pageSize: 100,
  loading: false
})

// 获取歌单列表
const getRecommendList = throttle(1000, (page?: number) => {
  if (page) {
    recommendData.value.pageNum = page
  }
  recommendData.value.pageNum === 1 && (loading.value = true)
  moreLoading.value = true
  getRecommendPlaylist({
    pageNum: recommendData.value.pageNum,
    pageSize: recommendData.value.pageSize
  })
    .then((res: any) => {
      recommendData.value.list = recommendData.value.pageNum === 1 ? res.data : recommendData.value.list.concat(res.data)
    })
    .finally(() => {
      loading.value = false
      moreLoading.value = false
    })
})

const handlePlayListDetail = (playlist: IRank) => {
  router.push({
    name: "PlaylistDetail",
    params: {
      id: playlist.relationId
    },
    query: {
      isRank: playlist.isRank,
      platform: playlist.platform
    }
  })
}

const handleScroll = ({ scrollTop, scrollLeft }) => {
  if (containerRef.value.$el.offsetHeight + scrollTop + 50 > contentRef.value.offsetHeight && !moreLoading.value) {
    // 触底
    getRecommendList(recommendData.value.pageNum + 1)
  }
}

getRecommendList()
</script>
<style lang="scss" scoped>
.play-list-container {
  height: calc(100vh - 48px - 64px);
  box-sizing: border-box;
  overflow: hidden;
}
</style>
