import {describe, it, expect} from 'vitest';
import {buildUrlWithQuery} from './url';

// npm test src/shared/utils/uri.test.ts
describe('buildUrlWithQuery()', () => {
  describe('undefined', () => {
    it('should not include keys with undefined values in the result', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: undefined}})).toBe(PATHNAME);
    });
  });

  describe('skipNullish', () => {
    it('should not include keys with null values in the result by default', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: null}})).toBe(PATHNAME);
    });

    it('should include keys with null values in the result when skipNullish: false', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: null}, skipNullish: false})).toBe('/path?key');
    });
  });

  describe('skipEmptyString', () => {
    it('should not include keys with empty string values in the result by default', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: ''}})).toBe(PATHNAME);
    });

    it('should include keys with empty string values in the result when skipEmptyString: false', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: ''}, skipEmptyString: false})).toBe(
        `${PATHNAME}?key=`,
      );
    });
  });

  describe('no query', () => {
    it('should return only the pathname without trailing ? when all values are filtered out', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: null, other: undefined, extra: ''}})).toBe(PATHNAME);
    });
  });
});

const PATHNAME = '/path';
