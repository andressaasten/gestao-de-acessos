import { defineStore } from 'pinia';
import type { Document, Permission } from '../types/interfaces/IDocuments';
import { getAllDocuments } from 'src/services/documentService';

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as Document[],
    permissions: [] as Permission[],
  }),

  actions: {
    init() {
      const { document, permission } = getAllDocuments();
      this.documents = document;
      this.permissions = permission;

      this.save();
    },

    save() {
      localStorage.setItem('documents', JSON.stringify(this.documents));
      localStorage.setItem('permissions', JSON.stringify(this.permissions));
    },
  },
});
