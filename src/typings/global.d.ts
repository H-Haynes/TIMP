
interface Window {
  $loadingBar?: import('element-plus').LoadingBarProviderInst;
  $dialog?: import('element-plus').DialogProviderInst;
  $message?: import('element-plus').MessageProviderInst;
  $notification?: import('element-plus').NotificationProviderInst;
  ElMessage?: import('element-plus').ElMessage;
  ElLoading?: import('element-plus').ElLoading
  electron: {
    receive: import('electron').IpcRenderer.on
    send: import('electron').IpcRenderer.send
  }
}

declare global {
  interface ElMessage {
    [key: string]: any
  }
  interface ElLoading {
    service: () => void
  }
}

/** 通用类型 */
declare namespace Common {
  /* 策略模式 [状态, 为true时执行的回调函数] */
  type StrategyAction = [boolean, () => void];
}

/** 构建时间 */
declare const PROJECT_BUILD_TIME: string

type anyObj = { [key: string]: any }


