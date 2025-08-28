<template>
  <q-dialog v-model="internalModel" persistent>
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">{{ $t('permission.manage') }}</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="search" :label="$t('permission.searchUser')" outlined />
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
          <q-checkbox v-model="perms.canRead" :label="$t('permission.read')" />
          <q-checkbox v-model="perms.canComment" :label="$t('permission.comment')" />
          <q-checkbox v-model="perms.canEdit" :label="$t('permission.edit')" />

          <!-- Novo: seleção de data/hora personalizada -->
          <div class="q-mt-md">
            <q-input filled v-model="expirationDate" :label="$t('permission.date')">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="expirationDate" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input filled v-model="expirationTime" :label="$t('permission.time')">
              <template v-slot:append>
                <q-icon name="schedule" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="expirationTime" mask="HH:mm" format24h />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" color="grey" @click="close" />
        <q-btn flat :label="$t('common.save')" color="primary" @click="savePerms" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserStore, type User } from 'src/stores/user'
import { useDocumentsStore, type Document } from 'src/stores/documents'

const props = defineProps<{ modelValue: boolean; doc: Document }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const userStore = useUserStore()
const documentsStore = useDocumentsStore()

const internalModel = ref(props.modelValue)
watch(() => props.modelValue, v => (internalModel.value = v))
watch(internalModel, v => emit('update:modelValue', v))

const search = ref('')
const selectedUser = ref<User | null>(null)
const perms = ref({ canRead: true, canComment: false, canEdit: false })

// novos campos p/ expiração personalizada
const expirationDate = ref('')
const expirationTime = ref('')

const filteredUsers = computed(() =>
  userStore.users.filter(
    u =>
      u.role === 'user' &&
      u.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

function savePerms() {
  if (!props.doc || !selectedUser.value) return
  if (!expirationDate.value || !expirationTime.value) return

  // monta o timestamp da data/hora escolhida
  const expiresAt = new Date(`${expirationDate.value}T${expirationTime.value}:00`).getTime()

  // corrige o filtro para pegar os valores dos checkboxes
  const selectedPerms: ('read' | 'comment' | 'edit')[] = []
  if (perms.value.canRead) selectedPerms.push('read')
  if (perms.value.canComment) selectedPerms.push('comment')
  if (perms.value.canEdit) selectedPerms.push('edit')

  documentsStore.setPermission(
    props.doc.id,
    selectedUser.value.id,
    selectedPerms,
    expiresAt
  )

  internalModel.value = false
}


function close() {
  internalModel.value = false
}
</script>
