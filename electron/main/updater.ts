import { BrowserWindow, ipcMain, shell, app } from "electron"
import { join } from "node:path"
import * as fs from "node:fs"
import * as http from "node:http"
import * as https from "node:https"

interface UpdateInfo {
  hasUpdate: boolean
  forceUpdate: boolean
  updateType: "wgt" | "apk" | "patch"
  versionName: string
  versionCode: number
  updateDesc: string
  wgtUrl: string
  apkUrl: string
  patchUrl: string
}

class UpdateManager {
  private win: BrowserWindow
  private abortController: AbortController | null = null

  constructor(win: BrowserWindow) {
    this.win = win
  }

  private downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.abortController = new AbortController()

      const transport = url.startsWith("https") ? https : http
      const file = fs.createWriteStream(destPath)
      let transferred = 0
      let total = 0

      const req = transport.get(url, res => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close()
          fs.unlinkSync(destPath)
          this.downloadFile(res.headers.location, destPath).then(resolve).catch(reject)
          return
        }

        total = parseInt(res.headers["content-length"] || "0", 10)

        res.on("data", (chunk: Buffer) => {
          transferred += chunk.length
          const percent = total > 0 ? Math.round((transferred / total) * 100) : 0
          this.win.webContents.send("update-download-progress", {
            percent,
            transferred,
            total
          })
        })

        res.pipe(file)

        file.on("finish", () => {
          file.close()
          resolve()
        })

        res.on("error", (err: Error) => {
          file.close()
          fs.unlinkSync(destPath)
          reject(err)
        })

        file.on("error", (err: Error) => {
          file.close()
          fs.unlinkSync(destPath)
          reject(err)
        })
      })

      req.on("error", (err: Error) => {
        file.close()
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath)
        }
        reject(err)
      })

      this.abortController.signal.addEventListener("abort", () => {
        req.destroy()
        file.close()
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath)
        }
      })
    })
  }

  async startDownload(updateInfo: UpdateInfo): Promise<void> {
    const { updateType, wgtUrl, apkUrl, patchUrl } = updateInfo
    const downloadDir = app.getPath("downloads")
    const fileName = `TIMP_${updateInfo.versionName}.${updateType === "wgt" ? "wgt" : updateType === "patch" ? "patch" : this.getExt()}`

    const downloadUrl = updateType === "apk" ? apkUrl : updateType === "patch" ? patchUrl : wgtUrl
    const destPath = join(downloadDir, fileName)

    try {
      await this.downloadFile(downloadUrl, destPath)
      this.win.webContents.send("update-download-completed", { filePath: destPath, updateType, updateInfo })
    } catch (err) {
      this.win.webContents.send("update-download-error", (err as Error).message || "下载失败")
    }
  }

  cancelDownload(): void {
    this.abortController?.abort()
    this.abortController = null
  }

  installWgt(filePath: string): void {
    const extractDir = join(app.getPath("userData"), "wgt-patch")
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true })
    }

    // Signal renderer that WGT is ready, then reload
    this.win.webContents.send("wgt-installed", extractDir)
    this.win.webContents.reload()
  }

  installApk(filePath: string): void {
    shell.openPath(filePath).then(() => {
      app.quit()
    })
  }

  showFileInFolder(filePath: string): void {
    shell.showItemInFolder(filePath)
  }

  private getExt(): string {
    if (process.platform === "win32") {
      return "exe"
    }
    if (process.platform === "darwin") {
      return "dmg"
    }
    return "AppImage"
  }
}

export function registerUpdateHandlers(win: BrowserWindow): void {
  const manager = new UpdateManager(win)

  ipcMain.on("start-download", (_, updateInfo: UpdateInfo) => {
    manager.startDownload(updateInfo)
  })

  ipcMain.on("cancel-download", () => {
    manager.cancelDownload()
  })

  ipcMain.on("install-update", (_, { updateType, filePath }: { updateType: string; filePath: string }) => {
    if (updateType === "wgt" || updateType === "patch") {
      manager.installWgt(filePath)
    } else if (updateType === "apk") {
      manager.installApk(filePath)
    } else {
      manager.showFileInFolder(filePath)
    }
  })

  // Forward show-update-dialog from renderer back to renderer so UpdateDialog can receive it
  ipcMain.on("show-update-dialog", (_, info: UpdateInfo) => {
    win.webContents.send("show-update-dialog", info)
  })
}
