import { http } from "@/service"

/**
 * @fileoverview 歌 曲 A P I
 */

/**
 * 获取歌曲播放地址
 * @param params 请求参数
 * @param {string} params.songId 歌曲ID
 * @param {string} quality 品质，m4a/128/320/ape/flac,默认128
 * @param {string} mediaId 暂不确定
 * @returns
 */
export const getQQSongUrl = (params: { songId: string; quality?: string; mediaId?: string }) =>
  http.get<
    Service.RespSingle<{
      playUrl: {
        [key: string]: {
          // key是歌曲的id
          url: string
          error: boolean
        }
      }
    }>
  >(`/qmusic/song/${params.songId}/play`, params)

/**
 * 获取歌曲歌词
 * @param params 请求参数
 * @param {number} params.isFormat 是否格式化
 * @param {number} params.songId 歌曲id
 * @returns
 */
export const getQQLyric = (params: { isFormat?: number; songId: string }) =>
  http.get<
    Service.RespSingle<{
      retcode: number
      code: number
      subcode: number
      lyric: string
      trans: string
    }>
  >(`/qmusic/lyric/${params.songId}`, params)

/**
 * 获取歌曲详细信息
 * @param params 请求参数
 * @param {string} params.songId 歌曲ID
 * @returns
 */
export const getQQSongDetail = (params: { songId: string }) => http.get<Service.RespSingle<QQMusic.Song>>(`/qmusic/song/${params.songId}`, params)

/**
 * 批量获取歌曲信息
 * @param params 请求参数
 * @param params.songs 二维数组[songId,id]
 * @returns
 */
export const batchGetQQSong = (params: { songs: string[][] }) => http.post<Service.RespArray<QQMusic.Song>>("/qmusic/song/batch", params)
