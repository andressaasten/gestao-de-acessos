export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UserState {
  currentUser: User;
  expiresAt: number | null;
}
