import { EPlatform } from '@/enum'
import { http } from '@/service'


export interface IVideo {
  id: number
  name: string
  pic: string
  relationId: string
  platform: EPlatform
  playCount: number
  createTime?: string,
  artists?: {
    id: number
    name: string
  }[]
}

/**
 * 获取视频列表
 * @param pageNum 页码 默认 1
 * @param pageSize 每页数量 默认 50
 */
export const getVideoList = (params: {
  pageNum?: number
  pageSize?: number
}): Promise<{ data: IVideo[] }> => http.get('/timp/video/list', params) as any

/**
 * 获取视频详情
 * @param id 视频id
 * @param platform 平台
 */
export const getVideoDetail = (params: {
  id: string
  platform: EPlatform
}) => http.get('/timp/video/detail', params)
