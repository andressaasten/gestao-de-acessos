<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <header-component v-model="headercomponent" />
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer>
      <footer-component v-model="footercomponent" />
    </q-footer>

    <profile-popup v-model="showProfile" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProfilePopup from 'src/components/EditorPopup.vue';
import FooterComponent from 'src/components/FooterComponent.vue';
import HeaderComponent from 'src/components/HeaderComponent.vue';

const footercomponent = ref(true);
const headercomponent = ref(true);

const showProfile = ref(false);
</script>
