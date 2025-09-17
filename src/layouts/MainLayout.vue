<template>
  <q-layout view="hHh lpR fFf">
    <q-header :class="uiStore.darkMode ? 'bg-secondary text-primary' : 'bg-accent '">
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
          <q-btn color="accent bg-primary" flat :label="$t('login.logout')" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <footer-component v-model="FooterComponent" />

    <profile-popup v-model="showProfile" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user';
import { useUiStore } from 'src/stores/ui';
import ProfilePopup from 'src/components/EditorPopup.vue';
import FooterComponent from 'src/components/FooterComponent.vue';

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUiStore();

const showProfile = ref(false);

async function logout() {
  userStore.logout();
  await router.push('/');
}
</script>
