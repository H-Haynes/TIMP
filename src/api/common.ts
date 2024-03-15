import { EPlatform } from '@/enum'
import { http } from '@/service'

export const getBanner = (params?: any) => http.get('/timp/banner', params)

export const getRankList = (params?: any) => http.get('/timp/rank', params)

export const getPlaylistDetail = (params?: any) => http.get('/timp/playlist/detail', params)

export const getSongPlayUrl = (params: {
  id: string | number
  platform: EPlatform
}) => http.get('/timp/song/url', params)

/**
 * 查询歌词
 * @param {string} params.id 歌曲 id
 * @param {number} params.platform 平台信息
 */
export const getMusicLyric = (params: {
  id: string | number
  platform: EPlatform
}) => http.get('/timp/lyric', params)


export const downloadSong = (params: any, fileName: string) => http.download('/timp/download', fileName, params, { method: 'post' })

/**
 * 音乐地址代理
 * @param url 音乐原地址
 */
export const proxyMusic = (params: {
  url: string
}) => http.get('/timp/proxy', params)

// export const downloadFile = (params: {
//   url: string
// }) => http.post('/timp/download', params)
