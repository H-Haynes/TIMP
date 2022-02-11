import {createApp} from 'vue';
import App from '/@/App.vue';
import '../assets/css/index.css';
// import 'tailwindcss/tailwind.css';
import router from '/@/router/index';
import 'virtual:windi.css';
import mitt from 'mitt';
const app = createApp(App);
const $filters = {
    timeFormat:(value) =>{
        if(!value) return '';
        const date = new Date(value);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const seconds = date.getSeconds();
        const addZero = (num) => num < 10 ? '0' + num : num;
        return `${year}-${addZero(month)}-${addZero(day)} ${addZero(hour)}:${addZero(minute)}:${addZero(seconds)}`;
    },
    durationFormat:(value) =>{
        const minute = Math.floor(value / 60000);
        const second = Math.floor(value % 60000 / 1000);
        const addZero = (num:number) => num < 10 ? '0' + num : num;
        return `${addZero(minute)}:${addZero(second)}`;
    },
    secToMin:(value) =>{
        const minute = Math.floor(value / 60);
        const second = Math.floor(value % 60);
        const addZero = (num) => num < 10 ? '0' + num : num;
        return `${addZero(minute)}:${addZero(second)}`;
    },
};
app.provide('$filters',$filters);
app.provide('$eventBus',mitt());
app.use(router);
app.mount('#app');
