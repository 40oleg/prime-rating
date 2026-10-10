import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingStore } from './rating/rating.store';
import { appendEvent, DAY, evaluate } from './rating/rating.model';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly store = inject(RatingStore);
  readonly now = signal(Date.now());
  readonly state = computed(() => evaluate(this.store.data(), this.now()));
  readonly formatted = computed(() =>
    new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
      this.state().height,
    ),
  );
  readonly mode = signal<'event' | 'history' | 'about'>('event');
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  readonly installPrompt = signal<InstallPrompt | null>(null);
  readonly standalone = signal(window.matchMedia?.('(display-mode: standalone)')?.matches ?? false);
  name = '';
  strength = 0.01;
  duration = 7;
  submitted = false;
  message = '';
  importText = '';
  importName = '';
  readonly reversedEvents = computed(() => [...this.store.data().events].reverse());
  get fieldErrors() {
    return {
      name: !this.name.trim() || this.name.length > 120,
      strength: !Number.isFinite(this.strength) || this.strength <= 0 || this.strength > 1e6,
      duration: !Number.isFinite(this.duration) || this.duration <= 0 || this.duration >= 730,
    };
  }
  get forecast(): { week: string; month: string } | null {
    if (this.fieldErrors.strength || this.fieldErrors.duration) return null;
    try {
      const now = this.now();
      const data = appendEvent(this.store.data(), {
        id: 'preview',
        name: this.name.trim() || 'Прогноз',
        at: now,
        acceleration: this.strength,
        durationDays: this.duration,
      });
      const fmt = (days: number) =>
        new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(
          evaluate(data, now + days * DAY).height,
        );
      return { week: fmt(7), month: fmt(30) };
    } catch {
      return null;
    }
  }
  constructor() {
    const destroy = inject(DestroyRef);
    const tick = () => this.now.set(Date.now());
    const interval = window.setInterval(tick, 1000);
    const install = (e: Event) => {
      e.preventDefault();
      this.installPrompt.set(e as InstallPrompt);
    };
    const installed = () => {
      this.installPrompt.set(null);
      this.standalone.set(true);
    };
    window.addEventListener('beforeinstallprompt', install);
    window.addEventListener('appinstalled', installed);
    document.addEventListener('visibilitychange', tick);
    destroy.onDestroy(() => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', install);
      window.removeEventListener('appinstalled', installed);
      document.removeEventListener('visibilitychange', tick);
    });
  }
  open(mode: 'event' | 'history' | 'about') {
    this.mode.set(mode);
    this.message = '';
    this.submitted = false;
    this.importText = '';
    this.importName = '';
    this.dialog().nativeElement.showModal();
  }
  close() {
    this.dialog().nativeElement.close();
  }
  save() {
    this.submitted = true;
    this.message = '';
    if (Object.values(this.fieldErrors).some(Boolean)) return;
    try {
      this.store.add(this.name, this.strength, this.duration);
      this.now.set(Date.now());
      this.name = '';
      this.close();
    } catch (e) {
      this.message = e instanceof Error ? e.message : 'Не удалось сохранить событие.';
    }
  }
  date(at: number) {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(at);
  }
  async install() {
    const prompt = this.installPrompt();
    if (!prompt) {
      this.open('about');
      return;
    }
    await prompt.prompt();
    await prompt.userChoice;
    this.installPrompt.set(null);
  }
  export() {
    const url = URL.createObjectURL(
      new Blob([this.store.exportJson()], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prime-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async selectImport(event: Event) {
    this.message = '';
    this.importText = '';
    this.importName = '';
    const input = event.target as HTMLInputElement,
      file = input.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      this.message = 'Файл слишком большой: максимум 5 МБ.';
      input.value = '';
      return;
    }
    try {
      this.importText = await file.text();
      this.importName = file.name;
    } catch {
      this.message = 'Не удалось прочитать файл.';
    }
    input.value = '';
  }
  confirmImport() {
    try {
      this.store.importJson(this.importText);
      this.now.set(Date.now());
      this.importText = '';
      this.message = 'История восстановлена.';
    } catch (e) {
      this.message = e instanceof Error ? e.message : 'Не удалось импортировать файл.';
    }
  }
}
