declare namespace QQMusic {
  type RemotePlace = "album" | "song" | "mv" | "singer" | "user" | "zhida" | "grp"
  type Action = Record<"alert" | "icon2" | "icons" | "msgdown" | "msgfav" | "msgid" | "msgpay" | "msgsahre" | "switch" | "switch2", number>
  type Album = Record<"id" | "mid" | "name" | "pmid" | "subtitle" | "time_public" | "title", string>
  type Volume = Record<"gain" | "lra" | "peak", number>

  interface Singer {
    id: number
    mid: string
    name: string
    title: string
    type: number
    uin: number
  }

  interface AlbumCompany {
    id: number
    name: string
    ex: {
      desc: string
      company_photo: number
    }
  }

  interface AlbumDetail {
    id: number
    mid: string
    name: string
    trans_name: string
    singers: SingerDetail[]
    type: number
    language: number
    genre: number
    area: number
    movie: string
    release_time: string
    company: AlbumCompany
    status: number
    index: string
    tag: string
    pay: Pay
    ex: Ex
    photo: {
      gaus_pic: string
      has_photo: number
      pic_mid: string
      vip_flag: number
      pay_flag: number
      version: number
      primecolor: number
      magic_class: number
      magic_color: number
      src_w: number
      src_h: number
    }
    tmetags: string
    ex_status: number
    show_com_new: number
    companyshow: AlbumCompany
    modify_time: string
    str_genre: string
    album_right: number
    fpay_control: number
    cd_album_id: string
    mini_album_id: string
    album_wiki: string
    album_ori_name: string
    singers_with_anonymous: unknown[]
    other_name: string
    mv_ids: string
    vids: string
    head_magic_color: string
  }

  interface SingerDetail {
    id: number
    mid: string
    name: string
    foreign_name: string
    type: number
    genre: number
    area: number
    company: AlbumCompany
    grade: number
    origin: number
    enter: number
    country: number
    identity: number
    birthday: string
    instrument: number
    ex: {
      desc: string
      track_nums: number
      playable_track_nums: number
      album_tag3: number
      singer_tag: string
      album_tag5: string
      schedule_status: number
      long_audio_nums: number
      caliber: number
      recommend_reason: string
      short_recommend_reason: string
      lr_book_id: number
      lr_tag: string
      status: number
      has_special_fnote: number
    }
    photo: Photo
    opt_grade: number
    status: number
    opt_grade_new: number
    vertical_type: string
    singer_wiki: string
    index: string
    is_classical: number
  }

  interface RankInfo {
    id: number
    listenCount: number
    picUrl: string
    topTitle: string
    type: number
    songList: { singerName: string; songName: string }[]
  }

  // 歌单
  interface PlayList {
    dissid: string
    createtime: string
    commit_time: string
    dissname: string
    imgurl: string
    introduction: string
    listennum: number
    score: number
    version: number
    creator: {
      type: number
      qq: number
      encrypt_uin: string
      name: string
      isVip: number
      avatarUrl: string
      followflag: number
    }
  }

  interface Category {
    categoryGroupName: "热门" | "语种" | "流派" | "主题"
    items: {
      allsorts: [{ sortId: 1; sortName: "默认" }, { sortId: 2; sortName: "最新" }, { sortId: 3; sortName: "最热" }, { sortId: 4; sortName: "评分" }]
      categoryId: number
      categoryName: string
      usable: number
    }[]
    usable: number
  }

  interface SearchItem {
    album: {
      albumId: number
      name: string
      desc: string
      mid: string
      publishTime: string
    }
    id: number
    duration: number
    mid: string
    mv: {
      id: number
      name: string
      title: string
      vid: string
      vt: number
    }
    name: string
    singer: {
      id: number
      mid: string
      name: string
    }[]
    vs: string[]
  }

  interface SmartBoxItem {
    docid: string
    id: string
    mid: string
    name: string
    pic: string
    singer: string
  }
  interface SmartResultCategory {
    count: number
    name: string
    order: number
    type: number
    itemlist: SmartBoxItem[]
  }

  type SearchSmartBoxRes = Record<"album" | "mv" | "singer" | "song", SmartResultCategory>

  interface Hotnes {
    desc: string
    icon_url: string
    jump_type: number
    jump_url: string
  }

  interface Song {
    act: number
    action: Action
    album: Album
    bpm: number
    content: string
    desc: string
    desc_hilight: string
    docid: string
    eq: number
    es: string
    file: File
    fnote: number
    genre: number
    grp: Grp[]
    hotness: Hotnes
    href3: string
    id: number
    index_album: number
    index_cd: number
    interval: number
    isonly: number
    ksong: {
      id: number
      mid: string
    }
    label: string
    language: number
    lyric: string
    lyric_hilight: string
    mid: string
    mv: Mv
    name: string
    newStatus: number
    ov: number
    protect: number
    sa: number
    singer: Singer[]
    status: number
    subtitle: string
    tag: number
    tid: number
    time_public: string
    title: string
    title_hilight: string
    type: number
    url: string
    version: number
    vf: number[]
    vi: number[]
    volume: Volume
    vs: string[]
  }

  interface RecommendRes {
    category: {
      code: number
      data: {
        category: {
          group_id: number
          group_name: string //热门推荐
          items: {
            item_id: number
            item_name: string
            item_desc: string
            item_new: number
            item_hot: number
            show_type: number
            is_parent: number
            reimgurl: string
            item_share_pic: string
            show_detail: number
            group_id: number
          }[]
        }[]
      }
    }
    recomPlaylist: {
      code: number
      data: {
        page: number
        v_hot: {
          album_pic_mid: string
          content_id: number
          cover: string
          creator: number
          edge_mark: string
          id: number
          is_dj: boolean
          is_vip: boolean
          jump_url: string
          listen_num: number
          pic_mid: string
          rcmdcontent: string
          rcmdtemplate: string
          rcmdtype: number
          singerid: number
          title: string
          tjreport: string
          type: number
          username: string
        }[]
      }
    }
    playlist: {
      code: number
      data: {
        total: number
        v_playlist: {
          access_num: number
          album_pic_mid: string
          censor_status: number
          censor_time: number
          commit_time: number
          cover_mid: string
          cover_url_big: string
          cover_url_medium: string
          cover_url_small: string
          create_time: number
          creator_info: {
            avatar: string
            is_dj: number
            nick: string
            taoge_avatar: string
            taoge_nick: string
            uin: number
            vip_type: number
          }
          creator_uin: number
          desc: string
          dirid: number
          fav_num: number
          modify_time: number
          pic_mid: string
          rcmdcontent: string
          rcmdtemplate: string
          score: number
          tid: number
          title: string
          tjreport: string
          song_ids: number[]
          song_types: number[]
          tag_ids: number[]
        }[]
      }
    }
    new_song: {
      code: number
      data: {
        lanlist: {
          name: "new_song" | "neidi" | "gangtai" | "oumei" | "hanguo" | "riben"
          lan: "最新" | "内地" | "港台" | "欧美" | "韩国" | "日本"
          type: number
          tjreport: string
        }[]
        lan: string
        ret_msg: string
        type: number
        songlist: Song[]
        songTagInfoList: {
          id: number
          tag: string // 独家首发30/15/3天
          link: string
          tagid: number
          from_type: number
        }[]
      }
    }
    new_album: {
      code: number
      data: {
        albums: AlbumDetail[]
        ret_msg: string
        total: number
      }
    }
    new_album_tag: {
      code: number
      data: {
        area: {
          name: string
          id: number
          tjreport: string
        }[]
      }
    }
    toplist: {
      code: number
      data: {
        group: {
          groupId: number
          groupName: string // 巅峰榜
          type: number
          myFeatureButtonText: string
          myFeatureButtonScheme: string
          toplist: RecommendRank[]
        }[]
        refreshInterval: number
        abt: string
        location: {
          province: {
            provinceID: number
            name: string
            pinyin: string
          }
        }
      }
    }
    focus: {
      code: number
      data: {
        content: {
          cover: string
          id: number
          jump_info: Record<"id" | "mid" | "url", string>
          listen_num: number
          pic_info: Record<"mid" | "url" | "urlex1" | "urlex2", string>
          report: string
          sub_title: string
          title: string
          type: number
        }[]
        id: number
        sub_cube: unknwon[]
        title: string
      }
    }
  }
}
