<template>
  <div class="w-64 h-full bg-primary-500 overflow-hidden flex flex-col dark:bg-gray-900">
    <div class="h-16 bg-primary-100 dark:text-white flex items-center justify-between pl-8">
      <el-avatar :src="posterJpg"></el-avatar>
      <div>
        <i class="icon-houtui mr-4 cursor-pointer text-xl" @click="router.back()" />
        <i class="icon-qianjin mr-4 cursor-pointer text-xl" />
      </div>
    </div>
    <div class="py-4 text-left overflow-y-scroll scrollbar-none dark:text-white text-sm">
      <div v-for="(menu, menuIndex) in menus" :key="menuIndex" class="px-8">
        <div class="leading-12 text-gray-400 font-bold flex items-center">
          <span>{{ menu.name }}</span>
          <i v-if="menu.creatable" @click="createAlbum" class="icon-plus ml-8 cursor-pointer"></i>
        </div>
        <div @click="handleNav(nav)" v-for="nav in menu.children" :key="nav.name" class="px-4 leading-8 hover:bg-blue-500 cursor-pointer rounded-md">
          {{ nav.name }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import eventBus from "@/utils/eventBus"
import posterJpg from "@/assets/poster.jpg"
import { dayjs } from "element-plus"
import { EPlatform } from "@/enum"
import { IPlaylistDetail } from "@/views/playlistDetail.vue"

const router = useRouter()
const { albumList, collectList, likeList } = useStore("db")
const createAlbum = () => {
  ElMessageBox.prompt("", "新建歌单", {
    center: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    confirmButtonClass: "custom-cancel-btn w-24",
    cancelButtonClass: "custom-cancel-btn w-24",
    inputPattern: /^[\w\W]{1,12}$/,
    inputErrorMessage: "歌单名称不能为空且不能超过12个字符"
  }).then(({ value }: any) => {
    const id = Math.random().toString(36).substr(2)
    const albumInfo: IPlaylistDetail = {
      name: value,
      relationId: id,
      id,
      description: "我的自建歌单",
      pic: posterJpg,
      createTime: dayjs().format("YYYY-MM-DD"),
      updateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      platform: EPlatform.自建,
      creator: {
        avatar: posterJpg, // 头像
        nickname: "我", // 昵称
        signature: "" // 签名
      },
      songList: []
    }
    eventBus.emit("createAlbum", albumInfo)
  })
}

// 分类菜单
const categoryMenus = ref([
  { name: "排行榜", path: "rank" },
  { name: "歌单", path: "songList" },
  { name: "视频", path: "video" }
])

const menus = computed(() => {
  return [
    { name: "分类", children: categoryMenus.value },
    { name: "我的音乐", children: mineMenus.value },
    { name: "我的歌单", creatable: true, children: albumList.value },
    { name: "我的收藏", children: collectList.value }
  ]
})

// 我的音乐
const mineMenus = ref([{ name: "我喜欢", id: 0, platform: EPlatform.自建 }])

const handleNav = (nav) => {
  if (nav.path) {
    // 是页面
    router.push({ path: `/${nav.path}` })
  } else {
    // 是歌单
    router.push({
      name: "PlaylistDetail",
      params: {
        id: nav.id
      },
      query: {
        platform: nav.platform
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.route-link-active,
.route-link-exact-active {
  color: #fff;
  background-color: rgb(115, 115, 119);
}
</style>
