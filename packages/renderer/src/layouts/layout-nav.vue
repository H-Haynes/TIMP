<template lang="">
  <div class="w-48 h-full bg-primary-500">
    <div class="h-16 bg-primary-100  text-white flex items-center justify-end">
      <i
        class="iconfont icon-houtui mr-4 cursor-pointer text-xl"
        @click="router.back()"
      />
      <i class="iconfont icon-qianjin mr-4 cursor-pointer text-xl" />
    </div>
    <div class="py-4 text-left">
      <span class="text-sm text-gray-600 px-5">分类</span>
      <ul class="text-white-300 text-sm px-4 leading-8 text-left mt-2">
        <router-link v-for="nav in navList" :key="nav.path" :to="{path:nav.path}" v-slot="{isActive}">
          <li class="hover:bg-gray-600 cursor-pointer px-4" :class="{'route-link-active':isActive}">
            <i class="iconfont text-xs" :class="nav.icon" />
            {{ nav.name }}
          </li>
        </router-link>
      </ul>
      <span class="text-sm text-gray-600 px-5 mt-5">歌单</span>
      <ul class="text-white-300 text-sm px-4 leading-8 text-left mt-2">
        <router-link :to="{path:'/album',query:{type:item.type,id:item.id}}" v-for="item in mineList" :key="item.id">
          <li class="hover:bg-gray-600 cursor-pointer px-4"  >
            <i class="iconfont icon-zhuanji text-xs" />
            {{item.name}}
          </li>
        </router-link>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import {ref} from 'vue';
  import {useRouter} from 'vue-router';
  const mineList = ref([
    {
      name:"我喜欢",
      id:0,
      type:0
    }
  ]);
  const router = useRouter();
  const navList = ref([
    {
      name:'发现音乐',
      path:'/find',
      icon:"icon-yinle"
    },
    // {
    //   name:'私人FM',
    //   path:'/radio',
    // },
    {
      name:'视频',
      path:'/video',
      icon:"icon-mv"
    },
  ]);
</script>
<style lang="less" scoped>
  .route-link-active,.route-link-exact-active {
    color: #fff ;
    background-color: rgb(115, 115, 119);
  }
</style>