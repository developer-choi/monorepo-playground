import {describe, it, expect} from 'vitest';
import {z} from 'zod';
import {safeParsePartial} from './zod';

const TestSchema = z.object({
  name: z.string(),
  type: z.enum(['online', 'offline']),
  count: z.number(),
});

// npm test src/shared/utils/zod.test.ts
describe('safeParsePartial()', () => {
  describe('valid fields', () => {
    it('should return all fields when all values are valid', () => {
      const result = safeParsePartial(TestSchema, {name: 'foo', type: 'online', count: 1});
      expect(result).toEqual({name: 'foo', type: 'online', count: 1});
    });

    it('should return only the valid fields when some values are invalid', () => {
      const result = safeParsePartial(TestSchema, {name: 'foo', type: 'invalid-enum'});
      expect(result).toEqual({name: 'foo'});
    });
  });

  describe('unknown fields', () => {
    it('should exclude keys that are not in the schema', () => {
      const result = safeParsePartial(TestSchema, {name: 'foo', unknown: 'bar'});
      expect(result).toEqual({name: 'foo'});
    });
  });

  describe('undefined fields', () => {
    it('should exclude keys with undefined values', () => {
      const result = safeParsePartial(TestSchema, {name: 'foo', type: undefined});
      expect(result).toEqual({name: 'foo'});
    });
  });

  describe('empty result', () => {
    it('should return an empty object when no values are valid', () => {
      const result = safeParsePartial(TestSchema, {type: 'invalid-enum', count: 'not-a-number'});
      expect(result).toEqual({});
    });
  });
});
