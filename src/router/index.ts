import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(process.env.NODE_ENV == 'production' ? '' : ''),
  routes: [
    {
      path: '/',
      // component: () => import('@/views/home.vue'),
      component: () => import('@/layouts/LayoutDefault.vue'),
      redirect: {
        name: 'rank'
      },
      children: [
        {
          path: 'rank',
          name: 'rank',
          component: () => import('@/views/rank.vue'),
        },
        {
          path: "playlist/:id",
          name: "PlaylistDetail",
          component: () => import('@/views/playlistDetail.vue')
        },
        {
          path: "songList",
          name: "SongList",
          component: () => import('@/views/songList/index.vue')
        },
        {
          path: "video",
          name: "Video",
          component: () => import('@/views/index.vue'),
          redirect: {
            name: "VideoList"
          },
          children: [
            {
              path: "list",
              name: "VideoList",
              component: () => import("@/views/video/list.vue")
            },
            {
              path: "detail/:id",
              name: "VideoDetail",
              component: () => import("@/views/video/detail.vue")
            }
          ]
        },
        {
          path: "setting",
          name: "Setting",
          component: () => import('@/views/setting/index.vue'),
        },

        // {
        //   path: "spectrum",
        //   name: "spectrum",
        //   component: () => import('@/views/spectrum.vue')
        // },
        //   {
        //     path: 'album',
        //     name: 'album',
        //     component: () => import('/@/views/album.vue'),
        //   },
        //   {
        //     path: 'radio',
        //     name: 'radio',
        //     component: () => import('/@/views/radio.vue'),
        //   },
        //   {
        //     path: 'video',
        //     name: 'video',
        //     component: () => import('/@/views/video/index.vue'),
        //     redirect: '/video/list',
        //     children: [
        //       {
        //         name: 'videoList',
        //         path: 'list',
        //         component: () => import('/@/views/video/list.vue'),
        //       },
        //       {
        //         name: 'videoPlayer',
        //         path: 'player',
        //         component: () => import('/@/views/video/player.vue'),
        //       },
        //     ],
        //   },
      ],
    },
    {
      path: "/lyric",
      name: "Lyric",
      component: () => import("@/views/lyric/index.vue")
    },
    {
      // 小窗固定歌词
      path: "/fixLyric",
      name: "FixLyric",
      component: () => import('@/views/lyric/fixLyric.vue')
    }

    // {
    //   path: '/lyric',
    //   name: 'lyric',
    //   component: () => import('/@/views/lyric.vue'),
    // },
  ],
});

export default router;
