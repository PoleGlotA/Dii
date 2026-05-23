import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('Classname merge', () => {
  it('Merges multiple class inputs into a string', () => {
    const out = cn('a', { b: true }, ['c']);
    expect(typeof out).toBe('string');
    expect(out.includes('a')).toBe(true);
  });
});
