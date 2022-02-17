import { createRouter,createWebHashHistory } from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(process.env.NODE_ENV=='production' ? '' : ''),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('/@/layouts/default-layout.vue'),
            redirect: '/find',
            children: [
                {
                    path: 'find',
                    name:'find',
                    component: () => import('/@/views/find.vue'),
                },
                {
                    path:'album',
                    name:'album',
                    component: () => import('/@/views/album.vue'),
                },
                {
                    path:'radio',
                    name:'radio',
                    component: () => import('/@/views/radio.vue'),
                },
                {
                    path:'video',
                    name:'video',
                    component: () => import('/@/views/video/index.vue'),
                    redirect:'/video/list',
                    children:[
                        {
                            name:'videoList',
                            path:'list',
                            component: () => import('/@/views/video/list.vue'),
                        },
                        {
                            name:'videoPlayer',
                            path:'player',
                            component: () => import('/@/views/video/player.vue'),
                        }
                    ]
                },
            ],
        },
        {
            path:'/lyric',
            name:'lyric',
            component: () => import('/@/views/lyric.vue'),
        },
    ],
});

export default router;