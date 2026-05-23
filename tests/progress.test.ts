import { describe, it, expect } from 'vitest';
import { progressPercent } from '../lib/utils';

describe('Progress calculations', () => {
  it('0/100 -> 0%', () => {
    expect(progressPercent(0, 100)).toBe(0);
  });

  it('50/200 -> 25%', () => {
    expect(progressPercent(50, 200)).toBe(25);
  });

  it('Handles negative target gracefully', () => {
    expect(progressPercent(50, 0)).toBe(100);
  });
});
