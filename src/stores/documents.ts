import { defineStore } from 'pinia'
import { useUserStore } from './user'

export interface Attachment {
  id: number
  type: 'image' | 'pdf'
  url: string
}

export interface Comment {
  userId: number
  text: string
  date: number
}


export interface Permission {
  userId: number
  docId: number
  perms: ('read' | 'comment' | 'edit')[]
  expiresAt: number // timestamp
}

export interface Document {
  id: number
  title: string
  text: string
  attachments: Attachment[]
  comments: Comment[]
}

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as Document[],
    permissions: [] as Permission[]
  }),

  actions: {
    init() {
      const savedDocs = localStorage.getItem('documents')
      const savedPerms = localStorage.getItem('permissions')

      if (savedDocs) {
        this.documents = JSON.parse(savedDocs)
      } else {
        this.documents = [
          {
            id: 1,
            title: 'Política da Empresa',
            text: 'Documento oficial com regras e políticas internas.',
            attachments: [],
            comments: []
          },
          {
            id: 2,
            title: 'Guia do Funcionário',
            text: 'Manual com orientações para novos colaboradores.',
            attachments: [],
            comments: []
          },
          {
            id: 3,
            title: 'Relatório Financeiro',
            text: 'Dados financeiros do último trimestre.',
            attachments: [],
            comments: []
          }
        ]
      }

      this.permissions = savedPerms ? JSON.parse(savedPerms) : []

      this.save()
    },

    save() {
      localStorage.setItem('documents', JSON.stringify(this.documents))
      localStorage.setItem('permissions', JSON.stringify(this.permissions))
    },

    addDocument(title: string, text: string, attachments: Attachment[] = []) {
      const newDoc: Document = {
        id: Date.now(),
        title,
        text,
        attachments,
        comments: []
      }
      this.documents.push(newDoc)
      this.save()
    },

    editDocument(docId: number, newData: Partial<Document>) {
      const doc = this.documents.find(d => d.id === docId)
      if (doc) {
        Object.assign(doc, newData)
        this.save()
      }
    },

    deleteDocument(docId: number) {
      this.documents = this.documents.filter(d => d.id !== docId)
      this.permissions = this.permissions.filter(p => p.docId !== docId)
      this.save()
    },

    // ----- PERMISSÕES -----
    setPermission(
      docId: number,
      userId: number,
      perms: ('read' | 'comment' | 'edit')[],
      expiresAt?: number
    ) {
      const expiration = expiresAt ?? (Date.now() + 24 * 60 * 60 * 1000)

      const existing = this.permissions.find(p => p.docId === docId && p.userId === userId)
      if (existing) {
        existing.perms = perms
        existing.expiresAt = expiration
      } else {
        this.permissions.push({ docId, userId, perms, expiresAt: expiration })
      }
      this.save()
    },


    removePermission(docId: number, userId: number) {
      this.permissions = this.permissions.filter(p => !(p.docId === docId && p.userId === userId))
      this.save()
    },

    removeAllPermissions(userId: number) {
      this.permissions = this.permissions.filter(p => p.userId !== userId)
      this.save()
    },

    extendPermission(docId: number, userId: number, durationMs: number) {
      const p = this.permissions.find(p => p.docId === docId && p.userId === userId)
      if (p) {
        p.expiresAt += durationMs
        this.save()
      }
    },

    getPermissionsByUser(userId: number) {
      return this.permissions.filter(p => p.userId === userId)
    },

    getDocTitle(docId: number) {
      const doc = this.documents.find(d => d.id === docId)
      return doc ? doc.title : ''
    },

    // ----- ACESSO -----
    canRead(doc: Document) {
      const userStore = useUserStore()
      const user = userStore.currentUser
      if (!user) return false
      if (user.role === 'admin') return true
      const perm = this.permissions.find(p => p.docId === doc.id && p.userId === user.id)
      return !!perm && perm.perms.includes('read') && perm.expiresAt > Date.now()
    },

    canComment(doc: Document) {
      const userStore = useUserStore()
      const user = userStore.currentUser
      if (!user) return false
      if (user.role === 'admin') return true
      const perm = this.permissions.find(p => p.docId === doc.id && p.userId === user.id)
      return !!perm && perm.perms.includes('comment') && perm.expiresAt > Date.now()
    },

    // ----- COMENTÁRIOS -----
    addComment(docId: number, text: string) {
      const userStore = useUserStore()
      const user = userStore.currentUser
      if (!user) return
      const doc = this.documents.find(d => d.id === docId)
      if (doc) {
        doc.comments.push({
          userId: user.id,
          text,
          date: Date.now()
        })
        this.save()
      }
    },

    // ----- STATUS DE TEMPO -----
    getTimeStatus(doc: Document): 'red' | 'yellow' | 'green' {
      const userStore = useUserStore()
      const user = userStore.currentUser
      if (!user) return 'red'
      const perm = this.permissions.find(p => p.docId === doc.id && p.userId === user.id)
      if (!perm) return 'red'
      const remaining = perm.expiresAt - Date.now()
      if (remaining <= 0) return 'red'
      if (remaining < 60 * 60 * 1000) return 'yellow'
      return 'green'
    }
  }
})
