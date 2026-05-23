import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from '../lib/utils';

describe('Форматування дат і валют', () => {
  it('formatDate повертає відформатований рядок для дати', () => {
    const out = formatDate('2020-01-15T00:00:00Z');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });

  it('formatDate повертає вхідний рядок для некоректної дати', () => {
    const s = 'not-a-date';
    expect(formatDate(s)).toBe(s);
  });

  it('formatCurrency додає валютний знак', () => {
    const cur = formatCurrency(0);
    expect(cur.endsWith(' грн')).toBe(true);
  });
});
