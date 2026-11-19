import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { stylesApex } from '../src/styles';

describe('stylesApex tooltip marker', () => {
  const cssText = String(stylesApex);

  it('does not draw a glyph on top of the SVG marker rendered by apexcharts (#131)', () => {
    expect(cssText).not.toMatch(/\.apexcharts-tooltip-marker(\[[^\]]*\])?::before/);
  });
});

describe('stylesApex tooltip theme', () => {
  const apexCss = readFileSync(createRequire(import.meta.url).resolve('apexcharts/dist/apexcharts.css'), 'utf8');
  const theme = {
    '--primary-text-color': 'rgb(225, 225, 225)',
    '--secondary-text-color': 'rgb(155, 155, 155)',
    '--card-background-color': 'rgb(28, 28, 28)',
    '--divider-color': 'rgb(60, 60, 60)',
  };

  // Same order as in the card: apexcharts prepends its stylesheet to the shadow root,
  // and Lit adopts the card's styles after it.
  const renderTooltip = (themeClass: string) => {
    const host = document.createElement('div');
    for (const [k, v] of Object.entries(theme)) host.style.setProperty(k, v);
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    const apexStyle = document.createElement('style');
    apexStyle.textContent = apexCss;
    root.appendChild(apexStyle);
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(String(stylesApex));
    root.adoptedStyleSheets = [sheet];
    const tooltip = document.createElement('div');
    tooltip.className = `apexcharts-tooltip ${themeClass}`;
    tooltip.innerHTML =
      '<div class="apexcharts-tooltip-title">7:02 PM</div><div class="apexcharts-tooltip-arrow"></div>';
    root.appendChild(tooltip);
    return {
      title: tooltip.querySelector('.apexcharts-tooltip-title') as HTMLElement,
      arrow: tooltip.querySelector('.apexcharts-tooltip-arrow') as HTMLElement,
    };
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each(['apexcharts-theme-light', 'apexcharts-theme-dark'])(
    'colors the %s title and arrow from the HA theme, not the apexcharts palette',
    (themeClass) => {
      const { title, arrow } = renderTooltip(themeClass);
      expect(getComputedStyle(title).color).toBe(theme['--secondary-text-color']);
      expect(getComputedStyle(arrow).backgroundColor).toBe(theme['--card-background-color']);
    },
  );
});
