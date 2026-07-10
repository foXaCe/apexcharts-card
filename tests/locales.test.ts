import { getLocales, getDefaultLocale } from '../src/locales';

describe('locales.ts', () => {
  describe('getLocales', () => {
    it('includes the main locales used by the card', () => {
      const locales = getLocales();
      expect(locales.fr).toBeDefined();
      expect(locales.en).toBeDefined();
      expect(locales.de).toBeDefined();
    });

    it('exposes legacy aliases pointing at the same locale object', () => {
      const locales = getLocales();
      expect(locales.rs).toBe(locales.sr);
      expect(locales.se).toBe(locales.sv);
      expect(locales.ua).toBe(locales.uk);
    });

    it('returns a fresh object on every call', () => {
      expect(getLocales()).not.toBe(getLocales());
      expect(getLocales()).toEqual(getLocales());
    });
  });

  describe('getDefaultLocale', () => {
    it('returns the same locale object as locales.en', () => {
      expect(getDefaultLocale()).toBe(getLocales().en);
    });
  });
});
