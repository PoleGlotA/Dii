import { describe, it, expect } from 'vitest';
import { formatCurrency, progressPercent } from '../lib/utils';

describe('Функціональні тести', () => {
  it('formatCurrency правильно форматирує суму', () => {
    expect(formatCurrency(1500)).toBe('1 500 грн');
  });

  it('progressPercent не перевищує 100%', () => {
    expect(progressPercent(120, 100)).toBe(100);
  });
});
