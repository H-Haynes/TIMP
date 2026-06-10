import { http } from "@/service"

type SearchParam = Base.Page & {
  keyword: string
}
/**
 * 获取联想关键词
 * @param {object} params 请求参数
 * @param {string} params.keyword 搜索关键词
 * @returns
 */
export const getKuwoRelationKeyword = (params: { keyword: string }) =>
  http.get<
    Service.RespArray<{
      RELWORD: string
      SNUM: string
      RNUM: string
      TYPE: string
    }>
  >("/kuwo/search", params)

/**
 * 搜索歌手
 * @param {object} params 请求参数
 * @param {string} params.keyword 搜索关键词
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const searchKuwoSinger = (params: SearchParam) => http.get<Service.RespList<Kuwo.Singer>>("/kuwo/search/singer", params)

/**
 * 快速搜索歌曲 和搜索歌曲返回一致
 * @param {object} params 请求参数
 * @param {string} params.keyword 搜索关键词
 */
export const searchKuwoQuick = (params: { keyword: string }) => http.get<Service.RespList<Kuwo.Song>>("/kuwo/search/quick", params)

/**
 * 搜索歌曲
 * @param {object} params 请求参数
 * @param {string} params.keyword 搜索关键词
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const searchKuwoSong = (params: SearchParam) => http.get<Service.RespList<Kuwo.Song>>("/kuwo/search/song", params)

/**
 * 搜索专辑
 * @param {object} params 请求参数
 * @param {string} params.keyword 搜索关键词
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const searchKuwoAlbum = (params: SearchParam) => http.get<Service.RespList<Kuwo.Album>>("/kuwo/search/album", params)

/**
 * 搜索MV
 * @param {object} params 请求参数
 * @param {string} params.keyword 搜索关键词
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 */
export const searchKuwoMv = (params: SearchParam) => http.get<Service.RespList<Kuwo.Mv>>("/kuwo/search/mv", params)

/**
 * 搜索歌单
 * @param {object} params 请求参数
 * @param {string} params.keyword 搜索关键词
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 */
export const searchKuwoPlaylist = (params: SearchParam) => http.get<Service.RespList<Kuwo.BasePalyList>>("/kuwo/search/playlist", params)
