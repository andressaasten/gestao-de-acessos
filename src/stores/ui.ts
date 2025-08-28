import { defineStore } from 'pinia'
import { Dark } from 'quasar'

export const useUiStore = defineStore('ui', {
  state: () => ({
    darkMode: Dark.isActive,
    locale: 'pt'
  }),

  actions: {
    toggleDark() {
      this.darkMode = !this.darkMode
      Dark.set(this.darkMode)
    },
    setLocale(lang: 'pt' | 'en') {
      this.locale = lang
    }
  }
})
