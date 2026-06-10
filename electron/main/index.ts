/**
 * @fileoverview Electron 主进程入口
 *
 * 职责：
 * - 设置环境变量（DIST_ELECTRON / DIST / PUBLIC）
 * - 单实例锁 & 全局错误处理
 * - app.whenReady 阶段编排：安装 DevTools → 创建窗口 → 注册 IPC → 启动托盘
 * - 应用生命周期管理（second-instance / activate / will-quit）
 *
 * 目录结构（构建产物）：
 * ```
 * ├─┬ dist-electron
 * │ ├─┬ main
 * │ │ └── index.js    > Electron-Main
 * │ └─┬ preload
 * │   └── index.js    > Preload-Scripts
 * ├─┬ dist
 * │ └── index.html    > Electron-Renderer
 * ```
 */

import { app, globalShortcut } from "electron"
import { release } from "node:os"
import { join } from "node:path"

import { installDevtools, registerKeyboardEvent, openDevTools } from "./winEvent"
import { registerUpdateHandlers } from "./updater"
import { WindowManager } from "./windows"
import { createTray } from "./tray"
import { registerDownloadHandler } from "./download"
import { registerLyricHandlers } from "./handlers"

// ---------- 环境变量 ----------

process.env.DIST_ELECTRON = join(__dirname, "..")
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist")
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, "../public") : process.env.DIST

// ---------- 平台兼容 ----------

// Windows 7 下禁用 GPU 加速
if (release().startsWith("6.1")) {
  app.disableHardwareAcceleration()
}

// Windows 10+ 通知需要设置 AppUserModelId
if (process.platform === "win32") {
  app.setAppUserModelId(app.getName())
}

// ---------- 单实例锁 ----------

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// ---------- 路径常量 ----------

const preload = join(__dirname, "../preload/index.js")
const devUrl = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, "index.html")

/** 全局窗口管理器实例，在 app.whenReady 中初始化 */
let wm: WindowManager

// ---------- 全局错误处理 ----------

app.on("render-process-gone", (_event, _webContents, details) => {
  console.error("[Main] Render process gone:", details.reason, details.exitCode)
})

app.on("child-process-gone", (_event, details) => {
  console.error("[Main] Child process gone:", details.type, details.reason, details.exitCode)
})

process.on("uncaughtException", error => {
  console.error("[Main] Uncaught exception:", error)
})

// ---------- App 生命周期 ----------

app.whenReady().then(async () => {
  /**
   * 使用 devUrl（即 VITE_DEV_SERVER_URL）判断是否为开发模式。
   * 主进程构建产物中 import.meta.env.DEV 会被静态替换为 false，因此不可靠。
   */
  const isDev = !!devUrl

  // 开发环境：安装 Vue DevTools（必须在创建窗口前调用，否则 Vue 无法被检测到）
  if (isDev) {
    try {
      await installDevtools()
    } catch (e) {
      console.error("[Main] installDevtools failed:", e)
    }
  }

  // 创建主窗口（WindowManager 构造时自动创建）
  wm = new WindowManager(preload, devUrl, indexHtml)

  // 注册各模块
  registerDownloadHandler(wm.mainWin)
  registerKeyboardEvent(wm.mainWin)
  registerUpdateHandlers(wm.mainWin)

  const tray = createTray()
  registerLyricHandlers(wm, tray)

  // 开发环境：自动打开 DevTools
  if (isDev) {
    try {
      openDevTools(wm.mainWin)
    } catch (e) {
      console.error("[Main] openDevTools failed:", e)
    }
  }
})

/** macOS: 关闭所有窗口后不退出应用（符合 macOS 惯例） */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

/** 第二个实例启动时，激活已有窗口 */
app.on("second-instance", () => {
  wm?.focusOrRestore()
})

/** macOS: 点击 Dock 图标时重新激活窗口 */
app.on("activate", () => {
  wm?.focusOrCreate()
})

/** 退出前注销所有全局快捷键 */
app.on("will-quit", () => {
  globalShortcut.unregisterAll()
})
