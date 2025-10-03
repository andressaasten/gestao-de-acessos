<template>
  <q-dialog v-model="internalModel">
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">{{ $t('permission.manage') }}</div>
      </q-card-section>

      <q-card-section>
        <div class="q-gutter-md row items-start">
          <q-select
            v-model="selectedUser"
            filled
            use-input
            fill-input
            hide-selected
            option-label="name"
            option-value="id"
            :label="$t('permission.searchUser')"
            :input-debounce="300"
            :options="filterOptions"
            @filter="filterFn"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="q-mt-md gap-2">
          <q-checkbox v-model="perms.canRead" color="accent" :label="$t('permission.read')" />
          <q-checkbox v-model="perms.canComment" color="accent" :label="$t('permission.comment')" />
          <q-checkbox v-model="perms.canEdit" color="accent" :label="$t('documents.edit')" />

          <div class="q-mt-md grid grid-cols-1 gap-2">
            <q-input
              v-model="expirationDate.expirationDateDisplay"
              filled
              label-color="accent"
              :label="$t('permission.date')"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="expirationDate.expirationDateIso"
                      mask="YYYY-MM-DD"
                      color="accent"
                      @update:model-value="onDateChange"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="expirationTime"
              filled
              label-color="accent"
              :label="$t('permission.time')"
            >
              <template v-slot:append>
                <q-icon name="schedule" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="expirationTime" mask="HH:mm" format24h color="accent" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="negative" :label="$t('common.cancel')" @click="close" />
        <q-btn flat color="positive" :label="$t('common.save')" @click="savePerms" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { setPermission } from 'src/services/documentService';
import { Notify } from 'quasar';
import { getAllUsers } from 'src/services/userServices';
import type { User } from 'src/types/interfaces/IUser';
import type { Document } from 'src/types/interfaces/IDocuments';

defineOptions({ name: 'PermissaoPopup' });

const props = defineProps<{ modelValue: boolean; doc: Document | null }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const allUsers = getAllUsers().filter((u) => u.role === 'user');
const filterOptions = ref<User[]>([...allUsers]);
const selectedUser = ref<User | null>(null);
const perms = ref({ canRead: true, canComment: false, canEdit: false });

const expirationTime = ref('');
const expirationDate = ref({
  expirationDateIso: '',
  expirationDateDisplay: '',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterFn(val: string, update: any) {
  update(() => {
    if (val === '') {
      filterOptions.value = allUsers;
    } else {
      const needle = val.toLowerCase();
      filterOptions.value = allUsers.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
    }
  });
}

const internalModel = ref(props.modelValue);

watch(
  () => props.modelValue,
  (v) => (internalModel.value = v),
);
watch(internalModel, (v) => emit('update:modelValue', v));

function onDateChange(val: string) {
  expirationDate.value.expirationDateIso = val;
  if (val) {
    const [y, m, d] = val.split('-');
    expirationDate.value.expirationDateDisplay = `${d}/${m}/${y}`;
  } else {
    expirationDate.value.expirationDateDisplay = '';
  }
}

function savePerms() {
  if (!props.doc || !selectedUser.value || selectedUser.value.id == null) {
    return;
  }

  if (!expirationDate.value || !expirationTime.value) {
    return;
  }

  const expiresAt = new Date(
    `${expirationDate.value.expirationDateIso}T${expirationTime.value}:00`,
  ).getTime();

  const now = Date.now();
  const iso = new Date(now).toISOString().slice(0, 10);

  if (expiresAt <= now) {
    console.warn('A data de expiração deve ser no futuro.');

    Notify.create({
      type: 'negative',
      message: 'A data de expiração deve ser no futuro.',
    });

    return;
  }

  const selectedPerms: ('read' | 'comment' | 'edit')[] = [];
  if (perms.value.canRead) {
    selectedPerms.push('read');
  }

  if (perms.value.canComment) {
    selectedPerms.push('comment');
  }

  if (perms.value.canEdit) {
    selectedPerms.push('edit');
  }

  setPermission(props.doc.id, selectedUser.value.id, selectedPerms, expiresAt);

  perms.value = { canComment: false, canEdit: false, canRead: true };
  expirationDate.value.expirationDateIso = iso;
  expirationDate.value.expirationDateDisplay = iso
    ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
    : '';
  expirationTime.value = '';

  internalModel.value = false;
}

function close() {
  internalModel.value = false;
}
</script>
