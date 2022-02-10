import axios from '/@/api/http';
const prefix = '/qq';

// 获取首页推荐
export const  getRecommendQQ = () =>{
    return axios.get(`${prefix}/getRecommend`);
};
