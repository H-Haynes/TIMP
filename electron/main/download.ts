import { BrowserWindow, session } from "electron"
import { join } from "node:path"

let downloadFileName = ""
let downloadDir = ""

export function registerDownloadHandler(mainWin: BrowserWindow): void {
  session.defaultSession.on("will-download", (_event, item) => {
    item.setSavePath(join(downloadDir, downloadFileName))

    item.on("updated", (_event, state) => {
      if (state === "interrupted") {
        console.log("Download is interrupted but can be resumed")
      } else if (state === "progressing") {
        if (item.isPaused()) {
          console.log("Download is paused")
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })

    item.once("done", (_event, state) => {
      if (state === "completed") {
        console.log("Download completed")
        mainWin.webContents.send("download-completed", downloadFileName)
      } else {
        console.log(`Download failed: ${state}`)
        mainWin.webContents.send("download-fail", downloadFileName)
      }
    })
  })
}

export function setDownloadTask(fileName: string, dir: string): void {
  downloadFileName = fileName
  downloadDir = dir
}
