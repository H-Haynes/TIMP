<template>
  <div class="TVPlayer">
    <video :key="src" :poster class="w-full h-full" :src controls></video>
  </div>
</template>

<script setup lang="ts">
interface TVPlayerProps {
  src: string
  poster?: string
}

const props = withDefaults(defineProps<TVPlayerProps>(), {
  src: "https://prod-streaming-video-msn-com.akamaized.net/a8c412fa-f696-4ff2-9c76-e8ed9cdffe0f/604a87fc-e7bc-463e-8d56-cde7e661d690.mp4",
  poster: ""
})
</script>

<style lang="scss" scoped>
.TVPlayer {
  width: 100%;
  height: 100%;
}
</style>
