import CryptoJS from 'crypto-js';
import type { User } from '../types/interfaces/IUser';

let users: User[] = [];
let currentUser: User | null = null;
let expiresAt: number | null = null;

function init() {
  const savedUsers = localStorage.getItem('users');
  if (savedUsers) {
    users = JSON.parse(savedUsers);
  } else {
    users = [
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
    save();
  }

  const data = localStorage.getItem('user-session');
  if (data) {
    const parsed = JSON.parse(data);
    if (parsed.expiresAt > Date.now()) {
      currentUser = parsed.user;
      expiresAt = parsed.expiresAt;
    } else {
      logout();
    }
  }
}

function save() {
  localStorage.setItem('users', JSON.stringify(users));
}

function login(email: string, password: string): boolean {
  const hashedPassword = CryptoJS.SHA256(password).toString();
  const user = users.find((u) => u.email === email && u.password === hashedPassword);
  if (!user) return false;

  currentUser = user;
  expiresAt = Date.now() + 60 * 60 * 1000;

  localStorage.setItem('user-session', JSON.stringify({ user: currentUser, expiresAt }));
  return true;
}

function register(name: string, email: string, password: string) {
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
  save();
}

function changeRole(userId: number, newRole: 'admin' | 'user') {
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.role = newRole;
    save();
  }
}

function updateProfile(newData: { name?: string; email?: string; password?: string }) {
  if (!currentUser) return;

  const user = users.find((u) => u.id === currentUser!.id);
  if (user) {
    if (newData.name) user.name = newData.name;
    if (newData.email) {
      if (users.some((u) => u.email === newData.email && u.id !== user.id)) {
        throw new Error('E-mail já cadastrado!');
      }
      user.email = newData.email;
    }
    if (newData.password) {
      user.password = CryptoJS.SHA256(newData.password).toString();
    }

    currentUser = { ...user };
    save();
    localStorage.setItem('user-session', JSON.stringify({ user: currentUser, expiresAt }));
  }
}

function logout() {
  currentUser = null;
  expiresAt = null;
  localStorage.removeItem('user-session');
}

export function getCurrentUser() {
  return currentUser;
}

function getUsers() {
  return users;
}

export const userService = {
  init,
  save,
  login,
  register,
  changeRole,
  updateProfile,
  logout,
  getCurrentUser,
  getUsers,
};
