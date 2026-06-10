import type { ISong } from "./song"
import type { EPlatform } from "./enums"

/** 歌单/榜单条目 */
export interface IRank {
  id: string | number
  name: string
  pic: string
  platform: EPlatform
  relationId?: string
  isRank: number
  updateTime?: string
}

/** 歌单详情（含歌曲列表） */
export interface IPlaylistDetail extends IRank {
  creator?: {
    avatar: string
    description?: string
    nickname: string
    signature?: string
    specialIdentify?: string
  }
  songList: ISong[]
  description?: string
  createTime?: string
}

/** Banner */
export interface IBanner {
  id: string | number
  pic: string
  platform: EPlatform
  url?: string
}
