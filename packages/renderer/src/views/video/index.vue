<template>
  <router-view :key="type + id+ Date.now()"></router-view>
</template>

<script lang="ts" setup>
    import {useRoute} from 'vue-router';
    import {ref} from 'vue';
    const route = useRoute();
    const type = ref(route.query.type);
    const id = ref(route.query.id);
</script>