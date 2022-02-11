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

// 获取轮播数据

export const getBannerWy = () => {
    return axios.get(`${prefix}/banner`);
};

// 获取歌曲详情

export const getSongDetailWy = (id: string|number) => {
    return axios.get(`${prefix}/song/detail?ids=${id}`);
};

// 获取歌单分类

export const getCategoryListWy = () => {
    return axios.get(`${prefix}/playlist/catlist/hot`);
};

// 获取歌单列表

export const getAlbumListWy = (type:string,page = 1) => {
    return axios.get(`${prefix}/top/playlist?cat=${type}&offset=${(page-1) * 50}`);
};

// 获取排行榜单列表

export const getRankListWy = () => {
    return axios.get(`${prefix}/toplist`);
};