<template>
  <q-layout style="min-height: 100dvh" class="bg-page flex flex-col flex-nowrap">
    <q-header reveal elevated class="flex flex-row bg-primary text-text dark:!bg-dark">
      <q-avatar class="bg-background">
        <q-img src="../assets/document-svgrepo-com.svg" class="m-2" loading="eager" />
      </q-avatar>
      <q-toolbar-title class="m-2">{{ $t('portal') }}</q-toolbar-title>
    </q-header>

    <q-page-container class="flex-auto flex flex-col flex-nowrap overflow-x-hidden w-full">
      <router-view />
    </q-page-container>

    <FooterComponent v-model="footercomponent" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FooterComponent from 'src/components/FooterComponent.vue';

const footercomponent = ref(true);
</script>

<style>
.bg-page {
  background: url('/images/wallpaper-login.png') no-repeat center;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
