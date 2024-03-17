<template>
  <div class="p-6">
    <el-skeleton class="h-220px overflow-hidden" :loading="loading" animated>
      <template #template>
        <div class="flex">
          <el-skeleton-item variant="image" class="flex-shrink-0" style="width: 220px; height: 220px; border-radius: 16px" />
          <div class="flex-1 ml-8 h-220px flex flex-col">
            <el-skeleton-item variant="circle" style="height: 2.25rem; width: 400px; border-radius: 16px"></el-skeleton-item>
            <div class="flex justify-between items-center mt-4">
              <div class="flex items-center">
                <el-skeleton-item variant="image" style="width: 20px; height: 20px; border-radius: 50%"></el-skeleton-item>
                <el-skeleton-item variant="p" style="height: 20px; width: 100px; margin-left: 4px"></el-skeleton-item>
                <el-skeleton-item variant="image" style="width: 14px; height: 14px; border-radius: 50%; margin-left: 4px"></el-skeleton-item>
              </div>
              <el-skeleton-item style="height: 18px; width: 244px"></el-skeleton-item>
            </div>
            <div class="flex-1 mt-4">
              <el-skeleton :rows="2" animated />
            </div>
            <div class="h-40px flex items-end">
              <el-skeleton-item variant="text" style="height: 32px; width: 108px; border-radius: 32px" />
              <el-skeleton-item variant="text" style="height: 32px; width: 108px; border-radius: 32px; margin-left: 12px" />
              <el-skeleton-item variant="text" style="height: 32px; width: 108px; border-radius: 32px; margin-left: 12px" />
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div class="flex">
          <el-image class="w-220px rounded-lg flex-shrink-0" :src="playlistDetail?.pic"></el-image>
          <div class="flex-1 ml-8 h-220px flex flex-col">
            <p class="text-2xl font-bold leading-9 flex-shrink-0">
              {{ playlistDetail?.name }}
            </p>
            <div class="flex justify-between items-center mt-4 flex-shrink-0">
              <div class="flex items-center">
                <template v-if="playlistDetail?.creator">
                  <el-avatar :src="playlistDetail.creator?.avatar" :size="20"></el-avatar>
                  <span class="ml-1 text-blue-800">{{ playlistDetail.creator?.nickname }}</span>
                  <el-avatar
                    class="ml-1"
                    v-if="playlistDetail.creator?.specialIdentify"
                    :size="14"
                    :src="playlistDetail.creator?.specialIdentify"
                  ></el-avatar>
                </template>
              </div>
              <span>最近更新：{{ dayjs(playlistDetail?.updateTime).format("YYYY-MM-DD") }}</span>
            </div>
            <div class="flex-1 mt-4 overflow-hidden">
              <el-scrollbar>
                <p class="leading-7" v-html="playlistDetail?.description"></p>
              </el-scrollbar>
            </div>
            <div class="h-40px flex items-end flex-shrink-0">
              <el-button color="#c10816" round>
                <i class="icon-bofang mr-1"></i>
                播放全部
              </el-button>
              <el-button @click="handleAddCollect" color="#2a3240" round>
                <i class="icon-icon-xian- mr-1"></i>
                收藏歌单
              </el-button>
              <el-button color="#a63784" round>
                <i class="icon-download mr-1"></i>
                下载全部
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <el-skeleton class="mt-16" :loading="loading" animated>
      <template #template>
        <div>
          <div v-for="item in 20" :key="item" class="h-48px border-b">
            <el-skeleton-item style="height: 24px"></el-skeleton-item>
          </div>
        </div>
      </template>
      <template #default>
        <el-table
          class="mt-16"
          @row-dblclick="handleDbClick"
          min-height="500px"
          row-class-name="h-12 cursor-pointer"
          :data="playlistDetail?.songList"
        >
          <el-table-column label="歌曲" prop="name">
            <template #default="{ row }">
              {{ row.name }}
              <i class="icon-mv text-red-500 ml-1" v-if="row.video"></i>
            </template>
          </el-table-column>
          <el-table-column label="歌手">
            <template #default="{ row }">
              {{ row.artists?.map((item) => item.name).join("/") }}
            </template>
          </el-table-column>
          <el-table-column label="专辑">
            <template #default="{ row }">
              {{ row.album?.name }}
            </template>
          </el-table-column>
          <el-table-column
            label="时长"
            align="center"
            :formatter="(row) => durationFormat(row.duration)"
            prop="duration"
            width="100px"
          ></el-table-column>
          <el-table-column label="操作" width="180px" align="center">
            <template #default="{ row }">
              <i class="icon-xihuan2 cursor-pointer"></i>
              <i class="icon-icon-xian- ml-2 cursor-pointer"></i>
              <i class="icon-download ml-2 cursor-pointer" @click="download(row)"></i>
            </template>
          </el-table-column>
          <template #empty>
            <div class="h-500px flex items-center justify-center">暂无数据</div>
          </template>
        </el-table>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { getPlaylistDetail, getSongPlayUrl, downloadSong, downloadFile } from "@/api"

import { durationTransSec, durationFormat } from "@/utils/filters"
import dayjs from "dayjs"
import { EPlatform } from "@/enum"
import eventBus from "@/utils/eventBus"
import { IRank } from "./rank.vue"
import posterJpg from "@/assets/poster.jpg"

interface ICreator {
  avatar: string // 头像
  description?: string // 描述
  nickname: string // 昵称
  signature?: string // 签名
  specialIdentify?: string // 身份标识(认证、会员等)
}

interface IArtist {
  id: string | number
  name: string
}

export interface ISong {
  platform: EPlatform
  name: string
  publishTime?: string
  id: string
  duration: number
  album?: {
    id: string | number
    name: string
    pic: string
  }
  artists: IArtist[]
  alias?: string[]
  url?: string
  timestamp?: number
}
export interface IPlaylistDetail extends IRank {
  creator?: ICreator
  songList: ISong[]
  id: string
}

const loading = ref(true)

const route = useRoute()

const { albumList, likeList, addCollect } = useStore("db")

// 下载歌曲
const download = (song: ISong) => {
  getSongPlayUrl({
    id: song.id,
    platform: song.platform
  }).then((res: any) => {
    downloadSong(
      {
        url: res.data
      },
      song.name + ".mp3"
    )
    // downloadFile({
    //   url: res.data
    // })
  })
}

// 查询参数
const query = ref({
  id: route.params.id,
  platform: Number(route.query.platform),
  isRank: route.query.isRank as string
})

// 歌单详情
const playlistDetail = ref<IPlaylistDetail>({
  songList: likeList.value,
  name: "我喜欢",
  id: "0",
  description: "我喜欢的歌曲",
  relationId: "0",
  pic: posterJpg,
  platform: EPlatform.自建,
  createTime: ""
})

// 获取歌单详情
const getDetail = () => {
  if (+query.value.platform === EPlatform.自建) {
    getLocalDetail()
    loading.value = false
    return
  }
  console.log("非自建歌单")
  loading.value = true
  getPlaylistDetail(query.value)
    .then((res: any) => {
      playlistDetail.value = res.data
    })
    .finally(() => {
      loading.value = false
    })
}

// 获取自建歌单详情
const getLocalDetail = () => {
  console.log(+query.value.id === 0)
  if (+query.value.id === 0) {
    // 我喜欢
    playlistDetail.value = {
      songList: likeList.value,
      name: "我喜欢",
      id: "0",
      creator: {
        avatar: posterJpg,
        nickname: "我"
      },
      description: "我喜欢的歌曲",
      relationId: "0",
      pic: posterJpg,
      platform: EPlatform.自建,
      createTime: ""
    }
  } else {
    // 我的歌单
    console.log(albumList.value, query.value.id)
    const album = albumList.value.find((e) => e.id === query.value.id)
    if (album) {
      console.log(album, "歌单")
      playlistDetail.value = album
    } else {
      ElMessage.error("歌单不存在")
    }
  }
}

// 双击播放
const handleDbClick = (row: ISong) => {
  eventBus.emit("playSong", row)
}

// 添加到收藏
const handleAddCollect = () => {
  const { name, id, pic, platform } = playlistDetail.value
  addCollect({
    name,
    id,
    pic,
    platform
  })
}

getDetail()
</script>
