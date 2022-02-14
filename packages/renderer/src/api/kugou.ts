import axios from '/@/api/http';
const prefix = '/kuwo';

axios.defaults.headers.common['Accept'] = "application/json, text/plain, */*";

// 获取歌单详情
export const getAlbumDetailKG = (id:string|number) => {
    return axios.get(`${prefix}/kugou/albumInfo?albumId=${id}`);
};

// 获取歌单分类

export const getCategoryListKG = () => {
    return axios.get(`${prefix}/kugou/getTagList`); 
};

// 获取推荐歌单
export const getRecommendKG = (page=1) => {
    return axios.get(`${prefix}/kugou/getAlbumList?&page=${page}`);
};

// 获取歌单列表
export const getAlbumListKG = (id,page = 1) => {
    return axios.get(`${prefix}/kugou/albumList?tagid=${id}&page=${page}`);
};


// 获取banner

export const getBannerKW = () => {
    return axios.get(`${prefix}/kuwo/banner`);
};

// 获取排行榜单列表

export const getRankListKG = () => {
    return axios.get(`${prefix}/kugou/rank/list`);
};

// 获取排行榜音乐列表
export const getRankMusicListKG = (id:string|number) => {
    return axios.get(`${prefix}/kugou/rank/info?rankid=${id}`);
};



// 获取音乐地址
export const getMusicUrlKW = (id:string|number,format='mp3') => {
    return axios.get(`${prefix}/kuwo/musicUrl?mid=${id}&format=${format}`);
};

// 获取音乐信息

export const getSongDetailKG = (id:string|number) => {
    return axios.get(`${prefix}/kugou/playInfo?id=${id}`);
};

// 搜索
export const searchKG = (keyword:string,page=1) => {
    return axios.get(`${prefix}/kugou/search?keywords=${keyword}&page=${page}`);
};

// 获取mv数据

export const getMvDataKG = (id) => {
    return axios.get(`${prefix}/kugou/mvInfo?id=${id}`);
};

