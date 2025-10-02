<template>
  <q-dialog v-model="internalModel" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6 text-center">{{ $t('register.edition') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="save">
          <div class="text-subtitle2">{{ $t('register.data') }}</div>
          <q-input v-model="form.name" :label="$t('register.name')" label-color="accent" outlined />

          <q-input v-model="form.email" :label="$t('login.email')" label-color="accent" outlined />

          <div class="text-subtitle2"></div>
          <q-input
            v-model="form.oldPassword"
            type="password"
            :label="$t('register.currentPassword')"
            label-color="accent"
            outlined
          />

          <div class="text-subtitle2">{{ $t('register.change') }}</div>
          <q-input
            v-model="form.newPassword"
            type="password"
            :label="$t('register.newPassword')"
            label-color="accent"
            outlined
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
import { onMounted, ref, watch } from 'vue';
import { updateProfile } from 'src/services/userServices';
import CryptoJS from 'crypto-js';
import { Notify } from 'quasar';
import { useUserStore } from 'src/stores/userStore';
import type { User } from 'src/types/interfaces/IUser';

defineOptions({ name: 'EditorPopup' });

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const userStore = useUserStore();
const user = ref<User | null>(null);

const internalModel = ref(props.modelValue);
watch(
  () => props.modelValue,
  (val) => (internalModel.value = val),
);
watch(internalModel, (val) => emit('update:modelValue', val));

onMounted(() => {
  user.value = userStore.getUser();
});

const validateSenha = (val: string): true | string => {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{5,}$/;
  return regex.test(val) || 'Senha inválida';
};

const form = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
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
    if (user.value?.password !== oldHash) {
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

    updateProfile(payload);
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
