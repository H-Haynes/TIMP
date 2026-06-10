import { http } from "@/service"

/**
 * @fileoverview 搜 索 A P I
 */

/**
 * 搜索
 * @param params 请求参数(目前看仅支持歌曲or混合搜索)
 * @param {string} params.keyword 搜索关键词
 * @param {number} limit 每页条数
 * @param {number} page 页码
 * @param {string} catZhida 含义不明
 * @param {string} remotePlace 搜索类型 {@link QQMusic.RemotePlace}
 * @returns
 */
export const qqSearch = (params: { keyword: string; limit?: number; page?: number; catZhida?: string; remotePlace?: QQMusic.RemotePlace }) =>
  http.get<Service.RespArray<QQMusic.SearchItem>>("/qmusic/search", params)

/**
 * 获取智能推荐
 * @param params 请求参数
 * @param params.keyword 搜索关键词
 * @returns
 */
export const getSmartRecommend = (params: { keyword: string }) =>
  http.get<Service.RespSingle<QQMusic.SearchSmartBoxRes>>("/qmusic/search/smartbox", params)

/**
 * 根据类型搜索
 * @param params 请求参数
 * @param {string} params.keyword 搜素关键词
 * @param {int} params.search_type 搜索类型 0单曲 1歌手 2专辑 3歌单 4MV 8用户
 * @param {QQMusic.RemotePlace} 搜索类型 {@link QQMusic.RemotePlace}
 * @returns
 */
export const qqSearchByType = (params: { keyword: string; search_type?: number; remotePlace?: QQMusic.RemotePlace }) =>
  http.get<Service.RespArray<QQMusic.SearchItem>>("/qmusic/search/bytype", params)

/**
 * 获取热门搜索关键词
 * @returns
 */
export const getHotKey = () => http.get<Service.RespArray<{ hot: number; key: string }>>("/qmusic/search/hotkey")
