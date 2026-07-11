// Backwards-compatibility harness: every apexcharts-card config found in the
// repo's dev dashboard fixture (test/ui-lovelace.yaml, inherited from upstream)
// must still be accepted by setConfig after the overhaul.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { load } from 'js-yaml';
import '../src/apexcharts-card';

const __dir = dirname(fileURLToPath(import.meta.url));
const yamlPath = join(__dir, '..', 'test', 'ui-lovelace.yaml');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyConf = Record<string, any>;

function collectCards(node: unknown, out: AnyConf[]): void {
  if (Array.isArray(node)) {
    node.forEach((n) => collectCards(n, out));
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as AnyConf;
    if (obj.type === 'custom:apexcharts-card') out.push(obj);
    Object.values(obj).forEach((v) => collectCards(v, out));
  }
}

// json: true tolerates duplicated mapping keys (last one wins), matching how
// PyYAML loads this fixture inside Home Assistant.
const doc = load(readFileSync(yamlPath, 'utf-8'), { json: true }) as AnyConf;
const all: AnyConf[] = [];
collectCards(doc, all);

// config_templates requires the Lovelace root config (getLovelace()), which does
// not exist outside a real dashboard — those configs are validated at runtime only.
const standalone = all.filter((c) => !c.config_templates);
const skipped = all.length - standalone.length;

describe(`config backwards compatibility (${all.length} found, ${skipped} template-based skipped)`, () => {
  beforeAll(async () => {
    await customElements.whenDefined('apexcharts-card');
  });

  it('found a meaningful corpus', () => {
    expect(all.length).toBeGreaterThanOrEqual(40);
    expect(standalone.length).toBeGreaterThan(0);
  });

  it.each(standalone.map((conf, i) => [i, conf.series?.[0]?.entity ?? conf.entities?.[0]?.entity ?? '?', conf]))(
    'config #%i (%s) is accepted by setConfig',
    (_i, _entity, conf) => {
      const Ctor = customElements.get('apexcharts-card') as CustomElementConstructor;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const card = new Ctor() as any;
      expect(() => card.setConfig(conf)).not.toThrow();
    },
  );
});
