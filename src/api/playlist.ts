import { http } from '@/service'

export const getRecommendPlaylist = (params: {
  pageNum?: number
  pageSize?: number
}) => http.get('/timp/playlist/recommend', params)
