<script lang="ts" setup>
import layoutNav from '@/layouts/layout-nav.vue';
import AudioPlayer from '@/layouts/audio-player.vue';
import nSearch from '../components/n-search.vue';
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div
      class="flex flex-1"
      style="height:calc(100% - 16rem)"
    >
      <layout-nav />
      <div class="flex-1  bg-primary-100 overflow-hidden">
        <n-search />
        <router-view />
      </div>
    </div>
    <audio-player />
  </div>
</template>