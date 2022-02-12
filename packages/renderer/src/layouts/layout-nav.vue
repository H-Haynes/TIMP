<template lang="">
  <div class="w-48 h-full bg-primary-500">
    <div class="h-16 bg-primary-100  text-white flex items-center justify-end">
      <i
        class="iconfont icon-houtui mr-4 cursor-pointer text-xl"
        @click="router.back()"
      />
      <i class="iconfont icon-qianjin mr-4 cursor-pointer text-xl" />
    </div>
    <div class="py-4">
      <ul class="text-white-300 text-sm px-4 leading-8 text-left">
        <router-link v-for="nav in navList" :key="nav.path" :to="{path:nav.path}" v-slot="{isActive}">
          <li class="hover:bg-gray-600 cursor-pointer px-4" :class="{'route-link-active':isActive}">
            {{ nav.name }}
          </li>
        </router-link>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import {ref} from 'vue';
  import {useRouter} from 'vue-router';
  const router = useRouter();
  const navList = ref([
    {
      name:'发现音乐',
      path:'/find',
    },
    {
      name:'私人FM',
      path:'/radio',
    },
    {
      name:'视频',
      path:'/video',
    },
  ]);
</script>
<style lang="less" scoped>
  .route-link-active,.route-link-exact-active {
    color: #fff ;
    background-color: rgb(115, 115, 119);
  }
</style>