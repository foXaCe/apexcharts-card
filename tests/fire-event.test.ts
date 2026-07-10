import { fireEvent } from '../src/fire-event';

describe('fireEvent', () => {
  it('dispatches a composed, bubbling custom event with the given detail', () => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    let received: Event | undefined;
    document.body.addEventListener('action', (ev) => {
      received = ev;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fireEvent(node, 'action' as any, { action: 'tap' } as any);

    expect(received).toBeDefined();
    expect(received!.type).toBe('action');
    expect(received!.bubbles).toBe(true);
    expect(received!.composed).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((received as any).detail).toEqual({ action: 'tap' });
    node.remove();
  });

  it('honours dispatch options (no bubbling when bubbles: false)', () => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    let bubbled = false;
    document.body.addEventListener('ll-rebuild', () => {
      bubbled = true;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fireEvent(node, 'll-rebuild' as any, {} as any, { bubbles: false });

    expect(bubbled).toBe(false);
    node.remove();
  });
});
