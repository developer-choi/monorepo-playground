import {describe, it, expect} from 'vitest';
import {joinUrl} from './url.js';

const PREFIX_URL = 'https://api.example.com';
const JOINED_URL = `${PREFIX_URL}/api/board`;

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
