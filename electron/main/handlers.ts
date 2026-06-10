/**
 * @fileoverview IPC 处理器注册
 *
 * 集中注册所有业务相关的 IPC 通道处理函数：
 * - 歌词窗口控制（打开/关闭/固定/解锁）
 * - 迷你歌词窗口控制 & 数据转发
 * - 文件夹选择对话框
 * - 音乐文件下载
 *
 * IPC 通道总览：
 * ```
 * openLyric / closeLyric                  → 桌面歌词窗口
 * open-mini-lyric / close-mini-lyric      → 迷你歌词窗口
 * mini-lyric-back                         → 退出迷你歌词
 * lyric                                   → 歌词文本 → tray + lyricWin
 * fixed / unfixed / unlock                → 固定/解锁歌词窗口
 * update-currentTime / update-lyric / update-playInfo → 转发给 miniLyricWin
 * select-folder                           → 打开文件夹选择对话框
 * download-file                           → 触发文件下载
 * ```
 */

import { ipcMain, dialog, Tray } from "electron"
import type { WindowManager } from "./windows"
import { setDownloadTask } from "./download"
import { truncateString } from "./utils"

/**
 * 注册所有业务 IPC 处理器
 *
 * @param wm - 窗口管理器实例
 * @param tray - 系统托盘实例（可为 null）
 */
export function registerLyricHandlers(wm: WindowManager, tray: Tray | null): void {
  // ========================================================================
  // 桌面歌词窗口
  // ========================================================================

  ipcMain.on("openLyric", () => wm.openLyricWindow())
  ipcMain.on("closeLyric", () => wm.destroyLyricWindow())

  // ========================================================================
  // 迷你歌词窗口
  // ========================================================================

  ipcMain.on("open-mini-lyric", () => wm.openMiniLyricWindow())
  ipcMain.on("close-mini-lyric", () => wm.destroyMiniLyricWindow())
  ipcMain.on("mini-lyric-back", () => wm.backFromMiniLyric())

  // ========================================================================
  // 歌词数据更新 → tray 标题 + 转发给 lyricWin
  // ========================================================================

  /**
   * 接收渲染进程发送的当前歌词文本：
   * 1. 截断后设置到系统托盘标题（最多 16 字节）
   * 2. 转发给桌面歌词窗口显示
   */
  ipcMain.on("lyric", (_, lyric: string) => {
    if (lyric) {
      tray?.setTitle(truncateString(lyric, 16))
    }
    wm.lyricWin?.webContents.send("lyric", lyric)
  })

  // ========================================================================
  // 歌词窗口固定/解锁
  // ========================================================================

  /** 固定歌词窗口：置顶 + 禁止拖动 */
  ipcMain.on("fixed", () => {
    if (wm.lyricWin) {
      wm.lyricWin.setAlwaysOnTop(true)
      wm.lyricWin.setMovable(false)
    }
  })

  /**
   * 取消固定歌词窗口：取消置顶 + 允许拖动
   * 同时兼容 unfixed 和 unlock 两个通道名
   * （渲染进程实际发送的是 "unlock"，保留 "unfixed" 兼容旧版）
   */
  const unfix = () => {
    if (wm.lyricWin) {
      wm.lyricWin.setAlwaysOnTop(false)
      wm.lyricWin.setMovable(true)
    }
  }
  ipcMain.on("unfixed", unfix)
  ipcMain.on("unlock", unfix)

  // ========================================================================
  // 迷你歌词数据转发
  // ========================================================================

  /**
   * 播放进度更新 → 转发给迷你歌词窗口
   * @param time - 当前播放时间（秒）
   */
  ipcMain.on("update-currentTime", (_, time: number) => {
    wm.miniLyricWin?.webContents.send("update-currentTime", time)
  })

  /**
   * 歌词数组更新 → 转发给迷你歌词窗口
   * @param lyric - 歌词行数组
   */
  ipcMain.on("update-lyric", (_, lyric: unknown[]) => {
    wm.miniLyricWin?.webContents.send("update-lyric", lyric)
  })

  /**
   * 播放信息更新 → 转发给迷你歌词窗口
   * @param playInfo - 当前播放信息（歌曲名、歌手、封面等）
   */
  ipcMain.on("update-playInfo", (_, playInfo: unknown) => {
    wm.miniLyricWin?.webContents.send("update-playInfo", playInfo)
  })

  // ========================================================================
  // 文件夹选择
  // ========================================================================

  /**
   * 打开系统文件夹选择对话框
   *
   * 用户选择目录后通过 "select-folder-reply" 通道将路径返回给请求方。
   *
   * @param defaultPath - 对话框的默认打开路径
   */
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

  // ========================================================================
  // 音乐下载
  // ========================================================================

  /**
   * 触发文件下载
   *
   * 先在 download 模块中设置下载任务的文件名和保存目录，
   * 然后通过主窗口的 downloadURL 启动下载。
   */
  ipcMain.on("download-file", (_event, { url, fileName, dir }: { url: string; fileName: string; dir: string }) => {
    setDownloadTask(fileName, dir)
    console.log("开始下载", url)
    wm.mainWin.webContents.downloadURL(url)
  })
}
