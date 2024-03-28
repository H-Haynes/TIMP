<template>
  <div class="w-350px box-border h-700px bg-white bg-opacity-20 leading-40px text-center p-6">
    <div class="w-full mb-10 flex flex-col h-full relative pt-3 mini-lyric-container">
      <div class="flex justify-center absolute w-full left-0 -top-6 mini-lyric-control-wrap">
        <i class="icon-guanbi cursor-pointer hover:text-red-500" @click="handleClose"></i>
        <i class="icon-fuzhi ml-4 cursor-pointer hover:text-red-500" @click="handleBackWindow"></i>
      </div>
      <strong class="text-2xl dark:text-white">{{ playInfo.name }}</strong>
      <span class="dark:text-white leading-8">{{ playInfo.artists?.map((ele) => ele.name).join("/") }}</span>
      <ul ref="lyricWrapRef" class="overflow-y-scroll flex-1 fix-lyric-wrap">
        <li
          v-for="(item, index) in lyric"
          :key="index"
          :class="{ 'lyric-highlight': highlightLine === index }"
          class="leading-8 dark:text-gray-500 text-gray-700"
          v-html="item.words"
        ></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const lyric = ref<any[]>([])
const currentTime = ref(0)
const playInfo: any = ref({})

// 计算高亮行
const highlightLine = computed(() => {
  let index = lyric.value.findIndex((ele: any, index) => {
    return currentTime.value > ele.time && (lyric.value[index + 1] ? currentTime.value < lyric.value[index + 1].time : true)
  })
  return index
})

const timer = ref<any>(null)
const lyricWrapRef = ref()
const lyricWrapHeight = ref()
// 滚动动画
const scrollAnimation = (target) => {
  let times = 20
  timer.value = requestAnimationFrame(function fn() {
    let speed = (target - lyricWrapRef.value.scrollTop) / times // 约320毫秒执行完
    if (lyricWrapRef.value) {
      // if(Math.abs(target - lyricWrapRef.value.scrollTop) > speed){
      if (times > 1) {
        lyricWrapRef.value.scrollTop += speed
        times--
        timer.value = requestAnimationFrame(fn)
      } else {
        lyricWrapRef.value.scrollTop = target
        cancelAnimationFrame(timer.value)
      }
    } else {
      cancelAnimationFrame(timer.value)
    }
  })
}

watch([() => highlightLine.value, () => lyricWrapHeight.value], () => {
  // 获取当前highlight，设置滚动条位置到highlight
  // 如果当前highlight位置小于ul一半位置，则滚动到0，否则滚动到highlight - ul/2 的位置

  if (highlightLine.value && lyricWrapRef.value) {
    let highlightDOM = document.getElementsByClassName("lyric-highlight")[0] as HTMLLIElement
    if (highlightDOM && lyricWrapHeight.value) {
      cancelAnimationFrame(timer.value)
      let target
      if (highlightDOM!.offsetTop < lyricWrapHeight.value / 2) {
        // lyricWrapRef.value?.scrollTo(0,0);
        target = 0
      } else {
        target = highlightDOM.offsetTop - lyricWrapHeight.value / 2
        // lyricWrapRef.value?.scrollTo(0,highlightDOM.offsetTop - lyricWrapHeight.value/2);
      }
      scrollAnimation(target)
    }
  }
})

onMounted(() => {
  nextTick(() => {
    lyricWrapHeight.value = lyricWrapRef.value?.offsetHeight ?? 0
    console.log(playInfo.value)
  })
  window.onresize = () => {
    lyricWrapHeight.value = lyricWrapRef.value?.offsetHeight ?? 0
  }
})

const handleClose = () => {
  window.electron.send("close-mini-lyric")
}

const handleBackWindow = () => {
  // 回退到桌面歌词界面
  window.electron.send("mini-lyric-back")
}

window.electron.receive("update-currentTime", (event, val) => {
  currentTime.value = val
})

window.electron.receive("update-lyric", (event, val) => {
  lyric.value = JSON.parse(val)
})

window.electron.receive("update-playInfo", (event, val) => {
  playInfo.value = JSON.parse(val)
})
</script>

<style lang="scss">
.lyric-highlight {
  font-size: 18px;
  font-weight: bold;
  background-image: -webkit-linear-gradient(right, #f40, orange, yellow, green, skyblue, cyan, purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.fix-lyric-wrap::-webkit-scrollbar {
  display: none;
}

.mini-lyric-container {
  .mini-lyric-control-wrap {
    display: none;
  }
  &:hover {
    .mini-lyric-control-wrap {
      display: block;
    }
  }
}
</style>
