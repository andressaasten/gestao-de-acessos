<template>
  <q-dialog>
    <q-card style="min-width: 500px">
      <q-btn icon="close" v-close-popup />
      <q-card-section>
        <div class="text-h6">{{ $t('documents.comments') }} : {{ doc?.title }}</div>
      </q-card-section>

      <q-card-section>
        <div v-for="c in doc?.comments" :key="c.date">
          <q-chip
            square
            text-color="secondary"
            :color="getUserById(c.userId)?.role === 'admin' ? 'negative' : 'positive'"
          >
            {{ getUserById(c.userId)?.name }}
            <span class="text-caption"> ({{ new Date(c.date).toLocaleString() }}) </span>
          </q-chip>
          <div class="q-ml-md">{{ c.text }}</div>
        </div>
      </q-card-section>

      <q-card-section v-if="doc && canComment(doc)" class="flex flex-nowrap gap-4 mt-4">
        <q-input
          v-model="newComment[doc.id]"
          dense
          outlined
          hide-bottom-space
          :placeholder="$t('labelcomment')"
          class="flex-auto"
        />
        <q-btn
          noCaps
          outline
          color="accent"
          :label="$t('permission.comment')"
          @click="addComments(doc)"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Fechar" color="secondary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getAllUsers } from 'src/services/userServices';
import type { Document } from 'src/types/interfaces/IDocuments';
import { addComment, canComment } from 'src/services/documentService';

defineOptions({ name: 'CommentsPopup' });
defineProps<{ doc: Document | null }>();

const newComment = ref<Record<number, string>>({});

function addComments(doc: Document) {
  const text = newComment.value[doc.id];

  if (!text || !text.trim()) {
    return;
  }

  addComment(doc.id, text);
  newComment.value[doc.id] = '';
}

function getUserById(id: number) {
  return getAllUsers().find((u) => u.id === id) || null;
}
</script>
