import { describe, it, expect } from 'vitest';
import { initials } from '../lib/utils';

describe('Initials helper', () => {
  it('Returns two letters for two-word names', () => {
    expect(initials('Іван Петренко')).toBe('ІП');
  });

  it('Returns single letter for single-word name', () => {
    expect(initials('Cher')).toBe('C');
  });

  it('Returns ? for empty input', () => {
    expect(initials('')).toBe('?');
  });
});
