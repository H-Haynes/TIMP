<template lang="">
  <div style="z-index: 4000" class="h-16 flex justify-between items-center bg-gray-800 border-t border-gray-900 px-5">
    <div class="flex text-gray-400 items-center h-full">
      <i class="iconfont icon-shangyishou mx-4 text-xl cursor-pointer" @click="prevSong(false)" />
      <i
        class="iconfont mx-4 text-xl cursor-pointer"
        :class="{ 'icon-zantingtingzhi': audioState === 'play', 'icon-bofang': audioState === 'pause' }"
        @click="toggleState"
      />
      <i class="iconfont icon-xiayishou mx-4 text-xl cursor-pointer" @click="nextSong(false)" />
    </div>
    <div class="flex w-96 items-center text-sm text-gray-400 h-full">
      <el-avatar class="flex-shrink-0" shape="square" size="large" :src="playInfo.picUrl || poster" @click="showLyricPanel = !showLyricPanel" />
      <div class="flex overflow-hidden flex-1 flex-col w-full item-center mx-2">
        <div class="flex">
          <p class="flex-1 truncate">
            {{ playInfo.name || "TIMP，随心而行" }}
          </p>
          <i
            @click="unlike"
            v-if="likeList.some((ele) => ele.id == curSongId)"
            class="iconfont icon-chuangyikongjianICON_fuzhi- text-red-500 ml-2 cursor-pointer"
          ></i>
          <i @click="addLike" v-else class="iconfont icon-xihuan cursor-pointer"></i>
          <i @click="handleCollectClick" class="iconfont icon-icon-xian- text-sm ml-2 cursor-pointer" />
          <i @click="mode = (mode + 1) % playModeList.length" class="iconfont text--sm ml-2 cursor-pointer" :class="playModeList[mode].icon" />
        </div>
        <p class="flex justify-between items-ceter text-xs mt-1 text-gray-500">
          <span>{{ secToMin(currentTime) }}</span>
          <span v-if="playInfo.name" class="truncate mx-2"
            >{{
              playInfo.art.reduce((prev, cur) => {
                return prev + " " + cur.name
              }, "")
            }}-{{ playInfo.name }}</span
          >
          <span v-else>暂无歌曲</span>
          <span>{{ durationFormat(playInfo.time) }}</span>
        </p>
        <drag-progress class="my-1" :value="playInfo.time ? ((currentTime * 1000) / playInfo.time) * 100 : 0" @update:value="setCurrentTime" />
      </div>
    </div>
    <div class="flex text-gray-400">
      <i class="iconfont icon-list mr-4 text-lg" @click="visiblePlayList = true" />
      <div class="flex items-center">
        <i class="iconfont icon-yinliang mr-2 text-lg" />
        <drag-progress :value="audioVolume" width="150px" @update:value="(e) => (audioVolume = e)" />
      </div>
      <i class="iconfont icon-ci ml-2 text-lg cursor-pointer" @click="lyricWindow" :class="{ 'text-orange-400': showLyricPanel }" />
    </div>
    <audio ref="audio" :src="playSrc"></audio>

    <el-drawer v-model="visiblePlayList" :show-close="false">
      <template #title>
        <div class="">播放列表</div>
      </template>
      <el-table :data="playList" @row-dblclick="toggleSong">
        <el-table-column label="歌曲名">
          <template #default="scope">
            <span class="truncate" :class="{ 'text-red-500': curSongId == scope.row.id }">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="歌手">
          <template #default="scope">
            <span class="truncate" :class="{ 'text-red-500': curSongId == scope.row.id }">
              {{
                scope.row.art.reduce((prev, cur) => {
                  return prev + " " + cur.name
                }, "")
              }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <!-- <ul>
        <li v-for="item in playList" class="text-left flex text-gray-400 py-1 px-2 text-sm truncate cursor-pointer hover:bg-gray-700" :key="item.id">
          <span class="flex-5 truncate">{{item.name}}</span>
          <span class="flex-1"> - </span>
          <span class="flex-5 truncate">{{item.art.reduce((prev,cur)=>{return prev + ' ' + cur.name},'')}}</span>
        </li>
      </ul> -->
    </el-drawer>
  </div>
  <div
    style="z-index: 3400"
    :style="{ top: showLyricPanel ? '0' : '100%' }"
    class="flex justify-around transition-all duration-500 absolute py-16 h-full w-full left-0 bg-gray-800"
  >
    <el-avatar :size="240" shape="square" :src="playInfo.picUrl || poster"></el-avatar>

    <div class="w-96 mb-10 flex flex-col" style="min-height: 300px">
      <strong class="text-2xl text-white">{{ playInfo.name }}</strong>
      <span class="text-white leading-8">{{ playInfo.art.map((ele) => ele.name).join("/") }}</span>
      <ul ref="lyricWrap" class="overflow-y-scroll flex-1 lyric-wrap">
        <li
          v-for="(item, index) in lyric"
          :key="index"
          :class="{ 'lyric-highlight': highlightLine === index }"
          class="leading-8 text-gray-500"
          v-html="item.words"
        ></li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { EPlatform } from "@/enum"
import eventBus from "@/utils/eventBus"
import dayjs from "dayjs"
import poster from "@/assets/poster.jpg"
import { durationTransSec, secToMin, durationFormat } from "@/utils/filters"

let getSongUrlQQ,
  getSongPicQQ,
  getSongInfoQQ,
  getLyricQQ,
  getSongUrlWy,
  getSongDetailWy,
  getLyricWy,
  getLyricKW,
  getMusicUrlKW,
  getSongDetailKW,
  getSongDetailKG,
  getKGLyric
getSongUrlQQ =
  getSongPicQQ =
  getSongInfoQQ =
  getLyricQQ =
  getSongUrlWy =
  getSongDetailWy =
  getLyricWy =
  getLyricKW =
  getMusicUrlKW =
  getSongDetailKW =
  getSongDetailKG =
  getKGLyric =
    () => Promise.resolve({})

const playSrc = ref("")
const audio: Ref<null | HTMLAudioElement> = ref(null)
const currentTime = ref(+(localStorage.getItem("currentTime") || 0))
const audioVolume = ref(1)
const audioState = ref("pause")
const playList: Ref<any[]> = inject("playList") as Ref<any[]>
const curSongId = ref(localStorage.getItem("curSongId") || "")
const visiblePlayList = ref(false)
const appear = ref(true)
const lyric = ref([])
const platformType = ref(0)
const showLyricPanel = ref(false)
const lyricWrap: Ref<null | HTMLUListElement> = ref(null)
const lyricWrapHeight = ref(0)
const timer = ref(0)
const likeList = inject("likeList")
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
const mode = ref(+(localStorage.getItem("mode") || 0))
const playInfo = ref({
  name: "正在播放的歌曲",
  art: [{ name: "歌手" }],
  time: 111700,
  picUrl: "",
  albumId: ""
})
const showLyricWindow = ref(false)

// 获取歌曲信息，包含:name,time,picUrl,art
const getSongInfo = async (id: string | number, platformType: platform) => {
  let songInfo = {
    name: "",
    art: [],
    time: 0,
    picUrl: "",
    albumId: ""
  }
  if (platformType == EPlatform.网易) {
    const result = await getSongDetailWy(id)
    if (result.data.code === 200) {
      songInfo.name = result.data.songs[0].name
      songInfo.art = result.data.songs[0].ar
      songInfo.picUrl = result.data.songs[0].al.picUrl
      songInfo.time = result.data.songs[0].dt
    }
  } else if (platformType == EPlatform.QQ) {
    // 获取歌曲信息
    const infoResult = await getSongInfoQQ(id)
    if (infoResult.data.response.code === 0) {
      songInfo.art = infoResult.data.response.songinfo.data.track_info.singer.map((ele) => {
        return {
          name: ele.name,
          id: ele.mid
        }
      })
      songInfo.name = infoResult.data.response.songinfo.data.track_info.title
      songInfo.time = infoResult.data.response.songinfo.data.track_info.interval * 1000
      songInfo.albumId = infoResult.data.response.songinfo.data.track_info.album.mid
    }
    const picResult = await getSongPicQQ(songInfo.albumId)
    if (picResult.data.response.code === 0) {
      songInfo.picUrl = picResult.data.response.data.imageUrl
    }
  } else if (platformType === EPlatform.酷我) {
    let mid = id.toString().match(/\d+/)?.[0]
    const result = await getSongDetailKW(mid as string)
    if (result.data.code === 200) {
      songInfo = {
        name: result.data.data.name,
        art: [
          {
            name: result.data.data.artist,
            id: result.data.data.artistid
          }
        ],
        time: result.data.data.duration * 1000,
        picUrl: result.data.data.pic
      }
    }
  } else if (platformType === EPlatform.酷狗) {
    const result = await getSongDetailKG(id)
    songInfo = {
      name: result.data.songName,
      time: result.data.timeLength * 1000,
      picUrl: result.data?.imgUrl?.replace("{size}", "400"),
      art: Array.isArray(result.data.authors)
        ? result.data.authors?.map((ele) => ({
            name: ele.author_name,
            id: ele.author_id
          }))
        : [
            {
              name: result.data.singerName || result.data.author_name,
              id: result.data.singerId
            }
          ]
    }
  }
  return songInfo
}

// 获取播放地址
const getSongUrl = async (id: string | number, platformType: platform) => {
  if (platformType == EPlatform.网易) {
    const result = await getSongUrlWy(id)
    if (result.data.code == 200 && result.data.data[0].url) {
      return result.data.data[0].url
    } else {
      ElMessage.error("暂无播放地址")
      return false
    }
  } else if (platformType == EPlatform.QQ) {
    const result = await getSongUrlQQ(id)
    if (!result.data.data.playUrl[id].error) {
      return result.data.data.playUrl[id].url
    } else {
      ElMessage.error(result.data.data.playUrl[id].error)
      return false
    }
  } else if (platformType == EPlatform.酷狗) {
    const result = await getMusicUrlKW(id)
    if (result.data.code === 200) {
      return result.data.data
    } else {
      ElMessage.error("暂无播放地址")
      return false
    }
  } else if (platformType == EPlatform.酷狗) {
    const result = await getSongDetailKG(id)
    return result.data.url || result.data.backup_url[0]
  }
}

// 获取歌词
const getLyric = async (id: string, platformType: EPlatform) => {
  let list = [
    {
      time: 0,
      words: "歌词获取失败!"
    }
  ]
  if (platformType === EPlatform.网易) {
    const result = await getLyricWy(id)
    if (result.data.code == 200) {
      let lyricArr = result.data.lrc.lyric.split("\n").filter((ele) => ele.trim()) // 去除空的
      list = lyricArr.map((ele) => {
        let temp = ele.split("]")
        let words = temp[1].trim()
        let time = temp[0].replace("[", "").trim()
        return {
          time: durationTransSec(time),
          words
        }
      })
    }
  } else if (platformType === EPlatform.QQ) {
    const result = await getLyricQQ(id)
    if (result.data.response.code === 0) {
      let lyricArr = result.data.response.lyric.split("\n").filter((ele) => ele.trim())
      list = lyricArr.map((ele) => {
        let temp = ele.split("]")
        let words = temp[1].trim()
        let time = temp[0].replace("[", "").trim()
        return {
          time: durationTransSec(time),
          words
        }
      })
    }
  } else if (platformType === EPlatform.酷狗) {
    const result = await getLyricKW(id)
    if (result.data.status === 200) {
      list = result.data.data.lrclist.map((ele) => {
        return {
          time: +ele.time,
          words: ele.lineLyric
        }
      })
    }
  } else if (platformType === EPlatform.酷狗) {
    const result = await getKGLyric(id)
    if (result.data.code === 200) {
      let lyricArr = result.data.result.split("\r\n").filter((ele) => ele[ele.length - 1] !== "]" && ele.trim())
      list = lyricArr.map((ele) => {
        let temp = ele.split("]")
        let words = temp[1].trim()
        let time = temp[0].replace("[", "").trim()
        return {
          time: durationTransSec(time),
          words
        }
      })
    }
  }
  return list
}

watchEffect(async () => {
  if (curSongId.value) {
    localStorage.setItem("curSongId", curSongId.value)
  }
})

watchEffect(async () => {
  if (appear.value && playList.value.length) {
    let song = playList.value.find((ele) => ele.id == curSongId.value)
    lyric.value = await getLyric(curSongId.value, song.type)
    playSrc.value = await getSongUrl(curSongId.value, song.type)
    playInfo.value = await getSongInfo(curSongId.value, song.type)
    appear.value = false
    audio.value?.pause()
  }
})

// 监听播放歌曲
eventBus.on("playSong", async ({ id: songId, type, auto = false, force = false }: any) => {
  if (curSongId.value == songId && !force) return // 当前歌曲不切换
  const songUrl = await getSongUrl(songId, type)
  if (!songUrl) {
    return
  }
  playSrc.value = songUrl
  playInfo.value = await getSongInfo(songId, type)
  lyric.value = await getLyric(songId, type)
  // 触发添加播放列表事件, 并传递当前播放歌曲信息:歌曲id,歌曲名称,歌手，歌曲平台
  platformType.value = type
  curSongId.value = songId
  audio.value?.play()
  if (!auto) {
    // 如果不是自动切歌，则添加到播放列表
    eventBus.emit("addPlayList", {
      id: songId,
      type: type,
      name: playInfo.value.name,
      art: playInfo.value.art.map((ele) => ({ name: ele.name, id: ele.id })),
      timestamp: Date.now()
    })
  }
})

// 监听暂停歌曲
eventBus.on("pauseSong", () => {
  audio.value?.pause()
})
const setCurrentTime = (percent: number) => {
  if (!playInfo.value.time) {
    return (currentTime.value = 0)
  }
  console.log(percent, playInfo.value.time)
  currentTime.value = ((percent / 100) * playInfo.value.time) / 1000
  if (audio.value) {
    audio.value.currentTime = currentTime.value
    if (audio.value.paused) {
      audio.value.play()
    }
  }
}

watchEffect(() => {
  if (showLyricPanel.value) {
    nextTick(() => {
      lyricWrapHeight.value = lyricWrap.value?.offsetHeight ?? 0
    })
  }
})

onMounted(() => {
  // 获取播放模式
  // mode.value = Number(localStorage.getItem('mode')||0);
  // 获取播放进度
  // currentTime.value = Number(localStorage.getItem('currentTime')||0);
  window.onresize = () => {
    lyricWrapHeight.value = lyricWrap.value?.offsetHeight ?? 0
  }
  document.title = "桌面歌词"
  if (audio.value) {
    // 获取当前音量
    audioVolume.value = audio.value.volume * 100

    audio.value.addEventListener("timeupdate", (e: any) => {
      currentTime.value = e.target.currentTime
    })
    // audio事件监听
    audio.value.addEventListener("play", () => {
      audioState.value = "play"
    })

    audio.value.addEventListener("pause", () => {
      audioState.value = "pause"
    })

    audio.value.addEventListener("ended", () => {
      // 将时间设置为0
      currentTime.value = 0
      audioState.value = "pause"
      // 切换下一首
      nextSong()
    })
  }

  // 监听页面卸载，存储播放位置
  window.onunload = () => {
    localStorage.setItem("currentTime", currentTime.value.toString())
  }
})
watchEffect(() => {
  if (audio.value) {
    audio.value.volume = audioVolume.value / 100
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

const nextSong = (auto = true) => {
  // 获取到当前索引;
  const index = playList.value.findIndex((ele) => ele.id == curSongId.value)
  console.log(index)
  let len = playList.value.length
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
  eventBus.emit("playSong", {
    id: playList.value[targetIndex].id,
    type: playList.value[targetIndex].type,
    auto: true,
    force: true // 强制切换，用于单曲循环
  })
}

const prevSong = (auto = true) => {
  const index = playList.value.findIndex((ele) => ele.id == curSongId.value)
  let len = playList.value.length
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
    id: playList.value[targetIndex].id,
    type: playList.value[targetIndex].type,
    auto: true,
    force: true // 强制切换，用于单曲循环
  })
}
const toggleSong = (song) => {
  eventBus.emit("playSong", {
    id: song.id,
    type: song.type,
    auto: true
  })
}

// 计算高亮行
const highlightLine = computed(() => {
  let index = lyric.value.findIndex((ele: any, index) => {
    return currentTime.value > ele.time && (lyric.value[index + 1] ? currentTime.value < lyric.value[index + 1].time : true)
  })
  return index
})

watch([() => highlightLine.value, () => lyricWrapHeight.value], () => {
  // 获取当前highlight，设置滚动条位置到highlight
  // 如果当前highlight位置小于ul一半位置，则滚动到0，否则滚动到highlight - ul/2 的位置

  // 滚动动画
  function scrollAnimation(target) {
    let times = 20
    timer.value = requestAnimationFrame(function fn() {
      let speed = (target - lyricWrap.value.scrollTop) / times // 约320毫秒执行完
      if (lyricWrap.value) {
        // if(Math.abs(target - lyricWrap.value.scrollTop) > speed){
        if (times > 1) {
          lyricWrap.value.scrollTop += speed
          times--
          timer.value = requestAnimationFrame(fn)
        } else {
          lyricWrap.value.scrollTop = target
          cancelAnimationFrame(timer.value)
        }
      } else {
        cancelAnimationFrame(timer.value)
      }
    })
  }
  if (showLyricPanel.value && highlightLine.value && lyricWrap.value) {
    let highlightDOM = document.getElementsByClassName("lyric-highlight")[0]
    if (highlightDOM && lyricWrapHeight.value) {
      cancelAnimationFrame(timer.value)
      let target
      if (highlightDOM.offsetTop < lyricWrapHeight.value / 2) {
        // lyricWrap.value?.scrollTo(0,0);
        target = 0
      } else {
        target = highlightDOM.offsetTop - lyricWrapHeight.value / 2
        // lyricWrap.value?.scrollTo(0,highlightDOM.offsetTop - lyricWrapHeight.value/2);
      }
      scrollAnimation(target)
    }
  }
})

watch(highlightLine, () => {
  // 将当前行歌词，发送到主进程
  window.electron.send("lyric", lyric.value?.[highlightLine.value]?.words)
})

const lyricWindow = () => {
  if (!showLyricWindow.value) {
    showLyricWindow.value = true
    window.electron.send("openLyric")
  } else {
    showLyricWindow.value = false
    window.electron.send("closeLyric")
  }
}

const addLike = () => {
  eventBus.emit("addLike", {
    album: "",
    art: toRaw(playInfo.value.art),
    id: curSongId.value,
    mv: "",
    name: playInfo.value.name,
    picUrl: playInfo.value.picUrl,
    time: playInfo.value.time
  })
}

const unlike = () => {
  eventBus.emit("unLike", curSongId.value)
}

watch(
  () => mode.value,
  () => {
    localStorage.setItem("mode", mode.value.toString()) // 缓存播放模式
  }
)

const handleCollectClick = () => {
  // 传递歌曲的名称、歌手、专辑、时长、id
  let data = {
    id: curSongId.value,
    name: playInfo.value.name,
    album: "",
    time: playInfo.value.time,
    art: toRaw(playInfo.value.art),
    type: platformType.value
  }
  eventBus.emit("triggerSongToAlbum", data)
}

// 重写部分

// 歌曲信息
const songInfo = ref({})

/**
 * 获取歌曲信息(含歌词)
 * @param id 歌曲id
 * @param platform 平台
 */
const getSongInfos = (id: string, platform: number) => {}
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

.lyric-highlight {
  font-size: 18px;
  font-weight: bold;
  background-image: -webkit-linear-gradient(right, #f40, orange, yellow, green, skyblue, cyan, purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
