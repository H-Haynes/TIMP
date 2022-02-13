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
        <router-link
          v-for="nav in navList"
          :key="nav.path"
          v-slot="{isActive}"
          :to="{path:nav.path}"
        >
          <li
            class="hover:bg-gray-600 cursor-pointer px-4"
            :class="{'route-link-active':isActive}"
          >
            <i
              class="iconfont text-xs"
              :class="nav.icon"
            />
            {{ nav.name }}
          </li>
        </router-link>
      </ul>
      <span class="text-sm text-gray-600 px-5 mt-5 flex items-center">我的音乐</span>
      <ul
        v-for="item in mineList"
        :key="item.id"
        class="text-white-300 text-sm px-4 leading-8 text-left mt-2"
      >
        <router-link :to="{path:'/album',query:{type:item.type,id:item.id}}">
          <li class="hover:bg-gray-600 cursor-pointer px-4">
            <i class="iconfont icon-zhuanji text-xs" />
            {{ item.name }}
          </li>
        </router-link>
      </ul>

      <span class="text-sm text-gray-600 px-5 mt-5 w-full flex items-center">
        我的歌单 <i class="iconfont icon-plus txt-xs hover:text-orange-500 ml-8 text-gray-500 cursor-pointer" @click="createAlbum"></i>
      </span>
      <ul class="text-white-300 text-sm px-4 leading-8 text-left mt-2">
        <router-link v-for="item in myAlbum" :key="item.id" :to="{path:'/album',query:{id:item.id,type:item.type}}">
          <li class="hover:bg-gray-600 cursor-pointer px-4 truncate">
            <i class="iconfont icon-zhuanji text-xs" />
            {{item.name||item.title}}
            </li>
        </router-link>
      </ul>
      <span class="text-sm text-gray-600 px-5 mt-5 flex items-center">我的收藏</span>
      <ul class="text-white-300 text-sm px-4 leading-8 text-left mt-2">
        <router-link v-for="item in myCollect" :key="item.id" :to="{path:'/album',query:{id:item.id,type:item.type}}">
          <li class="hover:bg-gray-600 cursor-pointer px-4 truncate">
            <i class="iconfont icon-zhuanji text-xs" />
            {{item.name}}
          </li>
        </router-link>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import {ref,inject} from 'vue';
  import {useRouter} from 'vue-router';
  import {ElMessageBox} from 'element-plus';
  const mineList = ref([
    {
      name:'我喜欢',
      id:0,
      type:0,
    },
  ]);
  const router = useRouter();
  const $eventBus:any = inject('$eventBus');
  const navList = ref([
    {
      name:'发现音乐',
      path:'/find',
      icon:'icon-yinle',
    },
    // {
    //   name:'私人FM',
    //   path:'/radio',
    // },
    {
      name:'视频',
      path:'/video',
      icon:'icon-mv',
    },
  ]);
  const myAlbum = inject('myAlbum');

  const myCollect = inject('myCollect');

  const createAlbum = () => {

    ElMessageBox.prompt('','新建歌单',{
        center:true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonClass: 'custom-cancel-btn w-24',
        cancelButtonClass: 'custom-cancel-btn w-24',
        inputPattern:/^[\w\W]{1,12}$/,
        inputErrorMessage: '歌单名称不能为空且不能超过12个字符',
    }).then(({value})=>{
        const albumInfo = {
          title:value,
          name:value,
          id:Math.random().toString(36).substr(2),
          description:"我的自建歌单",
          subscribedCount:1,
          trackCount:1,
          coverImg:'',
          createTime:Date.now(),
          updateTime:"",
          avatar:"",
          custom:1,
          type:0,
          creator:{
            avatar:"",
            desc:"",
            nickname:"我"
          }
        };
        $eventBus.emit('createAlbum',albumInfo);
    });
  };


</script>
<style lang="less" scoped>
  .route-link-active,.route-link-exact-active {
    color: #fff ;
    background-color: rgb(115, 115, 119);
  }
</style>