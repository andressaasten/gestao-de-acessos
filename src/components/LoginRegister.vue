<template>
  <!-- LOGIN -->
  <q-form
    v-show="isLargeScreen || isLoginActive"
    class="p-8 rounded-borders shadow-5 transition-all duration-300 w-full max-w-[600px] max-h-[500px]"
    :class="isLoginActive ? 'bg-dark text-primary' : 'bg-dark-page text-accent'"
    @submit="handleLogin"
  >
    <p class="text-center text-h2 q-mx-sm cursor-pointer" @click="isLoginActive = true">
      {{ $t('login.title') }}
    </p>
    <q-input
      v-model="loginForm.email"
      filled
      lazy-rules
      type="email"
      class="m-4"
      :label="$t('login.email')"
      :label-color="isLoginActive ? 'accent' : 'secondary'"
      :color="isLoginActive ? 'secondary bg-secondary' : 'accent'"
      :disable="!isLoginActive"
      :rules="[validateEmail]"
    />

    <q-input
      v-model="loginForm.password"
      filled
      lazy-rules
      type="password"
      class="m-4"
      :label="$t('login.password')"
      :label-color="isLoginActive ? 'accent' : 'secondary'"
      :color="isLoginActive ? 'secondary bg-secondary' : 'accent'"
      :disable="!isLoginActive"
      :rules="[validateSenha]"
    />

    <q-btn
      type="submit"
      class="full-width q-my-md"
      :label="$t('login.title')"
      :color="isLoginActive ? 'primary bg-accent' : 'secondary'"
      :disable="!isLoginActive"
    />
    <q-btn flat class="full-width" :label="$t('register.button')" @click="isLoginActive = false" />
  </q-form>

  <!-- REGISTER -->
  <q-form
    ref="form"
    v-show="isLargeScreen || !isLoginActive"
    class="column q-pa-lg rounded-borders shadow-10 transition-all duration-300"
    style="width: 600px; height: 500px"
    :class="!isLoginActive ? 'bg-dark text-primary' : 'bg-dark-page text-accent'"
    @submit.prevent="handleRegister"
  >
    <p class="text-center text-h2 q-mb-lg cursor-pointer" @click="isLoginActive = false">
      {{ $t('register.title') }}
    </p>

    <q-input
      v-model="registerForm.name"
      filled
      class="q-mb-md"
      :label="$t('register.name')"
      :label-color="!isLoginActive ? 'accent' : 'secondary'"
      :color="!isLoginActive ? 'secondary bg-secondary' : 'accent'"
      :disable="isLoginActive"
    />

    <q-input
      v-model="registerForm.email"
      filled
      lazy-rules
      type="email"
      class="q-mb-md"
      :label="$t('login.email')"
      :label-color="!isLoginActive ? 'accent' : 'secondary'"
      :color="!isLoginActive ? 'secondary bg-secondary' : 'accent'"
      :disable="isLoginActive"
      :rules="[validateEmail]"
    />

    <q-input
      v-model="registerForm.password"
      filled
      lazy-rules
      type="password"
      class="q-mb-lg"
      :label="$t('login.password')"
      :label-color="!isLoginActive ? 'accent' : 'secondary'"
      :color="!isLoginActive ? 'secondary bg-secondary' : 'accent'"
      :disable="isLoginActive"
      :rules="[validateSenha]"
    />

    <q-btn
      type="submit"
      class="full-width q-mb-md"
      :label="$t('register.title')"
      :color="!isLoginActive ? 'primary bg-accent' : 'secondary'"
      :disable="isLoginActive"
    />

    <q-btn flat class="full-width" :label="$t('register.register')" @click="isLoginActive = true" />
  </q-form>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Notify, useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/userStore';
import { useRouter } from 'vue-router';
import { login, register } from 'src/services/userServices';

const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();

const isLoginActive = ref(true);
const isLargeScreen = ref(window.innerWidth >= 800);

const loginForm = ref({ email: '', password: '' });
const registerForm = ref({ name: '', email: '', password: '' });
//const formRef = useTemplateRef<QForm>('formRef');

const validateEmail = (val: string): true | string => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(val) || 'E-mail inválido';
};

const validateSenha = (val: string): true | string => {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{5,}$/;
  return regex.test(val) || 'Senha inválida';
};

async function handleLogin() {
  if (!login(loginForm.value.email, loginForm.value.password)) {
    Notify.create('Credenciais inválidas!');
    return;
  }

  $q.notify({
    message: `Bem-vindo ${userStore.getUser()?.name}! Acesso: ${userStore.getUser()?.role}`,
    color: 'positive',
  });
  await router.push('/documents');
}

async function handleRegister() {
  try {
    register(registerForm.value.name, registerForm.value.email, registerForm.value.password);
    Notify.create('Conta criada com sucesso!');
    isLoginActive.value = true;
    await router.push('/documents');
  } catch (e: unknown) {
    if (e instanceof Error) {
      Notify.create(e.message);
    } else {
      Notify.create('Ocorreu um erro inesperado');
    }
  }
}

function checkScreen() {
  isLargeScreen.value = window.innerWidth >= 1200;
}

onMounted(() => {
  window.addEventListener('resize', checkScreen);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen);
});
</script>
