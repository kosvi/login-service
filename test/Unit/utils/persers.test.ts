import { parsers } from '../../../src/utils/parsers';

describe('parsers tests', () => {
  it('should parse valid numbers', () => {
    expect(parsers.parseNumber(10)).toBe(10);
    expect(parsers.parseNumber('10')).toBe(10);
    expect(parsers.parseNumber(Number(10))).toBe(10);
    expect(parsers.parseNumber(new Number('10'))).toBe(10);
  });
  it('should return NaN with invalid numbers', () => {
    expect(parsers.parseNumber('10 people')).toBe(Number.NaN);
    expect(parsers.parseNumber('foo')).toBe(Number.NaN);
    expect(parsers.parseNumber(undefined)).toBe(Number.NaN);
  });
});