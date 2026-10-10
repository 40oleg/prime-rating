import { DAY, evaluate, PrimeData } from './rating.model';

export interface AccelerationPoint {
  at: number;
  acceleration: number;
}

/** Include both sides of every expiry so short impulses remain visible. */
export function accelerationForecast(data: PrimeData, now: number): AccelerationPoint[] {
  const end = now + 30 * DAY;
  const times = new Set<number>([now, end]);
  for (let i = 1; i < 60; i++) times.add(now + (i * DAY) / 2);
  for (const event of data.events) {
    const expiry = event.at + event.durationDays * DAY;
    if (expiry > now && expiry <= end) {
      times.add(Math.max(now, expiry - 1));
      times.add(expiry);
    }
  }
  const points = [...times].sort((a, b) => a - b).map((at) => ({ at, ...evaluate(data, at) }));
  // Locate floor contact precisely, rather than rounding it to the chart's sampling grid.
  const contact = points.findIndex(
    (point, i) => i > 0 && point.grounded && !points[i - 1].grounded,
  );
  if (contact > 0) {
    let left = points[contact - 1].at;
    let right = points[contact].at;
    while (right - left > 1) {
      const middle = Math.floor((left + right) / 2);
      if (evaluate(data, middle).grounded) right = middle;
      else left = middle;
    }
    points.splice(
      contact,
      0,
      { at: left, ...evaluate(data, left) },
      { at: right, ...evaluate(data, right) },
    );
  }
  return points.map(({ at, acceleration }) => ({ at, acceleration }));
}

export function signed(value: number, digits = 6): string {
  // Avoid a negative-zero readout while retaining small but meaningful acceleration.
  const rounded = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: 'exceptZero',
  }).format(rounded);
}

export function countdown(milliseconds: number): string {
  let seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  return `${days ? days + ' д · ' : ''}${String(hours).padStart(2, '0')}:${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
