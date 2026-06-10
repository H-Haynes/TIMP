import type { EPlatform } from "@/enum"

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAlbum {}
