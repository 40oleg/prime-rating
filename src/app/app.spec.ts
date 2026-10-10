import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { vi } from 'vitest';
import { DAY } from './rating/rating.model';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the rating and the event action', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="rating"]')?.textContent).toContain('10');
    expect(compiled.textContent).toContain('Добавить событие');
  });
  it('submits a valid event through the actual form', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;
    for (const [id, value] of [
      ['event-name', 'Новый проект'],
      ['strength', '0.02'],
      ['duration', '12'],
    ]) {
      const input = fixture.nativeElement.querySelector('#' + id) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('[data-testid=save-event]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(app.store.data().events).toHaveLength(1);
  });
  it('updates live speed and precise rating on the one-second clock', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    try {
      const now = Date.now();
      fixture.componentInstance.store.importJson(
        JSON.stringify({
          version: 1,
          startedAt: now - DAY,
          events: [
            { id: 'live', name: 'Тест', at: now - 1000, acceleration: 0.02, durationDays: 7 },
          ],
        }),
      );
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const speed = root.querySelector('[data-testid="velocity"]')!.textContent;
      const height = root.querySelector('[data-testid="precise-rating"]')!.textContent;
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(root.querySelector('[data-testid="velocity"]')!.textContent).not.toBe(speed);
      expect(root.querySelector('[data-testid="precise-rating"]')!.textContent).not.toBe(height);
    } finally {
      fixture.destroy();
      vi.useRealTimers();
    }
  });
  it('shows an acceleration drop when an impulse expires without jumping speed', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const now = Date.now();
    app.store.importJson(
      JSON.stringify({
        version: 1,
        startedAt: now - DAY,
        events: [
          {
            id: 'expiry',
            name: 'Короткий импульс',
            at: now - 1000,
            acceleration: 0.02,
            durationDays: 2000 / DAY,
          },
        ],
      }),
    );
    app.now.set(now);
    fixture.detectChanges();
    const before = app.state();
    expect(fixture.nativeElement.querySelector('[data-testid="countdown"]')).toBeTruthy();
    app.now.set(now + 1000);
    fixture.detectChanges();
    expect(before.acceleration - app.state().acceleration).toBeCloseTo(0.02, 10);
    expect(app.state().velocity).toBeCloseTo(before.velocity, 6);
    expect(
      fixture.nativeElement.querySelector('[data-testid="acceleration-trend"]').textContent,
    ).toContain('упало');
    expect(fixture.nativeElement.querySelector('[data-testid="countdown"]')).toBeNull();
    fixture.destroy();
  });
  it('restores a saved design and offers all fifteen options', () => {
    localStorage.setItem('prime-design:v1', 'studio');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.getAttribute('data-design')).toBe('studio');
    expect(root.querySelectorAll('#design-choice option')).toHaveLength(15);
    fixture.destroy();
  });
  it('switches all designs through the selector without modifying saved rating history', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const history = app.store.exportJson();
    const select = root.querySelector('#design-choice') as HTMLSelectElement;
    expect(root.getAttribute('data-design')).toBe('console');
    for (const design of app.designs) {
      select.value = design.id;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await fixture.whenStable();
      expect(root.getAttribute('data-design')).toBe(design.id);
      expect(root.getAttribute('data-layout')).toBe(design.layout);
      expect(localStorage.getItem('prime-design:v1')).toBe(design.id);
      expect(new URLSearchParams(window.location.search).get('design')).toBe(design.id);
      expect(app.store.exportJson()).toBe(history);
      expect(root.querySelector('[data-testid="acceleration"]')).toBeTruthy();
    }
    app.stepDesign(1);
    fixture.detectChanges();
    expect(app.design().id).toBe(app.designs[0].id);
    app.stepDesign(-1);
    fixture.detectChanges();
    expect(app.design().id).toBe(app.designs.at(-1)?.id);
    fixture.destroy();
  });
});
