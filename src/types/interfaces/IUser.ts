export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  expiresAt: number | null;
}
