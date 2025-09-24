<template>
  <q-page class="bg-background dark:!bg-dark-page">
    <div class="row items-center justify-between">
      <q-title class="text-lg text-secondary dark:!text-text p-6">{{
        $t('permission.title')
      }}</q-title>
    </div>

    <q-table
      flat
      bordered
      row-key="id"
      class="bg-background dark:!bg-dark-page m-3"
      :rows="userRows"
      :columns="columns"
    >
      <template v-slot:body-cell-docs="props">
        <q-td auto-width :props="props">
          <q-btn
            size="sm"
            color="accent"
            dense
            @click="handleShow"
            :icon="showDocsPopup ? 'close' : 'add'"
            label="Visualizar"
            class="p-2"
          />
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
                      color="accent"
                      @update:model-value="onEditDate"
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
          <q-btn flat color="negative" label="Cancelar" v-close-popup />
          <q-btn flat color="positive" label="Salvar" @click="savePermissionEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <docs-popup v-model="showDocsPopup" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from 'src/stores/user';
import { useDocumentsStore } from 'src/stores/documents';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import DocsPopup from 'src/components/DocsPopup.vue';

const $q = useQuasar();
const { t: $t } = useI18n();

const userStore = useUserStore();
const documentsStore = useDocumentsStore();

const showDocsPopup = ref(false);

const handleShow = () => {
  showDocsPopup.value = !showDocsPopup.value;
};

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

const userRows = computed(() =>
  userStore.users
    .filter((u) => u.role === 'user')
    .map((u) => {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
      };
    }),
);

const columns = computed(() => [
  { name: 'name', label: $t('user'), field: 'name', align: 'left' as const },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' as const },
  { name: 'docs', label: 'Documentos e Permissões', field: 'docs', align: 'left' as const },
  { name: 'actions', label: 'Revogar Acessos', field: 'actions', align: 'center' as const },
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
