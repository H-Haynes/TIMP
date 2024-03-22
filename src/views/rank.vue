<template>
  <div class="text-white p-4">
    <div class="p-8">
      <el-skeleton :loading="bannerLoading" animated>
        <template #template>
          <el-carousel type="card" height="200px" class="w-11/12 mx-auto h-200px">
            <el-carousel-item v-for="item in 5" :key="item" style="border-radius: 8px">
              <el-skeleton-item type="rect" style="height: 100%; width: 100%"></el-skeleton-item>
            </el-carousel-item>
          </el-carousel>
        </template>
        <template #default>
          <el-carousel v-show="bannerList.length > 0" :interval="4000" type="card" height="200px" class="w-11/12 mx-auto h-200px">
            <el-carousel-item v-for="item in bannerList" :key="item.bannerId" class="relative">
              <img width="24" class="absolute left-1 top-1" :src="whichLogo(item.platform)" />
              <img :src="item.pic" class="w-full object-cover h-full rounded-lg" />
              <span class="absolute right-0 p-1 text-xs rounded-md bottom-0" :style="{ backgroundColor: item.tagColor }">{{ item.tag }}</span>
            </el-carousel-item>
          </el-carousel>
        </template>
      </el-skeleton>
    </div>

    <el-skeleton :loading="rankLoading" animated>
      <template #template>
        <div class="rank-container gap-x-6 gap-y-6 w-full">
          <el-skeleton-item v-for="item in 40" variant="rect" style="width: 12rem; height: 12rem; border-radius: 8px" />
        </div>
      </template>
      <template #default>
        <div class="rank-container gap-x-6 gap-y-6 w-full">
          <div
            class="w-48 h-48 rounded-md overflow-hidden relative cursor-pointer"
            @click="handleRankDetail(rank)"
            v-for="rank in rankList"
            :key="rank.relationId"
          >
            <img :src="rank.pic" class="w-48" />
            <img width="24" class="absolute left-1 top-1" :src="whichLogo(rank.platform)" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { getBanner, getRankList } from "@/api"
import { EPlatform } from "@/enum"
import { whichLogo } from "@/utils/filters"

interface Banner {
  pic: string
  platform: EPlatform
  tag: string
  tagColor?: string
  bannerId: string
  bannerType: number
  url?: string
  video?: string
  relationId: string
}

export interface IRank {
  name: string
  description: string
  relationId: string
  pic: string
  createTime: string
  trackCount?: number
  updateTime?: string
  playCount?: number
  subscribedCount?: number
  platform: EPlatform
  isRank: number
}

const router = useRouter()
// 轮播图列表
const bannerList = ref<Banner[]>([])
const bannerLoading = ref(false)
const rankLoading = ref(false)
// 获取banner列表
const getBannerList = () => {
  bannerLoading.value = true
  getBanner()
    .then((res: any) => {
      bannerList.value = res.data
    })
    .finally(() => {
      bannerLoading.value = false
    })
}

// 排行榜列表
const rankList = ref<IRank[]>([])

// 获取排行榜列表
const getRankLists = () => {
  rankLoading.value = true
  getRankList()
    .then((res: any) => {
      rankList.value = res.data
    })
    .finally(() => {
      rankLoading.value = false
    })
}

// 查看排行榜详情
const handleRankDetail = (rank: IRank) => {
  router.push({
    name: "PlaylistDetail",
    params: {
      id: rank.relationId
    },
    query: {
      isRank: rank.isRank,
      platform: rank.platform
    }
  })
}

getBannerList()
getRankLists()
</script>

<style lang="scss" scoped>
.rank-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(192px, 1fr));
  grid-template-rows: repeat(auto-fit, minmax(192px, 1fr));
}
</style>
import { whichLogo } from "@/utils/filters";
