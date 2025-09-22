<template>
  <q-footer :class="$q.dark.isActive ? 'bg-secondary text-primary' : 'bg-accent text-primary'">
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
      :icon="darkMode ? mdiWeatherNight : mdiWeatherSunny"
      @click="toggleDark"
    />
  </q-footer>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Dark } from 'quasar';
import { mdiWeatherNight, mdiWeatherSunny } from '@quasar/extras/mdi-v7';

const { locale } = useI18n();
let darkMode = Dark.isActive;

function changeLang(lang: 'pt' | 'en') {
  locale.value = lang;
}

function toggleDark() {
  darkMode = !darkMode;
  Dark.set(darkMode);
}
</script>
