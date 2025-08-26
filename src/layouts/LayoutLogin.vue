<template>
  <q-layout view="hHh lpR fFf" class="bg-page">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>

<style scoped>
.bg-page {
  background: url('/docs/images/wallpaper-login.png') no-repeat center center;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
