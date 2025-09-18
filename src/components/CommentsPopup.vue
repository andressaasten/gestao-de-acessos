<template>
  <q-dialog>
    <q-card style="min-width: 500px" v-for="doc in readableDocs" :key="doc.id">
      <q-card-section>
        <div class="text-h6">Comentários de {{ selectedDoc?.title }}</div>
      </q-card-section>

      <q-card-section>
        <div v-for="c in selectedDoc?.comments" :key="c.date" class="q-mb-sm">
          <q-chip
            :color="getUserById(c.userId)?.role === 'admin' ? 'negative' : 'positive'"
            text-color="secondary"
            square
          >
            {{ getUserById(c.userId)?.name }}
            <span class="text-caption q-ml-sm"> ({{ new Date(c.date).toLocaleString() }}) </span>
          </q-chip>
          <div class="q-ml-md">{{ c.text }}</div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-if="documentsStore.canComment(doc)" class="q-mt-sm">
          <q-input
            dense
            outlined
            v-model="newComment[doc.id]"
            placeholder="Escreva um comentário"
          />
          <q-btn
            flat
            :label="$t('permission.comment')"
            color="accent"
            class="q-mt-sm"
            @click="addComment(doc)"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Fechar" color="secondary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from 'src/stores/user';
import { useDocumentsStore, type Document } from 'src/stores/documents';

const userStore = useUserStore();
const documentsStore = useDocumentsStore();
documentsStore.init();

const selectedDoc = ref<Document | null>(null);
const newComment = ref<Record<number, string>>({});

const readableDocs = computed(() =>
  documentsStore.documents.filter((d) => documentsStore.canComment(d)),
);

function openComments(doc: Document) {
  selectedDoc.value = doc;
}

function addComment(doc: Document) {
  const text = newComment.value[doc.id];
  if (!text || !text.trim()) return;
  documentsStore.addComment(doc.id, text);
  newComment.value[doc.id] = '';
}

function getUserById(id: number) {
  return userStore.users.find((u) => u.id === id) || null;
}
</script>
