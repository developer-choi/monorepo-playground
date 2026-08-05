import {describe, it, expect} from 'vitest';
import {buildUrlWithQuery, joinUrl} from './url';

const PATHNAME = '/path';
const PREFIX_URL = 'https://api.example.com';
const JOINED_URL = `${PREFIX_URL}/api/board`;

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

describe('joinUrl()', () => {
  describe('General cases', () => {
    it.for([
      {prefixUrl: PREFIX_URL, label: 'prefixUrl 끝에 슬래시가 없을 때'},
      {prefixUrl: `${PREFIX_URL}/`, label: 'prefixUrl 끝에 슬래시가 있을 때'},
      {prefixUrl: `${PREFIX_URL}//`, label: 'prefixUrl 끝에 슬래시가 여러 개일 때'},
    ])('$label 슬래시 하나로 이어 붙인다', ({prefixUrl}) => {
      expect(joinUrl(prefixUrl, 'api/board')).toBe(JOINED_URL);
    });

    it('프로토콜의 두 슬래시는 건드리지 않는다', () => {
      expect(joinUrl(`${PREFIX_URL}/`, 'users/1')).toBe(`${PREFIX_URL}/users/1`);
    });
  });

  describe('Edge cases', () => {
    it('prefixUrl이 비어있으면 경로를 그대로 돌려준다', () => {
      expect(joinUrl('', 'api/board')).toBe('api/board');
    });

    it.for([
      {path: '/api/board', label: '하나'},
      {path: '//api/board', label: '여러 개'},
    ])('경로의 앞 슬래시가 $label여도 슬래시 하나로 이어 붙인다', ({path}) => {
      expect(joinUrl(PREFIX_URL, path)).toBe(JOINED_URL);
    });
  });
});
