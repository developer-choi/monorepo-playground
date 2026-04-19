import {describe, it, expect} from 'vitest';
import {isObject, mapObjectLeaves, trimObject, cleanObject} from './object';

const MAGIC_NUMBER = 123;

describe('isObject()', () => {
  describe('General cases', () => {
    it('일반 객체, 배열, Date 등 object 타입이면 true를 반환한다', () => {
      expect(isObject({key: 1})).toBe(true);
      expect(isObject([1, 2])).toBe(true);
      expect(isObject(new Date())).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('null은 false를 반환한다', () => {
      expect(isObject(null)).toBe(false);
    });

    it('primitive 값은 false를 반환한다', () => {
      expect(isObject(undefined)).toBe(false);
      expect(isObject(0)).toBe(false);
      expect(isObject('')).toBe(false);
      expect(isObject(false)).toBe(false);
    });

    it('함수는 false를 반환한다', () => {
      expect(isObject(() => {})).toBe(false);
    });
  });
});

describe('mapObjectLeaves()', () => {
  describe('General cases', () => {
    it('같은 타입으로 변환하면 변환된 값이 반영된다', () => {
      const result = mapObjectLeaves(
        {first: '  hello  ', nested: {inner: '  world  '}},
        {
          callback: ({value}) => {
            if (typeof value === 'string') {
              return value.trim();
            }
            return value;
          },
        },
      );
      expect(result).toEqual({first: 'hello', nested: {inner: 'world'}});
    });
  });

  describe('Error cases', () => {
    it('다른 타입으로 변환하면 에러를 던진다', () => {
      expect(() => {
        mapObjectLeaves({first: 'hello'}, {callback: () => MAGIC_NUMBER});
      }).toThrow('The converted value types is different than before.');
    });

    it('null을 객체로 변환하면 에러를 던진다', () => {
      expect(() => {
        mapObjectLeaves({first: null}, {callback: () => ({})});
      }).toThrow('The converted value types is different than before.');
    });
  });
});

describe('trimObject()', () => {
  describe('General cases', () => {
    it('중첩 객체와 배열 내부의 문자열을 모두 trim한다', () => {
      expect(trimObject({key1: ' 1 ', key2: [' 2 '], key3: {subKey: ' 3 '}})).toEqual({
        key1: '1',
        key2: ['2'],
        key3: {subKey: '3'},
      });
    });

    it('문자열이 아닌 값은 그대로 유지한다', () => {
      expect(trimObject({num: 1, nil: null, und: undefined, bool: true})).toEqual({
        num: 1,
        nil: null,
        und: undefined,
        bool: true,
      });
    });
  });

  describe('General cases — ignoreKeyList', () => {
    it('ignoreKeyList에 포함된 키는 trim하지 않는다', () => {
      expect(trimObject({keep: ' keep ', trim: ' trim '}, {ignoreKeyList: ['keep']})).toEqual({
        keep: ' keep ',
        trim: 'trim',
      });
    });

    it('중첩 키 경로로도 제외할 수 있다', () => {
      expect(trimObject({outer: {inner: ' keep '}, plain: ' trim '}, {ignoreKeyList: ['outer.inner']})).toEqual({
        outer: {inner: ' keep '},
        plain: 'trim',
      });
    });
  });
});

describe('cleanObject()', () => {
  describe('General cases', () => {
    it('문자열을 trim하고, null과 빈 문자열을 undefined로 변환한다', () => {
      expect(cleanObject({name: '  홍길동  ', address: null, memo: '', blank: '   '})).toEqual({
        name: '홍길동',
        address: undefined,
        memo: undefined,
        blank: undefined,
      });
    });

    it('중첩 객체와 배열에도 동일하게 적용된다', () => {
      expect(cleanObject({detail: {phone: '  010  ', memo: ''}, tags: [' a ', null]})).toEqual({
        detail: {phone: '010', memo: undefined},
        tags: ['a', undefined],
      });
    });

    it('배열 안에 객체가 있어도 재귀적으로 적용된다', () => {
      expect(cleanObject({addresses: [{city: '  Seoul  ', zip: null}]})).toEqual({
        addresses: [{city: 'Seoul', zip: undefined}],
      });
    });

    it('숫자, boolean 등은 그대로 유지한다', () => {
      expect(cleanObject({num: 0, bool: false, big: MAGIC_NUMBER})).toEqual({
        num: 0,
        bool: false,
        big: MAGIC_NUMBER,
      });
    });
  });

  describe('General cases — ignoreKeyList', () => {
    it('ignoreKeyList에 포함된 키는 변환하지 않는다', () => {
      expect(cleanObject({password: '  secret  ', name: '  홍길동  '}, {ignoreKeyList: ['password']})).toEqual({
        password: '  secret  ',
        name: '홍길동',
      });
    });
  });
});
