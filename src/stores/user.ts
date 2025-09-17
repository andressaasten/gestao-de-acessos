import { defineStore } from 'pinia';
import CryptoJS from 'crypto-js';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

interface UserState {
  users: User[];
  currentUser: User | null;
  expiresAt: number | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    currentUser: null,
    expiresAt: null,
  }),

  actions: {
    init() {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        this.users = [
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
        this.save();
      }

      const data = localStorage.getItem('user-session');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.expiresAt > Date.now()) {
          this.currentUser = parsed.user;
          this.expiresAt = parsed.expiresAt;
        } else {
          this.logout();
        }
      }
    },

    save() {
      localStorage.setItem('users', JSON.stringify(this.users));
    },

    login(email: string, password: string): boolean {
      const hashedPassword = CryptoJS.SHA256(password).toString();
      const user = this.users.find((u) => u.email === email && u.password === hashedPassword);
      if (!user) return false;

      this.currentUser = user;
      this.expiresAt = Date.now() + 60 * 60 * 1000; // 1h

      localStorage.setItem(
        'user-session',
        JSON.stringify({ user: this.currentUser, expiresAt: this.expiresAt }),
      );
      return true;
    },

    register(name: string, email: string, password: string) {
      if (this.users.some((u) => u.email === email)) {
        throw new Error('E-mail já cadastrado!');
      }

      const hashedPassword = CryptoJS.SHA256(password).toString();

      const newUser: User = {
        id: this.users.length + 1,
        name,
        email,
        password: hashedPassword,
        role: 'user',
      };
      this.users.push(newUser);
      this.save();
    },

    changeRole(userId: number, newRole: 'admin' | 'user') {
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.role = newRole;
        this.save();
      }
    },

    updateProfile(newData: { name?: string; email?: string; password?: string }) {
      if (!this.currentUser) return;

      const user = this.users.find((u) => u.id === this.currentUser!.id);
      if (user) {
        if (newData.name) user.name = newData.name;
        if (newData.email) {
          if (this.users.some((u) => u.email === newData.email && u.id !== user.id)) {
            throw new Error('E-mail já cadastrado!');
          }
          user.email = newData.email;
        }
        if (newData.password) {
          user.password = CryptoJS.SHA256(newData.password).toString();
        }

        this.currentUser = { ...user };
        this.save();
        localStorage.setItem(
          'user-session',
          JSON.stringify({ user: this.currentUser, expiresAt: this.expiresAt }),
        );
      }
    },

    logout() {
      this.currentUser = null;
      this.expiresAt = null;
      localStorage.removeItem('user-session');
    },
  },
});
