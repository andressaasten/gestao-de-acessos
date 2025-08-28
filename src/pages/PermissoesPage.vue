<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <h4>Gerenciamento de Permissões</h4>
    </div>

    <q-table
      :rows="userRows"
      :columns="columns"
      row-key="id"
      flat
      bordered
    >
      <template v-slot:body-cell-docs="props">
        <q-td :props="props">
          <div v-for="perm in props.row.docs" :key="perm.docId" class="q-mb-sm">
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
              <q-chip v-if="perm.perms.canRead" color="primary" text-color="white" size="sm">Leitura</q-chip>
              <q-chip v-if="perm.perms.canComment" color="orange" text-color="white" size="sm">Comentar</q-chip>
              <q-chip v-if="perm.perms.canEdit" color="teal" text-color="white" size="sm">Editar</q-chip>
            </div>
            <div class="q-mt-sm">
              <q-btn
                v-if="perm.isValid"
                dense flat color="blue"
                label="Estender"
                @click="extendPermission(props.row.id, perm.docId)"
              />
              <q-btn
                dense flat color="red"
                label="Rescindir"
                @click="confirmRescind(props.row.id, perm.docId)"
              />
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat dense color="red"
            label="Revogar tudo"
            @click="confirmRescindAll(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from 'src/stores/user'
import { useDocumentsStore } from 'src/stores/documents'

const userStore = useUserStore()
const documentsStore = useDocumentsStore()

const confirmDialog = ref(false)
const confirmMessage = ref('')
const pendingAction = ref<null | (() => void)>(null)

function confirmRescind(userId: number, docId: number) {
  confirmMessage.value = 'Deseja realmente rescindir o acesso deste documento?'
  confirmDialog.value = true
  pendingAction.value = () => documentsStore.removePermission(docId, userId)
}

function confirmRescindAll(userId: number) {
  confirmMessage.value = 'Deseja realmente rescindir todas as permissões deste usuário?'
  confirmDialog.value = true
  pendingAction.value = () => documentsStore.removeAllPermissions(userId)
}

function rescindConfirmed() {
  if (pendingAction.value) {
    pendingAction.value()
    pendingAction.value = null
  }
  confirmDialog.value = false
}

function extendPermission(userId: number, docId: number) {
  documentsStore.extendPermission(docId, userId, 24 * 60 * 60 * 1000)
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString()
}

function timeColor(perm: any) {
  if (perm.remainingMs < 60 * 60 * 1000) return 'text-negative text-bold'
  return 'text-positive'
}

const userRows = computed(() =>
  userStore.users
    .filter(u => u.role === 'user')
    .map(u => {
      const docs = documentsStore.getPermissionsByUser(u.id).map(p => {
        const now = Date.now()
        const remainingMs = p.expiresAt - now
        return {
          docId: p.docId,
          docTitle: documentsStore.getDocTitle(p.docId),
          perms: p.perms,
          expiresAt: p.expiresAt,
          isValid: remainingMs > 0,
          remainingMs,
          remaining: remainingMs > 0
            ? remainingMs < 60 * 60 * 1000
              ? `Expira em ${Math.floor(remainingMs / 60000)} min`
              : `Expira em ${Math.floor(remainingMs / 3600000)} h`
            : 'Expirado'
        }
      })
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        docs
      }
    })
)

const columns = [
  { name: 'name', label: 'Usuário', field: 'name', align: 'left' as const },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' as const },
  { name: 'docs', label: 'Documentos e Permissões', field: 'docs', align: 'left' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' as const }
]

</script>
