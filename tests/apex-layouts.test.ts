import { getLayoutConfig, getBrushLayoutConfig } from '../src/apex-layouts';
import { mkHass } from './fixtures/hass';
import '../src/apexcharts-card';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>;

// Build the internal ChartCardConfig the same way the card does: through setConfig.
function internalConfig(extra: AnyRec = {}): AnyRec {
  const Ctor = customElements.get('apexcharts-card') as CustomElementConstructor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card = new Ctor() as any;
  card.setConfig({
    type: 'custom:apexcharts-card',
    series: [{ entity: 'sensor.temp' }],
    ...extra,
  });
  return card._config;
}

describe('getLayoutConfig', () => {
  beforeAll(async () => {
    await customElements.whenDefined('apexcharts-card');
  });

  it('uses HA theme variable for foreColor', () => {
    const layout = getLayoutConfig(internalConfig(), undefined, []) as AnyRec;
    expect(layout.chart.foreColor).toBe('var(--primary-text-color)');
  });

  it('follows hass.language for the locale by default', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layout = getLayoutConfig(internalConfig(), mkHass() as any, []) as AnyRec;
    expect(layout.chart.defaultLocale).toBe('fr');
  });

  it('config.locale overrides hass.language', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layout = getLayoutConfig(internalConfig({ locale: 'de' }), mkHass() as any, []) as AnyRec;
    expect(layout.chart.defaultLocale).toBe('de');
  });

  it('legacy locale aliases still resolve (ua -> uk locale data)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layout = getLayoutConfig(internalConfig({ locale: 'ua' }), mkHass() as any, []) as AnyRec;
    expect(layout.chart.defaultLocale).toBe('ua');
    expect(layout.chart.locales[0]).toBeDefined();
  });

  it('falls back to en for an unknown locale', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hass = mkHass() as any;
    hass.language = 'xx';
    const layout = getLayoutConfig(internalConfig(), hass, []) as AnyRec;
    expect(layout.chart.defaultLocale).toBe('en');
  });

  it('section_mode drives a 100% chart height', () => {
    const layout = getLayoutConfig(internalConfig({ section_mode: true }), undefined, []) as AnyRec;
    expect(layout.chart.height).toBe('100%');
    const layoutDefault = getLayoutConfig(internalConfig(), undefined, []) as AnyRec;
    expect(layoutDefault.chart.height).toBeUndefined();
  });

  it('chart_type and stacked are propagated', () => {
    const layout = getLayoutConfig(internalConfig({ chart_type: 'scatter', stacked: true }), undefined, []) as AnyRec;
    expect(layout.chart.type).toBe('scatter');
    expect(layout.chart.stacked).toBe(true);
  });

  it('apex_config deep-merges over the defaults', () => {
    const layout = getLayoutConfig(
      internalConfig({ apex_config: { grid: { strokeDashArray: 7 }, chart: { height: 321 } } }),
      undefined,
      [],
    ) as AnyRec;
    expect(layout.grid.strokeDashArray).toBe(7);
    expect(layout.chart.height).toBe(321);
  });
});

describe('getBrushLayoutConfig', () => {
  it('links the brush to the main chart id, hides legend/tooltip', () => {
    const config = internalConfig({ experimental: { brush: true } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layout = getBrushLayoutConfig(config, mkHass() as any, 'main-id') as AnyRec;
    expect(layout.chart.brush.target).toBe('main-id');
    expect(layout.chart.brush.enabled).toBe(true);
    expect(layout.legend.show).toBe(false);
    expect(layout.tooltip.enabled).toBe(false);
  });
});
