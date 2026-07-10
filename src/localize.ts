import { en } from './translations/en';
import { fr } from './translations/fr';

const LANGS: Record<string, Record<string, string>> = { en, fr };

function normalize(lang: string | undefined): string {
  return lang && LANGS[lang.split('-')[0]] ? lang.split('-')[0] : 'en';
}

// Config errors can be thrown before `hass` is available (first setConfig),
// so start from the browser locale and switch to the HA user language as soon
// as the card/editor receives `hass`.
let _lang = normalize(typeof navigator !== 'undefined' ? navigator.language : undefined);

export function setLocale(lang: string | undefined): void {
  _lang = normalize(lang);
}

export function t(key: string, vars?: Record<string, string | number>): string {
  let str = LANGS[_lang][key] ?? LANGS.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
    }
  }
  return str;
}
