import { Component, computed, input } from '@angular/core';
import { DAY, evaluate, PrimeData, RatingState } from '../rating/rating.model';
import { accelerationForecast, countdown, signed } from '../rating/motion.model';

@Component({
  selector: 'app-motion',
  templateUrl: './motion.html',
  styleUrl: './motion.css',
})
export class Motion {
  readonly data = input.required<PrimeData>();
  readonly now = input.required<number>();
  readonly state = input.required<RatingState>();
  readonly signed = signed;
  readonly clock = computed(() =>
    new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(this.now()),
  );
  readonly preciseRating = computed(() =>
    new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 10,
      maximumFractionDigits: 10,
    }).format(this.state().height),
  );
  readonly active = computed(() =>
    this.state().grounded
      ? []
      : this.data().events.filter(
          (event) => event.at <= this.now() && event.at + event.durationDays * DAY > this.now(),
        ),
  );
  readonly thrust = computed(() =>
    this.active().reduce((sum, event) => sum + event.acceleration, 0),
  );
  readonly gravity = computed(() => this.thrust() - this.state().acceleration);
  readonly nextExpiry = computed(() =>
    this.active().length
      ? Math.min(...this.active().map((event) => event.at + event.durationDays * DAY))
      : null,
  );
  readonly remaining = computed(() => {
    const expiry = this.nextExpiry();
    return expiry === null ? '' : countdown(expiry - this.now());
  });
  readonly nextDrop = computed(() =>
    this.active()
      .filter((event) => event.at + event.durationDays * DAY === this.nextExpiry())
      .reduce((sum, event) => sum + event.acceleration, 0),
  );
  readonly speedTrend = computed(() => {
    const acceleration = this.state().acceleration;
    return acceleration > 0
      ? 'Скорость растёт'
      : acceleration < 0
        ? 'Скорость снижается'
        : 'Скорость не меняется';
  });
  readonly accelerationDelta = computed(() => {
    const previous = Math.max(this.data().startedAt, this.now() - 60_000);
    return this.state().acceleration - evaluate(this.data(), previous).acceleration;
  });
  readonly accelerationTrend = computed(() => {
    const delta = this.accelerationDelta();
    return delta > 1e-12
      ? '↑ Ускорение выросло за минуту'
      : delta < -1e-12
        ? '↓ Ускорение упало за минуту'
        : 'Ускорение стабильно';
  });
  // The forecast depends on event data and a minute bucket; live readouts still tick each second.
  private readonly forecastAt = computed(() => {
    let start = Math.max(
      Math.floor(this.now() / 60_000) * 60_000,
      this.data().startedAt,
      this.data().events.at(-1)?.at ?? 0,
    );
    for (const event of this.data().events) {
      const expiry = event.at + event.durationDays * DAY;
      if (expiry <= this.now()) start = Math.max(start, expiry);
    }
    return start;
  });
  readonly chart = computed(() => {
    const start = this.forecastAt();
    const points = accelerationForecast(this.data(), start);
    const high = Math.max(0, ...points.map((point) => point.acceleration));
    const low = Math.min(0, ...points.map((point) => point.acceleration));
    const span = Math.max(high - low, 1e-8);
    const y = (value: number) => 18 + ((high - value) / span) * 100;
    return {
      path: points
        .map((point) => `${12 + ((point.at - start) / (30 * DAY)) * 576},${y(point.acceleration)}`)
        .join(' '),
      zeroY: y(0),
      nowY: y(points[0].acceleration),
      high,
      low,
    };
  });
  readonly gauge = computed(() => {
    const total = this.thrust() + this.gravity();
    return total > 0 ? Math.max(0, Math.min(100, (this.thrust() / total) * 100)) : 50;
  });
}
