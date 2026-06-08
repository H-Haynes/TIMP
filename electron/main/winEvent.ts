import { globalShortcut, BrowserWindow, session } from "electron"
import { join } from "node:path"
import os from "node:os"

// 注册全局快捷键【FIXME:mac播放控制需要受信任证书，】
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

// 安装Vue DevTools扩展（必须在创建窗口前调用）
export const installDevtools = async (): Promise<void> => {
  // 优先从本地浏览器加载已安装的Vue DevTools扩展
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

  // 回退：通过electron-devtools-installer在线下载
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

// 自动打开DevTools（仅开发环境）
export const openDevTools = (win: BrowserWindow) => {
  const open = () => {
    win.webContents.openDevTools()
    console.log("[DevTools] DevTools opened")
  }
  // did-finish-load可能已经触发过，先直接尝试打开
  if (win.webContents.isLoading()) {
    win.webContents.once("did-finish-load", open)
  } else {
    open()
  }
}
