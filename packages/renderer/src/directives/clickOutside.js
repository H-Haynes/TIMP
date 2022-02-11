const eventHandler = (event,element,cb) => {
    if(element.contains(event.target)) return;
    cb();
};
const clickOutside = {
    mounted(el, binding) {
        const cb = binding.value; // callback function
        if(typeof cb !== 'function') return console.warn('[clickOutside]: callback must be a function');
        document.addEventListener('click', e=>eventHandler(e,el,cb));
    },
    unmounted(el, binding) {
        const cb = binding.value; // callback function
        document.removeEventListener('click',e=>eventHandler(e,el,cb));
    },
};

export default {
    install(app){
        app.directive('clickOutside', clickOutside);
    },
};