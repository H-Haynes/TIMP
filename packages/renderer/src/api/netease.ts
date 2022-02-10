import axios from '/@/api/http';
const prefix = '/wy';

// 获取网易推荐歌单
export const getRecommendWy = () => {
    return axios.get(`${prefix}/personalized`);
};

// 获取歌单详情
export const getAlbumDetailWy = (id: string) => {
    return axios.get(`${prefix}/playlist/detail?id=${id}`);
};

// 获取播放地址
export const getSongUrlWy = (id: string|number) => {
    return axios.get(`${prefix}/song/url?id=${id}`);
};