import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as string | null,
    name: '' as string,
    email: '' as string,
    role: 'user' as 'user' | 'admin',
    isLogged: false
  }),

  actions: {
    login(id: string, name: string, email: string, role: 'user' | 'admin') {
      this.id = id
      this.name = name
      this.email = email
      this.role = role
      this.isLogged = true
    },
    logout() {
      this.id = null
      this.name = ''
      this.email = ''
      this.role = 'user'
      this.isLogged = false
    }
  },
  persist: true
})
