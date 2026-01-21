/**
 * Example test file
 */

import { generateId } from '@shared/lib/id';
import { formatCurrency, capitalize } from '@shared/lib/format';

describe('ID Generation', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it('should generate UUID format', () => {
    const id = generateId();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(id).toMatch(uuidRegex);
  });
});

describe('Format utilities', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(100)).toContain('100');
    expect(formatCurrency(1234.56)).toContain('1.234');
  });

  it('should capitalize text', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
    expect(capitalize('')).toBe('');
  });
});
