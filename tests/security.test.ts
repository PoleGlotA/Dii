import { describe, it, expect } from 'vitest';
import { generateAvatar } from '../lib/utils';

describe('Тестування безпеки', () => {
  it('generateAvatar не містить тега <script>', () => {
    const svg = generateAvatar("Іван Петренко");
    expect(svg.includes('<script')).toBe(false);
  });

  it('generateAvatar повертає data URI', () => {
    const svg = generateAvatar('User');
    expect(svg.startsWith('data:image/svg+xml')).toBe(true);
  });
});
