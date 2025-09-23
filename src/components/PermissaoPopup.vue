<template>
  <q-dialog v-model="internalModel">
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">{{ $t('permission.manage') }}</div>
      </q-card-section>

      <q-card-section>
        <q-input
          outlined
          label-color="accent"
          v-model="search"
          :label="$t('permission.searchUser')"
        />
        <q-list bordered>
          <q-item
            v-for="u in filteredUsers"
            :key="u.id"
            clickable
            @click="selectedUser = u"
            :active="selectedUser?.id === u.id"
          >
            <q-item-section>{{ u.name }}</q-item-section>
          </q-item>
        </q-list>

        <div v-if="selectedUser">
          <q-checkbox v-model="perms.canRead" :label="$t('permission.read')" color="accent" />
          <q-checkbox v-model="perms.canComment" :label="$t('permission.comment')" color="accent" />
          <q-checkbox v-model="perms.canEdit" :label="$t('documents.edit')" color="accent" />

          <div class="q-mt-md grid grid-cols-1 gap-2">
            <q-input
              filled
              v-model="expirationDate"
              :label="$t('permission.date')"
              label-color="accent"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="expirationDate"
                      mask="YYYY-MM-DD"
                      @input="expirationDate"
                      color="accent"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              filled
              v-model="expirationTime"
              :label="$t('permission.time')"
              label-color="accent"
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
        <q-btn flat :label="$t('common.cancel')" color="negative" @click="close" />
        <q-btn flat :label="$t('common.save')" color="positive" @click="savePerms" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useUserStore, type User } from 'src/stores/user';
import { useDocumentsStore, type Document } from 'src/stores/documents';
import { Notify } from 'quasar';

defineOptions({ name: 'PermissaoPopup' });

const props = defineProps<{ modelValue: boolean; doc: Document }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const userStore = useUserStore();
const documentsStore = useDocumentsStore();

const internalModel = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (internalModel.value = v),
);
watch(internalModel, (v) => emit('update:modelValue', v));

const search = ref('');
const selectedUser = ref<User | null>(null);
const perms = ref({ canRead: true, canComment: false, canEdit: false });

const expirationDate = ref('');
const expirationTime = ref('');

const filteredUsers = computed(() =>
  userStore.users.filter(
    (u) => u.role === 'user' && u.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

function savePerms() {
  if (!props.doc || !selectedUser.value) return;
  if (!expirationDate.value || !expirationTime.value) return;

  const expiresAt = new Date(`${expirationDate.value}T${expirationTime.value}:59`).getTime();

  const now = Date.now();

  if (expiresAt <= now) {
    console.warn('A data de expiração deve ser no futuro.');
    Notify.create({
      type: 'negative',
      message: 'A data de expiração deve ser no futuro.',
    });
    return;
  }

  const selectedPerms: ('read' | 'comment' | 'edit')[] = [];
  if (perms.value.canRead) selectedPerms.push('read');
  if (perms.value.canComment) selectedPerms.push('comment');
  if (perms.value.canEdit) selectedPerms.push('edit');

  documentsStore.setPermission(props.doc.id, selectedUser.value.id, selectedPerms, expiresAt);
  selectedUser.value = null;
  perms.value = { canComment: false, canEdit: false, canRead: true };
  expirationDate.value = '';
  expirationTime.value = '';

  internalModel.value = false;
}

function close() {
  internalModel.value = false;
}
</script>
