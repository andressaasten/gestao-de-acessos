export interface Attachment {
  id: number;
  type: 'image' | 'pdf';
  url: string;
}

export interface Comment {
  userId: number;
  text: string;
  date: number;
}

export interface Permission {
  userId: number;
  docId: number;
  perms: ('read' | 'comment' | 'edit')[];
  expiresAt: number; // timestamp
}

export interface Document {
  id: number;
  title: string;
  text: string;
  attachments: Attachment[];
  comments: Comment[];
}
