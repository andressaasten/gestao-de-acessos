<template>
  <router-view />
</template>

<script setup lang="ts">
import { init } from './services/documentService';
import { userService } from './services/userServices';

init();
userService.init();
</script>
