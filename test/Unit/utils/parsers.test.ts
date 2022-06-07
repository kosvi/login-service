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
  it('should parse valid objects correctly', () => {
    const str = '{"foo": "bar"}';
    const expectedResult = { foo: 'bar' };
    expect(str).not.toEqual(expectedResult);
    const result = parsers.parseStringToJson(str);
    expect(result).toEqual(expectedResult);
  });
  it('should return empty object for invalid json-strings', () => {
    const result1 = parsers.parseStringToJson('{"foo", bar}');
    expect(result1).toEqual({});
    const result2 = parsers.parseStringToJson(100);
    expect(result2).toEqual({});
    const result3 = parsers.parseStringToJson('{"foo": "bar"');
    expect(result3).toEqual({});
  });
});