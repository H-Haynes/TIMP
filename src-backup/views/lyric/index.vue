<template lang="">
  <div class="bg-opacity-10 h-full desktop-lyric" @mouseenter="focus = true" @mouseleave="focus = false">
    <div class="toolbar h-8 relative flex justify-center">
      <div v-show="!isLock" class="text-gray-400">
        <i class="iconfont icon-yanse cursor-pointer hover:text-red-500 hover:font-bold" @click="showColorList = true"></i>
        <i class="iconfont icon-sousuofangda ml-2 cursor-pointer hover:text-red-500 hover:font-bold" @click="magnify"></i>
        <i class="iconfont icon-suoxiao ml-2 cursor-pointer hover:text-red-500 hover:font-bold" @click="lessen"></i>
        <i class="iconfont icon-suoding ml-2 cursor-pointer hover:text-red-500 hover:font-bold" @click="fixedWindow"></i>
        <i class="iconfont icon-fuzhi ml-2 cursor-pointer hover:text-red-500 hover-font-bold" @click="openFixLyric"></i>
      </div>
      <ul v-show="showColorList" class="flex justify-center items-center absolute" style="left: 50%; bottom: -10px; transform: translateX(-50%)">
        <li
          v-for="item in colorList"
          :key="item"
          class="mr-1"
          @click="
            () => {
              color = item
              showColorList = false
            }
          "
        >
          <span class="cursor-pointer inline-block w-2 h-2" :style="{ background: item }"></span>
        </li>
      </ul>
      <i v-show="isLock && focus" class="iconfont icon-suoding text-green-500 cursor-pointer" @click="unlockWindow"></i>
    </div>
    <p class="font-bold mt-2 px-4" :style="{ fontSize: fontSize + 'px', color: color }">{{ lyric }}</p>
  </div>
</template>
<script setup lang="ts">
const isLock = ref(false)
const lyric = ref("TIMP音乐，随心而行!")
const fontSize = ref(+(localStorage.getItem("fontSize") || 20))
const color = ref(localStorage.getItem("color") || "#f40")
const focus = ref(false)
const showColorList = ref(false)
const colorList = ["#f40", "#FF6633", "#FFFF33", "#66FF00", "#66FFFF", "#3366FF", "#6600FF"]
onMounted(() => {
  console.log("--------ipcRenderer开启监听--------")
  window.electron?.receive("lyric", (e, message) => {
    console.log("ipcRenderer收到消息", message)
    if (message) {
      lyric.value = message
    }
  })
})

const magnify = () => {
  if (fontSize.value < 40) {
    fontSize.value = fontSize.value + 2
  }
}

const lessen = () => {
  if (fontSize.value == 16) {
    return
  }
  fontSize.value = fontSize.value - 2
}

const fixedWindow = () => {
  window.electron.send("fixed")
  isLock.value = true
}

const unlockWindow = () => {
  window.electron.send("unlock")
  isLock.value = false
}

const openFixLyric = () => {
  window.electron.send("open-mini-lyric")
}

watch([() => color.value, () => fontSize.value], () => {
  // 存储用户设置
  localStorage.setItem("color", color.value)
  localStorage.setItem("fontSize", fontSize.value.toString())
})
</script>
<style lang="scss">
html,
body,
#app {
  background: rgba(0, 0, 0, 0);
  border: none;
}
.desktop-lyric {
  ul,
  li {
    list-style: none;
  }
}
</style>
