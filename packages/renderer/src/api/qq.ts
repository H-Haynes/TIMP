import axios from '/@/api/http';
const prefix = '/qq';

// 获取首页推荐
export const  getRecommendQQ = () =>{
    return axios.get(`${prefix}/getRecommend`);
};

// 获取歌单详情
export const getAlbumDetailQQ = (id:string) => {
    return axios.get(`${prefix}//getSongListDetail?disstid=${id}`);
};

// 获取播放地址

export const getSongUrlQQ = (id:string|number) => {
    return axios.get(`${prefix}/getMusicPlay?songmid=${id}`);
};

// 获取歌曲信息

export const getSongInfoQQ = (id:string|number) => {
    return axios.get(`${prefix}/getSongInfo?songmid=${id}`);
};

// 获取歌曲+专辑+图片

export const getSongPicQQ = (id:string|number) => {
    return axios.get(`${prefix}/getImageUrl?id=${id}`);
};

// 获取歌单分类

export const getCategoryListQQ = () => {
    return axios.get(`${prefix}/getSongListCategories`);
};

// 获取歌单列表

export const getAlbumListQQ = (type:number,page = 1) => {
    return axios.get(`${prefix}/getSongLists?categoryId=${type}&page=${page}`);
};

// 获取排行榜列表

export const getRankListQQ = () => {
    return axios.get(`${prefix}/getTopLists?limit=50`);
};

// 获取排行榜详情

export const getRankDetailQQ = (id:number) => {
    return axios.get(`${prefix}/getRanks?topId=${id}&limit=100`);
};

// 搜索
export const searchQQ = (keyword:string) => {
    return axios.get(`${prefix}/getSmartbox?key=${keyword}&limit=30`);
};

// 获取电台列表

export const getRadioListQQ = () => {
    return axios.get(`${prefix}/getRadioLists`);
};

// 获取mv列表

export const getMvQQ = (page=1) => {
    return axios.get(`${prefix}/getMv?page=${page}&area_id=16&limit=30&version_id=7`);
};

// 获取mv数据
export const getMvDataQQ = (id:number|string) => {
    return axios.get(`${prefix}/getMvPlay?vid=${id}`);
};