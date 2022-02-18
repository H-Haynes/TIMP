import {BrowserWindow,ipcMain,screen } from 'electron';
import {join} from 'path';
import {URL} from 'url';

async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    webPreferences: {
      nativeWindowOpen: true,
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      // nodeIntegration: true,
      // contextIsolation: false,
    },
    minWidth:900,
    // frame: false, //无边框窗口
    titleBarStyle: 'hidden', // 隐藏标题栏
  });

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */

  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl = import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();


  await browserWindow.loadURL(pageUrl);
  // browserWindow.webContents.openDevTools();

  let lyricWindow:null|BrowserWindow = null;
  const  openLyric = () => {

    if(lyricWindow){
      // 显示
      lyricWindow.show();
      return;
    }

    lyricWindow = new BrowserWindow({
      width:800,
      height:100,
      // parent: browserWindow,
      transparent:true,
      webPreferences: {
        preload: join(__dirname, '../../preload/dist/index.cjs'),
        nodeIntegration: true,
        contextIsolation:true,
      },
      x:(screen.getPrimaryDisplay().workArea.width-800) /2,
      y:screen.getPrimaryDisplay().workArea.height-100,
      frame:false,
      backgroundColor:'#00000000',
    });
    browserWindow.show(); // 不让焦点在子窗口
    lyricWindow.loadURL(pageUrl + '#/lyric');
    lyricWindow.on('close',()=>{
      lyricWindow && lyricWindow.destroy();
      lyricWindow = null;
    });
    
  };

  ipcMain.on('openLyric', () => openLyric());
  ipcMain.on('closeLyric', () => {
    // lyricWindow && lyricWindow.close();
    // 隐藏窗口
    lyricWindow && lyricWindow.hide();
  });

  ipcMain.on('lyric',(e,lyric) => {
    // 监听到歌词信息，通过事件传出去
    console.log(lyric);
    lyricWindow && lyricWindow.webContents.send('lyric',lyric);

  });

  ipcMain.on('fixed',() => {
    lyricWindow && lyricWindow.setAlwaysOnTop(true);
    lyricWindow && lyricWindow.setMovable(false);
  });

  ipcMain.on('unfixed',() => {
    lyricWindow && lyricWindow.setAlwaysOnTop(false);
    lyricWindow && lyricWindow.setMovable(true);
  });

  browserWindow.on('closed', () => {
    // 销毁歌词窗口
    lyricWindow && lyricWindow.destroy();
    lyricWindow = null;
  });

  return browserWindow;
}

/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
