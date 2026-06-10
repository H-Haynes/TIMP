import type { ISong } from "./song"

/** EventBus 事件类型映射 */
export interface AppEvents {
  /** 播放指定歌曲 */
  playSong: ISong
  /** 音频元素就绪（用于频谱可视化） */
  audioPlay: HTMLAudioElement
}
