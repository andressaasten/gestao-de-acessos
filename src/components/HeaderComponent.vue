<template>
  <q-toolbar elevated class="bg-primary text-text dark:!bg-dark">
    <q-btn
      v-if="!$q.screen.gt.sm"
      flat
      rounded-borders
      :icon="mdiMenu"
      aria-label="Menu"
      @click="drawerRight = !drawerRight"
    />
    <q-toolbar-title>{{ $t('documents.sistem') }}</q-toolbar-title>

    <div v-if="$q.screen.gt.sm" class="p-2">
      <q-list class="row">
        <q-item
          clickable
          active-class="bg-accent dark:!bg-dark-page"
          :to="{ name: 'main/documents' }"
          >{{ $t('documents.title') }}</q-item
        >
        <q-item
          v-if="userStore.currentUser?.role === 'admin' && $q.screen.gt.sm"
          clickable
          active-class="bg-accent dark:!bg-dark-page"
          to="/permissions"
          >{{ $t('permission.title') }}</q-item
        >
        <q-item clickable @click="handleShow">{{ $t('register.edition') }} perfil</q-item>
      </q-list>
    </div>

    <q-btn color="text bg-primary m-2" :label="$t('login.logout')" @click="logout" />

    <profile-popup v-model="showProfile" />
    <sidebar-component v-model="drawerRight" />
  </q-toolbar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user';
import { mdiMenu } from '@quasar/extras/mdi-v7';
import ProfilePopup from 'src/components/EditorPopup.vue';
import SidebarComponent from 'src/components/SidebarComponent.vue';

defineOptions({ name: 'HeaderComponent' });

const router = useRouter();
const userStore = useUserStore();

const drawerRight = ref(false);
const showProfile = ref(false);

const handleShow = () => {
  showProfile.value = true;
};

async function logout() {
  userStore.logout();
  await router.push('/');
}
</script>
