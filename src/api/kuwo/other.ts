import { http } from "@/service"

/**
 * 获取首页Banner
 * @returns
 */
export const getKuwoBanner = () => http.get<Service.RespArray<Kuwo.Banner>>("/kuwo/banner")

/**
 * 获取电台
 * @returns
 */
export const getKuwoRadio = () => http.get<Service.RespArray<Kuwo.Radio>>("/kuwo/radio")

/**
 * 获取评论
 * @deprecated ⚠️该接口返回异常
 * @param {object} params 请求参数
 * @param params.sid 目标id
 * @param params.digest 分类,默认15; 15-歌曲 2-排行榜  7-mv评论  8-歌单评论
 * @param params.page 页码 默认1
 * @param params.rows 每页条数，默认20
 * @param params.type 评论类型,默认 get_rec_comment; get_rec_comment-热门评论  get_comment-最新评论
 * @returns
 */
export const getKuwoComment = (params: { sid: string; digest?: number; page?: number; rows?: number; type?: "get_rec_comment" | "get_comment" }) =>
  http.get("/kuwo/comment", params)

/**
 * 获取MV播放地址
 * @deprecated ⚠️该接口返回异常
 * @param {object} params 请求参数
 * @param {string} params.vid mvid
 */
export const gteKuwoMvUrl = (params: { vid: string }) => http.get("/kuwo/mv/url", params)
