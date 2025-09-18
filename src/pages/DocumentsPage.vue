<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <h2>{{ $t('documents.title') }}</h2>
      <q-btn
        v-if="userStore.currentUser?.role === 'admin'"
        :label="$t('documents.new')"
        color="accent"
        @click="showPopup = true"
      />
    </div>

    <div class="row q-col-gutter-md q-pa-sm">
      <q-card v-for="doc in readableDocs" :key="doc.id" class="col-12 col-sm-4 relative-position">
        <div
          v-if="userStore.currentUser?.role === 'user'"
          class="absolute-top-right q-ma-sm"
          :style="{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: statusColor(doc),
          }"
        ></div>
        <q-card-section>
          <div class="text-h6">{{ doc.title }}</div>
          <div class="text-subtitle2">{{ doc.text }}</div>
        </q-card-section>

        <q-card-section>
          <div v-for="a in doc.attachments" :key="a.id" class="q-mb-sm">
            <q-img v-if="a.type === 'image'" :src="a.url" style="max-height: 120px" />
            <q-btn
              v-else
              icon="picture_as_pdf"
              label="Abrir PDF"
              flat
              :href="a.url"
              target="_blank"
            />
          </div>
        </q-card-section>

        <q-card-section>
          <q-btn
            flat
            color="accent"
            icon="comment"
            :label="$t('documents.comments')"
            @click="openComments(doc)"
          />
        </q-card-section>

        <q-btn
          v-if="userStore.currentUser?.role === 'admin'"
          flat
          round
          dense
          icon="more_vert"
          class="absolute-top-right q-ma-sm"
        >
          <q-menu>
            <q-list>
              <q-item clickable v-ripple @click="editPerms(doc)">
                <q-item-section>{{ $t('permission.manage') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="openEditDoc(doc)">
                <q-item-section>{{ $t('documents.edit') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple class="text-negative" @click="confirmDelete(doc)">
                <q-item-section>{{ $t('documents.delete') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-card>
    </div>

    <new-document v-model="showPopup" />
    <new-document v-model="showEditPopup" :doc="editingDoc" edit-mode />
    <permissao-popup v-model="showPermissaoPopup" :doc="selectedDoc!" />
    <comments-popup v-model="showCommentsPopup" />

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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from 'src/stores/user';
import { useDocumentsStore, type Document } from 'src/stores/documents';
import NewDocument from 'src/components/NewDocument.vue';
import PermissaoPopup from 'src/components/PermissaoPopup.vue';
import CommentsPopup from 'src/components/CommentsPopup.vue';

const userStore = useUserStore();
const documentsStore = useDocumentsStore();
documentsStore.init();

const showPopup = ref(false);
const showEditPopup = ref(false);
const showPermissaoPopup = ref(false);
const showCommentsPopup = ref(false);
const confirmDeletePopup = ref(false);

const selectedDoc = ref<Document | null>(null);
const editingDoc = ref<Document | null>(null);

const readableDocs = computed(() =>
  documentsStore.documents.filter((d) => documentsStore.canComment(d)),
);

function statusColor(doc: Document) {
  const status = documentsStore.getTimeStatus(doc);
  if (status === 'red') return 'red';
  if (status === 'yellow') return 'gold';
  if (status === 'green') return 'green';
  return 'grey';
}

function editPerms(doc: Document) {
  selectedDoc.value = doc;
  showPermissaoPopup.value = true;
}

function openComments(doc: Document) {
  selectedDoc.value = doc;
  showCommentsPopup.value = true;
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
    documentsStore.deleteDocument(selectedDoc.value.id);
    confirmDeletePopup.value = false;
  }
}
</script>
