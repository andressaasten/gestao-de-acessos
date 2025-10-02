<template>
  <q-page class="bg-background dark:!bg-dark-page">
    <section class="row items-center justify-between">
      <div>
        <h1 class="text-lg text-secondary dark:!text-text p-6">{{ $t('documents.title') }}</h1>
      </div>

      <q-btn
        v-if="user?.role === 'admin'"
        color="primary dark:!bg-secondary"
        class="p-3 m-4"
        :label="$t('documents.new')"
        @click="showPopup = true"
      />
    </section>

    <section v-if="!readableDocs.length" class="flex flex-nowrap items-center justify-center h-64">
      <q-card class="p-6 text-center shadow-md bg-primary">
        <q-card-section>
          <div class="text-lg text-text dark:!text-dark">
            Você não possui acesso a nenhum documento
          </div>
        </q-card-section>
      </q-card>
    </section>

    <section v-else class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-stretch p-6">
      <q-card
        v-for="doc in readableDocs"
        class="flex flex-col shadow-md relative bg-primary dark:!bg-secondary"
        :key="doc.id"
      >
        <q-card-section>
          <div
            v-if="user?.role === 'user'"
            class="absolute-top-right p-2 m-2"
            :style="{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: statusColor(doc),
            }"
          >
            <q-tooltip>
              {{ statusLabel(doc) }}
            </q-tooltip>
          </div>
        </q-card-section>
        <q-card-section class="flex-1">
          <div class="text-h6 text-text">{{ doc.title }}</div>
          <div class="text-text">{{ doc.text }}</div>
        </q-card-section>

        <q-card-section>
          <div v-for="a in doc.attachments" class="p-2" :key="a.id">
            <q-img
              v-if="a.type === 'image'"
              style="max-width: 90px; max-height: 90px"
              :src="a.url"
              :alt="`Anexo: ${a.id}`"
              @click="openImage(a.url)"
            />
            <q-btn
              v-else
              flat
              label="Abrir PDF"
              aria-label="Abrir PDF"
              icon="picture_as_pdf"
              target="_blank"
              :href="a.url"
            />
          </div>
        </q-card-section>

        <q-card-section>
          <q-btn
            flat
            color="text"
            icon="comment"
            :label="$t('documents.comments')"
            @click="openComments(doc)"
          />
        </q-card-section>

        <q-btn
          v-if="user?.role === 'admin'"
          flat
          round
          dense
          color="text"
          icon="more_vert"
          class="absolute-top-right"
        >
          <q-menu>
            <q-list>
              <q-item v-ripple clickable @click="editPerms(doc)">
                <q-item-section>{{ $t('permission.manage') }}</q-item-section>
              </q-item>

              <q-item v-ripple clickable @click="openEditDoc(doc)">
                <q-item-section>{{ $t('documents.edit') }}</q-item-section>
              </q-item>

              <q-item v-ripple clickable class="text-negative" @click="confirmDelete(doc)">
                <q-item-section>{{ $t('documents.delete') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-card>
    </section>

    <section>
      <q-dialog v-model="confirmDeletePopup" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">Confirmar exclusão</div>
            <div>Tem certeza que deseja excluir o documento "{{ selectedDoc?.title }}"?</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="secondary" v-close-popup />
            <q-btn label="Excluir" color="negative" @click="deleteDoc" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </section>

    <new-document v-model="showPopup" />
    <new-document v-model="showEditPopup" edit-mode :doc="editingDoc" />
    <permissao-popup v-model="showPermissaoPopup" :doc="selectedDoc" />
    <CommentsPopup v-model="showCommentsPopup" :doc="selectedDoc" />

    <q-dialog v-model="imageDialog">
      <q-card>
        <q-img
          style="min-width: 500px; max-width: 900px; min-height: 300px; max-height: 1100px"
          :src="selectedImage"
        />
        <q-card-actions>
          <q-btn v-close-popup flat label="Fechar" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import {
  getAllDocuments,
  canComment,
  getTimeStatus,
  deleteDocument,
} from 'src/services/documentService';
import NewDocument from 'src/components/NewDocument.vue';
import PermissaoPopup from 'src/components/PermissaoPopup.vue';
import CommentsPopup from 'src/components/CommentsPopup.vue';
import type { Document } from 'src/types/interfaces/IDocuments';
import type { User } from 'src/types/interfaces/IUser';

const userStore = useUserStore();
const user = ref<User | null>(null);

const showPopup = ref(false);
const showEditPopup = ref(false);
const showPermissaoPopup = ref(false);
const showCommentsPopup = ref(false);
const confirmDeletePopup = ref(false);

const imageDialog = ref(false);
const selectedImage = ref('');

onMounted(() => {
  user.value = userStore.getUser();
});

function openImage(url: string) {
  selectedImage.value = url;
  imageDialog.value = true;
}

const selectedDoc = ref<Document | null>(null);
const editingDoc = ref<Document | null>(null);

const readableDocs = computed(() => getAllDocuments().filter((d) => canComment(d)));

function openComments(doc: Document) {
  selectedDoc.value = doc;
  showCommentsPopup.value = true;
}

function statusColor(doc: Document) {
  const status = getTimeStatus(doc);
  if (status === 'red') return 'red';
  if (status === 'yellow') return 'gold';
  if (status === 'green') return 'green';
  return 'grey';
}

function statusLabel(doc: Document): string {
  const status = statusColor(doc);
  if (status === 'red') return 'Expira menos de 1h';
  if (status === 'gold') return 'Expira menos de 1 dia';
  if (status === 'green') return 'Acesso liberado';
  return 'Status indefinido';
}

function editPerms(doc: Document) {
  selectedDoc.value = doc;
  showPermissaoPopup.value = true;
}

function openEditDoc(doc: Document) {
  editingDoc.value = doc;
  showEditPopup.value = true;
}

function confirmDelete(doc: Document) {
  selectedDoc.value = doc;
  confirmDeletePopup.value = true;
}

function deleteDoc() {
  if (selectedDoc.value) {
    deleteDocument(selectedDoc.value.id);
    confirmDeletePopup.value = false;
  }
}
</script>
