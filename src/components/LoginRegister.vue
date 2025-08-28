<template>
  <div class="row items-center justify-evenly full-width q-col-gutter-md">
    <!-- LOGIN -->
    <div
      v-show="isLargeScreen || isLoginActive"
      class="column q-pa-lg rounded-borders shadow-5 transition-all"
      style="width: 600px; height: 500px;"
      :class="isLoginActive ? 'bg-black text-white' : 'bg-white text-black'"
    >
      <h2 class="text-center text-h5 q-mx-lg cursor-pointer" @click="isLoginActive = true">
        Entrar
      </h2>

      <q-input filled v-model="loginForm.email" label="E-mail" class="q-my-md"
        :color="isLoginActive ? 'black bg-white' : 'grey-7'" :disable="!isLoginActive" />

      <q-input filled type="password" v-model="loginForm.password" label="Senha" class="q-my-md"
        :color="isLoginActive ? 'black bg-white' : 'grey-7'" :disable="!isLoginActive" />

      <q-btn label="Entrar" :color="isLoginActive ? 'white text-black' : 'grey-7'" class="full-width q-my-md"
        @click="handleLogin" :disable="!isLoginActive" />

      <q-btn flat label="Criar conta" color="grey-13" class="full-width" @click="isLoginActive = false" />
    </div>

    <!-- REGISTER -->
    <div
      v-show="isLargeScreen || !isLoginActive"
      class="column q-pa-lg rounded-borders shadow-10 transition-all"
      style="width: 600px; height: 500px;"
      :class="!isLoginActive ? 'bg-black text-white' : 'bg-white text-grey-9'"
    >
      <h2 class="text-center text-h5 q-mb-lg cursor-pointer" @click="isLoginActive = false">
        Cadastre-se
      </h2>

      <q-input filled v-model="registerForm.name" label="Nome" class="q-mb-md"
        :disable="isLoginActive" :color="!isLoginActive ? 'black bg-white' : 'grey-7'" />

      <q-input filled v-model="registerForm.email" label="E-mail" class="q-mb-md"
        :color="!isLoginActive ? 'black bg-white' : 'grey-7'" :disable="isLoginActive" />

      <q-input filled type="password" v-model="registerForm.password" label="Senha" class="q-mb-lg"
        :color="!isLoginActive ? 'black bg-white' : 'grey-7'" :disable="isLoginActive" />

      <q-btn label="Cadastrar" :color="!isLoginActive ? 'white text-black' : 'grey-7'" class="full-width q-mb-md"
        @click="handleRegister" :disable="isLoginActive" />

      <q-btn flat label="Já tenho conta" color="grey-7" class="full-width" @click="isLoginActive = true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from 'src/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter() 

const isLoginActive = ref(true)
const isLargeScreen = ref(window.innerWidth >= 800)

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '' })

async function handleLogin() {
  if (userStore.login(loginForm.value.email, loginForm.value.password)) {
    alert(`Bem-vindo ${userStore.currentUser?.name}! Role: ${userStore.currentUser?.role}`)
    await router.push('/documents') 
  } else {
    alert('Credenciais inválidas!')
  }
}

async function handleRegister() {
  try {
    userStore.register(registerForm.value.name, registerForm.value.email, registerForm.value.password)
    alert('Conta criada com sucesso!')
    isLoginActive.value = true
    await router.push('/documents') 
  } catch (e: unknown) {
    if (e instanceof Error) {
      alert(e.message)
    } else {
      alert('Ocorreu um erro inesperado')
    }
  }
}


function checkScreen() {
  isLargeScreen.value = window.innerWidth >= 1200
}

onMounted(() => {
  window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})
</script>



<style scoped>
.bg-opacity-50 {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(6px);
}
</style>
