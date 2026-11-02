// A 7d graph grouped by 1d must show 7 buckets, starting on the first day of the span:
// - GraphEntry must fetch one extra bucket, because _dataBucketer() drops the first one
// - with `span.end`, the span must be exactly graph_span long, otherwise
//   _findStartAndEndOfChart() pushes the x-axis start to the next bucket
import '../src/apexcharts-card';
import GraphEntry from '../src/graphEntry';
import { mkHass, mkState } from './fixtures/hass';

const DAY = 24 * 3600 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>;

// Day-aligned, away from any DST transition in Europe/Paris
const T0 = new Date('2026-07-01T00:00:00').getTime();

describe('group_by bucket count', () => {
  it('a 7d span grouped by 1d returns 7 buckets, the first one at the span start', async () => {
    const config: AnyRec = {
      entity: 'sensor.steps',
      index: 0,
      type: 'column',
      group_by: { duration: '1d', offset: '+0h', func: 'max', fill: 'last' },
      show: {},
      ignore_history: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entry = new GraphEntry(0, 7 * DAY, false, config as any, undefined);
    const hass = mkHass({ 'sensor.steps': mkState('sensor.steps', '700') });
    // One value per day, in the middle of the day: day i => (i + 1) * 100
    const states = Array.from({ length: 7 }, (_, i) => {
      const ts = new Date(T0 + i * DAY + DAY / 2).toISOString();
      return { entity_id: 'sensor.steps', state: `${(i + 1) * 100}`, last_changed: ts, last_updated: ts };
    });
    (hass as AnyRec).callApi = async () => [states];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entry.hass = hass as any;

    expect(await entry._updateHistory(new Date(T0), new Date(T0 + 7 * DAY))).toBe(true);
    const history = entry.history;
    expect(history).toHaveLength(7);
    expect(history[0]).toEqual([T0, 100]);
    expect(history[6]).toEqual([T0 + 6 * DAY, 700]);
  });
});

describe('x-axis span with span.end', () => {
  const newCard = (): AnyRec => new (customElements.get('apexcharts-card') as CustomElementConstructor)();

  beforeAll(async () => {
    await customElements.whenDefined('apexcharts-card');
  });

  const setup = (series: AnyRec[]): AnyRec => {
    const card = newCard();
    card.setConfig({ type: 'custom:apexcharts-card', graph_span: '7d', span: { end: 'day' }, series });
    card._hass = mkHass({ 'sensor.steps': mkState('sensor.steps', '1'), 'sensor.goal': mkState('sensor.goal', '1') });
    return card;
  };

  it('spans exactly graph_span and starts the x-axis on the first bucket', () => {
    const card = setup([{ entity: 'sensor.steps', type: 'column', group_by: { func: 'max', duration: '1d' } }]);
    const { start, end } = card._getSpanDates();
    expect(end.getTime() - start.getTime()).toBe(7 * DAY);
    const chart = card._findStartAndEndOfChart(start, end, false);
    expect(chart.start).toBe(start.getTime());
    expect(chart.end).toBe(end.getTime() - DAY);
  });

  it('a raw data_generator series does not prevent the alignment', () => {
    const card = setup([
      { entity: 'sensor.steps', type: 'column', group_by: { func: 'max', duration: '1d' } },
      { entity: 'sensor.goal', type: 'line', group_by: { duration: '1d' }, data_generator: 'return [];' },
    ]);
    const { start, end } = card._getSpanDates();
    const chart = card._findStartAndEndOfChart(start, end, false);
    expect(chart.start).toBe(start.getTime());
    expect(chart.end).toBe(end.getTime() - DAY);
  });
});
