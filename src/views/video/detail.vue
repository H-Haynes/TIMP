<template>
  <div class="p-6 flex">
    <div class="player-wrapper flex-1">
      <div class="w-full">
        <t-v-player :poster="videoInfo.pic" :src="videoInfo.urls?.[0]"></t-v-player>
      </div>
      <h2 class="my-6">{{ videoInfo.name }}</h2>
      <div class="my-6 flex">
        <div class="flex items-center" v-for="user in videoInfo.creator">
          <el-avatar :size="30" :src="user.avatar"></el-avatar>
          <span class="text-sm ml-2 text-blue-800">{{ user.nickname }}</span>
        </div>
      </div>
      <div class="my-6 text-gray-400">
        <span>播放量：{{ countFormat(videoInfo.playCount) }}</span>
        <span class="ml-4">发布时间：{{ dayjs(videoInfo.createTime).format("YYYY-MM-DD") }}</span>
        <span class="ml-4 inline-flex items-center"
          >数据来源:
          <img class="w-6 ml-2" :src="whichLogo(videoInfo.platform)"></img>
        </span>
      </div>
      <p class="leading-6 text-sm text-gray-700">{{ videoInfo.description }}</p>
      <div class="h-400px"></div>
    </div>
    <!-- <div class="sidebar-wrapper"></div> -->
  </div>
</template>

<script setup lang="ts">
import { getRelatedVideo, getVideoDetail } from "@/api"
import dayjs from "dayjs"
import { whichLogo,countFormat } from "@/utils/filters"
import { EPlatform } from "@/enum";
const router = useRouter()
const route = useRoute()

const videoInfo = ref({
  name: "",
  pic: "",
  urls: [],
  creator: [] as {avatar:string,nickname:string}[],
  playCount: 0,
  createTime: 0,
  platform: 0,
  description: ""
})
const loading = ref(false)

const getVideoInfo = () => {
  getVideoDetail({
    id: route.params.id as string,
    platform: Number(route.query.platform)
  })
    .then((res:any) => {
      videoInfo.value = res.data
    })
    .finally(() => {
      loading.value = false
    })
}

const relatedList = ref<any[]>([])

const getRelatedList = () => {
  getRelatedVideo({
    id:route.params.id as string,
    platform: route.query.platform as any as EPlatform
  }).then((res=>{
    console.log(res)
  }))
}



onMounted(() => {
  getVideoInfo()
  getRelatedList()
})
</script>

<style lang="scss" scoped>
.player-wrapper {
}

.sidebar-wrapper {
  width: 300px;
  margin-left: 50px;
  border: 1px solid #000;
}
</style>
