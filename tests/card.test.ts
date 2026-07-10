// Side-effect import: registers the `apexcharts-card` custom element.
// The module also purges stale localForage entries at import time (caught internally)
// and reads `window`/`document` -- all provided by the happy-dom environment.
import '../src/apexcharts-card';
import { mkHass, mkState } from './fixtures/hass';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCard = any;

describe('apexcharts-card', () => {
  beforeAll(async () => {
    await customElements.whenDefined('apexcharts-card');
  });

  it('registers the custom element', () => {
    expect(customElements.get('apexcharts-card')).toBeDefined();
  });

  describe('setConfig', () => {
    const Ctor = () => customElements.get('apexcharts-card') as CustomElementConstructor;
    const newCard = (): AnyCard => new (Ctor())();

    it('throws on a null config', () => {
      const card = newCard();
      expect(() => card.setConfig(null)).toThrow();
    });

    it('throws on an empty config', () => {
      const card = newCard();
      expect(() => card.setConfig({})).toThrow();
    });

    it('throws when series is missing', () => {
      const card = newCard();
      expect(() => card.setConfig({ type: 'custom:apexcharts-card' })).toThrow(/series/);
    });

    it('throws on an unknown top-level key (strict ts-interface-checker validation)', () => {
      const card = newCard();
      expect(() =>
        card.setConfig({
          type: 'custom:apexcharts-card',
          series: [{ entity: 'sensor.temp' }],
          not_a_real_key: true,
        }),
      ).toThrow(/extraneous/);
    });

    it('accepts a minimal valid config', () => {
      const card = newCard();
      expect(() =>
        card.setConfig({ type: 'custom:apexcharts-card', series: [{ entity: 'sensor.temp' }] }),
      ).not.toThrow();
    });

    it('migrates the legacy `entities` key to `series`', () => {
      const card = newCard();
      expect(() =>
        card.setConfig({ type: 'custom:apexcharts-card', entities: [{ entity: 'sensor.temp' }] }),
      ).not.toThrow();
      expect(card._config.series).toHaveLength(1);
      expect(card._config.series[0].entity).toBe('sensor.temp');
      expect(card._config.entities).toBeUndefined();
    });

    it('accepts appearance: "minimal"', () => {
      const card = newCard();
      expect(() =>
        card.setConfig({
          type: 'custom:apexcharts-card',
          appearance: 'minimal',
          series: [{ entity: 'sensor.temp' }],
        }),
      ).not.toThrow();
    });

    it('throws on an invalid appearance value', () => {
      const card = newCard();
      expect(() =>
        card.setConfig({
          type: 'custom:apexcharts-card',
          appearance: 'invalid',
          series: [{ entity: 'sensor.temp' }],
        }),
      ).toThrow();
    });
  });

  describe('getGridOptions', () => {
    it('returns a fixed 12-column, auto-height grid layout', () => {
      const card = new (customElements.get('apexcharts-card') as CustomElementConstructor)() as AnyCard;
      card.setConfig({ type: 'custom:apexcharts-card', series: [{ entity: 'sensor.temp' }] });
      const grid = card.getGridOptions();
      expect(grid).toEqual({ columns: 12, rows: 'auto', min_columns: 6, min_rows: 2 });
      expect(grid.columns % 3).toBe(0);
    });
  });

  describe('getCardSize', () => {
    it('returns 3', () => {
      const card = new (customElements.get('apexcharts-card') as CustomElementConstructor)() as AnyCard;
      expect(card.getCardSize()).toBe(3);
    });
  });

  describe('getStubConfig', () => {
    it('returns a config with a header and a series built from a numeric sensor', () => {
      const hass = mkHass({
        'sensor.temp': mkState('sensor.temp', '21.5', { unit_of_measurement: '°C' }),
        'light.living_room': mkState('light.living_room', 'on', {}),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctor = customElements.get('apexcharts-card') as any;
      const stub = Ctor.getStubConfig(hass, ['sensor.temp'], []);
      expect(stub.header).toBeDefined();
      expect(stub.header.title).toBe('ApexCharts-Card');
      expect(stub.series.length).toBeGreaterThan(0);
      expect(stub.series[0].entity).toBe('sensor.temp');
    });
  });

  describe('window.customCards registration', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entry = () => (window as any).customCards.find((c: AnyCard) => c.type === 'apexcharts-card');

    it('registers a preview entry with documentationURL and a getEntitySuggestion function', () => {
      const e = entry();
      expect(e).toBeDefined();
      expect(e.preview).toBe(true);
      expect(typeof e.documentationURL).toBe('string');
      expect(typeof e.getEntitySuggestion).toBe('function');
    });

    describe('getEntitySuggestion', () => {
      it('returns null for non-numeric domains (e.g. light)', () => {
        const hass = mkHass({ 'light.foo': mkState('light.foo', 'on', {}) });
        expect(entry().getEntitySuggestion(hass, 'light.foo')).toBeNull();
      });

      it('returns an array of suggestions for a "measurement" state_class sensor', () => {
        const hass = mkHass({
          'sensor.power': mkState('sensor.power', '10', {
            state_class: 'measurement',
            unit_of_measurement: 'W',
          }),
        });
        const suggestion = entry().getEntitySuggestion(hass, 'sensor.power');
        expect(Array.isArray(suggestion)).toBe(true);
        expect(suggestion.length).toBeGreaterThan(0);
      });

      it('returns an array of suggestions for a "total_increasing" state_class sensor', () => {
        const hass = mkHass({
          'sensor.energy': mkState('sensor.energy', '10', {
            state_class: 'total_increasing',
            unit_of_measurement: 'kWh',
          }),
        });
        const suggestion = entry().getEntitySuggestion(hass, 'sensor.energy');
        expect(Array.isArray(suggestion)).toBe(true);
        expect(suggestion.length).toBeGreaterThan(0);
      });

      it('returns a single plain suggestion object for a numeric sensor without state_class', () => {
        const hass = mkHass({
          'sensor.plain': mkState('sensor.plain', '10', { unit_of_measurement: 'W' }),
        });
        const suggestion = entry().getEntitySuggestion(hass, 'sensor.plain');
        expect(Array.isArray(suggestion)).toBe(false);
        expect(suggestion).not.toBeNull();
        expect(suggestion.config).toBeDefined();
      });
    });
  });
});
