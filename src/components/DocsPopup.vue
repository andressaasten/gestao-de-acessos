<template>
  <q-dialog>
    <q-table
      flat
      bordered
      row-key="id"
      class="bg-background dark:!bg-dark-page m-3"
      :rows="userRows"
      :columns="columns"
    >
      <template v-slot:body-cell-docs="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>
        <q-td :props="props">
          <div v-for="perm in props.row.docs" :key="perm.docId">
            <div class="text-bold">{{ perm.docTitle }}</div>
            <div class="text-caption">
              <span v-if="perm.isValid" :class="timeColor(perm)">
                {{ perm.remaining }}
              </span>
              <span v-else class="text-negative">
                Expirado em {{ formatDate(perm.expiresAt) }}
              </span>
            </div>
            <div>
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
            <div class="row q-gutter-sm">
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
    </q-table>
  </q-dialog>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from 'src/stores/user';
import { useDocumentsStore } from 'src/stores/documents';

defineOptions({ name: 'DocsPopup' });

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

function confirmRescind(userId: number, docId: number) {
  confirmMessage.value = 'Deseja realmente rescindir o acesso deste documento?';
  confirmDialog.value = true;
  pendingAction.value = () => documentsStore.removePermission(docId, userId);
}

function formatDate(ts: number) {
  const d = new Date(ts);
  // DD/MM/YYYY HH:mm
  const ds = d.toLocaleDateString('pt-BR');
  const tsPart = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${ds} ${tsPart}`;
}

function timeColor(perm: PermissionDisplay) {
  if (perm.remainingMs <= 0) return 'text-negative text-bold';
  if (perm.remainingMs < 60 * 60 * 1000) return 'text-yellow-600 text-bold';
  return 'text-positive';
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

const userRows = computed(() =>
  userStore.users
    .map((u) => {
      const docs = documentsStore.getPermissionsByUser(u.id).map((p) => {
        const now = Date.now();
        const remainingMs = p.expiresAt - now;
        return {
          docTitle: documentsStore.getDocTitle(p.docId),
          perms: p.perms,
          remaining: remainingMs > 0 ? formatRemaining(remainingMs) : 'Expirado',
        };
      });
      return docs;
    })
    .flat(),
);

const columns = computed(() => [
  { name: 'docTitle', label: 'Nome', field: 'docTitle', align: 'left' as const },
  { name: 'perms', label: 'E-mail', field: 'perms', align: 'left' as const },
  {
    name: 'remaining',
    label: 'Documentos e Permissões',
    field: 'remaining',
    align: 'left' as const,
  },
]);
</script>
