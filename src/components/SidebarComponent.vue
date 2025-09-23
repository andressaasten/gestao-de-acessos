<template>
  <q-drawer
    side="left"
    no-swipe-backdrop
    bordered
    overlay
    :width="200"
    class="bg-primary text-text dark:!bg-dark"
  >
    <q-list>
      <q-item
        clickable
        active-class="bg-accent dark:!bg-dark-page"
        :to="{ name: 'main/documents' }"
        >{{ $t('documents.title') }}</q-item
      >
      <q-item clickable active-class="bg-accent dark:!bg-dark-page" to="/permissions">{{
        $t('permission.title')
      }}</q-item>
      <q-item clickable @click="handleShow">{{ $t('register.edition') }} perfil</q-item>
    </q-list>

    <profile-popup v-model="showProfile" />
  </q-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProfilePopup from 'src/components/EditorPopup.vue';

defineOptions({ name: 'SidebarComponent' });

const showProfile = ref(false);

const handleShow = () => {
  showProfile.value = true;
};
</script>
