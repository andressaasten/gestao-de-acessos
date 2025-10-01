// stores/userStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types/interfaces/IUser';
import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  updateProfile as updateProfileService,
  getUserSession,
  getAllUsers,
  changeRole as changeRoleService,
  initUser as initUserService,
} from '../services/userServices';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(getUserSession()?.currentUser || null);
  const expiresAt = ref<number | null>(getUserSession()?.expiresAt || null);
  const users = ref<User[]>(getAllUsers());

  const isAuthenticated = computed(() => {
    return !!currentUser.value && (expiresAt.value || 0) > Date.now();
  });

  function init() {
    const alreadyInitialized = localStorage.getItem('users');
    if (!alreadyInitialized) {
      initUserService();
      users.value = getAllUsers();
    }
  }

  function login(email: string, password: string): boolean {
    const success = loginService(email, password);
    if (success) {
      const session = getUserSession();
      if (session) {
        currentUser.value = session.currentUser;
        expiresAt.value = session.expiresAt;
      }
    }
    return success;
  }

  function logout() {
    logoutService();
    currentUser.value = null;
    expiresAt.value = null;
  }

  function register(name: string, email: string, password: string) {
    registerService(name, email, password);
    users.value = getAllUsers();
  }

  function updateProfile(newData: { name?: string; email?: string; password?: string }) {
    updateProfileService(newData);
    const session = getUserSession();
    if (session) {
      currentUser.value = session.currentUser;
      expiresAt.value = session.expiresAt;
    }
    users.value = getAllUsers();
  }

  function changeRole(userId: number, newRole: 'admin' | 'user') {
    changeRoleService(userId, newRole);
    users.value = getAllUsers();
  }

  function refreshUsers() {
    users.value = getAllUsers();
  }

  return {
    currentUser,
    expiresAt,
    users,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    changeRole,
    refreshUsers,
    init,
  };
});
