<template>
  <q-layout class="bg-page">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer :class="uiStore.darkMode ? 'bg-dark text-white' : 'bg-grey-9 text-white'">
      <q-btn flat dense round icon="language">
        <q-menu>
          <q-list>
            <q-item clickable v-ripple @click="changeLang('pt')">
              <q-item-section>🇧🇷 Português</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="changeLang('en')">
              <q-item-section>🇺🇸 English</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn
        flat
        dense
        round
        :icon="uiStore.darkMode ? 'dark_mode' : 'light_mode'"
        @click="uiStore.toggleDark"
      />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useUiStore } from 'src/stores/ui';
import { useI18n } from 'vue-i18n';

const uiStore = useUiStore();
const { locale } = useI18n();

function changeLang(lang: 'pt' | 'en') {
  uiStore.setLocale(lang);
  locale.value = lang;
}
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
