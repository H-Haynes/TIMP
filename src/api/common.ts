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


export const downloadSong = (params: any, fileName: string) => http.download('/timp/download', fileName, params, { method: 'get' })

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

/**
 * 音乐可播放性检查
 * @param ids 歌曲 id列表
 * @param platform 平台信息
 */
export const checkMusicCanPlay = (params: {
  ids: string[] | number[]
  platform: EPlatform
}) => http.post('/timp/music/canPlay', params)

/**
 * 搜索
 * @param keyword 关键字
 */
export const getSearch = (params: {
  keyword: string
}) => http.get('/timp/search', params)

/**
 * 查询搜索建议
 * @returns
 */
export const getSearchSuggest = () => http.get('/timp/search/suggest')


/**
 * 获取歌曲详情
 * @param id 歌曲 id
 * @param platform 平台信息
 */
export const getSongDetail = (params: {
  id: string
  platform: EPlatform
}) => http.get('/timp/song/detail', params)


/**
 * 下载歌词
 * @param id 歌曲id
 * @param platform 平台信息
 */
export const downloadLyric = (params: {
  id: string
  platform: EPlatform
}) => http.get('/timp/download/lyric', params)
