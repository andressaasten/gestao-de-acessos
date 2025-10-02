<template>
  <q-page class="bg-background dark:!bg-dark-page">
    <div class="row items-center justify-between">
      <p class="text-lg text-secondary dark:!text-text p-6">{{ $t('permission.title') }}</p>
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
            dense
            label="Visualizar"
            size="sm"
            color="accent"
            class="p-2"
            :icon="showDocsPopup && props.row.id == selectedUser.id ? 'close' : 'add'"
            @click="handleShow(props.row)"
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
          <p class="text-h6">{{ $t('common.confirm') }}</p>
          <div>{{ confirmMessage }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="$t('documents.delete')" />
          <q-btn flat color="negative" :label="$t('common.confirm')" @click="rescindConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <DocsPopup v-model="showDocsPopup" :user="selectedUser" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { removeAllPermissions } from 'src/services/documentService';
import { getAllUsers } from 'src/services/userServices';
import { useI18n } from 'vue-i18n';
import DocsPopup from 'src/components/DocsPopup.vue';

const { t: $t } = useI18n();

const showDocsPopup = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedUser = ref<any>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleShow = (user: any) => {
  selectedUser.value = user;
  showDocsPopup.value = !showDocsPopup.value;
};

// CONFIRMAR RESCINDIR
const confirmDialog = ref(false);
const confirmMessage = ref('');
const pendingAction = ref<null | (() => void)>(null);

// --------- EXISTENTES --------
function confirmRescindAll(userId: number) {
  confirmMessage.value = 'Deseja realmente rescindir todas as permissões deste usuário?';
  confirmDialog.value = true;
  pendingAction.value = () => removeAllPermissions(userId);
}

function rescindConfirmed() {
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
  confirmDialog.value = false;
}

const userRows = computed(() =>
  getAllUsers()
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
