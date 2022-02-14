<template lang="">
  <div
    class="search-panel w-80 flex flex-col right-0  bg-primary-500"
    style="min-height:400px;max-height:70%"
  >
    <div class="flex-1 flex flex-col overflow-y-scroll hideScrollBar">
      <ol class="flex bg-gray-800 text-gray-500 h-7  flex-shrink-0 text-sm">
          <li :class="{'bg-primary-500 text-orange-500':platform === 1}" @click="platform=1" class="flex-1 border-r py-1 cursor-pointer  border-gray-800">网易</li>
          <li :class="{'bg-primary-500 text-orange-500':platform === 2}" @click="platform=2" class="flex-1 border-r py-1  cursor-pointer  border-gray-800">QQ</li>
          <li :class="{'bg-primary-500 text-orange-500':platform === 3}" @click="platform=3" class="flex-1 border-r py-1 cursor-pointer  border-gray-800">酷狗</li>
          <li :class="{'bg-primary-500 text-orange-500':platform === 4}" @click="platform=4" class="flex-1 border-r py-1 cursor-pointer  border-gray-800">酷我</li>
          <li :class="{'bg-primary-500 text-orange-500':platform === 5}" @click="platform=5" class="flex-1 border-r py-1 cursor-pointer  border-gray-800">咪咕</li>
      </ol>
      <ul class="my-4 flex-1 flex-grow-0 overflow-y-scroll">
        <li
          v-for="item in relativeList"
          :key="item.id"
          @click="playSong(item.id,item.type)"
          class="text-gray-500 text-sm text-left hover:bg-primary-100 hover:text-gray-300 py-1 px-5 truncate cursor-pointer"
        >
          {{ item.name }} 
          <i @click.stop="toMv(item.mvid)" class="iconfont icon-mv text-red-500" v-if="item.mvid" /> - {{ item.art.map(e=>e.name).join('/') }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
    import type {Ref} from 'vue';
    import { defineProps,ref ,watch,inject} from 'vue';
    import { searchWy } from '../api/netease';
    import { searchQQ } from '../api/qq';
    import {useRouter} from "vue-router";
import { searchKG } from '../api/kugou';
import { searchKW } from '../api/kuwo';
    const router = useRouter();
    const props = defineProps({
        keywords: {
            type: String,
            default: '',
        },
    });
    const timer:Ref<number|undefined> = ref(undefined);
    const relativeList = ref([]);
    const platform = ref(1);
    const $eventBus:any = inject('$eventBus');

    const getRelativeListWy = async (keywords:string) => {
        const res = await searchWy(keywords);
        let list = [];
        if(res.data.code === 200){
            list = res.data?.result?.songs?.map(ele=>({
                id: ele.id,
                type:1,
                name: ele.name,
                mvid:ele.mvid,
                art:ele.artists.map(e=>({
                    name:e.name,
                    id:e.id, 
                })),
            }));
        }
        return list;
    };

    const getRelativeListQQ = async(keywords:string) => {
        const res = await searchQQ(keywords);
        let list = [];
        if(res.data.response.code === 0){
            list = res.data.response.data.song.itemlist.map(ele=>({
                id: ele.mid,
                type:2,
                name: ele.name,
                mvid:ele.mv,
                art:[{
                    name:ele.singer,
                    id:ele.singerid,
                }]
            }));
        }
        return list;
    };

    const getRelativeListKG = async(keywords:string) => {
        const res = await searchKG(keywords);
        let list = [];
        if(res.data.errcode === 0){
            list = res.data.data.info.map(ele=>({
                id:ele.hash,
                type:3,
                name:ele.filename.split('-')[1].trim(),
                mvid:ele.mvhash,
                art:[{
                    name:ele.singername,
                    id:Math.random().toString(36).substr(2), //随机
                }]
            }));
        }
        return list;
    };

    const getRelativeListKW = async (keywords:string) => {
        const res = await searchKW(keywords);
        let list = [];
        if(res.data.code === 200){
            list = res.data.data.list.map(ele=>({
                id:ele.musicrid,
                type:4,
                name:ele.name,
                mv:ele.mvpayinfo.vid,
                art:[{
                    name:ele.artist,
                    id:ele.artistid
                }],
            }));
        }
        return list;
    };

    const playSong = (id:string,type:number) => {
        $eventBus.emit('playSong',{
            id,
            type,
        });
    };

    const toMv = (mvid:string) => {
        router.push({
            path:'/video/player',
            query:{
                id:mvid,
                type:platform.value
            }
        });
    };

    watch(()=>[props.keywords,platform.value], async ()=>{
        clearTimeout(timer.value);
        if(!props.keywords.trim()){
            relativeList.value = [];
            return;
        }
        timer.value = setTimeout(async()=>{
            if(platform.value ===1){
                relativeList.value = await getRelativeListWy(props.keywords);
            }else if(platform.value ===2){
                relativeList.value = await getRelativeListQQ(props.keywords);
            }else if(platform.value ===3){
                relativeList.value =  await getRelativeListKG(props.keywords);
            }else if(platform.value ===4){
                relativeList.value =  await getRelativeListKW(props.keywords);
            }
            
        },1000);
    });
</script>



