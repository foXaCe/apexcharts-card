import { deepEqual } from '../src/deep-equal';

describe('deepEqual', () => {
  it('compares primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual('a', 'b')).toBe(false);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  it('compares flat objects', () => {
    expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({}, {})).toBe(true);
  });

  it('compares nested objects', () => {
    expect(deepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 3 } } })).toBe(true);
    expect(deepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 4 } } })).toBe(false);
  });

  it('compares arrays', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
    expect(deepEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
    expect(deepEqual([], [])).toBe(true);
    expect(deepEqual([], {})).toBe(false);
  });

  it('compares mixed structures', () => {
    const a = { series: [{ entity: 'sensor.a', show: { in_header: true } }], span: { end: 'day' } };
    const b = { series: [{ entity: 'sensor.a', show: { in_header: true } }], span: { end: 'day' } };
    expect(deepEqual(a, b)).toBe(true);
    b.series[0].show.in_header = false;
    expect(deepEqual(a, b)).toBe(false);
  });

  it('compares Date and RegExp instances', () => {
    expect(deepEqual(new Date(42), new Date(42))).toBe(true);
    expect(deepEqual(new Date(42), new Date(43))).toBe(false);
    expect(deepEqual(/ab/g, /ab/g)).toBe(true);
    expect(deepEqual(/ab/g, /ab/i)).toBe(false);
  });
});

describe('deepEqual — ES6 collections and typed arrays', () => {
  it('compares Maps', () => {
    expect(deepEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
    expect(deepEqual(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
    expect(deepEqual(new Map([['a', 1]]), new Map([['b', 1]]))).toBe(false);
    expect(deepEqual(new Map(), new Map([['a', 1]]))).toBe(false);
  });

  it('compares Sets', () => {
    expect(deepEqual(new Set([1, 2]), new Set([1, 2]))).toBe(true);
    expect(deepEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
    expect(deepEqual(new Set([1]), new Set([1, 2]))).toBe(false);
  });

  it('compares typed arrays', () => {
    expect(deepEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
    expect(deepEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false);
    expect(deepEqual(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(false);
  });
});
