import CryptoJS from 'crypto-js';
import type { User, UserState } from '../types/interfaces/IUser';

export function initUser() {
  const users = [
    {
      id: 1,
      name: 'Administrador',
      email: 'admin@teste.com',
      password: CryptoJS.SHA256('Teste@1').toString(),
      role: 'admin',
    },
    {
      id: 2,
      name: 'Usuário',
      email: 'user@teste.com',
      password: CryptoJS.SHA256('Teste@1').toString(),
      role: 'user',
    },
  ];
  setUsers(users);
}

export function setUsers(users: User[]) {
  localStorage.setItem('users', JSON.stringify(users));
}

export function getAllUsers(): User[] {
  const usersJson = localStorage.getItem('users');

  if (!usersJson) {
    return [];
  }

  return JSON.parse(usersJson);
}

export function setUserSession(userSession: UserState) {
  localStorage.setItem('user-session', JSON.stringify(userSession));
}

export function getUserSession(): UserState | null {
  const usersJson = localStorage.getItem('user-session');

  if (!usersJson) {
    return null;
  }

  return JSON.parse(usersJson);
}

export function login(email: string, password: string): boolean {
  const hashedPassword = CryptoJS.SHA256(password).toString();
  const users = getAllUsers();
  const user = users.find((u) => u.email === email && u.password === hashedPassword);
  if (!user) return false;

  const session: UserState = {
    currentUser: user,
    expiresAt: Date.now() + 60 * 60 * 1000,
  };
  setUserSession(session);

  return true;
}

export function register(name: string, email: string, password: string) {
  const users = getAllUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error('E-mail já cadastrado!');
  }

  const hashedPassword = CryptoJS.SHA256(password).toString();

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
    role: 'user',
  };
  users.push(newUser);
  setUsers(users);
}

export function changeRole(userId: number, newRole: 'admin' | 'user') {
  const users = getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.role = newRole;
    setUsers(users);
  }
}

export function updateProfile(newData: { name?: string; email?: string; password?: string }) {
  const session = getUserSession();
  if (!session?.currentUser) return;

  const users = getAllUsers();
  const user = users.find((u) => u.id === session.currentUser.id);
  if (user) {
    user.name = newData.name || user.name;

    if (newData.email) {
      if (users.some((u) => u.email === newData.email && u.id !== user.id)) {
        throw new Error('E-mail já cadastrado!');
      }
      user.email = newData.email;
    }
    if (newData.password) {
      user.password = CryptoJS.SHA256(newData.password).toString();
    }

    setUsers(users);
  }
}

export function logout() {
  localStorage.removeItem('user-session');
}
