import { http } from "@/service"
/**
 * @fileoverview 歌 手 A P I
 */

/**
 * 获取歌手列表
 * @param params 请求参数
 * @param {int} params.area 地区， 默认-100 全部: -100 内地: 200 港台: 2 欧美: 5  日本: 4  韩国:3 其他: 6
 * @param {int} params.sex  性别，默认-100 [全部： -100] [男：0] [女：1] [组合：2]
 * @param {int} params.genre 分类，默认-100 [全部: -100] 流行 1 嘻哈: 6, 摇滚: 2, 电子: 4, 民谣: 3, R&B: 8 民歌: 10 轻音乐: 9 爵士: 5 古典: 14 乡村: 25 蓝调: 20
 * @param {int} params.index 索引,默认-100 [热门：-100] [1-26: A-Z] [#: 27]
 * @returns
 */
export const getQQSingerList = (params: { area?: number; sex?: number; genre?: number; index?: number; page?: number }) =>
  http.get("/qmusic/singer", params)

/**
 * 获取歌手详情
 * @deprecated ⚠️该接口已无数据返回
 * @param params 请求参数
 * @param {string} params.singerId 歌手id
 */
export const getQQSingerDetail = (params: { singerId: string }) => http.get(`/qmusic/singer/${params.singerId}/desc`, params)

/**
 * 获取歌手粉丝数量
 * @param params 请求参数
 * @param {string} params.singerId 歌手id
 */
export const getQQSingerFans = (params: { singerId: string }) => http.get<Service.RespNumber>(`/qmusic/singer/${params.singerId}/stars`)

/**
 *获取歌手MV
 * @deprecated ⚠️ 该接口无数据返回
 * @param params 请求参数
 * @param {string}  params.paramsId 歌手id
 * @param {int} limit 每页条数 默认5
 * @param {string} order mv类型 ，默认listen;
 * listen:歌手专辑音乐MV
 * time:粉丝上传MV视频
 */
export const getQQSingerMv = (params: { singerId: string; limit?: number; order?: string }) =>
  http.get(`/qmusic/singer/${params.singerId}/mv`, params)

/**
 * 获取歌手热门歌曲
 * @deprecated ⚠️该接口数据返回异常
 * @param params 请求参数
 * @param {string} params.singerId 歌手id
 * @returns
 */
export const getQQSingerHotSong = (params: { singerId: string }) => http.get(`/qmusic/singer/${params.singerId}/hotsong`)

/**
 * 获取相似歌手
 * @deprecated ⚠️该接口数据返回异常
 * @param params 请求参数
 * @param {string} params.singerId 歌手id
 */
export const getQQSameSinger = (params: { singerId: string }) => http.get(`/qmusic/singer/${params.singerId}/similar`)

/**
 * 获取歌手专辑
 * @param params 请求参数
 * @param {string} params.singerId 歌手ID
 * @param {int} limit 每页条数，默认10
 * @param {int} page 页码，默认1
 *
 */
export const getQQSingerAlbum = (params: { singerId: string; limit?: number; page?: number }) =>
  http.get(`/qmusic/singer/${params.singerId}/album`, params)
