<template>
  <router-view />
</template>

<script setup lang="ts">
import { init } from './services/documentService';
import { initUser } from './services/userServices';

initUser();
init();
</script>
