import { createPinia } from 'pinia'
import { useUserStore } from 'src/stores/user'
import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  const pinia = createPinia()
  app.use(pinia)

  const userStore = useUserStore(pinia)
  userStore.init()
})
