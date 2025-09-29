import { useUserStore } from 'src/stores/user';
import type { Document, Permission, Attachment } from '../types/interfaces/IDocuments';

const documents = 'documents';
const permissions = 'permissions';

export async function findDocumentImages() {
  const res = await fetch('https://picsum.photos/v2/list?page=1&limit=12');
  return await res.json();
}

function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAllDocuments(): { document: Document[]; permission: Permission[] } {
  const document = load<Document[]>(documents, [
    {
      id: 1,
      title: 'Política da Empresa',
      text: 'Documento oficial com regras e políticas internas.',
      attachments: [],
      comments: [],
    },
    {
      id: 2,
      title: 'Guia do Funcionário',
      text: 'Manual com orientações para novos colaboradores.',
      attachments: [],
      comments: [],
    },
    {
      id: 3,
      title: 'Relatório Financeiro',
      text: 'Dados financeiros do último trimestre.',
      attachments: [],
      comments: [],
    },
  ]);
  const permission = load<Permission[]>(permissions, []);
  return { document, permission };
}

export function addComment(doc: Omit<Document, 'id' | 'comments'>): Document {
  const { document, permission } = getAllDocuments();
  const newDoc: Document = { ...doc, id: Date.now(), comments: [] };
  documentsPush(newDoc);
  save(documents, document);
  save(permissions, permission);

  return newDoc;
}

export function addDocument(title: string, text: string, attachments: Attachment[] = []) {
  const newDoc: Document = {
    id: Date.now(),
    title,
    text,
    attachments,
    comments: [],
  };
  documentsPush(newDoc);
  save();
}

export function editDocument(docId: number, newData: Partial<Document>) {
  const doc = documents.find((d) => d.id === docId);
  if (doc) {
    Object.assign(doc, newData);
    save();
  }
}

export function deleteDocument(docId: number) {
  documents = documents.filter((d) => d.id !== docId);
  permissions = permissions.filter((p) => p.docId !== docId);
  save();
}

// ----- PERMISSÕES -----
export function setPermission(
  docId: number,
  userId: number,
  perms: ('read' | 'comment' | 'edit')[],
  expiresAt?: number,
) {
  const expiration = expiresAt ?? Date.now() + 24 * 60 * 60 * 1000;

  const existing = permissions.find((p) => p.docId === docId && p.userId === userId);
  if (existing) {
    existing.perms = perms;
    existing.expiresAt = expiration;
  } else {
    permissions.push({ docId, userId, perms, expiresAt: expiration });
  }
  save();
}

export function removePermission(docId: number, userId: number) {
  permissions = permissions.filter((p) => !(p.docId === docId && p.userId === userId));
  save();
}

export function removeAllPermissions(userId: number) {
  permissions = permissions.filter((p) => p.userId !== userId);
  save();
}

export function extendPermission(docId: number, userId: number, durationMs: number) {
  const p = permissions.find((p) => p.docId === docId && p.userId === userId);
  if (p) {
    p.expiresAt += durationMs;
    save();
  }
}

export function getPermissionsByUser(userId: number) {
  return permissions.filter((p) => p.userId === userId);
}

export function getDocTitle(docId: number) {
  const doc = documents.find((d) => d.id === docId);
  return doc ? doc.title : '';
}

// ----- ACESSO -----
export function canRead(doc: Document) {
  const userStore = useUserStore();
  const user = userStore.currentUser;
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perm = permissions.find((p) => p.docId === doc.id && p.userId === user.id);
  return !!perm && perm.perms.includes('read') && perm.expiresAt > Date.now();
}

export function canComment(doc: Document) {
  const userStore = useUserStore();
  const user = userStore.currentUser;
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perm = permissions.find((p) => p.docId === doc.id && p.userId === user.id);
  return !!perm && perm.perms.includes('comment') && perm.expiresAt > Date.now();
}

// ----- STATUS DE TEMPO -----
export function getTimeStatus(doc: Document): 'red' | 'yellow' | 'green' {
  const userStore = useUserStore();
  const user = userStore.currentUser;
  if (!user) return 'red';

  const perm = permissions.find((p) => p.docId === doc.id && p.userId === user.id);
  if (!perm) return 'red';

  const remaining = perm.expiresAt - Date.now();
  if (remaining <= 0) return 'red';
  if (remaining < 60 * 60 * 1000) return 'red'; // < 1 hora
  if (remaining < 24 * 60 * 60 * 1000) return 'yellow'; // < 1 dia
  return 'green';
}

function documentsPush(newDoc: Document) {}
