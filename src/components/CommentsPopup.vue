<template>
  <q-dialog>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Comentários de {{ doc?.title }}</div>
      </q-card-section>

      <q-card-section>
        <div v-for="c in doc?.comments" :key="c.date">
          <q-chip
            :color="getUserById(c.userId)?.role === 'admin' ? 'negative' : 'positive'"
            text-color="secondary"
            square
          >
            {{ getUserById(c.userId)?.name }}
            <span class="text-caption"> ({{ new Date(c.date).toLocaleString() }}) </span>
          </q-chip>
          <div class="q-ml-md">{{ c.text }}</div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-if="doc && documentsStore.canComment(doc)" class="flex flex-nowrap gap-4 mt-4">
          <q-input
            dense
            hide-bottom-space
            outlined
            v-model="newComment[doc.id]"
            placeholder="Escreva um comentário"
            class="flex-auto"
          />
          <q-btn
            outline
            noCaps
            :label="$t('permission.comment')"
            color="accent"
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
import { ref } from 'vue';
import { useUserStore } from 'src/stores/user';
import { useDocumentsStore } from 'src/stores/documents';
import type { Document } from 'src/types/interfaces/IDocuments';

defineOptions({ name: 'CommentsPopup' });

defineProps<{
  doc: Document | null;
}>();

const userStore = useUserStore();
const documentsStore = useDocumentsStore();

const newComment = ref<Record<number, string>>({});

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
