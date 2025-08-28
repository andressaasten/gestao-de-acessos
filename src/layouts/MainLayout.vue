<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>Gestão de Acessos</q-toolbar-title>
        <q-btn flat label="Documentos" to="/documents" />
        <q-btn v-if="userStore.currentUser?.role === 'admin'" flat label="Gerenciamento de Permissões" to="/permissions" />
        <q-btn flat label="Configurações" @click="showProfile = true" />
        <q-btn color="grey-8" flat label="Sair" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <profile-popup v-model="showProfile" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import ProfilePopup from 'src/components/EditorPopup.vue'

const userStore = useUserStore()
const router = useRouter()
const showProfile = ref(false)

async function logout() {
  userStore.logout()
  await router.push('/') 
}

</script>
