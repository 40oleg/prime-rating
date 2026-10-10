import { Injectable, signal } from '@angular/core';
import { appendEvent, createData, PrimeData, validateData } from './rating.model';
@Injectable({providedIn: 'root'})
export class RatingStore {
  private readonly state = signal(createData(Date.now()));
  readonly data = this.state.asReadonly();
  readonly error = signal('');
  private blocked = false;
  constructor() {
    try {
      const saved = localStorage.getItem('prime-rating:v1');
      if (saved) this.state.set(this.check(JSON.parse(saved)));
      else localStorage.setItem('prime-rating:v1', this.exportJson());
    } catch {
      this.blocked = true;
      this.error.set('Не удалось прочитать или сохранить данные. Существующая история не изменена. Можно восстановить её из файла.');
    }
  }
  private check(value: unknown): PrimeData {
    const data = validateData(value);
    if (data.startedAt > Date.now() || data.events.some(e => e.at > Date.now())) {
      throw new Error('Дата в файле находится в будущем. Проверьте часы устройства.');
    }
    return data;
  }
  private save(next: PrimeData): void {
    try { localStorage.setItem('prime-rating:v1', JSON.stringify(next)); }
    catch { throw new Error('Не удалось сохранить. Освободите место или разрешите хранение данных в браузере.'); }
    this.state.set(next); this.blocked = false; this.error.set('');
  }
  add(name: string, acceleration: number, durationDays: number): void {
    if (this.blocked) throw new Error(this.error());
    this.save(appendEvent(this.data(), {id: crypto.randomUUID(), name, acceleration, durationDays, at: Date.now()}));
  }
  exportJson(): string { return JSON.stringify(this.data(), null, 2); }
  importJson(text: string): void {
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { throw new Error('Не удалось прочитать JSON-файл.'); }
    this.save(this.check(parsed));
  }
}
