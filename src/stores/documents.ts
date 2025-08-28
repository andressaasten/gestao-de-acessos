import { defineStore } from 'pinia'
import { useUserStore } from './user'

export interface Permission {
  userId: number
  canRead: boolean
  canComment: boolean
  canEdit: boolean
  expiresAt: number
}

export interface Attachment {
  id: number
  url: string
  type: 'image' | 'pdf'
}

export interface Document {
  id: number
  title: string
  text: string
  ownerId: number
  attachments: Attachment[]
  permissions: Permission[]
  comments: { userId: number; text: string; date: string }[]
}

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as Document[],
  }),

  actions: {
    init() {
      const saved = localStorage.getItem('documents')
      if (saved) {
        this.documents = JSON.parse(saved)
      }
    },

    save() {
      localStorage.setItem('documents', JSON.stringify(this.documents))
    },

    addDocument(title: string, text: string, attachments: Attachment[] = []) {
      const userStore = useUserStore()
      if (!userStore.currentUser || userStore.currentUser.role !== 'admin') {
        throw new Error('Apenas admins podem criar documentos')
      }

      const newDoc: Document = {
        id: Date.now(),
        title,
        text,
        ownerId: userStore.currentUser.id,
        attachments,
        permissions: [],
        comments: [],
      }
      this.documents.push(newDoc)
      this.save()
    },

    editDocument(docId: number, newData: { title?: string; text?: string; attachments?: Attachment[] }) {
      const userStore = useUserStore()
      const u = userStore.currentUser
      if (!u) throw new Error('Usuário não autenticado')

      const doc = this.documents.find(d => d.id === docId)
      if (!doc) throw new Error('Documento não encontrado')

      const hasEditPerm = 
        u.role === 'admin' || 
        doc.permissions.some(p => p.userId === u.id && p.canEdit && p.expiresAt > Date.now())

      if (!hasEditPerm) {
        throw new Error('Sem permissão para editar este documento')
      }

      if (newData.title) doc.title = newData.title
      if (newData.text) doc.text = newData.text
      if (newData.attachments) doc.attachments = newData.attachments

      this.save()
    },

    setPermission(docId: number, userId: number, perms: Partial<Permission>, durationMs: number) {
      const doc = this.documents.find(d => d.id === docId)
      if (!doc) return
      const existing = doc.permissions.find(p => p.userId === userId)

      const expiresAt = Date.now() + durationMs

      if (existing) {
        Object.assign(existing, perms, { expiresAt })
      } else {
        doc.permissions.push({
          userId,
          canRead: perms.canRead ?? false,
          canComment: perms.canComment ?? false,
          canEdit: perms.canEdit ?? false,
          expiresAt,
        })
      }
      this.save()
    },

    extendPermission(docId: number, userId: number, extraMs: number) {
      const doc = this.documents.find(d => d.id === docId)
      if (!doc) return
      const perm = doc.permissions.find(p => p.userId === userId)
      if (perm) {
        perm.expiresAt = Math.max(perm.expiresAt, Date.now()) + extraMs
        this.save()
      }
    },

    removePermission(docId: number, userId: number) {
      const doc = this.documents.find(d => d.id === docId)
      if (!doc) return
      doc.permissions = doc.permissions.filter(p => p.userId !== userId)
      this.save()
    },

    removeAllPermissions(userId: number) {
      this.documents.forEach(doc => {
        doc.permissions = doc.permissions.filter(p => p.userId !== userId)
      })
      this.save()
    },

    getPermissionsByUser(userId: number) {
      return this.documents.flatMap(doc =>
        doc.permissions
          .filter(p => p.userId === userId)
          .map(p => ({
            docId: doc.id,
            perms: { canRead: p.canRead, canComment: p.canComment, canEdit: p.canEdit },
            expiresAt: p.expiresAt
          }))
      )
    },

    getDocTitle(docId: number) {
      return this.documents.find(d => d.id === docId)?.title || 'Documento desconhecido'
    },

    canRead(doc: Document) {
      const userStore = useUserStore()
      const u = userStore.currentUser
      if (!u) return false
      if (u.role === 'admin') return true
      const perm = doc.permissions.find(p => p.userId === u.id)
      return !!(perm?.canRead && perm.expiresAt > Date.now())
    },

    canComment(doc: Document) {
      const userStore = useUserStore()
      const u = userStore.currentUser
      if (!u) return false
      if (u.role === 'admin') return true
      const perm = doc.permissions.find(p => p.userId === u.id)
      return !!(perm?.canComment && perm.expiresAt > Date.now())
    },

    getTimeStatus(doc: Document): 'red' | 'yellow' | 'green' | 'grey' {
      const userStore = useUserStore()
      const u = userStore.currentUser
      if (!u) return 'grey'
      const perm = doc.permissions.find(p => p.userId === u.id)
      if (!perm) return 'grey'

      const remaining = perm.expiresAt - Date.now()
      if (remaining <= 0) return 'grey'
      if (remaining < 60 * 60 * 1000) return 'red'
      if (remaining < 24 * 60 * 60 * 1000) return 'yellow'
      return 'green'
    },

    addComment(docId: number, text: string) {
      const userStore = useUserStore()
      const u = userStore.currentUser
      const doc = this.documents.find(d => d.id === docId)
      if (!doc || !u) return
      if (!this.canComment(doc)) return

      doc.comments.push({
        userId: u.id,
        text,
        date: new Date().toISOString(),
      })
      this.save()
    },
    deleteDocument(docId: number) {
    this.documents = this.documents.filter(d => d.id !== docId)
    this.save()
    },
  },
})
