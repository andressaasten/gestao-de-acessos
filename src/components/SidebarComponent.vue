<template>
  <q-drawer
    v-model="drawerRight"
    overlay
    bordered
    no-swipe-backdrop
    side="left"
    class="bg-primary text-text dark:!bg-dark"
    :width="200"
  >
    <q-btn icon="close" @click="() => updateDrawer(false)" />

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

    <ProfilePopup v-model="showProfile" />
  </q-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProfilePopup from 'src/components/EditorPopup.vue';

defineOptions({ name: 'SidebarComponent' });

const showProfile = ref(false);

const drawerRight = defineModel({
  default: false,
  required: true,
});

const updateDrawer = (value: boolean) => {
  drawerRight.value = value;
};

const handleShow = () => {
  showProfile.value = true;
};
</script>
