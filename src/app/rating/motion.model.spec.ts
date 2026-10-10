import { accelerationForecast, countdown, signed } from './motion.model';
import { appendEvent, createData, DAY, evaluate } from './rating.model';

describe('live motion presentation', () => {
  it('keeps both sides of a brief impulse expiry in the forecast', () => {
    const data = appendEvent(createData(0), {
      id: 'short',
      name: 'Импульс',
      at: 0,
      acceleration: 0.02,
      durationDays: 0.0001,
    });
    const expiry = 0.0001 * DAY;
    const points = accelerationForecast(data, 0);
    const before = points.find((point) => point.at === expiry - 1)!;
    const after = points.find((point) => point.at === expiry)!;
    expect(before.acceleration - after.acceleration).toBeCloseTo(0.02, 10);
    expect(points[0].acceleration).toBe(evaluate(data, 0).acceleration);
    expect(points.at(-1)?.at).toBe(30 * DAY);
  });
  it('locates floor contact between chart samples without extending an old force', () => {
    const data = createData(0);
    const points = accelerationForecast(data, 729 * DAY);
    const firstZero = points.find((point) => point.acceleration === 0)!;
    expect(firstZero.at).toBeLessThanOrEqual(730 * DAY);
    expect(firstZero.at).toBeGreaterThan(730 * DAY - 2);
    expect(
      points.filter((point) => point.at >= firstZero.at).every((point) => point.acceleration === 0),
    ).toBe(true);
  });
  it('shows signed precision without misleading negative zero', () => {
    expect(signed(-1e-12)).toBe('0,000000');
    expect(signed(-0.00003753)).toBe('-0,000038');
    expect(signed(0.01)).toBe('+0,010000');
  });
  it('counts down to the exact end without going negative', () => {
    expect(countdown(DAY + 3661_000)).toBe('1 д · 01:01:01');
    expect(countdown(1)).toBe('00:00:01');
    expect(countdown(-1)).toBe('00:00:00');
  });
});
