<template>
  <q-dialog v-model="internalModel" persistent>
    <q-card>
      <q-form ref="formRef" @submit.prevent="handleCreate">
        <q-card-section class="p-4">
          <div class="text-h6">
            {{ editMode ? $t('documents.edit') : $t('documents.new') }}
          </div>
        </q-card-section>

        <q-card-section class="p-2 grid gap-4">
          <q-input
            v-model="form.title"
            outlined
            lazy-rules
            label-color="accent"
            :label="$t('common.title')"
            :rules="[validateTitle]"
          />
          <q-input
            v-model="form.text"
            outlined
            lazy-rules
            label-color="accent"
            type="textarea"
            :label="$t('common.text')"
            :rules="[validateText]"
          />

          <q-uploader
            multiple
            color="accent"
            accept=".jpg,.jpeg,.png,.pdf"
            :label="$t('common.attached')"
            :auto-upload="false"
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
                class="col-4 cursor-pointer"
                :key="img.id"
                @click="addImageFromApi(img.download_url)"
              >
                <q-img ratio="1" class="rounded-borders shadow-sm" :src="img.download_url">
                  <div
                    class="absolute-bottom text-white text-caption bg-black bg-opacity-50 q-pa-xs"
                  >
                    {{ img.author }}
                  </div>
                </q-img>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="justify-end">
          <q-btn flat color="negative" :label="$t('common.cancel')" @click="close" />
          <q-btn
            flat
            color="positive"
            type="submit"
            :label="editMode ? $t('common.save') : $t('common.create')"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { addDocument, editDocument, findDocumentImages } from 'src/services/documentService';
import { useQuasar } from 'quasar';
import type { Document, Attachment } from 'src/types/interfaces/IDocuments';

defineOptions({ name: 'NewDocument' });

const props = defineProps<{
  modelValue: boolean;
  editMode?: boolean;
  doc?: Document | null;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const $q = useQuasar();
const formRef = ref();

const internalModel = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (internalModel.value = v),
);
watch(internalModel, (v) => emit('update:modelValue', v));

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
    editDocument(props.doc.id, {
      title: form.value.title,
      text: form.value.text,
      attachments: form.value.attachments,
    });
  } else {
    void addDocument(form.value.title, form.value.text, form.value.attachments);
    form.value = { title: '', text: '', attachments: [] };
  }
  internalModel.value = false;
}

const handleCreate = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) {
    $q.notify({
      type: 'negative',
      message: 'Preencha todos os campos corretamente',
    });
    return;
  }

  try {
    save();
    $q.notify({
      type: 'positive',
      message: 'Documento criado com sucesso!',
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao criar documento',
    });
  }
};

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

const validateTitle = (val: string): true | string => {
  if (!val || val.trim().length === 0) {
    return 'O título não pode estar vazio';
  }
  return true;
};

const validateText = (val: string): true | string => {
  if (!val || val.trim().length === 0) {
    return 'O texto não pode estar vazio';
  }
  return true;
};

function close() {
  internalModel.value = false;
}
</script>
