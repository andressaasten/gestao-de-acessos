<template>
  <q-toolbar elevated :class="$q.dark.isActive ? 'bg-dark' : 'bg-accent'">
    <q-btn
      v-if="!$q.screen.gt.sm"
      flat
      rounded-borders
      icon="menu"
      aria-label="Menu"
      @click="drawerRight = !drawerRight"
    />
    <q-toolbar-title>{{ $t('documents.sistem') }}</q-toolbar-title>

    <div class="row items-center q-gutter-sm">
      <q-btn v-if="$q.screen.gt.sm" flat to="/documents" :label="$t('documents.title')" />
      <q-btn
        v-if="userStore.currentUser?.role === 'admin' && $q.screen.gt.sm"
        flat
        :label="$t('permission.title')"
        to="/permissions"
      />
      <q-btn
        flat
        :label="$t('register.edition')"
        @click="showProfile = true"
        v-if="$q.screen.gt.sm"
      />
      <q-btn color="accent bg-primary" flat :label="$t('login.logout')" @click="logout" />
    </div>

    <profile-popup v-model="showProfile" />

    <q-drawer
      side="left"
      v-model="drawerRight"
      no-swipe-backdrop
      bordered
      overlay
      :width="200"
      :breakpoint="500"
      class="bg-accent dark:!bg-secondary"
    >
      <q-btn flat @click="drawerRight = false" round dense icon="close" aria-label="close" />
      <q-list class="q-pt-md">
        <q-item clickable v-ripple :to="{ name: 'main/documents' }">{{
          $t('documents.title')
        }}</q-item>
        <q-item clickable v-ripple to="/permissions">{{ $t('permission.title') }}</q-item>
        <q-item clickable @click="handleShow">{{ $t('register.edition') }} perfil</q-item>
      </q-list>
    </q-drawer>
  </q-toolbar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user';
import ProfilePopup from 'src/components/EditorPopup.vue';

const router = useRouter();
const userStore = useUserStore();
const drawerRight = ref(false);

const showProfile = ref(false);

async function logout() {
  userStore.logout();
  await router.push('/');
}

const handleShow = () => {
  showProfile.value = true;
};
</script>
