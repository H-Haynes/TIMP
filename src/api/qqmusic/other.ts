import { http } from "@/service"

/**
 * @fileoverview 其 他 A P I
 */

/**
 * 获取QQ音乐图片
 * @param params 请求参数
 * @param {string} params.id 专辑或歌单请求的id
 * @param {string} params.size 图片大小，默认300,即300x300
 * @returns
 */
export const getQQImageUrl = (params: { id: string; size?: string }) =>
  http.get<
    Service.RespSingle<{
      url: string
      id: string
      type: string
    }>
  >("/qmusic/image", params)

/**
 * 获取用户cookie
 * @deprecated ⚠️该接口返回结果暂不确定是否正常
 * @returns
 */
export const getQQUserCookie = () => http.get("/qmusic/cookie")

/**
 * 获取首页推荐banner
 * @returns
 */
export const getQQBanner = () => http.get<Service.RespSingle<QQMusic.RecommendRes>>("/qmusic/recommend")

/**
 * 获取评论
 * @deprecated ⚠️该接口返回数据异常
 * @param params 请求参数
 * @param params.id 专辑或歌单请求结果的id
 * @param params.rootcommentid 榜单id
 * @param params.cid 未知
 * @param params.pagesize 每页条数，默认25
 * @param params.pagenum 页码，默认1
 * @param params.cmd 未知
 * @param params.reqtype 未知
 * @param params.biztype 未知
 * @returns
 */
export const getQQComment = (params: {
  id: string
  rootcommentid?: string
  cid?: string
  pagesize?: number
  pagenum?: number
  cmd?: string
  reqtype?: string
  biztype?: string
}) => http.get("/qmusic/comment", params)

/**
 * 获取音乐电台
 * @deprecated ⚠️该接口404
 * @returns
 */
export const getQQRadio = () => http.get("/qmusic/radio")

/**
 * 获取QQ音乐客户端下载地址
 * @returns
 */
export const getQQMusicClientUrl = () =>
  http.get<Service.RespArray<Record<"id" | "name" | "version" | "pic" | "desc" | "link" | "qrcode", string>>>("/qmusic/download")

/**
 * 获取QQ音乐票务信息
 * @deprecated ⚠️该接口数据返回异常
 * @returns
 */
export const getQQTicket = () => http.get("/qmusic/ticket")
