const LOCALE_MAP: Record<string, string> = {
  pl: 'pl-PL',
  en: 'en-GB',
  de: 'de-DE',
  ua: 'uk-UA',
  ru: 'ru-RU',
}

function toIntlLocale(locale: string): string {
  return LOCALE_MAP[locale] ?? 'en-GB'
}

export function formatDate(isoDate: string | null | undefined, locale: string): string {
  if (!isoDate) return '—'
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoDate))
}

export function formatDateTime(isoDate: string | null | undefined, locale: string): string {
  if (!isoDate) return '—'
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}
