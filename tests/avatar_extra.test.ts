import { describe, it, expect } from 'vitest';
import { generateAvatar } from '../lib/utils';

describe('Avatar generation edge cases', () => {
  it('Handles very long names', () => {
    const svg = generateAvatar('A'.repeat(500));
    expect(svg.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('Encodes special characters', () => {
    const svg = generateAvatar('<script>alert(1)</script>');
    expect(svg.includes('%3C')).toBe(true);
  });
});
