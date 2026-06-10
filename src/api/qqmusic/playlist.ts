import { http } from "@/service"

/**
 * @fileoverview 专辑|歌单|排行榜 A P I
 */

/**
 * 获取QQ音乐专辑详情
 * @param {string} params albumId 专辑id
 */
export const getQQAlbumDetail = (params: { albumId: string }) => http.get<Service.RespSingle<QQMusic.AlbumDetail>>(`/qmusic/album/${params.albumId}`)

/**
 * 获取新碟/新专辑
 * @param params 请求参数
 * @param {int} params.page 页码
 * @param {int} params.limit 每页条数
 * @returns
 */
export const getQQNewAlbum = (params: { page: number; limit: number }) => http.get<Service.RespList<QQMusic.AlbumDetail>>("/qmusic/album/new", params)

/**
 * 获取QQ音乐排行榜单
 * @returns
 */
export const getQQRankList = () => http.get<Service.RespArray<QQMusic.RankInfo>>("/qmusic/rank")

/**
 * 获取QQ音乐排行详情
 * @param params 请求参数
 * @param {int} params.limit 每页条数,默认20,获取榜单歌曲用
 * @param {int} params.page 页码，默认1
 * @returns
 */
export const getQQRankDetail = (params: { limit?: number; page?: number; rankId?: string }) => http.get(`qmusic/rank/${params.rankId}`, params)

/**
 * 获取歌单分类
 * @returns
 */
export const getQQCategory = () => http.get<Service.RespList<QQMusic.Category>>("/qmusic/songlist/categories")

/**
 * 获取QQ音乐歌单
 * @param params 请求参数
 * @param {number} params.page 页码，默认1
 * @param {number} params.limit 每页条数，默认20
 * @param {string} params.categoryId 歌单分类，可从获取分类接口获取，默认10000000(全部)
 * @param {string} params.sortId 排序Id [最新2] [最热3] [评分4] [默认1] 默认值5(未知含义)
 * @returns
 */
export const getQQPlayList = (params: { page?: number; limit?: number; categoryId?: string; sortId?: string }) =>
  http.get<Service.RespList<QQMusic.PlayList>>("/qmusic/songlist", params)

/**
 * 获取歌单详情
 * @param params 请求参数
 * @param {string} params.playlistId 歌单id
 * @returns
 */
export const getQQPlayListDetail = (params: { playlistId: string }) => http.get(`/songlist/${params.playlistId}`)

/**
 * 批量获取多分类下的歌单
 * @param params 请求参数
 * @param {int} params.page 页码
 * @param {int} params.limit 每页条数
 * @param {string} params.sortId 排序方式
 * @param {categoryIds} categoryIds 分类id列表,可从获取分类接口得到
 * @returns 返回二维数组，每个数组是一个类目的歌单列表
 */
export const getQQPlayListByCategories = (params: { page?: number; limit?: number; sortId?: string; categoryIds: string[] }) =>
  http.post<Service.RespArray<QQMusic.PlayList[]>>("/qmusic/songlist/batch", params)
