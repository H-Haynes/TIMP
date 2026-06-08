import { app, globalShortcut } from "electron"
import { release } from "node:os"
import { join } from "node:path"

import { installDevtools, registerKeyboardEvent, openDevTools } from "./winEvent"
import { registerUpdateHandlers } from "./updater"
import { WindowManager } from "./windows"
import { createTray } from "./tray"
import { registerDownloadHandler } from "./download"
import { registerLyricHandlers } from "./handlers"

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "..")
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist")
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, "../public") : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) {
  app.disableHardwareAcceleration()
}

// Set application name for Windows 10+ notifications
if (process.platform === "win32") {
  app.setAppUserModelId(app.getName())
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

const preload = join(__dirname, "../preload/index.js")
const devUrl = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, "index.html")

let wm: WindowManager

// --- Global error handling ---

app.on("render-process-gone", (_event, _webContents, details) => {
  console.error("[Main] Render process gone:", details.reason, details.exitCode)
})

app.on("child-process-gone", (_event, details) => {
  console.error("[Main] Child process gone:", details.type, details.reason, details.exitCode)
})

process.on("uncaughtException", error => {
  console.error("[Main] Uncaught exception:", error)
})

// --- App lifecycle ---

app.whenReady().then(async () => {
  // 开发模式下：安装Vue DevTools（必须在创建窗口前调用，否则无法检测到Vue）
  // 使用 devUrl 而非 import.meta.env.DEV 判断，因为主进程中后者可能不生效
  const isDev = !!devUrl
  if (isDev) {
    try {
      await installDevtools()
    } catch (e) {
      console.error("[Main] installDevtools failed:", e)
    }
  }

  wm = new WindowManager(preload, devUrl, indexHtml)

  registerDownloadHandler(wm.mainWin)
  registerKeyboardEvent(wm.mainWin)
  registerUpdateHandlers(wm.mainWin)

  const tray = createTray()
  registerLyricHandlers(wm, tray)

  if (isDev) {
    try {
      openDevTools(wm.mainWin)
    } catch (e) {
      console.error("[Main] openDevTools failed:", e)
    }
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("second-instance", () => {
  wm?.focusOrRestore()
})

app.on("activate", () => {
  wm?.focusOrCreate()
})

app.on("will-quit", () => {
  globalShortcut.unregisterAll()
})
