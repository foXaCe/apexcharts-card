import { HaFormSchema } from '../types';
import { t } from '../localize';

// Schemas below are exposed as functions (not module-level constants) so that option labels,
// titles and helper text re-resolve to the current editor locale on every render.

// ── Grid ──
export function getGridSchema(): HaFormSchema[] {
  return [
    {
      type: 'grid',
      name: '',
      schema: [
        {
          name: 'position',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: '', label: t('common.default') },
                { value: 'front', label: t('common.front') },
                { value: 'back', label: t('common.back') },
              ],
            },
          },
        },
        { name: 'borderColor', selector: { text: {} } },
      ],
    },
  ];
}

export function getGridBoolFields(): { name: string; label: string; helper: string }[] {
  return [
    { name: 'show', label: t('display.grid.show.label'), helper: t('display.grid.show.helper') },
    {
      name: 'xaxis_lines_show',
      label: t('display.grid.xaxisLines.label'),
      helper: t('display.grid.xaxisLines.helper'),
    },
    {
      name: 'yaxis_lines_show',
      label: t('display.grid.yaxisLines.label'),
      helper: t('display.grid.yaxisLines.helper'),
    },
  ];
}

// ── Legend ──
export function getLegendSchema(): HaFormSchema[] {
  return [
    {
      type: 'grid',
      name: '',
      schema: [
        {
          name: 'position',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: '', label: t('common.default') },
                { value: 'top', label: t('common.position.top') },
                { value: 'right', label: t('common.position.right') },
                { value: 'bottom', label: t('common.position.bottom') },
                { value: 'left', label: t('common.position.left') },
              ],
            },
          },
        },
        {
          name: 'horizontalAlign',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: '', label: t('common.default') },
                { value: 'left', label: t('common.position.left') },
                { value: 'center', label: t('common.position.center') },
                { value: 'right', label: t('common.position.right') },
              ],
            },
          },
        },
      ],
    },
  ];
}

// ── Tooltip ──
export function getTooltipSchema(): HaFormSchema[] {
  return [
    {
      type: 'grid',
      name: '',
      schema: [
        {
          name: 'theme',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: '', label: t('common.default') },
                { value: 'light', label: t('common.theme.light') },
                { value: 'dark', label: t('common.theme.dark') },
              ],
            },
          },
        },
        {
          name: 'x_format',
          helper: t('display.tooltip.xFormat.helper'),
          selector: { text: {} },
        },
      ],
    },
  ];
}

// ── Toolbar ──
// chart.toolbar.show, chart.toolbar.tools.{zoom,pan,download,reset,zoomin,zoomout}
export function getToolbarBoolFields(): { name: string; label: string; helper: string }[] {
  return [
    { name: 'show', label: t('display.toolbar.show.label'), helper: t('display.toolbar.show.helper') },
    { name: 'tool_zoom', label: t('display.toolbar.zoom.label'), helper: t('display.toolbar.zoom.helper') },
    { name: 'tool_pan', label: t('display.toolbar.pan.label'), helper: t('display.toolbar.pan.helper') },
    { name: 'tool_download', label: t('display.toolbar.download.label'), helper: t('display.toolbar.download.helper') },
    { name: 'tool_reset', label: t('display.toolbar.reset.label'), helper: t('display.toolbar.reset.helper') },
  ];
}

// ── Markers ──
export function getMarkersSchema(): HaFormSchema[] {
  return [
    {
      type: 'grid',
      name: '',
      schema: [
        {
          name: 'size',
          helper: t('display.markers.size.helper'),
          selector: { number: { min: 0, max: 20, step: 1, mode: 'box' } },
        },
        {
          name: 'shape',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: '', label: t('common.default') },
                { value: 'circle', label: t('display.markers.shape.circle') },
                { value: 'square', label: t('display.markers.shape.square') },
              ],
            },
          },
        },
      ],
    },
    {
      name: 'strokeWidth',
      helper: t('display.markers.strokeWidth.helper'),
      selector: { number: { min: 0, max: 10, step: 1, mode: 'box' } },
    },
  ];
}

// ── Chart background / foreground ──
export function getChartColorsSchema(): HaFormSchema[] {
  return [
    {
      name: 'background',
      helper: t('display.chartColors.background.helper'),
      selector: { text: {} },
    },
    {
      name: 'foreColor',
      helper: t('display.chartColors.foreColor.helper'),
      selector: { text: {} },
    },
  ];
}
