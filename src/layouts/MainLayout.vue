<template>
  <q-layout view="hHh lpR fFf">
    <q-header :class="uiStore.darkMode ? 'bg-dark text-white' : 'bg-grey-9 text-white'">
      <q-toolbar>
        <q-toolbar-title>{{ $t('documents.sistem') }}</q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <q-btn flat :label="$t('documents.title')" to="/documents" />
          <q-btn
            v-if="userStore.currentUser?.role === 'admin'"
            flat
            :label="$t('permission.title')"
            to="/permissions"
          />
          <q-btn flat :label="$t('register.edition')" @click="showProfile = true" />
          <q-btn color="grey-9 bg-white" flat :label="$t('login.logout')" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

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

    <profile-popup v-model="showProfile" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import { useUiStore } from 'src/stores/ui'
import { useI18n } from 'vue-i18n'
import ProfilePopup from 'src/components/EditorPopup.vue'

const router = useRouter()
const userStore = useUserStore()
const uiStore = useUiStore()
const { locale } = useI18n()

const showProfile = ref(false)

async function logout() {
  userStore.logout()
  await router.push('/')
}

function changeLang(lang: 'pt' | 'en') {
  uiStore.setLocale(lang)
  locale.value = lang
}

</script>
