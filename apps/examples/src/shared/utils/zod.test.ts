import {describe, it, expect} from 'vitest';
import {z} from 'zod';
import {safeParsePartial} from './zod';

const testSchema = z.object({
  name: z.string(),
  type: z.enum(['online', 'offline']),
  count: z.number(),
});

describe('safeParsePartial()', () => {
  describe('General cases', () => {
    it('모든 값이 유효하면 전부 담아 반환한다', () => {
      const result = safeParsePartial(testSchema, {name: 'foo', type: 'online', count: 1});

      expect(result).toEqual({name: 'foo', type: 'online', count: 1});
    });

    it('앞선 필드가 유효하지 않아도 뒤따르는 유효한 값은 담는다', () => {
      const result = safeParsePartial(testSchema, {type: 'invalid-enum', count: 1});

      expect(result).toEqual({count: 1});
    });

    it('스키마가 값을 변환하면 변환된 값을 담는다', () => {
      const coercingSchema = z.object({count: z.coerce.number()});

      const result = safeParsePartial(coercingSchema, {count: '3'});

      expect(result).toEqual({count: 3});
    });
  });

  describe('Edge cases', () => {
    it('스키마에 없는 키는 담지 않는다', () => {
      const result = safeParsePartial(testSchema, {name: 'foo', unknown: 'bar'});

      expect(result).toEqual({name: 'foo'});
    });

    it('값이 undefined인 키는 담지 않는다', () => {
      const result = safeParsePartial(testSchema, {name: 'foo', type: undefined});

      expect(result).toEqual({name: 'foo'});
    });

    it('유효한 값이 하나도 없으면 빈 객체를 반환한다', () => {
      const result = safeParsePartial(testSchema, {type: 'invalid-enum', count: 'not-a-number'});

      expect(result).toEqual({});
    });
  });
});
