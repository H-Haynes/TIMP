import { http } from "@/service"

/**
 * @fileoverview MV|视频 A P I
 */

/**
 * 获取MV列表
 * @deprecated ⚠️该接口无数据返回
 */
export const getMvList = () => http.get("/qmusic/mv")

/**
 * 获取MV/视频详情
 * @deprecated ⚠️该接口数据返回异常
 * @param params 请求参数
 * @param params.vid 视频/MV ID
 */
export const getMvDetail = (params: { vid: string }) => http.get(`/qmusic/mv/${params.vid}/play`)

/**
 * 获取MV标签
 * @deprecated ⚠️ 该接口数据返回异常
 */
export const getMvTagList = () => http.get("/qmusic/mv/tag")
