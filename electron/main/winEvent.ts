/**
 * @fileoverview 窗口事件 & 开发工具
 *
 * 提供：
 * - 全局媒体快捷键注册（播放/暂停/上一曲/下一曲/停止）
 * - Vue DevTools 扩展安装（开发环境）
 * - DevTools 自动打开（开发环境）
 */

import { globalShortcut, BrowserWindow, session } from "electron"
import { join } from "node:path"
import os from "node:os"

/**
 * 注册全局媒体快捷键
 *
 * 监听系统媒体键事件并转发给渲染进程。
 * 支持的按键：MediaPreviousTrack / MediaNextTrack / MediaPlayPause / MediaStop
 *
 * @param window - 主窗口 BrowserWindow 实例
 * @fixme macOS 上媒体控制需要受信任证书才能正常工作
 */
export const registerKeyboardEvent = (window: BrowserWindow) => {
  globalShortcut.register("MediaPreviousTrack", () => {
    window.webContents.send("media-previous-track")
  })

  globalShortcut.register("MediaNextTrack", () => {
    window.webContents.send("media-next-track")
  })

  globalShortcut.register("MediaPlayPause", () => {
    window.webContents.send("media-play-pause")
  })

  globalShortcut.register("MediaStop", () => {
    window.webContents.send("media-stop")
  })
}

/**
 * 安装 Vue DevTools 扩展（仅开发环境）
 *
 * **必须在创建窗口前调用**，否则 Electron 无法检测到已加载的 Vue 应用。
 *
 * 加载策略（按优先级）：
 * 1. 从本地 Edge/Chrome 浏览器已安装的 Vue DevTools 扩展加载（macOS）
 * 2. 回退：通过 electron-devtools-installer 在线下载安装
 *
 * @returns 安装完成（无论是否成功）的 Promise
 */
export const installDevtools = async (): Promise<void> => {
  // 优先从本地浏览器加载已安装的 Vue DevTools 扩展
  const extPaths =
    process.platform === "darwin"
      ? [
          // Edge
          join(os.homedir(), "/Library/Application Support/Microsoft Edge/Default/Extensions/olofadcdnkkjdfgjcmjaadnlehnnihnl/6.6.3_0"),
          // Chrome
          join(os.homedir(), "/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/7.7.7_0")
        ]
      : []

  let loaded = false
  for (const extPath of extPaths) {
    try {
      await session.defaultSession.extensions.loadExtension(extPath)
      console.log("[DevTools] Vue DevTools loaded from:", extPath)
      loaded = true
      break
    } catch {
      // 该路径不存在，尝试下一个
    }
  }

  // 回退：通过 electron-devtools-installer 在线下载
  if (!loaded) {
    try {
      const mod = await import("electron-devtools-installer")
      const installExtension = mod.installExtension
      const VUEJS_DEVTOOLS = mod.VUEJS_DEVTOOLS
      if (typeof installExtension === "function" && VUEJS_DEVTOOLS) {
        await installExtension(VUEJS_DEVTOOLS, {
          loadExtensionOptions: { allowFileAccess: true }
        })
        console.log("[DevTools] Vue DevTools extension installed via download")
      }
    } catch (e: any) {
      console.error("[DevTools] Failed to install via electron-devtools-installer:", e?.message ?? e)
    }
  }
}

/**
 * 自动打开 DevTools（仅开发环境）
 *
 * 处理两种时序：
 * - 页面仍在加载中：等待 did-finish-load 事件后再打开
 * - 页面已完成加载：立即打开
 *
 * @param win - 目标 BrowserWindow 实例
 */
export const openDevTools = (win: BrowserWindow) => {
  const open = () => {
    win.webContents.openDevTools()
    console.log("[DevTools] DevTools opened")
  }
  // did-finish-load 可能已经触发过，先判断加载状态
  if (win.webContents.isLoading()) {
    win.webContents.once("did-finish-load", open)
  } else {
    open()
  }
}
