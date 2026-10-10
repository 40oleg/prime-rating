export const DAY = 86_400_000;
export interface PrimeEvent { id: string; name: string; at: number; acceleration: number; durationDays: number }
export interface PrimeData { version: 1; startedAt: number; events: PrimeEvent[] }
export interface RatingState { height: number; velocity: number; acceleration: number; grounded: boolean }
const HORIZON = 730;
const ZERO: RatingState = {height: 0, velocity: 0, acceleration: 0, grounded: true};
interface Force { acceleration: number; end: number }
interface Flight { height: number; velocity: number; gravity: number; at: number; forces: Force[]; grounded: boolean }

function timestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 8.64e15 - HORIZON * DAY;
}
export function createData(now: number): PrimeData {
  if (!timestamp(now)) throw new Error('Некорректная дата начала.');
  return {version: 1, startedAt: now, events: []};
}
export function validateData(value: unknown): PrimeData {
  if (!value || typeof value !== 'object') throw new Error('Это не файл Prime.');
  const data = value as PrimeData;
  if (data.version !== 1 || !timestamp(data.startedAt) || !Array.isArray(data.events) || data.events.length > 10000) {
    throw new Error('Неподдерживаемый или повреждённый файл Prime.');
  }
  let previous = data.startedAt;
  const ids = new Set<string>();
  const events = data.events.map(e => {
    if (!e || typeof e.id !== 'string' || !e.id || e.id.length > 100 || ids.has(e.id) ||
        typeof e.name !== 'string' || !e.name.trim() || e.name.length > 120 ||
        !timestamp(e.at) || e.at < previous ||
        !Number.isFinite(e.acceleration) || e.acceleration <= 0 || e.acceleration > 1e6 ||
        !Number.isFinite(e.durationDays) || e.durationDays <= 0 || e.durationDays >= HORIZON) {
      throw new Error('Некорректное событие: проверьте название, дату, ускорение и длительность.');
    }
    previous = e.at; ids.add(e.id);
    return {id: e.id, name: e.name.trim(), at: e.at, acceleration: e.acceleration, durationDays: e.durationDays};
  });
  return {version: 1, startedAt: data.startedAt, events};
}
export function appendEvent(data: PrimeData, event: PrimeEvent): PrimeData {
  return validateData({...data, events: [...data.events, event]});
}

/** First non-negative floor contact on a constant-acceleration segment. */
function contact(h: number, v: number, a: number): number {
  if (h === 0 && (v < 0 || (v === 0 && a <= 0))) return 0;
  if (a === 0) return v < 0 ? -h / v : Infinity;
  const discriminant = v * v - 2 * a * h;
  if (discriminant < 0) return Infinity;
  // Stable quadratic roots avoid cancellation when height is small.
  const q = -0.5 * (v + (v >= 0 ? 1 : -1) * Math.sqrt(discriminant));
  const roots = q === 0 ? [] : [2 * q / a, h / q];
  return Math.min(...roots.filter(r => r > 0));
}
function advance(flight: Flight, to: number): void {
  if (flight.grounded) { flight.at = to; return; }
  while (flight.at < to) {
    flight.forces = flight.forces.filter(f => f.end > flight.at);
    const end = Math.min(to, ...flight.forces.map(f => f.end));
    const dt = (end - flight.at) / DAY;
    const acceleration = flight.forces.reduce((sum, f) => sum + f.acceleration, 0) - flight.gravity;
    if (contact(flight.height, flight.velocity, acceleration) <= dt + 1e-9) {
      flight.height = 0; flight.velocity = 0; flight.forces = [];
      flight.grounded = true; flight.at = to; return;
    }
    flight.height = Math.max(0, flight.height + flight.velocity * dt + acceleration * dt * dt / 2);
    flight.velocity += acceleration * dt;
    flight.at = end;
  }
  flight.forces = flight.forces.filter(f => f.end > to);
}
export function evaluate(data: PrimeData, now: number): RatingState {
  const flight: Flight = {height: 10, velocity: 0, gravity: 20 / HORIZON ** 2, at: data.startedAt, forces: [], grounded: false};
  for (const e of data.events) {
    if (e.at > now) break;
    advance(flight, e.at);
    flight.forces.push({acceleration: e.acceleration, end: e.at + e.durationDays * DAY});
    flight.grounded = false;
    const forceHeight = flight.forces.reduce((sum, f) => {
      const d = (f.end - e.at) / DAY;
      return sum + f.acceleration * (d * HORIZON - d * d / 2);
    }, 0);
    flight.gravity = 2 * (flight.height + Math.max(0, flight.velocity) * HORIZON + forceHeight) / HORIZON ** 2;
  }
  advance(flight, Math.max(now, data.startedAt));
  if (flight.grounded) return {...ZERO};
  return {height: flight.height, velocity: flight.velocity,
    acceleration: flight.forces.reduce((sum, f) => sum + f.acceleration, 0) - flight.gravity, grounded: false};
}
