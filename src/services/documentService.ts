import { getUserSession } from 'src/services/userServices';
import type { Document, Attachment, Permission } from '../types/interfaces/IDocuments';

export function init() {
  const documents = [
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
  ];

  setAllDocuments(documents);
}

export function setAllDocuments(documents: Document[]) {
  localStorage.setItem('documents', JSON.stringify(documents));
}

export function getAllDocuments(): Document[] {
  const documentsJson = localStorage.getItem('documents');

  if (!documentsJson) {
    return [];
  }

  return JSON.parse(documentsJson);
}

export function setAllPemissions(permissions: Permission[]) {
  localStorage.setItem('permissions', JSON.stringify(permissions));
}

export function getAllPermissions(): Permission[] {
  const permissionsJson = localStorage.getItem('permissions');

  if (!permissionsJson) {
    return [];
  }

  return JSON.parse(permissionsJson);
}

export function addDocument(title: string, text: string, attachments: Attachment[] = []) {
  const newDoc: Document = {
    id: Date.now(),
    title,
    text,
    attachments,
    comments: [],
  };
  const documents = getAllDocuments();
  documents.push(newDoc);
  setAllDocuments(documents);

  return newDoc;
}

export function editDocument(docId: number, newData: Partial<Document>) {
  const documents = getAllDocuments();
  const doc = documents.find((d) => d.id === docId);
  if (doc) {
    Object.assign(doc, newData);
    setAllDocuments(documents);
  }
}

export function deleteDocument(docId: number) {
  const doc = getAllDocuments().filter((d) => d.id !== docId);
  const perm = getAllPermissions().filter((p) => p.docId !== docId);
  setAllDocuments(doc);
  setAllPemissions(perm);
}

export function addComment(docId: number, comment: string) {
  const user = getUserSession();
  const documents = getAllDocuments();
  if (!user) return;
  const doc = documents.find((d) => d.id === docId);

  if (doc) {
    doc.comments.push({
      userId: user.currentUser.id,
      text: comment,
      date: Date.now(),
    });
  }
  setAllDocuments(documents);
}

export function setPermission(
  docId: number,
  userId: number,
  perms: ('read' | 'comment' | 'edit')[],
  expiresAt?: number,
) {
  const permissions = getAllPermissions();
  const expiration = expiresAt ?? Date.now() + 24 * 60 * 60 * 1000;

  const existing = permissions.find((p) => p.docId === docId && p.userId === userId);
  if (existing) {
    existing.perms = perms;
    existing.expiresAt = expiration;
  } else {
    permissions.push({ docId, userId, perms, expiresAt: expiration });
  }
  setAllPemissions(permissions);
}

export function removePermission(docId: number, userId: number) {
  const permissions = getAllPermissions().filter(
    (p) => !(p.docId === docId && p.userId === userId),
  );
  setAllPemissions(permissions);
}

export function removeAllPermissions(userId: number) {
  const permissions = getAllPermissions().filter((p) => p.userId !== userId);
  setAllPemissions(permissions);
}

export function extendPermission(docId: number, userId: number, durationMs: number) {
  const p = getAllPermissions().find((p) => p.docId === docId && p.userId === userId);
  if (p) {
    p.expiresAt += durationMs;
    setAllPemissions([]);
  }
}

export function getPermissionsByUser(userId: number) {
  return getAllPermissions().filter((p) => p.userId === userId);
}

export function getDocTitle(docId: number) {
  const doc = getAllDocuments().find((d) => d.id === docId);
  return doc ? doc.title : '';
}

export function canRead(doc: Document) {
  const user = getUserSession();
  if (!user) return false;
  if (user.currentUser.role === 'admin') return true;
  const perm = getAllPermissions().find(
    (p) => p.docId === doc.id && p.userId === user.currentUser.id,
  );
  return !!perm && perm.perms.includes('read') && perm.expiresAt > Date.now();
}

export function canComment(doc: Document) {
  const user = getUserSession();
  if (!user) return false;
  if (user.currentUser.role === 'admin') return true;
  const perm = getAllPermissions().find(
    (p) => p.docId === doc.id && p.userId === user.currentUser.id,
  );
  return !!perm && perm.perms.includes('comment') && perm.expiresAt > Date.now();
}

export function getTimeStatus(doc: Document): 'red' | 'yellow' | 'green' {
  const user = getUserSession();
  if (!user) return 'red';

  const perm = getAllPermissions().find(
    (p) => p.docId === doc.id && p.userId === user.currentUser.id,
  );
  if (!perm) return 'red';

  const remaining = perm.expiresAt - Date.now();
  if (remaining <= 0) return 'red';
  if (remaining < 60 * 60 * 1000) return 'red'; // < 1h
  if (remaining < 24 * 60 * 60 * 1000) return 'yellow'; // < 1d
  return 'green';
}

export async function findDocumentImages() {
  const res = await fetch('https://picsum.photos/v2/list?page=1&limit=12');
  return await res.json();
}
