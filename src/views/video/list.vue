<template>
  <el-scrollbar ref="containerRef" class="p-6 pt-0 video-list-container" @scroll="handleScroll">
    <div ref="contentRef">
      <h4 class="text-20px mb-6 sticky top-0 z-999 h-40px dark:bg-gray-800 leading-40px bg-white">视频/MV</h4>

      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="playlist-container gap-x-6 gap-y-6 w-full">
            <el-skeleton-item v-for="item in 100" variant="rect" style="width: 12rem; height: 12rem; border-radius: 8px" />
          </div>
        </template>
        <template #default>
          <div class="playlist-container gap-x-6 gap-y-6 w-full">
            <div
              class="w-48 h-48 rounded-md overflow-hidden relative cursor-pointer relative bg-gray-900 video-item"
              v-for="video in videoListData.list"
              @click="handleVideoDetail(video)"
              :key="video.relationId"
            >
              <img :src="video.pic" class="w-48 h-48 object-contain" />
              <img width="24" class="absolute left-1 top-1" :src="whichLogo(video.platform)" />
              <p class="box-border absolute w-full bottom-0 left-0 text-xs p-1 bg-gray-900 text-white bg-opacity-50">{{ video.name }}</p>
              <span class="absolute text-xs text-white top-2 right-2 inline-flex items-center">
                <i class="iconfont !text-10px icon-bofang1 mr-1"></i>
                {{ countFormat(video.playCount) }}
              </span>

              <div class="play-btn">
                <i class="icon-bofang"></i>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { getRelatedVideo, getVideoList } from "@/api"
import type { IVideo } from "@/api"
import { whichLogo, countFormat } from "@/utils/filters"
import { debounce, throttle } from "throttle-debounce"
const router = useRouter()

const loading = ref(false)

const moreLoading = ref(false)

const contentRef = ref()
const containerRef = ref()

const videoListData = ref({
  list: [] as IVideo[],
  pageNum: 1,
  pageSize: 100,
  loading: false
})

// 获取歌单列表
const getVideoListData = throttle(1000, (page?: number) => {
  if (page) {
    videoListData.value.pageNum = page
  }
  videoListData.value.pageNum === 1 && (loading.value = true)
  moreLoading.value = true
  getVideoList({
    pageNum: videoListData.value.pageNum,
    pageSize: videoListData.value.pageSize
  })
    .then((res: any) => {
      videoListData.value.list = videoListData.value.pageNum === 1 ? res.data : videoListData.value.list.concat(res.data)
    })
    .finally(() => {
      loading.value = false
      moreLoading.value = false
    })
})

const handleVideoDetail = (video: IVideo) => {
  router.push({
    name: "VideoDetail",
    params: {
      id: video.id
    },
    query: {
      platform: video.platform
    }
  })
}

const handleScroll = ({ scrollTop, scrollLeft }) => {
  if (containerRef.value.$el.offsetHeight + scrollTop + 50 > contentRef.value.offsetHeight && !moreLoading.value) {
    // 触底
    getVideoListData(videoListData.value.pageNum + 1)
  }
}

getVideoListData()
</script>
<style lang="scss" scoped>
.video-list-container {
  height: calc(100vh - 48px - 64px);
  box-sizing: border-box;
  overflow: hidden;
}
.play-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(3px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
</style>
