<script setup lang="ts">
import { ElNotification } from "element-plus"
import LogoViewLink from "./components/LogoViewLink.vue"
import UpdateDialog from "./components/UpdateDialog.vue"
import { cloneDeep } from "lodash-es"

const { isDark } = useTheme()
const { updateLyric, lyric, updatePlayInfo, playInfo } = useStore("playSetting")

const { tasks, removeTask } = useStore("download")

const downloading = ref(false)

// 主进程请求发送一次歌词列表、播放信息
window.electron.receive("need-send-lyric", () => {
  updateLyric(cloneDeep(lyric.value))
  updatePlayInfo(cloneDeep(playInfo.value))
})

watchEffect(() => {
  if (tasks.value.length > 0 && !downloading.value) {
    downloading.value = true
    window.electron.send("download-file", cloneDeep(tasks.value[0]))
  }
})

window.electron.receive("download-completed", (event, fileName) => {
  ElNotification({
    title: "下载完成",
    message: h("i", { style: "color: teal" }, fileName)
  })
  removeTask()

  downloading.value = false
})

window.electron.receive("download-fail", (event, fileName) => {
  ElNotification({
    title: "下载失败",
    message: h("i", { style: "color: red" }, fileName)
  })
  removeTask()

  downloading.value = false
})
</script>

<template>
  <div id="app" class="mx-auto dark:bg-gray-900 dark:text-gray-200 min-h-screen" :class="{ 'is-dark': isDark }">
    <router-view />
    <UpdateDialog />
  </div>
</template>
