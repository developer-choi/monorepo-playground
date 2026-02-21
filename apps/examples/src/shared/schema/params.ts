import {z} from 'zod';
import InvalidAccessError from '@/shared/error/class/InvalidAccessError';

export const numericIdSchema = z.number().int().positive('유효하지 않은 ID입니다');

/**
 * @throws {InvalidAccessError}
 */
export function parseNumericId(value: string): number {
  try {
    return z
      .string()
      .regex(/^\d+$/, '페이지 주소에 포함된 ID가 숫자 형식이 아닙니다')
      .transform(Number)
      .pipe(numericIdSchema)
      .parse(value);
  } catch (error) {
    throw new InvalidAccessError({
      redirect: {type: 'NOT_FOUND'},
      meta: error,
    });
  }
}

/**
 * @throws {InvalidAccessError}
 */
export function parseStringId(value: string): string {
  try {
    return z
      .string()
      .min(1, '유효하지 않은 ID입니다')
      .parse(value);
  } catch (error) {
    throw new InvalidAccessError({
      redirect: {type: 'NOT_FOUND'},
      meta: error,
    });
  }
}
