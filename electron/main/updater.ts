/**
 * @fileoverview 应用更新模块
 *
 * 处理三种更新类型：
 * - wgt  — 前端资源热更新包（替换页面资源）
 * - apk  — Android 安装包（调用系统安装）
 * - patch — 客户端补丁包（Windows/macOS 安装程序）
 *
 * IPC 通道（均由渲染进程触发）：
 * - start-download    → 开始下载更新文件
 * - cancel-download   → 取消正在进行的下载
 * - install-update    → 安装已下载的更新
 * - show-update-dialog → 转发更新对话框数据
 */

import { BrowserWindow, ipcMain, shell, app } from "electron"
import { join } from "node:path"
import * as fs from "node:fs"
import * as http from "node:http"
import * as https from "node:https"

/**
 * 更新信息（由更新检测 API 返回）
 */
interface UpdateInfo {
  /** 是否有可用更新 */
  hasUpdate: boolean
  /** 是否强制更新 */
  forceUpdate: boolean
  /** 更新类型 */
  updateType: "wgt" | "apk" | "patch"
  /** 版本名称（显示用） */
  versionName: string
  /** 版本号（比较用） */
  versionCode: number
  /** 更新说明 */
  updateDesc: string
  /** wgt 资源包下载地址 */
  wgtUrl: string
  /** apk 安装包下载地址 */
  apkUrl: string
  /** patch 补丁包下载地址 */
  patchUrl: string
}

/**
 * 更新管理器
 *
 * 封装更新的下载、取消、安装逻辑。
 * 支持 HTTP 重定向跟踪和下载进度上报。
 */
class UpdateManager {
  private win: BrowserWindow
  private abortController: AbortController | null = null

  /**
   * @param win - 主窗口 BrowserWindow 实例
   */
  constructor(win: BrowserWindow) {
    this.win = win
  }

  /**
   * 流式下载文件到本地
   *
   * 功能：
   * - 自动跟踪 HTTP 3xx 重定向
   * - 通过 IPC 实时上报下载进度（update-download-progress）
   * - 支持 AbortController 取消
   *
   * @param url - 文件下载地址
   * @param destPath - 本地保存路径
   * @returns 下载完成时 resolve，失败时 reject
   */
  private downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.abortController = new AbortController()

      const transport = url.startsWith("https") ? https : http
      const file = fs.createWriteStream(destPath)
      let transferred = 0
      let total = 0

      const req = transport.get(url, res => {
        // 跟踪重定向
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

  /**
   * 开始下载更新文件
   *
   * 文件命名规则：`TIMP_{versionName}.{ext}`
   * 下载完成后通知渲染进程（update-download-completed）
   *
   * @param updateInfo - 更新信息对象
   */
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

  /** 取消当前正在进行的下载 */
  cancelDownload(): void {
    this.abortController?.abort()
    this.abortController = null
  }

  /**
   * 安装 WGT/Patch 资源包
   *
   * 通知渲染进程资源路径后刷新页面以应用更新。
   *
   * @param filePath - WGT/Patch 文件路径
   */
  installWgt(filePath: string): void {
    const extractDir = join(app.getPath("userData"), "wgt-patch")
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true })
    }

    // 通知渲染进程资源就绪，然后刷新页面
    this.win.webContents.send("wgt-installed", extractDir)
    this.win.webContents.reload()
  }

  /**
   * 安装 APK 文件
   *
   * 调用系统默认程序打开 APK，然后退出应用。
   *
   * @param filePath - APK 文件路径
   */
  installApk(filePath: string): void {
    shell.openPath(filePath).then(() => {
      app.quit()
    })
  }

  /**
   * 在文件管理器中显示文件
   *
   * @param filePath - 要定位的文件路径
   */
  showFileInFolder(filePath: string): void {
    shell.showItemInFolder(filePath)
  }

  /**
   * 根据当前平台返回可执行文件扩展名
   * @returns Windows: exe, macOS: dmg, Linux: AppImage
   */
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

/**
 * 注册更新相关的 IPC 处理器
 *
 * 将所有更新操作绑定到主窗口的 IPC 通道上。
 *
 * @param win - 主窗口 BrowserWindow 实例
 */
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

  // 转发 show-update-dialog 消息：渲染进程 → 主进程 → 另一个渲染进程窗口
  ipcMain.on("show-update-dialog", (_, info: UpdateInfo) => {
    win.webContents.send("show-update-dialog", info)
  })
}
