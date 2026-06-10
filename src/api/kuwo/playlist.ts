import { http } from "@/service"

/**
 * 获取歌单列表
 * @param {object} params 请求参数
 * @param {string} params.order 排序方式 默认new,支持hot/new
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const getKuwoPlayList = (
  params: Base.Page & {
    order?: "new" | "hot"
  }
) => http.get<Service.RespList<Kuwo.PlayList>>("/kuwo/playlist/default", params)

/**
 * 根据标签获取歌单
 * @param {object} params 请求参数
 * @param {string} params.tagId 标签id
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const getKuwoPlayListByTag = (
  params: Base.Page & {
    tagId: string
  }
) => http.get<Service.RespList<Kuwo.PlayList>>(`/kuwo/playlist/byTag`, params)

/**
 * 获取歌单标签列表
 * @returns
 */
export const getKuwoPlayListTags = () => http.get<Service.RespArray<Kuwo.MainTag>>("/kuwo/playlist/tags")

/**
 * 获取歌单详情-带歌曲列表
 * @param {object} params 请求参数
 * @param {string} params.playlistId 歌单Id
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 */
export const getKuwoPlayListTracks = (
  params: Base.Page & {
    playlistId: string
  }
) => http.get<Service.RespSingle<Kuwo.PlayListTrack>>(`/kuwo/playlist/${params.playlistId}/tracks`, params)

/**
 * 获取推荐歌单
 * @param {object} params 请求参数
 * @param {string} params.type 类型,默认'rec',可能是最新最热之类
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const getKuwoRecommendPlayList = (
  params: Base.Page & {
    type: string
  }
) => http.get<Service.RespList<Kuwo.PlayListTrack>>("/kuwo/playlist/recommend", params)

/**
 * 获取专辑详情
 * @param {object} params 请求参数
 * @param {string} params.albumId 专辑Id
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const getKuwoAlbumById = (params: Base.Page & { albumId: string }) =>
  http.get<Service.RespSingle<Kuwo.AlbumDetail>>("/kuwo/album/:albumId", params)

/**
 * 获取排行榜
 */
export const getKuwoRankList = () =>
  http.get<
    Service.RespArray<{
      name: string
      list: Kuwo.Rank[]
    }>
  >("/kuwo/rank/list")

/**
 * 获取排行榜歌曲
 * @param {object} params 请求参数
 * @param {string} params.rankId 排行榜ID
 * @param {int} params.pageNum 页码，默认1
 * @param {int} params.pageSize 每页条数，默认20
 * @returns
 */
export const getKuwoRangeSongs = (
  params: Base.Page & {
    rankId: number
  }
) =>
  http.get<
    Service.RespSingle<{
      img: string
      num: string
      pub: string
      musicList: Kuwo.Song[]
    }>
  >(`/kuwo/rank/${params.rankId}/songs`, params)

/**
 * 获取推荐排行榜
 */
export const getKuwoRecommendRank = () => http.get<Service.RespArray<Kuwo.RecommendRank>>("/kuwo/rank/recommend")
