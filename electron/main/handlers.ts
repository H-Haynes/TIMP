import { ipcMain, dialog, Tray } from "electron"
import type { WindowManager } from "./windows"
import { setDownloadTask } from "./download"
import { truncateString } from "./utils"

export function registerLyricHandlers(wm: WindowManager, tray: Tray | null): void {
  // 歌词窗口
  ipcMain.on("openLyric", () => wm.openLyricWindow())
  ipcMain.on("closeLyric", () => wm.destroyLyricWindow())

  // 迷你歌词窗口
  ipcMain.on("open-mini-lyric", () => wm.openMiniLyricWindow())
  ipcMain.on("close-mini-lyric", () => wm.destroyMiniLyricWindow())
  ipcMain.on("mini-lyric-back", () => wm.backFromMiniLyric())

  // 歌词更新 → tray + 转发
  ipcMain.on("lyric", (_, lyric: string) => {
    if (lyric) {
      tray?.setTitle(truncateString(lyric, 16))
    }
    wm.lyricWin?.webContents.send("lyric", lyric)
  })

  // 固定桌面歌词
  ipcMain.on("fixed", () => {
    if (wm.lyricWin) {
      wm.lyricWin.setAlwaysOnTop(true)
      wm.lyricWin.setMovable(false)
    }
  })

  // 取消固定 — 兼容 unfixed 和 unlock（修复渲染进程发送 "unlock" 的 bug）
  const unfix = () => {
    if (wm.lyricWin) {
      wm.lyricWin.setAlwaysOnTop(false)
      wm.lyricWin.setMovable(true)
    }
  }
  ipcMain.on("unfixed", unfix)
  ipcMain.on("unlock", unfix)

  // mini歌词转发
  ipcMain.on("update-currentTime", (_, time: number) => {
    wm.miniLyricWin?.webContents.send("update-currentTime", time)
  })
  ipcMain.on("update-lyric", (_, lyric: unknown[]) => {
    wm.miniLyricWin?.webContents.send("update-lyric", lyric)
  })
  ipcMain.on("update-playInfo", (_, playInfo: unknown) => {
    wm.miniLyricWin?.webContents.send("update-playInfo", playInfo)
  })

  // 文件夹选择
  ipcMain.on("select-folder", (event, defaultPath?: string) => {
    dialog
      .showOpenDialog(wm.mainWin, {
        properties: ["openDirectory"],
        defaultPath
      })
      .then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
          event.sender.send("select-folder-reply", result.filePaths[0])
        }
      })
  })

  // 音乐下载
  ipcMain.on("download-file", (_event, { url, fileName, dir }: { url: string; fileName: string; dir: string }) => {
    setDownloadTask(fileName, dir)
    console.log("开始下载", url)
    wm.mainWin.webContents.downloadURL(url)
  })
}
