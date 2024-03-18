<template>
  <div class="h-12">
    <div class="position fixed top-4 right-3 flex items-center text-white-300">
      <input
        class="w-32 leading-6 text-white-300 bg-primary-200 rounded-xl outline-none text-sm px-2 dark:border-none border-1 border-gray-700"
        placeholder="请输入搜索内容"
        :value="keywords"
        @input="(e) => (keywords = e.target.value)"
        @focus="visiblePanel = true"
      />
      <i class="iconfont icon-set text-sm ml-3 cursor-pointer" />
      <i class="iconfont icon-pifu text-sm ml-3 cursor-pointer" />
      <i class="iconfont icon-shensemoshi ml-3 cursor-pointer" @click="toggleDark()"></i>
      <i class="iconfont icon-fuzhi text-sm ml-3 cursor-pointer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core"

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
const { t, availableLocales, locale } = useI18n()

const keywords = ref("")
const visiblePanel = ref(false)
const hidePanel = () => {
  visiblePanel.value = false
}
</script>

<style scoped></style>
