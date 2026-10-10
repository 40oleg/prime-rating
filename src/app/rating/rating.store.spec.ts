import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RatingStore } from './rating.store';

describe('RatingStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });
  afterEach(() => vi.restoreAllMocks());
  it('persists start time and restores events after reopening', () => {
    const store = TestBed.inject(RatingStore);
    store.add('Проект', 0.01, 7);
    const saved = store.exportJson();
    TestBed.resetTestingModule();
    expect(TestBed.inject(RatingStore).exportJson()).toBe(saved);
    expect(JSON.parse(saved).events[0].name).toBe('Проект');
  });
  it('rejects bad input without changing stored data', () => {
    const store = TestBed.inject(RatingStore),
      before = store.exportJson();
    expect(() => store.add('Событие', -1, 7)).toThrow();
    expect(store.exportJson()).toBe(before);
  });
  it('imports a validated archive and preserves data after invalid import', () => {
    const store = TestBed.inject(RatingStore);
    store.add('Прогулка', 0.005, 3);
    const saved = store.exportJson();
    store.importJson(saved);
    expect(store.exportJson()).toBe(saved);
    expect(() => store.importJson('{broken')).toThrow();
    expect(() => store.importJson('{"version":2}')).toThrow();
    expect(store.exportJson()).toBe(saved);
  });
  it('keeps existing data when storage writes fail', () => {
    const store = TestBed.inject(RatingStore),
      before = store.exportJson();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => store.add('Событие', 0.01, 7)).toThrow();
    expect(store.exportJson()).toBe(before);
  });
  it('does not overwrite a damaged archive and explains the failure', () => {
    localStorage.setItem('prime-rating:v1', '{broken');
    const store = TestBed.inject(RatingStore);
    expect(store.error()).not.toBe('');
    expect(() => store.add('Событие', 0.01, 7)).toThrow();
    expect(localStorage.getItem('prime-rating:v1')).toBe('{broken');
  });
});
