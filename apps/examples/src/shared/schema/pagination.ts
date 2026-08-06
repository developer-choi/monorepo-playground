import {z} from 'zod';

export const PAGINATION_LIMITS = {
  page: {min: 1},
  limit: {min: 1, max: 200},
  defaultPage: 1,
  defaultLimit: 10,
};

export const paginationParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(PAGINATION_LIMITS.page.min, `페이지 번호는 ${PAGINATION_LIMITS.page.min} 이상이어야 합니다`)
    .default(PAGINATION_LIMITS.defaultPage),
  limit: z.coerce
    .number()
    .int()
    .min(PAGINATION_LIMITS.limit.min, `항목 수는 ${PAGINATION_LIMITS.limit.min} 이상이어야 합니다`)
    // 상한을 넘기면 거부하지 않고 상한까지 깎는다. 거부하면 safeParsePartial이 필드를 통째로
    // 빼서 기본값으로 되돌아가고, 크게 요청할수록 적게 받는 역전이 생긴다.
    .transform((value) => Math.min(PAGINATION_LIMITS.limit.max, value))
    .default(PAGINATION_LIMITS.defaultLimit),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
