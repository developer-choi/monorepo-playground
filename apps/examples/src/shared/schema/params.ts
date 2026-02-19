import {z} from 'zod';

export const numericIdSchema = z.number().int().positive('유효하지 않은 ID입니다');

export function parseNumericId(value: string): number {
  // TODO zod error 나면 좀 더 구체적인 음 뭐 InvalidPageAccessError 뭐 이러면서 호출부에서는 이 구체적인 에러로 감싸서 뭐 하는걸로 변경예정
  return z
    .string()
    .regex(/^\d+$/, '숫자만 입력해주세요')
    .transform(Number)
    .pipe(numericIdSchema)
    .parse(value);
}

export function parseStringId(value: string): string {
  // TODO zod error 나면 좀 더 구체적인 음 뭐 InvalidPageAccessError 뭐 이러면서 호출부에서는 이 구체적인 에러로 감싸서 뭐 하는걸로 변경예정
  return z
    .string()
    .min(1, '유효하지 않은 ID입니다')
    .parse(value);
}
