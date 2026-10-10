import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
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
});
