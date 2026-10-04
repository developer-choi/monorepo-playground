import {describe, it, expect} from 'vitest';
import {buildUrlWithQuery} from './url';

const PATHNAME = '/path';

describe('buildUrlWithQuery()', () => {
  describe('General cases', () => {
    it('값이 있는 파라미터는 쿼리로 붙인다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: 'value'}})).toBe(`${PATHNAME}?key=value`);
    });

    it('값이 undefined인 파라미터는 빼고 만든다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: undefined}})).toBe(PATHNAME);
    });

    it('값이 null인 파라미터는 빼고 만든다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: null}})).toBe(PATHNAME);
    });

    it('값이 빈 문자열인 파라미터는 빼고 만든다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: ''}})).toBe(PATHNAME);
    });

    it('배열 값은 같은 키를 반복해 붙인다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: ['a', 'b']}})).toBe(`${PATHNAME}?key=a&key=b`);
    });
  });

  describe('Edge cases', () => {
    it('skipNull을 끄면 값이 null이어도 남긴다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: null}, skipNull: false})).toBe(`${PATHNAME}?key`);
    });

    it('skipEmptyString을 끄면 값이 빈 문자열이어도 남긴다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: ''}, skipEmptyString: false})).toBe(
        `${PATHNAME}?key=`,
      );
    });

    it('skipNull을 꺼도 값이 undefined면 남지 않는다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: undefined}, skipNull: false})).toBe(PATHNAME);
    });

    it('pathname에 이미 쿼리가 있으면 뒤에 이어 붙인다', () => {
      expect(buildUrlWithQuery({pathname: `${PATHNAME}?tab=all`, params: {page: 2}})).toBe(
        `${PATHNAME}?page=2&tab=all`,
      );
    });

    it('모든 파라미터가 걸러지면 물음표 없이 경로만 반환한다', () => {
      expect(buildUrlWithQuery({pathname: PATHNAME, params: {key: null, other: undefined, extra: ''}})).toBe(PATHNAME);
    });
  });
});
