import { EPlatform, PlayMode } from "@/types/enums"
import type { ISong, ILyricItem } from "@/types/song"
import { cloneDeep } from "lodash-es"
export default defineStore("playSetting", {
  persist: {
    enabled: true
  },
  state: () => {
    return {
      mode: PlayMode.Loop as number,
      currentTime: 0,
      curSongId: "",
      volume: 1,
      playInfo: {
        name: "",
        artists: [],
        duration: 0,
        pic: "",
        albumId: "",
        id: "",
        platform: EPlatform.QQ
      } as ISong,
      lyric: [] as ILyricItem[],
      url: "",
      setting: {
        skin: 0,
        loop: 0,
        downloadLyric: 0,
        downloadNotice: 0,
        deskLyric: 0,
        trayLyric: 0
      },
      downloadPath: localStorage.getItem("downloadPath") || "~/Downloads"
    }
  },

  actions: {
    updateMode(mode: string) {
      this.mode = +mode
    },
    updateCurrentTime(currentTime: number) {
      this.currentTime = currentTime
      window.electron.send("update-currentTime", currentTime)
    },
    updateCurSongId(songId: string) {
      this.curSongId = songId
    },
    updateVolume(volume: number) {
      this.volume = volume
    },
    updatePlayInfo(playInfo: ISong) {
      this.playInfo = playInfo
      window.electron.send("update-playInfo", JSON.stringify(playInfo))
    },
    updateLyric(lyric: ILyricItem[]) {
      this.lyric = lyric
      window.electron.send("update-lyric", JSON.stringify(lyric))
    },
    updateUrl(url: string) {
      this.url = url
    },
    setDownloadPath(path: string) {
      localStorage.setItem("downloadPath", path)
      this.downloadPath = path
    },
    updateSetting(setting) {
      this.setting = setting
    }
  }
})
