import { createI18n } from 'vue-i18n'
import enUS from './en'
import ptBR from './pt'

export const messages = {
  'pt': ptBR,
  'en': enUS,
} as const

export type MessageLanguages = keyof typeof messages
export type MessageSchema = typeof enUS // pega inglês como schema base

const i18n = createI18n<[MessageSchema], MessageLanguages>({
  legacy: false,
  locale: 'pt',
  fallbackLocale: 'en',
  messages,
})

export default i18n
