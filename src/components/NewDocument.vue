<template>
  <q-dialog v-model="internalModel" persistent>
    <q-card>
      <q-card-section class="p-4">
        <div class="text-h6">
          {{ editMode ? $t('documents.edit') : $t('documents.new') }}
        </div>
      </q-card-section>

      <q-card-section class="p-2 grid gap-4">
        <q-input v-model="form.title" :label="$t('common.title')" label-color="accent" outlined />
        <q-input
          v-model="form.text"
          :label="$t('common.text')"
          label-color="accent"
          type="textarea"
          outlined
        />

        <q-uploader
          :label="$t('common.attached')"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          :auto-upload="false"
          color="accent"
          @added="onFilesAdded"
        />

        <div v-if="form.attachments.length">
          <div v-for="a in form.attachments" :key="a.id">
            <q-chip>{{ a.type.toUpperCase() }}</q-chip>
            <span>{{ a.url }}</span>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Buscar imagens da API Picsum -->
        <div class="q-mt-md">
          <q-btn
            outline
            dense
            color="accent"
            icon="photo"
            label="Buscar imagens"
            @click="loadImages"
          />
          <div v-if="imageResults.length" class="row q-col-gutter-sm q-mt-sm">
            <div
              v-for="img in imageResults"
              :key="img.id"
              class="col-4 cursor-pointer"
              @click="addImageFromApi(img.download_url)"
            >
              <q-img :src="img.download_url" ratio="1" class="rounded-borders shadow-sm">
                <div class="absolute-bottom text-white text-caption bg-black bg-opacity-50 q-pa-xs">
                  {{ img.author }}
                </div>
              </q-img>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="justify-end">
        <q-btn flat :label="$t('common.cancel')" color="negative" @click="close" />
        <q-btn
          flat
          :label="editMode ? $t('common.save') : $t('common.create')"
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
import { useQuasar } from 'quasar';
import { findDocumentImages } from 'src/services/documentService';

defineOptions({ name: 'NewDocument' });

const props = defineProps<{
  modelValue: boolean;
  editMode?: boolean;
  doc?: Document | null;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const $q = useQuasar();

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

// Lista de imagens da API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const imageResults = ref<any[]>([]);

async function loadImages() {
  try {
    $q.loading.show();
    imageResults.value = await findDocumentImages();
  } catch (error) {
    console.error(error);
    $q.notify({
      message: 'Erro ao carregar imagens',
      color: 'negative',
    });
  } finally {
    $q.loading.hide();
  }
}

function addImageFromApi(url: string) {
  form.value.attachments.push({
    id: Date.now() + Math.random(),
    url,
    type: 'image',
  });
}

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
