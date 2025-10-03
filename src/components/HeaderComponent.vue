<template>
  <q-header>
    <q-toolbar elevated class="bg-primary text-text dark:!bg-dark">
      <q-btn
        v-if="!$q.screen.gt.sm"
        flat
        rounded-borders
        aria-label="Menu"
        :icon="mdiMenu"
        @click="() => $emit('update:drawer', true)"
      />
      <q-toolbar-title>{{ $t('documents.sistem') }}</q-toolbar-title>

      <div v-if="$q.screen.gt.sm">
        <q-list class="row">
          <q-item
            clickable
            active-class="bg-accent dark:!bg-dark-page"
            class="mt-2 flex items-center justify-center"
            :to="{ name: 'main/documents' }"
            >{{ $t('documents.title') }}</q-item
          >
          <q-item
            v-if="user?.role === 'admin' && $q.screen.gt.sm"
            clickable
            class="mt-2 flex items-center justify-center"
            active-class="bg-accent dark:!bg-dark-page"
            to="/permissions"
            >{{ $t('permission.title') }}</q-item
          >
          <q-item clickable class="m-2 flex items-center justify-center" @click="handleShow"
            >{{ $t('register.edition') }} perfil</q-item
          >
        </q-list>
      </div>

      <q-btn color="text bg-primary" :label="$t('login.logout')" @click="logoutPage" />

      <profile-popup v-model="showProfile" />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { mdiMenu } from '@quasar/extras/mdi-v7';
import ProfilePopup from 'src/components/EditorPopup.vue';
import { useUserStore } from 'src/stores/userStore';
import { logout } from 'src/services/userServices';
import type { User } from 'src/types/interfaces/IUser';

defineOptions({ name: 'HeaderComponent' });

defineEmits<{
  (event: 'update:drawer', value: boolean): void;
}>();

const router = useRouter();
const userStore = useUserStore();
const user = ref<User | null>(null);

const showProfile = ref(false);

const handleShow = () => {
  showProfile.value = true;
};

onMounted(() => {
  user.value = userStore.getUser();
});

async function logoutPage() {
  logout();
  userStore.clear();
  await router.push('/');
}
</script>
