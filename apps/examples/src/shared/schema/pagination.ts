import {z} from 'zod';

export const PAGINATION_LIMITS = {
  page: {min: 1},
  limit: {min: 1, max: 200},
  defaultPage: 1,
  defaultLimit: 10,
};

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().min(PAGINATION_LIMITS.page.min, `페이지 번호는 ${PAGINATION_LIMITS.page.min} 이상이어야 합니다`).default(PAGINATION_LIMITS.defaultPage),
  limit: z.coerce.number().int().min(PAGINATION_LIMITS.limit.min, `항목 수는 ${PAGINATION_LIMITS.limit.min} 이상이어야 합니다`).max(PAGINATION_LIMITS.limit.max, `항목 수는 최대 ${PAGINATION_LIMITS.limit.max}개입니다`).default(PAGINATION_LIMITS.defaultLimit),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
