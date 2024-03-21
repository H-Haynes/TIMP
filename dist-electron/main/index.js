"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
process.env.DIST_ELECTRON = node_path.join(__dirname, "..");
process.env.DIST = node_path.join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? node_path.join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
if (node_os.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
let lyricWindow = null;
let downloadFileName;
let downloadDir;
const preload = node_path.join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = node_path.join(process.env.DIST, "index.html");
async function createWindow() {
  win = new electron.BrowserWindow({
    title: "Main window",
    icon: node_path.join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true
    },
    minWidth: 900
    // frame:false,//无边框窗口
    // titleBarStyle: 'hidden' // 隐藏标题栏
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:"))
      electron.shell.openExternal(url2);
    return { action: "deny" };
  });
  {
    import("electron-devtools-installer").then(({ default: installExtension, VUEJS3_DEVTOOLS }) => {
      installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true
        }
      });
    }).then(() => console.log("---------Vue调试工具已加载------------")).catch((e) => console.error("Failed install extension:", e));
  }
  win.on("closed", () => {
    console.log("销毁 2");
    lyricWindow && lyricWindow.destroy();
    lyricWindow = null;
  });
}
const registerDownloadEvent = () => {
  electron.session.defaultSession.on("will-download", (event, item, webContents2) => {
    item.setSavePath(node_path.join(downloadDir, downloadFileName));
    item.on("updated", (event2, state) => {
      if (state === "interrupted") {
        console.log("Download is interrupted but can be resumed");
      } else if (state === "progressing") {
        if (item.isPaused()) {
          console.log("Download is paused");
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });
    item.once("done", (event2, state) => {
      if (state === "completed") {
        console.log("Download completed");
        win.webContents.send("download-completed", downloadFileName);
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });
};
electron.app.whenReady().then(() => {
  createWindow();
  registerDownloadEvent();
});
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin")
    electron.app.quit();
});
electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized())
      win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    win.show();
    win.focus();
  } else {
    createWindow();
  }
});
const openLyric = () => {
  if (lyricWindow) {
    lyricWindow.show();
    return;
  }
  lyricWindow = new electron.BrowserWindow({
    width: 800,
    height: 100,
    // parent: win,
    transparent: true,
    // 透明窗口
    // transparent: false, // 透明窗口
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true
    },
    x: (electron.screen.getPrimaryDisplay().workArea.width - 800) / 2,
    y: electron.screen.getPrimaryDisplay().workArea.height - 100,
    frame: false,
    backgroundColor: "#00000000",
    alwaysOnTop: true
    // 设置为总是置顶
  });
  win.show();
  if (process.env.VITE_DEV_SERVER_URL) {
    lyricWindow.loadURL(`${url}#/lyric`);
    console.log("here", `${url}#/lyric`);
  } else {
    lyricWindow.loadFile(indexHtml, { hash: "#/lyric" });
  }
  lyricWindow.on("close", () => {
    console.log("销毁 1");
    lyricWindow && lyricWindow.destroy();
    lyricWindow = null;
  });
};
electron.ipcMain.on("openLyric", openLyric);
electron.ipcMain.on("closeLyric", () => {
  lyricWindow && lyricWindow.hide();
});
electron.ipcMain.on("lyric", (_, lyric) => {
  console.log(lyric);
  lyricWindow && lyricWindow.webContents.send("lyric", lyric);
});
electron.ipcMain.on("fixed", () => {
  lyricWindow && lyricWindow.setAlwaysOnTop(true);
  lyricWindow && lyricWindow.setMovable(false);
});
electron.ipcMain.on("unfixed", () => {
  lyricWindow && lyricWindow.setAlwaysOnTop(false);
  lyricWindow && lyricWindow.setMovable(true);
});
electron.ipcMain.on("select-folder", async (event, defaultPath) => {
  electron.dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
    defaultPath
  }).then((result) => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.sender.send("select-folder-reply", result.filePaths[0]);
    }
  });
});
electron.ipcMain.on("download-file", (event, { url: url2, fileName, dir }) => {
  downloadFileName = fileName;
  downloadDir = dir;
  win.webContents.downloadURL(url2);
});
//# sourceMappingURL=index.js.map
