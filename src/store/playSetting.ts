import { EPlatform } from "@/enum"
import { ISong } from "@/views/playlistDetail.vue"

export default defineStore({
  id: "playSetting",
  persist: {
    enabled: true
  },
  state: () => {
    return {
      mode: 0, // 播放模式 0循环播放 1随机播放 2 单曲循环
      currentTime: 0, // 当前播放时间
      curSongId: "", // 当前播放音频id
      volume: 1, // 音量
      playInfo: {
        name: "",
        artists: [],
        duration: 0,
        pic: "",
        albumId: "",
        id: "",
        platform: EPlatform.QQ
      } as ISong, // 当前播放音频信息
      lyric: [],
      url: "",
      setting: {
        skin: 0,
        loop: 0,
        downloadLyric: 0, //下载歌词
        downloadNotice: 0, // 下载通知
        deskLyric: 0, // 桌面歌词
        trayLyric: 0 // 菜单栏歌词
      },
      downloadPath: localStorage.getItem('downloadPath') || '~/Downloads',
    }
  },

  actions: {
    updateMode(mode: string) {
      this.mode = +mode
    },
    updateCurrentTime(currentTime: number) {
      this.currentTime = currentTime
    },
    updateCurSongId(songId: string) {
      console.log('歌曲id被更新了', songId)
      this.curSongId = songId
    },
    updateVolume(volume: number) {
      this.volume = volume
    },
    updatePlayInfo(playInfo: any) {
      this.playInfo = playInfo
    },
    updateLyric(lyric: any) {
      this.lyric = lyric
    },
    updateUrl(url: string) {
      this.url = url
    },
    setDownloadPath(path: string) {
      localStorage.setItem('downloadPath', path)
      this.downloadPath = path
    },
    updateSetting(setting) {
      this.setting = setting
    }
  }
})
