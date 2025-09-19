<template>
  <q-dialog v-model="internalModel" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6 text-center">{{ $t('register.edition') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="save">
          <div class="text-subtitle2 q-mb-sm">{{ $t('register.data') }}</div>
          <q-input
            v-model="form.name"
            :label="$t('register.name')"
            label-color="accent"
            outlined
            class="q-mb-sm"
          />

          <q-input
            v-model="form.email"
            :label="$t('register.email')"
            label-color="accent"
            outlined
            class="q-mb-md"
          />

          <div class="text-subtitle2 q-mb-sm"></div>
          <q-input
            v-model="form.oldPassword"
            type="password"
            :label="$t('register.currentPassword')"
            label-color="accent"
            outlined
            class="q-mb-md"
          />

          <div class="text-subtitle2 q-mb-sm">{{ $t('register.change') }}</div>
          <q-input
            v-model="form.newPassword"
            type="password"
            :label="$t('register.newPassword')"
            label-color="accent"
            outlined
            class="q-mb-sm"
            lazy-rules
            :rules="[validateSenha]"
          />
          <q-input
            v-model="form.confirmPassword"
            type="password"
            :label="$t('register.confirmPassword')"
            label-color="accent"
            outlined
            lazy-rules
            :rules="[validateSenha]"
          />

          <q-card-actions align="right">
            <q-btn flat :label="$t('common.cancel')" color="negative" @click="close" />
            <q-btn flat :label="$t('common.save')" color="positive" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUserStore } from 'src/stores/user';
import CryptoJS from 'crypto-js';
import { Notify } from 'quasar';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const userStore = useUserStore();

const internalModel = ref(props.modelValue);
watch(
  () => props.modelValue,
  (val) => (internalModel.value = val),
);
watch(internalModel, (val) => emit('update:modelValue', val));

const validateSenha = (val: string): true | string => {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{5,}$/;
  return regex.test(val) || 'Senha inválida';
};

const form = ref({
  name: userStore.currentUser?.name || '',
  email: userStore.currentUser?.email || '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

function save() {
  try {
    if (!form.value.oldPassword) {
      Notify.create('Informe sua senha atual para confirmar as alterações!');
      return;
    }

    const oldHash = CryptoJS.SHA256(form.value.oldPassword).toString();
    if (userStore.currentUser?.password !== oldHash) {
      Notify.create('Senha atual incorreta!');
      return;
    }

    const payload: { name?: string; email?: string; password?: string } = {
      name: form.value.name,
      email: form.value.email,
    };

    if (form.value.newPassword || form.value.confirmPassword) {
      if (form.value.newPassword !== form.value.confirmPassword) {
        Notify.create('As novas senhas não coincidem!');
        return;
      }
      payload.password = form.value.newPassword;
    }

    userStore.updateProfile(payload);
    internalModel.value = false;
    Notify.create('Perfil atualizado com sucesso!');
    form.value.confirmPassword = '';
    form.value.newPassword = '';
    form.value.oldPassword = '';
  } catch (e: unknown) {
    if (e instanceof Error) {
      Notify.create(e.message);
    } else {
      Notify.create('Erro inesperado');
    }
  }
}

function close() {
  internalModel.value = false;
  form.value.confirmPassword = '';
  form.value.newPassword = '';
  form.value.oldPassword = '';
}
</script>
