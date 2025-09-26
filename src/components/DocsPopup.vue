<template>
  <q-dialog>
    <q-card>
      <q-btn icon="close" v-close-popup />
      <q-table
        row-key="docId"
        class="flex flex-nowrap bg-background dark:!bg-dark-page m-3"
        :rows="userRows"
        :columns="columns"
      >
        <!-- Nome do Documento -->
        <template v-slot:body-cell-docTitle="props">
          <q-td :props="props">
            <div class="text-bold">{{ props.row.docTitle }}</div>
          </q-td>
        </template>

        <!-- Permissões -->
        <template v-slot:body-cell-perms="props">
          <q-td :props="props">
            <div>
              <q-chip
                v-if="props.row.perms.includes('read')"
                color="purple"
                text-color="white"
                size="sm"
              >
                {{ $t('permission.read') }}
              </q-chip>
              <q-chip
                v-if="props.row.perms.includes('comment')"
                color="blue"
                text-color="white"
                size="sm"
              >
                {{ $t('permission.comment') }}
              </q-chip>
              <q-chip
                v-if="props.row.perms.includes('edit')"
                color="teal"
                text-color="white"
                size="sm"
              >
                {{ $t('permission.edit') }}
              </q-chip>
            </div>
          </q-td>
        </template>

        <!-- Validade -->
        <template v-slot:body-cell-remaining="props">
          <q-td :props="props">
            <span v-if="props.row.isValid" :class="timeColor(props.row)">
              {{ props.row.remaining }}
            </span>
            <span v-else class="text-negative">
              {{ formatDate(props.row.expiresAt) }}
            </span>
          </q-td>
        </template>

        <!-- Ações -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              dense
              flat
              color="accent"
              icon="edit"
              @click="openEditPermission(props.row.userId, props.row)"
            />
            <q-btn
              dense
              flat
              color="negative"
              icon="delete"
              @click="confirmRescind(props.row.userId, props.row.docId)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

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
          <div class="grid grid-cols-1 gap-2">
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
          <q-btn flat color="negative" :label="$t('common.cancel')" v-close-popup />
          <q-btn flat color="positive" label="$t('common.cancel')" @click="savePermissionEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- CONFIRMAÇÃO -->
    <q-dialog v-model="confirmDialog">
      <q-card>
        <q-card-section>
          <p class="text-h6">{{ $t('common.confirm') }}</p>
          <div>{{ confirmMessage }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('documents.delete')" v-close-popup />
          <q-btn flat :label="$t('common.confirm')" color="negative" @click="rescindConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDocumentsStore } from 'src/stores/documents';
import { useQuasar } from 'quasar';

defineOptions({ name: 'DocsPopup' });

const $q = useQuasar();

const documentsStore = useDocumentsStore();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const props = defineProps<{ user: any }>();

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

function rescindConfirmed() {
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
  confirmDialog.value = false;
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

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Expirado';

  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec} segundo${sec === 1 ? '' : 's'}`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minuto${min === 1 ? '' : 's'}`;

  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hora${hrs === 1 ? '' : 's'}`;

  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} dia${days === 1 ? '' : 's'}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mês${months === 1 ? '' : 'es'}`;

  const years = Math.floor(days / 365);
  return `${years} ano${years === 1 ? '' : 's'}`;
}

const userRows = computed(() => {
  if (!props.user) return [];

  return documentsStore.getPermissionsByUser(props.user.id).map((p) => {
    const now = Date.now();
    const remainingMs = p.expiresAt - now;
    return {
      userId: props.user.id,
      docId: p.docId,
      docTitle: documentsStore.getDocTitle(p.docId),
      perms: p.perms,
      expiresAt: p.expiresAt,
      isValid: remainingMs > 0,
      remainingMs,
      remaining: remainingMs > 0 ? formatRemaining(remainingMs) : 'Expirado',
    };
  });
});

const columns = computed(() => [
  { name: 'docTitle', label: 'Documento', field: 'docTitle', align: 'left' as const },
  { name: 'perms', label: 'Permissões', field: 'perms', align: 'left' as const },
  { name: 'remaining', label: 'Validade', field: 'remaining', align: 'left' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const },
]);
</script>
