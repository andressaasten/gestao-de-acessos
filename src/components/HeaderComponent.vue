<template>
  <q-toolbar :class="uiStore.darkMode ? 'bg-secondary text-primary' : 'bg-accent '">
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user';
import { useUiStore } from 'src/stores/ui';

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUiStore();

const showProfile = ref(false);

async function logout() {
  userStore.logout();
  await router.push('/');
}
</script>
