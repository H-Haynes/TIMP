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
const os = require("node:os");
const node_path = require("node:path");
const truncateString = (str, length) => {
  let result = "";
  let byteLength = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (byteLength >= length) {
      break;
    }
    result += char;
    byteLength += encodeURIComponent(char).length > 1 ? 2 : 1;
  }
  while (byteLength < length) {
    result = " " + result;
    byteLength++;
  }
  return result;
};
const registerKeyboardEvent = (window) => {
  electron.globalShortcut.register("MediaPreviousTrack", () => {
    window.webContents.send("media-previous-track");
  });
  electron.globalShortcut.register("MediaNextTrack", () => {
    window.webContents.send("media-next-track");
  });
  electron.globalShortcut.register("MediaPlayPause", () => {
    window.webContents.send("media-play-pause");
  });
  electron.globalShortcut.register("MediaStop", () => {
    window.webContents.send("media-stop");
  });
};
const loadDevtools = (window) => {
  const vueDevToolsPath = node_path.join(
    os.homedir(),
    "/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.6.1_0"
  );
  import("electron-devtools-installer").then(({ default: installExtension, VUEJS3_DEVTOOLS }) => {
    installExtension(VUEJS3_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true
      }
    });
  }).then(() => console.log("---------Vue调试工具已加载------------")).catch((e) => console.error("Failed install extension:", e));
  window.webContents.session.loadExtension(vueDevToolsPath);
};
process.env.DIST_ELECTRON = node_path.join(__dirname, "..");
process.env.DIST = node_path.join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? node_path.join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
if (os.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
let lyricWindow = null;
let miniLyricWindow = null;
let downloadFileName;
let downloadDir;
let tray;
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
    loadDevtools(win);
  }
  win.on("closed", () => {
    lyricWindow && lyricWindow.destroy();
    lyricWindow = null;
    miniLyricWindow && miniLyricWindow.destroy();
    miniLyricWindow = null;
    tray == null ? void 0 : tray.destroy();
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
        win.webContents.send("download-fail", downloadFileName);
      }
    });
  });
};
electron.app.whenReady().then(async () => {
  await createWindow();
  await registerDownloadEvent();
  await registerKeyboardEvent(win);
  const templateFile = node_path.resolve(__dirname, "../../public/timp_32x32@2x.png");
  const trayIcon = electron.nativeImage.createFromPath(templateFile);
  tray = new electron.Tray(trayIcon);
  tray.setTitle("TIMP音乐，随心而行");
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
electron.app.on("will-quit", () => {
  electron.globalShortcut.unregisterAll();
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
const openMiniLyric = () => {
  if (miniLyricWindow) {
    miniLyricWindow.show();
    win.hide();
    lyricWindow.hide();
    setTimeout(() => {
      win.webContents.send("need-send-lyric");
    }, 1e3);
    return;
  }
  miniLyricWindow = new electron.BrowserWindow({
    width: 350,
    height: 700,
    transparent: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true
    },
    x: electron.screen.getPrimaryDisplay().workAreaSize.width - 390,
    // 距离右边40px
    y: electron.screen.getPrimaryDisplay().workAreaSize.height - 700 - 150,
    frame: false,
    backgroundColor: "#0000000",
    alwaysOnTop: true
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    miniLyricWindow.loadURL(`${url}#/fixLyric`);
    console.log("here", `${url}#/fixLyric`);
  } else {
    miniLyricWindow.loadFile(indexHtml, { hash: "#/fixLyric" });
  }
  miniLyricWindow.on("close", () => {
    miniLyricWindow && miniLyricWindow.destroy();
    miniLyricWindow = null;
  });
  win.hide();
  lyricWindow.hide();
  setTimeout(() => {
    win.webContents.send("need-send-lyric");
  }, 1e3);
};
electron.ipcMain.on("openLyric", openLyric);
electron.ipcMain.on("closeLyric", () => {
  if (lyricWindow) {
    lyricWindow.hide();
    lyricWindow.destroy();
    lyricWindow = null;
  }
});
electron.ipcMain.on("lyric", (_, lyric) => {
  if (lyric) {
    tray == null ? void 0 : tray.setTitle(truncateString(lyric, 16));
  }
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
  console.log("开始下载", url2);
  win.webContents.downloadURL(url2);
});
electron.ipcMain.on("open-mini-lyric", (event) => {
  openMiniLyric();
});
electron.ipcMain.on("close-mini-lyric", () => {
  if (miniLyricWindow) {
    miniLyricWindow.hide();
    miniLyricWindow.destroy();
    miniLyricWindow = null;
  }
});
electron.ipcMain.on("update-currentTime", (_, time) => {
  miniLyricWindow && miniLyricWindow.webContents.send("update-currentTime", time);
});
electron.ipcMain.on("update-lyric", (_, lyric) => {
  miniLyricWindow && miniLyricWindow.webContents.send("update-lyric", lyric);
});
electron.ipcMain.on("update-playInfo", (_, playInfo) => {
  miniLyricWindow && miniLyricWindow.webContents.send("update-playInfo", playInfo);
});
electron.ipcMain.on("mini-lyric-back", () => {
  if (miniLyricWindow) {
    miniLyricWindow.destroy();
    miniLyricWindow = null;
  }
  win.show();
  lyricWindow && lyricWindow.show();
});
//# sourceMappingURL=index.js.map
