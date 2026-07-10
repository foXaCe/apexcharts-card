import { en } from './translations/en';
import { fr } from './translations/fr';

const LANGS: Record<string, Record<string, string>> = { en, fr };
let _lang = 'en';

export function setEditorLocale(lang: string | undefined): void {
  _lang = lang && LANGS[lang.split('-')[0]] ? lang.split('-')[0] : 'en';
}

export function t(key: string): string {
  return LANGS[_lang][key] ?? LANGS.en[key] ?? key;
}
