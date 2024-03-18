<template>
  <div
    style="z-index: 3400"
    :style="{ top: show ? '0' : '100%' }"
    class="flex justify-around transition-all duration-500 absolute py-16 h-full w-full left-0 bg-white dark:bg-gray-800 box-border"
  >
    <div class="flex flex-col relative w-400px h-400px">
      <div class="w-full h-full absolute left-0 top-0 flex justify-center items-center rotate">
        <el-avatar :size="340" shape="circle" :src="playInfo.pic || playInfo.album?.pic || poster"></el-avatar>
      </div>
      <!-- 频谱数据 -->
      <canvas id="audioCanvas" width="300" height="300"></canvas>
    </div>

    <div class="w-96 mb-10 flex flex-col" style="min-height: 300px">
      <strong class="text-2xl dark:text-white">{{ playInfo.name }}</strong>
      <span class="dark:text-white leading-8">{{ playInfo.artists?.map((ele) => ele.name).join("/") }}</span>
      <ul ref="lyricWrapRef" class="overflow-y-scroll flex-1 lyric-wrap">
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
import poster from "@/assets/poster.jpg"
import useSpectrum from "./useSpectrum"
import eventBus from "@/utils/eventBus"

interface LyricProps {
  show: boolean
  playInfo: any
  lyric: any[]
  currentTime: number
}

const props = withDefaults(defineProps<LyricProps>(), {})

const lyricWrapRef = ref() // 歌词容器
const lyricWrapHeight = ref(0) // 歌词容器高度
const timer = ref(0) // 定时器

watch(
  () => props.show,
  () => {
    nextTick(() => {
      lyricWrapHeight.value = lyricWrapRef.value?.offsetHeight ?? 0
    })
  },
  {
    immediate: true
  }
)

// 计算高亮行
const highlightLine = computed(() => {
  let index = props.lyric.findIndex((ele: any, index) => {
    return props.currentTime > ele.time && (props.lyric[index + 1] ? props.currentTime < props.lyric[index + 1].time : true)
  })
  return index
})

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

  if (props.show && highlightLine.value && lyricWrapRef.value) {
    let highlightDOM = document.getElementsByClassName("lyric-highlight")[0]
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

watch(
  () => highlightLine.value,
  () => {
    // 将当前行歌词，发送到主进程
    window.electron?.send("lyric", props.lyric?.[highlightLine.value]?.words)
  }
)

const { initCanvas, handlePlay, canvas } = useSpectrum()

eventBus.on("audioPlay", (audio: HTMLAudioElement) => {
  handlePlay(audio)
})

onMounted(() => {
  initCanvas()
  window.onresize = () => {
    lyricWrapHeight.value = lyricWrapRef.value?.offsetHeight ?? 0
  }
})
</script>

<style scoped>
.lyric-highlight {
  font-size: 18px;
  font-weight: bold;
  background-image: -webkit-linear-gradient(right, #f40, orange, yellow, green, skyblue, cyan, purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.rotate {
  animation: rotate 60s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>
