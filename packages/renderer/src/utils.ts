// 新建歌单
export const createAlbum = (name) =>{
    const album = {
        id: Math.random().toString(36).substr(2),
        name,
        description:'',
        subscribedCount:1,
        trackCount:0,
        coverImg:'',
        createdTime:Date.now(),
        updateTime:Date.now(),
        creator:{
            avatar:'',
            desc:'用户自建歌单',
            nickname:'我',
        },
        songList:[],
    };
    localStorage.setItem(album.id,JSON.stringify(album));
    return album;
};

// 检测歌单是否已存在



