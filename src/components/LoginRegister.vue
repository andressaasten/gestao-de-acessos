<template>
  <div class="row items-center justify-evenly full-width q-col-gutter-md">
    <!-- LOGIN -->
    <q-form
      v-show="isLargeScreen || isLoginActive"
      class="column q-pa-lg rounded-borders shadow-5 transition-all duration-300"
      style="width: 600px; height: 500px"
      :class="isLoginActive ? 'bg-dark text-primary' : 'bg-primary text-accent'"
    >
      <h2 class="text-center text-h5 q-mx-lg cursor-pointer" @click="isLoginActive = true">
        Entrar
      </h2>
      <q-input
        filled
        v-model="loginForm.email"
        label="E-mail"
        :label-color="isLoginActive ? 'accent' : 'secondary'"
        class="q-my-md"
        :color="isLoginActive ? 'secondary bg-primary' : 'accent'"
        :disable="!isLoginActive"
      />

      <q-input
        filled
        type="password"
        v-model="loginForm.password"
        label="Senha"
        :label-color="isLoginActive ? 'accent' : 'secondary'"
        class="q-my-md"
        :color="isLoginActive ? 'secondary bg-primary' : 'accent'"
        :disable="!isLoginActive"
      />

      <q-btn
        label="Entrar"
        :color="isLoginActive ? 'primary bg-accent' : 'secondary'"
        class="full-width q-my-md"
        @click="handleLogin"
        :disable="!isLoginActive"
      />
      <q-btn flat label="Criar conta" class="full-width" @click="isLoginActive = false" />
    </q-form>

    <!-- REGISTER -->
    <q-form
      v-show="isLargeScreen || !isLoginActive"
      class="column q-pa-lg rounded-borders shadow-10 transition-all duration-300"
      style="width: 600px; height: 500px"
      :class="!isLoginActive ? 'bg-secondary text-primary' : 'bg-primary text-accent'"
    >
      <h2 class="text-center text-h5 q-mb-lg cursor-pointer" @click="isLoginActive = false">
        Cadastre-se
      </h2>

      <q-input
        filled
        v-model="registerForm.name"
        label="Nome"
        :label-color="!isLoginActive ? 'accent' : 'secondary'"
        class="q-mb-md"
        :disable="isLoginActive"
        :color="!isLoginActive ? 'secondary bg-primary' : 'accent'"
      />

      <q-input
        filled
        v-model="registerForm.email"
        label="E-mail"
        :label-color="!isLoginActive ? 'accent' : 'secondary'"
        class="q-mb-md"
        :color="!isLoginActive ? 'secondary bg-primary' : 'accent'"
        :disable="isLoginActive"
      />

      <q-input
        filled
        type="password"
        v-model="registerForm.password"
        label="Senha"
        :label-color="!isLoginActive ? 'accent' : 'secondary'"
        class="q-mb-lg"
        :color="!isLoginActive ? 'secondary bg-primary' : 'accent '"
        :disable="isLoginActive"
      />

      <q-btn
        label="Cadastrar"
        :color="!isLoginActive ? 'primary bg-accent' : 'secondary'"
        class="full-width q-mb-md"
        @click="handleRegister"
        :disable="isLoginActive"
      />

      <q-btn flat label="Já tenho conta" class="full-width" @click="isLoginActive = true" />
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Notify } from 'quasar';
import { useUserStore } from 'src/stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const isLoginActive = ref(true);
const isLargeScreen = ref(window.innerWidth >= 800);

const loginForm = ref({ email: '', password: '' });
const registerForm = ref({ name: '', email: '', password: '' });

async function handleLogin() {
  if (userStore.login(loginForm.value.email, loginForm.value.password)) {
    Notify.create(
      `Bem-vindo ${userStore.currentUser?.name}! Acesso: ${userStore.currentUser?.role}`,
    );
    await router.push('/documents');
  } else {
    //https://quasar.dev/quasar-plugins/notify/#example--positioning-and-different-options
    Notify.create('Credenciais inválidas!');
  }
}

async function handleRegister() {
  try {
    userStore.register(
      registerForm.value.name,
      registerForm.value.email,
      registerForm.value.password,
    );
    alert('Conta criada com sucesso!');
    isLoginActive.value = true;
    await router.push('/documents');
  } catch (e: unknown) {
    if (e instanceof Error) {
      alert(e.message);
    } else {
      alert('Ocorreu um erro inesperado');
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
