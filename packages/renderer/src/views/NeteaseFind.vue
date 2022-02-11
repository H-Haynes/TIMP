<template lang="">
  <div
    class="flex-1 overflow-y-scroll relative"
    style="height:calc(100% - 4rem)"
    @scroll="scroll"
  >
    <div class="w-full h-full absolute left-0 top-0" v-show="loading" v-loading="loading" element-loading-background="rgba(0,0,0,.7)"></div>
    <div class="h-full">
      <el-carousel
        v-show="bannerList.length>0"
        :interval="4000"
        type="card"
        class="my-8 w-11/12 mx-auto"
      >
        <el-carousel-item
          v-for="item in bannerList"
          :key="item.id"
          class="h-full overflow-hidden relative"
        >
          <img
            :src="item.imageUrl"
            class="w-full object-cover h-36 rounded-lg"
            @click="bannerDetail(item.targetType,item.targetId)"
          >
          <span
            class="absolute right-0 p-1 text-xs rounded-md bottom-0"
            :style="{backgroundColor:item.titleColor}"
          >{{ item.typeTitle }}</span>
        </el-carousel-item>
      </el-carousel>

      <ul class="flex flex-wrap text-sm text-gray-300 mb-8 px-4">
        <li class="px-2 border mr-2 mb-2 border-gray-500">
          排行榜
        </li>
        <li
          v-for="category in categoryList.slice(0,10)"
          :key="category.category"
          class="px-2 border mr-2 mb-2 hover:bg-gray-500 cursor-pointer border-gray-500"
          @click="getAlbumList(category.name)"
        >
          {{ category.name }}
        </li>
        <li
          v-for="category in categoryList.slice(10,-1)"
          v-show="showAllCategory"
          :key="category.category"
          class="px-2 border mr-2 mb-2 hover:bg-gray-500 cursor-pointer border-gray-500"
          @click="getAlbumList(category.name)"
        >
          {{ category.name }}
        </li>
        <li
          class="px-2 border mr-2 mb-2 hover:bg-gray-500 cursor-pointer border-gray-500"
          @click="showAllCategory = !showAllCategory"
        >
          {{ showAllCategory ? '收起' : '更多···' }}
        </li>
      </ul>

      <ul
        v-if="playList.length"
        ref="listWrap"
        class="flex flex-wrap justify-around"
      >
        <li
          v-for="list in playList"
          :key="list.id || list.name"
          ref="listItem"
          class="w-40 mb-4 flex mx-1 flex-col justify-center items-center "
        >
          <router-link :to="{ path: '/album', query: { type: 1, id: list.id } }">
            <el-image
              lazy
              class="w-40 h-40"
              :src="list.picUrl"
            />
            <p
              class="mt-1 text-left text-xs h-10 overflow-hidden text-gray-200 font-medium"
            >
              {{ list.name }}
            </p>
          </router-link>
        </li>

        <li
          v-for="item in emptyNum"
          :key="item"
          class="w-40 mb-4 flex mx-1 flex-col justify-center items-center empty"
        ></li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {Ref} from 'vue';
import { ref, watchEffect, onMounted, inject } from 'vue';
import {useRouter} from 'vue-router';
import { getRecommendWy, getBannerWy,getCategoryListWy,getAlbumListWy } from '/@/api/netease';

const loading = ref(false);
const playList = ref([]);
const bannerList = ref([]);
const router= useRouter();
const $eventBus:any = inject('$eventBus');
const categoryList = ref([]); // 歌曲分类列表
const showAllCategory = ref(false);
const page = ref(1);
const listWrap:Ref<HTMLUListElement|null> = ref(null);
const listItem:Ref<HTMLLIElement|null> = ref(null);
const currentCategory = ref('');
const emptyNum = ref(0);
onMounted(async () => {
  
  const bannerResult = await getBannerWy();
  if (bannerResult.data.code === 200) {
    bannerList.value = bannerResult.data.banners;
  }

  const categoryResult = await getCategoryListWy();
  if (categoryResult.data.code === 200) {
    categoryList.value = categoryResult.data.sub;
  }
});
const bannerDetail = (type:number,id:number) =>{
  console.log(type,id);
  if(type === 1){
    // 播放音乐
    $eventBus.emit('playSong',{
      id,
      type:1,
    });
  }else{
    router.push({
      path: '/album',
      query: {
        type: 1,
        id,
      },
    });
  }
};

const getAlbumList = async (category:string,pageNum = 1) => {
  page.value = pageNum;
  currentCategory.value = category;
  loading.value = true;
  const albumListResult = await getAlbumListWy(category,pageNum);
  if(albumListResult.data.code === 200){
    const list = albumListResult.data.playlists.map(ele=>{
      return {
        id:ele.id,
        name:ele.name,
        picUrl:ele.coverImgUrl,
      };
    });
    playList.value = pageNum == 1 ? list : playList.value.concat(list); // 不是第一页则进行拼接
  }
  loading.value = false;
};

 const scroll = e => {
    const scrollDis = e.target.scrollHeight - e.target.offsetHeight; // 可滚动距离
    if(scrollDis - e.target.scrollTop  < 100 && loading.value === false){
      // console.log('滚动到底部');
      getAlbumList(currentCategory.value,page.value + 1);
    }
};

watchEffect(() => {
  loading.value = true;
  getRecommendWy().then((res) => {
    if (res.data.code === 200) {
      playList.value = res.data.result;
    }
    loading.value = false;
  });
});

watchEffect(()=>{
  // 计算空的li个数
   // 获取ul宽度，获取li宽度，然后计算一行的长度,根据list的个数，算出空的个数；
   // 获取跟节点字体大小
  const fontSize = parseInt(document.documentElement.style.fontSize) || 16;
  const wrapWidth = listWrap.value?.offsetWidth || 0;
  const itemWidth = fontSize * 10; // w-40 等于 10rem
  console.log(itemWidth,999,wrapWidth);
  // 一行多少个
  const singleLineNum = Math.floor(wrapWidth / (itemWidth + fontSize * 0.25* 2)) ; // mx-1 等于 0.25rem *2
  console.log(singleLineNum);
  emptyNum.value =  playList.value.length % singleLineNum;
});
</script>
<style lang="less">
.el-carousel__item {
  height: auto;
}
.el-carousel__container{
  height:160px;
}
// .el-carousel__indicators--outside{
//   position:absolute;
//   display: flex;
//   transform: translateX(-50%);
// }
</style>
