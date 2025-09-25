<template>
  <q-footer class="bg-primary text-text dark:!bg-dark dark:!text-muted">
    <!-- Botão de idioma -->
    <q-btn flat dense round :icon="mdiTranslate">
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

    <!-- Botão de tema -->
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
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Dark } from 'quasar';
import { mdiTranslate, mdiWeatherNight, mdiWeatherSunny } from '@quasar/extras/mdi-v7';

defineOptions({ name: 'FooterComponent' });

const { locale } = useI18n();
const darkMode = ref(Dark.isActive);

onMounted(() => {
  const savedLang = localStorage.getItem('lang');
  const savedDark = localStorage.getItem('darkMode');

  if (savedLang) {
    locale.value = savedLang;
  }

  if (savedDark !== null) {
    const isDark = savedDark === 'true';
    darkMode.value = isDark;
    Dark.set(isDark);
  }
});

function changeLang(lang: 'pt' | 'en') {
  locale.value = lang;
  localStorage.setItem('lang', lang);
}

function toggleDark() {
  darkMode.value = !darkMode.value;
  Dark.set(darkMode.value);
  localStorage.setItem('darkMode', String(darkMode.value));
}
</script>
