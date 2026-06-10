/**
 * @fileoverview 窗口管理器
 *
 * 负责创建和管理应用的所有 BrowserWindow 实例：
 * - 主窗口（mainWin）
 * - 桌面歌词窗口（lyricWin）
 * - 迷你固定歌词窗口（miniLyricWin）
 *
 * 统一封装了窗口构造、页面加载、销毁清理等重复逻辑。
 */

import { BrowserWindow, screen, shell } from "electron"
import { join } from "node:path"

/** 主窗口最小宽度 */
const MAIN_MIN_WIDTH = 900
/** 桌面歌词窗口宽度 */
const LYRIC_W = 800
/** 桌面歌词窗口高度 */
const LYRIC_H = 100
/** 迷你歌词窗口宽度 */
const MINI_W = 350
/** 迷你歌词窗口高度 */
const MINI_H = 700

/**
 * 窗口管理器
 *
 * 统一管理应用所有窗口的生命周期。创建时自动生成主窗口，
 * 歌词窗口和迷你歌词窗口按需延迟创建。
 */
export class WindowManager {
  /** 主窗口，构造时自动创建 */
  mainWin: BrowserWindow
  /** 桌面歌词窗口（延迟创建） */
  lyricWin: BrowserWindow | null = null
  /** 迷你固定歌词窗口（延迟创建） */
  miniLyricWin: BrowserWindow | null = null

  private preload: string
  private devUrl: string | undefined
  private indexHtml: string

  /**
   * @param preload - preload 脚本的绝对路径
   * @param devUrl - 开发模式下的 Vite dev server URL，生产环境为 undefined
   * @param indexHtml - 生产环境 index.html 的绝对路径
   */
  constructor(preload: string, devUrl: string | undefined, indexHtml: string) {
    this.preload = preload
    this.devUrl = devUrl
    this.indexHtml = indexHtml
    this.mainWin = this.createMainWindow()
  }

  /**
   * 生成所有窗口共享的 webPreferences 配置
   * @returns Electron WebPreferences 对象
   */
  private webPrefs(): Electron.WebPreferences {
    return {
      preload: this.preload,
      nodeIntegration: true,
      contextIsolation: true
    }
  }

  /**
   * 根据运行模式加载页面：
   * - 开发模式：通过 loadURL 加载 Vite dev server
   * - 生产模式：通过 loadFile 加载本地构建产物
   *
   * @param win - 目标 BrowserWindow
   * @param hash - 可选的 URL hash（路由路径）
   */
  private loadPage(win: BrowserWindow, hash?: string): void {
    if (this.devUrl) {
      win.loadURL(hash ? `${this.devUrl}#${hash}` : this.devUrl)
    } else {
      win.loadFile(this.indexHtml, hash ? { hash: `#${hash}` } : undefined)
    }
  }

  // ========================================================================
  // 主窗口
  // ========================================================================

  /**
   * 创建主窗口
   *
   * 配置包括：最小宽度、favicon 图标、外部链接安全处理、
   * 关闭时自动清理子窗口。
   *
   * @returns 新创建的 BrowserWindow 实例
   */
  createMainWindow(): BrowserWindow {
    const win = new BrowserWindow({
      title: "Main window",
      icon: join(process.env.PUBLIC!, "favicon.ico"),
      webPreferences: this.webPrefs(),
      minWidth: MAIN_MIN_WIDTH
    })

    this.loadPage(win)

    win.webContents.on("did-finish-load", () => {
      win.webContents.send("main-process-message", new Date().toLocaleString())
    })

    // 仅允许 https 外部链接在系统浏览器中打开，阻止导航劫持
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("https:")) {
        shell.openExternal(url)
      }
      return { action: "deny" }
    })

    // 主窗口关闭时级联销毁子窗口
    win.on("closed", () => {
      this.destroyLyricWindow()
      this.destroyMiniLyricWindow()
    })

    return win
  }

  // ========================================================================
  // 桌面歌词窗口
  // ========================================================================

  /**
   * 打开或显示桌面歌词窗口
   *
   * 首次调用时创建新的透明无边框窗口，居中显示在屏幕底部。
   * 后续调用直接 show 已有窗口。
   */
  openLyricWindow(): void {
    if (this.lyricWin) {
      this.lyricWin.show()
      return
    }

    const d = screen.getPrimaryDisplay()
    this.lyricWin = new BrowserWindow({
      width: LYRIC_W,
      height: LYRIC_H,
      transparent: true,
      webPreferences: this.webPrefs(),
      x: (d.workArea.width - LYRIC_W) / 2,
      y: d.workArea.height - LYRIC_H,
      frame: false,
      backgroundColor: "#00000000",
      alwaysOnTop: true
    })

    this.loadPage(this.lyricWin, "/lyric")
    this.lyricWin.on("close", () => {
      this.lyricWin?.destroy()
      this.lyricWin = null
    })

    // 主窗口重新聚焦，避免焦点落在子窗口
    this.mainWin.show()
  }

  /** 销毁桌面歌词窗口 */
  destroyLyricWindow(): void {
    if (this.lyricWin) {
      this.lyricWin.destroy()
      this.lyricWin = null
    }
  }

  // ========================================================================
  // 迷你固定歌词窗口
  // ========================================================================

  /**
   * 打开或显示迷你固定歌词窗口
   *
   * 打开后主窗口和桌面歌词窗口自动隐藏。
   * 延迟 1-2 秒后通知渲染进程发送当前歌词数据。
   */
  openMiniLyricWindow(): void {
    if (this.miniLyricWin) {
      this.miniLyricWin.show()
      this.mainWin.hide()
      this.lyricWin?.hide()
      setTimeout(() => this.mainWin.webContents.send("need-send-lyric"), 1000)
      return
    }

    const d = screen.getPrimaryDisplay()
    this.miniLyricWin = new BrowserWindow({
      width: MINI_W,
      height: MINI_H,
      transparent: true,
      webPreferences: this.webPrefs(),
      x: d.workAreaSize.width - MINI_W - 40,
      y: d.workAreaSize.height - MINI_H - 150,
      frame: false,
      backgroundColor: "#00000000",
      alwaysOnTop: true
    })

    this.loadPage(this.miniLyricWin, "/fixLyric")
    this.miniLyricWin.on("close", () => {
      this.miniLyricWin?.destroy()
      this.miniLyricWin = null
    })

    this.mainWin.hide()
    this.lyricWin?.hide()
    setTimeout(() => this.mainWin.webContents.send("need-send-lyric"), 2000)
  }

  /** 销毁迷你歌词窗口 */
  destroyMiniLyricWindow(): void {
    if (this.miniLyricWin) {
      this.miniLyricWin.destroy()
      this.miniLyricWin = null
    }
  }

  /**
   * 从迷你歌词模式返回主窗口
   *
   * 销毁迷你歌词窗口，恢复主窗口和歌词窗口的显示。
   */
  backFromMiniLyric(): void {
    this.destroyMiniLyricWindow()
    this.mainWin.show()
    this.lyricWin?.show()
  }

  // ========================================================================
  // 生命周期辅助
  // ========================================================================

  /**
   * 激活已有窗口（second-instance 回调）
   *
   * 如果窗口已被销毁，则重新创建。
   * 否则取消最小化并聚焦。
   */
  focusOrRestore(): void {
    if (this.mainWin.isDestroyed()) {
      this.mainWin = this.createMainWindow()
      return
    }
    if (this.mainWin.isMinimized()) {
      this.mainWin.restore()
    }
    this.mainWin.focus()
  }

  /**
   * 聚焦或创建窗口（macOS activate 回调）
   *
   * 如果窗口已被销毁，则重新创建。
   * 否则取消最小化并聚焦。
   */
  focusOrCreate(): void {
    if (this.mainWin.isDestroyed()) {
      this.mainWin = this.createMainWindow()
      return
    }
    if (this.mainWin.isMinimized()) {
      this.mainWin.restore()
    }
    this.mainWin.focus()
  }
}
