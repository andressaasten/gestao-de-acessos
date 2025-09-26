<template>
  <q-layout view="hHh lpR fFf">
    <HeaderComponent @update:drawer="updateDrawer" />

    <SidebarComponent v-model="drawerRight" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <FooterComponent />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FooterComponent from 'src/components/FooterComponent.vue';
import HeaderComponent from 'src/components/HeaderComponent.vue';
import SidebarComponent from 'src/components/SidebarComponent.vue';

const drawerRight = ref(false);

const updateDrawer = (value: boolean) => {
  drawerRight.value = value;
};
</script>
