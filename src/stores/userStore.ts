import { defineStore } from 'pinia';
import { getUserSession } from 'src/services/userServices';
import type { User } from 'src/types/interfaces/IUser';
import { ref } from 'vue';

export const useUserStore = defineStore('userStore', () => {
  const user = ref<User | null>(null);

  const getUser = () => {
    if (user.value) {
      return user.value;
    }

    return refreshUser();
  };

  const setUser = (newUser: User) => {
    user.value = newUser;
  };

  const refreshUser = () => {
    const session = getUserSession();

    if (!session) {
      return null;
    }

    user.value = session.currentUser;

    return user.value;
  };

  const clear = () => {
    user.value = null;
  };

  return {
    getUser,
    setUser,
    refreshUser,
    clear,
  };
});
