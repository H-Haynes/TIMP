<template lang="">
  <div style="z-index: 4000" class="h-16 flex justify-between items-center bg-gray-800 border-t border-gray-900 px-5">
    <!-- 切歌、播放控制器 -->
    <div class="flex text-gray-400 items-center h-full">
      <i class="iconfont icon-shangyishou mx-4 text-xl cursor-pointer" @click="prevSong(false)" />
      <i
        class="iconfont mx-4 text-xl cursor-pointer"
        :class="{ 'icon-zantingtingzhi': audioState === 'play', 'icon-bofang': audioState === 'pause' }"
        @click="toggleState"
      />
      <i class="iconfont icon-xiayishou mx-4 text-xl cursor-pointer" @click="nextSong(false)" />
    </div>

    <!-- 播放控制台 -->
    <div class="flex w-96 items-center text-sm text-gray-400 h-full">
      <el-avatar
        class="flex-shrink-0"
        shape="square"
        size="large"
        :src="playInfo.pic || playInfo.album?.pic || poster"
        @click="showLyricPanel = !showLyricPanel"
      />
      <div class="flex overflow-hidden flex-1 flex-col w-full item-center mx-2">
        <div class="flex">
          <p class="flex-1 truncate">
            {{ playInfo.name || "TIMP，随心听曲" }}
          </p>
          <i
            @click="removeLike(playInfo.id, playInfo.platform)"
            v-if="likeList.some((ele) => ele.id == curSongId)"
            class="iconfont icon-chuangyikongjianICON_fuzhi- text-red-500 ml-2 cursor-pointer"
          ></i>
          <i @click="() => playInfo.id && addLike(playInfo)" v-else class="iconfont icon-xihuan cursor-pointer"></i>
          <i @click="handleCollectSongClick(playInfo)" class="iconfont icon-icon-xian- text-sm ml-2 cursor-pointer" />
          <i @click="updateMode((mode + 1) % playModeList.length)" class="iconfont text--sm ml-2 cursor-pointer" :class="playModeList[mode].icon" />
        </div>
        <p class="flex justify-between items-ceter text-xs mt-1 text-gray-500">
          <span>{{ secToMin(currentTime) }}</span>
          <span v-if="playInfo.name" class="truncate mx-2"
            >{{
              playInfo.artists?.reduce((prev, cur) => {
                return prev + " " + cur.name
              }, "")
            }}-{{ playInfo.name }}</span
          >
          <span v-else>暂无歌曲</span>
          <span>{{ durationFormat(playInfo.duration) }}</span>
        </p>
        <t-drag-progress
          class="my-1"
          :value="playInfo.duration ? ((currentTime * 1000) / playInfo.duration) * 100 : 0"
          @update:value="setCurrentTime"
        />
      </div>
    </div>

    <!-- 音量、歌词、列表按钮 -->
    <div class="flex text-gray-400">
      <i class="iconfont icon-list mr-4 text-lg" @click="isShowPlayList = true" />
      <div class="flex items-center">
        <i class="iconfont icon-yinliang mr-2 text-lg" />
        <t-drag-progress :value="volume" width="150px" @update:value="updateVolume" />
      </div>
      <i class="iconfont icon-ci ml-2 text-lg cursor-pointer" @click="lyricWindow" :class="{ 'text-orange-400': showLyricPanel }" />
    </div>

    <!-- 媒体 -->
    <audio ref="audio" preload="auto" crossOrigin="anonymous" @play="() => handlePlay(audio)"></audio>
  </div>

  <!-- 侧边播放列表 -->
  <el-drawer v-model="isShowPlayList" :show-close="false">
    <template #header>
      <div class="">播放列表</div>
    </template>
    <el-table :data="playlist" @row-dblclick="toggleSong">
      <el-table-column label="歌曲名">
        <template #default="scope">
          <span class="truncate" :class="{ 'text-red-500': curSongId == scope.row.id }">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="歌手">
        <template #default="scope">
          <span class="truncate" :class="{ 'text-red-500': curSongId == scope.row.id }">
            {{
              scope.row.artists.reduce((prev, cur) => {
                return prev + " " + cur.name
              }, "")
            }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </el-drawer>

  <!-- 歌词界面 -->
  <lyric-comp :show="showLyricPanel" :playInfo="playInfo" :lyric="lyric" :currentTime="currentTime"> </lyric-comp>

  <el-dialog @close="clearAddInfo" title="添加到收藏" v-model="showAddSongDialog" class="!rounded-2xl" top="40vh" width="500px">
    <el-select size="large" class="w-full" v-model="addSongTargetAlbumId" placeholder="请选择歌单">
      <el-option v-for="album in albumList" :key="album.id" :label="album.name" :value="album.id"></el-option>
    </el-select>
    <template #footer>
      <div class="flex justify-center">
        <el-button class="w-100px" @click="showAddSongDialog = false">取消</el-button>
        <el-button class="w-100px ml-5" type="primary" @click="confirmCollectSong">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { EPlatform } from "@/enum"
import eventBus from "@/utils/eventBus"
import dayjs from "dayjs"
import poster from "@/assets/poster.jpg"
import lyricComp from "./Lyric.vue"
import { durationTransSec, secToMin, durationFormat } from "@/utils/filters"
import type { ISong } from "@/views/playlistDetail.vue"
import { getMusicLyric, getSongPlayUrl, proxyMusic } from "@/api"

export interface ILyricItem {
  time: number
  words: string
  wordList?: {
    word: string // 字
    start: number
    end: number
  }[]
  duration?: number
}

const { playlist, addLike, removeLike, likeList, addCollect, albumList, addSongToAlbum } = useStore("db")
// 播放器
const audio = ref()

// 播放状态
const audioState = ref("pause")

// 播放信息及设置）
const {
  url,
  updateUrl,
  lyric,
  updateLyric,
  mode,
  updateMode,
  currentTime,
  updateCurrentTime,
  curSongId,
  updateCurSongId,
  volume,
  updateVolume,
  playInfo,
  updatePlayInfo
} = useStore("playSetting")

const { addPlaylist } = useStore("db")

watch(
  () => url.value,
  (val) => {
    if (audio.value) {
      audio.value.preload = "auto"
      audio.value.src = import.meta.env.VITE_APP_WEB_URL + `/timp/proxy?url=${encodeURIComponent(val)}`
      // audio.value.src = val
    }
  }
)

// 是否显示播放列表
const isShowPlayList = ref(false)

// 是否首次加载
const appear = ref(true)

// 是否显示歌词面板
const showLyricPanel = ref(false)

// 是否显示桌面歌词
const showLyricWindow = ref(false)

// 播放模式列表
const playModeList = ref([
  {
    name: "循环模式",
    value: 0,
    icon: "icon-xunhuan"
  },
  {
    name: "随机模式",
    value: 1,
    icon: "icon-suijibofang"
  },
  {
    name: "单曲循环",
    value: 2,
    icon: "icon-danquxunhuan"
  }
])

// 获取播放地址
const getSongUrl = async (id: string | number, platform: EPlatform): Promise<string> => {
  return getSongPlayUrl({ id, platform }).then((res: any) => {
    return res.data
  })
}

// 获取歌词
const getLyric = async (id: string, platform: EPlatform) => {
  let list: ILyricItem[] = [
    {
      time: 0,
      words: "歌词获取失败!"
    }
  ]
  getMusicLyric({ id, platform })
    .then((res: any) => {
      list = res.data
    })
    .finally(() => {
      updateLyric(list)
    })
}

// watch(
//   [() => appear.value, () => playlist.value.length],
//   async () => {
//     let song = playlist.value.find((ele) => ele.id == curSongId.value)
//     console.log(curSongId.value, "当前歌曲", playlist.value)

//     updateUrl(await getSongUrl(curSongId.value, song.platform))

//     updatePlayInfo(await getSongInfo(curSongId.value, song.platform))
//     updateLyric(await getLyric(curSongId.value, song.platform))

//     appear.value = false
//     audio.value?.pause()
//   },
//   {
//     immediate: true
//   }
// )

// watchEffect(async () => {
//   if (appear.value && playlist.value.length) {
//     const { curSongId } = useStore("playSetting")
//     let song = playlist.value.find((ele) => ele.id == curSongId.value)
//     console.log(song, "歌曲", curSongId.value)
//     if (song) {
//       updateUrl(await getSongUrl(curSongId.value, song.platform))

//       updatePlayInfo(await getSongInfo(curSongId.value, song.platform))
//       updateLyric(await getLyric(curSongId.value, song.platform))

//       appear.value = false
//       audio.value?.pause()
//     }
//   }
// })

interface PlayParam {
  id: string
  platform: EPlatform
  auto?: boolean
  force?: boolean
}

// 监听播放歌曲
// eventBus.on("playSong", async ({ id: songId, type, auto = false, force = false }: any) => {
//   if (curSongId.value == songId && !force) return // 当前歌曲不切换
//   const songUrl = await getSongUrl(songId, type)
//   if (!songUrl) {
//     return
//   }
//   updateUrl(songUrl)
//   updatePlayInfo(await getSongInfo(songId, type))
//   updateLyric(await getLyric(songId, type))
//   // 触发添加播放列表事件, 并传递当前播放歌曲信息:歌曲id,歌曲名称,歌手，歌曲平台
//   platformType.value = type

//   updateCurSongId(songId)
//   audio.value?.play()
//   if (!auto) {
//     // 如果不是自动切歌，则添加到播放列表
//     addPlayList({
//       id: songId,
//       type: type,
//       name: playInfo.value.name,
//       art: playInfo.value.art.map((ele) => ({ name: ele.name, id: ele.id })),
//       timestamp: Date.now()
//     })
//   }
// })

// 设置播放进度
const setCurrentTime = (percent: number) => {
  if (!playInfo.value.duration) {
    updateCurrentTime(0)
    return
  }

  updateCurrentTime(((percent / 100) * +playInfo.value.duration) / 1000)
  if (audio.value) {
    audio.value.currentTime = currentTime.value
    if (audio.value.paused) {
      audio.value.play()
    }
  }
}

// 事件注册
onMounted(() => {
  // document.title = "桌面歌词"
  if (audio.value) {
    // 获取当前音量
    updateVolume(audio.value.volume * 100)

    // audio事件监听
    audio.value.addEventListener("play", () => {
      audioState.value = "play"
    })

    // 更新播放时间
    audio.value.addEventListener("timeupdate", (e: any) => {
      updateCurrentTime(e.target.currentTime)
    })

    // 暂停
    audio.value.addEventListener("pause", () => {
      audioState.value = "pause"
    })

    // 播放结束
    audio.value.addEventListener("ended", () => {
      // 将时间设置为0
      updateCurrentTime(0)
      audioState.value = "pause"
      // 切换下一首
      nextSong()
    })
  }
})

// 音量监听
watchEffect(() => {
  if (audio.value) {
    audio.value.volume = volume.value / 100
  }
})

// 切换播放状态
const toggleState = () => {
  if (audioState.value === "play") {
    audio.value?.pause()
  } else {
    audio.value?.play()
  }
}

// 下一首
const nextSong = (auto = true) => {
  // 获取到当前索引;
  const index = playlist.value.findIndex((ele) => ele.id == curSongId.value)
  console.log(index)
  let len = playlist.value.length
  // TODO 播放模式功能在此处完成
  let targetIndex
  if (mode.value === 0) {
    // 顺序播放循环
    targetIndex = index + 1
    if (targetIndex >= len) {
      targetIndex = 0
    }
  } else if (mode.value === 1) {
    // 随机播放
    targetIndex = Math.floor(Math.random() * len)
  } else if (mode.value === 2) {
    // 单曲循环
    if (!auto) {
      // 用户手动切歌的，按顺序列表
      targetIndex = index + 1
      if (targetIndex >= len) {
        targetIndex = 0
      }
    } else {
      // 自动切换的
      targetIndex = index
    }
  }
  // 如果是最后一首，则切换到第一首

  // 强制切换，用于单曲循环
  playSong(playlist.value[targetIndex], true, true)
}

// 上一首
const prevSong = (auto = true) => {
  const index = playlist.value.findIndex((ele) => ele.id == curSongId.value)
  let len = playlist.value.length
  let targetIndex
  // TODO 播放模式功能在此处完成
  if (mode.value === 0) {
    //列表循环
    targetIndex = index - 1
    if (targetIndex < 0) {
      targetIndex = len - 1
    }
  } else if (mode.value === 1) {
    // 随机播放
    targetIndex = Math.floor(Math.random() * len)
  } else if (mode.value === 2) {
    // 单曲循环
    if (!auto) {
      targetIndex = index - 1
      if (targetIndex < 0) {
        targetIndex = len - 1
      }
    } else {
      // 自动切换的
      targetIndex = index
    }
  }
  eventBus.emit("playSong", {
    id: playlist.value[targetIndex].id,
    type: playlist.value[targetIndex].type,
    auto: true,
    force: true // 强制切换，用于单曲循环
  })
}

// 切歌
const toggleSong = (song) => {
  eventBus.emit("playSong", {
    id: song.id,
    type: song.type,
    auto: true
  })
}

// 桌面歌词
const lyricWindow = () => {
  if (!showLyricWindow.value) {
    showLyricWindow.value = true
    window.electron.send("openLyric")
  } else {
    showLyricWindow.value = false
    window.electron.send("closeLyric")
  }
}

// 当前操作歌曲
const operatingSong = ref<ISong>({} as ISong)

// 是否显示添加到歌单Dialog
const showAddSongDialog = ref(false)

// 添加歌曲到歌单的目标歌单id
const addSongTargetAlbumId = ref("")

// 添加到歌单
const handleCollectSongClick = (song: ISong) => {
  if (!song?.id) {
    return
  }
  // 如果当前无自建歌单，直接提示，不弹出
  if (!albumList.value.length) {
    return ElMessage.error("暂无可用歌单,请先新建歌单!")
  }
  // 给默认值
  addSongTargetAlbumId.value = albumList.value[0].id
  operatingSong.value = song
  showAddSongDialog.value = true
}

// 清空添加到歌单相关数据
const clearAddInfo = () => {
  showAddSongDialog.value = false
  operatingSong.value = {} as ISong
  addSongTargetAlbumId.value = ""
}

// 确认添加歌曲到歌单
const confirmCollectSong = () => {
  addSongToAlbum(addSongTargetAlbumId.value, operatingSong.value)
  showAddSongDialog.value = false
}

// 重写部分

/**
 * 播放歌曲处理
 * @param songInfo 歌曲信息
 * @param auto 是否是自动切歌, 默认false
 * @param force 是否强制切歌, 默认false,单曲循环时，强制切换为当前歌曲
 */
const playSong = (songInfo: ISong, auto = false, force = false) => {
  // 如果目标歌曲就是当前歌曲，且不是强制切歌，那么不处理
  if (curSongId.value == songInfo.id && !force) return // 当前歌曲不切换

  // 获取播放地址
  getSongUrl(songInfo.id, songInfo.platform).then((src: string) => {
    if (src) {
      updatePlayInfo(songInfo)
      updateUrl(src)
      updateCurSongId(songInfo.id)
      // 获取歌词
      getLyric(songInfo.id, songInfo.platform)

      nextTick(() => {
        setCurrentTime(0) // 调用后会自动播放
        //   // audio.value?.play()
      })

      // 触发添加播放列表事件, 并传递当前播放歌曲信息:歌曲id,歌曲名称,歌手，歌曲平台
      // 如果不是自动切歌，则添加到播放列表
      if (!auto) {
        addPlaylist({
          name: playInfo.value.name,
          timestamp: Date.now(),
          artists: playInfo.value.artists.map((e) => ({ name: e.name, id: e.id })),
          // artists: playInfo.value.artists,

          duration: playInfo.value.duration,
          id: songInfo.id,
          platform: playInfo.value.platform
          //video: playInfo.value.video
        })
      }
    }
  })
}

// 播放歌曲
eventBus.on("playSong", (song: any) => playSong(song))

// 暂停歌曲
eventBus.on("pauseSong", audio.value?.pause)

const handlePlay = (audio) => {
  eventBus.emit("audioPlay", audio)
}
</script>
<style lang="scss">
.el-drawer {
  --el-drawer-bg-color: #212121 !important;
}
.el-table {
  --el-table-bg-color: red !important;
  --el-table-header-bg-color: #212121 !important;
  --el-table-border-color: #333 !important;

  --el-table-text-color: #aaa !important;
  --el-table-header-text-color: #ccc !important;
  --el-table-current-row-bg-color: purple !important;

  --el-table-fixed-box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
  --el-table-bg-color: #212121 !important;
  --el-table-tr-bg-color: #212121 !important; // 背景
}
</style>
