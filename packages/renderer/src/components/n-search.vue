<template lang="">
  <div v-clickOutside="hidePanel">
    <div class="position fixed top-4 right-3 flex items-center text-white-300" >
      <input
        class="w-32 leading-6 text-white-300 bg-primary-200 rounded-xl outline-none text-sm px-2" 
        placeholder="请输入搜索内容"
        :value="keywords"
        @input="e=>keywords = e.target.value"
        @focus="visiblePanel = true"
      >
      <i class="iconfont icon-set text-sm ml-3 cursor-pointer" />
      <i class="iconfont icon-pifu text-sm ml-3 cursor-pointer" />
      <i class="iconfont icon-fuzhi text-sm ml-3 cursor-pointer" />
    </div>
    <search-panel v-show="visiblePanel" :keywords="keywords" class="absolute right-1 top-12 z-50" />
  </div>
</template>
<script lang="ts" setup>
  import {ref} from "vue";
  const keywords = ref('');
  const visiblePanel = ref(false);
  const hidePanel = () => {
    visiblePanel.value = false;
  };
</script>
