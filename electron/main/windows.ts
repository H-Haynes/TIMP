import { BrowserWindow, screen, shell } from "electron"
import { join } from "node:path"

const MAIN_MIN_WIDTH = 900
const LYRIC_W = 800
const LYRIC_H = 100
const MINI_W = 350
const MINI_H = 700

export class WindowManager {
  mainWin: BrowserWindow
  lyricWin: BrowserWindow | null = null
  miniLyricWin: BrowserWindow | null = null

  private preload: string
  private devUrl: string | undefined
  private indexHtml: string

  constructor(preload: string, devUrl: string | undefined, indexHtml: string) {
    this.preload = preload
    this.devUrl = devUrl
    this.indexHtml = indexHtml
    this.mainWin = this.createMainWindow()
  }

  private webPrefs(): Electron.WebPreferences {
    return {
      preload: this.preload,
      nodeIntegration: true,
      contextIsolation: true
    }
  }

  private loadPage(win: BrowserWindow, hash?: string): void {
    if (this.devUrl) {
      win.loadURL(hash ? `${this.devUrl}#${hash}` : this.devUrl)
    } else {
      win.loadFile(this.indexHtml, hash ? { hash: `#${hash}` } : undefined)
    }
  }

  // ---------- 主窗口 ----------

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

    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("https:")) {
        shell.openExternal(url)
      }
      return { action: "deny" }
    })

    win.on("closed", () => {
      this.destroyLyricWindow()
      this.destroyMiniLyricWindow()
    })

    return win
  }

  // ---------- 桌面歌词窗口 ----------

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

  destroyLyricWindow(): void {
    if (this.lyricWin) {
      this.lyricWin.destroy()
      this.lyricWin = null
    }
  }

  // ---------- 迷你固定歌词窗口 ----------

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

  destroyMiniLyricWindow(): void {
    if (this.miniLyricWin) {
      this.miniLyricWin.destroy()
      this.miniLyricWin = null
    }
  }

  backFromMiniLyric(): void {
    this.destroyMiniLyricWindow()
    this.mainWin.show()
    this.lyricWin?.show()
  }

  // ---------- 生命周期辅助 ----------

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
