import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { appendEvent, createData, PrimeData, validateData } from './rating.model';
@Injectable({ providedIn: 'root' })
export class RatingStore {
  private readonly state = signal(createData(Date.now()));
  readonly data = this.state.asReadonly();
  readonly error = signal('');
  private blocked = false;
  private lastSaved: string | null = null;
  constructor() {
    try {
      const saved = localStorage.getItem('prime-rating:v1');
      this.lastSaved = saved;
      if (saved) this.state.set(this.check(JSON.parse(saved)));
      else {
        this.lastSaved = this.exportJson();
        localStorage.setItem('prime-rating:v1', this.lastSaved);
      }
    } catch {
      this.blocked = true;
      this.error.set(
        'Не удалось прочитать или сохранить данные. Существующая история не изменена. Можно восстановить её из файла.',
      );
    }
    const sync = (event: StorageEvent) => {
      if (event.key !== 'prime-rating:v1' && event.key !== null) return;
      try {
        this.refresh();
      } catch {
        this.blocked = true;
        this.error.set(
          'Данные изменены в другом окне и не могут быть прочитаны. Текущая история не перезаписана.',
        );
      }
    };
    window.addEventListener('storage', sync);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', sync));
  }
  private refresh(): boolean {
    const current = localStorage.getItem('prime-rating:v1');
    if (current === this.lastSaved) return false;
    if (!current) throw new Error('Данные удалены в другом окне. Перезагрузите приложение.');
    this.state.set(this.check(JSON.parse(current)));
    this.lastSaved = current;
    this.blocked = false;
    this.error.set('');
    return true;
  }
  private check(value: unknown): PrimeData {
    const data = validateData(value);
    if (data.startedAt > Date.now() || data.events.some((e) => e.at > Date.now())) {
      throw new Error('Дата в файле находится в будущем. Проверьте часы устройства.');
    }
    return data;
  }
  private save(next: PrimeData): void {
    if (this.refresh()) {
      throw new Error('История обновилась в другом окне. Проверьте её и повторите сохранение.');
    }
    const serialized = JSON.stringify(next);
    try {
      localStorage.setItem('prime-rating:v1', serialized);
    } catch {
      throw new Error(
        'Не удалось сохранить. Освободите место или разрешите хранение данных в браузере.',
      );
    }
    this.lastSaved = serialized;
    this.state.set(next);
    this.blocked = false;
    this.error.set('');
  }
  add(name: string, acceleration: number, durationDays: number): void {
    if (this.blocked) throw new Error(this.error());
    this.save(
      appendEvent(this.data(), {
        id: crypto.randomUUID(),
        name,
        acceleration,
        durationDays,
        at: Date.now(),
      }),
    );
  }
  exportJson(): string {
    return JSON.stringify(this.data(), null, 2);
  }
  importJson(text: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Не удалось прочитать JSON-файл.');
    }
    this.save(this.check(parsed));
  }
}
