import { createI18n } from 'vue-i18n'
import pl from '@/assets/translations/pl'
import en from '@/assets/translations/en'

const i18n = createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages: { pl, en },
})

export default i18n
