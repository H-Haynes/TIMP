declare namespace Kuwo {
  type Radio = Record<"artist" | "album" | "listencnt" | "pic" | "rid", string>

  interface Banner {
    newPic: string
    newPicText: string
    id: number
    pic: string
    priority: number
    newPicTag: string
    url: string
    startTime?: number
    endTime?: number
  }

  interface Mv {
    duration: number
    artist: string
    mvPlayCnt: number
    name: string
    online: string
    artistid: number
    songTimeMinutes: string
    id: string
    pic: string
  }

  interface Singer {
    artistFans: number
    albumNum: number
    mvNum: number
    pic: string
    musicNum: number
    pic120: string
    isStar: number
    content_type: string
    aartist: string
    name: string
    pic70: string
    id: number
    pic300: string
  }

  interface Album {
    content_type: string
    albuminfo: string
    artist: string
    releaseDate: string
    album: string
    albumid: number
    pay: number
    artistid: number
    pic: string
    isstar: number
    lang: string
  }

  interface AlbumDetail extends Album {
    playCnt: number
    total: number
    albuminfo: string
    musicList: Song[]
  }

  interface PayInfo {
    play: string
    nplay: string
    overseas_nplay: string
    local_encrypt: string
    limitfree: string
    refrain_start: string
    extendAttr: number
    feeType: {
      song: string
      album: string
      vip: string
      bookvip: string
    }
    down: string
    ndown: string
    download: string
    cannotDownload: string
    overseas_ndown: string
    listen_fragment: string
    refrain_end: string
    cannotOnlinePlay: string
    tips_intercept: string
    paytype: number
    paytagindex: {
      s: number
      f: number
      zP: number
      h: number
      zPGA201: number
      zPLY: number
      hR: number
      l: number
      zPGA501: number
      dB: number
      aR501: number
    }
  }

  interface Song {
    musicrid: string
    barrage: string
    artist: string
    mvpayinfo: {
      vid: string
      play: string
      download: string
      down: string
    }
    pic: string
    isstar: number
    releasedate: string
    rid: number
    duration: number
    score100: string
    content_type: string
    track: number
    hasLossless: boolean
    hasmv: number
    album: string
    albumid: string
    pay: string
    artistid: number
    albumpic: string
    originalsongtype: number
    songTimeMinutes: string
    isListenFee: boolean
    pic120: string
    name: string
    online: number
    payInfo: PayInfo
    ad_type?: string
    trend?: string
  }

  interface BasePalyList {
    img: string
    uname: string
    total: string
    name: string
    listencnt: string
    id: string
    desc: string
    info: string
  }

  // 带歌曲的
  interface PlayListTrack extends BasePalyList {
    img700: string
    img300: string
    userName: string
    img500: string
    musicList: Song[]
  }
  interface PlayList extends BasePalyList {
    lossless_mark: string
    favorcnt: string
    isnew: string
    extend: string
    uid: string
    commentcnt: string
    imgscript: string
    digest: string
    attribute: string
    radio_id: string
  }

  interface SubTag {
    extend: string
    img: string
    digest: string
    name: string
    isnew: string
    id: string
  }

  interface MainTag {
    img: string
    mdigest: string
    data: SubTag[]
    name: string
    id: string
    type: string
    img1: string
  }

  interface Rank {
    sourceid: string
    intro: string
    name: string
    id: string
    source: string
    pic: string
    pub: string
  }

  interface RecommendRank {
    leader: string
    num: string
    name: string
    pic: string
    id: string
    pub: string
    musicList: Song[]
  }
}
