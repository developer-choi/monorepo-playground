import {describe, it, expect} from 'vitest';
import {buildUrlWithQuery} from './url';

// npm test src/shared/utils/uri.test.ts
describe('buildUrlWithQuery()', () => {
  describe('undefined', () => {
    it('should not include keys with undefined values in the result', () => {
      expect(buildUrlWithQuery(PATHNAME, {a: undefined})).toBe(PATHNAME);
    });
  });

  describe('skipNullish', () => {
    it('should not include keys with null values in the result by default', () => {
      expect(buildUrlWithQuery(PATHNAME, {a: null})).toBe(PATHNAME);
    });

    it('should include keys with null values in the result when skipNullish: false', () => {
      expect(buildUrlWithQuery(PATHNAME, {a: null}, {skipNullish: false})).toBe('/path?a');
    });
  });

  describe('skipEmptyString', () => {
    it('should not include keys with empty string values in the result by default', () => {
      expect(buildUrlWithQuery(PATHNAME, {a: ''})).toBe(PATHNAME);
    });

    it('should include keys with empty string values in the result when skipEmptyString: false', () => {
      expect(buildUrlWithQuery(PATHNAME, {a: ''}, {skipEmptyString: false})).toBe(`${PATHNAME}?a=`);
    });
  });

  describe('no query', () => {
    it('should return only the pathname without trailing ? when all values are filtered out', () => {
      expect(buildUrlWithQuery(PATHNAME, {a: null, b: undefined, c: ''})).toBe(PATHNAME);
    });
  });
});

const PATHNAME = '/path';
