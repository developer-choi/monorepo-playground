import {api} from '@/shared/api/client';
import {validateApiResponse} from '@/shared/api/parse';
import {
  BoardListApiResponse,
  BoardListFilter,
  BoardDetailSchema,
  BoardRowSchema,
  CreateBoardApiRequest,
  UpdateBoardApiRequest,
  BOARD_TYPES,
  BOARD_CATEGORIES,
} from '@/validation/integration/schema';
import {PaginationParams} from '@/shared/schema/pagination';
import {buildUrlWithQuery} from '@/shared/utils/url';
import {toCamelCaseKeys, toSnakeCaseKeys} from 'es-toolkit';

export async function getBoardListApi(params: Partial<BoardListFilter & PaginationParams>): Promise<BoardListApiResponse> {
  const raw = await api.get(buildUrlWithQuery('api/board', toSnakeCaseKeys(params))).json<ServerBoardListResponse>();
  return {
    ...toCamelCaseKeys(raw),
    list: raw.list.map(row => validateApiResponse(BoardRowSchema, {...toCamelCaseKeys(row), tagList: row.tag_list ?? []})),
  };
}

export async function getBoardApi(id: number) {
  const raw = await api.get(`api/board/${id}`).json<ServerBoardDetail>();
  return validateApiResponse(BoardDetailSchema, {...toCamelCaseKeys(raw), tagList: raw.tag_list ?? []});
}

export async function postBoardApi(body: CreateBoardApiRequest) {
  const raw = await api.post('api/board', {json: toSnakeCaseKeys(body)}).json<ServerBoardDetail>();
  return validateApiResponse(BoardDetailSchema, {...toCamelCaseKeys(raw), tagList: raw.tag_list ?? []});
}

export async function patchBoardApi({id, ...body}: UpdateBoardApiRequest) {
  const raw = await api.patch(`api/board/${id}`, {json: toSnakeCaseKeys(body)}).json<ServerBoardDetail>();
  return validateApiResponse(BoardDetailSchema, {...toCamelCaseKeys(raw), tagList: raw.tag_list ?? []});
}

export function deleteBoardApi(id: number) {
  return api.delete(`api/board/${id}`).json<void>();
}

type BoardType = typeof BOARD_TYPES.values[number];
type BoardCategory = typeof BOARD_CATEGORIES.values[number];

interface ServerBoardDetail {
  id: number;
  post_title: string;
  post_content: string;
  board_type: BoardType;
  category: BoardCategory;
  tag_list: string[] | null;
}

interface ServerBoardRow {
  id: number;
  post_title: string;
  board_type: BoardType;
  category: BoardCategory;
  tag_list: string[] | null;
}

interface ServerBoardListResponse {
  list: ServerBoardRow[];
  pagination_meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
