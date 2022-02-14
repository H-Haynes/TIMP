import axios from '/@/api/http';
const prefix = '/kugou';

axios.defaults.headers.common['Accept'] = "application/json, text/plain, */*";

// 获取歌单详情
export const getAlbumDetailKW = (id:string|number) => {
    return axios.get(`${prefix}/kuwo/musicList?pid=${id}`);
};

// 获取歌单分类

export const getCategoryListKG = () => {
    return axios.get(`http://127.0.0.1:7100/kugou/getTagList`); 
};

// 获取推荐歌单
export const getRecommendKG = (page=1) => {
    return axios.get(`http://127.0.0.1:7100/kugou/getAlbumList?&page=${page}`);
};

// 获取歌单列表
export const getAlbumListKG = (id,page = 1) => {
    return axios.get(`http://127.0.0.1:7100/kugou/albumList?tagid=${id}&page=${page}`);
};


// 获取banner

export const getBannerKW = () => {
    return axios.get(`${prefix}/kuwo/banner`);
};

// 获取排行榜单列表

export const getRankListKG = () => {
    return axios.get(`http://127.0.0.1:7100/kugou/rank/list`);
};

// 获取排行榜音乐列表
export const getRankMusicListKG = (id:string|number) => {
    return axios.get(`http://127.0.0.1:7100/rank/info?rankid=${id}`);
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