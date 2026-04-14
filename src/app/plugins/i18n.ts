import { createI18n } from 'vue-i18n'
import pl from '@/assets/translations/pl'
import en from '@/assets/translations/en'
import de from '@/assets/translations/de'
import ua from '@/assets/translations/ua'
import ru from '@/assets/translations/ru'

const i18n = createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages: { pl, en, de, ua, ru },
})

export default i18n
