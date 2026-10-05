import { stylesApex } from '../src/styles';

describe('stylesApex tooltip marker', () => {
  const cssText = String(stylesApex);

  it('does not draw a glyph on top of the SVG marker rendered by apexcharts (#131)', () => {
    expect(cssText).not.toMatch(/\.apexcharts-tooltip-marker(\[[^\]]*\])?::before/);
  });
});
