<template lang="">
  <div
    v-loading="loading"
    class="flex-1 overflow-y-scroll"
    style="height:calc(100% - 4rem)"
    element-loading-background="rgba(0,0,0,.7)"
    @scroll="scroll"
  >
    <div class="h-full">
      <!-- <el-carousel
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
        </el-carousel-item>
      </el-carousel> -->

      <ul class="flex flex-wrap text-sm text-gray-300 mb-8 px-4">
        <li
          class="px-2 border mr-2 mb-2 border-red-800 text-red-800 cursor-pointer"
          @click="getRankAlbum"
        >
          排行榜
        </li>
        <li
          v-for="category in categoryList.slice(0,10)"
          :key="category.category"
          class="px-2 border mr-2 mb-2 hover:bg-gray-700 cursor-pointer border-gray-700"
          :class="{'bg-gray-700':currentCategory===category.id}"
          @click="getAlbumList(category.id)"
        >
          {{ category.name }}
        </li>
        <li
          v-for="category in categoryList.slice(10,-1)"
          v-show="showAllCategory"
          :key="category.category"
          class="px-2 border mr-2 mb-2 hover:bg-gray-700 cursor-pointer border-gray-700"
          @click="getAlbumList(category.id)"
        >
          {{ category.name }}
        </li>
        <li
          class="px-2 border mr-2 mb-2 hover:bg-gray-700 cursor-pointer border-gray-700"
          @click="showAllCategory = !showAllCategory"
        >
          {{ showAllCategory ? '收起' : '更多···' }}
        </li>
      </ul>

      <ul
        ref="listWrap"
        class="flex flex-wrap justify-around"
      >
        <li
          v-for="list in playList"
          :key="list.id||list.name"
          class="w-40 mb-4 flex mx-1 flex-col justify-center items-center"
        >
          <router-link :to="{path:'/album',query:{type:3,id:list.id,isRank:list.isRank}}">
            <el-image
              lazy
              class="w-40 h-40"
              :src="list.picUrl"
            />
            <p class="mt-1 text-left text-xs h-10 overflow-hidden text-gray-200 font-medium">
              {{ list.name }}
            </p>
          </router-link>
        </li>
        <li
          v-for="item in emptyNum"
          :key="item"
          class="w-40 mb-4 flex flex-col justify-center items-center"
        ></li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
    import type{Ref} from 'vue';
    import {useRouter} from 'vue-router';
    import {ref, watchEffect,onMounted,inject} from 'vue';
    import {getBannerKW} from '/@/api/kuwo';
    import {getAlbumListKG, getRankListKG,getCategoryListKG, getRecommendKG} from '/@/api/kugou';
    const loading=ref(false);
    const playList = ref([]);
    const emptyNum = ref(0);
    const listWrap:Ref<HTMLUListElement|null> = ref(null);
    const categoryList = ref([]);
    const currentCategory = ref(0);
    const showAllCategory = ref(false);
    const router = useRouter();
    const $eventBus:any = inject('$eventBus');
    const page = ref(1);
    // const bannerList = ref([]);
    watchEffect(()=>{
        loading.value = true;
        if(!currentCategory.value){
            getRecommendKG(page.value).then((res: any)=>{
                const list = res.data.plist.list.info.map(ele=>({
                    name:ele.specialname,
                    picUrl:ele.imgurl.replace('{size}','400'),
                    id:ele.specialid,
                }));
                playList.value = page.value == 1 ? list : playList.value.concat(list);
                loading.value = false;
            });
        }
    });
    watchEffect(()=>{
      // 计算空的li个数
      // 获取ul宽度，获取li宽度，然后计算一行的长度,根据list的个数，算出空的个数；
      // 获取跟节点字体大小
      const fontSize = parseInt(document.documentElement.style.fontSize) || 16;
      const wrapWidth = listWrap.value?.offsetWidth || 0;
      const itemWidth = fontSize * 10; // w-40 等于 10rem
      // 一行多少个
      const singleLineNum = Math.floor(wrapWidth / (itemWidth + fontSize * 0.25* 2)) ; // mx-1 等于 0.25rem *2
      console.log(singleLineNum);
      emptyNum.value =  playList.value.length % singleLineNum || 0;
    });

    onMounted( async()=>{
    //   const bannerResult = await getBannerKW();
    //   if(bannerResult.data.code === 200) {
    //     bannerList.value = bannerResult.data.data.map(ele=>{
    //       let splitUrl = ele.url.split('/');
    //       return {
    //         imageUrl:ele.pic,
    //         id:ele.id,
    //         targetType:ele.url.includes('playlist') ? 2 : ele.url.includes('album') ? 3 : 0,
    //         targetId:splitUrl[splitUrl.length-1],
    //       };
    //     });
    //   }

      const result = await getCategoryListKG();
      if(result.data.code === 200){
        categoryList.value = result.data.result;
      }
    });


    const scroll = e => {
        const scrollDis = e.target.scrollHeight - e.target.offsetHeight; // 可滚动距离
        if(scrollDis - e.target.scrollTop  < 100 && loading.value === false){
            page.value = page.value + 1;
            if(currentCategory.value !==0){
                getAlbumList(currentCategory.value,page.value);
            }
        }
    };

    const getAlbumList = async (category:number,pageNum=1) => {
        page.value = pageNum;
        loading.value = true;
        currentCategory.value = category;
        const result = await getAlbumListKG(category,page.value);
        if(result.data.errcode === 0 && result.data.data?.info){
            const list = result.data.data.info.map(ele=>({
                name:ele.specialname,
                picUrl:ele.imgurl.replace('{size}','400'),
                id:ele.specialid,
            }));
          playList.value = page.value ===1 ? list :  playList.value.concat(list);
        }
        loading.value = false;
        
    };

    const getRankAlbum = async () =>{
        loading.value = true;
        currentCategory.value = 0;
        const result = await getRankListKG();
        const list = result.data.rank.list.map((ele)=>{
            return {
            id:ele.rankid,
            name:ele.rankname,
            picUrl:ele.imgurl.replace('{size}','400'),
            isRank:1,
            };
        });
        playList.value = list;
        loading.value = false;
    };
</script>
