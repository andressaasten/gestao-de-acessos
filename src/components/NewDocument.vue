<template>
  <q-dialog v-model="internalModel" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ editMode ? 'Editar Documento' : 'Novo Documento' }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="form.title" label="Título" outlined />
        <q-input v-model="form.text" label="Texto" type="textarea" outlined />

        <q-uploader
          label="Anexos"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          @added="onFilesAdded"
          :auto-upload="false"
          class="q-mt-md"
          color="secondary"
        />

        <div v-if="form.attachments.length" class="q-mt-md">
          <div v-for="a in form.attachments" :key="a.id" class="row items-center q-mb-sm">
            <q-chip>{{ a.type.toUpperCase() }}</q-chip>
            <span class="q-ml-sm">{{ a.url }}</span>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="close" />
        <q-btn
          flat
          :label="editMode ? 'Salvar Alterações' : 'Criar'"
          color="positive"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDocumentsStore, type Document, type Attachment } from 'src/stores/documents';

const props = defineProps<{
  modelValue: boolean;
  editMode?: boolean;
  doc?: Document | null;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const internalModel = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (internalModel.value = v),
);
watch(internalModel, (v) => emit('update:modelValue', v));

const documentsStore = useDocumentsStore();

const form = ref<{ title: string; text: string; attachments: Attachment[] }>({
  title: '',
  text: '',
  attachments: [],
});

watch(
  () => props.doc,
  (doc) => {
    if (doc && props.editMode) {
      form.value = {
        title: doc.title,
        text: doc.text,
        attachments: [...doc.attachments],
      };
    } else {
      form.value = { title: '', text: '', attachments: [] };
    }
  },
  { immediate: true },
);

function save() {
  if (props.editMode && props.doc) {
    documentsStore.editDocument(props.doc.id, {
      title: form.value.title,
      text: form.value.text,
      attachments: form.value.attachments,
    });
  } else {
    documentsStore.addDocument(form.value.title, form.value.text, form.value.attachments);
    form.value = { title: '', text: '', attachments: [] };
  }
  internalModel.value = false;
}

function onFilesAdded(files: readonly File[]) {
  for (const f of files) {
    const url = URL.createObjectURL(f);
    const type = f.type.includes('pdf') ? 'pdf' : 'image';
    form.value.attachments.push({
      id: Date.now() + Math.random(),
      url,
      type,
    });
  }
}

function close() {
  internalModel.value = false;
}
</script>
