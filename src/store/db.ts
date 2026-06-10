import { EPlatform } from "@/types/enums"
import eventBus from "@/utils/eventBus"
import indexedDB from "@/utils/indexedDB"
import type { ISong, IAlbum } from "@/types/song"

export default defineStore("playlist", {
  state: () => {
    return {
      dbOnline: false,
      playlist: [
        {
          name: "",
          artists: [],
          duration: 0,
          id: "",
          platform: EPlatform.Netease
        }
      ] as ISong[],
      likeList: [] as ISong[],
      collectList: [] as IAlbum[],
      albumList: [] as IAlbum[]
    }
  },

  actions: {
    async getPlayList() {
      indexedDB.get("playlist").then((res: any) => {
        this.playlist = res.sort((a, b) => {
          return b.timestamp - a.timestamp
        })
      })
    },

    async getMyAlbumList() {
      indexedDB.get("album").then((res: any) => {
        this.albumList = res
      })
    },

    async getLikeList() {
      return indexedDB.get("like").then((res: any) => {
        this.likeList = res
      })
    },

    async getCollectList() {
      indexedDB.get("collect").then((res: any) => {
        this.collectList = res
      })
    },

    async addLike(song: ISong) {
      return indexedDB.update("like", toRaw(song)).then(() => {
        return this.getLikeList()
      })
    },

    async removeLike(id: string, platform: EPlatform) {
      return indexedDB.remove("like", id, platform).then(() => {
        return this.getLikeList()
      })
    },

    async addCollect(albumInfo: IAlbum) {
      return indexedDB.update("collect", toRaw(albumInfo)).then(() => {
        ElMessage.success("收藏成功")
        return this.getCollectList()
      })
    },

    async removeCollect(id: string) {
      return indexedDB.remove("collect", id).then(() => {
        ElMessage.success("已取消收藏")
        return this.getCollectList()
      })
    },

    async createAlbum(albumInfo: IAlbum) {
      return indexedDB.add("album", toRaw(albumInfo)).then(() => {
        ElMessage.success("歌单创建成功")
        return this.getMyAlbumList()
      })
    },

    async addSongToAlbum(albumId: string, song: ISong) {
      const album = this.albumList.find(item => item.id === albumId)
      if (album.songList.some(ele => ele.id === song.id)) {
        ElMessage.warning("歌曲已存在")
        return Promise.reject()
      }
      album.songList.unshift(song)
      return indexedDB.update("album", toRaw(album)).then(() => {
        ElMessage.success("歌曲添加成功")
        return this.getMyAlbumList()
      })
    },

    async removeCustomAlbum(albumId: string) {
      return indexedDB.remove("album", albumId).then(() => {
        ElMessage.success("歌单删除成功")
        return this.getMyAlbumList()
      })
    },

    async addPlaylist(song: ISong) {
      if (this.playlist.some(ele => ele.id === song.id)) {
        await indexedDB.remove("playlist", song.id)
      }
      await indexedDB.update("playlist", toRaw(song))
      await this.getPlayList()
    },

    async batchAddPlaylist(list: ISong[], isClear = true) {
      isClear && (await indexedDB.clear("playlist"))

      isClear && eventBus.emit("playSong", list[0])

      for (let i = list.length - 1; i >= 0; i--) {
        list[i].timestamp = Date.now() - i
        await this.addPlaylist(toRaw(list[i]))
      }
    },

    async initDB() {
      return indexedDB
        .openDB("TIMP", 3)
        .then(() => {
          this.dbOnline = true
        })
        .then(async () => {
          return Promise.all([this.getLikeList(), this.getCollectList(), this.getMyAlbumList(), this.getPlayList()])
        })
    }
  }
})
