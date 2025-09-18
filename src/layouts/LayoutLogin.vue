<template>
  <q-layout class="bg-page">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-grey-9 text-white'">
      <footer-component v-model="footercomponent" />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FooterComponent from 'src/components/FooterComponent.vue';

const footercomponent = ref(true);
</script>

<style>
.bg-page {
  background: url('/public/images/wallpaper-login.png') no-repeat center center;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
