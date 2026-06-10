<template>
  <div class="TVPlayer" ref="TVPlayerContainerRef">
    <div v-if="!src" class="fake-player" :style="{ height: height + 'px' }">
      <p class="my-6 slogan">
        <span>T</span>
        <span>I</span>
        <span>M</span>
        <span>P</span>
        <span>，</span>
        <span>随</span>
        <span>心</span>
        <span>而</span>
        <span>行</span>
      </p>
      <p class="rainbow-text">正在加载中，请稍后...</p>
    </div>
    <video :style="{ height: height + 'px' }" v-else :key="src" :poster class="h-full" :src controls></video>
  </div>
</template>

<script setup lang="ts">
interface TVPlayerProps {
  src: string
  poster?: string
}

const props = withDefaults(defineProps<TVPlayerProps>(), {
  src: "",
  poster: ""
})

const TVPlayerContainerRef = ref()
const height = ref(0)

onMounted(() => {
  window.addEventListener("resize", () => {
    height.value = (TVPlayerContainerRef.value?.offsetWidth * 9) / 16
  })
  nextTick(() => {
    height.value = (TVPlayerContainerRef.value?.offsetWidth * 9) / 16
  })
})
</script>

<style lang="scss" scoped>
.TVPlayer {
  width: 100%;
  height: 100%;
  .fake-player {
    width: 100%;
    background: #000000;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

.rainbow-text {
  font-size: 18px;
  font-weight: bold;
  background: -webkit-linear-gradient(135deg, #0eaf6d, #ff6ac6 25%, #147b96 50%, #e6d205 55%, #2cc4e0 60%, #8b2ce0 80%, #ff6384 95%, #08dfb4);
  /* 文字颜色填充设置为透明 */
  -webkit-text-fill-color: transparent;
  /* 背景裁剪，即让文字使用背景色 */
  -webkit-background-clip: text;
  /* 背景图放大一下，看着柔和一些 */
  -webkit-background-size: 200% 100%;
  /* 应用动画flowCss 12秒速度 无限循环 线性匀速动画*/
  -webkit-animation: rainbow 4s infinite linear;
}

@keyframes rainbow {
  0% {
    /* 移动背景位置 */
    background-position: 0 0;
  }

  100% {
    background-position: -400% 0;
  }
}
@keyframes start {
  to {
    text-shadow:
      0 0 2px #fff,
      0 0 3px #fff,
      0 0 8px #fff,
      0 0 12px #126fcc,
      0 0 20px #126fcc,
      0 0 24px #126fcc;
    color: #fff;
  }
}

.slogan {
  letter-spacing: 6px;
  span {
    animation-delay: 0s;
    color: #444;
    text-shadow: 0 0 0 #444;
    animation: start 1.2s ease-in-out infinite alternate;
    font-size: 32px;
    font-style: italic;
    font-weight: bold;
  }
}

@for $i from 1 through 9 {
  .slogan span:nth-child(#{$i}) {
    animation-delay: #{$i * 0.2}s;
  }
}
</style>
