<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-primary'">
    <div class="row items-center justify-between q-mb-lg">
      <h4>Gerenciamento de Permissões</h4>
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
                color="primary"
                text-color="white"
                size="sm"
                >Leitura</q-chip
              >
              <q-chip
                v-if="perm.perms.includes('comment')"
                color="orange"
                text-color="white"
                size="sm"
                >Comentar</q-chip
              >
              <q-chip v-if="perm.perms.includes('edit')" color="teal" text-color="white" size="sm"
                >Editar</q-chip
              >
            </div>
            <div class="q-mt-sm row q-gutter-sm">
              <q-btn
                dense
                flat
                color="accent"
                label="Editar"
                @click="openEditPermission(props.row.id, perm)"
              />
              <q-btn
                dense
                flat
                color="negative"
                label="Excluir"
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
            label="Revogar tudo"
            @click="confirmRescindAll(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- CONFIRMAÇÃO -->
    <q-dialog v-model="confirmDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmação</div>
          <div>{{ confirmMessage }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Confirmar" color="negative" @click="rescindConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- EDITAR PERMISSÕES -->
    <!-- EDITAR PERMISSÕES -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">Editar Permissões</div>
          <div>{{ editDoc?.docTitle }}</div>
        </q-card-section>

        <q-card-section>
          <!-- Checkboxes -->
          <q-checkbox v-model="editForm.perms.canRead" label="Leitura" />
          <q-checkbox v-model="editForm.perms.canComment" label="Comentar" />
          <q-checkbox v-model="editForm.perms.canEdit" label="Editar" />

          <!-- Date / Time Picker -->
          <div class="q-mt-md">
            <q-input filled v-model="editForm.expirationDate" label="Data de expiração">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="editForm.expirationDate" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input filled v-model="editForm.expirationTime" label="Hora de expiração">
              <template v-slot:append>
                <q-icon name="schedule" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="editForm.expirationTime" mask="HH:mm" format24h />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Salvar" @click="savePermissionEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from 'src/stores/user';
import { useDocumentsStore } from 'src/stores/documents';

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
  expirationDate: '',
  expirationTime: '',
});

function openEditPermission(userId: number, perm: PermissionDisplay) {
  editUserId.value = userId;
  editDoc.value = perm;
  editForm.value = {
    perms: {
      canRead: perm.perms.includes('read'),
      canComment: perm.perms.includes('comment'),
      canEdit: perm.perms.includes('edit'),
    },
    expirationDate: new Date(perm.expiresAt).toISOString().slice(0, 10), // YYYY-MM-DD
    expirationTime: new Date(perm.expiresAt).toISOString().slice(11, 16), // HH:mm
  };
  editDialog.value = true;
}

function savePermissionEdit() {
  if (editUserId.value && editDoc.value) {
    const expiresAt = new Date(
      `${editForm.value.expirationDate}T${editForm.value.expirationTime}:00`,
    ).getTime();

    const selectedPerms: ('read' | 'comment' | 'edit')[] = [];
    if (editForm.value.perms.canRead) selectedPerms.push('read');
    if (editForm.value.perms.canComment) selectedPerms.push('comment');
    if (editForm.value.perms.canEdit) selectedPerms.push('edit');

    documentsStore.setPermission(editDoc.value.docId, editUserId.value, selectedPerms, expiresAt);
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
  return new Date(ts).toLocaleString();
}

function timeColor(perm: PermissionDisplay) {
  if (perm.remainingMs < 60 * 60 * 1000) return 'text-negative text-bold';
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
          remaining:
            remainingMs > 0
              ? remainingMs < 60 * 60 * 1000
                ? `Expira em ${Math.floor(remainingMs / 60000)} min`
                : `Expira em ${Math.floor(remainingMs / 3600000)} h`
              : 'Expirado',
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

const columns = [
  { name: 'name', label: 'Usuário', field: 'name', align: 'left' as const },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' as const },
  { name: 'docs', label: 'Documentos e Permissões', field: 'docs', align: 'left' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' as const },
];
</script>
