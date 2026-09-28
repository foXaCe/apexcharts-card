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

  describe('filling a fixed-height sections cell', () => {
    const cardWith = (extra: Record<string, unknown> = {}, layout?: string): AnyCard => {
      const card = new (customElements.get('apexcharts-card') as CustomElementConstructor)() as AnyCard;
      card.setConfig({ type: 'custom:apexcharts-card', series: [{ entity: 'sensor.temp' }], ...extra });
      card.layout = layout;
      return card;
    };
    const graph = (clientHeight: number) => ({ clientWidth: 400, clientHeight }) as HTMLElement;
    const withCharts = (card: AnyCard) => {
      card._apexChart = { updateOptions: vi.fn() };
      card._apexBrush = { updateOptions: vi.fn() };
      return card;
    };

    it('fills only a grid cell with a numeric row count', () => {
      expect(cardWith({ grid_options: { rows: 4 } }, 'grid')._fillsHeight()).toBe(true);
      expect(cardWith({ grid_options: { rows: 'auto' } }, 'grid')._fillsHeight()).toBe(false);
      expect(cardWith({ grid_options: { columns: 6 } }, 'grid')._fillsHeight()).toBe(false);
      // grid_options is ignored outside sections, where the host has no fixed height.
      expect(cardWith({ grid_options: { rows: 4 } })._fillsHeight()).toBe(false);
    });

    it('fills with section_mode outside sections only', () => {
      expect(cardWith({ section_mode: true })._fillsHeight()).toBe(true);
      expect(cardWith({ section_mode: true }, 'panel')._fillsHeight()).toBe(true);
      // An auto-rows cell has no fixed height to fill.
      expect(cardWith({ section_mode: true, grid_options: { columns: 6 } }, 'grid')._fillsHeight()).toBe(false);
      expect(cardWith({ section_mode: true, grid_options: { rows: 5 } }, 'grid')._fillsHeight()).toBe(true);
    });

    it('sizes the chart to #graph, unless apex_config sets a height or #graph is not laid out', () => {
      expect(cardWith({ grid_options: { rows: 4 } }, 'grid')._chartFillHeight(graph(208))).toBe(208);
      expect(cardWith({ grid_options: { rows: 4 } })._chartFillHeight(graph(208))).toBeUndefined();
      expect(
        cardWith({ grid_options: { rows: 4 }, apex_config: { chart: { height: 300 } } }, 'grid')._chartFillHeight(
          graph(208),
        ),
      ).toBeUndefined();
      expect(cardWith({ grid_options: { rows: 4 } }, 'grid')._chartFillHeight(graph(20))).toBeUndefined();
    });

    it('resizes the main chart height with the cell and keeps the brush height', () => {
      const card = withCharts(cardWith({ grid_options: { rows: 4 } }, 'grid'));
      card._resizeCharts(graph(208));
      expect(card._apexChart.updateOptions).toHaveBeenLastCalledWith(
        { chart: { width: 400, height: 208 } },
        false,
        true,
      );
      expect(card._apexBrush.updateOptions).toHaveBeenLastCalledWith({ chart: { width: 400 } }, false, true);
    });

    it('hands the height back to ApexCharts once when rows go back to auto', () => {
      const card = withCharts(cardWith({ grid_options: { rows: 4 } }, 'grid'));
      card._resizeCharts(graph(208));
      card.setConfig({ type: 'custom:apexcharts-card', series: [{ entity: 'sensor.temp' }] });
      card._resizeCharts(graph(170));
      expect(card._apexChart.updateOptions).toHaveBeenLastCalledWith(
        { chart: { width: 400, height: 'auto' } },
        false,
        true,
      );
      card._resizeCharts(graph(170));
      expect(card._apexChart.updateOptions).toHaveBeenLastCalledWith({ chart: { width: 400 } }, false, true);
    });

    it('leaves the height alone for auto rows', () => {
      const card = withCharts(cardWith({}, 'grid'));
      card._resizeCharts(graph(170));
      expect(card._apexChart.updateOptions).toHaveBeenLastCalledWith({ chart: { width: 400 } }, false, true);
    });

    it('marks the host and ha-card so the CSS can hand #graph the leftover height', () => {
      const card = cardWith({ grid_options: { rows: 4 } }, 'grid');
      card._hass = mkHass({ 'sensor.temp': mkState('sensor.temp', '21') });
      card._entities = [card._hass.states['sensor.temp']];
      const tpl = card.render();
      expect(card.hasAttribute('data-fill-height')).toBe(true);
      expect(JSON.stringify(tpl.values)).toContain('"section":true');

      card.layout = undefined;
      card.render();
      expect(card.hasAttribute('data-fill-height')).toBe(false);
    });
  });

  describe('disconnectedCallback', () => {
    it('destroys the chart and brush so a discarded card can be garbage collected', () => {
      const card = new (customElements.get('apexcharts-card') as CustomElementConstructor)() as AnyCard;
      card.setConfig({ type: 'custom:apexcharts-card', series: [{ entity: 'sensor.temp' }] });
      const chart = { destroy: vi.fn() };
      const brush = { destroy: vi.fn() };
      card._apexChart = chart;
      card._apexBrush = brush;
      card._loaded = true;
      card._dataLoaded = true;
      card._brushInit = true;

      card.disconnectedCallback();

      expect(chart.destroy).toHaveBeenCalledOnce();
      expect(brush.destroy).toHaveBeenCalledOnce();
      expect(card._apexChart).toBeUndefined();
      expect(card._apexBrush).toBeUndefined();
      // Cleared so connectedCallback rebuilds the chart when HA reattaches the card.
      expect(card._loaded).toBe(false);
      expect(card._dataLoaded).toBe(false);
      expect(card._brushInit).toBe(false);
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
