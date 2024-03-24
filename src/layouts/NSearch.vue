<template>
  <div class="h-12 z-10">
    <div class="fixed top-4 right-3 flex items-center text-white-300">
      <div class="relative" v-click-outside="() => (visiblePanel = false)">
        <input
          class="w-48 leading-6 text-white-300 rounded-xl outline-none text-sm px-2 dark:border-none border-1 border-gray-700"
          placeholder="请输入搜索内容"
          :value="keywords"
          @input="(e: any) => (keywords = e?.target!.value)"
          @focus="visiblePanel = true"
        />
        <Transition name="el-zoom-in-top">
          <div v-if="visiblePanel" v-loading="searchLoading" class="search-panel py-2 bg-light-500 dark:bg-gray-900">
            <el-scrollbar class="h-full">
              <div v-if="searchResult.length">
                <div
                  class="px-4 leading-5 py-1 flex items-center text-sm min-h-8 cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-600"
                  v-for="song in searchResult"
                  @click="handlePlay(song)"
                  :key="song.id"
                >
                  <span>
                    <img :src="whichLogo(song.platform)" width="12" />
                    <i @click.stop="toMv(song)" class="icon-mv text-red-500 ml-1" v-if="song.video"></i>

                    <span class="ml-2" v-html="song.name.replace(new RegExp(keywords), `<span class='highlight'>${keywords}</span>`)"></span>
                    <span> - {{ song.artists.map((e) => e.name).join("/") }}</span>
                  </span>
                </div>
              </div>
              <div v-else class="p-2">
                <span
                  class="py-1 px-2 inline-block rounded-md text-sm hover:text-green-500 hover:dark:text-green-300 cursor-pointer bg-gray-200 dark:bg-gray-700 mr-2 mb-2"
                  v-for="(item, index) in suggestList"
                  @click="keywords = item"
                  :key="index"
                  >{{ item }}</span
                >
              </div>
            </el-scrollbar>
          </div>
        </Transition>
      </div>
      <i @click="openSetting" class="iconfont icon-set text-sm ml-3 cursor-pointer" />
      <i class="iconfont icon-pifu text-sm ml-3 cursor-pointer" />
      <i class="iconfont icon-shensemoshi ml-3 cursor-pointer" @click="toggleDark()"></i>
      <i class="iconfont icon-fuzhi text-sm ml-3 cursor-pointer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ISong } from "@/views/playlistDetail.vue"
import { useDark, useToggle } from "@vueuse/core"
import { throttle, debounce } from "throttle-debounce"
import { getSearch, getSearchSuggest } from "@/api"
import { ClickOutside as vClickOutside } from "element-plus"
import eventBus from "@/utils/eventBus"
import { whichLogo } from "@/utils/filters"
const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()

const keywords = ref("")
const visiblePanel = ref(false)

const searchLoading = ref(false)
const openSetting = () => {
  router.push({ name: "Setting" })
}

const searchResult = ref<ISong[]>([])

const suggestList = ref<string[]>([])

const search = debounce(500, () => {
  if (!keywords.value) {
    searchResult.value = []
    return
  }
  searchLoading.value = true
  getSearch({
    keyword: keywords.value
  })
    .then((res: any) => {
      searchResult.value = res.data
      visiblePanel.value = true
    })
    .finally(() => {
      searchLoading.value = false
    })
})

const getSuggestList = () => {
  getSearchSuggest().then((res: any) => {
    suggestList.value = res.data
  })
}

// 双击播放
const handlePlay = (song: ISong) => {
  eventBus.emit("playSong", song)
}

const toMv = (song: ISong) => {
  console.log(song, "歌曲")
  router.push({
    name: "VideoDetail",
    params: {
      id: song.video
    },
    query: {
      platform: song.platform
    }
  })
}

getSuggestList()
watch(
  keywords,
  () => {
    search()
  },
  {
    immediate: true
  }
)

watch(
  () => visiblePanel.value,
  (val) => {
    if (val) {
      getSuggestList()
    }
  }
)
</script>

<style lang="scss" scoped>
.search-panel {
  width: 300px;
  height: 400px;
  position: absolute;
  top: 120%;
  left: -50px;
  z-index: 30000;
  border-radius: 8px;
  :deep(.highlight) {
    color: #3fe19b;
  }
}
</style>
