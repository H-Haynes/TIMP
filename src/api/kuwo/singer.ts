import { http } from "@/service"

const singerCategory = ["全部", "华语男", "华语女", "华语组合", "日韩男", "日韩女", "日韩组合", "欧美男", "欧美女", "欧美组合", "其他"] as const

type ArrayIndex<T extends readonly unknown[]> = {
  [K in keyof T]: K extends `${infer N extends number}` ? N : never
}[keyof T]

type SingerParam = {
  singerId: string
  pageSize?: number
  pageNum?: number
}

/**
 * 获取歌手列表
 * @param {object} params 请求参数
 * @param {number} params.category 分类，默认0
 * 0-全部 1-华语男 2-华语女 3-华语组合 4-日韩男 5-日韩女 6-日韩组合 7-欧美男 8-欧美女 9-欧美组合 10-其他
 * @param {number} params.pageNum 页码默认1
 * @param {number} params.pageSize 每页条数，默认20
 * @param {string} params.prefix 未知
 * @returns
 */
export const getKuwoSingerList = (params: { category: ArrayIndex<typeof singerCategory>; pageNum?: number; pageSize?: number; prefix?: string }) =>
  http.get<Service.RespList<Kuwo.Singer>>(`/kuwo/singer/list`, params)

/**
 * 获取歌手MV列表
 * @param {object} params 请求参数
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @param {string} params.singerId 歌手Id
 * @returns
 */
export const getKuwoSingerMv = (params: SingerParam) => http.get<Service.RespList<Kuwo.Mv>>(`/kuwo/singer/${params.singerId}/mvs`, params)

/**
 * 获取歌手歌曲列表
 * @param {object} params 请求参数
 * @param {string} params.singerId 歌手Id
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const getKuwoSingerSongs = (params: SingerParam) => http.get<Service.RespList<Kuwo.Song>>(`/kuwo/singer/${params.singerId}/songs`, params)

/**
 * 获取歌手专辑列表
 * @param {object} params 请求参数
 * @param {string} params.singerId 歌手Id
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 */
export const getKuwoSingerAlbums = (params: SingerParam) => http.get<Service.RespList<Kuwo.Album>>(`/kuwo/singer/${params.singerId}/albums`, params)

/**
 * 获取推荐歌手
 * @param {object} params 请求参数
 * @param {string} params.category 分类，默认1，0-全部 1-华语男 2-华语女 3-华语组合 4-日韩男 5-日韩女 6-日韩组合 7-欧美男 8-欧美女 9-欧美组合 10-其他
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const getKuwoRecommendSinger = (
  params: Base.Page & {
    category: ArrayIndex<typeof singerCategory>
  }
) => http.get<Service.RespList<Kuwo.Singer>>("/kuwo/singer/recommend", params)
