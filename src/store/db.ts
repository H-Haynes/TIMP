import { EPlatform } from '@/enum'
import eventBus from '@/utils/eventBus'
import indexedDB from '@/utils/indexedDB'
import { ISong } from '@/views/playlistDetail.vue'
export interface IAlbum { }

export default defineStore({
  id: "playlist",

  state: () => {
    return {
      dbOnline: false, // 数据库是否在线
      playlist: [
        {
          name: "",
          artists: [],
          duration: 0,
          id: "",
          platform: EPlatform.网易,
        }
      ] as ISong[], // 播放列表
      likeList: [], // 我喜欢 列表
      collectList: [], // 收藏 列表
      albumList: [] as any[], // 我的歌单列表
    }
  },

  actions: {
    // 获取播放列表
    async getPlayList() {
      indexedDB.get('playlist').then((res: any) => {
        this.playlist = res.sort((a, b) => {
          return b.timestamp - a.timestamp;
        })
      })
    },

    // 获取自建歌单
    async getMyAlbumList() {
      indexedDB.get('album').then((res: any) => {
        this.albumList = res;
      });
    },

    // 获取我喜欢
    async getLikeList() {
      return indexedDB.get('like').then((res: any) => {
        this.likeList = res;
      })
    },

    // 获取我收藏的歌单
    async getCollectList() {
      indexedDB.get('collect').then((res: any) => {
        this.collectList = res;
      });
    },

    // 添加到我喜欢
    async addLike(song: ISong) {
      return indexedDB.update("like", toRaw(song)).then(() => {
        return this.getLikeList()
      })
    },

    // 取消我喜欢
    async removeLike(id: string, platform: EPlatform) {
      return indexedDB.remove("like", id, platform).then(() => {
        return this.getLikeList()
      })
    },

    // 添加到收藏
    async addCollect(albumInfo: IAlbum) {
      return indexedDB.update("collect", toRaw(albumInfo)).then(() => {
        ElMessage.success("收藏成功")
        return this.getCollectList()
      })
    },

    // 取消收藏
    async removeCollect(id: string) {
      return indexedDB.remove("collect", id).then(() => {
        ElMessage.success("已取消收藏")
        return this.getCollectList()
      })
    },

    // 创建歌单
    async createAlbum(albumInfo: IAlbum) {
      return indexedDB.add("album", toRaw(albumInfo)).then(() => {
        ElMessage.success("歌单创建成功")
        return this.getMyAlbumList()
      })
    },

    /**
     * 添加歌曲到自建歌单
     * @param albumId 歌单id
     * @param song 歌曲信息
     */
    async addSongToAlbum(albumId: string, song: ISong) {
      // 检查是否重复
      const album = this.albumList.find((item) => item.id === albumId)
      if (album.songList.some((ele) => ele.id === song.id)) {
        ElMessage.warning("歌曲已存在")
        return Promise.reject()
      } else {
        // 未重复 , 添加歌曲，更新整项
        // TODO: 添加歌曲到自定义歌单改为添加数据到数据库，而不是更新整项
        album.songList.unshift(song)
        return indexedDB.update("album", toRaw(album)).then(() => {
          ElMessage.success("歌曲添加成功")
          return this.getMyAlbumList()
        })
      }
    },

    /**
     * 删除自定义歌单
     * @param albumId 自定义歌单id
     */
    async removeCustomAlbum(albumId: string) {
      return indexedDB.remove("album", albumId).then(() => {
        ElMessage.success("歌单删除成功")
        return this.getMyAlbumList()
      })
    },

    // todo: 缺少从自定义歌单删除歌曲功能

    /**
     * 从播放列表中移除歌曲
     * @param song 歌曲信息
     */
    async addPlaylist(song: ISong) {
      // 检查是否已存在播放列表中(存在则先移除再重新添加啊)
      if (this.playlist.some((ele) => ele.id === song.id)) {
        // 如果存在则从播放列表中删除
        await indexedDB.remove("playlist", song.id)
      }
      //添加到播放列表中(顺序问题)
      await indexedDB.update("playlist", toRaw(song))
      // 重新获取列表
      await this.getPlayList()
    },

    /**
     * 批量添加歌曲到播放列表
     * @param list 歌曲列表
     * @param isClear 是否清除原播放列表
     */
    async batchAddPlaylist(list: ISong[], isClear = true) {
      // 清空播放列表数据库
      isClear && await indexedDB.clear("playlist")

      //播放第一首
      isClear && eventBus.emit("playSong", list[0])

      // 将所有数据添加到播放列表,反向添加顺序
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].timestamp = Date.now() - i
        eventBus.emit("addPlayList", toRaw(list[i]))
      }
    },

    // 从数据库初始化数据
    async initDB() {
      return indexedDB.openDB("TIMP", 3).then(() => {
        this.dbOnline = true
        console.log("*****数据库已连接*****")
      })
        .then(async () => {
          // 从数据库获取数据
          return Promise.all([
            this.getLikeList(),
            this.getCollectList(),
            this.getMyAlbumList(),
            this.getPlayList()
          ])
        })
    },


  }
})
