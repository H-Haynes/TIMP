import { http } from "@/service"

/**
 * 获取播放地址[歌曲/mv]
 * @param {object} params 请求参数
 * @param {string} params.songId 歌曲或mv的id
 * @param {string } type 类型，默认'music',支持'music'|'mv'
 * @param {string} br 码率 默认‘128kmp3’
 * @returns
 */
export const getKuwoPlayUrl = (params: { songId: string; type?: "music" | "mv"; br: string }) =>
  http.get<Service.RespString>(`/kuwo/song/${params.songId}/url`, params)

/**
 * 获取歌曲详情 *
 * @param {object} params 请求参数
 * @param {string} params.songId 歌曲或mv的id
 */
export const getKuwoSongDetail = (params: { songId: string }) => http.get<Service.RespSingle<Kuwo.Song>>(`/kuwo/song/${params.songId}/detail`)

/**
 * 获取歌词
 * @param {object} params 请求参数
 * @param {string} params.songId 歌曲的id
 */
export const getKuwoSongLyric = (params: { songId: string }) =>
  http.get<
    Service.RespArray<{
      time: string // 秒
      lineLyric: string
    }>
  >(`/kuwo/song/${params.songId}/lyric`)
