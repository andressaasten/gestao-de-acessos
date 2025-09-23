<template>
  <div class="row items-center justify-evenly full-width q-col-gutter-md">
    <!-- LOGIN -->
    <q-form
      v-show="isLargeScreen || isLoginActive"
      class="column q-pa-lg rounded-borders shadow-5 transition-all duration-300 w-[600px] h-[500px]"
      :class="isLoginActive ? 'bg-dark text-primary' : 'bg-dark-page text-accent'"
      @submit="handleLogin"
    >
      <q-title class="text-center text-h2 q-mx-sm cursor-pointer" @click="isLoginActive = true">
        {{ $t('login.title') }}
      </q-title>
      <q-input
        filled
        v-model="loginForm.email"
        type="email"
        :label="$t('login.email')"
        :label-color="isLoginActive ? 'accent' : 'secondary'"
        class="m-4"
        :color="isLoginActive ? 'secondary bg-secondary' : 'accent'"
        :disable="!isLoginActive"
        lazy-rules
        :rules="[validateEmail]"
      />

      <q-input
        filled
        type="password"
        v-model="loginForm.password"
        :label="$t('login.password')"
        :label-color="isLoginActive ? 'accent' : 'secondary'"
        class="m-4"
        :color="isLoginActive ? 'secondary bg-secondary' : 'accent'"
        :disable="!isLoginActive"
        lazy-rules
        :rules="[validateSenha]"
      />

      <q-btn
        :label="$t('login.title')"
        :color="isLoginActive ? 'primary bg-accent' : 'secondary'"
        class="full-width q-my-md"
        :disable="!isLoginActive"
        type="submit"
      />
      <q-btn
        flat
        :label="$t('register.button')"
        class="full-width"
        @click="isLoginActive = false"
      />
    </q-form>

    <!-- REGISTER -->
    <q-form
      ref="form"
      @submit.prevent="handleRegister"
      v-show="isLargeScreen || !isLoginActive"
      class="column q-pa-lg rounded-borders shadow-10 transition-all duration-300"
      style="width: 600px; height: 500px"
      :class="!isLoginActive ? 'bg-dark text-primary' : 'bg-dark-page text-accent'"
    >
      <q-title class="text-center text-h2 q-mb-lg cursor-pointer" @click="isLoginActive = false">
        {{ $t('register.title') }}
      </q-title>

      <q-input
        filled
        v-model="registerForm.name"
        :label="$t('register.name')"
        :label-color="!isLoginActive ? 'accent' : 'secondary'"
        class="q-mb-md"
        :disable="isLoginActive"
        :color="!isLoginActive ? 'secondary bg-secondary' : 'accent'"
      />

      <q-input
        filled
        v-model="registerForm.email"
        type="email"
        :label="$t('login.email')"
        :label-color="!isLoginActive ? 'accent' : 'secondary'"
        class="q-mb-md"
        :color="!isLoginActive ? 'secondary bg-secondary' : 'accent'"
        :disable="isLoginActive"
        lazy-rules
        :rules="[validateEmail]"
      />

      <q-input
        filled
        type="password"
        v-model="registerForm.password"
        :label="$t('login.password')"
        :label-color="!isLoginActive ? 'accent' : 'secondary'"
        class="q-mb-lg"
        :color="!isLoginActive ? 'secondary bg-secondary' : 'accent'"
        :disable="isLoginActive"
        lazy-rules
        :rules="[validateSenha]"
      />

      <q-btn
        :label="$t('register.title')"
        type="submit"
        :color="!isLoginActive ? 'primary bg-accent' : 'secondary'"
        class="full-width q-mb-md"
        :disable="isLoginActive"
      />

      <q-btn
        flat
        :label="$t('register.register')"
        class="full-width"
        @click="isLoginActive = true"
      />
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Notify, useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const userStore = useUserStore();
const router = useRouter();

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
  if (!userStore.login(loginForm.value.email, loginForm.value.password)) {
    Notify.create('Credenciais inválidas!');
    return;
  }

  $q.notify({
    message: `Bem-vindo ${userStore.currentUser?.name}! Acesso: ${userStore.currentUser?.role}`,
    color: 'positive',
  });
  await router.push('/documents');
}

async function handleRegister() {
  try {
    userStore.register(
      registerForm.value.name,
      registerForm.value.email,
      registerForm.value.password,
    );
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
