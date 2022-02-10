import { createRouter,createWebHashHistory, createWebHistory } from 'vue-router';

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
                    path:'/album',
                    name:'album',
                    component: () => import('/@/views/album.vue'),
                },
            ],
        },
    ],
});

export default router;