import { setEditorLocale, t } from '../src/editor/localize';
import { en } from '../src/translations/en';
import { fr } from '../src/translations/fr';

describe('editor/localize.ts', () => {
  afterEach(() => {
    // Reset to the default locale so tests don't leak state into each other.
    setEditorLocale('en');
  });

  it('defaults to English before any locale is set', () => {
    expect(t('tabs.general')).toBe('General');
  });

  it('setEditorLocale("fr-FR") normalizes to the base "fr" language', () => {
    setEditorLocale('fr-FR');
    expect(t('tabs.general')).toBe('Général');
  });

  it('setEditorLocale(undefined) falls back to English', () => {
    setEditorLocale('fr');
    expect(t('tabs.general')).toBe('Général');
    setEditorLocale(undefined);
    expect(t('tabs.general')).toBe('General');
  });

  it('setEditorLocale with an unsupported language falls back to English', () => {
    setEditorLocale('xx');
    expect(t('tabs.general')).toBe('General');
  });

  it('falls back to the English string for a key missing from the current (non-English) language', () => {
    // en/fr have full key parity in this codebase, so to exercise the fallback
    // branch of t() -- `LANGS[_lang][key] ?? LANGS.en[key] ?? key` -- we
    // temporarily remove a key from the live `fr` dictionary object (localize.ts
    // holds a reference to this same object, not a copy) and restore it after.
    const key = 'tabs.general';
    const original = fr[key];
    delete (fr as Record<string, string>)[key];
    try {
      setEditorLocale('fr');
      expect(t(key)).toBe(en[key]);
    } finally {
      (fr as Record<string, string>)[key] = original;
    }
  });

  it('returns the raw key when it is unknown in every language', () => {
    setEditorLocale('fr');
    expect(t('this.key.does.not.exist')).toBe('this.key.does.not.exist');
  });

  it('en and fr dictionaries expose exactly the same set of keys', () => {
    const enKeys = Object.keys(en).sort();
    const frKeys = Object.keys(fr).sort();
    expect(frKeys).toEqual(enKeys);
  });
});

describe('t() variable substitution and localized errors', () => {
  afterEach(() => setEditorLocale('en'));

  it('substitutes {vars} in translated strings', () => {
    setEditorLocale('en');
    expect(t('error.yaxis.badMinMaxFormat', { value: '~x' })).toBe('Bad yaxis min/max format: ~x');
    setEditorLocale('fr');
    expect(t('error.yaxis.idNotFound', { id: 'left' })).toContain("left n'existe pas");
  });

  it('validateInterval throws a localized message', async () => {
    const { validateInterval } = await import('../src/utils');
    setEditorLocale('fr');
    expect(() => validateInterval('nope', 'graph_span')).toThrow(/intervalle de temps valide/);
    setEditorLocale('en');
    expect(() => validateInterval('nope', 'graph_span')).toThrow(/not a valid range of time/);
  });
});
