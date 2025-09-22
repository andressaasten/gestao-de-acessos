<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
    <div class="row items-center justify-between q-mb-lg">
      <q-title class="text-lg q-ml-md">{{ $t('permission.title') }}</q-title>
    </div>

    <q-table :rows="userRows" :columns="columns" row-key="id" flat bordered>
      <template v-slot:body-cell-docs="props">
        <q-td :props="props">
          <div v-for="perm in props.row.docs" :key="perm.docId" class="q-mb-md">
            <div class="text-bold">{{ perm.docTitle }}</div>
            <div class="text-caption">
              <span v-if="perm.isValid" :class="timeColor(perm)">
                {{ perm.remaining }}
              </span>
              <span v-else class="text-negative">
                Expirado em {{ formatDate(perm.expiresAt) }}
              </span>
            </div>
            <div class="q-mt-xs">
              <q-chip
                v-if="perm.perms.includes('read')"
                color="purple"
                text-color="white"
                size="sm"
                >{{ $t('permission.read') }}</q-chip
              >
              <q-chip
                v-if="perm.perms.includes('comment')"
                color="blue"
                text-color="white"
                size="sm"
                >{{ $t('permission.comment') }}</q-chip
              >
              <q-chip
                v-if="perm.perms.includes('edit')"
                color="teal"
                text-color="white"
                size="sm"
                >{{ $t('permission.edit') }}</q-chip
              >
            </div>
            <div class="q-mt-sm row q-gutter-sm">
              <q-btn
                dense
                flat
                color="accent"
                :label="$t('permission.edit')"
                @click="openEditPermission(props.row.id, perm)"
              />
              <q-btn
                dense
                flat
                color="negative"
                :label="$t('documents.delete')"
                @click="confirmRescind(props.row.id, perm.docId)"
              />
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            color="negative"
            :label="$t('permission.revoke')"
            @click="confirmRescindAll(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- CONFIRMAÇÃO -->
    <q-dialog v-model="confirmDialog">
      <q-card>
        <q-card-section>
          <q-title class="text-h6">{{ $t('common.confirm') }}</q-title>
          <div>{{ confirmMessage }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('documents.delete')" v-close-popup />
          <q-btn flat :label="$t('common.confirm')" color="negative" @click="rescindConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- EDITAR PERMISSÕES -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">{{ $t('permission.edit') }}</div>
          <div>{{ editDoc?.docTitle }}</div>
        </q-card-section>

        <q-card-section>
          <!-- Checkboxes -->
          <q-checkbox
            v-model="editForm.perms.canRead"
            :label="$t('permission.read')"
            color="accent"
          />
          <q-checkbox
            v-model="editForm.perms.canComment"
            :label="$t('permission.comment')"
            color="accent"
          />
          <q-checkbox
            v-model="editForm.perms.canEdit"
            :label="$t('documents.edit')"
            color="accent"
          />

          <!-- Date / Time Picker -->
          <div class="q-mt-md grid grid-cols-1 gap-2">
            <q-input
              filled
              v-model="editForm.expirationDateDisplay"
              :label="$t('permission.date')"
              label-color="accent"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="editForm.expirationDateIso"
                      mask="YYYY-MM-DD"
                      @input="onEditDate"
                      color="accent"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              filled
              v-model="editForm.expirationTime"
              :label="$t('permission.time')"
              label-color="accent"
            >
              <template v-slot:append>
                <q-icon name="schedule" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time
                      v-model="editForm.expirationTime"
                      mask="HH:mm"
                      format24h
                      color="accent"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="secondary" label="Salvar" @click="savePermissionEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from 'src/stores/user';
import { useDocumentsStore } from 'src/stores/documents';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t: $t } = useI18n();

const userStore = useUserStore();
const documentsStore = useDocumentsStore();

// CONFIRMAR RESCINDIR
const confirmDialog = ref(false);
const confirmMessage = ref('');
const pendingAction = ref<null | (() => void)>(null);

// ---- INTERFACES ----
export interface PermissionDisplay {
  docId: number;
  docTitle: string;
  perms: ('read' | 'comment' | 'edit')[];
  expiresAt: number;
  isValid: boolean;
  remainingMs: number;
  remaining: string;
}

// EDITAR PERMISSÃO
const editDialog = ref(false);
const editDoc = ref<PermissionDisplay | null>(null);
const editUserId = ref<number | null>(null);

const editForm = ref({
  perms: { canRead: false, canComment: false, canEdit: false },
  expirationDateIso: '',
  expirationDateDisplay: '',
  expirationTime: '',
});

function openEditPermission(userId: number, perm: PermissionDisplay) {
  editUserId.value = userId;
  editDoc.value = perm;
  const iso = new Date(perm.expiresAt).toISOString().slice(0, 10); // YYYY-MM-DD
  const time = new Date(perm.expiresAt).toISOString().slice(11, 16); // HH:mm
  editForm.value = {
    perms: {
      canRead: perm.perms.includes('read'),
      canComment: perm.perms.includes('comment'),
      canEdit: perm.perms.includes('edit'),
    },
    expirationDateIso: iso,
    expirationDateDisplay: iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '',
    expirationTime: time,
  };
  editDialog.value = true;
}

function onEditDate(val: string) {
  editForm.value.expirationDateIso = val;
  if (val) {
    const [y, m, d] = val.split('-');
    editForm.value.expirationDateDisplay = `${d}/${m}/${y}`;
  } else {
    editForm.value.expirationDateDisplay = '';
  }
}

function savePermissionEdit() {
  if (editUserId.value && editDoc.value) {
    if (!editForm.value.expirationDateIso || !editForm.value.expirationTime) {
      $q.notify({ type: 'negative', message: 'Preencha data e hora' });
      return;
    }
    const expiresAt = new Date(
      `${editForm.value.expirationDateIso}T${editForm.value.expirationTime}:59`,
    ).getTime();

    if (expiresAt <= Date.now()) {
      $q.notify({ type: 'negative', message: 'A data de expiração deve ser no futuro' });
      return;
    }

    const selectedPerms: ('read' | 'comment' | 'edit')[] = [];
    if (editForm.value.perms.canRead) selectedPerms.push('read');
    if (editForm.value.perms.canComment) selectedPerms.push('comment');
    if (editForm.value.perms.canEdit) selectedPerms.push('edit');

    documentsStore.setPermission(editDoc.value.docId, editUserId.value, selectedPerms, expiresAt);
    $q.notify({ type: 'positive', message: 'Permissão atualizada' });
  }
  editDialog.value = false;
}

// --------- EXISTENTES --------
function confirmRescind(userId: number, docId: number) {
  confirmMessage.value = 'Deseja realmente rescindir o acesso deste documento?';
  confirmDialog.value = true;
  pendingAction.value = () => documentsStore.removePermission(docId, userId);
}

function confirmRescindAll(userId: number) {
  confirmMessage.value = 'Deseja realmente rescindir todas as permissões deste usuário?';
  confirmDialog.value = true;
  pendingAction.value = () => documentsStore.removeAllPermissions(userId);
}

function rescindConfirmed() {
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
  confirmDialog.value = false;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  // DD/MM/YYYY HH:mm
  const ds = d.toLocaleDateString('pt-BR');
  const tsPart = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${ds} ${tsPart}`;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return 'Expirado';
  const sec = Math.floor(ms / 1000);
  if (ms < 60 * 1000) {
    return `${sec} s`;
  }
  const min = Math.floor(ms / (60 * 1000));
  if (ms < 60 * 60 * 1000) {
    return `${min} min`;
  }
  const hrs = Math.floor(ms / (60 * 60 * 1000));
  if (ms < 24 * 60 * 60 * 1000) {
    return `${hrs} h`;
  }
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days < 30) return `${days} D`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} M`;
  const years = Math.floor(days / 365);
  return `${years} A`;
}

function timeColor(perm: PermissionDisplay) {
  if (perm.remainingMs <= 0) return 'text-negative text-bold';
  if (perm.remainingMs < 60 * 60 * 1000) return 'text-yellow-600 text-bold';
  return 'text-positive';
}

const userRows = computed(() =>
  userStore.users
    .filter((u) => u.role === 'user')
    .map((u) => {
      const docs: PermissionDisplay[] = documentsStore.getPermissionsByUser(u.id).map((p) => {
        const now = Date.now();
        const remainingMs = p.expiresAt - now;
        return {
          docId: p.docId,
          docTitle: documentsStore.getDocTitle(p.docId),
          perms: p.perms,
          expiresAt: p.expiresAt,
          isValid: remainingMs > 0,
          remainingMs,
          remaining: remainingMs > 0 ? formatRemaining(remainingMs) : 'Expirado',
        };
      });
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        docs,
      };
    }),
);

const columns = computed(() => [
  { name: 'name', label: $t('user'), field: 'name', align: 'left' as const },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' as const },
  { name: 'docs', label: 'Documentos e Permissões', field: 'docs', align: 'left' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' as const },
]);
</script>

<style scoped>
.min-w-\[220px\] {
  min-width: 220px;
}
.max-w-\[320px\] {
  max-width: 320px;
}
</style>
