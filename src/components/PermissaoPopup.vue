<template>
  <q-dialog v-model="internalModel" persistent>
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">Gerenciar Permissões</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="search" label="Buscar usuário" outlined />
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

        <div v-if="selectedUser" class="q-mt-md">
          <q-checkbox v-model="perms.canRead" label="Leitura" />
          <q-checkbox v-model="perms.canComment" label="Comentar" />
          <q-checkbox v-model="perms.canEdit" label="Editar" />

          <q-select
            v-model="duration"
            :options="durationOptions"
            label="Tempo de acesso"
            outlined
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="close" />
        <q-btn flat label="Salvar" color="primary" @click="savePerms" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserStore, type User } from 'src/stores/user'
import { useDocumentsStore, type Document } from 'src/stores/documents'

const props = defineProps<{
  modelValue: boolean
  doc: Document
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const userStore = useUserStore()
const documentsStore = useDocumentsStore()

const internalModel = ref(props.modelValue)
watch(() => props.modelValue, v => internalModel.value = v)
watch(internalModel, v => emit('update:modelValue', v))

const search = ref('')
const selectedUser = ref<User | null>(null)
const perms = ref({ canRead: true, canComment: false, canEdit: false })
const duration = ref<'1h' | '24h' | '7d'>('24h')

const durationOptions = [
  { label: '1 hora', value: '1h' },
  { label: '24 horas', value: '24h' },
  { label: '7 dias', value: '7d' },
]

const filteredUsers = computed(() =>
  userStore.users.filter(
    u =>
      u.role === 'user' &&
      u.name.toLowerCase().includes(search.value.toLowerCase())
  )
)


function getDurationMs() {
  if (duration.value === '1h') return 1 * 60 * 60 * 1000
  if (duration.value === '24h') return 24 * 60 * 60 * 1000
  if (duration.value === '7d') return 7 * 24 * 60 * 60 * 1000

  return 0
}

function savePerms() {
  if (!props.doc || !selectedUser.value) return
  documentsStore.setPermission(
    props.doc.id,
    selectedUser.value.id,
    perms.value,
    getDurationMs()
  )
  internalModel.value = false
}

function close() {
  internalModel.value = false
}
</script>
