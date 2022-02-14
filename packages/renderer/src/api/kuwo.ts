
import axios from '/@/api/http';
const prefix = '/kuwo';

axios.defaults.headers.common['Accept'] = "application/json, text/plain, */*";

// 获取歌单详情
export const getAlbumDetailKW = (id:string|number) => {
    return axios.get(`${prefix}/kuwo/musicList?pid=${id}`);
};

// 获取歌单分类

export const getCategoryListKW = () => {
    return axios.get(`${prefix}/kuwo/getTagList`); 
};

// 获取推荐歌单
export const getRecommendKW = () => {
    return axios.get(`${prefix}/kuwo/rec_gedan?pn=30`);
};

// 获取歌单列表
export const getAlbumListKW = (id:string|number,page = 1) => {
    return axios.get(`${prefix}/kuwo/playList/getTagPlayList?id=${id}&pn=${page}`);
};

// 获取banner

export const getBannerKW = () => {
    return axios.get(`${prefix}/kuwo/banner`);
};

// 获取排行榜单列表

export const getRankListKW = () => {
    return axios.get(`${prefix}/kuwo/rank`);
};

// 获取排行榜音乐列表
export const getRankMusicListKW = (id:string|number) => {
    return axios.get(`${prefix}/kuwo/rank/musicList?bangId=${id}&rn=100`);
};

// 获取播放地址

export const getUrlKW = (id:string|number,type='music') => {
    return axios.get(`${prefix}/kuwo/url?mid=${id}&type=${type}`);
};

// 获取音乐地址
export const getMusicUrlKW = (id:string|number,format='mp3') => {
    return axios.get(`${prefix}/kuwo/musicUrl?mid=${id}&format=${format}`);
};

// 获取音乐信息

export const getSongDetailKW = (id:string|number) => {
    return axios.get(`${prefix}/kuwo/musicInfo?mid=${id}`);
};

// 搜索

export const searchKW = (keyword:string) => {
    return axios.get(`${prefix}/kuwo/search/searchMusicBykeyWord?key=${keyword}`);
};