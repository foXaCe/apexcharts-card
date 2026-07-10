import type { HomeAssistant } from 'custom-card-helpers';
import type { HassEntity } from 'home-assistant-js-websocket';

export const mkState = (
  id: string,
  state: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrs: Record<string, any> = {},
): HassEntity =>
  ({
    entity_id: id,
    state,
    attributes: attrs,
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    context: { id: 'ctx', parent_id: null, user_id: null },
  }) as unknown as HassEntity;

export const mkHass = (states: Record<string, HassEntity> = {}): HomeAssistant =>
  ({
    language: 'fr',
    locale: { language: 'fr', number_format: 'comma_decimal', time_format: '24' },
    config: { time_zone: 'Europe/Paris' },
    themes: { darkMode: false },
    states,
    callApi: async () => ({}),
    callWS: async () => ({}),
  }) as unknown as HomeAssistant;
