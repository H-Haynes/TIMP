import type { EPlatform } from "@/types/enums"

export interface IArtist {
  id: string | number
  name: string
  specialIdentify?: string
}

export interface ISong {
  platform: EPlatform
  name: string
  publishTime?: string
  id: string
  duration: number
  album?: {
    id: string | number
    name: string
    pic: string
  }
  artists: IArtist[]
  alias?: string[]
  url?: string
  timestamp?: number
  video?: string
}

/** 歌词条目 */
export interface ILyricItem {
  time: number
  words: string
}

export interface IAlbum {
  id: string | number
  name: string
  pic?: string
  platform: EPlatform
  relationId?: string
  description?: string
  createTime?: string
  updateTime?: string
  isRank?: boolean
  songList?: ISong[]
}
