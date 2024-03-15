<template>
  <div class="h-12">
    <!-- <el-switch v-model="isDark" @change="toggleDark"></el-switch> -->
    <!-- <el-button @click="() => router.push({ name: 'spectrum' })">频谱</el-button> -->
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core"

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
</script>

<style scoped></style>
