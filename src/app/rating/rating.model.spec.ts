import { appendEvent, createData, DAY, evaluate, PrimeEvent, validateData } from './rating.model';

const event = (at = 0, acceleration = 0.01, durationDays = 7, id = 'one'): PrimeEvent => ({ id, name: 'Тренировка', at, acceleration, durationDays });

describe('rating physics', () => {
  it('starts at ten and falls quadratically to zero in 730 days', () => {
    const data = createData(0);
    expect(evaluate(data, 0).height).toBe(10);
    expect(evaluate(data, 0).velocity).toBe(0);
    expect(evaluate(data, 365 * DAY).height).toBeCloseTo(7.5, 9);
    expect(evaluate(data, 730 * DAY)).toEqual({height: 0, velocity: 0, acceleration: 0, grounded: true});
  });
  it('changes acceleration without instant points or speed', () => {
    const data = createData(0), at = 20 * DAY;
    const before = evaluate(data, at);
    const next = appendEvent(data, event(at));
    const after = evaluate(next, at);
    expect(after.height).toBeCloseTo(before.height, 10);
    expect(after.velocity).toBeCloseTo(before.velocity, 10);
    expect(after.acceleration).toBeGreaterThan(before.acceleration);
    expect(evaluate(next, at + DAY).velocity).toBeGreaterThan(after.velocity);
  });
  it('adds simultaneous accelerations and retains velocity when they expire', () => {
    const data = appendEvent(appendEvent(createData(0), event()), event(0, 0.02, 10, 'two'));
    const start = evaluate(data, 0);
    expect(start.acceleration).toBeGreaterThan(0.029);
    const left = evaluate(data, 7 * DAY - 1);
    const right = evaluate(data, 7 * DAY);
    expect(left.acceleration - right.acceleration).toBeCloseTo(0.01, 8);
    expect(right.velocity).toBeCloseTo(left.velocity, 7);
    expect(right.velocity).toBeGreaterThan(0);
    expect(evaluate(data, 730 * DAY).height).toBe(0);
  });
  it('starts a new flight from zero, ignoring the initial zero root', () => {
    const data = appendEvent(createData(0), event(800 * DAY));
    expect(evaluate(data, 800 * DAY).height).toBe(0);
    expect(evaluate(data, 801 * DAY).height).toBeGreaterThan(0);
    expect(evaluate(data, 1530 * DAY).grounded).toBe(true);
  });
  it('stops at first floor contact and never revives old forces', () => {
    const data = appendEvent(createData(0), event(729 * DAY, 0.00001, 729));
    expect(evaluate(data, 740 * DAY).grounded).toBe(true);
    expect(evaluate(data, 1000 * DAY).height).toBe(0);
    expect(evaluate(data, 5000 * DAY).height).toBe(0);
  });
  it('is independent of how often the app is opened', () => {
    const data = appendEvent(createData(0), event(30 * DAY));
    const snapshot = JSON.stringify(data);
    for (let d = 0; d < 500; d++) evaluate(data, d * DAY);
    expect(JSON.stringify(data)).toBe(snapshot);
    expect(evaluate(data, 500 * DAY)).toEqual(evaluate(JSON.parse(snapshot), 500 * DAY));
  });
  it('reaches zero within 730 days after the last event even from large heights', () => {
    let data = createData(0);
    for (let d = 0; d < 60; d++) data = appendEvent(data, event(d * DAY, 100, 100, 'e' + d));
    expect(evaluate(data, 59 * DAY).height).toBeGreaterThan(1000);
    expect(evaluate(data, 789 * DAY).height).toBe(0);
  });
});

describe('data validation', () => {
  it.each([NaN, Infinity, -1, 0, 1e300])('rejects invalid acceleration %s', acceleration => {
    expect(() => appendEvent(createData(0), event(0, acceleration))).toThrow();
  });
  it.each([NaN, Infinity, -1, 0, 730])('rejects invalid duration %s', duration => {
    expect(() => appendEvent(createData(0), event(0, 0.01, duration))).toThrow();
  });
  it('rejects unknown formats, invalid timestamps and duplicate IDs', () => {
    expect(() => validateData({version: 2, startedAt: 0, events: []})).toThrow();
    expect(() => validateData({version: 1, startedAt: -1, events: []})).toThrow();
    expect(() => appendEvent(createData(10), event(0))).toThrow();
    expect(() => appendEvent(appendEvent(createData(0), event()), event())).toThrow();
  });
});
