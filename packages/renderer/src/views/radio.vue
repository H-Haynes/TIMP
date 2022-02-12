<template lang="">
    <div>
        radio
    </div>
</template>
<script lang="ts" setup>
    import { getRadioListQQ } from '../api/qq';
    import {ref,onMounted} from 'vue';
    const radioList = ref([]);
    const getRadioList = async () => {
        const res = await getRadioListQQ();
        console.log(res);
    };

    onMounted(()=>{
        getRadioList();
    });
</script>
<style lang="">
    
</style>