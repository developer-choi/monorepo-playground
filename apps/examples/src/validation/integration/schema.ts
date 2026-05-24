import {z} from 'zod';
import {PaginationMeta} from '@/shared/schema/pagination';
import {numericIdSchema} from '@/shared/schema/params';
import {createLabelMap} from '@/shared/utils/object';

/*************************************************************************************************************
 * Constraints
 *************************************************************************************************************/
export const BOARD_LIMITS = {
  postTitle: {min: 1, max: 100},
  postContent: {min: 1, max: 5000},
  tagList: {maxCount: 10, maxLength: 20},
};

/*************************************************************************************************************
 * Enum Constants
 *************************************************************************************************************/
export const BOARD_TYPES = createLabelMap([
  {value: 'gallery', label: '갤러리'},
  {value: 'normal', label: '일반'},
]);

export const BOARD_CATEGORIES = createLabelMap([
  {value: 'notice', label: '공지'},
  {value: 'free', label: '자유'},
  {value: 'question', label: '질문'},
  {value: 'info', label: '정보공유'},
]);

/*************************************************************************************************************
 * Original schema
 *************************************************************************************************************/
const boardTypeEnum = z.enum(BOARD_TYPES.values, {
  error: '게시판 유형을 선택해주세요',
});
const boardCategoryEnum = z.enum(BOARD_CATEGORIES.values, {
  error: '카테고리를 선택해주세요',
});
const tagSchema = z
  .string()
  .max(BOARD_LIMITS.tagList.maxLength, `태그는 ${BOARD_LIMITS.tagList.maxLength}자 이내로 입력하세요`);

const boardOriginalSchema = z.object({
  id: numericIdSchema,
  postTitle: z
    .string()
    .min(BOARD_LIMITS.postTitle.min, '제목을 입력하세요')
    .max(BOARD_LIMITS.postTitle.max, `제목은 ${BOARD_LIMITS.postTitle.max}자 이내로 입력하세요`),
  postContent: z
    .string()
    .min(BOARD_LIMITS.postContent.min, '내용을 입력하세요')
    .max(BOARD_LIMITS.postContent.max, `내용은 ${BOARD_LIMITS.postContent.max}자 이내로 입력하세요`),
  boardType: boardTypeEnum,
  category: boardCategoryEnum,
  tagList: z
    .array(tagSchema)
    .max(BOARD_LIMITS.tagList.maxCount, `태그는 최대 ${BOARD_LIMITS.tagList.maxCount}개까지 가능합니다`),
});

/*************************************************************************************************************
 * Derived Schemas
 *************************************************************************************************************/
export const boardDetailSchema = boardOriginalSchema;

export const boardRowSchema = boardOriginalSchema.pick({
  id: true,
  postTitle: true,
  boardType: true,
  category: true,
  tagList: true,
});

export const createBoardSchema = boardOriginalSchema.pick({
  postTitle: true,
  postContent: true,
  boardType: true,
  category: true,
  tagList: true,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateBoardSchema = boardOriginalSchema.pick({id: true}).extend({
  ...createBoardSchema.shape,
  boardType: boardTypeEnum.nullable(), // 백엔드에서 의도적으로 빈값이 아닌 null을 보내달라고 요구하는 경우 nullable로 대응
});

const stringOrStringArray = z.union([z.string().transform((val) => [val]), z.array(z.string())]);

export const boardListFilterSchema = boardOriginalSchema.pick({postTitle: true, category: true}).extend({
  boardType: z.union([boardTypeEnum.transform((val) => [val]), z.array(boardTypeEnum)]),
  tagList: stringOrStringArray,
});

/*************************************************************************************************************
 * Types
 *************************************************************************************************************/
export type BoardDetail = z.infer<typeof boardDetailSchema>;
export type BoardRow = z.infer<typeof boardRowSchema>;
export type CreateBoardApiRequest = z.infer<typeof createBoardSchema>;
export type UpdateBoardApiRequest = z.infer<typeof updateBoardSchema>;
export type BoardListFilter = z.infer<typeof boardListFilterSchema>;

export interface BoardListApiResponse {
  list: BoardRow[];
  paginationMeta: PaginationMeta;
}
